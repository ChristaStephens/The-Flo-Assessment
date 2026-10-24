import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  db,
  tymfloClients,
  tymfloMagicLinks,
  tymfloSessions,
  type TymfloClient,
} from "@workspace/db";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "tymflo_session";

type MagicLinkPayload = {
  clientId: string;
  email: string;
  expiresAt: number;
  tokenId: string;
};

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be configured before client authentication can run.");
  }
  return secret;
}

function encode(payload: MagicLinkPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", sessionSecret()).update(encodedPayload).digest("base64url");
}

function constantTimeMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function parseMagicLink(token: string): MagicLinkPayload | null {
  const [encodedPayload, signature, ...extra] = token.split(".");
  if (!encodedPayload || !signature || extra.length > 0 || !constantTimeMatch(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<MagicLinkPayload>;
    if (
      typeof payload.clientId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.tokenId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }
    return payload as MagicLinkPayload;
  } catch {
    return null;
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createMagicLink(client: TymfloClient): Promise<string> {
  const tokenId = randomUUID();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);
  const email = normalizeEmail(client.email);

  await db.insert(tymfloMagicLinks).values({
    id: tokenId,
    clientId: client.id,
    email,
    expiresAt,
  });

  const payload: MagicLinkPayload = {
    clientId: client.id,
    email,
    expiresAt: expiresAt.getTime(),
    tokenId,
  };
  return `${encode(payload)}.${sign(encode(payload))}`;
}

export async function consumeMagicLink(token: string): Promise<{ client: TymfloClient; sessionId: string } | null> {
  const payload = parseMagicLink(token);
  if (!payload) return null;

  const now = new Date();
  return db.transaction(async (tx) => {
    const [link] = await tx
      .update(tymfloMagicLinks)
      .set({ usedAt: now })
      .where(
        and(
          eq(tymfloMagicLinks.id, payload.tokenId),
          eq(tymfloMagicLinks.clientId, payload.clientId),
          eq(tymfloMagicLinks.email, normalizeEmail(payload.email)),
          isNull(tymfloMagicLinks.usedAt),
          gt(tymfloMagicLinks.expiresAt, now),
        ),
      )
      .returning();

    if (!link) return null;

    const [client] = await tx
      .select()
      .from(tymfloClients)
      .where(eq(tymfloClients.id, payload.clientId));
    if (!client || normalizeEmail(client.email) !== normalizeEmail(payload.email)) {
      return null;
    }

    const sessionId = randomUUID();
    await tx.insert(tymfloSessions).values({
      id: sessionId,
      clientId: client.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return { client, sessionId };
  });
}

export function setClientSession(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions());
}

export function clearClientSession(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: undefined });
}

export async function requireClientSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (typeof sessionId !== "string" || !sessionId) {
    res.status(401).json({ error: "Sign in is required to access this workspace." });
    return;
  }

  const now = new Date();
  const [session] = await db
    .select()
    .from(tymfloSessions)
    .where(and(eq(tymfloSessions.id, sessionId), gt(tymfloSessions.expiresAt, now)));
  if (!session) {
    clearClientSession(res);
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
    return;
  }

  const [client] = await db
    .select()
    .from(tymfloClients)
    .where(eq(tymfloClients.id, session.clientId));
  if (!client) {
    clearClientSession(res);
    res.status(401).json({ error: "Your session is no longer valid. Please sign in again." });
    return;
  }

  res.locals.client = client;
  next();
}

export function getAuthenticatedClient(res: Response): TymfloClient {
  return res.locals.client as TymfloClient;
}

export async function deleteClientSession(req: Request, res: Response): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (typeof sessionId === "string" && sessionId) {
    await db.delete(tymfloSessions).where(eq(tymfloSessions.id, sessionId));
  }
  clearClientSession(res);
}