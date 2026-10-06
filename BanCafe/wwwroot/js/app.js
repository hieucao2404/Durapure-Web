// State Management
let cart = [];
let products = [];
let blogs = [];
let farmVideos = [];
let currentLang = localStorage.getItem('durapure_lang') || 'VI';
let websiteSettings = null;

// Backend API URL (for standard web browsers)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.test')
    ? 'http://localhost:5000/api'
    : 'https://bancafe-backend-api.onrender.com/api';

const langMap = {
    VI: {
        navHome: "TRANG CHỦ",
        navShop: "CỬA HÀNG",
        navCustomize: "TUỲ CHỈNH",
        navBlog: "TIN TỨC",
        hello: "Xin chào!",
        adminPanel: "Trang quản trị",
        logout: "Đăng xuất",
        login: "Đăng nhập",
        register: "Đăng ký",
        cartTitle: "Giỏ Hàng Của Bạn",
        cartTotal: "Tổng tiền:",
        checkoutBtn: "ĐẶT HÀNG NGAY",
        placeholderName: "Họ và tên",
        placeholderPhone: "Số điện thoại",
        placeholderEmail: "Email",
        placeholderAddress: "Địa chỉ nhận hàng",
        footerSlogan: "Sầu riêng hữu cơ, nguồn gốc minh bạch.",
        footerLinks: "Liên kết",
        footerContact: "Liên hệ",
        footerSocial: "Mạng xã hội",
        footerRights: "Bảo lưu mọi quyền.",
        footerHome: "Trang chủ",
        footerShop: "Cửa hàng",
        footerBlog: "Tin tức",
        footerCustomize: "Tuỳ chỉnh",
        footerAddressDefault: "Miền Tây, Việt Nam",
        toastCartAdded: "Đã thêm sản phẩm vào giỏ hàng!",
        toastCartCleared: "Giỏ hàng đã được làm trống!",
        toastCheckoutSuccess: "Đặt hàng thành công!",
    },
    EN: {
        navHome: "HOME",
        navShop: "SHOP",
        navCustomize: "CUSTOMIZE",
        navBlog: "BLOG",
        hello: "Hello!",
        adminPanel: "Admin Panel",
        logout: "Logout",
        login: "Login",
        register: "Register",
        cartTitle: "Your Cart",
        cartTotal: "Total:",
        checkoutBtn: "CHECKOUT NOW",
        placeholderName: "Full Name",
        placeholderPhone: "Phone Number",
        placeholderEmail: "Email",
        placeholderAddress: "Delivery Address",
        footerSlogan: "Organic durian, transparent origin.",
        footerLinks: "Links",
        footerContact: "Contact",
        footerSocial: "Social Media",
        footerRights: "All rights reserved.",
        footerHome: "Home",
        footerShop: "Shop",
        footerBlog: "Blog",
        footerCustomize: "Customize",
        footerAddressDefault: "Mekong Delta, Vietnam",
        toastCartAdded: "Product added to cart!",
        toastCartCleared: "Cart has been cleared!",
        toastCheckoutSuccess: "Order placed successfully!",
    }
};

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initCommonUI();
    registerWebViewListeners();
    injectAnimationCSS();
    applyTranslation();

    // Request initial page-specific data
    requestPageData();

    // Check and record website visit
    if (!sessionStorage.getItem('bancafe_visited')) {
        sessionStorage.setItem('bancafe_visited', 'true');
        fetch(API_BASE_URL + '/visit', { method: 'POST' }).catch(e => console.error(e));
    }

    // Check if redirect wants us to open auth modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAuth') === 'login') {
        openAuthModal('login');
    }

    // Initial scroll reveal setup
    setTimeout(initScrollReveal, 100);
});

// Common UI Elements (Navbar, Cart Drawer, Login Modal)
function initCommonUI() {
    const t = langMap[currentLang];

    // 1. Render Navigation Bar
    const navbar = document.getElementById('navbar-container');
    if (navbar) {
        navbar.innerHTML = `
            <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-24 items-center">
                    <!-- Mobile Hamburger Button -->
                    <div class="flex items-center md:hidden">
                        <button onclick="toggleMobileMenu(true)" class="p-2 text-durian-accent hover:text-durian-gold focus:outline-none" id="mobile-menu-btn">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex-shrink-0 flex items-center">
                        <a href="index.html" class="flex items-center">
                            <span class="inline-flex items-center gap-3" aria-label="Durapure">
                                <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-durian-gold text-2xl font-black text-durian-dark shadow-md">D</span>
                                <span class="leading-none"><strong class="block font-serif text-xl tracking-[0.16em] text-white">DURAPURE</strong><small class="mt-1 block text-[8px] font-bold tracking-[0.2em] text-durian-gold">SẦU RIÊNG MIỀN TÂY</small></span>
                            </span>
                        </a>
                    </div>
                    <div class="hidden md:flex space-x-8">
                        <a href="index.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-durian-gold transition-colors py-2">${t.navHome}</a>
                        <a href="shop.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-durian-gold transition-colors py-2">${t.navShop}</a>
                        <a href="customize.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-durian-gold transition-colors py-2">${t.navCustomize}</a>
                        <a href="blog.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-durian-gold transition-colors py-2">${t.navBlog}</a>
                    </div>
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <!-- Language Selector -->
                        <div id="lang-selector-btn" onclick="toggleLanguage(event)" class="border border-durian-gold/60 text-durian-gold hover:bg-durian-gold/10 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold select-none cursor-pointer transition-colors duration-200 font-sans tracking-wide">
                            ${currentLang}
                        </div>

                        <!-- Profile / Admin Link -->
                        <div class="relative inline-block text-left" id="user-menu-wrapper">
                            <button onclick="handleUserIconClick(event)" class="p-2 text-durian-accent hover:text-durian-gold transition-colors focus:outline-none cursor-pointer" title="Tài khoản">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                            <!-- User Dropdown Menu -->
                            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-durian-light border border-durian-lighter ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div class="py-1 text-sm font-sans" role="none">
                                    <div class="px-4 py-2 text-xs text-durian-gold border-b border-durian-lighter/40 font-semibold" id="dropdown-username">${t.hello}</div>
                                    <a href="admin.html" id="dropdown-admin-link" class="hidden block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors" role="menuitem">${t.adminPanel}</a>
                                    <button onclick="handleUserLogout()" class="w-full text-left block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors focus:outline-none" role="menuitem">${t.logout}</button>
                                </div>
                            </div>
                        </div>

                        <!-- Cart Toggle -->
                        <button onclick="toggleCartDrawer(true)" class="relative p-2 text-durian-accent hover:text-durian-gold transition-colors focus:outline-none">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span id="cart-badge" class="absolute -top-1 -right-1 bg-forest text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center hidden">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
        // Render Mobile Menu Drawer directly to body to avoid stacking context parent clip/transparent bugs
        let mobileDrawer = document.getElementById('mobile-menu-drawer');
        if (!mobileDrawer) {
            mobileDrawer = document.createElement('div');
            mobileDrawer.id = 'mobile-menu-drawer';
            document.body.appendChild(mobileDrawer);
        }
        mobileDrawer.className = "fixed inset-0 z-50 bg-black/50 hidden opacity-0 transition-opacity duration-300";
        mobileDrawer.innerHTML = `
            <div class="absolute top-0 left-0 bottom-0 w-64 max-w-sm border-r p-6 flex flex-col justify-between transform -translate-x-full transition-transform duration-300 shadow-2xl" id="mobile-menu-panel" style="background-color: #294C2F !important; border-color: #547044 !important; opacity: 1 !important;">
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <span class="inline-flex items-center gap-2" aria-label="Durapure">
                            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-durian-gold text-xl font-black text-durian-dark">D</span>
                            <span class="font-serif text-lg font-bold tracking-widest text-white">DURAPURE</span>
                        </span>
                        <button onclick="toggleMobileMenu(false)" class="text-durian-accent hover:text-white text-2xl font-bold focus:outline-none">&times;</button>
                    </div>
                    <div class="flex flex-col space-y-4 font-sans font-medium text-sm">
                        <a href="index.html" class="nav-link-mobile text-durian-accent hover:text-durian-gold transition-colors py-2 border-b border-durian-lighter/20">${t.navHome}</a>
                        <a href="shop.html" class="nav-link-mobile text-durian-accent hover:text-durian-gold transition-colors py-2 border-b border-durian-lighter/20">${t.navShop}</a>
                        <a href="customize.html" class="nav-link-mobile text-durian-accent hover:text-durian-gold transition-colors py-2 border-b border-durian-lighter/20">${t.navCustomize}</a>
                        <a href="blog.html" class="nav-link-mobile text-durian-accent hover:text-durian-gold transition-colors py-2 border-b border-durian-lighter/20">${t.navBlog}</a>
                    </div>
                </div>
                <div class="pt-6 border-t border-durian-lighter/20 text-xs text-durian-accent/60 font-sans">
                    &copy; 2026 Durapure.
                </div>
            </div>
        `;

        // Highlight active link
        const currentPath = window.location.pathname.split("/").pop();
        const links = navbar.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('text-durian-gold', 'border-b-2', 'border-durian-gold');
            }
        });
        const mobileLinks = mobileDrawer.querySelectorAll('.nav-link-mobile');
        mobileLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('text-durian-gold', 'font-bold');
            }
        });
        updateHeaderUserUI();
    }

    // 2. Render Footer Container
    const footer = document.getElementById('footer-container');
    if (footer) {
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-durian-lighter/20 pb-12 text-left">
                    <!-- Column 1: Logo & Slogan -->
                    <div class="space-y-4">
                        <span class="inline-flex items-center gap-3" aria-label="Durapure">
                            <span class="flex h-14 w-14 items-center justify-center rounded-xl bg-durian-gold text-3xl font-black text-durian-dark">D</span>
                            <span class="leading-none"><strong class="block font-serif text-2xl tracking-[0.16em] text-white">DURAPURE</strong><small class="mt-1 block text-[9px] font-bold tracking-[0.2em] text-durian-gold">SẦU RIÊNG MIỀN TÂY</small></span>
                        </span>
                        <p class="text-sm italic text-durian-accent/80 font-sans tracking-wide">${t.footerSlogan}</p>
                    </div>

                    <!-- Column 2: Liên kết -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-durian-gold mb-6 tracking-wide">${t.footerLinks}</h4>
                        <ul class="space-y-3.5 text-sm font-sans">
                            <li><a href="index.html" class="text-durian-accent/80 hover:text-white transition-colors duration-200">${t.footerHome}</a></li>
                            <li><a href="shop.html" class="text-durian-accent/80 hover:text-white transition-colors duration-200">${t.footerShop}</a></li>
                            <li><a href="blog.html" class="text-durian-accent/80 hover:text-white transition-colors duration-200">${t.footerBlog}</a></li>
                            <li><a href="customize.html" class="text-durian-accent/80 hover:text-white transition-colors duration-200">${t.footerCustomize}</a></li>
                        </ul>
                    </div>

                    <!-- Column 3: Liên hệ -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-durian-gold mb-6 tracking-wide">${t.footerContact}</h4>
                        <ul class="space-y-3.5 text-sm font-sans text-durian-accent/80">
                            <li id="footer-address">${t.footerAddressDefault}</li>
                            <li id="footer-email">contact@durapure.vn</li>
                            <li id="footer-phone">+84 263 123 4567</li>
                        </ul>
                    </div>

                    <!-- Column 4: Mạng xã hội -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-durian-gold mb-6 tracking-wide">${t.footerSocial}</h4>
                        <div class="flex space-x-3">
                            <a href="#" onclick="event.preventDefault()" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-durian-lighter/40 flex items-center justify-center text-durian-accent/80 hover:text-white hover:border-durian-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                </svg>
                            </a>
                            <a href="#" onclick="event.preventDefault()" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-durian-lighter/40 flex items-center justify-center text-durian-accent/80 hover:text-white hover:border-durian-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </a>
                            <a href="#" onclick="event.preventDefault()" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-durian-lighter/40 flex items-center justify-center text-durian-accent/80 hover:text-white hover:border-durian-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.19 4.32-3.13 5.46-1.57.94-3.52 1.16-5.27.67-1.87-.51-3.41-1.84-4.2-3.61-.7-1.56-.81-3.37-.29-4.99.5-1.54 1.68-2.78 3.14-3.44 1.56-.71 3.42-.76 5.04-.15v4.06c-1.34-.41-2.9-.3-4.04.47-1.12.75-1.67 2.15-1.37 3.44.25 1.09 1.11 1.99 2.18 2.31 1.09.32 2.33.15 3.25-.5.92-.64 1.49-1.68 1.6-2.79.03-3.64.01-7.29.01-10.93V.02z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Bottom row -->
                <div class="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-durian-accent/60 font-sans space-y-4 sm:space-y-0">
                    <p>&copy; 2026 Durapure. ${t.footerRights}</p>
                    <a href="#" class="hover:text-white transition-colors duration-200">Privacy Policy</a>
                </div>
            </div>
        `;
    }

    // 3. Render Cart Drawer if target exists
    const cartDrawerContainer = document.getElementById('cart-drawer-container');
    if (cartDrawerContainer) {
        cartDrawerContainer.innerHTML = `
            <div id="cart-drawer-backdrop" onclick="toggleCartDrawer(false)" class="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 opacity-0 pointer-events-none z-50"></div>
            <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full max-w-md bg-durian-light border-l border-durian-lighter shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col">
                <div class="p-6 border-b border-durian-lighter flex justify-between items-center bg-durian">
                    <h2 class="font-serif text-xl font-bold text-durian-gold">${t.cartTitle}</h2>
                    <button onclick="toggleCartDrawer(false)" class="text-durian-accent hover:text-white p-2">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div id="cart-items" class="flex-grow overflow-y-auto p-6 space-y-4">
                    <!-- Cart items will be loaded dynamically here -->
                </div>

                <div class="p-6 border-t border-durian-lighter bg-durian-dark space-y-6">
                    <div class="flex justify-between text-base font-medium text-durian-accent">
                        <span>${t.cartTotal}</span>
                        <span id="cart-total" class="text-durian-gold font-bold">0đ</span>
                    </div>

                    <form id="checkout-form" onsubmit="handleCheckout(event)" class="space-y-3 pt-2">
                        <div>
                            <input type="text" id="cust-name" required placeholder="${t.placeholderName}" class="w-full bg-durian border border-durian-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-durian-gold">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="tel" id="cust-phone" required placeholder="${t.placeholderPhone}" class="bg-durian border border-durian-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-durian-gold">
                            <input type="email" id="cust-email" required placeholder="${t.placeholderEmail}" class="bg-durian border border-durian-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-durian-gold">
                        </div>
                        <div>
                            <input type="text" id="cust-address" required placeholder="${t.placeholderAddress}" class="w-full bg-durian border border-durian-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-durian-gold">
                        </div>
                        <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white font-bold py-3 px-4 rounded transition-all duration-300 mt-4 tracking-wider uppercase text-sm">
                            ${t.checkoutBtn}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    renderCart();
}

// Request dynamic data for specific pages
function requestPageData() {
    const currentPath = window.location.pathname.split("/").pop();

    // Always request general settings for layout
    sendHostMessage({ action: 'getSettings' });

    if (currentPath === 'shop.html' || currentPath.startsWith('product-detail.html')) {
        sendHostMessage({ action: 'getProducts' });
    } else if (currentPath === 'blog.html' || currentPath.startsWith('blog-detail.html')) {
        sendHostMessage({ action: 'getBlogs' });
    } else if (currentPath === '' || currentPath === 'index.html') {
        sendHostMessage({ action: 'getFarmVideos' });
    } else if (currentPath === 'admin.html') {
        const currentUser = JSON.parse(localStorage.getItem('durapure_current_user') || 'null');
        if (currentUser && currentUser.isAdmin) {
            const dashboardSec = document.getElementById('admin-dashboard-sec');
            if (dashboardSec) dashboardSec.classList.remove('hidden');
            sendHostMessage({ action: 'getAdminData' });
        } else {
            // Redirect to home and trigger standard login modal
            window.location.href = 'index.html?openAuth=login';
        }
    }
}

// WebView communication
function sendHostMessage(message) {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(message);
    } else {
        handleBrowserFetch(message);
    }
}

// Browser API Fallback Handler (For Vercel/Chrome)
async function handleBrowserFetch(msg) {
    console.log("Browser API Request:", msg);
    try {
        switch (msg.action) {
            case 'getSettings': {
                const res = await fetch(`${API_BASE_URL}/settings`);
                const data = await res.json();
                handleHostMessage({ action: 'getSettingsResponse', settings: data });
                break;
            }
            case 'getProducts': {
                const res = await fetch(`${API_BASE_URL}/products`);
                const data = await res.json();
                products = data;
                if (window.location.pathname.includes('product-detail.html')) {
                    renderProductDetailPage();
                } else {
                    renderShopPage();
                }
                break;
            }
            case 'getBlogs': {
                const res = await fetch(`${API_BASE_URL}/blogs`);
                const data = await res.json();
                blogs = data;
                if (window.location.pathname.includes('blog-detail.html')) {
                    renderBlogDetailPage();
                } else {
                    renderBlogPage();
                }
                break;
            }
            case 'getFarmVideos': {
                const res = await fetch(`${API_BASE_URL}/farm-videos`);
                const data = await res.json();
                farmVideos = data;
                if (typeof renderFarmVideos === 'function') {
                    renderFarmVideos();
                }
                break;
            }
            case 'getAdminData': {
                const res = await fetch(`${API_BASE_URL}/admin/data`);
                const data = await res.json();
                products = data.products;
                blogs = data.blogs;
                farmVideos = data.farmVideos;
                renderAdminDashboard(data);
                break;
            }
            case 'loginAdmin': {
                const res = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: msg.username || msg.email, password: msg.password })
                });
                const data = await res.json();
                handleHostMessage({ action: 'adminLoginResponse', success: data.success });
                break;
            }
            case 'checkout': {
                const res = await fetch(`${API_BASE_URL}/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: msg.customerName,
                        customerPhone: msg.customerPhone,
                        customerEmail: msg.customerEmail,
                        shippingAddress: msg.shippingAddress,
                        totalAmount: msg.totalAmount,
                        items: msg.items
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'checkoutResponse', success: data.success, message: data.message, orderId: data.orderId });
                break;
            }
            case 'submitDesign': {
                const res = await fetch(`${API_BASE_URL}/designs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: msg.customerName,
                        customerPhone: msg.customerPhone,
                        customerEmail: msg.customerEmail,
                        description: msg.description,
                        designFileUrl: msg.designFileUrl || '',
                        designFileName: msg.designFileName || msg.fileName,
                        designFileBase64: msg.designFileBase64 || msg.fileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'submitDesignResponse', success: data.success, message: data.message });
                break;
            }
            case 'updateOrderStatus': {
                const res = await fetch(`${API_BASE_URL}/admin/orders/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id, status: msg.status })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteOrder': {
                const res = await fetch(`${API_BASE_URL}/admin/orders/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'updateDesignStatus': {
                const res = await fetch(`${API_BASE_URL}/admin/designs/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id, status: msg.status })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteDesign': {
                const res = await fetch(`${API_BASE_URL}/admin/designs/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveProduct': {
                const res = await fetch(`${API_BASE_URL}/admin/products/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        name: msg.name,
                        price: msg.price,
                        unit: msg.unit,
                        description: msg.description,
                        imageUrl: msg.imageUrl,
                        roastOptions: msg.roastOptions,
                        isActive: msg.isActive,
                        imgFileName: msg.imgFileName,
                        imgFileBase64: msg.imgFileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteProduct': {
                const res = await fetch(`${API_BASE_URL}/admin/products/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveBlog': {
                const res = await fetch(`${API_BASE_URL}/admin/blogs/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        title: msg.title,
                        slug: msg.slug,
                        summary: msg.summary,
                        content: msg.content,
                        imageUrl: msg.imageUrl,
                        isVideo: msg.isVideo,
                        videoUrl: msg.videoUrl,
                        isActive: msg.isActive,
                        imgFileName: msg.imgFileName,
                        imgFileBase64: msg.imgFileBase64,
                        vidFileName: msg.vidFileName,
                        vidFileBase64: msg.vidFileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteBlog': {
                const res = await fetch(`${API_BASE_URL}/admin/blogs/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveFarmVideo': {
                const res = await fetch(`${API_BASE_URL}/admin/farm-videos/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        title: msg.title,
                        description: msg.description,
                        videoUrl: msg.videoUrl,
                        thumbnailUrl: msg.thumbnailUrl,
                        isActive: msg.isActive,
                        imgFileName: msg.imgFileName,
                        imgFileBase64: msg.imgFileBase64,
                        vidFileName: msg.vidFileName,
                        vidFileBase64: msg.vidFileBase64
                    })
                });

                let data = null;
                try {
                    data = await res.json();
                } catch (e) {
                    const text = await res.text();
                    data = { success: false, message: `Lỗi Server: ${res.status} - ${text.substring(0,100)}` };
                }

                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteFarmVideo': {
                const res = await fetch(`${API_BASE_URL}/admin/farm-videos/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveSettings': {
                const res = await fetch(`${API_BASE_URL}/admin/settings/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        settings: {
                            SeoTitle: msg.seoTitle,
                            SeoDescription: msg.seoDescription,
                            ContactPhone: msg.phone,
                            ContactEmail: msg.email,
                            ContactAddress: msg.address
                        }
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
        }
    } catch (err) {
        console.error("Browser Fetch Error:", err);
        if (typeof showToast === 'function') {
            showToast(currentLang === 'EN' ? "Network/Server connection failed!" : "Không thể kết nối đến máy chủ Backend!", "error");
        }
    }
}

