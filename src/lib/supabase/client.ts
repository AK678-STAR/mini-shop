import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Khởi tạo Supabase Client phía Server/Client sử dụng khoá công khai (publishable / anon key).
 * Tuân thủ nguyên tắc bảo mật:
 * - TUYỆT ĐỐI KHÔNG dùng secret key / service_role key ở đây.
 * - Chỉ dùng khoá công khai đọc dữ liệu tuân thủ Row Level Security (RLS).
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bnzrwpahpmkhowhzhwbt.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let publicClientInstance: SupabaseClient | null = null;

export function getSupabasePublicClient(): SupabaseClient {
  if (!publicClientInstance) {
    if (!supabaseAnonKey) {
      console.warn(
        "[Supabase] Cảnh báo: NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được cấu hình trong biến môi trường. Vui lòng cấu hình trên Vercel hoặc file .env."
      );
    }

    publicClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return publicClientInstance;
}
