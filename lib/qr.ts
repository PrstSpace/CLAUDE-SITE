import QRCode from "qrcode";

const TICKET_PREFIX = "prst-ticket:";

export function buildTicketQrPayload(ticketToken: string): string {
  return `${TICKET_PREFIX}${ticketToken}`;
}

export function parseTicketQrPayload(scanned: string): string | null {
  const trimmed = scanned.trim();
  if (trimmed.startsWith(TICKET_PREFIX)) {
    return trimmed.slice(TICKET_PREFIX.length);
  }
  // Also accept a bare token, in case the QR was scanned by a generic
  // reader that only returns the raw payload without our prefix check.
  if (/^[A-Za-z0-9_-]{16,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function generateTicketQrPngBase64(ticketToken: string): Promise<string> {
  const payload = buildTicketQrPayload(ticketToken);
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
  });
  return dataUrl.replace(/^data:image\/png;base64,/, "");
}
