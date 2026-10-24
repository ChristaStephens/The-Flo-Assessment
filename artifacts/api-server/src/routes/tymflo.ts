import express, { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
  db,
  tymfloClients,
  tymfloConversations,
  tymfloAttachmentUploads,
  tymfloMessageAttachments,
  tymfloMessages,
  tymfloProjects,
  tymfloRequests,
  tymfloUsage,
} from "@workspace/db";
import {
  CreateConversationBody,
  CreateClientRequestBody,
  CreateClientRequestResponse,
  GetPortalResponse,
  ListConversationsResponse,
  ListClientRequestsResponse,
  SendConversationMessageBody,
  SendConversationMessageParams,
  SendConversationMessageResponse,
  RequestAttachmentUploadBody,
  RequestAttachmentUploadResponse,
  ConfirmClientRequestParams,
  ConfirmClientRequestResponse,
  GetAdminOverviewResponse,
} from "@workspace/api-zod";
import { and, asc, desc, eq, gte, inArray, isNull, lt, or, sql } from "drizzle-orm";
import {
  consumeMagicLink,
  createMagicLink,
  deleteClientSession,
  getAuthenticatedClient,
  requireClientSession,
  setClientSession,
} from "../lib/client-auth";
import { sendMagicLinkEmail } from "../lib/magic-link-mailer";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const demoClientId = "client-sleep-by-shanique";
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_MONTHLY_ATTACHMENTS = 20;
const UPLOAD_EXPIRY_MS = 15 * 60 * 1000;
const objectStorageService = new ObjectStorageService();
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function isAllowedAttachmentType(contentType: string): boolean {
  return ALLOWED_ATTACHMENT_TYPES.has(contentType.toLowerCase());
}

async function expireExpiredUploads(): Promise<void> {
  const now = new Date();
  const expired = await db.select().from(tymfloAttachmentUploads).where(
    and(
      inArray(tymfloAttachmentUploads.status, ["pending", "uploaded"]),
      lt(tymfloAttachmentUploads.expiresAt, now),
    ),
  );
  await Promise.all(expired.map(async (upload) => {
    await objectStorageService.deleteObjectEntity(upload.objectPath);
  }));
  if (expired.length > 0) {
    await db.update(tymfloAttachmentUploads)
      .set({ status: "expired" })
      .where(inArray(tymfloAttachmentUploads.id, expired.map((upload) => upload.id)));
  }
}

function safeDownloadFilename(name: string): string {
  return name.replace(/[\r\n"]/g, "_");
}

const uploadCleanupTimer = setInterval(() => {
  void expireExpiredUploads().catch((error) => {
    console.error("Failed to remove expired attachment uploads", error);
  });
}, UPLOAD_EXPIRY_MS);
uploadCleanupTimer.unref();

function attachmentUrl(attachmentId: string): string {
  return `/api/portal/attachments/${attachmentId}/file`;
}

async function seedDemo() {
  await db.insert(tymfloClients).values({
    id: demoClientId,
    firstName: "Shanique",
    name: "Shanique Williams",
    businessName: "Sleep by Shanique",
    email: "shanique@example.com",
    dubsadoPortalUrl: "https://hello.dubsado.com/user/login",
  }).onConflictDoNothing();

  await db.insert(tymfloUsage).values({
    clientId: demoClientId,
    used: 3,
    limit: 10,
  }).onConflictDoNothing();

  await db.insert(tymfloProjects).values([
    {
      id: "project-sleep-social",
      clientId: demoClientId,
      name: "September Content Calendar",
      service: "Social Media",
      status: "In progress",
      nextMilestone: "Review scheduled posts",
      dueDate: "2026-09-10",
    },
    {
      id: "project-sleep-email",
      clientId: demoClientId,
      name: "Newsletter Refresh",
      service: "Email Marketing",
      status: "Awaiting client",
      nextMilestone: "Confirm publication date",
      dueDate: "2026-09-20",
    },
  ]).onConflictDoNothing();
}

function portalShape(client: typeof tymfloClients.$inferSelect, usage: typeof tymfloUsage.$inferSelect, projects: (typeof tymfloProjects.$inferSelect)[]) {
  return GetPortalResponse.parse({
    client: {
      id: client.id,
      firstName: client.firstName,
      name: client.name,
      businessName: client.businessName,
      email: client.email,
    },
    usage: {
      used: usage.used,
      limit: usage.limit,
      unit: "assistant messages",
      resetLabel: "Resets October 1",
    },
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      service: project.service,
      status: project.status,
      nextMilestone: project.nextMilestone,
      dueDate: project.dueDate,
    })),
    links: {
      dubsado: client.dubsadoPortalUrl,
      supportEmail: "hello@tymflo.com",
      supportPhone: "(555) 014-2026",
    },
    safetyNotice: "Please do not submit passwords, payment information, patient information, or other sensitive personal data.",
  });
}

