import "server-only";

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
  qrPngBase64: string;
};

function formatEventDate(date: Date) {
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
  const dateStr = formatEventDate(params.eventStartsAt);
  const locationLine = params.eventLocation ? `<p>Место: ${escapeHtml(params.eventLocation)}</p>` : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1a1a1a;">
      <p>Здравствуйте, ${escapeHtml(params.fullName)}!</p>
      <p>Ваша регистрация на мероприятие «${escapeHtml(params.eventTitle)}» подтверждена.</p>
      <p>Дата и время: ${dateStr} (МСК)</p>
      ${locationLine}
      <p>Пожалуйста, предъявите QR-код ниже на входе — он будет отсканирован сотрудником стенда.</p>
      <img src="cid:ticket-qr" alt="QR-билет" width="260" height="260" />
      <p style="color:#666; font-size: 13px; margin-top: 24px;">
        Если вы не регистрировались на это мероприятие, просто проигнорируйте это письмо.
      </p>
    </div>
  `;

  const message = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: [{ emailAddress: { address: params.to } }],
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
