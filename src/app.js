/**
 * MINI SHOP - MAIN APPLICATION JAVASCRIPT
 * Tích hợp 3 Màn hình, Quản lý State, Router SPA, Dark Mode và Xử lý Giỏ hàng 3 bước.
 */

// --- 1. DỮ LIỆU SẢN PHẨM MẪU (MOCK DATASET) ---
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    category: "phone",
    categoryName: "Điện thoại",
    price: 28990000,
    originalPrice: 34990000,
    discountBadge: "-17%",
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop"
    ],
    colors: ["Titan Tự Nhiên", "Titan Xanh", "Titan Đen"],
    versions: ["256GB", "512GB", "1TB"],
    desc: "Khung viền Titan chuẩn hàng không vũ trụ siêu nhẹ và bền bỉ. Chip A17 Pro đem lại hiệu năng đồ họa đột phá, nút Action Button tùy biến linh hoạt và cổng USB-C tốc độ cao.",
    specs: {
      "Màn hình": "6.7 inch Super Retina XDR OLED 120Hz",
      "Vi xử lý": "Apple A17 Pro (3nm)",
      "Bộ nhớ trong": "256GB NVMe",
      "Camera chính": "48MP + 12MP + 12MP (Zoom 5x)",
      "Pin & Sạc": "4422 mAh, Sạc nhanh 20W, MagSafe 15W",
      "Trọng lượng": "221g"
    }
  },
  {
    id: 2,
    name: "MacBook Air 13\" M3 16GB 512GB Space Gray",
    category: "laptop",
    categoryName: "Laptop & Tablet",
    price: 31490000,
    originalPrice: 34990000,
    discountBadge: "-10%",
    rating: 5.0,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&auto=format&fit=crop"
    ],
    colors: ["Space Gray", "Silver", "Midnight", "Starlight"],
    versions: ["16GB / 512GB", "16GB / 1TB", "24GB / 512GB"],
    desc: "Thiết kế siêu mỏng nhẹ chỉ 1.24kg. Chip Apple M3 với GPU 10 nhân hỗ trợ dò tia bằng phần cứng (Ray Tracing), thời lượng pin ấn tượng lên đến 18 giờ liên tục.",
    specs: {
      "Màn hình": "13.6 inch Liquid Retina 500 nits",
      "CPU": "Apple M3 8 nhân (4P + 4E)",
      "RAM": "16GB Unified Memory",
      "Ổ cứng": "512GB SSD siêu tốc",
      "Cổng kết nối": "MagSafe 3, 2x Thunderbolt / USB 4, Jack 3.5mm",
      "Trọng lượng": "1.24 kg"
    }
  },
  {
    id: 3,
    name: "Tai Nghe Chống Ồn Sony WH-1000XM5",
    category: "audio",
    categoryName: "Tai nghe & Loa",
    price: 6990000,
    originalPrice: 8490000,
    discountBadge: "-18%",
    rating: 4.8,
    reviewsCount: 230,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&auto=format&fit=crop"
    ],
    colors: ["Đen Huyền Bí", "Bạc Bạch Kim", "Xanh Midnight"],
    versions: ["Tiêu Chuẩn"],
    desc: "Công nghệ chống ồn đỉnh cao thế giới với 2 bộ xử lý và 8 micro. Màng loa 30mm thiết kế đặc biệt mang lại chất âm Hi-Res Audio chuẩn phòng thu, pin 30 giờ.",
    specs: {
      "Chống ồn": "Active Noise Cancelling (ANC) chủ động",
      "Driver": "30mm màng carbon tổng hợp",
      "Thời lượng pin": "30 giờ (bật ANC), 40 giờ (tắt ANC)",
      "Bluetooth": "5.2, hỗ trợ codec LDAC, AAC, SBC",
      "Trọng lượng": "250g"
    }
  },
  {
    id: 4,
    name: "Đồng Hồ Apple Watch Series 9 GPS 45mm",
    category: "accessory",
    categoryName: "Phụ kiện",
    price: 9490000,
    originalPrice: 10990000,
    discountBadge: "-14%",
    rating: 4.9,
    reviewsCount: 95,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop"
    ],
    colors: ["Midnight", "Starlight", "Pink", "Red"],
    versions: ["Nhôm 45mm GPS", "Nhôm 45mm LTE"],
    desc: "Chip S9 SiP hoàn toàn mới, tính năng chạm hai lần (Double Tap) kỳ diệu điều khiển không chạm. Màn hình sáng gấp đôi 2000 nits, theo dõi sức khỏe và ECG chuyên sâu.",
    specs: {
      "Kích thước": "45mm",
      "Màn hình": "OLED Always-On 2000 nits",
      "Cảm biến": "Nhịp tim, ECG, SpO2, Nhiệt độ cổ tay",
      "Chống nước": "WR50 (50 mét)",
      "Thời lượng pin": "18 giờ (36 giờ chế độ tiết kiệm pin)"
    }
  },
  {
    id: 5,
    name: "iPad Air 11\" M2 Wifi 128GB",
    category: "laptop",
    categoryName: "Laptop & Tablet",
    price: 15490000,
    originalPrice: 16990000,
    discountBadge: "-9%",
    rating: 4.9,
    reviewsCount: 68,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop"
    ],
    colors: ["Xám Không Gian", "Xanh Dương", "Tím", "Ánh Sao"],
    versions: ["128GB Wifi", "256GB Wifi", "512GB Wifi"],
    desc: "Sức mạnh bứt phá từ chip Apple M2. Camera trước góc siêu rộng đặt ở cạnh ngang lý tưởng cho gọi video. Hỗ trợ Apple Pencil Pro và Magic Keyboard.",
    specs: {
      "Màn hình": "11 inch Liquid Retina True Tone",
      "Vi xử lý": "Apple M2 8 nhân",
      "Camera": "12MP Wide sau, 12MP Ultra Wide ngang trước",
      "Cổng sạc": "USB-C chuẩn 3.1 Gen 2",
      "Trọng lượng": "462g"
    }
  },
  {
    id: 6,
    name: "Chuột Không Dây Logitech MX Master 3S",
    category: "accessory",
    categoryName: "Phụ kiện",
    price: 2290000,
    originalPrice: 2690000,
    discountBadge: "-15%",
    rating: 5.0,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop"
    ],
    colors: ["Graphite", "Pale Gray"],
    versions: ["Chuẩn"],
    desc: "Cảm biến 8000 DPI Darkfield di chuyển mượt mà trên mọi bề mặt kể cả mặt kính. Con lăn điện từ MagSpeed cuộn 1000 dòng/giây và nút bấm yên tĩnh 90% Quiet Clicks.",
    specs: {
      "Cảm biến": "Darkfield 8000 DPI",
      "Kết nối": "Bluetooth & USB Logi Bolt",
      "Pin": "Sạc USB-C dùng 70 ngày",
      "Tương thích": "macOS, Windows, iPadOS, Linux"
    }
  },
  {
    id: 7,
    name: "Bàn Phím Cơ Keychron K2 Pro Wireless",
    category: "accessory",
    categoryName: "Phụ kiện",
    price: 2190000,
    originalPrice: 2490000,
    discountBadge: "-12%",
    rating: 4.8,
    reviewsCount: 115,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop"
    ],
    colors: ["Keychron Red Switch", "Keychron Brown Switch", "Keychron Blue Switch"],
    versions: ["Khung Nhôm LED RGB", "Khung Nhựa LED Trắng"],
    desc: "Bàn phím cơ không dây layout 75% gọn gàng hỗ trợ tùy biến QMK/VIA. Kết nối đa thiết bị Bluetooth 5.1 và có dây Type-C, tương thích hoàn hảo cả Mac & Win.",
    specs: {
      "Layout": "75% (84 phím)",
      "Hot-swap": "Có (3-pin & 5-pin)",
      "Pin": "4000 mAh (dùng đến 300 giờ)",
      "Keycap": "PBT Double-shot OSA profile"
    }
  },
  {
    id: 8,
    name: "Loa Bluetooth Di Động Marshall Emberton II",
    category: "audio",
    categoryName: "Tai nghe & Loa",
    price: 3790000,
    originalPrice: 4290000,
    discountBadge: "-11%",
    rating: 4.9,
    reviewsCount: 175,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop"
    ],
    colors: ["Black and Brass", "Cream"],
    versions: ["Tiêu Chuẩn"],
    desc: "Âm thanh đa hướng True Stereophonic 360 độ đặc trưng của Marshall. Kháng bụi nước IP67 bền bỉ, chế độ Stack Mode kết nối nhiều loa cùng lúc, pin 30 giờ.",
    specs: {
      "Công suất": "2x 10W Class D",
      "Kháng nước": "Chuẩn IP67",
      "Thời lượng pin": "30+ giờ chơi nhạc",
      "Trọng lượng": "0.7 kg"
    }
  }
];