function appOrigin(): string {
  const configuredOrigin = process.env.PUBLIC_APP_URL?.trim();
  const replitDomain = process.env.REPLIT_DOMAINS?.split(",").map((domain) => domain.trim()).find(Boolean)
    ?? process.env.REPLIT_DEV_DOMAIN?.trim();
  const origin = configuredOrigin || (replitDomain ? `https://${replitDomain}` : "");
  if (!origin) {
    throw new Error("PUBLIC_APP_URL must be configured before magic links can be sent.");
  }
  return new URL(origin).origin;
}

router.post("/auth/magic-link", async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }

    await seedDemo();
    const [client] = await db.select().from(tymfloClients).where(eq(tymfloClients.email, email));
    if (!client) {
      res.status(202).json({ message: "If that email is invited to TymFlo, a secure sign-in link is on its way." });
      return;
    }

    const token = await createMagicLink(client);
    const link = `${appOrigin()}/api/auth/verify?token=${encodeURIComponent(token)}`;
    const delivery = await sendMagicLinkEmail({ to: client.email, link });
    res.status(202).json({
      message: "If that email is invited to TymFlo, a secure sign-in link is on its way.",
      developmentLink: delivery.developmentLink,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/auth/verify", async (req, res, next) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const authentication = await consumeMagicLink(token);
    const signInUrl = `${appOrigin()}/signin`;
    if (!authentication) {
      res.redirect(303, `${signInUrl}?error=invalid-link`);
      return;
    }

    // The database session is intentionally opaque to the browser.
    // Store the session ID created during token consumption, not the signed link.
    setClientSession(res, authentication.sessionId);
    res.redirect(303, `${appOrigin()}/`);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/sign-out", async (req, res, next) => {
  try {
    await deleteClientSession(req, res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.use("/portal", requireClientSession);

router.get("/portal", async (_req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const [usage] = await db.select().from(tymfloUsage).where(eq(tymfloUsage.clientId, client.id));
    const projects = await db.select().from(tymfloProjects).where(eq(tymfloProjects.clientId, client.id)).orderBy(asc(tymfloProjects.name));
    res.json(portalShape(client, usage, projects));
  } catch (error) {
    return next(error);
  }
});

router.get("/portal/conversations", async (_req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const rows = await db.select().from(tymfloConversations)
      .where(eq(tymfloConversations.clientId, client.id))
      .orderBy(desc(tymfloConversations.updatedAt));
    const data = await Promise.all(rows.map(async (conversation) => {
      const messages = await db.select().from(tymfloMessages)
        .where(eq(tymfloMessages.conversationId, conversation.id))
        .orderBy(asc(tymfloMessages.createdAt));
      const messagesWithAttachments = await Promise.all(messages.map(async (message) => {
        const attachments = await db.select().from(tymfloMessageAttachments)
          .where(eq(tymfloMessageAttachments.messageId, message.id))
          .orderBy(asc(tymfloMessageAttachments.createdAt));
        return {
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          attachments: attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.fileName,
            size: attachment.size,
            contentType: attachment.contentType,
            url: attachmentUrl(attachment.id),
          })),
        };
      }));
      return {
        id: conversation.id,
        title: conversation.title,
        status: conversation.status,
        updatedAt: conversation.updatedAt.toISOString(),
        messages: messagesWithAttachments,
      };
    }));
    res.json(ListConversationsResponse.parse(data));
  } catch (error) {
    return next(error);
  }
});

