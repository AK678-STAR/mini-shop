import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_report():
    doc = docx.Document()

    # Thiết lập lề trang chuẩn 2 cm (0.78 inch)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # 1. TIÊU ĐỀ BÁO CÁO
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.add_run("BÁO CÁO BÀI TẬP VỀ NHÀ BUỔI 5\nMINI SHOP: DATABASE, PRISMA, SERVER ACTIONS & ĐẶT HÀNG")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(16)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(30, 58, 138) # Dark Blue

    # 2. THÔNG TIN HỌC VIÊN
    info_p = doc.add_paragraph()
    info_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run1 = info_p.add_run("Học viên: ")
    info_run1.font.bold = True
    info_run2 = info_p.add_run("Lê Minh Khánh (K1509)\n")
    info_run3 = info_p.add_run("Link GitHub Repository: ")
    info_run3.font.bold = True
    info_run4 = info_p.add_run("https://github.com/AK678-STAR/mini-shop")
    info_run4.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_paragraph() # Dòng trống

    # 3. MỤC 1: CÁC ĐƯỜNG DẪN NỘP BÀI (CHECKLIST)
    h1 = doc.add_heading("1. TỔNG HỢP CÁC ĐƯỜNG DẪN NỘP BÀI", level=1)
    h1.paragraph_format.space_before = Pt(10)
    h1.paragraph_format.space_after = Pt(6)

    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.2), Inches(2.2), Inches(3.2)]
    
    hdr_cells = table.rows[0].cells
    headers = ["Hạng mục", "Mô tả yêu cầu", "Liên kết / Trạng thái"]
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        hdr_cells[i].paragraphs[0].runs[0].font.bold = True
        hdr_cells[i].paragraphs[0].runs[0].font.name = "Arial"
        hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(hdr_cells[i], "1E3A8A")
        hdr_cells[i].width = col_widths[i]

    items = [
        ("(1) GitHub Repo", "Repository có lịch sử commit và thư mục migrations sạch", "https://github.com/AK678-STAR/mini-shop\nThư mục: prisma/migrations/"),
        ("(2) .env.example", "Tệp mẫu biến môi trường, không chứa mật khẩu thật", "https://github.com/AK678-STAR/mini-shop/blob/main/.env.example"),
        ("(3) prompt-log/", "Tối thiểu 5 nhật ký prompt (Đã hoàn thiện 9 mục)", "https://github.com/AK678-STAR/mini-shop/tree/main/prompt-log"),
        ("(4) Ảnh Prisma Studio", "Ảnh chụp cho thấy dữ liệu đặt hàng Order & OrderItem", "Đã chụp và chèn đầy đủ ở Mục 4 báo cáo"),
    ]

    for item in items:
        row_cells = table.add_row().cells
        for j, text in enumerate(item):
            row_cells[j].text = text
            row_cells[j].paragraphs[0].runs[0].font.name = "Arial"
            row_cells[j].paragraphs[0].runs[0].font.size = Pt(9.5)
            row_cells[j].width = col_widths[j]
            set_cell_background(row_cells[j], "F8FAFC" if len(table.rows) % 2 == 0 else "FFFFFF")

    doc.add_paragraph()

    # 4. MỤC 2: KẾT QUẢ THỰC HIỆN 5 YÊU CẦU TRỌNG TÂM
    h2 = doc.add_heading("2. KẾT QUẢ THỰC HIỆN 5 YÊU CẦU TRỌNG TÂM", level=1)
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(6)

    reqs = [
        ("Yêu cầu 1: Schema >= 5 model, migration sạch, seed >= 24 sản phẩm",
         "• Schema đã thiết kế 5 model chuẩn hóa 3NF: User, Category, Product, Order, OrderItem.\n"
         "• Migration '20261005_init' tạo sạch sẽ toàn bộ các bảng và enum liên quan trong PostgreSQL (Neon).\n"
         "• Seed hoàn tất 4 danh mục và 24 sản phẩm công nghệ đa dạng kèm hình ảnh và thông số thật."),

        ("Yêu cầu 2: Các trang /products và /products/[slug] đọc dữ liệu thật từ DB",
         "• /products: Hỗ trợ tìm kiếm theo tên, lọc theo danh mục, sắp xếp theo giá (tăng/giảm/mới nhất), phân trang (limit/offset và cursor).\n"
         "• /products/[slug]: Hiển thị chi tiết thông tin sản phẩm, mô tả, tồn kho và danh mục liên quan từ truy vấn database."),

        ("Yêu cầu 3: Server Action thêm, sửa, xóa sản phẩm kèm validate Zod",
         "• Đã triển khai trọn bộ Server Actions tại src/app/actions/product.ts: createProduct, updateProduct, deleteProduct.\n"
         "• Tất cả dữ liệu đầu vào đều được kiểm thực chặt chẽ qua Zod schema (tên, slug, giá >= 0, tồn kho >= 0)."),

        ("Yêu cầu 4: Đặt hàng tạo Order + OrderItem trong Database Transaction",
         "• Server Action createOrder mở prisma.$transaction để đảm bảo tính toàn vẹn ACID.\n"
         "• Kiểm tra tồn kho trước khi đặt, trừ tồn kho an toàn và tự động tính tổng tiền từ giá lưu trong DB (chống gian lận sửa giá từ client)."),

        ("Yêu cầu 5: Chạy Prompt 18 review và vá ít nhất 3 lỗi bảo mật Nghiêm trọng/Trung bình",
         "• Đã thực thi script kiểm thử bảo mật tự động rà soát 8 hạng mục tấn công chéo và vá thành công:\n"
         "  1. Lỗi IDOR đơn hàng: Bổ sung điều kiện lọc where: { id: orderId, userId: sessionUser.id }.\n"
         "  2. Lỗi tự phong ADMIN khi đăng ký: Thiết lập role.input = false trong Better Auth.\n"
         "  3. Lỗi Open Redirect qua ?next: Chuẩn hóa hàm safeNextPath loại bỏ control chars, //, /\\, :, fallback về '/'.\n"
         "  4. Thêm Rate Limiting: Chống brute-force đăng nhập (tối đa 5 lần thử / 15 phút, trả mã 429).")
    ]

    for title_text, desc_text in reqs:
        p = doc.add_paragraph()
        run_t = p.add_run(f"✔ {title_text}\n")
        run_t.font.bold = True
        run_t.font.name = "Arial"
        run_t.font.color.rgb = RGBColor(16, 185, 129)
        run_d = p.add_run(desc_text)
        run_d.font.name = "Arial"
        run_d.font.size = Pt(10)
        p.paragraph_format.space_after = Pt(6)

    # 5. MỤC 3: TÍNH NĂNG ĐIỂM CỘNG ĐẠT ĐƯỢC
    h3 = doc.add_heading("3. CÁC TÍNH NĂNG ĐIỂM CỘNG ĐẠT ĐƯỢC", level=1)
    h3.paragraph_format.space_before = Pt(12)
    h3.paragraph_format.space_after = Pt(6)

    bonuses = [
        "1. Đánh Index tối ưu tìm kiếm: Đã thiết lập chỉ mục (Index) trên các trường slug, categoryId, status, userId trong schema.prisma giúp tăng tốc độ truy vấn gấp nhiều lần khi dữ liệu lớn.",
        "2. Phân trang theo con trỏ (Cursor-based Pagination): Hỗ trợ truy vấn phân trang bằng cursor kết hợp limit, loại bỏ hiện tượng lệch trang khi có bản ghi mới được chèn.",
        "3. Ngăn ngừa triệt để lỗi N+1 Query: Sử dụng prisma.findMany kèm mệnh đề include: { category: true, orderItems: true }, toàn bộ dữ liệu quan hệ được tải đồng bộ trong một lần truy vấn duy nhất."
    ]
    for b in bonuses:
        p = doc.add_paragraph()
        r = p.add_run(f"★ {b}")
        r.font.name = "Arial"
        r.font.size = Pt(10)
        p.paragraph_format.space_after = Pt(4)

    # 6. MỤC 4: ẢNH CHỤP MINH CHỨNG TRÊN PRISMA STUDIO
    h4 = doc.add_heading("4. ẢNH CHỤP MINH CHỨNG DỮ LIỆU ĐẶT HÀNG TRÊN PRISMA STUDIO", level=1)
    h4.paragraph_format.space_before = Pt(12)
    h4.paragraph_format.space_after = Pt(6)

    img1_path = os.path.abspath("docs_images/prisma_studio_orders.png")
    img2_path = os.path.abspath("docs_images/prisma_studio_order_items.png")

    if os.path.exists(img1_path):
        doc.add_paragraph()
        p1 = doc.add_paragraph()
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run("Hình 1: Danh sách các đơn hàng trong bảng Order trên Prisma Studio")
        r1.font.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = RGBColor(30, 58, 138)

        p1_desc = doc.add_paragraph()
        p1_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r1_desc = p1_desc.add_run("(Hiển thị mã đơn hàng ORD-20261005-001, ORD-20261005-002; trạng thái PAID, SHIPPED; tổng tiền và liên kết người dùng)")
        r1_desc.font.italic = True
        r1_desc.font.size = Pt(9)
        p1_desc.paragraph_format.space_after = Pt(6)

        p_img1 = doc.add_paragraph()
        p_img1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img1.add_run().add_picture(img1_path, width=Inches(6.6))
        p_img1.paragraph_format.space_after = Pt(12)

    if os.path.exists(img2_path):
        doc.add_paragraph()
        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(2)
        r2 = p2.add_run("Hình 2: Chi tiết các mục hàng OrderItem trong đơn hàng")
        r2.font.bold = True
        r2.font.name = "Arial"
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = RGBColor(30, 58, 138)

        p2_desc = doc.add_paragraph()
        p2_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r2_desc = p2_desc.add_run("(Minh chứng giao dịch đặt hàng tạo Order + OrderItem đồng bộ trong Database Transaction, lưu chính xác đơn giá unitPrice và số lượng quantity)")
        r2_desc.font.italic = True
        r2_desc.font.size = Pt(9)
        p2_desc.paragraph_format.space_after = Pt(6)

        p_img2 = doc.add_paragraph()
        p_img2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img2.add_run().add_picture(img2_path, width=Inches(6.6))
        p_img2.paragraph_format.space_after = Pt(12)

    output_filename = "Bao_Cao_Bai_Tap_Buoi_5_Mini_Shop.docx"
    doc.save(output_filename)
    print(f"Report generated successfully: {output_filename}")

if __name__ == "__main__":
    create_report()
