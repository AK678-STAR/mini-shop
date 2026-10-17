/**
 * Payload chuẩn từ SePay Webhook (giao dịch tiền vào)
 * Tham khảo tài liệu: https://sepay.vn/docs/webhook
 */
export interface SepayWebhookBody {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string | null;
  code?: string | null;
  content?: string;
  transferType?: "in" | "out" | string;
  description?: string;
  transferAmount?: number;
  referenceCode?: string;
  accumulated?: number;
}

/**
 * Hàm thuần: Trích xuất mã đơn hàng từ nội dung chuyển khoản
 * Hỗ trợ các định dạng mã đơn hàng:
 * - ORD-1792244628-ABCD (chuẩn của hệ thống)
 * - ORD1792244628ABCD (viết liền khi ngân hàng bỏ ký tự đặc biệt)
 * - CUID order id
 */
export function extractOrderCodeFromContent(content: string = ""): string | null {
  if (!content) return null;

  // 1. Tìm mẫu ORD-timestamp-suffix (ví dụ ORD-1729174829102-X9AB)
  const regexHyphen = /\b(ORD-\d+-[A-Za-z0-9]+)\b/i;
  const matchHyphen = content.match(regexHyphen);
  if (matchHyphen) return matchHyphen[1].toUpperCase();

  // 2. Tìm mẫu viết liền ORD... (ví dụ ORD1729174829102X9AB)
  const regexPlain = /\b(ORD\d+[A-Za-z0-9]+)\b/i;
  const matchPlain = content.match(regexPlain);
  if (matchPlain) return matchPlain[1].toUpperCase();

  // 3. Tìm mẫu order ID dạng cuid
  const regexCuid = /\b([c][a-z0-9]{24})\b/i;
  const matchCuid = content.match(regexCuid);
  if (matchCuid) return matchCuid[1];

  return null;
}
