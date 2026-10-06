using System;

namespace BanCafe.Data
{
    public static class DbInitializer
    {
        public static void SeedData()
        {
            try
            {
                SeedSettings();
                SeedProducts();
                SeedBlogs();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Data seeding failed: " + ex.Message);
                throw;
            }
        }

        private static void SeedSettings()
        {
            int count = (int)DatabaseHelper.ExecuteScalar("SELECT COUNT(*) FROM [dbo].[Settings]");
            if (count == 0)
            {
                DatabaseHelper.ExecuteNonQuery(@"
                    INSERT INTO [dbo].[Settings] ([SettingKey], [SettingValue], [Description]) VALUES
                    ('AdminUsername', 'admin@durapure.vn', N'Tài khoản đăng nhập trang quản trị'),
                    ('AdminPassword', 'Admin@123', N'Mật khẩu đăng nhập trang quản trị (Plaintext cho demo)'),
                    ('SeoTitle', N'Durapure - Sầu riêng miền Tây tuyển chọn', N'Tiêu đề SEO mặc định của trang web'),
                    ('SeoDescription', N'Durapure tuyển chọn sầu riêng Ri6, Monthong và Musang King từ các nhà vườn miền Tây, chín tự nhiên và truy xuất rõ ràng.', N'Mô tả SEO mặc định'),
                    ('ContactPhone', '0901 234 567', N'Số điện thoại liên hệ hotline'),
                    ('ContactEmail', 'contact@durapure.vn', N'Email hỗ trợ khách hàng'),
                    ('ContactAddress', N'Cai Lậy, Tiền Giang, Việt Nam', N'Địa chỉ văn phòng / nhà vườn')");
            }
        }

        private static void SeedProducts()
        {
            int count = (int)DatabaseHelper.ExecuteScalar("SELECT COUNT(*) FROM [dbo].[Products]");
            if (count == 0)
            {
                DatabaseHelper.ExecuteNonQuery(@"
                    INSERT INTO [dbo].[Products] ([Name], [Price], [Unit], [Description], [ImageUrl], [RoastOptions], [IsActive]) VALUES
                    (N'Ri6 Cai Lậy Premium', 185000, N'1kg', N'Sầu riêng Ri6 chín cây tuyển chọn tại Cai Lậy, Tiền Giang, cơm vàng óng, dẻo mịn, vị ngọt đậm và hậu béo vừa phải.', 'images/durian/ri6.png', N'Nguyên trái,Tách múi,Cấp đông', 1),
                    (N'Monthong Cái Bè', 220000, N'1kg', N'Monthong Cái Bè có múi lớn, cơm dày, hạt lép và vị ngọt thanh. Thu hoạch đúng độ già để giữ trọn độ béo thơm.', 'images/durian/monthong.png', N'Nguyên trái,Tách múi,Cấp đông', 1),
                    (N'Musang King Miền Tây', 390000, N'1kg', N'Musang King tuyển chọn từ nhà vườn miền Tây với sắc vàng đậm, kết cấu kem mịn và hậu vị đăng đắng tinh tế.', 'images/durian/musang-king.png', N'Tách múi,Cấp đông', 1),
                    (N'Durapure Mekong Gift Selection', 450000, N'Hộp 2kg', N'Hộp quà tuyển chọn nhiều giống sầu riêng miền Tây theo mùa, đóng gói chỉn chu để biếu tặng.', 'images/durian/gift-selection.png', N'Hộp tiêu chuẩn,Hộp quà tặng', 1)");
            }
        }

        private static void SeedBlogs()
        {
            int count = (int)DatabaseHelper.ExecuteScalar("SELECT COUNT(*) FROM [dbo].[Blogs]");
            if (count == 0)
            {
                DatabaseHelper.ExecuteNonQuery(@"
                    INSERT INTO [dbo].[Blogs] ([Title], [Slug], [Summary], [Content], [ImageUrl], [PublishedAt], [IsVideo], [VideoUrl], [IsActive]) VALUES
                    (N'Hành trình từ vườn sầu riêng miền Tây đến bàn ăn', 'hanh-trinh-sau-rieng-mien-tay', N'Khám phá quy trình canh tác, tuyển trái và giao sầu riêng chín tự nhiên từ nhà vườn Durapure.', N'Tại các nhà vườn miền Tây, mỗi cây sầu riêng được nuôi dưỡng trên đất phù sa, bằng nguồn nước sạch từ hệ thống kênh rạch và một hệ sinh thái cân bằng. Trái được theo dõi độ già, thu hoạch thủ công và phân loại kỹ trước khi đóng gói.', 'images/durian/hero-mien-tay.png', GETDATE(), 0, NULL, 1),
                    (N'Phân biệt Ri6, Monthong và Musang King', 'phan-biet-ri6-monthong-musang-king', N'Ba giống sầu riêng được yêu thích khác nhau thế nào về màu cơm, độ béo, vị ngọt và kết cấu?', N'Ri6 nổi bật với cơm vàng, dẻo và ngọt đậm. Monthong có múi lớn, cơm dày, ngọt thanh và mùi nhẹ hơn. Musang King thường có màu vàng đậm, kết cấu kem mịn cùng hậu vị phức hợp.', 'images/durian/ri6.png', GETDATE(), 0, NULL, 1),
                    (N'Bí quyết chọn sầu riêng chín ngon và bảo quản đúng cách', 'bi-quyet-chon-sau-rieng', N'Nhận biết trái đủ già, cách tách múi và mẹo giữ hương vị sầu riêng sau khi nhận hàng.', N'Sầu riêng ngon có cuống còn tươi, gai nở đều và mùi thơm tự nhiên. Sau khi tách, phần cơm nên được bảo quản kín trong ngăn mát nếu dùng sớm hoặc cấp đông để giữ lâu hơn.', 'images/durian/monthong.png', GETDATE(), 0, NULL, 1)");
            }
        }
    }
}