/**
 * The 7-step ordering process (PRD §2). Reused by the home page summary and
 * the "Hướng dẫn đặt hàng" page. Keep step 4 wording: the package price does
 * NOT include the foundation.
 */
export const ORDER_STEPS = [
  {
    title: "Gửi yêu cầu",
    description: "Quý khách gọi điện, nhắn Zalo hoặc gửi form báo giá với nhu cầu sơ bộ.",
  },
  {
    title: "Khảo sát",
    description: "Chúng tôi trao đổi chi tiết, khảo sát khuôn viên và tư vấn kích thước Lỗ Ban.",
  },
  {
    title: "Thiết kế bản vẽ",
    description: "Lên phương án, bản vẽ để Quý khách xem và góp ý trước khi chốt.",
  },
  {
    title: "Báo giá trọn gói",
    description: "Báo giá trọn gói nhưng không gồm phần móng, ghi rõ từng hạng mục.",
  },
  {
    title: "Ký hợp đồng & đặt cọc",
    description: "Thống nhất hợp đồng, tiến độ và tiến hành đặt cọc.",
  },
  {
    title: "Sản xuất & lắp đặt",
    description: "Chế tác tại xưởng, vận chuyển và lắp đặt tại công trình.",
  },
  {
    title: "Nghiệm thu & thanh toán",
    description: "Quý khách nghiệm thu thực tế, sau đó thanh toán phần còn lại.",
  },
] as const;
