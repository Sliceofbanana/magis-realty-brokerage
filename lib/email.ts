import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared sandbox domain — works with zero setup, but only proves
// delivery works, doesn't build sender reputation. Swap for a verified
// custom domain (RESEND_FROM_EMAIL) before this matters for real inboxes.
const FROM = process.env.RESEND_FROM_EMAIL || "Magis Realty & Brokerage <onboarding@resend.dev>";

export type SendEmailResult = { error?: string };

/**
 * Fire-and-check email send. Fails open (logs + returns no error) when
 * RESEND_API_KEY isn't configured — email is a hardening/UX layer here
 * (verification, resets, alerts), not something that should crash a
 * fresh clone with no credentials yet.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured — skipping "${subject}" to ${to}`);
    return {};
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("[email] send failed:", error);
    return { error: error.message };
  }
  return {};
}

/**
 * Shared branded wrapper — restrained navy/gold layout matching the rest of
 * the site, not a generic multi-color template. `bodyHtml` is the inner
 * content only (already-safe HTML, callers interpolate their own strings).
 */
function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#0f172a;padding:28px 32px;">
                <span style="color:#eab308;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Magis Realty &amp; Brokerage</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#0f172a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:11px;">
                  Magis Realty &amp; Brokerage &middot; Room 610, Northwoods Place, H. Abellana St., Canduman, Mandaue City, 6014 Cebu
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;border-radius:6px;">${label}</a>`;
}

export function verifyEmailTemplate(name: string, link: string): string {
  return emailShell(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Confirm your email</h1>
    <p style="margin:0;">Hi ${name},</p>
    <p>Thanks for requesting agent portal access. Please confirm this is your email address to continue — an administrator will still need to approve your account afterward.</p>
    ${button(link, "Verify Email Address")}
    <p style="margin-top:24px;color:#6b7280;font-size:12px;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function passwordResetTemplate(name: string, link: string): string {
  return emailShell(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h1>
    <p style="margin:0;">Hi ${name},</p>
    <p>We received a request to reset the password on your Magis Realty account. Click below to choose a new one.</p>
    ${button(link, "Reset Password")}
    <p style="margin-top:24px;color:#6b7280;font-size:12px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not change.</p>
  `);
}

export function loginAlertTemplate(name: string, when: string, ip: string): string {
  return emailShell(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New sign-in to your account</h1>
    <p style="margin:0;">Hi ${name},</p>
    <p>Your Magis Realty portal account was just signed into.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;width:100%;font-size:13px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;text-align:right;color:#0f172a;">${when}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">IP Address</td><td style="padding:6px 0;text-align:right;color:#0f172a;">${ip}</td></tr>
    </table>
    <p style="margin-top:20px;color:#6b7280;font-size:12px;">Wasn't you? Reset your password immediately and contact an administrator.</p>
  `);
}