// --- 2. GLOBAL STATE ---
let state = {
  activeScreen: 'catalog', // 'catalog' | 'detail' | 'cart'
  selectedProductId: 1,
  selectedColor: '',
  selectedVersion: '',
  detailQuantity: 1,
  
  // Catalog Filters
  activeCategory: 'all',
  searchQuery: '',
  sortMode: 'popular',
  viewMode: 'grid', // 'grid' | 'list'
  
  // Cart & Checkout
  cartItems: [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
      category: "phone",
      price: 28990000,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop",
      color: "Titan Tự Nhiên",
      version: "256GB",
      quantity: 1
    }
  ],
  appliedVoucherCode: null,
  checkoutStep: 1, // 1 | 2 | 3
  
  // Theme
  theme: localStorage.getItem('minishop_theme') || 'light'
};

// --- 3. HELPER FUNCTIONS ---
function formatPrice(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconName = type === 'success' ? 'check-circle-2' : (type === 'error' ? 'alert-circle' : 'info');
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --- 4. ROUTING & SCREEN NAVIGATION ---
function navigateTo(screenId) {
  state.activeScreen = screenId;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  if (screenId === 'catalog') {
    document.getElementById('screenCatalog').classList.add('active');
    document.getElementById('navCatalogBtn').classList.add('active');
  } else if (screenId === 'detail') {
    document.getElementById('screenDetail').classList.add('active');
    renderProductDetail(state.selectedProductId);
  } else if (screenId === 'cart') {
    document.getElementById('screenCart').classList.add('active');
    document.getElementById('navCartBtn').classList.add('active');
    renderCartStep1();
  }

  if (window.lucide) lucide.createIcons();
}

// --- 5. THEME TOGGLE (DARK / LIGHT MODE) ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcons();

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('minishop_theme', state.theme);
      updateThemeIcons();
      showToast(`Đã chuyển sang giao diện ${state.theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}`);
    });
  }
}