router.post("/portal/conversations", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const input = CreateConversationBody.parse(req.body);
    const id = `conversation-${randomUUID()}`;
    const [conversation] = await db.insert(tymfloConversations).values({
      id,
      clientId: client.id,
      title: input.title,
    }).returning();
    res.status(201).json({
      id: conversation.id,
      title: conversation.title,
      status: conversation.status,
      updatedAt: conversation.updatedAt.toISOString(),
      messages: [],
    });
  } catch (error) {
    next(error);
  }
});

router.post("/portal/attachments/request-url", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const parsed = RequestAttachmentUploadBody.safeParse(req.body);
    if (!parsed.success) {
      const isOversize = parsed.error.issues.some(
        (issue) => issue.path[0] === "size" && issue.code === "too_big",
      );
      res.status(isOversize ? 413 : 400).json({
        error: isOversize ? "Files must be 10 MB or smaller." : "Attachment details are invalid.",
      });
      return;
    }
    const input = parsed.data;
    if (input.size > MAX_ATTACHMENT_BYTES) {
      res.status(413).json({ error: "Files must be 10 MB or smaller." });
      return;
    }
    if (!isAllowedAttachmentType(input.contentType)) {
      res.status(415).json({ error: "This file type is not supported." });
      return;
    }

    await expireExpiredUploads();
    const upload = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${client.id}))`);
      const [legacyAttachments] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(tymfloMessageAttachments)
        .where(
          and(
            eq(tymfloMessageAttachments.clientId, client.id),
            gte(tymfloMessageAttachments.createdAt, startOfCurrentMonth()),
            isNull(tymfloMessageAttachments.uploadId),
          ),
        );
      const [reserved] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(tymfloAttachmentUploads)
        .where(
          and(
            eq(tymfloAttachmentUploads.clientId, client.id),
            gte(tymfloAttachmentUploads.createdAt, startOfCurrentMonth()),
            or(
              eq(tymfloAttachmentUploads.status, "attached"),
              and(
                inArray(tymfloAttachmentUploads.status, ["pending", "uploaded"]),
                gte(tymfloAttachmentUploads.expiresAt, new Date()),
              ),
            ),
          ),
        );
      if ((legacyAttachments?.count ?? 0) + (reserved?.count ?? 0) >= MAX_MONTHLY_ATTACHMENTS) {
        return null;
      }

      const id = `upload-${randomUUID()}`;
      const row = {
        id,
        clientId: client.id,
        objectPath: objectStorageService.getObjectEntityUploadPath(),
        fileName: input.name,
        contentType: input.contentType,
        size: input.size,
        expiresAt: new Date(Date.now() + UPLOAD_EXPIRY_MS),
      };
      await tx.insert(tymfloAttachmentUploads).values(row);
      return row;
    });
    if (!upload) {
      res.status(429).json({ error: "Monthly attachment limit reached. Please contact the TymFlo team." });
      return;
    }

    res.json(RequestAttachmentUploadResponse.parse({
      uploadURL: `/api/portal/attachments/${upload.id}/upload`,
      uploadId: upload.id,
      name: input.name,
      size: input.size,
      contentType: input.contentType,
    }));
  } catch (error) {
    next(error);
  }
});

router.put(
  "/portal/attachments/:uploadId/upload",
  express.raw({ type: () => true, limit: MAX_ATTACHMENT_BYTES }),
  async (req, res, next) => {
    try {
      const client = getAuthenticatedClient(res);
      const [upload] = await db.select().from(tymfloAttachmentUploads).where(
        and(
          eq(tymfloAttachmentUploads.id, req.params.uploadId),
          eq(tymfloAttachmentUploads.clientId, client.id),
        ),
      );
      if (!upload || upload.status !== "pending" || upload.expiresAt < new Date()) {
        res.status(404).json({ error: "Upload link has expired." });
        return;
      }
      if (
        !Buffer.isBuffer(req.body) ||
        req.body.byteLength !== upload.size ||
        req.body.byteLength > MAX_ATTACHMENT_BYTES ||
        req.get("content-type")?.split(";", 1)[0].toLowerCase() !== upload.contentType
      ) {
        res.status(400).json({ error: "Uploaded file does not match its reservation." });
        return;
      }

      await objectStorageService.uploadObjectEntity(
        upload.objectPath,
        req.body,
        upload.contentType,
      );
      await db.update(tymfloAttachmentUploads)
        .set({ status: "uploaded" })
        .where(eq(tymfloAttachmentUploads.id, upload.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

router.get("/portal/attachments/:attachmentId/file", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const [attachment] = await db.select().from(tymfloMessageAttachments).where(
      and(
        eq(tymfloMessageAttachments.id, req.params.attachmentId),
        eq(tymfloMessageAttachments.clientId, client.id),
      ),
    );
    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(attachment.objectPath);
    const response = await objectStorageService.downloadObject(objectFile);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.setHeader("Content-Disposition", `attachment; filename="${safeDownloadFilename(attachment.fileName)}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }
    next(error);
  }
});

