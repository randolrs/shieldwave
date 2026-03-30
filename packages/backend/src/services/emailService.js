import { Resend } from 'resend';
import { config } from '../config/env.js';

const resend = new Resend(config.resend.apiKey);

const FROM = config.resend.fromEmail;

// ─── Shared template utilities ──────────────────────────────────────

function layout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ShieldWave</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0d1424;padding:24px 32px;">
              <span style="font-size:22px;font-weight:700;color:#c8ee44;letter-spacing:-0.5px;">ShieldWave</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                ShieldWave &mdash; Simple insurance for exterior cleaning businesses.<br />
                Questions? Reply to this email or reach us at support@shieldwave.com.
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

function ctaButton(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#c8ee44;border-radius:6px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#0d1424;text-decoration:none;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Email senders ──────────────────────────────────────────────────

/**
 * Sends the Certificate of Insurance delivery email.
 *
 * @param {string} to - Recipient email address
 * @param {string} businessName - Name of the insured business
 * @param {string} coiUrl - URL to download the COI PDF
 */
export async function sendCOIEmail(to, businessName, coiUrl) {
  const subject = `Your Certificate of Insurance is ready — ${businessName}`;

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">Your COI is ready</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      Great news! Your Certificate of Insurance for <strong>${businessName}</strong> has been issued and is ready for download.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      You can share this document directly with clients, property managers, or anyone who requires proof of insurance.
    </p>
    ${ctaButton(coiUrl, 'Download Your COI')}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
      This link will remain active for the duration of your policy. If you need a certificate with a specific additional insured or certificate holder, you can generate one from your ShieldWave dashboard at any time.
    </p>
  `);

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send COI email: ${error.message}`);
  }

  return data;
}

/**
 * Sends notification when a quote requires manual review.
 *
 * @param {string} to - Recipient email address
 * @param {string} businessName - Name of the business
 */
export async function sendManualReviewNotification(to, businessName) {
  const subject = `We're finding the best coverage for ${businessName}`;

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">We're on it</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      Thanks for submitting your information for <strong>${businessName}</strong>. Based on your business profile, we're working with our carrier partners to find you the best available coverage.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      A ShieldWave specialist is reviewing your application and will reach out within <strong>24&ndash;48 hours</strong> with tailored options.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      What to expect:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
      <li>Personalized quote options from top-rated carriers</li>
      <li>Coverage recommendations based on your services</li>
      <li>A dedicated point of contact for any questions</li>
    </ul>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
      No action is needed from you right now. We'll email you as soon as your quotes are ready.
    </p>
  `);

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send manual review email: ${error.message}`);
  }

  return data;
}

/**
 * Sends a policy renewal reminder email.
 *
 * @param {string} to - Recipient email address
 * @param {string} businessName - Name of the business
 * @param {string} expiryDate - Human-readable expiry date (e.g. "March 15, 2026")
 * @param {number} daysUntil - Number of days until expiry
 */
export async function sendRenewalReminder(to, businessName, expiryDate, daysUntil) {
  const urgency = daysUntil <= 7 ? 'Urgent: ' : '';
  const subject = `${urgency}Your policy expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'} — ${businessName}`;

  const urgencyBanner = daysUntil <= 7
    ? `<div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">
          Your coverage expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. Renew now to avoid a lapse in coverage.
        </p>
      </div>`
    : '';

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">Time to renew your policy</h1>
    ${urgencyBanner}
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      Your insurance policy for <strong>${businessName}</strong> is set to expire on <strong>${expiryDate}</strong>.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
      Renewing is quick and easy. We'll check for the best rates and ensure your coverage stays up to date with your current operations.
    </p>
    ${ctaButton(`${config.frontendUrl}/renew`, 'Renew My Policy')}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
      A lapse in coverage can put your business at risk and may affect future premiums. If you have questions about your renewal, just reply to this email.
    </p>
  `);

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send renewal reminder email: ${error.message}`);
  }

  return data;
}
