import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const tymfloClients = pgTable("tymflo_clients", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull().unique(),
  dubsadoPortalUrl: text("dubsado_portal_url").notNull(),
});

export const tymfloMagicLinks = pgTable("tymflo_magic_links", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tymfloSessions = pgTable("tymflo_sessions", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tymfloUsage = pgTable("tymflo_usage", {
  clientId: text("client_id").primaryKey(),
  used: integer("used").notNull().default(0),
  limit: integer("limit").notNull().default(10),
});

export const tymfloProjects = pgTable("tymflo_projects", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  name: text("name").notNull(),
  service: text("service").notNull(),
  status: text("status").notNull(),
  nextMilestone: text("next_milestone").notNull(),
  dueDate: text("due_date"),
});

export const tymfloConversations = pgTable("tymflo_conversations", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("active"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tymfloMessages = pgTable("tymflo_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tymfloMessageAttachments = pgTable("tymflo_message_attachments", {
  id: text("id").primaryKey(),
  uploadId: text("upload_id"),
  messageId: text("message_id").notNull(),
  conversationId: text("conversation_id").notNull(),
  clientId: text("client_id").notNull(),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tymfloAttachmentUploads = pgTable("tymflo_attachment_uploads", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tymfloRequests = pgTable("tymflo_requests", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull(),
  functions: text("functions").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  deadline: text("deadline"),
});

export const tymfloFlowScoreSubmissions = pgTable("tymflo_flow_score_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessName: text("business_name"),
  industry: text("industry"),
  answers: jsonb("answers").$type<number[]>().notNull(),
  score: integer("score").notNull(),
  opportunity: text("opportunity").notNull(),
  acceptedTerms: boolean("accepted_terms").notNull(),
  acceptedPrivacy: boolean("accepted_privacy").notNull(),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  giveawayOptIn: boolean("giveaway_opt_in").notNull().default(false),
  consentVersion: text("consent_version").notNull().default("2026-09-21"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTymfloClientSchema = createInsertSchema(tymfloClients);
export const insertTymfloMagicLinkSchema = createInsertSchema(tymfloMagicLinks);
export const insertTymfloSessionSchema = createInsertSchema(tymfloSessions);
export const insertTymfloUsageSchema = createInsertSchema(tymfloUsage);
export const insertTymfloProjectSchema = createInsertSchema(tymfloProjects);
export const insertTymfloConversationSchema = createInsertSchema(tymfloConversations);
export const insertTymfloMessageSchema = createInsertSchema(tymfloMessages);
export const insertTymfloMessageAttachmentSchema = createInsertSchema(tymfloMessageAttachments);
export const insertTymfloAttachmentUploadSchema = createInsertSchema(tymfloAttachmentUploads);
export const insertTymfloRequestSchema = createInsertSchema(tymfloRequests);
export const insertTymfloFlowScoreSubmissionSchema = createInsertSchema(tymfloFlowScoreSubmissions);

export type TymfloClient = typeof tymfloClients.$inferSelect;
export type TymfloMagicLink = typeof tymfloMagicLinks.$inferSelect;
export type TymfloSession = typeof tymfloSessions.$inferSelect;
export type TymfloProject = typeof tymfloProjects.$inferSelect;
export type TymfloConversation = typeof tymfloConversations.$inferSelect;
export type TymfloMessage = typeof tymfloMessages.$inferSelect;
export type TymfloMessageAttachment = typeof tymfloMessageAttachments.$inferSelect;
export type TymfloAttachmentUpload = typeof tymfloAttachmentUploads.$inferSelect;
export type TymfloRequest = typeof tymfloRequests.$inferSelect;
export type TymfloUsage = typeof tymfloUsage.$inferSelect;
export type TymfloFlowScoreSubmission = typeof tymfloFlowScoreSubmissions.$inferSelect;

export const requestFunctionSchema = z.enum([
  "Social Media",
  "Email Marketing",
  "Web",
  "Design",
  "Project Management",
  "Client Success",
]);