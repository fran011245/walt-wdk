/**
 * Helper: generar QR para una URL o dirección.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import QRCode from 'qrcode';

export async function generateQrDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, { margin: 2 });
}