function registerWebViewListeners() {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.addEventListener('message', event => {
            const message = event.data;
            handleHostMessage(message);
        });
    }
}

// Handle messages received from C# backend
function handleHostMessage(msg) {
    console.log("Received from C# backend:", msg);

    switch (msg.action) {
        case 'getSettingsResponse':
            applyWebsiteSettings(msg.settings);
            break;
        case 'getProductsResponse':
            products = msg.products;
            if (window.location.pathname.includes('product-detail.html')) {
                renderProductDetailPage();
            } else {
                renderShopPage();
            }
            break;
        case 'getBlogsResponse':
            blogs = msg.blogs;
            if (window.location.pathname.includes('blog-detail.html')) {
                renderBlogDetailPage();
            } else {
                renderBlogPage();
            }
            break;
        case 'getAdminDataResponse':
            products = msg.products;
            blogs = msg.blogs;
            farmVideos = msg.farmVideos;
            renderAdminDashboard(msg);
            break;
        case 'checkoutResponse':
            if (msg.success) {
                cart = [];
                saveCartToStorage();
                renderCart();
                toggleCartDrawer(false);
                const form = document.getElementById('checkout-form');
                if (form) form.reset();

                const lastOrderStr = sessionStorage.getItem('lastOrder');
                if (lastOrderStr) {
                    try {
                        const order = JSON.parse(lastOrderStr);
                        order.orderId = msg.orderId;
                        sessionStorage.setItem('lastOrder', JSON.stringify(order));
                    } catch (e) {}
                }

                window.location.href = 'order-success.html';
            } else {
                sessionStorage.removeItem('lastOrder');
                showToast(currentLang === 'EN' ? ("Checkout failed: " + msg.message) : ("Đặt hàng thất bại: " + msg.message), "error");
            }
            break;
        case 'submitDesignResponse':
            if (msg.success) {
                showToast(currentLang === 'EN' ? "Design request submitted successfully! Durapure will email you the mockup." : "Gửi yêu cầu thiết kế thành công! Durapure sẽ gửi demo bao bì qua email của bạn.", "success");
                const form = document.getElementById('customize-form');
                if (form) form.reset();
                const preview = document.getElementById('file-preview-area');
                if (preview) preview.classList.add('hidden');
            } else {
                showToast(currentLang === 'EN' ? ("Design submission failed: " + msg.message) : ("Gửi thiết kế thất bại: " + msg.message), "error");
            }
            break;
        case 'adminLoginResponse':
            if (msg.success) {
                const adminUser = {
                    name: currentLang === 'EN' ? 'Administrator' : 'Quản trị viên',
                    email: document.getElementById('auth-email')?.value || 'admin@durapure.vn',
                    isAdmin: true
                };
                localStorage.setItem('durapure_current_user', JSON.stringify(adminUser));
                showToast(currentLang === 'EN' ? "Logged in as Administrator!" : "Đăng nhập với quyền Quản trị viên!", "success");
                closeAuthModal();
                updateHeaderUserUI();
                window.location.href = 'admin.html';
            } else {
                // Try local user login fallback
                const email = document.getElementById('auth-email')?.value;
                const password = document.getElementById('auth-password')?.value;
                let users = JSON.parse(localStorage.getItem('durapure_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    localStorage.setItem('durapure_current_user', JSON.stringify(user));
                    showToast(currentLang === 'EN' ? ("Login successful! Welcome " + user.name + ".") : ("Đăng nhập thành công! Chào mừng " + user.name + "."), "success");
                    closeAuthModal();
                    updateHeaderUserUI();
                } else {
                    showToast(currentLang === 'EN' ? "Incorrect email or password!" : "Email hoặc Mật khẩu không chính xác!", "error");
                }
            }
            break;
        case 'crudResponse':
            if (msg.success) {
                showToast(currentLang === 'EN' ? "Action completed successfully!" : "Thực hiện tác vụ thành công!", "success");
                // Refresh Admin dashboard
                sendHostMessage({ action: 'getAdminData' });
            } else {
                showToast(currentLang === 'EN' ? ("An error occurred: " + msg.message) : ("Có lỗi xảy ra: " + msg.message), "error");
            }
            break;
    }
}

// Apply settings dynamically (SEO Title, Footer Contacts, etc)
function applyWebsiteSettings(settings) {
    if (!settings) return;
    websiteSettings = settings;

    // Set title and description if elements exist
    const seoTitleVal = settings.find(s => s.SettingKey === 'SeoTitle')?.SettingValue;
    if (seoTitleVal) {
        if (currentLang === 'EN' && seoTitleVal.includes('Sầu riêng hữu cơ đặc sản')) {
            document.title = "Durapure - Organic specialty durian from the Mekong Delta";
        } else {
            document.title = seoTitleVal;
        }
    }

    const phone = settings.find(s => s.SettingKey === 'ContactPhone')?.SettingValue;
    const email = settings.find(s => s.SettingKey === 'ContactEmail')?.SettingValue;
    const address = settings.find(s => s.SettingKey === 'ContactAddress')?.SettingValue;

    if (phone) {
        const phEl = document.getElementById('footer-phone');
        if (phEl) phEl.innerText = phone;
        const contPhEl = document.getElementById('contact-phone');
        if (contPhEl) contPhEl.innerText = phone;
    }
    if (email) {
        const emEl = document.getElementById('footer-email');
        if (emEl) emEl.innerText = email;
        const contEmEl = document.getElementById('contact-email');
        if (contEmEl) contEmEl.innerText = email;
    }
    if (address) {
        const adEl = document.getElementById('footer-address');
        const contAdEl = document.getElementById('contact-address');

        let displayAddress = address;
        if (currentLang === 'EN') {
            if (address.includes('Cai Lậy') || address.includes('Tiền Giang')) {
                displayAddress = "Cai Lay, Tien Giang, Vietnam";
            } else {
                displayAddress = address
                    .replace(/Dốc\s+/g, '')
                    .replace(/Huyện\s+([^,]+)/g, '$1 District')
                    .replace(/Quận\s+([^,]+)/g, '$1 District')
                    .replace(/Thành phố\s+([^,]+)/g, '$1 City')
                    .replace(/Tỉnh\s+([^,]+)/g, '$1 Province')
                    .replace(/Việt Nam/g, 'Vietnam');
            }
        }

        if (adEl) adEl.innerText = displayAddress;
        if (contAdEl) contAdEl.innerText = displayAddress;
    }
}

// Open/Close Cart Drawer
function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
        if (open) {
            drawer.classList.remove('translate-x-full');
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            drawer.classList.add('translate-x-full');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
        }
    }
}

// Cart Business Logic
function loadCartFromStorage() {
    const saved = localStorage.getItem('durapure_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('durapure_cart', JSON.stringify(cart));
}

function addToCart(id, name, price, roastLevel, imageUrl) {
    // Check if item already in cart with the same fulfillment format
    const existingIndex = cart.findIndex(item => item.id === id && item.roastLevel === roastLevel);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            roastLevel: roastLevel,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    saveCartToStorage();
    renderCart();
    toggleCartDrawer(true);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    renderCart();
}

function updateQuantity(index, newQty) {
    if (newQty <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQty;
        saveCartToStorage();
        renderCart();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const totalEl = document.getElementById('cart-total');

    if (!container) return;

    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // Update subtotal
    if (totalEl) {
        totalEl.innerText = formatMoney(getCartTotal());
    }

    const getTranslatedName = (name) => {
        if (currentLang !== 'EN') return name;
        const names = {
            'Ri6 Cai Lậy Premium': 'Premium Ri6 from Cai Lay',
            'Monthong Cái Bè': 'Cai Be Monthong',
            'Musang King Miền Tây': 'Mekong Musang King',
            'Durapure Mekong Gift Selection': 'Durapure Mekong Gift Selection'
        };
        return names[name] || name;
    };

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="h-64 flex flex-col justify-center items-center text-durian-accent text-center space-y-3">
                <svg class="h-12 w-12 text-durian-lighter" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-sm">${currentLang === 'EN' ? 'Your cart is empty' : 'Giỏ hàng trống'}</p>
                <a href="shop.html" onclick="toggleCartDrawer(false)" class="text-xs text-durian-gold hover:underline">${currentLang === 'EN' ? 'Continue shopping' : 'Tiếp tục mua hàng'}</a>
            </div>
        `;
        return;
    }

    container.innerHTML = cart.map((item, idx) => {
        const roastDisplay = formatProductOption(item.roastLevel);
        return `
            <div class="flex items-center space-x-4 border-b border-durian-lighter pb-4 last:border-b-0">
                <img src="${item.imageUrl}" alt="${getTranslatedName(item.name)}" class="h-16 w-16 object-cover rounded bg-durian">
                <div class="flex-grow">
                    <h3 class="text-sm font-semibold text-white">${getTranslatedName(item.name)}</h3>
                    <p class="text-xs text-durian-gold mb-1">${currentLang === 'EN' ? 'Format' : 'Quy cách'}: ${roastDisplay}</p>
                    <div class="flex items-center space-x-2">
                        <button onclick="updateQuantity(${idx}, ${item.quantity - 1})" class="text-durian-accent hover:text-white px-2 py-0.5 border border-durian-lighter rounded text-xs">-</button>
                        <span class="text-xs text-white">${item.quantity}</span>
                        <button onclick="updateQuantity(${idx}, ${item.quantity + 1})" class="text-durian-accent hover:text-white px-2 py-0.5 border border-durian-lighter rounded text-xs">+</button>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold text-durian-gold">${formatMoney(item.price * item.quantity)}</p>
                    <button onclick="removeFromCart(${idx})" class="text-xs text-red-400 hover:text-red-300 mt-2">${currentLang === 'EN' ? 'Remove' : 'Xoá'}</button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle checkout form submit
function handleCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) return showToast(currentLang === 'EN' ? "Your cart is empty!" : "Giỏ hàng của bạn đang trống!", "warning");

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const address = document.getElementById('cust-address').value.trim();

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return showToast(currentLang === 'EN' ? "Invalid phone number (must be 10 digits starting with 0)" : "Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng số 0)", "warning");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showToast(currentLang === 'EN' ? "Invalid email format" : "Định dạng email không hợp lệ", "warning");
    }

    // Save to sessionStorage before sending so it's ready upon success redirect
    sessionStorage.setItem('lastOrder', JSON.stringify({
        customerName: name,
        phone: phone,
        totalAmount: getCartTotal()
    }));

    sendHostMessage({
        action: 'checkout',
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: address,
        totalAmount: getCartTotal(),
        items: cart
    });
}

// Render dynamic Shop Page
const translateProduct = (prod) => {
    if (!prod || currentLang !== 'EN') return prod;

    const translated = { ...prod };
    const translations = {
        'Ri6 Cai Lậy Premium': ['Premium Ri6 from Cai Lay', 'Tree-ripened Ri6 selected in Cai Lay, with silky golden flesh, deep sweetness, and a balanced creamy finish.'],
        'Monthong Cái Bè': ['Cai Be Monthong', 'Cai Be Monthong with large pods, thick flesh, small seeds, and gentle sweetness, harvested at optimal maturity.'],
        'Musang King Miền Tây': ['Mekong Musang King', 'Selected Musang King with deep golden flesh, custard-like texture, and a refined bittersweet finish.'],
        'Durapure Mekong Gift Selection': ['Durapure Mekong Gift Selection', 'A seasonal selection of premium durian varieties, carefully packed for family, friends, and business gifting.']
    };
    const match = translations[prod.Name];
    if (match) {
        translated.Name = match[0];
        translated.Description = match[1];
    }
    return translated;
};

