# Nhật ký prompt #002 — Tạo bản vẽ HTML Prototype trung gian
- **Mục tiêu:** Tạo file `reference/index.html` và `reference/DESIGN_NOTES.md` làm bản vẽ trung gian có cấu trúc chuẩn để kiểm tra layout rẻ và nhanh trên trình duyệt.
- **Công cụ:** Claude Code / Antigravity (Prompt 09)
- **Prompt đã dùng:**
  ```text
  Tạo file reference/index.html cho Mini Shop gồm Navbar, ProductCatalog (Bộ lọc Pills + Lưới sản phẩm), ProductCard có gắn data-component="..." và dùng CSS variables từ DESIGN.md.
  ```
- **Kết quả:** Tốt (File HTML mở được ngay trên trình duyệt, xem được ở 375px và 1280px mượt mà).
- **Lỗi gặp:** A7 (Dán toàn bộ code dài vào chat làm mất context) và B7 (Thiếu thẻ semantic).
- **Cách vá:** Lưu thành file thật trong thư mục `reference/`, dùng thẻ semantic `<header>`, `<main>`, `<article>`.
- **Bài học:** Sửa thiết kế trên HTML chỉ mất vài giây trước khi chuyển đổi sang mã nguồn hoàn chỉnh.