function updateThemeIcons() {
  const sunIcon = document.querySelector('.theme-icon-sun');
  const moonIcon = document.querySelector('.theme-icon-moon');
  if (state.theme === 'dark') {
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
  if (window.lucide) lucide.createIcons();
}

// --- 6. MÀN HÌNH 1: PRODUCT CATALOG RENDERER ---
function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  const emptyView = document.getElementById('catalogEmptyState');
  if (!grid) return;

  // Filter
  let list = PRODUCTS_DATA.filter(p => {
    const matchCategory = state.activeCategory === 'all' || p.category === state.activeCategory;
    const matchSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                        p.categoryName.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Sort
  if (state.sortMode === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sortMode === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sortMode === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  // Check empty state
  if (list.length === 0) {
    grid.innerHTML = '';
    emptyView.classList.remove('hidden');
    return;
  } else {
    emptyView.classList.add('hidden');
  }

  grid.className = `products-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;

  grid.innerHTML = list.map(item => `
    <article class="product-card" data-id="${item.id}" data-component="ProductCard">
      <div class="product-card-img-wrap" onclick="viewProductDetail(${item.id})">
        <span class="card-badge ${item.rating >= 4.9 ? 'badge-hot' : ''}">${item.discountBadge}</span>
        <img src="${item.image}" alt="${item.name}" class="product-card-img" loading="lazy">
      </div>
      <div class="product-card-body">
        <span class="card-cat">${item.categoryName}</span>
        <h3 class="card-title" onclick="viewProductDetail(${item.id})">${item.name}</h3>
        <div class="card-rating-row">
          <span class="rating-stars">${'★'.repeat(Math.floor(item.rating))}</span>
          <span class="rating-count">(${item.reviewsCount})</span>
        </div>
        <div class="product-card-footer">
          <div class="price-container">
            <span class="price-main">${formatPrice(item.price)}</span>
            <span class="price-del">${formatPrice(item.originalPrice)}</span>
          </div>
          <button class="btn-card-add" onclick="quickAddToCart(${item.id})" aria-label="Thêm vào giỏ">
            <i data-lucide="plus"></i> Thêm
          </button>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function viewProductDetail(productId) {
  state.selectedProductId = productId;
  navigateTo('detail');
}

function quickAddToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const defaultColor = product.colors[0];
  const defaultVersion = product.versions[0];

  addToCartItem({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image,
    color: defaultColor,
    version: defaultVersion,
    quantity: 1
  });

  showToast(`Đã thêm "${product.name}" vào giỏ hàng! ⚡`);
}

// --- 7. MÀN HÌNH 2: PRODUCT DETAIL RENDERER ---
function renderProductDetail(productId) {
  const p = PRODUCTS_DATA.find(item => item.id === productId) || PRODUCTS_DATA[0];
  
  // Set default selected variants
  state.selectedColor = p.colors[0];
  state.selectedVersion = p.versions[0];
  state.detailQuantity = 1;

  // Elements
  document.getElementById('breadcrumbCategory').textContent = p.categoryName;
  document.getElementById('breadcrumbTitle').textContent = p.name;
  document.getElementById('detailCategory').textContent = p.categoryName.toUpperCase();
  document.getElementById('detailTitle').textContent = p.name;
  document.getElementById('detailBadge').textContent = p.discountBadge;
  document.getElementById('detailMainImg').src = p.image;
  document.getElementById('detailRatingStars').textContent = '★'.repeat(Math.floor(p.rating));
  document.getElementById('detailRatingText').textContent = `${p.rating} (${p.reviewsCount} đánh giá)`;
  document.getElementById('detailCurrentPrice').textContent = formatPrice(p.price);
  document.getElementById('detailOriginalPrice').textContent = formatPrice(p.originalPrice);
  document.getElementById('detailDiscountTag').textContent = `Tiết kiệm ${formatPrice(p.originalPrice - p.price)}`;
  document.getElementById('detailShortDesc').textContent = p.desc;
  document.getElementById('detailQtyInput').value = 1;

  // Thumbs Gallery
  const thumbsContainer = document.getElementById('galleryThumbs');
  thumbsContainer.innerHTML = p.thumbs.map((imgUrl, idx) => `
    <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeDetailMainImg('${imgUrl}', this)">
      <img src="${imgUrl}" alt="Thumbnail ${idx + 1}">
    </div>
  `).join('');

  // Colors
  const colorContainer = document.getElementById('colorOptions');
  document.getElementById('selectedColorName').textContent = state.selectedColor;
  colorContainer.innerHTML = p.colors.map((c, idx) => `
    <button class="variant-pill ${idx === 0 ? 'active' : ''}" onclick="selectProductColor('${c}', this)">
      ${c}
    </button>
  `).join('');

  // Versions
  const versionContainer = document.getElementById('versionOptions');
  document.getElementById('selectedVersionName').textContent = state.selectedVersion;
  versionContainer.innerHTML = p.versions.map((v, idx) => `
    <button class="variant-pill ${idx === 0 ? 'active' : ''}" onclick="selectProductVersion('${v}', this)">
      ${v}
    </button>
  `).join('');

  // Specs Tab Content
  renderDetailTabContent('specs', p);

  // Related Products
  const relatedContainer = document.getElementById('relatedGrid');
  const relatedList = PRODUCTS_DATA.filter(item => item.id !== p.id && (item.category === p.category || item.rating >= 4.9)).slice(0, 3);
  relatedContainer.innerHTML = relatedList.map(item => `
    <article class="product-card" data-id="${item.id}">
      <div class="product-card-img-wrap" onclick="viewProductDetail(${item.id})">
        <span class="card-badge">${item.discountBadge}</span>
        <img src="${item.image}" alt="${item.name}" class="product-card-img" loading="lazy">
      </div>
      <div class="product-card-body">
        <span class="card-cat">${item.categoryName}</span>
        <h4 class="card-title" onclick="viewProductDetail(${item.id})">${item.name}</h4>
        <div class="product-card-footer">
          <span class="price-main">${formatPrice(item.price)}</span>
          <button class="btn-card-add" onclick="quickAddToCart(${item.id})">+ Thêm</button>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function changeDetailMainImg(url, thumbEl) {
  document.getElementById('detailMainImg').src = url;
  document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

function selectProductColor(colorName, btnEl) {
  state.selectedColor = colorName;
  document.getElementById('selectedColorName').textContent = colorName;
  document.querySelectorAll('#colorOptions .variant-pill').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function selectProductVersion(versionName, btnEl) {
  state.selectedVersion = versionName;
  document.getElementById('selectedVersionName').textContent = versionName;
  document.querySelectorAll('#versionOptions .variant-pill').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function renderDetailTabContent(tabName, product) {
  const tabContent = document.getElementById('tabContent');
  if (tabName === 'specs') {
    tabContent.innerHTML = `
      <table class="specs-table">
        <tbody>
          ${Object.entries(product.specs).map(([key, val]) => `
            <tr>
              <td style="font-weight: 600; width: 35%; color: var(--text-main);">${key}</td>
              <td>${val}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (tabName === 'desc') {
    tabContent.innerHTML = `
      <p style="margin-bottom: 12px;">${product.desc}</p>
      <p>Sản phẩm được bảo hành chính hãng 12 tháng tại các trung tâm bảo hành ủy quyền trên toàn quốc. Hỗ trợ 1 đổi 1 trong vòng 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.</p>
    `;
  } else if (tabName === 'reviews') {
    tabContent.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 20px; background: var(--bg-surface-secondary); padding: 20px; border-radius: 12px;">
        <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${product.rating}</div>
        <div>
          <div style="color: var(--accent); font-size: 1.2rem;">★★★★★</div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">Dựa trên ${product.reviewsCount} lượt mua hàng và đánh giá thực tế</div>
        </div>
      </div>
      <p><em>"Sản phẩm dùng rất thích, đóng gói cẩn thận nguyên seal, giao hàng nhanh chóng chỉ trong 2 tiếng!"</em> - <strong>Minh Hoàng</strong> ⭐⭐⭐⭐⭐</p>
    `;
  }
}

// --- 8. MÀN HÌNH 3: CART & CHECKOUT RENDERER ---
function addToCartItem(newItem) {
  const existing = state.cartItems.find(i => 
    i.id === newItem.id && i.color === newItem.color && i.version === newItem.version
  );

  if (existing) {
    existing.quantity += newItem.quantity;
  } else {
    state.cartItems.push(newItem);
  }

  updateCartBadge();
}

function updateCartBadge() {
  const totalQty = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.getElementById('cartCountBadge');
  const headerBadge = document.getElementById('cartHeaderQty');
  if (badge) badge.textContent = totalQty;
  if (headerBadge) headerBadge.textContent = totalQty;
}

function renderCartStep1() {
  const listContainer = document.getElementById('cartItemsList');
  const emptyView = document.getElementById('cartEmptyView');
  const summaryBox = document.getElementById('cartSummaryBox');
  const btnClear = document.getElementById('btnClearCart');

  // Set active checkout step node
  setCheckoutStep(1);

  if (state.cartItems.length === 0) {
    listContainer.innerHTML = '';
    emptyView.classList.remove('hidden');
    summaryBox.classList.add('hidden');
    btnClear.classList.add('hidden');
    return;
  }

  emptyView.classList.add('hidden');
  summaryBox.classList.remove('hidden');
  btnClear.classList.remove('hidden');

  // Render items
  listContainer.innerHTML = state.cartItems.map((item, idx) => `
    <div class="cart-item-row" data-idx="${idx}">
      <img src="${item.image}" alt="${item.name}" class="cart-row-img">
      <div class="cart-row-info">
        <h4 class="cart-row-title">${item.name}</h4>
        <div class="cart-row-variant">Phân loại: ${item.color} • ${item.version}</div>
        <div class="cart-row-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-row-actions">
        <div class="qty-selector">
          <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
          <input type="number" value="${item.quantity}" readonly>
          <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
        </div>
        <button class="btn-icon btn-remove-cart" onclick="removeCartItem(${idx})" title="Xóa">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  `).join('');

  updateCartSummaryDisplay();
  if (window.lucide) lucide.createIcons();
}

function updateCartItemQty(index, delta) {
  if (!state.cartItems[index]) return;
  state.cartItems[index].quantity += delta;
  if (state.cartItems[index].quantity <= 0) {
    state.cartItems.splice(index, 1);
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
  }
  updateCartBadge();
  renderCartStep1();
}

function removeCartItem(index) {
  state.cartItems.splice(index, 1);
  showToast('Đã xóa món khỏi giỏ hàng.');
  updateCartBadge();
  renderCartStep1();
}

function updateCartSummaryDisplay() {
  // Use pure function from cart.js
  const summary = calculateCartSummary(state.cartItems, state.appliedVoucherCode);

  document.getElementById('summaryTotalItems').textContent = state.cartItems.reduce((s, i) => s + i.quantity, 0);
  document.getElementById('summarySubtotal').textContent = formatPrice(summary.subtotal);
  document.getElementById('summaryDiscount').textContent = `-${formatPrice(summary.discount)}`;
  document.getElementById('summaryShipping').textContent = summary.shippingFee === 0 ? 'Miễn phí (0₫)' : formatPrice(summary.shippingFee);
  document.getElementById('summaryFinalTotal').textContent = formatPrice(summary.finalTotal);

  const feedback = document.getElementById('voucherFeedback');
  if (summary.voucherApplied) {
    feedback.className = 'voucher-msg text-success';
    feedback.textContent = `✅ ${summary.voucherApplied.desc}`;
  } else if (summary.error) {
    feedback.className = 'voucher-msg text-danger';
    feedback.textContent = `❌ ${summary.error}`;
  } else {
    feedback.textContent = '';
  }
}

function setCheckoutStep(stepNumber) {
  state.checkoutStep = stepNumber;
  document.getElementById('stepNode1').className = `step-node ${stepNumber >= 1 ? 'active' : ''}`;
  document.getElementById('stepLine1').className = `step-line ${stepNumber >= 2 ? 'active' : ''}`;
  document.getElementById('stepNode2').className = `step-node ${stepNumber >= 2 ? 'active' : ''}`;
  document.getElementById('stepLine2').className = `step-line ${stepNumber >= 3 ? 'active' : ''}`;
  document.getElementById('stepNode3').className = `step-node ${stepNumber >= 3 ? 'active' : ''}`;

  document.getElementById('cartStep1').className = `checkout-step-content ${stepNumber === 1 ? 'active' : 'hidden'}`;
  document.getElementById('cartStep2').className = `checkout-step-content ${stepNumber === 2 ? 'active' : 'hidden'}`;
}

// Render Step 2 (Form & Mini items)
function renderCartStep2() {
  setCheckoutStep(2);
  const summary = calculateCartSummary(state.cartItems, state.appliedVoucherCode);
  document.getElementById('checkoutFinalTotal').textContent = formatPrice(summary.finalTotal);

  const miniContainer = document.getElementById('checkoutMiniItems');
  miniContainer.innerHTML = state.cartItems.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
      <span>${item.name} <strong>x${item.quantity}</strong></span>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');
}

// --- 9. EVENT LISTENERS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCatalog();
  updateCartBadge();

  // Navigation clicks
  document.getElementById('navCatalogBtn').addEventListener('click', () => navigateTo('catalog'));
  document.getElementById('navCartBtn').addEventListener('click', () => navigateTo('cart'));
  document.getElementById('logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('catalog');
  });
  document.getElementById('detailBackLink').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('catalog');
  });
  document.getElementById('btnContinueShopping').addEventListener('click', () => navigateTo('catalog'));

  // Search input
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.classList.toggle('hidden', state.searchQuery === '');
    renderCatalog();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderCatalog();
  });
  document.getElementById('btnResetSearch').addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    state.activeCategory = 'all';
    document.querySelectorAll('.pill-btn').forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    renderCatalog();
  });

  // Category Filter Pills
  document.querySelectorAll('.pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category;
      renderCatalog();
    });
  });

  // Sort Select
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sortMode = e.target.value;
    renderCatalog();
  });

  // Grid / List View Toggle
  document.getElementById('viewGridBtn').addEventListener('click', () => {
    state.viewMode = 'grid';
    document.getElementById('viewGridBtn').classList.add('active');
    document.getElementById('viewListBtn').classList.remove('active');
    renderCatalog();
  });
  document.getElementById('viewListBtn').addEventListener('click', () => {
    state.viewMode = 'list';
    document.getElementById('viewListBtn').classList.add('active');
    document.getElementById('viewGridBtn').classList.remove('active');
    renderCatalog();
  });

  // Detail Quantity Controls
  document.getElementById('btnQtyMinus').addEventListener('click', () => {
    const input = document.getElementById('detailQtyInput');
    let val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
    state.detailQuantity = parseInt(input.value);
  });
  document.getElementById('btnQtyPlus').addEventListener('click', () => {
    const input = document.getElementById('detailQtyInput');
    let val = parseInt(input.value) || 1;
    input.value = val + 1;
    state.detailQuantity = parseInt(input.value);
  });

  // Detail Add To Cart
  document.getElementById('btnAddToCartDetail').addEventListener('click', () => {
    const p = PRODUCTS_DATA.find(item => item.id === state.selectedProductId);
    if (!p) return;

    addToCartItem({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      color: state.selectedColor,
      version: state.selectedVersion,
      quantity: state.detailQuantity
    });

    showToast(`Đã thêm ${state.detailQuantity}x "${p.name}" vào giỏ! ⚡`);
  });

  // Detail Buy Now
  document.getElementById('btnBuyNowDetail').addEventListener('click', () => {
    const p = PRODUCTS_DATA.find(item => item.id === state.selectedProductId);
    if (!p) return;

    addToCartItem({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      color: state.selectedColor,
      version: state.selectedVersion,
      quantity: state.detailQuantity
    });

    navigateTo('cart');
  });

  // Detail Tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const p = PRODUCTS_DATA.find(item => item.id === state.selectedProductId);
      renderDetailTabContent(tab.dataset.tab, p);
    });
  });

  // Cart Step 1 Actions
  document.getElementById('btnClearCart').addEventListener('click', () => {
    state.cartItems = [];
    state.appliedVoucherCode = null;
    updateCartBadge();
    renderCartStep1();
    showToast('Đã làm trống giỏ hàng.');
  });

  document.getElementById('btnApplyVoucher').addEventListener('click', () => {
    const code = document.getElementById('voucherInput').value.trim();
    if (!code) return;
    state.appliedVoucherCode = code;
    updateCartSummaryDisplay();
  });

  document.getElementById('btnProceedToCheckout').addEventListener('click', () => {
    if (state.cartItems.length === 0) {
      showToast('Giỏ hàng đang trống!', 'error');
      return;
    }
    renderCartStep2();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('btnBackToCart').addEventListener('click', () => {
    setCheckoutStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Checkout Form Submission (Step 2 -> Step 3)
  const checkoutForm = document.getElementById('checkoutForm');
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name = document.getElementById('custName');
    const phone = document.getElementById('custPhone');
    const address = document.getElementById('custAddress');

    const errName = document.getElementById('errCustName');
    const errPhone = document.getElementById('errCustPhone');
    const errAddress = document.getElementById('errCustAddress');

    errName.textContent = '';
    errPhone.textContent = '';
    errAddress.textContent = '';

    if (!name.value.trim() || name.value.trim().length < 2) {
      errName.textContent = 'Vui lòng nhập họ tên người nhận (tối thiểu 2 ký tự)';
      isValid = false;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.value.trim())) {
      errPhone.textContent = 'Số điện thoại không hợp lệ (Ví dụ: 0912345678)';
      isValid = false;
    }

    if (!address.value.trim() || address.value.trim().length < 8) {
      errAddress.textContent = 'Vui lòng nhập địa chỉ nhận hàng chi tiết';
      isValid = false;
    }

    if (!isValid) return;

    // Generate Order Receipt
    const orderCode = 'MS-' + Math.floor(100000 + Math.random() * 900000);
    const summary = calculateCartSummary(state.cartItems, state.appliedVoucherCode);
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

    document.getElementById('successCustName').textContent = name.value.trim();
    document.getElementById('orderReceiptBox').innerHTML = `
      <div class="receipt-row">
        <span>Mã đơn hàng:</span>
        <strong class="receipt-code">${orderCode}</strong>
      </div>
      <div class="receipt-row">
        <span>Người nhận:</span>
        <strong>${name.value.trim()} (${phone.value.trim()})</strong>
      </div>
      <div class="receipt-row">
        <span>Địa chỉ giao hàng:</span>
        <span>${address.value.trim()}</span>
      </div>
      <div class="receipt-row">
        <span>Phương thức:</span>
        <span>${payMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản QR'}</span>
      </div>
      <div class="receipt-row" style="border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 6px;">
        <span>Tổng thanh toán:</span>
        <strong style="color: var(--primary); font-size: 1.1rem;">${formatPrice(summary.finalTotal)}</strong>
      </div>
    `;

    // Show Success Modal
    setCheckoutStep(3);
    document.getElementById('orderSuccessModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Clear cart
    state.cartItems = [];
    state.appliedVoucherCode = null;
    updateCartBadge();
    checkoutForm.reset();
  });

  // Close Success Modal
  document.getElementById('btnFinishOrder').addEventListener('click', () => {
    document.getElementById('orderSuccessModal').classList.add('hidden');
    document.body.style.overflow = '';
    navigateTo('catalog');
  });

  // --- 10. SIMULATE STATES (PROMPT 11 COMPLIANCE) ---
  // Loading Skeleton simulation
  document.getElementById('btnSimulateLoading').addEventListener('click', () => {
    const skeleton = document.getElementById('catalogSkeleton');
    const grid = document.getElementById('productsGrid');
    skeleton.classList.remove('hidden');
    grid.classList.add('hidden');
    navigateTo('catalog');
    showToast('⏳ Đang giả lập trạng thái Loading Skeleton (2 giây)...', 'info');

    setTimeout(() => {
      skeleton.classList.add('hidden');
      grid.classList.remove('hidden');
      renderCatalog();
    }, 2000);
  });

  // Error State simulation
  document.getElementById('btnSimulateError').addEventListener('click', () => {
    document.getElementById('errorStateView').classList.remove('hidden');
    document.getElementById('screenCatalog').classList.add('hidden');
    document.getElementById('screenDetail').classList.add('hidden');
    document.getElementById('screenCart').classList.add('hidden');
    showToast('⚠️ Đang hiển thị trạng thái Báo lỗi kết nối API!', 'error');
  });

  document.getElementById('btnRetryLoad').addEventListener('click', () => {
    document.getElementById('errorStateView').classList.add('hidden');
    navigateTo('catalog');
    showToast('✅ Đã kết nối lại thành công!');
  });

  document.getElementById('btnDismissError').addEventListener('click', () => {
    document.getElementById('errorStateView').classList.add('hidden');
    navigateTo('catalog');
  });

  // Footer Category links
  document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      state.activeCategory = link.dataset.cat;
      document.querySelectorAll('.pill-btn').forEach(p => p.classList.toggle('active', p.dataset.category === state.activeCategory));
      navigateTo('catalog');
    });
  });
});
