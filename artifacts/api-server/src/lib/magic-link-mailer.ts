import { logger } from "./logger";

type MagicLinkEmail = {
  to: string;
  link: string;
};

type MagicLinkDelivery = {
  developmentLink?: string;
};

const fromAddress = process.env.RESEND_FROM_EMAIL;

function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function sendMagicLinkEmail({ to, link }: MagicLinkEmail): Promise<MagicLinkDelivery> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (isDevelopment()) {
      logger.info({ recipient: to }, "Magic link prepared for local development");
      return { developmentLink: link };
    }
    throw new Error("Magic link email delivery requires RESEND_API_KEY and RESEND_FROM_EMAIL in production.");
  }

  if (!fromAddress) {
    throw new Error("RESEND_FROM_EMAIL must be configured when RESEND_API_KEY is set.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject: "Your secure TymFlo sign-in link",
      html: `<p>Use this secure link to sign in to your TymFlo workspace. It expires in 15 minutes.</p><p><a href="${link}">Open your TymFlo workspace</a></p><p>If you did not request this link, you can safely ignore this email.</p>`,
      text: `Use this secure link to sign in to your TymFlo workspace. It expires in 15 minutes: ${link}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    logger.error({ status: response.status, detail }, "Magic link email delivery failed");
    throw new Error("Unable to send the sign-in email.");
  }

  return {};
}