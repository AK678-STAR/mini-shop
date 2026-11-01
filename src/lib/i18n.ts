import "server-only";

export const VALID_LOCALES = ["vi", "en"] as const;
export type Locale = (typeof VALID_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/**
 * Kiểm tra mã ngôn ngữ có thuộc danh sách hỗ trợ ['vi', 'en'] hay không
 */
export function isValidLocale(locale: string): locale is Locale {
  return (VALID_LOCALES as readonly string[]).includes(locale);
}

/**
 * Nạp từ điển đa ngôn ngữ ở phía Server (Server-only)
 * Tuyệt đối không đẩy toàn bộ từ điển vào bundle client JS của trình duyệt
 */
const dictionaries = {
  vi: () => import("@/dictionaries/vi.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export async function getDictionary(locale: string) {
  if (!isValidLocale(locale)) {
    return dictionaries.vi(); // Fallback an toàn về tiếng Việt nếu mã lạ
  }
  return dictionaries[locale]();
}

/**
 * Định dạng tiền tệ theo chuẩn ngôn ngữ và số nguyên VNĐ
 * - vi: 2.790.000 ₫
 * - en: ₫2,790,000
 */
export function formatCurrency(amount: number, locale: Locale = "vi"): string {
  const safeAmount = Math.round(amount);
  const localeTag = locale === "en" ? "en-US" : "vi-VN";

  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "VND",
  }).format(safeAmount);
}

