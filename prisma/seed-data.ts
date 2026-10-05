export interface SeedCategory {
  slug: string;
  name: string;
  description: string;
}

export interface SeedProduct {
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  categorySlug: string;
  image: string;
  description: string;
  specs?: Record<string, string>;
}

export interface SeedUser {
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

export const SEED_CATEGORIES: SeedCategory[] = [
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

export const SEED_USERS: SeedUser[] = [
  {
    email: "admin@minishop.dev",
    name: "Quản trị viên Hệ thống",
    role: "ADMIN",
  },
  {
    email: "customer@minishop.dev",
    name: "Lê Minh Khánh (K1509)",
    role: "USER",
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  // --- 1. Laptop & Máy trạm ---
  {
    name: "MacBook Pro 16\" M3 Max 36GB 1TB Space Black",
    slug: "macbook-pro-16-m3-max",
    price: 89990000,
    originalPrice: 94990000,
    stock: 12,
    categorySlug: "laptop-may-tram",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop",
    description: "Khung viền Titan siêu nhẹ, chip Apple M3 Max mạnh mẽ đỉnh cao cho lập trình viên AI và xử lý đồ họa chuyên sâu.",
    specs: {
      "Màn hình": "16.2 inch Liquid Retina XDR 120Hz",
      "Vi xử lý": "Apple M3 Max (14 CPU, 30 GPU)",
      "RAM": "36GB Unified Memory",
      "Ổ cứng": "1TB SSD siêu tốc",
      "Thời lượng pin": "22 giờ liên tục",
    },
  },
  {
    name: "MacBook Air 13\" M3 16GB 512GB Space Gray",
    slug: "macbook-air-13-m3-16gb",
    price: 31490000,
    originalPrice: 34990000,
    stock: 25,
    categorySlug: "laptop-may-tram",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&auto=format&fit=crop",
    description: "Thiết kế siêu mỏng nhẹ chỉ 1.24kg, chip Apple M3 với GPU 10 nhân, thời lượng pin 18 giờ liên tục.",
    specs: {
      "Màn hình": "13.6 inch Liquid Retina 500 nits",
      "CPU": "Apple M3 8 nhân (4P + 4E)",
      "RAM": "16GB Unified Memory",
      "Ổ cứng": "512GB SSD siêu tốc",
      "Trọng lượng": "1.24 kg",
    },
  },
  {
    name: "ThinkPad X1 Carbon Gen 12 Core Ultra 7 32GB 1TB",
    slug: "thinkpad-x1-carbon-gen-12",
    price: 52990000,
    originalPrice: 56990000,
    stock: 8,
    categorySlug: "laptop-may-tram",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop",
    description: "Bàn phím gõ code số 1 thế giới, tiêu chuẩn độ bền quân đội Mỹ MIL-STD 810H, tích hợp AI NPU thông minh.",
    specs: {
      "Màn hình": "14 inch 2.8K OLED 120Hz",
      "CPU": "Intel Core Ultra 7 155H",
      "RAM": "32GB LPDDR5x",
      "Ổ cứng": "1TB NVMe Gen 4",
      "Trọng lượng": "1.09 kg",
    },
  },
  {
    name: "Dell XPS 16 9640 Core Ultra 9 RTX 4070 32GB",
    slug: "dell-xps-16-9640-ultra-9",
    price: 74990000,
    originalPrice: 79990000,
    stock: 5,
    categorySlug: "laptop-may-tram",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop",
    description: "Màn hình 4K OLED siêu nét, card đồ họa rời NVIDIA RTX 4070 mạnh mẽ cho kỹ sư render đồ họa 3D.",
    specs: {
      "Màn hình": "16.3 inch 4K+ OLED Touch",
      "CPU": "Intel Core Ultra 9 185H",
      "GPU": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "RAM": "32GB LPDDR5x",
      "Ổ cứng": "1TB PCIe NVMe",
    },
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
    specs: {
      "Màn hình": "16 inch 2.5K OLED 240Hz",
      "CPU": "Intel Core Ultra 9 185H",
      "GPU": "RTX 4080 12GB GDDR6",
      "RAM": "32GB LPDDR5X",
      "Ổ cứng": "1TB SSD PCIe 4.0",
    },
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
    specs: {
      "Màn hình": "16 inch WQXGA 240Hz 500 nits",
      "CPU": "Intel Core i9-14900HX",
      "GPU": "RTX 4090 16GB GDDR6 (175W)",
      "RAM": "32GB DDR5 5600MHz",
      "Ổ cứng": "2TB SSD M.2",
    },
  },

  // --- 2. Linh kiện máy tính ---
  {
    name: "Card Màn Hình ASUS ROG Strix GeForce RTX 4090 24GB",
    slug: "asus-rog-strix-rtx-4090-24gb",
    price: 59990000,
    originalPrice: 63990000,
    stock: 6,
    categorySlug: "linh-kien-may-tinh",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop",
    description: "Card đồ họa mạnh nhất cho các mô hình Local LLM và đồ họa chuyên nghiệp.",
    specs: {
      "Bộ nhớ": "24GB GDDR6X 384-bit",
      "Xung nhịp": "2640 MHz (OC Mode)",
      "Cổng xuất": "2x HDMI 2.1a, 3x DisplayPort 1.4a",
      "Nguồn khuyến nghị": "1000W",
    },
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
    specs: {
      "Số nhân / Luồng": "24 nhân (8P + 16E) / 32 luồng",
      "Xung nhịp tối đa": "6.0 GHz Thermal Velocity Boost",
      "Bộ nhớ đệm": "36MB Intel Smart Cache",
      "Socket": "LGA 1700",
    },
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
    specs: {
      "Số nhân / Luồng": "16 nhân / 32 luồng",
      "Bộ nhớ đệm L3": "128MB 3D V-Cache",
      "TDP": "120W",
      "Socket": "AM5",
    },
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
    specs: {
      "Dung lượng": "64GB (2x 32GB)",
      "Chuẩn RAM": "DDR5 6000MHz CL30",
      "LED": "RGB đa vùng tùy biến iCUE",
    },
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
    specs: {
      "Chuẩn giao tiếp": "PCIe 4.0 NVMe M.2 2280",
      "Tốc độ đọc": "7.450 MB/s",
      "Tốc độ ghi": "6.900 MB/s",
      "Độ bền TBW": "1200 TBW",
    },
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
    specs: {
      "Chipset": "Intel Z790",
      "Pha nguồn": "20+1 Power Stages (90A)",
      "Kết nối": "Wi-Fi 6E, 2x Thunderbolt 4 Type-C",
    },
  },

  // --- 3. Phần mềm bản quyền ---
  {
    name: "Bản Quyền JetBrains All Products Pack (1 Năm Cá Nhân)",
    slug: "jetbrains-all-products-pack-1y",
    price: 4990000,
    originalPrice: 5990000,
    stock: 100,
    categorySlug: "phan-mem-ban-quyen",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=700&auto=format&fit=crop",
    description: "Bao gồm trọn bộ WebStorm, IntelliJ IDEA Ultimate, PyCharm, GoLand, DataGrip, Rider.",
    specs: {
      "Thời hạn": "1 năm (kèm fallback vĩnh viễn)",
      "Nền tảng": "Windows, macOS, Linux",
      "Phạm vi": "Cá nhân thương mại",
    },
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
    specs: {
      "Mô hình": "GPT-4o, Claude 3.5 Sonnet, o1",
      "Tương thích": "VS Code, JetBrains, Visual Studio, Xcode",
    },
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
    specs: {
      "Số tài khoản": "6 người dùng độc lập",
      "Dung lượng Cloud": "1TB OneDrive / người (Tổng 6TB)",
    },
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
    specs: {
      "Hình thức": "Key điện tử kích hoạt online",
      "Thời hạn": "Vĩnh viễn theo máy",
    },
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
    specs: {
      "Tương thích": "macOS Sonoma, Sequoia / Apple Silicon",
      "Tính năng": "Hỗ trợ DirectX 11, vCPU lên đến 32",
    },
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
    specs: {
      "Bản quyền": "Trọn đời cho 1 thiết bị Mac",
    },
  },

  // --- 4. Khóa học CNTT Chuyên sâu ---
  {
    name: "Khóa Học: Next.js 15 Fullstack & Vibe Coding với AI",
    slug: "khoa-hoc-nextjs-fullstack-vibe-coding",
    price: 2490000,
    originalPrice: 3500000,
    stock: 999,
    categorySlug: "khoa-hoc-cntt",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&auto=format&fit=crop",
    description: "Làm chủ Next.js App Router, Server Actions, Prisma, PostgreSQL và lập trình bằng AI Agents.",
    specs: {
      "Thời lượng": "45 giờ video bài giảng",
      "Dự án thực chiến": "3 dự án thực tế Production",
      "Hình thức": "Học online kèm Mentor 1-1",
    },
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
    specs: {
      "Thời lượng": "60 giờ chuyên sâu",
      "Công nghệ": "Go, Kafka, Redis, K8s, PostgreSQL",
    },
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
    specs: {
      "Thời lượng": "35 giờ",
      "Hình thức": "Video + Source code dự án hoàn chỉnh",
    },
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
    specs: {
      "Thời lượng": "40 giờ",
      "Lab thực hành": "Hạ tầng AWS thật có voucher",
    },
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
    specs: {
      "Thời lượng": "30 giờ",
      "Framework": "LangChain, LlamaIndex, ChromaDB",
    },
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
    specs: {
      "Thời lượng": "50 giờ",
      "Chứng chỉ hoàn thành": "Có giá trị trong hồ sơ tuyển dụng",
    },
  },
];