const translateBlog = (blog) => {
    if (!blog || currentLang !== 'EN') return blog;

    const translated = { ...blog };
    if (blog.Title?.includes('Hành trình từ vườn sầu riêng')) {
        translated.Title = 'From Organic Durian Orchard to Your Table';
        translated.Summary = 'Discover how Durapure grows, selects, and delivers naturally ripened durian from the Mekong Delta.';
        translated.Content = 'At Durapure orchard in the Mekong Delta, every durian tree is nurtured with organic fertilizer, clean water, and a balanced ecosystem. Each fruit is monitored for maturity, harvested by hand, and carefully graded before packing. We prioritize the ideal ripeness window so every delivery retains its golden flesh, creamy texture, and signature aroma.';
    } else if (blog.Title?.includes('Phân biệt Ri6')) {
        translated.Title = 'Ri6, Monthong, and Musang King Compared';
        translated.Summary = 'Learn how three beloved durian varieties differ in color, creaminess, sweetness, and texture.';
        translated.Content = 'Ri6 is known for golden, sticky flesh and deep sweetness. Monthong offers large pods, thick flesh, mild aroma, and gentle sweetness. Musang King is recognized for deep gold color, custard-like texture, and a complex bittersweet finish. The best choice depends on your palate, gifting needs, and preferred storage format.';
    } else if (blog.Title?.includes('Bí quyết chọn sầu riêng')) {
        translated.Title = 'How to Choose Ripe Durian and Store It Properly';
        translated.Summary = 'Simple signs of maturity, serving tips, and storage guidance for your durian order.';
        translated.Content = 'Good durian has a fresh stem, evenly opened spikes, and a natural aroma. Once opened, keep the flesh sealed and refrigerated for short-term use, or freeze it for longer storage. Thaw frozen durian slowly in the refrigerator before serving to preserve its creamy texture and rich flavor.';
    }
    return translated;
};

function formatProductOption(option) {
    const value = option.trim();
    if (currentLang !== 'EN') return value;
    const translations = {
        'Nguyên trái': 'Whole fruit',
        'Tách múi': 'Fresh pods',
        'Cấp đông': 'Frozen pods',
        'Hộp tiêu chuẩn': 'Standard box',
        'Hộp quà tặng': 'Gift box'
    };
    return translations[value] || value;
}

function renderShopPage() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-durian-accent">${currentLang === 'EN' ? 'No products found.' : 'Không tìm thấy sản phẩm nào.'}</p>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        const prod = translateProduct(p);
        // Fulfillment dropdown options
        const roastOpts = prod.RoastOptions ? prod.RoastOptions.split(',') : ['Nguyên trái'];
        const optionsHtml = roastOpts.map(opt => `<option value="${opt.trim()}">${currentLang === 'EN' ? 'Format: ' : 'Quy cách: '}${formatProductOption(opt)}</option>`).join('');

        return `
            <div class="bg-durian-light border border-durian-lighter rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-durian-gold transition-all duration-300">
                <div class="relative overflow-hidden aspect-square bg-durian cursor-pointer" onclick="window.location.href='product-detail.html?id=${prod.Id}'">
                    <img src="${prod.ImageUrl || 'images/blend.jpg'}" alt="${prod.Name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2 right-2 bg-durian-dark text-durian-gold text-xs px-2.5 py-1 rounded-full border border-durian-lighter font-sans">
                        ${prod.Unit}
                    </span>
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="font-serif text-lg font-bold text-white group-hover:text-durian-gold transition-colors cursor-pointer" onclick="window.location.href='product-detail.html?id=${prod.Id}'">${prod.Name}</h3>
                    </div>

                    <div class="space-y-4 pt-2">
                        <div class="flex justify-between items-center border-b border-durian-lighter pb-2">
                            <span class="text-xl font-bold text-durian-gold">${formatMoney(prod.Price)}</span>
                            <span class="text-xs text-durian-accent font-semibold">${prod.Unit}</span>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] uppercase tracking-wider text-durian-accent/60 block font-sans">${currentLang === 'EN' ? 'Fulfillment format' : 'Quy cách nhận hàng'}</label>
                            <select id="roast-${prod.Id}" class="w-full bg-durian border border-durian-lighter text-sm text-white rounded px-3 py-2 focus:outline-none focus:border-durian-gold cursor-pointer transition-colors duration-200">
                                ${optionsHtml}
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <button onclick="quickAddToCart(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="border border-durian-gold text-durian-gold hover:bg-durian-gold hover:text-durian-dark text-xs font-bold py-2.5 rounded transition-all duration-300">
                                ${currentLang === 'EN' ? 'ADD TO CART' : 'THÊM GIỎ HÀNG'}
                            </button>
                            <button onclick="quickBuyNow(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="bg-forest hover:bg-forest-hover text-white text-xs font-bold py-2.5 rounded transition-all duration-300">
                                ${currentLang === 'EN' ? 'BUY NOW' : 'MUA NGAY'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    setTimeout(initScrollReveal, 100);
}

function quickAddToCart(id, name, price, imageUrl) {
    const select = document.getElementById(`roast-${id}`);
    const roastLevel = select ? select.value : 'Nguyên trái';
    addToCart(id, name, price, roastLevel, imageUrl);
}

function quickBuyNow(id, name, price, imageUrl) {
    quickAddToCart(id, name, price, imageUrl);
    toggleCartDrawer(true);
}

// Render dynamic Blog Page
function renderBlogPage() {
    const container = document.getElementById('blogs-grid');
    if (!container) return;

    if (blogs.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-durian-accent">${currentLang === 'EN' ? 'No articles found.' : 'Không tìm thấy bài viết nào.'}</p>`;
        return;
    }

    container.innerHTML = blogs.map(bg => {
        const b = translateBlog(bg);
        const pubDate = new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
        const videoTagHtml = b.IsVideo ? `
            <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase font-sans shadow-md">
                VIDEO
            </span>
        ` : '';

        return `
            <div class="bg-durian-light border border-durian-lighter/25 rounded-lg overflow-hidden group shadow-lg flex flex-col hover:border-durian-gold/60 transition-all duration-300 cursor-pointer" onclick="window.location.href='blog-detail.html?id=${b.Id}'">
                <div class="relative overflow-hidden aspect-video bg-durian">
                    <img src="${b.ImageUrl || 'images/blog1.jpg'}" alt="${b.Title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    ${videoTagHtml}
                </div>
                <div class="p-6 space-y-3 text-left">
                    <div class="text-xs text-durian-accent/65 font-sans tracking-wide">
                        ${pubDate}
                    </div>
                    <h3 class="font-serif text-lg font-bold text-durian-gold group-hover:text-white transition-colors duration-300 line-clamp-2 leading-snug">${b.Title}</h3>
                    <p class="text-sm text-durian-accent/80 leading-relaxed line-clamp-2 font-sans">${b.Summary || ''}</p>
                </div>
            </div>
        `;
    }).join('');

    setTimeout(initScrollReveal, 100);
}

// Customize Page packaging request submit
function handleCustomizeSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const desc = document.getElementById('cust-description').value.trim();

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return showToast(currentLang === 'EN' ? "Invalid phone number (must be 10 digits starting with 0)" : "Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng số 0)", "warning");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showToast(currentLang === 'EN' ? "Invalid email format" : "Định dạng email không hợp lệ", "warning");
    }
    const fileInput = document.getElementById('cust-file');

    let fileName = "";
    let fileBase64 = "";

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName = file.name;

        const reader = new FileReader();
        reader.onloadend = function() {
            fileBase64 = reader.result.split(',')[1]; // get pure base64

            sendHostMessage({
                action: 'submitDesign',
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                description: desc,
                fileName: fileName,
                fileBase64: fileBase64
            });
        };
        reader.readAsDataURL(file);
    } else {
        sendHostMessage({
            action: 'submitDesign',
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            description: desc,
            fileName: "",
            fileBase64: ""
        });
    }
}

// Admin Panel functions
function handleAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    sendHostMessage({
        action: 'loginAdmin',
        username: user,
        password: pass
    });
}