router.post("/portal/conversations/:conversationId/messages", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const { conversationId } = SendConversationMessageParams.parse(req.params);
    const parsedMessage = SendConversationMessageBody.safeParse(req.body);
    if (!parsedMessage.success) {
      const isOversize = parsedMessage.error.issues.some(
        (issue) => issue.path.includes("size") && issue.code === "too_big",
      );
      res.status(isOversize ? 413 : 400).json({
        error: isOversize ? "Files must be 10 MB or smaller." : "Message details are invalid.",
      });
      return;
    }
    const { content, attachments = [] } = parsedMessage.data;
    const [conversation] = await db
      .select()
      .from(tymfloConversations)
      .where(and(eq(tymfloConversations.id, conversationId), eq(tymfloConversations.clientId, client.id)));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const [usage] = await db.select().from(tymfloUsage).where(eq(tymfloUsage.clientId, client.id));
    if (usage.used >= usage.limit) {
      return res.status(429).json({ error: "Monthly assistant limit reached. Please contact the TymFlo team." });
    }

    if (new Set(attachments.map((attachment) => attachment.uploadId)).size !== attachments.length) {
      res.status(400).json({ error: "Each attachment can only be added once." });
      return;
    }
    if (attachments.some((attachment) => attachment.size > MAX_ATTACHMENT_BYTES)) {
      res.status(413).json({ error: "Files must be 10 MB or smaller." });
      return;
    }
    const uploads = await Promise.all(attachments.map(async (attachment) => {
      const [upload] = await db.select().from(tymfloAttachmentUploads).where(
        and(
          eq(tymfloAttachmentUploads.id, attachment.uploadId),
          eq(tymfloAttachmentUploads.clientId, client.id),
        ),
      );
      return { attachment, upload };
    }));
    for (const { attachment, upload } of uploads) {
      if (
        !upload ||
        upload.status !== "uploaded" ||
        upload.expiresAt < new Date() ||
        upload.fileName !== attachment.name ||
        upload.size !== attachment.size ||
        upload.contentType !== attachment.contentType
      ) {
        res.status(400).json({ error: "One or more attachments are no longer available." });
        return;
      }
      const objectFile = await objectStorageService.getObjectEntityFile(upload.objectPath);
      const [metadata] = await objectFile.getMetadata();
      if (Number(metadata.size) !== attachment.size || metadata.contentType !== attachment.contentType) {
        res.status(400).json({ error: "Attachment metadata does not match the uploaded file." });
        return;
      }
    }

    const messageId = `message-${randomUUID()}`;
    await db.insert(tymfloMessages).values({
      id: messageId,
      conversationId,
      role: "client",
      content,
    });
    const attachmentRows = uploads.map(({ attachment, upload }) => ({
        id: `attachment-${randomUUID()}`,
        uploadId: upload!.id,
        messageId,
        conversationId,
        clientId: client.id,
        objectPath: upload!.objectPath,
        fileName: attachment.name,
        contentType: attachment.contentType,
        size: attachment.size,
      }));
    if (attachmentRows.length > 0) {
      await db.insert(tymfloMessageAttachments).values(attachmentRows);
      await db.update(tymfloAttachmentUploads)
        .set({ status: "attached" })
        .where(inArray(tymfloAttachmentUploads.id, uploads.map(({ upload }) => upload!.id)));
    }

    const asksForLink = /new registration link|registration link|link/i.test(content) && !/https?:\/\/|www\./i.test(content);
    const assistantMessage = asksForLink
      ? "I can help with that. What is the new registration link you’d like us to use?"
      : "Thanks — I have the update. I’ll organize the details into a brief for the TymFlo team. Before I send it, I’ll show you exactly what I understood.";

    await db.insert(tymfloMessages).values({
      id: `message-${randomUUID()}`,
      conversationId,
      role: "assistant",
      content: assistantMessage,
    });
    await db.update(tymfloUsage).set({ used: sql`${tymfloUsage.used} + 1` }).where(eq(tymfloUsage.clientId, client.id));
    const [updatedUsage] = await db.select().from(tymfloUsage).where(eq(tymfloUsage.clientId, client.id));

    const response = SendConversationMessageResponse.parse({
      message: assistantMessage,
      clientMessage: {
        id: messageId,
        role: "client",
        content,
        createdAt: new Date().toISOString(),
        attachments: attachmentRows.map((attachment) => ({
          id: attachment.id,
          name: attachment.fileName,
          size: attachment.size,
          contentType: attachment.contentType,
          url: attachmentUrl(attachment.id),
        })),
      },
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        unit: "assistant messages",
        resetLabel: "Resets October 1",
      },
      requestDraft: {
        title: "Workshop promotion update",
        summary: content,
        status: asksForLink ? "Needs one detail" : "Ready for confirmation",
        functions: ["Social Media", "Email Marketing"],
      },
    });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

