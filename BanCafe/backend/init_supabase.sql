-- 1. Xóa bảng cũ nếu tồn tại (để tránh xung đột)
DROP TABLE IF EXISTS orderitems CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customdesigns CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS farm_videos CASCADE;

-- 2. Tạo bảng Sản phẩm (products)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    description TEXT,
    imageurl VARCHAR(255),
    roastoptions VARCHAR(100),
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Tạo bảng Đơn hàng (orders)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customername VARCHAR(100) NOT NULL,
    customeremail VARCHAR(100) NOT NULL,
    customerphone VARCHAR(20) NOT NULL,
    shippingaddress VARCHAR(255) NOT NULL,
    totalamount DECIMAL(18,2) NOT NULL,
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

-- 4. Tạo bảng Chi tiết đơn hàng (orderitems)
CREATE TABLE orderitems (
    id SERIAL PRIMARY KEY,
    orderid INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    productid INT NOT NULL REFERENCES products(id),
    roastlevel VARCHAR(50),
    quantity INT NOT NULL,
    price DECIMAL(18,2) NOT NULL
);

-- 5. Tạo bảng Yêu cầu thiết kế bao bì (customdesigns)
CREATE TABLE customdesigns (
    id SERIAL PRIMARY KEY,
    customername VARCHAR(100) NOT NULL,
    customeremail VARCHAR(100) NOT NULL,
    customerphone VARCHAR(20) NOT NULL,
    description TEXT,
    designfileurl VARCHAR(255),
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

-- 6. Tạo bảng Tin tức / Nhật ký nông trại (blogs)
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    summary VARCHAR(500),
    content TEXT,
    imageurl VARCHAR(255),
    publishedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isvideo BOOLEAN NOT NULL DEFAULT FALSE,
    videourl VARCHAR(255),
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. Tạo bảng Cấu hình hệ thống (settings)
CREATE TABLE settings (
    settingkey VARCHAR(100) PRIMARY KEY,
    settingvalue TEXT,
    description VARCHAR(250)
);

-- 8. Tạo bảng Video Nông trại (farm_videos)
CREATE TABLE farm_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    videourl VARCHAR(255) NOT NULL,
    thumbnailurl VARCHAR(255),
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==========================================
-- CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==========================================

-- Chèn Cấu hình
INSERT INTO settings (settingkey, settingvalue, description) VALUES
('AdminUsername', 'admin@durapure.vn', 'Tài khoản đăng nhập trang quản trị'),
('AdminPassword', 'Admin@123', 'Mật khẩu đăng nhập trang quản trị (Plaintext cho demo)'),
('SeoTitle', 'Durapure - Sầu riêng miền Tây tuyển chọn', 'Tiêu đề SEO mặc định của trang web'),
('SeoDescription', 'Durapure tuyển chọn sầu riêng Ri6, Monthong và Musang King từ các nhà vườn miền Tây, chín tự nhiên và truy xuất rõ ràng.', 'Mô tả SEO mặc định'),
('ContactPhone', '0901 234 567', 'Số điện thoại liên hệ hotline'),
('ContactEmail', 'contact@durapure.vn', 'Email hỗ trợ khách hàng'),
('ContactAddress', 'Cai Lậy, Tiền Giang, Việt Nam', 'Địa chỉ văn phòng / nông trại');

INSERT INTO products (name, price, unit, description, imageurl, roastoptions, isactive) VALUES
('Ri6 Cai Lậy Premium', 185000, '1kg', 'Sầu riêng Ri6 chín cây tuyển chọn tại Cai Lậy, Tiền Giang, cơm vàng óng, dẻo mịn, vị ngọt đậm và hậu béo vừa phải.', 'images/durian/ri6.png', 'Nguyên trái,Tách múi,Cấp đông', TRUE),
('Monthong Cái Bè', 220000, '1kg', 'Monthong Cái Bè có múi lớn, cơm dày, hạt lép và vị ngọt thanh. Thu hoạch đúng độ già để giữ trọn độ béo thơm.', 'images/durian/monthong.png', 'Nguyên trái,Tách múi,Cấp đông', TRUE),
('Musang King Miền Tây', 390000, '1kg', 'Dòng Musang King tuyển chọn với sắc vàng đậm, kết cấu kem mịn và hậu vị đăng đắng tinh tế dành cho người sành sầu riêng.', 'images/durian/musang-king.png', 'Tách múi,Cấp đông', TRUE),
('Durapure Mekong Gift Selection', 450000, 'Hộp 2kg', 'Hộp quà tuyển chọn nhiều giống sầu riêng theo mùa, đóng gói chỉn chu để biếu tặng gia đình, đối tác và bạn bè.', 'images/durian/gift-selection.png', 'Hộp tiêu chuẩn,Hộp quà tặng', TRUE);

INSERT INTO blogs (title, slug, summary, content, imageurl, isvideo, videourl, isactive) VALUES
('Hành trình từ vườn sầu riêng miền Tây đến bàn ăn', 'hanh-trinh-sau-rieng-mien-tay', 'Khám phá quy trình canh tác, tuyển trái và giao sầu riêng chín tự nhiên từ nhà vườn Durapure.', 'Tại các nhà vườn Durapure ở miền Tây, mỗi cây sầu riêng được nuôi dưỡng bằng phân hữu cơ, nguồn nước sạch và hệ sinh thái cân bằng. Trái được theo dõi độ già, thu hoạch thủ công và phân loại kỹ trước khi đóng gói. Chúng tôi ưu tiên thời điểm chín ngon nhất để mỗi phần sầu riêng đến tay khách hàng vẫn giữ được cơm vàng, vị béo và hương thơm đặc trưng.', 'images/durian/hero-mien-tay.png', FALSE, NULL, TRUE),
('Phân biệt Ri6, Monthong và Musang King', 'phan-biet-ri6-monthong-musang-king', 'Ba giống sầu riêng được yêu thích khác nhau thế nào về màu cơm, độ béo, vị ngọt và kết cấu?', 'Ri6 nổi bật với cơm vàng, dẻo và ngọt đậm. Monthong có múi lớn, cơm dày, ngọt thanh và mùi nhẹ hơn. Musang King thường có màu vàng đậm, kết cấu kem mịn cùng hậu vị phức hợp. Lựa chọn phù hợp nhất tùy vào khẩu vị, mục đích biếu tặng và cách bảo quản mong muốn.', 'images/durian/ri6.png', FALSE, NULL, TRUE),
('Bí quyết chọn sầu riêng chín ngon và bảo quản đúng cách', 'bi-quyet-chon-sau-rieng', 'Nhận biết trái đủ già, cách tách múi và mẹo giữ hương vị sầu riêng sau khi nhận hàng.', 'Sầu riêng ngon có cuống còn tươi, gai nở đều và mùi thơm tự nhiên. Sau khi tách, phần cơm nên được bảo quản kín trong ngăn mát nếu dùng sớm hoặc cấp đông để giữ lâu hơn. Hãy để sầu riêng đông lạnh rã chậm trong ngăn mát trước khi thưởng thức để kết cấu cơm mịn và vị béo được giữ trọn.', 'images/durian/monthong.png', FALSE, NULL, TRUE);

INSERT INTO farm_videos (title, description, videourl, thumbnailurl, isactive) VALUES
('Một ngày tại vườn sầu riêng Durapure', 'Theo chân đội ngũ chăm vườn, kiểm tra độ già và tuyển chọn từng trái sầu riêng tại miền Tây.', '', 'images/durian/hero-mien-tay.png', TRUE),
('Cách Durapure tuyển chọn sầu riêng', 'Góc nhìn gần hơn về màu cơm, độ chín và quy trình đóng gói trước khi giao đến khách hàng.', '', 'images/durian/gift-selection.png', TRUE);