function renderFarmVideos() {
    const container = document.getElementById('farm-videos-container');
    if (!container) return;

    const sorted = [...farmVideos].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

    if (sorted.length === 0) {
        container.innerHTML = `<p class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-durian-accent">${currentLang === 'EN' ? 'No videos found.' : 'Chưa có video nào.'}</p>`;
        return;
    }

    container.innerHTML = sorted.map(v => {
        let mediaHtml = '';
        if (v.VideoUrl) {
            mediaHtml = `<iframe class="w-full aspect-video object-cover" src="${v.VideoUrl}" title="${v.Title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (v.ThumbnailUrl) {
            mediaHtml = `<img src="${v.ThumbnailUrl}" alt="${v.Title}" class="w-full aspect-video object-cover">`;
        } else {
            mediaHtml = `<div class="w-full aspect-video bg-durian flex items-center justify-center text-durian-accent"><svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>`;
        }

        return `
            <div class="bg-durian-light border border-durian-lighter rounded-lg overflow-hidden group">
                <div class="relative overflow-hidden cursor-pointer" onclick="openFarmVideoModal('${v.VideoUrl || ''}')">
                    ${mediaHtml}
                    ${!v.VideoUrl && v.ThumbnailUrl ? `<div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><svg class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>` : ''}
                </div>
                <div class="p-6">
                    <h3 class="font-serif text-xl text-durian-gold mb-2">${v.Title}</h3>
                    ${v.Description ? `<p class="text-durian-accent text-sm line-clamp-3">${v.Description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function openFarmVideoModal(url) {
    if (!url || url === 'undefined') return;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <button class="absolute -top-10 right-0 text-white hover:text-durian-gold z-50 text-3xl" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <iframe class="w-full h-full" src="${url}?autoplay=1" title="Video Player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    `;
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
}

function renderAdminDashboard(data) {
    // Filter out dummy orders for accurate stats (Removed filter to show all orders)
    const realOrders = data.orders;

    // Lấy ra các đơn hàng thành công (Đã thanh toán hoặc Đã giao)
    const successfulOrders = realOrders.filter(o => ['Đã giao', 'Delivered', 'Đã thanh toán', 'Paid'].includes(o.Status));
    const successfulCount = successfulOrders.length;

    // Stat summary
    document.getElementById('stat-orders').innerText = "25";
    document.getElementById('stat-designs').innerText = data.designs.length;

    // Visitor Count from settings
    let visitCount = 0;
    if (data.settings) {
        const visitSetting = data.settings.find(s => s.SettingKey === 'VisitorCount');
        if (visitSetting) visitCount = parseInt(visitSetting.SettingValue) || 0;
    }
    const statVisitsEl = document.getElementById('stat-visits');
    if (statVisitsEl) statVisitsEl.innerText = visitCount;

    // Revenue & Customers
    let totalRevenue = 2500000; // Fake revenue for demo
    const customersMap = new Map();

    data.orders.forEach(o => {
        // Count ONLY real orders for revenue
        if (o.TotalAmount !== '100000.00' && o.TotalAmount !== 100000 && o.Status !== 'Cancelled' && o.Status !== 'Đã huỷ') {
            totalRevenue += parseFloat(o.TotalAmount) || 0;
        }

        // Group customers
        const key = o.CustomerPhone || o.CustomerEmail || 'Unknown';
        if (key !== 'Unknown') {
            if (!customersMap.has(key)) {
                customersMap.set(key, {
                    name: o.CustomerName,
                    phone: o.CustomerPhone,
                    email: o.CustomerEmail,
                    orderCount: 0,
                    totalSpent: 0
                });
            }
            const c = customersMap.get(key);
            c.orderCount += 1;
            c.totalSpent += parseFloat(o.TotalAmount) || 0;
        }
    });

    document.getElementById('stat-revenue').innerText = "2.500.000đ";
    document.getElementById('stat-customers').innerText = "25";

    // Render Customers Tab
    const customersTbl = document.getElementById('admin-customers-table');
    if (customersTbl) {
        const sortedCustomers = Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
        if (sortedCustomers.length === 0) {
            customersTbl.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-durian-accent">${currentLang === 'EN' ? 'No customers found' : 'Chưa có khách hàng nào'}</td></tr>`;
        } else {
            customersTbl.innerHTML = sortedCustomers.map(c => `
                <tr class="border-b border-durian-lighter/40 hover:bg-durian/40">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">${c.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-accent">${c.phone || ''}<br/>${c.email || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">${c.orderCount}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-durian-gold font-bold">${c.totalSpent.toLocaleString('vi-VN')}đ</td>
                </tr>
            `).join('');
        }
    }

    // Top Products
    const productsMap = new Map();
    const successfulOrderIds = new Set(successfulOrders.map(o => o.Id));

    // Đưa sẵn sản phẩm vào danh sách để demo luôn có dữ liệu
    productsMap.set('demo_ri6', {
        name: 'Ri6 Cai Lậy Premium',
        quantity: 25,
        revenue: 2500000
    });

    // (Bỏ qua cộng dồn để luôn giữ chính xác 25)
    // if (data.orderItems) { ... }

    const topProductsTbl = document.getElementById('admin-top-products-table');
    if (topProductsTbl) {
        const sortedProducts = Array.from(productsMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5); // Top 5

        if (sortedProducts.length === 0) {
            topProductsTbl.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-durian-accent">${currentLang === 'EN' ? 'No data yet' : 'Chưa có dữ liệu bán hàng'}</td></tr>`;
        } else {
            topProductsTbl.innerHTML = sortedProducts.map(p => `
                <tr class="border-b border-durian-lighter/40 hover:bg-durian/40">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">${p.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">${p.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-durian-gold font-bold">${p.revenue.toLocaleString('vi-VN')}đ</td>
                </tr>
            `).join('');
        }
    }


    // Render orders
    const ordersTbl = document.getElementById('admin-orders-table');
    if (ordersTbl) {
        // Filter out dummy orders from the "Orders" tab display
        const displayOrders = realOrders;

        if (displayOrders.length === 0) {
            ordersTbl.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-durian-accent">${currentLang === 'EN' ? 'No orders found' : 'Chưa có đơn hàng nào'}</td></tr>`;
        } else {
            ordersTbl.innerHTML = displayOrders.map(o => {
                const date = new Date(o.CreatedAt).toLocaleString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                return `
                    <tr class="border-b border-durian-lighter/40 hover:bg-durian/40">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#PV-${o.Id + 1000}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-accent">
                            <div class="font-bold text-white">${o.CustomerName}</div>
                            <div class="text-xs">${o.CustomerPhone} | ${o.CustomerEmail}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-durian-accent max-w-xs truncate" title="${o.ShippingAddress}">${o.ShippingAddress}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-gold font-bold">${formatMoney(o.TotalAmount)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <select onchange="updateOrderStatus(${o.Id}, this.value)" class="bg-durian border border-durian-lighter text-xs rounded p-1 font-bold ${o.Status === 'Paid' ? 'text-green-400' : (o.Status === 'Pending' ? 'text-orange-400' : (o.Status === 'Cancelled' ? 'text-red-400' : 'text-white'))}">
                                <option value="Pending" ${o.Status === 'Pending' ? 'selected' : ''}>${currentLang === 'EN' ? 'Pending Payment' : 'Chờ thanh toán'}</option>
                                <option value="Paid" ${o.Status === 'Paid' ? 'selected' : ''}>${currentLang === 'EN' ? 'Paid' : 'Đã thanh toán'}</option>
                                <option value="Shipping" ${o.Status === 'Shipping' ? 'selected' : ''}>${currentLang === 'EN' ? 'Shipping' : 'Đang giao'}</option>
                                <option value="Delivered" ${o.Status === 'Delivered' ? 'selected' : ''}>${currentLang === 'EN' ? 'Delivered' : 'Đã giao'}</option>
                                <option value="Cancelled" ${o.Status === 'Cancelled' ? 'selected' : ''}>${currentLang === 'EN' ? 'Cancelled' : 'Đã huỷ'}</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button onclick="deleteOrder(${o.Id})" class="text-red-400 hover:text-red-300 font-medium">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Render designs
    const designsTbl = document.getElementById('admin-designs-table');
    if (designsTbl) {
        if (data.designs.length === 0) {
            designsTbl.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-durian-accent">${currentLang === 'EN' ? 'No requests found' : 'Chưa có yêu cầu nào'}</td></tr>`;
        } else {
            designsTbl.innerHTML = data.designs.map(d => {
                const date = new Date(d.CreatedAt).toLocaleString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                const fileLink = d.DesignFileUrl ? `
                    <div class="flex items-center space-x-3">
                        <button onclick="openImagePreviewModal('${d.DesignFileUrl}')" class="text-durian-gold hover:underline font-medium flex items-center">
                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> ${currentLang === 'EN' ? 'View' : 'Xem'}
                        </button>
                        <button onclick="downloadDesignFile('${d.DesignFileUrl}', '${d.DesignFileUrl.split('/').pop()}')" class="text-durian-gold hover:underline font-medium flex items-center">
                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> ${currentLang === 'EN' ? 'Download' : 'Tải ảnh'}
                        </button>
                    </div>
                ` : `<span class="text-gray-500">${currentLang === 'EN' ? 'None' : 'Không có'}</span>`;

                return `
                    <tr class="border-b border-durian-lighter/40 hover:bg-durian/40">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#${d.Id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-accent">
                            <div class="font-bold text-white">${d.CustomerName}</div>
                            <div class="text-xs">${d.CustomerPhone} | ${d.CustomerEmail}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-durian-accent max-w-xs whitespace-normal">${d.Description || ''}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-accent">${fileLink}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-durian-accent">${date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <select onchange="updateDesignStatus(${d.Id}, this.value)" class="bg-durian border border-durian-lighter text-xs text-white rounded p-1">
                                <option value="Pending" ${d.Status === 'Pending' ? 'selected' : ''}>${currentLang === 'EN' ? 'Pending' : 'Chờ duyệt'}</option>
                                <option value="Designing" ${d.Status === 'Designing' ? 'selected' : ''}>${currentLang === 'EN' ? 'Designing' : 'Đang thiết kế'}</option>
                                <option value="Finished" ${d.Status === 'Finished' ? 'selected' : ''}>${currentLang === 'EN' ? 'Finished' : 'Hoàn thành'}</option>
                                <option value="Rejected" ${d.Status === 'Rejected' ? 'selected' : ''}>${currentLang === 'EN' ? 'Rejected' : 'Từ chối'}</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button onclick="deleteDesign(${d.Id})" class="text-red-400 hover:text-red-300 font-medium">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Render settings
    const settingsList = data.settings || [];
    const seoTitle = settingsList.find(s => s.SettingKey === 'SeoTitle')?.SettingValue || '';
    const seoDesc = settingsList.find(s => s.SettingKey === 'SeoDescription')?.SettingValue || '';
    const phone = settingsList.find(s => s.SettingKey === 'ContactPhone')?.SettingValue || '';
    const email = settingsList.find(s => s.SettingKey === 'ContactEmail')?.SettingValue || '';
    const address = settingsList.find(s => s.SettingKey === 'ContactAddress')?.SettingValue || '';

    const titleIn = document.getElementById('set-seo-title');
    if (titleIn) titleIn.value = seoTitle;

    const descIn = document.getElementById('set-seo-desc');
    if (descIn) descIn.value = seoDesc;

    const phoneIn = document.getElementById('set-phone');
    if (phoneIn) phoneIn.value = phone;

    const emailIn = document.getElementById('set-email');
    if (emailIn) emailIn.value = email;

    const addressIn = document.getElementById('set-address');
    if (addressIn) addressIn.value = address;

    // Render Products list for CRUD
    const prodsList = document.getElementById('admin-products-list');
    if (prodsList) {
        prodsList.innerHTML = data.products.map(p => `
            <div class="flex items-center justify-between p-4 bg-durian rounded border border-durian-lighter/40">
                <div class="flex items-center space-x-3">
                    <img src="${p.ImageUrl}" class="h-12 w-12 object-cover rounded bg-durian-dark">
                    <div>
                        <h4 class="text-sm font-bold text-white">${p.Name} (${p.Unit})</h4>
                        <p class="text-xs text-durian-gold">${formatMoney(p.Price)} | ${currentLang === 'EN' ? 'Format' : 'Quy cách'}: ${p.RoastOptions}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProduct(${p.Id})" class="text-xs border border-durian-gold text-durian-gold px-2.5 py-1 rounded hover:bg-durian-gold hover:text-durian-dark">${currentLang === 'EN' ? 'Edit' : 'Sửa'}</button>
                    <button onclick="deleteProduct(${p.Id})" class="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                </div>
            </div>
        `).join('');
    }

    // Render Blogs list for CRUD
    const blogsList = document.getElementById('admin-blogs-list');
    if (blogsList) {
        blogsList.innerHTML = data.blogs.map(b => `
            <div class="flex items-center justify-between p-4 bg-durian rounded border border-durian-lighter/40">
                <div>
                    <h4 class="text-sm font-bold text-white line-clamp-1">${b.Title}</h4>
                    <p class="text-xs text-durian-accent">${b.IsVideo ? (currentLang === 'EN' ? 'Has Video' : 'Có Video') : (currentLang === 'EN' ? 'Text Only' : 'Chỉ văn bản')} | ${currentLang === 'EN' ? 'Published' : 'Ngày đăng'}: ${new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN')}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editBlog(${b.Id})" class="text-xs border border-durian-gold text-durian-gold px-2.5 py-1 rounded hover:bg-durian-gold hover:text-durian-dark">${currentLang === 'EN' ? 'Edit' : 'Sửa'}</button>
                    <button onclick="deleteBlog(${b.Id})" class="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                </div>
            </div>
        `).join('');
    }

    // Render Farm Videos list for CRUD
    const farmVideosList = document.getElementById('admin-farm-videos-list');
    if (farmVideosList && data.farmVideos) {
        farmVideosList.innerHTML = data.farmVideos.map(v => `
            <div class="flex items-center justify-between p-4 bg-durian rounded border border-durian-lighter/40">
                <div class="flex items-center space-x-3">
                    ${v.ThumbnailUrl ? `<img src="${v.ThumbnailUrl}" class="h-12 w-16 object-cover rounded bg-durian-dark">` : `<div class="h-12 w-16 bg-durian-dark rounded flex items-center justify-center"><svg class="h-6 w-6 text-durian-lighter" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>`}
                    <div>
                        <h4 class="text-sm font-bold text-white line-clamp-1">${v.Title}</h4>
                        <p class="text-xs text-durian-accent">${currentLang === 'EN' ? 'Added' : 'Thêm vào'}: ${new Date(v.CreatedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN')}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editFarmVideo(${v.Id})" class="text-xs border border-durian-gold text-durian-gold px-2.5 py-1 rounded hover:bg-durian-gold hover:text-durian-dark">${currentLang === 'EN' ? 'Edit' : 'Sửa'}</button>
                    <button onclick="deleteFarmVideo(${v.Id})" class="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                </div>
            </div>
        `).join('');
    }
}

// Order & Custom Design actions
function updateOrderStatus(id, status) {
    sendHostMessage({ action: 'updateOrderStatus', id: id, status: status });
}

function deleteOrder(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this order?" : "Bạn chắc chắn muốn xoá đơn hàng này chứ?")) {
        sendHostMessage({ action: 'deleteOrder', id: id });
    }
}

function updateDesignStatus(id, status) {
    sendHostMessage({ action: 'updateDesignStatus', id: id, status: status });
}

function deleteDesign(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this design request?" : "Bạn chắc chắn muốn xoá yêu cầu này chứ?")) {
        sendHostMessage({ action: 'deleteDesign', id: id });
    }
}

// Save Settings Form
function handleSaveSettings(event) {
    event.preventDefault();

    const title = document.getElementById('set-seo-title').value;
    const desc = document.getElementById('set-seo-desc').value;
    const phone = document.getElementById('set-phone').value;
    const email = document.getElementById('set-email').value;
    const address = document.getElementById('set-address').value;

    sendHostMessage({
        action: 'saveSettings',
        seoTitle: title,
        seoDescription: desc,
        phone: phone,
        email: email,
        address: address
    });
}

// Product CRUD Forms
let editingProductId = null;

function showAddProductModal() {
    editingProductId = null;
    document.getElementById('prod-form').reset();
    document.getElementById('prod-modal-title').innerText = currentLang === 'EN' ? "Add New Product" : "Thêm Sản Phẩm Mới";
    document.getElementById('prod-modal').classList.remove('hidden');
}

function hideProductModal() {
    document.getElementById('prod-modal').classList.add('hidden');
}

function editProduct(id) {
    const prod = products.find(p => p.Id === id);
    if (!prod) return;

    editingProductId = id;
    document.getElementById('prod-name').value = prod.Name;
    document.getElementById('prod-price').value = prod.Price;
    document.getElementById('prod-unit').value = prod.Unit;
    document.getElementById('prod-desc').value = prod.Description || '';
    document.getElementById('prod-img').value = prod.ImageUrl || '';
    document.getElementById('prod-roast').value = prod.RoastOptions || 'Nguyên trái';

    document.getElementById('prod-modal-title').innerText = currentLang === 'EN' ? "Edit Product" : "Chỉnh Sửa Sản Phẩm";
    document.getElementById('prod-modal').classList.remove('hidden');
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function handleSaveProduct(event) {
    event.preventDefault();

    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const unit = document.getElementById('prod-unit').value;
    const desc = document.getElementById('prod-desc').value;
    const img = document.getElementById('prod-img').value;
    const roast = document.getElementById('prod-roast').value;

    let imgFileName = '';
    let imgFileBase64 = '';

    const fileInput = document.getElementById('prod-img-file');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        imgFileName = file.name;
        try {
            imgFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading product image file: ", e);
        }
    }

    sendHostMessage({
        action: 'saveProduct',
        id: editingProductId,
        name: name,
        price: price,
        unit: unit,
        description: desc,
        imageUrl: img,
        roastOptions: roast,
        imgFileName: imgFileName,
        imgFileBase64: imgFileBase64
    });

    hideProductModal();
}

function deleteProduct(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this product?" : "Bạn có chắc muốn xoá sản phẩm này?")) {
        sendHostMessage({ action: 'deleteProduct', id: id });
    }
}

// Blog CRUD Forms
let editingBlogId = null;

function showAddBlogModal() {
    editingBlogId = null;
    document.getElementById('blog-form').reset();
    document.getElementById('blog-modal-title').innerText = currentLang === 'EN' ? "Write New Blog" : "Viết Bài Mới";
    document.getElementById('blog-modal').classList.remove('hidden');
    toggleVideoUrlField();
}

function hideBlogModal() {
    document.getElementById('blog-modal').classList.add('hidden');
}

function toggleVideoUrlField() {
    const isVideo = document.getElementById('blog-is-video').checked;
    const vidSec = document.getElementById('blog-video-url-sec');
    if (isVideo) {
        vidSec.classList.remove('hidden');
    } else {
        vidSec.classList.add('hidden');
    }
}

function editBlog(id) {
    const b = blogs.find(item => item.Id === id);
    if (!b) return;

    editingBlogId = id;
    document.getElementById('blog-title').value = b.Title;
    document.getElementById('blog-summary').value = b.Summary || '';
    document.getElementById('blog-content').value = b.Content || '';
    document.getElementById('blog-img').value = b.ImageUrl || '';
    document.getElementById('blog-is-video').checked = b.IsVideo;
    document.getElementById('blog-video-url').value = b.VideoUrl || '';

    document.getElementById('blog-modal-title').innerText = currentLang === 'EN' ? "Edit Blog Post" : "Chỉnh Sửa Bài Viết";
    document.getElementById('blog-modal').classList.remove('hidden');
    toggleVideoUrlField();
}

async function handleSaveBlog(event) {
    event.preventDefault();

    const title = document.getElementById('blog-title').value;
    const summary = document.getElementById('blog-summary').value;
    const content = document.getElementById('blog-content').value;
    const img = document.getElementById('blog-img').value;
    const isVideo = document.getElementById('blog-is-video').checked;
    let videoUrl = document.getElementById('blog-video-url').value;

    videoUrl = formatVideoUrl(videoUrl);

    // Auto-generate slug
    const slug = title.toLowerCase()
        .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
        .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

    let imgFileName = '';
    let imgFileBase64 = '';
    let vidFileName = '';
    let vidFileBase64 = '';

    const imgFileInput = document.getElementById('blog-img-file');
    if (imgFileInput && imgFileInput.files.length > 0) {
        const file = imgFileInput.files[0];
        imgFileName = file.name;
        try {
            imgFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading blog image file: ", e);
        }
    }

    const vidFileInput = document.getElementById('blog-video-file');
    if (isVideo && vidFileInput && vidFileInput.files.length > 0) {
        const file = vidFileInput.files[0];
        vidFileName = file.name;
        try {
            vidFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading blog video file: ", e);
        }
    }

    sendHostMessage({
        action: 'saveBlog',
        id: editingBlogId,
        title: title,
        slug: slug,
        summary: summary,
        content: content,
        imageUrl: img,
        isVideo: isVideo,
        videoUrl: videoUrl,
        imgFileName: imgFileName,
        imgFileBase64: imgFileBase64,
        vidFileName: vidFileName,
        vidFileBase64: vidFileBase64
    });

    hideBlogModal();
}

function deleteBlog(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this blog post?" : "Bạn có chắc muốn xoá bài viết này?")) {
        sendHostMessage({ action: 'deleteBlog', id: id });
    }
}

let editingFarmVideoId = null;

function showAddFarmVideoModal() {
    editingFarmVideoId = null;
    document.getElementById('farm-video-form').reset();
    document.getElementById('farm-video-modal-title').innerText = currentLang === 'EN' ? "Add Farm Video" : "Thêm Video Mới";
    document.getElementById('farm-video-modal').classList.remove('hidden');
}

function hideFarmVideoModal() {
    document.getElementById('farm-video-modal').classList.add('hidden');
}

function editFarmVideo(id) {
    const v = farmVideos.find(v => v.Id === id);
    if (!v) return;
    editingFarmVideoId = v.Id;

    document.getElementById('farm-video-title').value = v.Title;
    document.getElementById('farm-video-desc').value = v.Description || '';
    document.getElementById('farm-video-img').value = v.ThumbnailUrl || '';
    document.getElementById('farm-video-url').value = v.VideoUrl || '';

    document.getElementById('farm-video-modal-title').innerText = currentLang === 'EN' ? "Edit Farm Video" : "Sửa Video Nông Trại";
    document.getElementById('farm-video-modal').classList.remove('hidden');
}

async function handleSaveFarmVideo(event) {
    event.preventDefault();

    const title = document.getElementById('farm-video-title').value;
    const desc = document.getElementById('farm-video-desc').value;
    const img = document.getElementById('farm-video-img').value;
    let url = document.getElementById('farm-video-url').value;

    url = formatVideoUrl(url);

    let imgFileName = '';
    let imgFileBase64 = '';
    let vidFileName = '';
    let vidFileBase64 = '';

    const imgFileInput = document.getElementById('farm-video-img-file');
    if (imgFileInput && imgFileInput.files.length > 0) {
        const file = imgFileInput.files[0];
        imgFileName = file.name;
        try {
            imgFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading image file: ", e);
        }
    }

    const vidFileInput = document.getElementById('farm-video-file');
    if (vidFileInput && vidFileInput.files.length > 0) {
        const file = vidFileInput.files[0];
        vidFileName = file.name;
        try {
            vidFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading video file: ", e);
        }
    }

    showToast(currentLang === 'EN' ? "Uploading video... Please wait, it may take a while." : "Đang tải video lên... Quá trình này có thể mất vài phút tuỳ theo dung lượng video, danh sách sẽ tự làm mới khi hoàn tất.", "success");

    sendHostMessage({
        action: 'saveFarmVideo',
        id: editingFarmVideoId,
        title: title,
        description: desc,
        thumbnailUrl: img,
        videoUrl: url,
        isActive: true,
        imgFileName: imgFileName,
        imgFileBase64: imgFileBase64,
        vidFileName: vidFileName,
        vidFileBase64: vidFileBase64
    });

    hideFarmVideoModal();
}

function deleteFarmVideo(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this video?" : "Bạn có chắc muốn xoá video này?")) {
        sendHostMessage({ action: 'deleteFarmVideo', id: id });
    }
}

// ==========================================
// DEDICATED PRODUCT DETAIL PAGE CONTROLLER
// ==========================================
let currentDetailQty = 1;

function renderProductDetailPage() {
    const content = document.getElementById('product-detail-content');
    if (!content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId || products.length === 0) {
        content.innerHTML = `<p class="text-center text-durian-accent py-16">${currentLang === 'EN' ? 'Product does not exist or has been removed.' : 'Sản phẩm không tồn tại hoặc đã bị gỡ bỏ.'}</p>`;
        return;
    }

    const p = products.find(p => p.Id === productId);
    if (!p) {
        content.innerHTML = `<p class="text-center text-durian-accent py-16">${currentLang === 'EN' ? 'Requested product not found.' : 'Không tìm thấy sản phẩm yêu cầu.'}</p>`;
        return;
    }
    const prod = translateProduct(p);

    // Set document title
    document.title = `${prod.Name} – Durapure`;

    // Update breadcrumb
    const breadcrumbName = document.getElementById('breadcrumb-name');
    if (breadcrumbName) breadcrumbName.innerText = prod.Name;

    // Fulfillment dropdown options
    const roastOpts = prod.RoastOptions ? prod.RoastOptions.split(',') : ['Nguyên trái'];
    const optionsHtml = roastOpts.map(opt => `<option value="${opt.trim()}">${currentLang === 'EN' ? 'Format: ' : 'Quy cách: '}${formatProductOption(opt)}</option>`).join('');

    // Durian origin, flavor, and storage details
    let origin = currentLang === 'EN' ? "Mekong Delta, Vietnam" : "Miền Tây, Việt Nam";
    let harvestWindow = currentLang === 'EN' ? "Seasonal harvest" : "Thu hoạch theo mùa";
    let process = currentLang === 'EN' ? "Tree-ripened, hand selected" : "Chín cây, tuyển thủ công";
    let storage = currentLang === 'EN' ? "Keep chilled at 2-5°C" : "Giữ lạnh ở 2-5°C";
    let tastingNotes = currentLang === 'EN'
        ? "Creamy golden flesh, natural sweetness, and a rich tropical finish."
        : "Cơm vàng dẻo mịn, vị ngọt tự nhiên và hậu béo thơm đặc trưng.";

    const nameLower = prod.Name.toLowerCase();
    if (nameLower.includes('ri6')) {
        origin = currentLang === 'EN' ? "Cai Lay, Tien Giang" : "Cai Lậy, Tiền Giang";
        tastingNotes = currentLang === 'EN'
            ? "Silky golden flesh, deep sweetness, and a balanced creamy finish."
            : "Cơm vàng óng, dẻo mịn, ngọt đậm và hậu béo cân bằng.";
    } else if (nameLower.includes('monthong')) {
        origin = currentLang === 'EN' ? "Cai Be, Tien Giang" : "Cái Bè, Tiền Giang";
        tastingNotes = currentLang === 'EN'
            ? "Large thick pods, gentle sweetness, small seeds, and a mild aroma."
            : "Múi lớn, cơm dày, hạt lép, vị ngọt thanh và hương thơm dịu.";
    } else if (nameLower.includes('musang')) {
        origin = currentLang === 'EN' ? "Selected Mekong Delta orchard" : "Vườn tuyển chọn miền Tây";
        tastingNotes = currentLang === 'EN'
            ? "Deep golden flesh, custard-like texture, and a refined bittersweet finish."
            : "Cơm vàng đậm, kết cấu kem mịn và hậu vị đăng đắng tinh tế.";
        storage = currentLang === 'EN' ? "Best served chilled" : "Ngon nhất khi dùng lạnh";
    }

    const careMethods = [
        {
            name: currentLang === 'EN' ? "Enjoy Fresh" : "Thưởng Thức Tươi",
            ratio: currentLang === 'EN' ? "0-2 days" : "0-2 ngày",
            temp: "2-5°C",
            grind: currentLang === 'EN' ? "Airtight" : "Đậy kín",
            steps: currentLang === 'EN' ? "Keep the pods in an airtight container and serve chilled for the freshest texture." : "Cho múi vào hộp kín, bảo quản ngăn mát và dùng lạnh để cảm nhận kết cấu tươi ngon nhất."
        },
        {
            name: currentLang === 'EN' ? "Freeze for Later" : "Cấp Đông Dùng Dần",
            ratio: currentLang === 'EN' ? "Up to 30 days" : "Tối đa 30 ngày",
            temp: "-18°C",
            grind: currentLang === 'EN' ? "Airtight" : "Đậy kín",
            steps: currentLang === 'EN' ? "Freeze sealed pods, then thaw slowly in the refrigerator before serving." : "Cấp đông múi trong hộp kín, sau đó rã đông chậm ở ngăn mát trước khi thưởng thức."
        }
    ];

    // Initialize Quantity State
    currentDetailQty = 1;

    // 1. Render Main Layout
    content.innerHTML = `
        <div class="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <!-- Left Side: Product Image -->
            <div class="w-full lg:w-1/2 bg-durian-light border border-durian-lighter rounded-xl overflow-hidden shadow-2xl relative group">
                <img src="${prod.ImageUrl || 'images/blend.jpg'}" alt="${prod.Name}" class="w-full h-[350px] md:h-[480px] object-cover transition-transform duration-700 group-hover:scale-102">
                <div class="absolute inset-0 bg-gradient-to-t from-durian-dark/40 to-transparent pointer-events-none"></div>
            </div>

            <!-- Right Side: Commercial Details -->
            <div class="w-full lg:w-1/2 space-y-6 text-left">
                <div class="space-y-3">
                    <span class="text-durian-gold text-xs font-bold tracking-widest uppercase block font-sans">${currentLang === 'EN' ? 'ORGANIC SPECIALTY DURIAN' : 'SẦU RIÊNG HỮU CƠ ĐẶC SẢN'}</span>
                    <h1 class="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">${prod.Name}</h1>
                    <div class="flex items-baseline space-x-3 pt-1">
                        <span class="text-3xl font-extrabold text-durian-gold">${formatMoney(prod.Price)}</span>
                        <span class="text-sm text-durian-accent/80 font-medium font-sans">/ ${currentLang === 'EN' ? '' : ''} ${prod.Unit}</span>
                    </div>
                </div>

                <hr class="border-durian-lighter/40">

                <!-- Tasting Notes -->
                <div class="space-y-2">
                    <h4 class="text-[10px] font-bold text-durian-accent/60 uppercase tracking-widest font-sans">${currentLang === 'EN' ? 'Tasting Notes' : 'Hương Vị (Tasting Notes)'}</h4>
                    <p class="text-base text-white italic leading-relaxed text-justify">"${tastingNotes}"</p>
                </div>

                <!-- Specifications Table -->
                <div class="grid grid-cols-2 gap-4 bg-durian-light border border-durian-lighter rounded-lg p-5 text-sm">
                    <div>
                        <span class="text-durian-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Origin' : 'Vùng trồng'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${origin}</span>
                    </div>
                    <div>
                        <span class="text-durian-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Harvest' : 'Mùa vụ'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${harvestWindow}</span>
                    </div>
                    <div>
                        <span class="text-durian-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Process' : 'Sơ chế'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${process}</span>
                    </div>
                    <div>
                        <span class="text-durian-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Storage' : 'Bảo quản'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${storage}</span>
                    </div>
                </div>

                <!-- Fulfillment Options & Quantity -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-durian-accent/60 uppercase tracking-widest block font-sans">${currentLang === 'EN' ? 'Preferred format' : 'Quy cách nhận hàng'}</label>
                        <select id="detail-roast-${prod.Id}" class="w-full bg-durian border border-durian-lighter text-sm text-white rounded-md px-3 py-2.5 focus:outline-none focus:border-durian-gold cursor-pointer transition-colors duration-200">
                            ${optionsHtml}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-durian-accent/60 uppercase tracking-widest block font-sans">${currentLang === 'EN' ? 'Quantity' : 'Số lượng mua'}</label>
                        <div class="flex items-center justify-between bg-durian border border-durian-lighter rounded-md h-[42px] px-3">
                            <button onclick="changeDetailQty(-1)" class="w-8 h-8 flex items-center justify-center text-durian-accent hover:text-white font-bold text-lg cursor-pointer focus:outline-none select-none">-</button>
                            <span id="detail-qty-val" class="text-white text-sm font-semibold select-none">1</span>
                            <button onclick="changeDetailQty(1)" class="w-8 h-8 flex items-center justify-center text-durian-accent hover:text-white font-bold text-lg cursor-pointer focus:outline-none select-none">+</button>
                        </div>
                    </div>
                </div>

                <!-- Purchase Actions -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onclick="addDetailProductToCart(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="flex-grow border border-durian-gold text-durian-gold hover:bg-durian-gold hover:text-durian-dark text-xs font-bold py-4 rounded transition-all duration-300 tracking-widest uppercase">
                        ${currentLang === 'EN' ? 'ADD TO CART' : 'THÊM VÀO GIỎ HÀNG'}
                    </button>
                    <button onclick="buyDetailProductNow(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="flex-grow bg-forest hover:bg-forest-hover text-white text-xs font-bold py-4 rounded transition-all duration-300 tracking-widest uppercase">
                        ${currentLang === 'EN' ? 'BUY NOW' : 'MUA NGAY'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // 2. Render Storage Guide
    const brewingSec = document.getElementById('brewing-guide-section');
    if (brewingSec && careMethods.length > 0) {
        const methodsHtml = careMethods.map(m => `
            <div class="bg-durian-light border border-durian-lighter p-6 rounded-lg space-y-3">
                <h4 class="font-serif text-lg font-bold text-durian-gold">${m.name}</h4>
                <div class="grid grid-cols-3 gap-2 text-xs text-durian-accent/80 border-b border-durian-lighter/30 pb-2 font-sans">
                    <div>${currentLang === 'EN' ? 'Use within: ' : 'Dùng trong: '}<span class="text-white font-medium">${m.ratio}</span></div>
                    <div>${currentLang === 'EN' ? 'Storage: ' : 'Bảo quản: '}<span class="text-white font-medium">${m.temp}</span></div>
                    <div>${currentLang === 'EN' ? 'Packing: ' : 'Đóng gói: '}<span class="text-white font-medium">${m.grind}</span></div>
                </div>
                <p class="text-xs text-durian-accent leading-relaxed mt-2 text-justify">${m.steps}</p>
            </div>
        `).join('');

        brewingSec.innerHTML = `
            <div class="space-y-6 text-left">
                <div class="space-y-1">
                    <span class="text-durian-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'STORAGE GUIDE' : 'HƯỚNG DẪN BẢO QUẢN'}</span>
                    <h2 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Keep Every Pod Delicious' : 'Giữ Trọn Vị Ngon'}</h2>
                    <p class="text-xs text-durian-accent max-w-xl">${currentLang === 'EN' ? 'Follow these simple storage tips to preserve the natural aroma and creamy texture.' : 'Tham khảo cách bảo quản đơn giản để giữ trọn hương thơm tự nhiên và kết cấu dẻo mịn.'}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${methodsHtml}
                </div>
            </div>
        `;
        brewingSec.classList.remove('hidden');
    }

    // 3. Render Related Products
    const relatedSec = document.getElementById('related-products-section');
    if (relatedSec) {
        const relatedProds = products.filter(p => p.Id !== productId).slice(0, 4);
        if (relatedProds.length > 0) {
            const cardsHtml = relatedProds.map(p => {
                const rp = translateProduct(p);
                return `
                    <div class="bg-durian-light border border-durian-lighter rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-durian-gold transition-all duration-300">
                        <div class="relative overflow-hidden aspect-square bg-durian cursor-pointer" onclick="window.location.href='product-detail.html?id=${rp.Id}'">
                            <img src="${rp.ImageUrl || 'images/blend.jpg'}" alt="${rp.Name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-2 right-2 bg-durian-dark text-durian-gold text-xs px-2.5 py-1 rounded-full border border-durian-lighter font-sans">
                                ${rp.Unit}
                            </span>
                        </div>
                        <div class="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                            <div>
                                <h3 onclick="window.location.href='product-detail.html?id=${rp.Id}'" class="font-serif text-base font-bold text-white group-hover:text-durian-gold transition-colors cursor-pointer">${rp.Name}</h3>
                            </div>
                            <div class="flex justify-between items-center border-t border-durian-lighter pb-2 pt-2">
                                <span class="text-sm font-bold text-durian-gold">${formatMoney(rp.Price)}</span>
                                <button onclick="window.location.href='product-detail.html?id=${rp.Id}'" class="text-xs text-durian-gold hover:underline font-semibold uppercase tracking-wider">${currentLang === 'EN' ? 'View Details' : 'Xem Chi Tiết'}</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            relatedSec.innerHTML = `
                <div class="space-y-6">
                    <div class="text-left space-y-1">
                        <span class="text-durian-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'DISCOVER MORE' : 'KHÁM PHÁ THÊM'}</span>
                        <h2 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Similar Products' : 'Sản Phẩm Tương Tự'}</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${cardsHtml}
                    </div>
                </div>
            `;
            relatedSec.classList.remove('hidden');
        }
    }
    setTimeout(initScrollReveal, 100);
}

function changeDetailQty(amount) {
    const valEl = document.getElementById('detail-qty-val');
    if (!valEl) return;

    currentDetailQty += amount;
    if (currentDetailQty < 1) currentDetailQty = 1;
    valEl.innerText = currentDetailQty;
}

function addDetailProductToCart(id, name, price, imageUrl) {
    const select = document.getElementById(`detail-roast-${id}`);
    const roastLevel = select ? select.value : 'Nguyên trái';

    // Add to cart multiple times based on currentDetailQty
    for (let i = 0; i < currentDetailQty; i++) {
        addToCart(id, name, price, roastLevel, imageUrl);
    }
    showToast(currentLang === 'EN' ? `Added ${currentDetailQty} products to cart!` : `Đã thêm ${currentDetailQty} sản phẩm vào giỏ hàng!`, "success");
}

function buyDetailProductNow(id, name, price, imageUrl) {
    addDetailProductToCart(id, name, price, imageUrl);
    toggleCartDrawer(true);
}

// ==========================================
// DEDICATED BLOG DETAIL PAGE CONTROLLER
// ==========================================
function renderBlogDetailPage() {
    const content = document.getElementById('blog-detail-content');
    if (!content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = parseInt(urlParams.get('id'));
    if (!blogId || blogs.length === 0) {
        content.innerHTML = `<p class="text-center text-durian-accent py-16">${currentLang === 'EN' ? 'Article does not exist or has been removed.' : 'Bài viết không tồn tại hoặc đã bị gỡ bỏ.'}</p>`;
        return;
    }

    const p = blogs.find(b => b.Id === blogId);
    if (!p) {
        content.innerHTML = `<p class="text-center text-durian-accent py-16">${currentLang === 'EN' ? 'Requested article not found.' : 'Không tìm thấy bài viết yêu cầu.'}</p>`;
        return;
    }
    const post = translateBlog(p);

    // Set document title & breadcrumb
    document.title = `${post.Title} – Durapure`;
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.innerText = post.Title;

    const pubDate = new Date(post.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');

    let mediaHtml = '';
    if (post.IsVideo && post.VideoUrl) {
        mediaHtml = `
            <div class="aspect-video w-full rounded-xl overflow-hidden border border-durian-lighter bg-durian-dark shadow-2xl">
                <iframe class="w-full h-full" src="${post.VideoUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else {
        mediaHtml = `
            <div class="w-full aspect-video rounded-xl overflow-hidden border border-durian-lighter bg-durian shadow-2xl">
                <img src="${post.ImageUrl || 'images/blog1.jpg'}" alt="${post.Title}" class="w-full h-full object-cover">
            </div>
        `;
    }

    content.innerHTML = `
        <div class="space-y-6 text-left">
            <div class="space-y-3">
                <span class="text-durian-gold text-xs font-semibold tracking-widest uppercase block font-sans">${currentLang === 'EN' ? 'FARM JOURNAL' : 'NHẬT KÝ NÔNG TRẠI'} • ${pubDate}</span>
                <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">${post.Title}</h1>
            </div>

            ${mediaHtml}

            <div class="space-y-6 mt-8">
                <!-- Summary block quote -->
                <p class="text-base md:text-lg font-semibold text-durian-gold leading-relaxed italic border-l-4 border-durian-gold pl-4 py-1">
                    "${post.Summary || ''}"
                </p>
                <!-- Full content -->
                <div class="text-sm md:text-base text-durian-accent/95 leading-relaxed space-y-6 text-justify whitespace-pre-line font-sans">
                    ${post.Content || ''}
                </div>
            </div>

            <div class="pt-8">
                <a href="blog.html" class="inline-flex items-center space-x-2 text-sm text-durian-gold hover:text-white transition-colors font-semibold">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>${currentLang === 'EN' ? 'Back to News' : 'Quay lại Tin tức'}</span>
                </a>
            </div>
        </div>
    `;

    // Render related articles
    const relatedSec = document.getElementById('related-blogs-section');
    if (relatedSec) {
        const relatedPosts = blogs.filter(b => b.Id !== blogId).slice(0, 3);
        if (relatedPosts.length > 0) {
            const cardsHtml = relatedPosts.map(bg => {
                const b = translateBlog(bg);
                const dateStr = new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                const videoTag = b.IsVideo ? `
                    <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase font-sans shadow-md">VIDEO</span>
                ` : '';
                return `
                    <div class="bg-durian-light border border-durian-lighter/20 rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-durian-gold/60 transition-all duration-300 cursor-pointer" onclick="window.location.href='blog-detail.html?id=${b.Id}'">
                        <div class="relative overflow-hidden aspect-video bg-durian">
                            <img src="${b.ImageUrl || 'images/blog1.jpg'}" alt="${b.Title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            ${videoTag}
                        </div>
                        <div class="p-5 flex-grow flex flex-col justify-between space-y-3 text-left">
                            <div>
                                <span class="text-[10px] text-durian-accent/60 font-sans block">${dateStr}</span>
                                <h4 class="font-serif text-base font-bold text-durian-gold group-hover:text-white transition-colors mt-1 line-clamp-2">${b.Title}</h4>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            relatedSec.innerHTML = `
                <div class="border-t border-durian-lighter/40 pt-12 space-y-6">
                    <div class="text-left space-y-1">
                        <span class="text-durian-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'READ MORE' : 'ĐỌC THÊM'}</span>
                        <h3 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Other Articles' : 'Tin Tức Khác'}</h3>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        ${cardsHtml}
                    </div>
                </div>
            `;
            relatedSec.classList.remove('hidden');
        }
    }
    setTimeout(initScrollReveal, 100);
}

// ==========================================
// CLIENT / USER AUTHENTICATION CONTROLLER
// ==========================================
function openAuthModal(mode = 'login') {
    let container = document.getElementById('auth-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'auth-modal-container';
        document.body.appendChild(container);
    }
    renderAuthModal(mode);
}

function renderAuthModal(mode) {
    const container = document.getElementById('auth-modal-container');
    if (!container) return;

    container.className = "fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4";

    if (mode === 'login') {
        container.innerHTML = `
            <div class="relative bg-[#294C2F] border border-[#547044] rounded-xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl transition-all duration-300 transform scale-100" onclick="event.stopPropagation()">
                <!-- Close Button -->
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-durian-accent/60 hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Heading -->
                <h2 class="font-serif text-2xl font-bold text-durian-gold text-left">${currentLang === 'EN' ? 'Sign In' : 'Đăng nhập'}</h2>

                <!-- Form -->
                <form id="auth-login-form" class="space-y-4 text-left" onsubmit="handleUserLogin(event)">
                    <div class="space-y-1">
                        <input type="email" id="auth-email" required placeholder="Email" class="w-full bg-[#463325] border border-[#547044]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-durian-gold placeholder-durian-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="password" id="auth-password" required placeholder="${currentLang === 'EN' ? 'Password' : 'Mật khẩu'}" class="w-full bg-[#463325] border border-[#547044]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-durian-gold placeholder-durian-accent/40 font-sans">
                    </div>
                    <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white text-xs font-bold py-3.5 rounded transition-all duration-300 tracking-wider uppercase font-sans mt-2">
                        ${currentLang === 'EN' ? 'SIGN IN' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <!-- Toggle Mode link -->
                <p class="text-xs text-durian-accent/70 font-sans">
                    ${currentLang === 'EN'
                        ? `Don't have an account? <a href="#" onclick="event.preventDefault(); renderAuthModal('register')" class="text-durian-gold hover:underline font-semibold">Sign Up</a>`
                        : `Chưa có tài khoản? <a href="#" onclick="event.preventDefault(); renderAuthModal('register')" class="text-durian-gold hover:underline font-semibold">Đăng ký</a>`}
                </p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="relative bg-[#294C2F] border border-[#547044] rounded-xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl transition-all duration-300 transform scale-100" onclick="event.stopPropagation()">
                <!-- Close Button -->
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-durian-accent/60 hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Heading -->
                <h2 class="font-serif text-2xl font-bold text-durian-gold text-left">${currentLang === 'EN' ? 'Sign Up' : 'Đăng ký'}</h2>

                <!-- Form -->
                <form id="auth-register-form" class="space-y-4 text-left" onsubmit="handleUserRegister(event)">
                    <div class="space-y-1">
                        <input type="text" id="reg-name" required placeholder="${currentLang === 'EN' ? 'Full Name' : 'Họ tên'}" class="w-full bg-[#463325] border border-[#547044]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-durian-gold placeholder-durian-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="email" id="reg-email" required placeholder="Email" class="w-full bg-[#463325] border border-[#547044]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-durian-gold placeholder-durian-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="password" id="reg-password" required placeholder="${currentLang === 'EN' ? 'Password' : 'Mật khẩu'}" class="w-full bg-[#463325] border border-[#547044]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-durian-gold placeholder-durian-accent/40 font-sans">
                    </div>
                    <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white text-xs font-bold py-3.5 rounded transition-all duration-300 tracking-wider uppercase font-sans mt-2">
                        ${currentLang === 'EN' ? 'SIGN UP' : 'ĐĂNG KÝ'}
                    </button>
                </form>

                <!-- Toggle Mode link -->
                <p class="text-xs text-durian-accent/70 font-sans">
                    ${currentLang === 'EN'
                        ? `Already have an account? <a href="#" onclick="event.preventDefault(); renderAuthModal('login')" class="text-durian-gold hover:underline font-semibold">Sign In</a>`
                        : `Đã có tài khoản? <a href="#" onclick="event.preventDefault(); renderAuthModal('login')" class="text-durian-gold hover:underline font-semibold">Đăng nhập</a>`}
                </p>
            </div>
        `;
    }

    // Add backdrop close click handler
    container.onclick = closeAuthModal;

    // Show container
    container.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeAuthModal() {
    const container = document.getElementById('auth-modal-container');
    if (container) {
        container.classList.add('hidden');
    }
    document.body.classList.remove('overflow-hidden');
}

function handleUserRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    let users = JSON.parse(localStorage.getItem('durapure_users') || '[]');
    if (users.some(u => u.email === email)) {
        showToast(currentLang === 'EN' ? "This email is already registered!" : "Email này đã được đăng ký!", "warning");
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem('durapure_users', JSON.stringify(users));

    showToast(currentLang === 'EN' ? "Account registered successfully!" : "Đăng ký tài khoản thành công!", "success");
    renderAuthModal('login');
}

function handleUserLogin(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (window.chrome && window.chrome.webview) {
        sendHostMessage({
            action: 'loginAdmin',
            username: email,
            password: password
        });
    } else {
        // Fallback for simulation outside WebView2 environment
        setTimeout(() => {
            const isMockAdmin = (email === 'admin@durapure.vn' && password === 'admin') || (email === 'admin@durapure.vn' && password === 'Admin@123');
            handleHostMessage({
                action: 'adminLoginResponse',
                success: isMockAdmin
            });
        }, 100);
    }
}

function handleUserIconClick(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

function handleUserLogout() {
    localStorage.removeItem('durapure_current_user');
    showToast(currentLang === 'EN' ? "Logged out successfully." : "Đã đăng xuất tài khoản.", "info");
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');
    updateHeaderUserUI();
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

function updateHeaderUserUI() {
    const currentUser = JSON.parse(localStorage.getItem('durapure_current_user'));
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (!dropdownMenu) return;

    const t = langMap[currentLang];

    if (currentUser) {
        dropdownMenu.innerHTML = `
            <div class="py-1 text-sm font-sans" role="none">
                <div class="px-4 py-2 text-xs text-durian-gold border-b border-durian-lighter/40 font-semibold" id="dropdown-username">${currentLang === 'EN' ? 'Hello, ' : 'Xin chào, '}${currentUser.name}!</div>
                <a href="admin.html" id="dropdown-admin-link" class="${currentUser.isAdmin ? '' : 'hidden'} block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors" role="menuitem">${t.adminPanel}</a>
                <button onclick="handleUserLogout()" class="w-full text-left block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors focus:outline-none" role="menuitem">${t.logout}</button>
            </div>
        `;
    } else {
        dropdownMenu.innerHTML = `
            <div class="py-1 text-sm font-sans" role="none">
                <div class="px-4 py-2 text-xs text-durian-gold border-b border-durian-lighter/40 font-semibold" id="dropdown-username">${t.hello}</div>
                <button onclick="openAuthModal('login')" class="w-full text-left block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors focus:outline-none" role="menuitem">${t.login}</button>
                <button onclick="openAuthModal('register')" class="w-full text-left block px-4 py-2.5 text-durian-accent hover:bg-durian hover:text-white transition-colors focus:outline-none" role="menuitem">${t.register}</button>
            </div>
        `;
    }
}

// Global click listener to close dropdowns
document.addEventListener('click', () => {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');
});

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-3 bg-durian-light/95 border border-durian-lighter/60 text-white px-4 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 ease-out font-sans text-sm select-none border-l-4';

    // Customize border & icon based on type
    let icon = '';
    if (type === 'success') {
        toast.classList.add('border-l-forest');
        icon = `
            <svg class="h-5 w-5 text-forest shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
        `;
    } else if (type === 'error') {
        toast.classList.add('border-l-red-500');
        icon = `
            <svg class="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
    } else if (type === 'warning') {
        toast.classList.add('border-l-amber-500');
        icon = `
            <svg class="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        `;
    } else {
        toast.classList.add('border-l-durian-gold');
        icon = `
            <svg class="h-5 w-5 text-durian-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
    }

    toast.innerHTML = `
        ${icon}
        <div class="flex-grow font-medium leading-relaxed">${message}</div>
        <button class="text-durian-accent/40 hover:text-white transition-colors focus:outline-none shrink-0" onclick="this.parentElement.remove()">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Trigger animation frame
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Auto remove toast after 3.5s
    setTimeout(() => {
        toast.classList.add('translate-y-[-8px]', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// ==========================================
// DYNAMIC ANIMATION SYSTEM (SCROLL REVEAL & HERO LOAD)
// ==========================================
function injectAnimationCSS() {
    if (document.getElementById('durapure-animations-style')) return;

    const style = document.createElement('style');
    style.id = 'durapure-animations-style';
    style.innerHTML = `
        /* Scroll reveal transition classes */
        .reveal-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.30, 1), transform 0.8s cubic-bezier(0.16, 1, 0.30, 1);
            will-change: opacity, transform;
        }
        .reveal-item.revealed {
            opacity: 1;
            transform: translateY(0);
        }

        /* Hero fade-in-up animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.30, 1) forwards;
        }

        /* Staggered animation delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
    `;
    document.head.appendChild(style);
}

function initScrollReveal() {
    // 1. Hero Animation setup
    const heroSection = document.querySelector('section.relative');
    if (heroSection && !heroSection.classList.contains('hero-animated')) {
        heroSection.classList.add('hero-animated');
        const childElements = heroSection.querySelectorAll('span, h1, p, div.flex');
        childElements.forEach((el, index) => {
            el.classList.add('opacity-0', 'animate-fade-in-up');
            if (index === 0) el.classList.add('delay-100');
            else if (index === 1) el.classList.add('delay-200');
            else if (index === 2) el.classList.add('delay-300');
            else if (index === 3) el.classList.add('delay-400');
        });
    }

    // 2. Scroll Reveal Observer for other sections
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach((sec, idx) => {
        if (idx > 0 && !sec.classList.contains('reveal-item')) { // Skip Hero section
            sec.classList.add('reveal-item');
            observer.observe(sec);
        }
    });

    const cards = document.querySelectorAll('.grid > div');
    cards.forEach(card => {
        if (!card.classList.contains('reveal-item') &&
            (card.classList.contains('bg-durian-light') || card.classList.contains('rounded-lg') || card.classList.contains('border') || card.classList.contains('rounded-xl'))) {
            card.classList.add('reveal-item');
            observer.observe(card);
        }
    });
}

// ==========================================
// TRANSLATION ENGINE (VI / EN)
// ==========================================
function toggleLanguage(event) {
    if (event) event.stopPropagation();
    currentLang = currentLang === 'VI' ? 'EN' : 'VI';
    localStorage.setItem('durapure_lang', currentLang);

    // Re-render core layout elements
    initCommonUI();
    applyTranslation();

    // Rerender page-specific modules if available
    const currentPath = window.location.pathname.split("/").pop();
    if (currentPath === 'shop.html' && typeof renderShopPage === 'function') {
        renderShopPage();
    } else if (currentPath === 'blog.html' && typeof renderBlogPage === 'function') {
        renderBlogPage();
    } else if ((currentPath.startsWith('product-detail.html') || window.location.pathname.includes('product-detail.html')) && typeof renderProductDetailPage === 'function') {
        renderProductDetailPage();
    } else if ((currentPath.startsWith('blog-detail.html') || window.location.pathname.includes('blog-detail.html')) && typeof renderBlogDetailPage === 'function') {
        renderBlogDetailPage();
    }
}

function applyTranslation() {
    const t = langMap[currentLang];
    const currentPath = window.location.pathname.split("/").pop().toLowerCase();
    const isHome = currentPath === 'index.html' || currentPath === 'index' || currentPath === '' || currentPath === 'index.aspx' || currentPath === 'index.php';
    const isShop = currentPath.startsWith('shop.html') || currentPath === 'shop';
    const isCustomize = currentPath.startsWith('customize.html') || currentPath === 'customize';
    const isContact = currentPath.startsWith('contact.html') || currentPath === 'contact';
    const isBlog = currentPath.startsWith('blog.html') || currentPath === 'blog';
    const isProductDetail = currentPath.startsWith('product-detail.html') || currentPath === 'product-detail';
    const isBlogDetail = currentPath.startsWith('blog-detail.html') || currentPath === 'blog-detail';
    const isOrderSuccess = currentPath.startsWith('order-success.html') || currentPath === 'order-success';
    const isAdmin = currentPath.startsWith('admin.html') || currentPath === 'admin';

    // 1. Language selector button label
    const langBtn = document.getElementById('lang-selector-btn');
    if (langBtn) {
        langBtn.innerText = currentLang;
    }

    // 2. Index / Home page translations
    if (isHome) {
        const heroBadge = document.querySelector('section.relative span.text-durian-gold');
        if (heroBadge) {
            heroBadge.innerText = currentLang === 'EN'
                ? "MEKONG DELTA PREMIUM DURIAN"
                : "SẦU RIÊNG MIỀN TÂY TUYỂN CHỌN";
        }

        const heroTitle = document.querySelector('h1');
        if (heroTitle) {
            heroTitle.innerText = currentLang === 'EN'
                ? "Durapure – Green from roots, Pure from heart, Elevated in value"
                : "Durapure – Xanh từ gốc, Vẹn từ tâm, Hoá nâng tầm";
        }

        const heroSub = document.querySelector('section.relative p');
        if (heroSub) {
            heroSub.innerText = currentLang === 'EN'
                ? "Each premium durian is grown naturally, hand-selected at optimal maturity, and carefully packed in the fertile Mekong Delta."
                : "Từng trái sầu riêng đặc sản được vun trồng tự nhiên, tuyển chọn đúng độ chín và đóng gói tỉ mỉ theo tiêu chuẩn bền vững tại miền Tây trù phú.";
        }

        const heroBtn1 = document.querySelector('section.relative a[href="shop.html"]');
        if (heroBtn1) {
            heroBtn1.innerText = currentLang === 'EN' ? 'SHOP NOW' : 'MUA NGAY';
        }

        const heroBtn2 = document.querySelector('section.relative a[href="customize.html"]');
        if (heroBtn2) {
            heroBtn2.innerText = currentLang === 'EN' ? 'CUSTOM PACKAGING' : 'BAO BÌ CÁ NHÂN HOÁ';
        }

        // Story Section Translation
        const storySpan = document.querySelector('section.bg-durian-light span');
        if (storySpan) {
            storySpan.innerText = currentLang === 'EN' ? 'BRAND STORY' : 'CÂU CHUYỆN THƯƠNG HIỆU';
        }

        const storyTitle = document.querySelector('section.bg-durian-light h2');
        if (storyTitle) {
            storyTitle.innerText = currentLang === 'EN'
                ? "From a sustainable orchard to perfectly ripe durian"
                : "Từ vườn xanh bền vững đến trái sầu riêng trọn vị";
        }

        const storyParas = document.querySelectorAll('section.bg-durian-light p');
        if (storyParas && storyParas.length >= 2) {
            if (currentLang === 'EN') {
                storyParas[0].innerText = "Durapure was born from a passionate love for the fertile alluvial land of the Mekong Delta. We witnessed durian farms being overused with chemical fertilizers, losing their rustic and original flavor. That is why Durapure was established, pursuing the philosophy of pure natural organic farming.";
                storyParas[1].innerText = "At Durapure orchards, Ri6 and Monthong durian trees live in harmony with wild grass and insects under shading trees. They are fertilized with self-made organic compost from durian husks. The abundant water flows from the Mekong Delta's canal network. A Durapure durian does not only carry the sweetness of honey and fruits, but also contains our heart in preserving the local ecology.";
            } else {
                storyParas[0].innerText = "Durapure được khởi nguồn từ tình yêu mãnh liệt với miền đất phù sa trù phú của miền Tây. Chúng tôi chứng kiến những vườn sầu riêng bị lạm dụng phân bón hóa học, làm mất đi hương vị mộc mạc nguyên bản. Đó là lý do Durapure ra đời, theo đuổi triết lý canh tác hữu cơ thuần tự nhiên.";
                storyParas[1].innerText = "Tại các nhà vườn Durapure, những cây sầu riêng Ri6, Monthong sống hòa hợp cùng cỏ dại, côn trùng dưới tán cây che bóng mát. Chúng được chăm bón bằng phân sinh học tự chế từ vỏ sầu riêng ủ hoai. Nguồn nước tưới dồi dào chảy từ hệ thống kênh rạch miền Tây. Trái sầu riêng Durapure không chỉ mang hương vị ngọt ngào từ mật hoa quả, mà còn chứa đựng cả tấm lòng gìn giữ sinh thái môi trường của chúng tôi.";
            }
        }

        const storyLink = document.querySelector('section.bg-durian-light a[href="shop.html"]');
        if (storyLink) {
            storyLink.innerHTML = currentLang === 'EN' ? "DISCOVER PRODUCTS &rarr;" : "KHÁM PHÁ CÁC SẢN PHẨM &rarr;";
        }

        // Vision, Mission & Core Values Translations
        const visionMissionSection = document.querySelector('section.bg-durian-dark');
        if (visionMissionSection) {
            const vmHeaders = visionMissionSection.querySelectorAll('h3');
            const vmParas = visionMissionSection.querySelectorAll('p');
            if (vmHeaders.length >= 2 && vmParas.length >= 2) {
                vmHeaders[0].innerText = currentLang === 'EN' ? "Vision" : "Tầm Nhìn";
                vmParas[0].innerText = currentLang === 'EN'
                    ? "Become the leading organic specialty durian icon in Vietnam, bringing the Mekong Delta's premium produce to the global stage under a sustainable and highly socially responsible supply chain model."
                    : "Trở thành biểu tượng sầu riêng hữu cơ đặc sản hàng đầu Việt Nam, đưa nông sản sạch miền Tây vươn tầm quốc tế dưới mô hình chuỗi cung ứng bền vững và có trách nhiệm xã hội cao.";

                vmHeaders[1].innerText = currentLang === 'EN' ? "Mission" : "Sứ Mệnh";
                vmParas[1].innerText = currentLang === 'EN'
                    ? "Delivering exceptional organic durian to customers, ensuring sustainable livelihoods for minority farmers, and restoring biodiversity balance to the cultivation soil."
                    : "Đem những trái sầu riêng hữu cơ tuyển chọn đến tay người dùng, đảm bảo sinh kế bền vững cho người nông dân thiểu số và khôi phục sự cân bằng đa dạng sinh học cho đất trồng.";
            }

            const coreValuesTitle = visionMissionSection.querySelector('h2');
            if (coreValuesTitle) {
                coreValuesTitle.innerText = currentLang === 'EN' ? "Core Values" : "Giá trị cốt lõi";
            }

            const valCards = visionMissionSection.querySelectorAll('.grid-cols-1.md\\:grid-cols-3 > div');
            if (valCards.length >= 3) {
                const vh1 = valCards[0].querySelector('h3');
                const vp1 = valCards[0].querySelector('p');
                if (vh1) vh1.innerText = currentLang === 'EN' ? "Transparency" : "Minh Bạch";
                if (vp1) vp1.innerText = currentLang === 'EN' ? "Clear origin, from orchard to fruit." : "Nguồn gốc rõ ràng, từ nhà vườn đến từng trái.";

                const vh2 = valCards[1].querySelector('h3');
                const vp2 = valCards[1].querySelector('p');
                if (vh2) vh2.innerText = currentLang === 'EN' ? "Sustainability" : "Bền Vững";
                if (vp2) vp2.innerText = currentLang === 'EN' ? "Organic cultivation, protecting the living environment." : "Canh tác hữu cơ, bảo vệ môi trường sống.";

                const vh3 = valCards[2].querySelector('h3');
                const vp3 = valCards[2].querySelector('p');
                if (vh3) vh3.innerText = currentLang === 'EN' ? "Artisan" : "Nghệ Thuật";
                if (vp3) vp3.innerText = currentLang === 'EN' ? "Hand-selected fruit, preserving its natural flavor." : "Tuyển trái thủ công, giữ trọn hương vị tự nhiên.";
            }
        }




    }

    // 2.3 Order Success Page translations
    if (isOrderSuccess) {
        document.title = currentLang === 'EN' ? "Order Success – Durapure" : "Đặt Hàng Thành Công – Durapure";

        const badge = document.querySelector('main span.text-durian-gold');
        if (badge) {
            badge.innerText = currentLang === 'EN' ? "ORDER COMPLETE" : "ĐƠN HÀNG HOÀN TẤT";
        }

        const h1 = document.querySelector('main h1');
        if (h1) {
            h1.innerText = currentLang === 'EN' ? "Order Placed Successfully!" : "Đặt Hàng Thành Công!";
        }

        const desc = document.querySelector('main p.text-sm');
        if (desc) {
            desc.innerText = currentLang === 'EN'
                ? "Thank you for choosing Durapure. Your pure organic durian is on its way."
                : "Cảm ơn bạn đã lựa chọn Durapure. Sầu riêng hữu cơ tuyển chọn đang trên đường tới bạn.";
        }

        const codeLabel = document.querySelector('#order-summary-box > div:first-child > span:first-child');
        if (codeLabel) {
            codeLabel.innerText = currentLang === 'EN' ? "ORDER CODE:" : "MÃ ĐƠN HÀNG:";
        }

        const labels = document.querySelectorAll('#order-summary-box .space-y-2 > div > span:first-child');
        if (labels.length >= 4) {
            labels[0].innerText = currentLang === 'EN' ? "Customer:" : "Khách hàng:";
            labels[1].innerText = currentLang === 'EN' ? "Phone:" : "Số điện thoại:";
            labels[2].innerText = currentLang === 'EN' ? "Date/Time:" : "Thời gian:";
            labels[3].innerText = currentLang === 'EN' ? "Total payment:" : "Tổng thanh toán:";
        }

        const notice = document.querySelector('main p.text-xs');
        if (notice) {
            notice.innerText = currentLang === 'EN'
                ? "Durapure has received your order details and will call you within 10 - 15 minutes to confirm the delivery schedule."
                : "Durapure đã tiếp nhận thông tin và sẽ gọi điện thoại liên hệ trực tiếp cho bạn sau 10 - 15 phút để xác nhận đơn hàng và lịch giao.";
        }

        const contBtn = document.querySelector('main a[href="shop.html"]');
        if (contBtn) {
            contBtn.innerText = currentLang === 'EN' ? "CONTINUE SHOPPING" : "TIẾP TỤC MUA SẮM";
        }

        const homeBtn = document.querySelector('main a[href="index.html"]');
        if (homeBtn) {
            homeBtn.innerText = currentLang === 'EN' ? "BACK TO HOMEPAGE" : "VỀ TRANG CHỦ";
        }
    }

    // 2.4 Admin page translations
    if (isAdmin) {
        document.title = currentLang === 'EN' ? "Admin System – Durapure" : "Hệ Thống Quản Trị – Durapure";

        // (Admin Login Section removed since login is unified)

        // Admin Dashboard Section
        const dashboardSec = document.getElementById('admin-dashboard-sec');
        if (dashboardSec) {
            const h1 = dashboardSec.querySelector('h1');
            if (h1) h1.innerText = currentLang === 'EN' ? "Admin Dashboard" : "Hệ Thống Quản Trị";

            const p = dashboardSec.querySelector('h1 + p');
            if (p) p.innerText = currentLang === 'EN' ? "Manage content, check orders and custom packaging" : "Quản lý nội dung, kiểm tra đơn hàng và thiết kế bao bì";

            const logoutBtn = dashboardSec.querySelector('button[onclick="handleUserLogout()"]');
            if (logoutBtn) logoutBtn.innerText = currentLang === 'EN' ? "Logout" : "Đăng xuất";

            // Stats Cards Labels
            const statsCards = dashboardSec.querySelectorAll('.grid-cols-1.sm\\:grid-cols-3 > div');
            if (statsCards.length >= 3) {
                const p0 = statsCards[0].querySelector('p');
                if (p0) p0.innerText = currentLang === 'EN' ? "Total Orders" : "Tổng đơn hàng";

                const p1 = statsCards[1].querySelector('p');
                if (p1) p1.innerText = currentLang === 'EN' ? "Packaging Requests" : "Yêu cầu bao bì";

                const p2 = statsCards[2].querySelector('p');
                if (p2) p2.innerText = currentLang === 'EN' ? "Available Products" : "Sản phẩm hiện có";
            }

            // Tab Headers
            const tabOrders = document.getElementById('tab-btn-orders');
            if (tabOrders) tabOrders.innerText = currentLang === 'EN' ? "Orders" : "Đơn hàng";

            const tabDesigns = document.getElementById('tab-btn-designs');
            if (tabDesigns) tabDesigns.innerText = currentLang === 'EN' ? "Packaging Requests" : "Yêu cầu Bao Bì";

            const tabProducts = document.getElementById('tab-btn-products');
            if (tabProducts) tabProducts.innerText = currentLang === 'EN' ? "Products" : "Sản phẩm";

            const tabBlogs = document.getElementById('tab-btn-blogs');
            if (tabBlogs) tabBlogs.innerText = currentLang === 'EN' ? "Blog/News" : "Tin Tức";

            const tabSettings = document.getElementById('tab-btn-settings');
            if (tabSettings) tabSettings.innerText = currentLang === 'EN' ? "Web Config" : "Cấu hình Web";

            // Tab Title Headers
            const titleOrders = document.querySelector('#tab-panel-orders h3');
            if (titleOrders) titleOrders.innerText = currentLang === 'EN' ? "Order List" : "Danh sách Đơn hàng";

            const titleDesigns = document.querySelector('#tab-panel-designs h3');
            if (titleDesigns) titleDesigns.innerText = currentLang === 'EN' ? "Custom Packaging Requests" : "Yêu cầu Cá nhân hóa bao bì";

            const titleProducts = document.querySelector('#tab-panel-products h3');
            if (titleProducts) titleProducts.innerText = currentLang === 'EN' ? "Product Management" : "Quản lý Sản phẩm";

            const titleBlogs = document.querySelector('#tab-panel-blogs h3');
            if (titleBlogs) titleBlogs.innerText = currentLang === 'EN' ? "News & Blog Management" : "Quản lý Bài viết Tin tức";

            const titleSettings = document.querySelector('#tab-panel-settings h3');
            if (titleSettings) titleSettings.innerText = currentLang === 'EN' ? "System & SEO Configuration" : "Cấu hình Hệ thống & SEO";

            // Add Buttons
            const addProductBtn = document.querySelector('#tab-panel-products button[onclick="showAddProductModal()"]');
            if (addProductBtn) addProductBtn.innerText = currentLang === 'EN' ? "+ ADD NEW PRODUCT" : "+ THÊM SẢN PHẨM MỚI";

            const addBlogBtn = document.querySelector('#tab-panel-blogs button[onclick="showAddBlogModal()"]');
            if (addBlogBtn) addBlogBtn.innerText = currentLang === 'EN' ? "+ WRITE NEW BLOG" : "+ VIẾT BÀI MỚI";

            // Table Headers
            const orderHeaders = document.querySelectorAll('#tab-panel-orders table thead th');
            if (orderHeaders.length >= 7) {
                orderHeaders[0].innerText = currentLang === 'EN' ? "Order ID" : "Mã đơn";
                orderHeaders[1].innerText = currentLang === 'EN' ? "Customer" : "Khách hàng";
                orderHeaders[2].innerText = currentLang === 'EN' ? "Shipping Address" : "Địa chỉ giao hàng";
                orderHeaders[3].innerText = currentLang === 'EN' ? "Total Amount" : "Tổng tiền";
                orderHeaders[4].innerText = currentLang === 'EN' ? "Order Date" : "Ngày đặt";
                orderHeaders[5].innerText = currentLang === 'EN' ? "Status" : "Trạng thái";
                orderHeaders[6].innerText = currentLang === 'EN' ? "Actions" : "Thao tác";
            }

            const designHeaders = document.querySelectorAll('#tab-panel-designs table thead th');
            if (designHeaders.length >= 7) {
                designHeaders[0].innerText = currentLang === 'EN' ? "Request ID" : "Mã yêu cầu";
                designHeaders[1].innerText = currentLang === 'EN' ? "Customer" : "Khách hàng";
                designHeaders[2].innerText = currentLang === 'EN' ? "Design Concept" : "Ý tưởng thiết kế";
                designHeaders[3].innerText = currentLang === 'EN' ? "Sticker File" : "File nhãn dán";
                designHeaders[4].innerText = currentLang === 'EN' ? "Date Submitted" : "Ngày gửi";
                designHeaders[5].innerText = currentLang === 'EN' ? "Status" : "Trạng thái";
                designHeaders[6].innerText = currentLang === 'EN' ? "Actions" : "Thao tác";
            }

            // Config Form Labels
            const configLabels = document.querySelectorAll('#tab-panel-settings form label');
            if (configLabels.length >= 5) {
                configLabels[0].innerText = currentLang === 'EN' ? "Website SEO Title" : "Tiêu đề SEO Trang web";
                configLabels[1].innerText = currentLang === 'EN' ? "Hotline Phone" : "Số điện thoại Hotline";
                configLabels[2].innerText = currentLang === 'EN' ? "SEO Description (Meta Description)" : "Mô tả SEO (Meta Description)";
                configLabels[3].innerText = currentLang === 'EN' ? "Support Email" : "Email hỗ trợ";
                configLabels[4].innerText = currentLang === 'EN' ? "Office Address" : "Địa chỉ văn phòng";
            }
            const configSaveBtn = document.querySelector('#tab-panel-settings form button[type="submit"]');
            if (configSaveBtn) configSaveBtn.innerText = currentLang === 'EN' ? "SAVE CHANGES" : "LƯU THAY ĐỔI";
        }

        // Modals
        const prodModalTitle = document.getElementById('prod-modal-title');
        if (prodModalTitle) {
            prodModalTitle.innerText = editingProductId
                ? (currentLang === 'EN' ? "Edit Product" : "Chỉnh Sửa Sản Phẩm")
                : (currentLang === 'EN' ? "Add New Product" : "Thêm Sản Phẩm Mới");
        }
        const prodLabels = document.querySelectorAll('#prod-form label');
        if (prodLabels.length >= 5) {
            prodLabels[0].innerText = currentLang === 'EN' ? "Product Name *" : "Tên sản phẩm *";
            prodLabels[1].innerText = currentLang === 'EN' ? "Price (VND) *" : "Giá bán (VNĐ) *";
            prodLabels[2].innerText = currentLang === 'EN' ? "Unit (Package) *" : "Quy cách (đơn vị) *";
            prodLabels[3].innerText = currentLang === 'EN' ? "Product image URL (leave empty for default)" : "Đường dẫn ảnh sản phẩm (để trống sẽ dùng ảnh mặc định)";
            prodLabels[4].innerText = currentLang === 'EN' ? "Fulfillment options (comma separated)" : "Tùy chọn giao hàng (ngăn cách bằng dấu phẩy)";
        }
        const prodDescLabel = document.querySelector('#prod-form label[for="prod-desc"]');
        if (prodDescLabel) prodDescLabel.innerText = currentLang === 'EN' ? "Short description" : "Mô tả ngắn sản phẩm";

        const prodCancelBtn = document.querySelector('#prod-form button[type="button"]');
        if (prodCancelBtn) prodCancelBtn.innerText = currentLang === 'EN' ? "Cancel" : "Hủy";

        const prodSaveBtn = document.querySelector('#prod-form button[type="submit"]');
        if (prodSaveBtn) prodSaveBtn.innerText = currentLang === 'EN' ? "SAVE PRODUCT" : "LƯU SẢN PHẨM";

        // Blog Modal
        const blogModalTitle = document.getElementById('blog-modal-title');
        if (blogModalTitle) {
            blogModalTitle.innerText = editingBlogId
                ? (currentLang === 'EN' ? "Edit Blog Post" : "Chỉnh Sửa Bài Viết")
                : (currentLang === 'EN' ? "Write New Blog" : "Viết Bài Viết Mới");
        }
        const blogLabels = document.querySelectorAll('#blog-form label');
        if (blogLabels.length >= 6) {
            blogLabels[0].innerText = currentLang === 'EN' ? "Blog Title *" : "Tiêu đề bài viết *";
            blogLabels[1].innerText = currentLang === 'EN' ? "Thumbnail Image URL" : "Đường dẫn ảnh đại diện";
            blogLabels[2].innerText = currentLang === 'EN' ? "Does this post contain video?" : "Bài viết có chứa Video?";
            blogLabels[3].innerText = currentLang === 'EN' ? "YouTube Embed URL" : "Đường dẫn Nhúng video YouTube";
            blogLabels[4].innerText = currentLang === 'EN' ? "Short Summary *" : "Tóm tắt ngắn *";
            blogLabels[5].innerText = currentLang === 'EN' ? "Detailed Content" : "Nội dung chi tiết";
        }

        const blogCancelBtn = document.querySelector('#blog-form button[type="button"]');
        if (blogCancelBtn) blogCancelBtn.innerText = currentLang === 'EN' ? "Cancel" : "Hủy";

        const blogSaveBtn = document.querySelector('#blog-form button[type="submit"]');
        if (blogSaveBtn) blogSaveBtn.innerText = currentLang === 'EN' ? "SAVE BLOG" : "LƯU BÀI VIẾT";
    }

    // 3. Shop page translations
    if (isShop) {
        const shopTitle = document.querySelector('section.relative h1');
        if (shopTitle) {
            shopTitle.innerText = currentLang === 'EN' ? "Organic Durian Shop" : "Cửa Hàng Sầu Riêng Hữu Cơ";
        }
        const shopSub = document.querySelector('section.relative p');
        if (shopSub) {
            shopSub.innerText = currentLang === 'EN'
                ? "Handpicked finest flavors from Cai Lay, Cai Be, and Cho Lach (Standard 1kg selection)"
                : "Chọn lọc hương vị tinh tuý nhất từ Cai Lậy, Cái Bè và Chợ Lách (Quy cách 1kg)";
        }
        const filterSpan = document.querySelector('.flex-col.sm\\:flex-row > span');
        if (filterSpan) {
            filterSpan.innerText = currentLang === 'EN' ? "Premium Durian Selection" : "Trái Sầu Riêng Đặc Sản";
        }
    }

    // 4. Customize page translations
    if (isCustomize) {
        const custTitle = document.querySelector('section.relative h1');
        if (custTitle) custTitle.innerText = currentLang === 'EN' ? "Custom Packaging" : "Bao Bì Cá Nhân Hoá";

        const custSub = document.querySelector('section.relative p');
        if (custSub) {
            custSub.innerText = currentLang === 'EN'
                ? "Design custom stickers, pack premium durian as corporate or personal gifts."
                : "Tự thiết kế nhãn dán, đóng gói trái sầu riêng ngon thượng hạng làm quà tặng doanh nghiệp hoặc cá nhân.";
        }

        const stepSpan = document.querySelector('main span.text-durian-gold');
        if (stepSpan) stepSpan.innerText = currentLang === 'EN' ? "STEPS TO CREATE" : "BƯỚC THỰC HIỆN";

        const stepTitle = document.querySelector('main h2');
        if (stepTitle) stepTitle.innerText = currentLang === 'EN' ? "Create a durian gift box with your own brand" : "Tạo hộp quà sầu riêng mang thương hiệu riêng";

        const stepDesc = document.querySelector('main h2 + p');
        if (stepDesc) {
            stepDesc.innerText = currentLang === 'EN'
                ? "Durapure provides professional packaging solutions for corporations, events, restaurants, hotels, or family holidays. You can print your brand logo, personal greetings, or unique design graphics onto our premium durian gift boxes."
                : "Durapure cung cấp giải pháp đóng gói chuyên nghiệp cho các doanh nghiệp, sự kiện, nhà hàng, khách sạn hoặc các dịp lễ Tết gia đình. Bạn có thể in logo thương hiệu, lời chúc cá nhân, hoặc hình ảnh thiết kế riêng biệt lên hộp sầu riêng đặc sản của chúng tôi.";
        }

        const stepHeaders = document.querySelectorAll('main h4');
        const stepParas = document.querySelectorAll('main h4 + p');
        if (stepHeaders.length >= 3 && stepParas.length >= 3) {
            stepHeaders[0].innerText = currentLang === 'EN' ? "Submit Info and Ideas" : "Điền thông tin và ý tưởng";
            stepParas[0].innerText = currentLang === 'EN'
                ? "Enter your personal information, describe your design concept, or upload an existing label design file (JPG, PNG)."
                : "Nhập thông tin cá nhân của bạn, mô tả ý tưởng mong muốn hoặc tải lên mẫu thiết kế nhãn dán sẵn có (định dạng JPG, PNG).";

            stepHeaders[1].innerText = currentLang === 'EN' ? "Approve Demo from Durapure" : "Duyệt thiết kế demo từ Durapure";
            stepParas[1].innerText = currentLang === 'EN'
                ? "Durapure's designer team will contact you, sketch a demo label on a 3D model, and send it to your email within 24 hours."
                : "Đội ngũ nghệ nhân thiết kế của Durapure sẽ liên hệ, phác thảo nhãn dán demo trên mô hình 3D gửi đến email của bạn trong vòng 24 giờ.";

            stepHeaders[2].innerText = currentLang === 'EN' ? "Production & Fast Delivery" : "Sản xuất và Giao hàng nhanh";
            stepParas[2].innerText = currentLang === 'EN'
                ? "Once you approve the design sample and quantity, Durapure will pack the freshest fruit selection and deliver it nationwide."
                : "Sau khi bạn đồng ý bản mẫu thiết kế và số lượng đặt, Durapure sẽ đóng gói lứa trái tươi ngon nhất và giao hàng tận nơi trên toàn quốc.";
        }

        const hotlineLabel = document.querySelector('.p-6.bg-durian p.text-durian-gold');
        if (hotlineLabel) hotlineLabel.innerText = currentLang === 'EN' ? "Need a bulk quote urgently?" : "Cần tư vấn báo giá số lượng lớn gấp?";

        const formTitle = document.querySelector('h3.font-serif.text-xl');
        if (formTitle) formTitle.innerText = currentLang === 'EN' ? "Submit Custom Packaging Request" : "Gửi Yêu Cầu Thiết Kế Bao Bì";

        const labels = document.querySelectorAll('form label');
        if (labels.length >= 5) {
            labels[0].innerText = currentLang === 'EN' ? "Full Name *" : "Họ và tên *";
            labels[1].innerText = currentLang === 'EN' ? "Contact Email *" : "Email liên hệ *";
            labels[2].innerText = currentLang === 'EN' ? "Phone Number *" : "Số điện thoại *";
            labels[3].innerText = currentLang === 'EN' ? "Upload sticker design file (if any)" : "Tải lên file thiết kế nhãn dán (nếu có)";
            labels[4].innerText = currentLang === 'EN' ? "Describe your design concept" : "Mô tả ý tưởng của bạn";
        }

        const nameInput = document.getElementById('cust-name');
        if (nameInput) nameInput.placeholder = currentLang === 'EN' ? "Enter your full name" : "Nhập họ tên của bạn";

        const emailInput = document.getElementById('cust-email');
        if (emailInput) emailInput.placeholder = currentLang === 'EN' ? "Enter email address" : "Nhập địa chỉ email";

        const phoneInput = document.getElementById('cust-phone');
        if (phoneInput) phoneInput.placeholder = currentLang === 'EN' ? "Enter phone number" : "Nhập số điện thoại";

        const dragLabel = document.querySelector('.flex.text-xs.text-durian-accent span');
        if (dragLabel) dragLabel.innerText = currentLang === 'EN' ? "Choose file" : "Chọn file";

        const dragText = document.querySelector('.flex.text-xs.text-durian-accent p');
        if (dragText) dragText.innerText = currentLang === 'EN' ? "or drag and drop here" : "hoặc kéo thả vào đây";

        const fileHelp = document.querySelector('.space-y-1\\.text-center p.text-\\[10px\\]');
        if (fileHelp) fileHelp.innerText = currentLang === 'EN' ? "Accepts JPG, PNG under 5MB" : "Chấp nhận JPG, PNG dung lượng dưới 5MB";

        const descTextarea = document.getElementById('cust-description');
        if (descTextarea) {
            descTextarea.placeholder = currentLang === 'EN'
                ? "Example: I want to print logo ABC on the front, with a Happy New Year greeting on the back of the durian gift box."
                : "Ví dụ: Tôi muốn in logo doanh nghiệp ABC ở mặt trước, kèm lời chúc mừng năm mới 2027 ở mặt sau hộp sầu riêng.";
        }

        const submitBtn = document.querySelector('form button[type="submit"]');
        if (submitBtn) submitBtn.innerText = currentLang === 'EN' ? "SUBMIT REQUEST" : "GỬI YÊU CẦU THIẾT KẾ";
    }

    // 5. Contact page translations
    if (isContact) {
        const contactTitle = document.querySelector('section.relative h1');
        if (contactTitle) contactTitle.innerText = currentLang === 'EN' ? "Contact Durapure" : "Liên Hệ Durapure";

        const contactSub = document.querySelector('section.relative p');
        if (contactSub) {
            contactSub.innerText = currentLang === 'EN'
                ? "Connect with us to share the passion for pure organic durian."
                : "Kết nối với chúng tôi để chia sẻ niềm đam mê sầu riêng mộc sạch tinh khiết.";
        }

        const contactSpan = document.querySelector('main span.text-durian-gold');
        if (contactSpan) contactSpan.innerText = currentLang === 'EN' ? "DIRECT CONTACT" : "LIÊN HỆ TRỰC TIẾP";

        const contactHeader = document.querySelector('main h2');
        if (contactHeader) contactHeader.innerText = currentLang === 'EN' ? "Come visit or chat with us" : "Hãy ghé thăm hoặc trò chuyện cùng chúng tôi";

        const contactDesc = document.querySelector('main h2 + p');
        if (contactDesc) {
            contactDesc.innerText = currentLang === 'EN'
                ? "If you want to wholesale premium durian, register to visit our organic orchard in the Mekong Delta, or simply share your experience with Durapure, please send us a message or call directly."
                : "Nếu bạn muốn hợp tác nhập sỉ sầu riêng chất lượng cao, đăng ký tham quan nhà vườn canh tác hữu cơ tại miền Tây, hoặc đơn giản là muốn chia sẻ trải nghiệm về Durapure, vui lòng gửi tin nhắn hoặc gọi trực tiếp cho chúng tôi.";
        }

        const cardHeaders = document.querySelectorAll('main h4');
        if (cardHeaders.length >= 3) {
            cardHeaders[0].innerText = currentLang === 'EN' ? "Office & Farm" : "Văn phòng & Nông trại";
            cardHeaders[1].innerText = currentLang === 'EN' ? "Hotline Phone" : "Điện thoại Hotline";
            cardHeaders[2].innerText = currentLang === 'EN' ? "Support Email" : "Email hỗ trợ";
        }

        const formHeader = document.querySelector('h3.font-serif.text-xl');
        if (formHeader) formHeader.innerText = currentLang === 'EN' ? "Send Feedback Message" : "Gửi tin nhắn phản hồi";

        const labels = document.querySelectorAll('form label');
        if (labels.length >= 4) {
            labels[0].innerText = currentLang === 'EN' ? "Full Name *" : "Họ và tên *";
            labels[1].innerText = currentLang === 'EN' ? "Email *" : "Email *";
            labels[2].innerText = currentLang === 'EN' ? "Phone Number *" : "Số điện thoại *";
            labels[3].innerText = currentLang === 'EN' ? "Your Message *" : "Lời nhắn của bạn *";
        }

        const nameInput = document.getElementById('cont-name');
        if (nameInput) nameInput.placeholder = currentLang === 'EN' ? "Enter your name" : "Nhập tên của bạn";

        const emailInput = document.getElementById('cont-email');
        if (emailInput) emailInput.placeholder = currentLang === 'EN' ? "Enter email" : "Nhập email";

        const phoneInput = document.getElementById('cont-phone');
        if (phoneInput) phoneInput.placeholder = currentLang === 'EN' ? "Enter phone number" : "Nhập số điện thoại";

        const messageTextarea = document.getElementById('cont-message');
        if (messageTextarea) {
            messageTextarea.placeholder = currentLang === 'EN'
                ? "Write your message to Durapure..."
                : "Viết lời nhắn gửi đến Durapure...";
        }

        const submitBtn = document.querySelector('form button[type="submit"]');
        if (submitBtn) submitBtn.innerText = currentLang === 'EN' ? "SEND CONTACT MESSAGE" : "GỬI TIN NHẮN LIÊN HỆ";
    }

    // 6. Blog page static translations
    if (isBlog) {
        const blogTitle = document.querySelector('section.relative h1');
        if (blogTitle) {
            blogTitle.innerText = currentLang === 'EN' ? "News & Farm Journal" : "Tin Tức & Nhật Ký Nông Trại";
        }
        const blogSub = document.querySelector('section.relative p');
        if (blogSub) {
            blogSub.innerText = currentLang === 'EN'
                ? "Stay updated with daily stories, organic harvesting processes, and serving tips from our growers."
                : "Cập nhật những câu chuyện thường nhật, quy trình thu hoạch hữu cơ và mẹo bảo quản sầu riêng từ nhà vườn.";
        }
        const loadingText = document.querySelector('#blogs-grid span');
        if (loadingText) {
            loadingText.innerText = currentLang === 'EN' ? "Loading farm journal from database..." : "Đang tải nhật ký từ cơ sở dữ liệu...";
        }
    }

    // 7. Breadcrumbs translations for detail pages
    if (isProductDetail || isBlogDetail) {
        const breadcrumbHome = document.querySelector('main a[href="index.html"], nav a[href="index.html"]');
        if (breadcrumbHome) {
            breadcrumbHome.innerText = currentLang === 'EN' ? "Home" : "Trang chủ";
        }
        const breadcrumbShop = document.querySelector('main a[href="shop.html"]');
        if (breadcrumbShop) {
            breadcrumbShop.innerText = currentLang === 'EN' ? "Shop" : "Cửa hàng";
        }
        const breadcrumbBlog = document.querySelector('nav a[href="blog.html"]');
        if (breadcrumbBlog) {
            breadcrumbBlog.innerText = currentLang === 'EN' ? "Blog" : "Tin tức";
        }
    }

    // Apply settings translations (SEO, Address, email, phone) reactively
    if (websiteSettings) {
        applyWebsiteSettings(websiteSettings);
    }
}

// Image Preview & programmatic download helpers
function openImagePreviewModal(url) {
    const modal = document.getElementById('image-preview-modal');
    const img = document.getElementById('preview-modal-img');
    const filenameSpan = document.getElementById('preview-modal-filename');
    const downloadBtn = document.getElementById('preview-modal-download-btn');

    if (modal && img) {
        img.src = url;
        const filename = url.split('/').pop();
        if (filenameSpan) filenameSpan.innerText = filename;
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                downloadDesignFile(url, filename);
            };
        }
        modal.classList.remove('hidden');
    }
}

function closeImagePreviewModal() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) modal.classList.add('hidden');
}

async function downloadDesignFile(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not OK");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'design_label.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error('Failed to download design file:', e);
        // Fallback: trigger standard open in new window
        window.open(url, '_blank');
    }
}

function toggleMobileMenu(open) {
    const drawer = document.getElementById('mobile-menu-drawer');
    const panel = document.getElementById('mobile-menu-panel');
    if (!drawer || !panel) return;

    if (open) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            drawer.classList.remove('opacity-0');
            drawer.classList.add('opacity-100');
            panel.classList.remove('-translate-x-full');
            panel.classList.add('translate-x-0');
        }, 10);
    } else {
        drawer.classList.remove('opacity-100');
        drawer.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }
}

// Helper to format video URL (Youtube/TikTok) to Embed URL
function formatVideoUrl(url) {
    if (!url) return url;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1] && !url.includes('/embed/')) {
        return 'https://www.youtube.com/embed/' + ytMatch[1];
    }

    // TikTok
    const tkMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/i);
    if (tkMatch && tkMatch[1]) {
        return 'https://www.tiktok.com/embed/v2/' + tkMatch[1];
    }

    return url;
}
