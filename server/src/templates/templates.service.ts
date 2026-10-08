import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplatesService {
  getAvailableSections() {
    return [
      {
        type: 'hero',
        name: 'Hero Banner',
        desc: 'Banner chính đầu trang: Tiêu đề lớn, mô tả, nút kêu gọi hành động & hình ảnh',
        icon: 'Layout',
        defaultTitle: 'Giải Pháp Đột Phá Cho Doanh Nghiệp Bạn',
        defaultSubtitle: 'Tối ưu hóa hiệu suất, nâng tầm thương hiệu với quy trình chuyên nghiệp và chuẩn SEO hàng đầu.',
        defaultButtonText: 'Nhận Tư Vấn Ngay',
        defaultButtonLink: '#contact',
        bgColor: '#f8fafc',
      },
      {
        type: 'services',
        name: 'Dịch Vụ Nổi Bật',
        desc: 'Lưới 3 cột dịch vụ kèm biểu tượng và mô tả ngắn gọn',
        icon: 'Grid',
        defaultTitle: 'Dịch Vụ Chuyên Nghiệp',
        defaultSubtitle: 'Các giải pháp toàn diện giúp doanh nghiệp bứt phá doanh số',
        data: {
          items: [
            { title: 'Tư Vấn Chiến Lược', desc: 'Định hình lộ trình phát triển chính xác và tiết kiệm ngân sách.' },
            { title: 'Triển Khai Chuyên Nghiệp', desc: 'Đội ngũ chuyên gia giàu kinh nghiệm thực chiến theo chuẩn quốc tế.' },
            { title: 'Tối Ưu & Đo Lường', desc: 'Báo cáo minh bạch, cam kết hiệu quả theo KPI rõ ràng.' },
          ],
        },
      },
      {
        type: 'about',
        name: 'Về Chúng Tôi',
        desc: 'Hình ảnh đại diện, câu chuyện thương hiệu và danh sách cam kết E-E-A-T',
        icon: 'Award',
        defaultTitle: 'Hơn 10 Năm Khẳng Định Uy Tín',
        defaultSubtitle: 'Đồng hành cùng sự phát triển bền vững của khách hàng',
        content: 'Chúng tôi tiên phong trong việc cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và cam kết bảo hành dài hạn.',
      },
      {
        type: 'features',
        name: 'Lợi Thế Cạnh Tranh',
        desc: '3 khối tính năng nổi bật tạo niềm tin với khách hàng',
        icon: 'ShieldCheck',
        defaultTitle: 'Tại Sao Khách Hàng Chọn Chúng Tôi?',
      },
      {
        type: 'numbers',
        name: 'Số Liệu Thống Kê',
        desc: '4 con số ấn tượng khẳng định quy mô và kinh nghiệm',
        icon: 'TrendingUp',
        defaultTitle: 'Những Con Số Biết Nói',
      },
      {
        type: 'blog',
        name: 'Bài Viết Mới Nhất',
        desc: 'Tự động kéo 3 bài viết mới nhất từ chuyên mục Blog theo dạng thẻ card',
        icon: 'BookOpen',
        defaultTitle: 'Kiến Thức & Tin Tức Mới Nhất',
      },
      {
        type: 'faq',
        name: 'Hỏi Đáp SEO (FAQ Accordion)',
        desc: 'Khối câu hỏi thường gặp dạng đóng/mở chuẩn SEO Schema FAQ',
        icon: 'HelpCircle',
        defaultTitle: 'Câu Hỏi Thường Gặp (FAQ)',
        data: {
          faqs: [
            { q: 'Thời gian hoàn thành một dự án thường mất bao lâu?', a: 'Tùy thuộc vào quy mô, thông thường từ 3 đến 7 ngày làm việc.' },
            { q: 'Quy trình tiếp nhận và xử lý yêu cầu diễn ra như thế nào?', a: 'Khách hàng liên hệ -> Khảo sát nhu cầu -> Báo giá chi tiết -> Triển khai và bàn giao.' },
            { q: 'Chính sách bảo hành và hỗ trợ sau triển khai?', a: 'Hỗ trợ kỹ thuật 24/7 và cam kết đồng hành miễn phí trong suốt thời gian vận hành.' },
          ],
        },
      },
      {
        type: 'cta',
        name: 'Khung Kêu Gọi Hotline (CTA)',
        desc: 'Khung nền màu tương phản cao, tiêu đề bắt mắt kèm nút gọi Hotline lớn',
        icon: 'PhoneCall',
        defaultTitle: 'Sẵn Sàng Nâng Tầm Dự Án Của Bạn?',
        defaultSubtitle: 'Liên hệ ngay hôm nay để nhận ưu đãi và tư vấn miễn phí từ chuyên gia!',
        defaultButtonText: 'Gọi Hotline Ngay',
        defaultButtonLink: 'tel:0988000000',
      },
    ];
  }

  getNichePresets() {
    return [
      {
        id: 'real-estate',
        name: 'Bất Động Sản & Dự Án',
        badge: 'Phổ biến',
        colorPrimary: '#0f3a61',
        colorSecondary: '#d4af37',
        topbarText: 'Hotline Dự Án: 0988.xxx.xxx - Nhận Bảng Giá Độc Quyền 2026',
        defaultSections: ['hero', 'services', 'about', 'numbers', 'faq', 'cta'],
      },
      {
        id: 'clinic-spa',
        name: 'Y Tế, Nha Khoa & Spa Thẩm Mỹ',
        badge: 'Chuẩn E-E-A-T',
        colorPrimary: '#007791',
        colorSecondary: '#20b2aa',
        topbarText: 'Khám & Tư Vấn Miễn Phí 24/7 - Đặt Lịch: 0988.xxx.xxx',
        defaultSections: ['hero', 'about', 'services', 'features', 'faq', 'cta'],
      },
      {
        id: 'b2b-service',
        name: 'Doanh Nghiệp & Dịch Vụ Kỹ Thuật',
        badge: 'Chuyên nghiệp',
        colorPrimary: '#1e293b',
        colorSecondary: '#ea580c',
        topbarText: 'Hỗ Trợ Kỹ Thuật Toàn Quốc: 0988.xxx.xxx | Email: contact@domain.com',
        defaultSections: ['hero', 'services', 'features', 'about', 'blog', 'cta'],
      },
      {
        id: 'finance-law',
        name: 'Tài Chính, Luật & Tư Vấn',
        badge: 'Đẳng cấp',
        colorPrimary: '#0f172a',
        colorSecondary: '#2563eb',
        topbarText: 'Tư Vấn Pháp Lý & Tài Chính Doanh Nghiệp: 0988.xxx.xxx',
        defaultSections: ['hero', 'services', 'about', 'numbers', 'faq', 'cta'],
      },
      {
        id: 'news-affiliate',
        name: 'Blog Kiến Thức & Tin Tức Affiliate',
        badge: 'Tối ưu SEO',
        colorPrimary: '#2563eb',
        colorSecondary: '#10b981',
        topbarText: 'Cập Nhật Kiến Thức Chuyên Sâu & Đánh Giá Sản Phẩm 2026',
        defaultSections: ['hero', 'blog', 'about', 'features', 'faq'],
      },
    ];
  }

  getFooterPresets() {
    return [
      {
        id: 'corporate-4col',
        name: 'Doanh Nghiệp 4 Cột (Đầy Đủ Chuẩn SEO)',
        desc: 'Cột 1: Thông tin thương hiệu; Cột 2: Trang chính sách; Cột 3: Dịch vụ chính; Cột 4: Thông tin liên hệ & Hotline',
        bgColor: '#1e293b',
        textColor: '#f8fafc',
      },
      {
        id: 'affiliate-2col',
        name: 'Tin Tức / Affiliate 2 Cột (Gọn Nhẹ)',
        desc: 'Cột 1: Giới thiệu & Tuyên bố miễn trừ trách nhiệm; Cột 2: Thông tin liên hệ & Bản quyền',
        bgColor: '#0f172a',
        textColor: '#f8fafc',
      },
    ];
  }
}
