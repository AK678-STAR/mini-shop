import { PrismaClient, Role, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu quá trình seed dữ liệu cho Mini Shop...");

  // --------------------------------------------------------------------------
  // 1. SEED CATEGORIES (4 Danh mục chuyên ngành CNTT - Dùng upsert)
  // --------------------------------------------------------------------------
  const categoriesData = [
    {
      slug: "laptop-may-tram",
      name: "Laptop & Máy trạm",
      description: "Laptop cao cấp, Ultrabook và máy trạm di động dành cho kỹ sư phần mềm & đồ họa.",
    },
    {
      slug: "linh-kien-may-tinh",
      name: "Linh kiện máy tính",
      description: "CPU, GPU, RAM, SSD NVMe và bo mạch chủ hiệu năng cao phục vụ dựng case chuyên nghiệp.",
    },
    {
      slug: "phan-mem-ban-quyen",
      name: "Phần mềm bản quyền",
      description: "Hệ điều hành, công cụ phát triển phần mềm IDE, bản quyền Cloud và đồ họa sáng tạo.",
    },
    {
      slug: "khoa-hoc-cntt",
      name: "Khóa học CNTT Chuyên sâu",
      description: "Các khóa học công nghệ cao: Vibe Coding, Next.js Fullstack, DevOps, Cloud và AI.",
    },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const upsertedCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { slug: cat.slug, name: cat.name, description: cat.description },
    });
    categoriesMap[cat.slug] = upsertedCat.id;
  }
  console.log(`✅ Đã upsert ${Object.keys(categoriesMap).length} danh mục.`);

  // --------------------------------------------------------------------------
  // 2. SEED USERS (Khách hàng mẫu - Dùng upsert. Tài khoản Admin khởi tạo qua scripts/create-admin.ts)
  // --------------------------------------------------------------------------
  const normalUser = await prisma.user.upsert({
    where: { email: "customer@minishop.dev" },
    update: { name: "Lê Minh Khánh (K1509)", role: Role.USER },
    create: {
      email: "customer@minishop.dev",
      name: "Lê Minh Khánh (K1509)",
      role: Role.USER,
    },
  });
  console.log(`✅ Đã upsert người dùng mẫu: ${normalUser.email} (USER).`);
  console.log("ℹ️  Tài khoản ADMIN được tạo bảo mật thông qua script: npm run db:admin");

  // --------------------------------------------------------------------------
  // 3. SEED PRODUCTS (>= 24 sản phẩm thuộc 4 danh mục - Dùng upsert)
  // --------------------------------------------------------------------------
  const productsData = [
    // --- 1. Laptop & Máy trạm (6 SP) ---
    {
      name: "MacBook Pro 16\" M3 Max 36GB 1TB Space Black",
      slug: "macbook-pro-16-m3-max",
      price: 89990000,
      originalPrice: 94990000,
      stock: 12,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop",
      description: "Cỗ máy tối thượng cho Lập trình viên AI, Machine Learning và dựng phim 8K.",
    },
    {
      name: "MacBook Air 13\" M3 16GB 512GB Space Gray",
      slug: "macbook-air-13-m3-16gb",
      price: 31490000,
      originalPrice: 34990000,
      stock: 25,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&auto=format&fit=crop",
      description: "Thiết kế siêu mỏng nhẹ 1.24kg, pin 18h, xử lý mượt mà tác vụ lập trình web & di động.",
    },
    {
      name: "ThinkPad X1 Carbon Gen 12 Core Ultra 7 32GB 1TB",
      slug: "thinkpad-x1-carbon-gen-12",
      price: 52990000,
      originalPrice: 56990000,
      stock: 8,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop",
      description: "Bàn phím gõ code số 1 thế giới, tiêu chuẩn độ bền quân đội Mỹ MIL-STD 810H.",
    },
    {
      name: "Dell XPS 16 9640 Core Ultra 9 RTX 4070 32GB",
      slug: "dell-xps-16-9640-ultra-9",
      price: 74990000,
      originalPrice: 79990000,
      stock: 5,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop",
      description: "Màn hình 4K OLED siêu nét, GPU RTX 4070 mạnh mẽ cho kỹ sư render đồ họa 3D.",
    },
    {
      name: "ASUS ROG Zephyrus G16 OLED RTX 4080",
      slug: "asus-rog-zephyrus-g16-oled",
      price: 68990000,
      originalPrice: 72990000,
      stock: 7,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop",
      description: "Khung nhôm CNC nguyên khối siêu sang, màn hình ROG Nebula OLED 240Hz sắc sảo.",
    },
    {
      name: "Lenovo Legion Pro 7i Core i9-14900HX RTX 4090",
      slug: "lenovo-legion-pro-7i-rtx-4090",
      price: 84990000,
      originalPrice: 89990000,
      stock: 4,
      categorySlug: "laptop-may-tram",
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700&auto=format&fit=crop",
      description: "Hiệu năng cực đỉnh với công nghệ tản nhiệt buồng hơi Coldfront Vapor tiên tiến.",
    },

    // --- 2. Linh kiện máy tính (6 SP) ---
    {
      name: "Card Màn Hình ASUS ROG Strix GeForce RTX 4090 24GB",
      slug: "asus-rog-strix-rtx-4090-24gb",
      price: 59990000,
      originalPrice: 63990000,
      stock: 6,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop",
      description: "Card đồ họa mạnh nhất cho các mô hình Local LLM và đồ họa chuyên nghiệp.",
    },
    {
      name: "CPU Intel Core i9-14900K (24 nhân 32 luồng, up to 6.0GHz)",
      slug: "cpu-intel-core-i9-14900k",
      price: 15490000,
      originalPrice: 16990000,
      stock: 20,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=700&auto=format&fit=crop",
      description: "Tốc độ xử lý đa luồng ấn tượng phục vụ biên dịch phần mềm lớn trong nháy mắt.",
    },
    {
      name: "CPU AMD Ryzen 9 7950X3D (16 nhân 32 luồng V-Cache)",
      slug: "cpu-amd-ryzen-9-7950x3d",
      price: 16290000,
      originalPrice: 17500000,
      stock: 15,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&auto=format&fit=crop",
      description: "Công nghệ 3D V-Cache độc quyền tối ưu độ trễ xử lý cực thấp.",
    },
    {
      name: "RAM Corsair Dominator Titanium RGB DDR5 64GB (2x32GB) 6000MHz",
      slug: "ram-corsair-dominator-ddr5-64gb",
      price: 7890000,
      originalPrice: 8590000,
      stock: 30,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=700&auto=format&fit=crop",
      description: "Kit RAM cao cấp với IC tản nhiệt hiệu năng cao, tương thích Intel XMP 3.0 & AMD EXPO.",
    },
    {
      name: "Ổ Cứng SSD Samsung 990 Pro 2TB PCIe Gen 4.0 NVMe M.2",
      slug: "ssd-samsung-990-pro-2tb",
      price: 4690000,
      originalPrice: 5290000,
      stock: 45,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop",
      description: "Tốc độ đọc ghi lên tới 7.450 MB/s, độ bền cao, bảo vệ dữ liệu dự án an toàn tuyệt đối.",
    },
    {
      name: "Bo Mạch Chủ ASUS ROG MAXIMUS Z790 HERO",
      slug: "mainboard-asus-rog-maximus-z790-hero",
      price: 18490000,
      originalPrice: 19990000,
      stock: 10,
      categorySlug: "linh-kien-may-tinh",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop",
      description: "Mainboard flagship socket LGA1700 với 20+1 pha nguồn cấp điện ổn định.",
    },

    // --- 3. Phần mềm bản quyền (6 SP) ---
    {
      name: "Bản Quyền JetBrains All Products Pack (1 Năm Cá Nhân)",
      slug: "jetbrains-all-products-pack-1y",
      price: 4990000,
      originalPrice: 5990000,
      stock: 100,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=700&auto=format&fit=crop",
      description: "Bao gồm trọn bộ WebStorm, IntelliJ IDEA Ultimate, PyCharm, GoLand, DataGrip, Rider.",
    },
    {
      name: "Gói Đăng Ký GitHub Copilot Pro Bản Quyền (1 Năm)",
      slug: "github-copilot-pro-1y",
      price: 2450000,
      originalPrice: 2800000,
      stock: 200,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1618401479383-8a3c8e434f3a?w=700&auto=format&fit=crop",
      description: "Trợ lý lập trình AI hàng đầu thế giới với tích hợp đa mô hình GPT-4o và Claude 3.5 Sonnet.",
    },
    {
      name: "Microsoft 365 Family Bản Quyền (1 Năm / 6 Người Dùng)",
      slug: "microsoft-365-family-1y",
      price: 1690000,
      originalPrice: 1990000,
      stock: 150,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=700&auto=format&fit=crop",
      description: "Bộ ứng dụng Office Word, Excel, PowerPoint cùng 6TB lưu trữ đám mây OneDrive an toàn.",
    },
    {
      name: "Windows 11 Pro Bản Quyền Điện Tử (Retail License Vĩnh Viễn)",
      slug: "windows-11-pro-license",
      price: 3290000,
      originalPrice: 3890000,
      stock: 90,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=700&auto=format&fit=crop",
      description: "Hỗ trợ BitLocker mã hóa ổ đĩa, Hyper-V ảo hóa và Windows Sandbox cho chuyên gia bảo mật.",
    },
    {
      name: "Parallels Desktop 19 for Mac Pro Edition (Vĩnh Viễn)",
      slug: "parallels-desktop-19-mac-pro",
      price: 2890000,
      originalPrice: 3290000,
      stock: 60,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop",
      description: "Chạy hệ điều hành Windows 11 ARM mượt mà trên các máy Mac chip Apple Silicon M1/M2/M3.",
    },
    {
      name: "CleanMyMac X Bản Quyền Trọn Đời (1 Máy Mac)",
      slug: "cleanmymac-x-lifetime-license",
      price: 1290000,
      originalPrice: 1590000,
      stock: 80,
      categorySlug: "phan-mem-ban-quyen",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&auto=format&fit=crop",
      description: "Dọn dẹp tệp tin rác, tối ưu bộ nhớ RAM và bảo vệ máy tính Mac khỏi các phần mềm độc hại.",
    },

    // --- 4. Khóa học CNTT Chuyên sâu (6 SP) ---
    {
      name: "Khóa Học: Next.js 15 Fullstack & Vibe Coding với AI",
      slug: "khoa-hoc-nextjs-fullstack-vibe-coding",
      price: 2490000,
      originalPrice: 3500000,
      stock: 999,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&auto=format&fit=crop",
      description: "Làm chủ Next.js App Router, Server Actions, Prisma, PostgreSQL và lập trình bằng AI Agents.",
    },
    {
      name: "Khóa Học: Thiết Kế Hệ Thống Microservices & Distributed Systems",
      slug: "khoa-hoc-microservices-system-design",
      price: 3290000,
      originalPrice: 4500000,
      stock: 500,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&auto=format&fit=crop",
      description: "Thực chiến kiến trúc chịu tải triệu người dùng với Kafka, Redis, Docker và Kubernetes.",
    },
    {
      name: "Khóa Học: Lập Trình Hệ Thống Backend Bằng Golang Toàn Diện",
      slug: "khoa-hoc-golang-backend-mastery",
      price: 1990000,
      originalPrice: 2800000,
      stock: 500,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=700&auto=format&fit=crop",
      description: "Làm chủ Goroutine, Channel, Gin framework, gRPC và xây dựng API hiệu năng cao.",
    },
    {
      name: "Khóa Học: DevOps & SRE: CI/CD, Terraform, Kubernetes Trên AWS",
      slug: "khoa-hoc-devops-sre-aws",
      price: 2990000,
      originalPrice: 3900000,
      stock: 300,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=700&auto=format&fit=crop",
      description: "Xây dựng hạ tầng Cloud tự động hóa bằng Infrastructure as Code và GitOps hiện đại.",
    },
    {
      name: "Khóa Học: Xây Dựng Ứng Dụng AI & RAG Với Python & LangChain",
      slug: "khoa-hoc-ai-rag-langchain-python",
      price: 2790000,
      originalPrice: 3800000,
      stock: 600,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&auto=format&fit=crop",
      description: "Tích hợp Vector Database, OpenAI, Claude và xây dựng trợ lý AI chuyên nghiệp cho doanh nghiệp.",
    },
    {
      name: "Khóa Học: An Toàn Thông Tin & Kiểm Thử Xâm Nhập (Penetration Testing)",
      slug: "khoa-hoc-cyber-security-pentest",
      price: 3490000,
      originalPrice: 4800000,
      stock: 250,
      categorySlug: "khoa-hoc-cntt",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&auto=format&fit=crop",
      description: "Phân tích lỗ hổng bảo mật web OWASP Top 10, khai thác và phòng thủ hệ thống mạng chuyên nghiệp.",
    },
  ];

  const productsMap: Record<string, string> = {};

  for (const p of productsData) {
    const categoryId = categoriesMap[p.categorySlug];
    const upsertedProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        categoryId,
        image: p.image,
        description: p.description,
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        categoryId,
        image: p.image,
        description: p.description,
        isActive: true,
      },
    });
    productsMap[p.slug] = upsertedProduct.id;
  }
  console.log(`✅ Đã upsert ${Object.keys(productsMap).length} sản phẩm thành công.`);

  // --------------------------------------------------------------------------
  // 4. SEED SAMPLE ORDERS (Vài đơn hàng mẫu chứng minh unitPrice đóng băng)
  // --------------------------------------------------------------------------
  const order1Code = "ORD-20261005-001";
  const order1Total = 31490000 + 4990000; // MacBook Air + JetBrains Pack

  await prisma.order.upsert({
    where: { orderCode: order1Code },
    update: {
      userId: normalUser.id,
      status: OrderStatus.PAID,
      totalAmount: order1Total,
    },
    create: {
      orderCode: order1Code,
      userId: normalUser.id,
      status: OrderStatus.PAID,
      totalAmount: order1Total,
      orderItems: {
        create: [
          {
            productId: productsMap["macbook-air-13-m3-16gb"],
            unitPrice: 31490000, // Đóng băng giá thời điểm mua
            quantity: 1,
          },
          {
            productId: productsMap["jetbrains-all-products-pack-1y"],
            unitPrice: 4990000,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order2Code = "ORD-20261005-002";
  const order2Total = 2490000; // Khóa học Next.js

  await prisma.order.upsert({
    where: { orderCode: order2Code },
    update: {
      userId: normalUser.id,
      status: OrderStatus.SHIPPED,
      totalAmount: order2Total,
    },
    create: {
      orderCode: order2Code,
      userId: normalUser.id,
      status: OrderStatus.SHIPPED,
      totalAmount: order2Total,
      orderItems: {
        create: [
          {
            productId: productsMap["khoa-hoc-nextjs-fullstack-vibe-coding"],
            unitPrice: 2490000,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Đã upsert 2 đơn hàng mẫu kèm các OrderItem lưu giá unitPrice thời điểm mua.");
  console.log("🎉 Hoàn tất quá trình seed dữ liệu thành công!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi trong quá trình seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
