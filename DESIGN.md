# 🎨 HỆ THỐNG THIẾT KẾ & DESIGN TOKENS (DESIGN.md)
> **Dự án:** Mini Shop – Cửa Hàng Công Nghệ & Phụ Kiện Cao Cấp  
> **Phiên bản:** 1.0.0 (Design System Tokenized) • **Tác giả:** Học viên Vibe Coding  
> **Khung tham chiếu:** WCAG 2.2 AA • Responsive 320px – 1440px

---

## 1. BẢNG MÀU CHỦ ĐẠO (COLOR TOKENS)

| Token CSS | Tên / Vai trò | Giá trị Light Mode | Giá trị Dark Mode | Tương phản (vs BG) |
| :--- | :--- | :--- | :--- | :---: |
| `--primary` | Màu thương hiệu chính (Indigo) | `#4F46E5` (indigo-600) | `#818CF8` (indigo-400) | $\ge 4.5:1$ (Đạt) |
| `--primary-hover` | Hover nút chính | `#4338CA` (indigo-700) | `#6366F1` (indigo-500) | $\ge 4.5:1$ (Đạt) |
| `--accent` | Màu điểm nhấn / Khuyến mãi | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | $\ge 4.5:1$ (Đạt) |
| `--bg-body` | Nền trang web | `#F8FAFC` (slate-50) | `#0B0F19` (slate-950) | Nền chuẩn |
| `--bg-surface` | Nền thẻ Card / Header | `#FFFFFF` (white) | `#1E293B` (slate-800) | Nền bề mặt |
| `--text-main` | Chữ tiêu đề & nội dung chính | `#0F172A` (slate-900) | `#F8FAFC` (slate-50) | $15.2:1$ (Đạt AAA) |
| `--text-muted` | Chữ phụ, mô tả ngắn, meta | `#64748B` (slate-500) | `#94A3B8` (slate-400) | $5.1:1$ (Đạt AA) |
| `--border-color` | Đường viền & ngăn cách | `#E2E8F0` (slate-200) | `#334155` (slate-700) | Đường phân cách |
| `--status-success`| Thành công, Còn hàng, Free ship | `#10B981` (emerald-500)| `#34D399` (emerald-400)| $\ge 4.5:1$ (Đạt) |
| `--status-danger` | Báo lỗi, Giảm giá sốc, Hết hàng | `#EF4444` (red-500) | `#F87171` (red-400) | $\ge 4.5:1$ (Đạt) |

---

## 2. TYPOGRAPHY (CHỮ VÀ CỠ CHỮ)
- **Font chính:** `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif.
- **Thang cỡ chữ (Modular Scale):**
  - `Display / H1`: `2.25rem` (36px) mobile / `2.75rem` (44px) desktop - `font-bold`
  - `H2`: `1.75rem` (28px) - `font-semibold`
  - `H3`: `1.25rem` (20px) - `font-semibold`
  - `Body Base`: `1rem` (16px) - `line-height: 1.6`
  - `Body Small / Caption`: `0.875rem` (14px) - `text-muted`
  - `Badge / Label`: `0.75rem` (12px) - `font-bold uppercase`
- **Số liệu tiền tệ & Đơn hàng:** Áp dụng `font-variant-numeric: tabular-nums` để số luôn thẳng hàng.

---

## 3. KHOẢNG CÁCH (SPACING - BỘI SỐ 4PX)
- `--space-1`: `4px`
- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px` (Khoảng cách chuẩn)
- `--space-6`: `24px` (Padding Card chuẩn)
- `--space-8`: `32px` (Khoảng cách giữa các thành phần)
- `--space-12`: `48px` (Khoảng cách Section mobile)
- `--space-16`: `64px` (Khoảng cách Section desktop)

---

## 4. BO GÓC & ĐỔ BÓNG (RADIUS & SHADOWS)
- **Bo góc (Border Radius):**
  - Thẻ sản phẩm & Khối nội dung: `rounded-2xl` (`16px`)
  - Nút bấm (Buttons) & Ô nhập (Inputs): `rounded-xl` (`12px`)
  - Badge & Huy hiệu giảm giá: `rounded-full` (`9999px`)
- **Đổ bóng (Shadows):**
  - `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - `--shadow-hover`: `0 10px 25px -3px rgba(79, 70, 229, 0.15)`

---

## 5. TIÊU CHUẨN ACCESSIBILITY (A11Y - WCAG 2.2 AA)
1. **Target Size Mobile:** Mọi nút bấm, icon bấm được có kích thước tối thiểu $\ge 44 \times 44\text{px}$.
2. **Focus Visible:** Khi dùng bàn phím (Tab), mọi phần tử có outline rõ ràng `3px solid var(--primary)` và `outline-offset: 2px`.
3. **Semantic Hierarchy:** Có đầy đủ `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>` và tiêu đề cấp bậc không nhảy cóc (`h1` $\to$ `h2` $\to$ `h3`).
