import { z } from "zod";

/**
 * Danh sách trắng (Allowlist) các tên sự kiện được phép thu thập
 * Tuyệt đối không cho phép tên sự kiện tùy ý để tránh làm nhiễu số liệu
 */
export const ALLOWED_EVENT_NAMES = [
  "product_view",
  "add_to_cart",
  "search_used",
] as const;

export type AnalyticsEventName = (typeof ALLOWED_EVENT_NAMES)[number];

/**
 * Zod Schema cho sự kiện phân tích:
 * - name: Bắt buộc thuộc allowlist
 * - productId: Tùy chọn (chỉ liên kết khi xem sản phẩm hoặc thêm vào giỏ)
 * - lang: Mã ngôn ngữ ('vi' hoặc 'en')
 * - .strip(): Tự động loại bỏ hoàn toàn các trường lạ (email, search_text, ip, v.v.)
 */
export const AnalyticsEventSchema = z
  .object({
    name: z.enum(ALLOWED_EVENT_NAMES, {
      message: "Yêu cầu không hợp lệ.",
    }),
    productId: z.string().trim().min(1).optional().nullable(),
    lang: z.enum(["vi", "en"]).default("vi"),
  })
  .strip();

export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;

