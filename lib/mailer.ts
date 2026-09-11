import "server-only";
import { formatEventDateRange } from "@/lib/datetime";

const GRAPH_TOKEN_URL = (tenantId: string) =>
  `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const GRAPH_SEND_MAIL_URL = (userPrincipal: string) =>
  `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userPrincipal)}/sendMail`;

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getGraphAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Azure AD credentials are not configured (AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET)"
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(GRAPH_TOKEN_URL(tenantId), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to obtain Microsoft Graph token: ${res.status} ${text}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

export type TicketEmailParams = {
  to: string;
  fullName: string;
  eventTitle: string;
  eventLocation?: string | null;
  eventStartsAt: Date;
  eventEndsAt?: Date | null;
  qrPngBase64: string;
  consentGivenAt: Date;
  marketingConsent: boolean;
};

function formatMskDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export async function sendTicketEmail(params: TicketEmailParams): Promise<void> {
  const fromMailbox = process.env.GRAPH_SENDER_MAILBOX;
  if (!fromMailbox) {
    throw new Error("GRAPH_SENDER_MAILBOX environment variable is not set");
  }

  const accessToken = await getGraphAccessToken();

  const subject = `Ваш билет на «${params.eventTitle}»`;
  const dateStr = formatEventDateRange(params.eventStartsAt, params.eventEndsAt);
  const locationRow = params.eventLocation
    ? `<tr><td style="padding:2px 0; color:#8a8a8a; font-size:13px;">Место</td></tr>
       <tr><td style="padding:0 0 14px; color:#0a0a0a; font-size:15px;">${escapeHtml(params.eventLocation)}</td></tr>`
    : "";

  // Table-based layout on purpose: desktop Outlook renders email HTML with
  // Word's engine, which ignores most modern CSS (flexbox, custom fonts,
  // box-shadow, etc.) but handles nested tables and inline styles reliably.
  const htmlBody = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden;">
        <tr>
          <td align="center" style="background:#0a0a0a; padding:32px 24px;">
            <div style="font-family: Helvetica, Arial, sans-serif; font-weight:bold; font-size:26px; color:#ffffff; letter-spacing:-0.5px;">
              PR<span style="display:inline-block; width:1px; height:0.9em; background:#ffffff; margin:0 10px; vertical-align:middle;"></span>ST
            </div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size:11px; color:#ffffff; letter-spacing:4px; margin-top:6px;">
              SPACE
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px; font-family: Helvetica, Arial, sans-serif; color:#0a0a0a;">
            <p style="margin:0 0 16px; font-size:16px;">Здравствуйте, ${escapeHtml(params.fullName)}!</p>
            <p style="margin:0 0 24px; font-size:15px; color:#3a3a3a;">
              Ваша регистрация на мероприятие подтверждена.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; border-top:1px solid #e5e5e5; padding-top:16px;">
              <tr><td style="padding:2px 0; color:#8a8a8a; font-size:13px;">Мероприятие</td></tr>
              <tr><td style="padding:0 0 14px; color:#0a0a0a; font-size:15px; font-weight:bold;">${escapeHtml(params.eventTitle)}</td></tr>
              <tr><td style="padding:2px 0; color:#8a8a8a; font-size:13px;">Дата и время (МСК)</td></tr>
              <tr><td style="padding:0 0 14px; color:#0a0a0a; font-size:15px;">${dateStr}</td></tr>
              ${locationRow}
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 32px 8px;">
            <p style="margin:0 0 16px; font-family: Helvetica, Arial, sans-serif; font-size:14px; color:#3a3a3a;">
              Предъявите этот QR-код на входе — его отсканирует сотрудник стенда.
            </p>
            <img src="cid:ticket-qr" alt="QR-билет" width="220" height="220" style="display:block; border:1px solid #e5e5e5; border-radius:8px; padding:12px;" />
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px; font-family: Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5; padding-top:16px;">
              <tr><td style="padding:0 0 8px; color:#8a8a8a; font-size:12px;">Подтверждённые согласия (${formatMskDateTime(params.consentGivenAt)}, МСК)</td></tr>
              <tr><td style="padding:2px 0; color:#0a0a0a; font-size:13px;">✓ Согласие на обработку персональных данных в соответствии с Политикой обработки персональных данных ООО «ПРСТ ОПЕРЕЙШН»</td></tr>
              <tr><td style="padding:6px 0 0; color:#0a0a0a; font-size:13px;">${params.marketingConsent ? "✓" : "–"} Согласие на получение рекламной и информационной рассылки от ООО «ПРСТ ОПЕРЕЙШН»</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px; font-family: Helvetica, Arial, sans-serif;">
            <p style="margin:0; font-size:12px; color:#a0a0a0;">
              Если вы не регистрировались на это мероприятие, просто проигнорируйте это письмо.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `;

  // Копия на внутренний адрес — независимое подтверждение того, что
  // квитанция о согласиях действительно ушла на почту регистрирующегося
  // (на случай спора об использовании рекламной рассылки).
  const consentReceiptBcc = process.env.CONSENT_RECEIPT_EMAIL;

  const message = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: [{ emailAddress: { address: params.to } }],
      ...(consentReceiptBcc
        ? { bccRecipients: [{ emailAddress: { address: consentReceiptBcc } }] }
        : {}),
      attachments: [
        {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: "ticket-qr.png",
          contentType: "image/png",
          contentBytes: params.qrPngBase64,
          isInline: true,
          contentId: "ticket-qr",
        },
      ],
    },
    saveToSentItems: false,
  };

  const res = await fetch(GRAPH_SEND_MAIL_URL(fromMailbox), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft Graph sendMail failed: ${res.status} ${text}`);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