router.get("/portal/requests", async (_req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const rows = await db.select().from(tymfloRequests).where(eq(tymfloRequests.clientId, client.id)).orderBy(desc(tymfloRequests.submittedAt));
    res.json(ListClientRequestsResponse.parse(rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      status: row.status,
      functions: row.functions.split(","),
      submittedAt: row.submittedAt.toISOString(),
      deadline: row.deadline,
    }))));
  } catch (error) {
    return next(error);
  }
});

router.post("/portal/requests", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const input = CreateClientRequestBody.parse(req.body);
    const [row] = await db.insert(tymfloRequests).values({
      id: `request-${randomUUID()}`,
      clientId: client.id,
      title: input.title,
      summary: input.summary,
      status: "Awaiting approval",
      functions: input.functions.join(","),
      deadline: input.deadline ?? null,
    }).returning();
    return res.status(201).json(CreateClientRequestResponse.parse({
      id: row.id,
      title: row.title,
      summary: row.summary,
      status: row.status,
      functions: row.functions.split(","),
      submittedAt: row.submittedAt.toISOString(),
      deadline: row.deadline,
    }));
  } catch (error) {
    return next(error);
  }
});

router.post("/portal/requests/:requestId/confirm", async (req, res, next) => {
  try {
    const client = getAuthenticatedClient(res);
    const { requestId } = ConfirmClientRequestParams.parse(req.params);
    const [row] = await db.update(tymfloRequests)
      .set({ status: "Ready for team" })
      .where(and(eq(tymfloRequests.id, requestId), eq(tymfloRequests.clientId, client.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Request not found" });
    return res.json(ConfirmClientRequestResponse.parse({
      id: row.id,
      title: row.title,
      summary: row.summary,
      status: row.status,
      functions: row.functions.split(","),
      submittedAt: row.submittedAt.toISOString(),
      deadline: row.deadline,
    }));
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/overview", async (_req, res, next) => {
  try {
    const rows = await db.select().from(tymfloRequests).orderBy(desc(tymfloRequests.submittedAt));
    const data = {
      counts: {
        needsClarification: rows.filter((row) => row.status === "Needs clarification").length,
        ready: rows.filter((row) => row.status === "Ready for team").length,
        approvals: rows.filter((row) => row.status === "Awaiting approval").length,
        completed: rows.filter((row) => row.status === "Completed").length,
      },
      requests: rows.map((row) => ({
        id: row.id,
        clientName: "Sleep by Shanique",
        title: row.title,
        summary: row.summary,
        status: row.status,
        priority: "Normal",
        function: row.functions.split(",")[0] ?? "Client Success",
        updatedAt: row.submittedAt.toISOString(),
      })),
      activity: [
        { id: "activity-1", text: "Dubsado portal connected for Sleep by Shanique", time: "Today, 9:42 AM", tone: "green" },
        { id: "activity-2", text: "Workshop request is waiting for a registration link", time: "Yesterday, 3:18 PM", tone: "amber" },
      ],
    };
    res.json(GetAdminOverviewResponse.parse(data));
  } catch (error) {
    next(error);
  }
});

export default router;