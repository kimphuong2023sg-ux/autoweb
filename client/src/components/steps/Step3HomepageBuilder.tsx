import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Copy,
  Search,
  Sliders,
  DollarSign,
  Star,
  Users,
  FolderMinus,
  HelpCircle,
  BarChart3,
  Clock,
  Video,
  MapPin,
  Newspaper,
  Image,
  Type,
  PhoneCall,
  Share2,
  Grid,
  Info,
  SlidersHorizontal,
  UploadCloud,
  CheckCircle2,
  ImagePlus,
  FolderOpen,
  Loader2,
  RefreshCw,
  Rocket,
  ExternalLink,
  Zap,
  Maximize2,
  Box,
  CheckSquare,
  Square,
} from 'lucide-react';
import { SectionItem, FlatsomeElementType, ColumnLayoutPreset, ConnectedSite, WpMediaItem } from '../../types';
import { api } from '../../services/api';

interface Step3HomepageBuilderProps {
  currentSite?: ConnectedSite | null;
  sections: SectionItem[];
  onChangeSections: (newSections: SectionItem[]) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

interface ElementDefinition {
  type: FlatsomeElementType;
  name: string;
  category: 'layout' | 'content' | 'interactive' | 'dynamic';
  desc: string;
  icon: string;
  defaultData: Partial<SectionItem>;
}

export const Step3HomepageBuilder: React.FC<Step3HomepageBuilderProps> = ({
  currentSite,
  sections,
  onChangeSections,
  onNextStep,
  onPrevStep,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'layout' | 'content' | 'interactive' | 'dynamic'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [targetSectionIdForMedia, setTargetSectionIdForMedia] = useState<string | null>(null);
  const [wpMediaList, setWpMediaList] = useState<WpMediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [mediaNotice, setMediaNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [isUploadingMediaId, setIsUploadingMediaId] = useState<string | null>(null);
  const [isUpdatingMediaId, setIsUpdatingMediaId] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<{ [secId: string]: string }>({});
  const [isDeployingHomepage, setIsDeployingHomepage] = useState(false);
  const [deployHomepageSuccessUrl, setDeployHomepageSuccessUrl] = useState<string | null>(null);
  const [deployHomepageError, setDeployHomepageError] = useState<string | null>(null);

  // 15+ Flatsome UX Builder Elements catalog
  const availableElements: ElementDefinition[] = [
    // --- LAYOUT ---
    {
      type: 'hero',
      name: 'Hero Banner',
      category: 'layout',
      desc: 'Banner lớn đầu trang: Tiêu đề H1, mô tả và nút kêu gọi hành động',
      icon: '🖼️',
      defaultData: {
        title: 'Giải Pháp Đột Phá Cho Doanh Nghiệp Bạn',
        subtitle: 'Tối ưu hóa hiệu suất, nâng tầm thương hiệu với quy trình chuyên nghiệp và chuẩn SEO hàng đầu.',
        buttonText: 'Nhận Tư Vấn Ngay',
        buttonLink: '#contact',
        bgColor: '#f8fafc',
        layout: '2-col-left-wide',
        padding: 'normal',
      },
    },
    {
      type: 'banner',
      name: 'Banner (UX Banner)',
      category: 'layout',
      desc: 'Khung banner chữ đè lên ảnh nền hoặc màu nền với độ phủ tối',
      icon: '🌄',
      defaultData: {
        title: 'Chiến Lược Dẫn Đầu Thị Trường',
        subtitle: 'Đồng hành cùng sự phát triển vượt bậc của doanh nghiệp',
        buttonText: 'Khám Phá Dịch Vụ',
        buttonLink: '#',
        bgColor: '#0f172a',
        textColor: 'light',
        padding: 'large',
      },
    },
    {
      type: 'row_custom',
      name: 'Row (Chia Cột Linh Hoạt)',
      category: 'layout',
      desc: 'Khối chia cột tùy chọn: 1 cột, 2 cột (50/50, 33/67), 3 cột, 4 cột',
      icon: '▦',
      defaultData: {
        title: 'Bố Cục Chia Cột Tùy Biến',
        layout: '3-col-equal',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },
    {
      type: 'slider',
      name: 'Slider Trình Chiếu',
      category: 'layout',
      desc: 'Băng chuyền trượt chuyển đổi các slide banner hoặc thông điệp',
      icon: '🎠',
      defaultData: {
        title: 'Slide Giới Thiệu Nổi Bật',
        subtitle: 'Tự động trượt mượt mà theo chuẩn Flatsome',
        bgColor: '#f8fafc',
        padding: 'small',
      },
    },

    // --- CONTENT ---
    {
      type: 'services',
      name: 'Icon Box (Featured Box)',
      category: 'content',
      desc: 'Hộp dịch vụ kèm icon nổi bật, tiêu đề và mô tả ngắn',
      icon: '🛠️',
      defaultData: {
        title: 'Dịch Vụ Chuyên Nghiệp',
        subtitle: 'Các giải pháp toàn diện giúp doanh nghiệp bứt phá doanh số',
        layout: '3-col-equal',
        bgColor: '#ffffff',
        padding: 'normal',
        data: {
          items: [
            { icon: 'Shield', title: 'Tư Vấn Chiến Lược', desc: 'Định hình lộ trình phát triển chính xác và tiết kiệm ngân sách.' },
            { icon: 'Award', title: 'Triển Khai Chuyên Sâu', desc: 'Đội ngũ chuyên gia giàu kinh nghiệm thực chiến theo chuẩn quốc tế.' },
            { icon: 'Clock', title: 'Tối Ưu & Đo Lường', desc: 'Báo cáo minh bạch, cam kết hiệu quả theo KPI rõ ràng.' },
          ],
        },
      },
    },
    {
      type: 'about',
      name: 'Về Chúng Tôi (About Us)',
      category: 'content',
      desc: 'Bố cục 2 cột: Ảnh minh họa + Câu chuyện thương hiệu và cam kết E-E-A-T',
      icon: '🏢',
      defaultData: {
        title: 'Hơn 10 Năm Khẳng Định Uy Tín',
        subtitle: 'Đồng hành cùng sự phát triển bền vững của khách hàng trên toàn quốc',
        layout: '2-col-equal',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },
    {
      type: 'image_box',
      name: 'Image Box (Hộp Ảnh)',
      category: 'content',
      desc: 'Lưới hình ảnh kèm tiêu đề và mô tả ngắn bên dưới',
      icon: '🎴',
      defaultData: {
        title: 'Dự Án Tiêu Biểu Của Chúng Tôi',
        subtitle: 'Các sản phẩm và dịch vụ đã triển khai thành công',
        layout: '3-col-equal',
        bgColor: '#f8fafc',
        padding: 'normal',
      },
    },
    {
      type: 'image',
      name: 'Image (Ảnh Đơn)',
      category: 'content',
      desc: 'Hình ảnh kích thước lớn kèm hiệu ứng bo góc và đổ bóng',
      icon: '📸',
      defaultData: {
        title: 'Hình Ảnh Nổi Bật',
        bgColor: '#ffffff',
        padding: 'small',
        data: {
          isFullWidth: true,
        },
      },
    },
    {
      type: 'title_divider',
      name: 'Title & Divider',
      category: 'content',
      desc: 'Tiêu đề phân cách chuẩn Flatsome kèm đường kẻ trang trí',
      icon: '➖',
      defaultData: {
        title: 'TIÊU ĐỀ PHÂN CÁCH NỘI DUNG',
        bgColor: '#ffffff',
        padding: 'small',
      },
    },
    {
      type: 'text_block',
      name: 'Text Block (Văn Bản)',
      category: 'content',
      desc: 'Đoạn văn bản bài viết chuẩn SEO, định dạng dòng và cỡ chữ',
      icon: '📝',
      defaultData: {
        title: 'Giới Thiệu Chi Tiết Về Giải Pháp',
        content: 'Chúng tôi cung cấp hệ thống giải pháp toàn diện giúp doanh nghiệp xây dựng nền tảng vững chắc và bứt phá doanh thu trong kỷ nguyên số.',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },

    // --- CONVERSION & INTERACTIVE ---
    {
      type: 'price_table',
      name: 'Price Table (Bảng Giá)',
      category: 'interactive',
      desc: 'Bảng so sánh 3 gói giá dịch vụ: Khởi nghiệp - Tiêu chuẩn - Doanh nghiệp',
      icon: '🏷️',
      defaultData: {
        title: 'Bảng Báo Giá Dịch Vụ',
        subtitle: 'Chọn gói giải pháp phù hợp nhất với quy mô của bạn',
        layout: '3-col-equal',
        bgColor: '#f8fafc',
        padding: 'normal',
        data: {
          plans: [
            { name: 'Gói Cơ Bản', price: '2.500.000đ', period: '/tháng', desc: 'Phù hợp cá nhân & khởi nghiệp', isFeatured: false },
            { name: 'Gói Tiêu Chuẩn', price: '5.500.000đ', period: '/tháng', desc: 'Phổ biến và tối ưu chi phí nhất', isFeatured: true },
            { name: 'Gói Cao Cấp', price: '9.900.000đ', period: '/tháng', desc: 'Dành cho doanh nghiệp quy mô lớn', isFeatured: false },
          ],
        },
      },
    },
    {
      type: 'testimonials',
      name: 'Testimonials (Đánh Giá)',
      category: 'interactive',
      desc: 'Nhận xét của khách hàng kèm 5 sao ⭐⭐⭐⭐⭐ và tên công ty',
      icon: '⭐',
      defaultData: {
        title: 'Khách Hàng Nói Gì Về Chúng Tôi?',
        subtitle: 'Sự hài lòng của khách hàng là thước đo giá trị cốt lõi',
        layout: '3-col-equal',
        bgColor: '#ffffff',
        padding: 'normal',
        data: {
          testimonials: [
            { name: 'Nguyễn Văn An', company: 'CEO AnPhat Corp', quote: 'Dịch vụ rất chuyên nghiệp, tiến độ nhanh và hỗ trợ kỹ thuật cực kỳ nhiệt tình!', stars: 5 },
            { name: 'Trần Thị Mai', company: 'Giám Đốc Marketing MaiHouse', quote: 'Website sau khi tối ưu đạt thứ hạng tìm kiếm vượt kỳ vọng chỉ sau 2 tháng!', stars: 5 },
            { name: 'Lê Hoàng Minh', company: 'Sáng Lập MinhDecor', quote: 'Rất ấn tượng với quy trình làm việc chuẩn chỉ và minh bạch chi phí.', stars: 5 },
          ],
        },
      },
    },
    {
      type: 'team',
      name: 'Team Member (Chuyên Gia)',
      category: 'interactive',
      desc: 'Đội ngũ chuyên gia nhân sự khẳng định tiêu chuẩn E-E-A-T của Google',
      icon: '👥',
      defaultData: {
        title: 'Đội Ngũ Chuyên Gia E-E-A-T',
        subtitle: 'Những nhân sự giàu kinh nghiệm trực tiếp phụ trách dự án',
        layout: '4-col-equal',
        bgColor: '#f8fafc',
        padding: 'normal',
        data: {
          members: [
            { name: 'Nguyễn Hoàng', title: 'Chuyên Gia SEO & Chiến Lược' },
            { name: 'Lê Bảo Anh', title: 'Trưởng Phòng Kỹ Thuật UI/UX' },
            { name: 'Phạm Thu Trang', title: 'Chuyên Viên Tối Ưu Nội Dung' },
            { name: 'Vũ Đức Nam', title: 'Cố Vấn Tăng Trưởng Doanh Số' },
          ],
        },
      },
    },
    {
      type: 'faq',
      name: 'Accordion (Hỏi Đáp FAQ)',
      category: 'interactive',
      desc: 'Khung hỏi đáp xổ xuống chuẩn Schema FAQ thân thiện với Google SEO',
      icon: '❓',
      defaultData: {
        title: 'Câu Hỏi Thường Gặp (FAQ)',
        subtitle: 'Giải đáp những thắc mắc phổ biến nhất của khách hàng',
        bgColor: '#ffffff',
        padding: 'normal',
        data: {
          faqs: [
            { q: 'Thời gian hoàn thành một dự án thường mất bao lâu?', a: 'Tùy thuộc vào quy mô, thông thường từ 3 đến 7 ngày làm việc.' },
            { q: 'Quy trình tiếp nhận và xử lý yêu cầu diễn ra như thế nào?', a: 'Khách hàng liên hệ -> Tư vấn & khảo sát -> Lên phương án & báo giá -> Triển khai và nghiệm thu.' },
            { q: 'Chính sách hỗ trợ sau khi bàn giao dự án?', a: 'Chúng tôi hỗ trợ kỹ thuật miễn phí trong suốt quá trình vận hành.' },
          ],
        },
      },
    },
    {
      type: 'tabs',
      name: 'Tabs (Khung Chuyển Tab)',
      category: 'interactive',
      desc: 'Khung tab chuyển đổi: Quy trình - Cam kết - Chính sách bảo hành',
      icon: '📑',
      defaultData: {
        title: 'Thông Tin Chi Tiết & Quy Trình',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },
    {
      type: 'numbers',
      name: 'Counter (Số Liệu Nhảy Số)',
      category: 'interactive',
      desc: '4 con số ấn tượng khẳng định quy mô (500+ dự án, 98% hài lòng, 10 năm)',
      icon: '📊',
      defaultData: {
        title: 'Những Con Số Ấn Tượng',
        layout: '4-col-equal',
        bgColor: '#f1f5f9',
        padding: 'small',
      },
    },
    {
      type: 'countdown',
      name: 'Countdown (Đếm Ngược)',
      category: 'interactive',
      desc: 'Đồng hồ đếm ngược tạo sự cấp bách cho ưu đãi đặc biệt',
      icon: '⏳',
      defaultData: {
        title: 'Ưu Đãi Đặc Biệt Trong Tháng Này',
        subtitle: 'Nhanh tay đăng ký để nhận ngay gói quà tặng tối ưu miễn phí!',
        bgColor: '#0f172a',
        textColor: 'light',
        padding: 'normal',
      },
    },
    {
      type: 'video',
      name: 'Video & Video Button',
      category: 'interactive',
      desc: 'Video nhúng YouTube/Vimeo hoặc nút pop-up xem video giới thiệu',
      icon: '🎥',
      defaultData: {
        title: 'Video Giới Thiệu Doanh Nghiệp',
        buttonLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },
    {
      type: 'map',
      name: 'Google Map (Bản Đồ)',
      category: 'interactive',
      desc: 'Bản đồ định vị trụ sở công ty hoặc chi nhánh giao dịch',
      icon: '📍',
      defaultData: {
        title: 'Bản Đồ Chỉ Đường Đến Trụ Sở',
        subtitle: 'Tòa nhà văn phòng, Hà Nội, Việt Nam',
        padding: 'small',
      },
    },
    {
      type: 'cta',
      name: 'Khung Kêu Gọi Hotline (CTA)',
      category: 'interactive',
      desc: 'Khung nền màu tương phản cao kèm nút gọi hotline trực tiếp',
      icon: '📞',
      defaultData: {
        title: 'Sẵn Sàng Nâng Tầm Dự Án Của Bạn?',
        subtitle: 'Liên hệ ngay hôm nay để nhận ưu đãi và tư vấn miễn phí từ chuyên gia!',
        buttonText: 'Gọi Hotline Ngay',
        buttonLink: 'tel:0988000000',
        bgColor: '#1e293b',
        textColor: 'light',
        padding: 'normal',
      },
    },

    // --- DYNAMIC & SOCIAL ---
    {
      type: 'blog',
      name: 'Blog Posts (Bài Viết Mới)',
      category: 'dynamic',
      desc: 'Lưới bài viết mới nhất tự động lấy từ chuyên mục Blog của website',
      icon: '📰',
      defaultData: {
        title: 'Tin Tức & Kiến Thức Mới Nhất',
        layout: '3-col-equal',
        bgColor: '#f8fafc',
        padding: 'normal',
      },
    },
    {
      type: 'portfolio',
      name: 'Portfolio (Dự Án)',
      category: 'dynamic',
      desc: 'Lưới hình ảnh dự án tiêu biểu kèm hiệu ứng phóng to hover',
      icon: '💼',
      defaultData: {
        title: 'Dự Án Đã Hoàn Thành',
        layout: '3-col-equal',
        bgColor: '#ffffff',
        padding: 'normal',
      },
    },
    {
      type: 'gallery',
      name: 'Gallery (Thư Viện Ảnh)',
      category: 'dynamic',
      desc: 'Thư viện ảnh trượt slider hoặc lưới mở rộng lightbox',
      icon: '🖼️',
      defaultData: {
        title: 'Hình Ảnh Hoạt Động & Cơ Sở Vật Chất',
        bgColor: '#ffffff',
        padding: 'small',
      },
    },
    {
      type: 'social_icons',
      name: 'Social Icons (Mạng Xã Hội)',
      category: 'dynamic',
      desc: 'Hàng icon theo dõi: Facebook, Instagram, YouTube, TikTok',
      icon: '🌐',
      defaultData: {
        title: 'Kết Nối Với Chúng Tôi Trên Mạng Xã Hội',
        bgColor: '#ffffff',
        padding: 'small',
      },
    },
    {
      type: 'message_box',
      name: 'Message Box (Thông Báo)',
      category: 'dynamic',
      desc: 'Hộp ghi chú nổi bật thông báo sự kiện, khuyến mãi hoặc lưu ý',
      icon: '📢',
      defaultData: {
        content: 'Ưu đãi đặc biệt: Miễn phí kiểm tra và tư vấn kỹ thuật toàn diện cho khách hàng đăng ký sớm!',
        bgColor: '#ffffff',
        padding: 'small',
      },
    },
  ];

  // Filtering elements
  const filteredElements = availableElements.filter((el) => {
    const matchCat = activeCategory === 'all' || el.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtering WP Media
  const filteredMediaList = wpMediaList.filter((item) => {
    if (!mediaSearchQuery.trim()) return true;
    const q = mediaSearchQuery.toLowerCase().trim();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.alt && item.alt.toLowerCase().includes(q)) ||
      (item.filename && item.filename.toLowerCase().includes(q)) ||
      String(item.id).includes(q)
    );
  });

  const isAllFilteredSelected =
    filteredMediaList.length > 0 &&
    filteredMediaList.every((item) => selectedMediaIds.includes(item.id));

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChangeSections(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChangeSections(updated);
  };

  const handleClone = (index: number) => {
    const sec = sections[index];
    const cloned: SectionItem = {
      ...sec,
      id: `${sec.type}-${Date.now()}`,
      title: sec.title ? `${sec.title} (Bản sao)` : undefined,
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, cloned);
    onChangeSections(updated);
  };

  const handleDelete = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    onChangeSections(updated);
  };

  const handleAddSection = (elDef: ElementDefinition) => {
    const newSec: SectionItem = {
      id: `${elDef.type}-${Date.now()}`,
      type: elDef.type,
      ...elDef.defaultData,
    };
    onChangeSections([...sections, newSec]);
    setIsLibraryOpen(false);
    setExpandedId(newSec.id);
  };

  const handleUpdateSection = (id: string, updates: Partial<SectionItem>) => {
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec));
    onChangeSections(updated);
  };

  const handleOpenMediaPicker = async (sectionId: string) => {
    setTargetSectionIdForMedia(sectionId);
    setIsMediaPickerOpen(true);
    setMediaNotice(null);
    setSelectedMediaIds([]);
    setMediaSearchQuery('');
    if (currentSite) {
      setIsLoadingMedia(true);
      try {
        const res = await api.listMedia(currentSite);
        if (res.media) {
          setWpMediaList(res.media);
        }
      } catch (err: any) {
        console.warn('Failed to fetch WordPress media:', err);
      } finally {
        setIsLoadingMedia(false);
      }
    }
  };

  const handleRefreshMedia = async () => {
    if (!currentSite) return;
    setIsLoadingMedia(true);
    setMediaNotice(null);
    setSelectedMediaIds([]);
    try {
      const res = await api.listMedia(currentSite);
      if (res.media) {
        setWpMediaList(res.media);
      }
    } catch (err: any) {
      console.warn('Failed to refresh WordPress media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleToggleSelectMedia = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMedia = (itemsToSelect: WpMediaItem[]) => {
    if (itemsToSelect.length === 0) return;
    const allIds = itemsToSelect.map((m) => m.id);
    const isAllSelected = allIds.every((id) => selectedMediaIds.includes(id));
    if (isAllSelected) {
      setSelectedMediaIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedMediaIds, ...allIds]));
      setSelectedMediaIds(merged);
    }
  };

  const handleBulkDeleteWpMedia = async () => {
    if (!currentSite || selectedMediaIds.length === 0) return;

    const count = selectedMediaIds.length;
    const confirmText = `Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${count} ảnh đã chọn khỏi WordPress không?\n\nTất cả tệp ảnh trên máy chủ hosting sẽ bị xóa sạch hoàn toàn và không thể khôi phục!`;
    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      setMediaNotice(null);
      const res = await api.deleteBulkMedia(currentSite, selectedMediaIds);
      if (res && res.success) {
        const deletedIds: number[] = res.deleted_ids || selectedMediaIds;
        setWpMediaList((prev) => prev.filter((m) => !deletedIds.includes(m.id)));
        setSelectedMediaIds([]);
        setMediaNotice({
          type: 'success',
          text: `Đã xóa vĩnh viễn ${res.count || deletedIds.length} ảnh đã chọn khỏi Thư viện Media WordPress!`,
        });
        setTimeout(() => setMediaNotice(null), 5000);
      } else {
        setMediaNotice({
          type: 'error',
          text: res?.message || 'Không thể xóa các ảnh đã chọn.',
        });
      }
    } catch (err: any) {
      setMediaNotice({
        type: 'error',
        text: err.message || 'Lỗi khi xóa hàng loạt ảnh trên WordPress.',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteWpMedia = async (e: React.MouseEvent, item: WpMediaItem) => {
    e.stopPropagation();
    if (!currentSite) return;

    const confirmText = `Bạn có chắc chắn muốn XÓA VĨNH VIỄN ảnh #${item.id} (${item.title || item.filename || 'này'}) khỏi WordPress không?\n\nTệp ảnh trên máy chủ hosting sẽ bị xóa sạch hoàn toàn và không thể khôi phục!`;
    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setDeletingMediaId(item.id);
      setMediaNotice(null);
      const res = await api.deleteMedia(currentSite, item.id);
      if (res && res.success) {
        setWpMediaList((prev) => prev.filter((m) => m.id !== item.id));
        setSelectedMediaIds((prev) => prev.filter((id) => id !== item.id));
        setMediaNotice({
          type: 'success',
          text: `Đã xóa vĩnh viễn ảnh #${item.id} khỏi Thư viện Media WordPress!`,
        });
        setTimeout(() => setMediaNotice(null), 4000);
      } else {
        setMediaNotice({
          type: 'error',
          text: res?.message || 'Không thể xóa ảnh.',
        });
      }
    } catch (err: any) {
      setMediaNotice({
        type: 'error',
        text: err.message || 'Lỗi khi xóa ảnh trên WordPress.',
      });
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSelectWpMedia = (item: WpMediaItem) => {
    if (!targetSectionIdForMedia) return;
    const sec = sections.find((s) => s.id === targetSectionIdForMedia);
    if (sec) {
      handleUpdateSection(sec.id, {
        data: {
          ...(sec.data || {}),
          imageId: item.id,
          imageUrl: item.url,
          bgImage: item.url,
          bgImageId: item.id,
          alt: item.alt || sec.title || '',
          title: item.title || sec.title || '',
          caption: item.caption || '',
          description: item.description || '',
          isUploaded: true,
        },
      });
      setUploadSuccessMsg((prev) => ({
        ...prev,
        [sec.id]: `Đã chọn ảnh WP Media (#${item.id})`,
      }));
    }
    setIsMediaPickerOpen(false);
  };

  const handleFileSelect = (sectionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const sec = sections.find((s) => s.id === sectionId);
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      handleUpdateSection(sectionId, {
        data: {
          ...(sec?.data || {}),
          fileData: base64,
          filename: file.name,
          imageUrl: base64, // Instant preview
          title: sec?.data?.title || fileNameClean,
          alt: sec?.data?.alt || sec?.title || fileNameClean,
          caption: sec?.data?.caption || '',
          description: sec?.data?.description || '',
          isUploaded: false,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadToWpMedia = async (sectionId: string) => {
    if (!currentSite) {
      alert('Vui lòng kết nối với website WordPress trước khi tải ảnh!');
      return;
    }
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || !sec.data) return;

    if (!sec.data.fileData && !sec.data.imageUrl) {
      alert('Vui lòng chọn ảnh trước khi tải lên WordPress.');
      return;
    }

    setIsUploadingMediaId(sectionId);
    try {
      const res = await api.uploadMedia(currentSite, {
        filename: sec.data.filename || `image-${Date.now()}.png`,
        fileData: sec.data.fileData,
        imageUrl: !sec.data.fileData ? sec.data.imageUrl : undefined,
        altText: sec.data.alt || sec.title || '',
        title: sec.data.title || sec.title || '',
        caption: sec.data.caption || '',
        description: sec.data.description || '',
      });

      if (res.media) {
        handleUpdateSection(sectionId, {
          data: {
            ...(sec.data || {}),
            imageId: res.media.id,
            imageUrl: res.media.url,
            alt: res.media.alt || sec.data.alt,
            caption: res.media.caption || sec.data.caption,
            description: res.media.description || sec.data.description,
            title: res.media.title || sec.data.title,
            isUploaded: true,
            fileData: undefined,
          },
        });
        setUploadSuccessMsg((prev) => ({
          ...prev,
          [sectionId]: `Đã lưu vào WP Media (#${res.media.id})`,
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh lên Media WordPress');
    } finally {
      setIsUploadingMediaId(null);
    }
  };

  const handleUpdateWpMedia = async (sectionId: string) => {
    if (!currentSite) {
      alert('Vui lòng kết nối với website WordPress trước khi cập nhật thông tin ảnh!');
      return;
    }
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || !sec.data) return;

    const mediaId = sec.data.imageId;
    if (!mediaId) {
      alert('Tấm ảnh này chưa có ID trên WordPress Media. Vui lòng bấm "Tải lên WordPress Media ngay" trước.');
      return;
    }

    setIsUpdatingMediaId(sectionId);
    try {
      const res = await api.updateMedia(currentSite, {
        mediaId: Number(mediaId),
        altText: sec.data.alt || '',
        title: sec.data.title || '',
        caption: sec.data.caption || '',
        description: sec.data.description || '',
      });

      if (res.media) {
        handleUpdateSection(sectionId, {
          data: {
            ...(sec.data || {}),
            alt: res.media.alt !== undefined ? res.media.alt : sec.data.alt,
            caption: res.media.caption !== undefined ? res.media.caption : sec.data.caption,
            description: res.media.description !== undefined ? res.media.description : sec.data.description,
            title: res.media.title !== undefined ? res.media.title : sec.data.title,
          },
        });
        setUploadSuccessMsg((prev) => ({
          ...prev,
          [sectionId]: `✅ Đã cập nhật thông tin Media (#${mediaId}) lên WordPress thành công!`,
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật thông tin ảnh lên WordPress');
    } finally {
      setIsUpdatingMediaId(null);
    }
  };

  const handleQuickDeployHomepage = async () => {
    if (!currentSite) {
      alert('Vui lòng kết nối với website WordPress ở thanh công cụ phía trên trước khi xuất trang!');
      return;
    }

    setIsDeployingHomepage(true);
    setDeployHomepageSuccessUrl(null);
    setDeployHomepageError(null);

    try {
      // 1. Tự động tải ảnh Base64 local lên WordPress Media nếu chưa có ID
      const processedSections = [...sections];
      for (let i = 0; i < processedSections.length; i++) {
        const sec = processedSections[i];
        if (sec.data?.fileData && !sec.data?.imageId) {
          try {
            const uploadRes = await api.uploadMedia(currentSite, {
              filename: sec.data.filename || `image-${Date.now()}.png`,
              fileData: sec.data.fileData,
              altText: sec.data.alt || sec.title || '',
              title: sec.data.title || sec.title || '',
              caption: sec.data.caption || '',
              description: sec.data.description || '',
            });
            if (uploadRes && uploadRes.media) {
              processedSections[i] = {
                ...sec,
                data: {
                  ...sec.data,
                  imageId: uploadRes.media.id,
                  imageUrl: uploadRes.media.url,
                  fileData: undefined,
                  isUploaded: true,
                },
              };
            }
          } catch (uploadErr) {
            console.warn('Auto upload image failed, continuing with direct fallback:', uploadErr);
          }
        }
      }

      // Làm sạch dữ liệu fileData Base64 trước khi gửi deploy
      const sanitizedSections = processedSections.map((sec) => {
        if (sec.data?.fileData) {
          const { fileData, ...restData } = sec.data;
          return { ...sec, data: restData };
        }
        return sec;
      });

      onChangeSections(sanitizedSections);

      // 2. Triển khai Trang Chủ lên WordPress
      const res = await api.deployHomepage(currentSite, sanitizedSections);
      setDeployHomepageSuccessUrl(res?.edit_uxbuilder_url || currentSite.siteUrl);
    } catch (err: any) {
      setDeployHomepageError(err.message || 'Lỗi khi cập nhật Trang Chủ lên WordPress');
    } finally {
      setIsDeployingHomepage(false);
    }
  };

  const columnOptions: Array<{ id: ColumnLayoutPreset; label: string; icon: string }> = [
    { id: '1-col', label: '1 Cột (100%)', icon: '■' },
    { id: '2-col-equal', label: '2 Cột Đều (50-50)', icon: '■ | ■' },
    { id: '2-col-left-wide', label: '2 Cột (33% - 67%)', icon: '▎| █' },
    { id: '2-col-right-wide', label: '2 Cột (67% - 33%)', icon: '█ | ▎' },
    { id: '3-col-equal', label: '3 Cột Đều', icon: '■ | ■ | ■' },
    { id: '4-col-equal', label: '4 Cột Đều', icon: '▪ | ▪ | ▪ | ▪' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>3. Bố Cục Trang Chủ (Flatsome UX Builder)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {sections.length} khối
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tự do thêm bớt, chia cột và cấu hình 15+ thành phần chuẩn UX Builder: Bảng giá, Testimonials, FAQ, Banner, Video...
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenMediaPicker('')}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Mở thư viện hình ảnh để xem hoặc xóa ảnh trên WordPress"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>Thư Viện Media</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Khối
          </button>

          <button
            onClick={handleQuickDeployHomepage}
            disabled={isDeployingHomepage || !currentSite}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Cập nhật nhanh những thay đổi của Trang Chủ lên website WordPress ngay lập tức"
          >
            {isDeployingHomepage ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Cập Nhật...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Cập Nhật Lên Web Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {deployHomepageSuccessUrl && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã cập nhật Bố Cục Trang Chủ lên WordPress thành công! Bạn có thể xem ngay:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={currentSite?.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Xem Web Ngoài Frontend
            </a>
            {deployHomepageSuccessUrl.includes('uxbuilder') && (
              <a
                href={deployHomepageSuccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-emerald-100/60 border border-emerald-300 text-emerald-800 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition"
              >
                Mở UX Builder ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {deployHomepageError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span>{deployHomepageError}</span>
          <button
            onClick={() => setDeployHomepageError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Element Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Thư Viện Element Flatsome UX Builder</h3>
                  <p className="text-[11px] text-slate-400">Chọn thành phần bạn muốn đưa vào bố cục trang chủ</p>
                </div>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Đóng
              </button>
            </div>

            {/* Search & Categories Bar */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm element (bảng giá, video, banner, cột, faq, tabs...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-3.5 py-2 outline-hidden focus:border-blue-500 transition"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: '🌟 Tất cả' },
                  { id: 'layout', label: '📐 Bố cục (Layout)' },
                  { id: 'content', label: '📝 Nội dung (Content)' },
                  { id: 'interactive', label: '🚀 Chuyển đổi & SEO' },
                  { id: 'dynamic', label: '📰 Dữ liệu & Xã hội' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
              {filteredElements.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-xs text-slate-400">
                  Không tìm thấy element nào phù hợp với từ khóa "{searchQuery}"
                </div>
              ) : (
                filteredElements.map((el) => (
                  <div
                    key={el.type}
                    onClick={() => handleAddSection(el)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition cursor-pointer flex items-start gap-3 group text-left"
                  >
                    <span className="text-2xl p-2 bg-slate-50 group-hover:bg-blue-50 rounded-xl transition shrink-0">
                      {el.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition truncate">
                        {el.name}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {el.desc}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sections List Canvas */}
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const isExpanded = expandedId === sec.id;
          const foundDef = availableElements.find((e) => e.type === sec.type);
          const icon = foundDef?.icon || '📦';
          const name = foundDef?.name || sec.type;

          return (
            <div
              key={sec.id}
              className={`rounded-2xl border transition-all duration-150 ${
                isExpanded
                  ? 'border-blue-400 bg-white shadow-md ring-1 ring-blue-400/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Header Card */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : sec.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {sec.type === 'image'
                          ? (sec.data?.title || sec.data?.caption || 'Hình Ảnh Nổi Bật')
                          : (sec.title || name)}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 uppercase">
                        {sec.type}
                      </span>
                      {sec.layout && (
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                          {columnOptions.find((c) => c.id === sec.layout)?.label || sec.layout}
                        </span>
                      )}
                    </div>
                    {sec.type !== 'image' && sec.subtitle && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                        {sec.subtitle}
                      </p>
                    )}
                    {sec.type === 'image' && sec.data?.caption && (
                      <p className="text-[11px] text-slate-400 italic truncate mt-0.5 max-w-md">
                        Chú thích: {sec.data.caption}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition"
                    title="Di chuyển lên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition"
                    title="Di chuyển xuống"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleClone(idx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition"
                    title="Nhân bản khối này"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition"
                    title="Xóa khối này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sec.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition ml-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Customizer Form */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                  {/* Row & Column Layout Configuration */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bố Cục Cột (Column Grid Layout)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {columnOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleUpdateSection(sec.id, { layout: opt.id })}
                          className={`p-2 rounded-lg text-xs font-semibold text-center border transition flex flex-col items-center gap-1 cursor-pointer ${
                            (sec.layout || '3-col-equal') === opt.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-mono text-sm">{opt.icon}</span>
                          <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Container Style (Background & Padding) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Màu Nền Section</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={sec.bgColor || '#ffffff'}
                          onChange={(e) => handleUpdateSection(sec.id, { bgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <div className="flex gap-1">
                          {[
                            { label: 'Trắng', val: '#ffffff' },
                            { label: 'Xám', val: '#f8fafc' },
                            { label: 'Tối', val: '#0f172a' },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => handleUpdateSection(sec.id, { bgColor: b.val })}
                              className="px-2 py-1 text-[11px] border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-600"
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Khoảng Cách (Padding)</label>
                      <select
                        value={sec.padding || 'normal'}
                        onChange={(e) => handleUpdateSection(sec.id, { padding: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 outline-hidden"
                      >
                        <option value="small">Gọn gàng (35px)</option>
                        <option value="normal">Tiêu chuẩn (60px)</option>
                        <option value="large">Rộng rãi (90px)</option>
                      </select>
                    </div>
                  </div>

                  {/* Common Fields: Title & Subtitle */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {/* Common Fields: Title & Subtitle (Hidden for image and message_box sections) */}
                    {sec.type !== 'image' && sec.type !== 'message_box' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Tiêu Đề Khối
                          </label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-hidden focus:border-blue-500"
                          />
                        </div>

                        {sec.type !== 'divider_gap' && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                              Mô Tả / Phụ Đề
                            </label>
                            <textarea
                              rows={2}
                              value={sec.subtitle || sec.content || ''}
                              onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value, content: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-hidden focus:border-blue-500"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Button Text & Link (if applicable) */}
                    {['hero', 'banner', 'cta', 'about'].includes(sec.type) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên Nút Bấm</label>
                          <input
                            type="text"
                            value={sec.buttonText || ''}
                            onChange={(e) => handleUpdateSection(sec.id, { buttonText: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link Nút Bấm</label>
                          <input
                            type="text"
                            value={sec.buttonLink || ''}
                            onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {/* Price Table Specific Config */}
                    {sec.type === 'price_table' && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Cấu Hình Các Gói Báo Giá (3 Gói)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(sec.data?.plans || [
                            { name: 'Gói Cơ Bản', price: '2.500.000đ', period: '/tháng' },
                            { name: 'Gói Tiêu Chuẩn', price: '5.500.000đ', period: '/tháng' },
                            { name: 'Gói Cao Cấp', price: '9.900.000đ', period: '/tháng' },
                          ]).map((p: any, pIdx: number) => (
                            <div key={pIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => {
                                  const plans = [...(sec.data?.plans || [])];
                                  plans[pIdx] = { ...plans[pIdx], name: e.target.value };
                                  handleUpdateSection(sec.id, { data: { ...sec.data, plans } });
                                }}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={p.price}
                                onChange={(e) => {
                                  const plans = [...(sec.data?.plans || [])];
                                  plans[pIdx] = { ...plans[pIdx], price: e.target.value };
                                  handleUpdateSection(sec.id, { data: { ...sec.data, plans } });
                                }}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-emerald-600 font-semibold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video URL */}
                    {sec.type === 'video' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Đường Dẫn Video (YouTube / Vimeo)
                        </label>
                        <input
                          type="text"
                          value={sec.buttonLink || ''}
                          placeholder="https://www.youtube.com/watch?v=..."
                          onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                        />
                      </div>
                    )}

                    {/* Message Box Dedicated Configuration (100% Flatsome UX Builder Standard) */}
                    {sec.type === 'message_box' && (
                      <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-700/80 space-y-4 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-400/30">
                              📢
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold tracking-wide">Cấu Hình Message Box</span>
                                <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full font-mono border border-blue-400/30">
                                  UX Builder Native
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Tùy biến chi tiết: BG Image, Bg Color, Text Color (Dark/Light), Padding &amp; Icon.
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">[message_box]</span>
                        </div>

                        {/* Wrapper Setting: Wrap in Section & Row vs Full-width */}
                        <div className="flex items-center justify-between p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sec.data?.wrapInSection ?? true}
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), wrapInSection: e.target.checked },
                                });
                              }}
                              className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-200">
                                Bọc trong Section &amp; Row (Khuyên dùng - Chuẩn Cột)
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Giữ khối nằm gọn trong khung trang theo Bố Cục Cột và Khoảng Cách (Padding) đã chọn phía trên, chống tràn lề.
                              </div>
                            </div>
                          </label>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono shrink-0 border ${
                            (sec.data?.wrapInSection ?? true)
                              ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 font-bold'
                              : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          }`}>
                            {(sec.data?.wrapInSection ?? true) ? 'Chống Tràn Lề' : 'Tràn 100% Full-width'}
                          </span>
                        </div>

                        {/* 1. BG Image */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                            BG Image (Ảnh Nền Hộp Thông Báo)
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-16 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                              {sec.data?.bgImage || sec.data?.imageUrl ? (
                                <img
                                  src={sec.data.bgImage || sec.data.imageUrl}
                                  alt="BG Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-[10px] text-slate-500 text-center px-1">Chưa có ảnh nền</div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenMediaPicker(sec.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Change media (Chọn từ Thư viện WP)</span>
                              </button>
                              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Tải ảnh từ máy</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileSelect(sec.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                              {(sec.data?.bgImage || sec.data?.imageUrl) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), bgImage: '', imageUrl: '', imageId: undefined },
                                    })
                                  }
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                                >
                                  Remove (Gỡ ảnh)
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Bg Color & Text Color */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                          {/* Bg Color */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                              Bg Color (Màu Nền)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={sec.data?.bgColor || sec.bgColor || '#2563eb'}
                                onChange={(e) => {
                                  handleUpdateSection(sec.id, {
                                    bgColor: e.target.value,
                                    data: { ...(sec.data || {}), bgColor: e.target.value },
                                  });
                                }}
                                className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                              />
                              <div className="flex flex-wrap gap-1">
                                {[
                                  { label: 'Trong suốt', val: 'transparent' },
                                  { label: 'Xanh', val: '#2563eb' },
                                  { label: 'Lá', val: '#10b981' },
                                  { label: 'Cam', val: '#f59e0b' },
                                  { label: 'Đỏ', val: '#ef4444' },
                                  { label: 'Tối', val: '#0f172a' },
                                ].map((c) => (
                                  <button
                                    key={c.val}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        bgColor: c.val,
                                        data: { ...(sec.data || {}), bgColor: c.val },
                                      });
                                    }}
                                    className={`px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                                      (sec.data?.bgColor || sec.bgColor) === c.val
                                        ? 'border-blue-400 bg-blue-500/30 text-white font-bold'
                                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Color (Dark / Light) */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                              Color (Màu Chữ Flatsome)
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    textColor: 'dark',
                                    data: { ...(sec.data || {}), textColor: 'dark' },
                                  });
                                }}
                                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                  (sec.data?.textColor || sec.textColor || 'dark') === 'dark'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>Dark (Chữ sáng trên nền tối)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    textColor: 'light',
                                    data: { ...(sec.data || {}), textColor: 'light' },
                                  });
                                }}
                                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                  (sec.data?.textColor || sec.textColor) === 'light'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>Light (Chữ tối trên nền sáng)</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 3. Padding Slider & Presets */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <span>Padding (Khoảng Cách Đệm Trong)</span>
                              <span className="text-[10px] text-slate-400 font-normal">Tăng padding giúp hộp dày & hiển thị trọn Banner</span>
                            </label>
                            <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400">
                              <span>{sec.data?.padding !== undefined ? sec.data.padding : 15}</span>
                              <span className="text-[10px] text-slate-500">px</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={160}
                              step={5}
                              value={sec.data?.padding !== undefined ? sec.data.padding : 15}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), padding: val },
                                });
                              }}
                              className="flex-1 accent-blue-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={0}
                              max={200}
                              value={sec.data?.padding !== undefined ? sec.data.padding : 15}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), padding: val },
                                });
                              }}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            {[
                              { label: 'Mặc định (15px)', val: 15 },
                              { label: 'Vừa (30px)', val: 30 },
                              { label: 'Dày (50px)', val: 50 },
                              { label: 'Banner Chuẩn (80px)', val: 80 },
                              { label: 'Banner Lớn (100px)', val: 100 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), padding: preset.val },
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                                  (sec.data?.padding !== undefined ? sec.data.padding : 15) === preset.val
                                    ? 'border-blue-500 bg-blue-600/30 text-white font-bold'
                                    : 'border-slate-700 bg-slate-850 hover:bg-slate-700 text-slate-400'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chiều Cao Tối Thiểu (Min Height) - Chống xẹp nhỏ khi chỉ có nút bấm */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <span>Chiều Cao Tối Thiểu (Min Height)</span>
                              <span className="text-[10px] text-blue-400 font-normal">Chống bị xẹp / nhỏ xíu khi làm Banner ảnh</span>
                            </label>
                            <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400">
                              <span>{sec.data?.minHeight || 0}</span>
                              <span className="text-[10px] text-slate-500">px</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={300}
                              step={10}
                              value={sec.data?.minHeight || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), minHeight: val },
                                });
                              }}
                              className="flex-1 accent-blue-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={0}
                              max={400}
                              value={sec.data?.minHeight || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), minHeight: val },
                                });
                              }}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            {[
                              { label: 'Tự động (0px)', val: 0 },
                              { label: '60px', val: 60 },
                              { label: '100px', val: 100 },
                              { label: '140px (Banner Vừa)', val: 140 },
                              { label: '180px (Banner Lớn)', val: 180 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), minHeight: preset.val },
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                                  (sec.data?.minHeight || 0) === preset.val
                                    ? 'border-blue-500 bg-blue-600/30 text-white font-bold'
                                    : 'border-slate-700 bg-slate-850 hover:bg-slate-700 text-slate-400'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. Bo Góc (Border Radius) & Đổ Bóng (Box Shadow) */}
                        <div className="pt-2 border-t border-slate-800 space-y-3">
                          {/* Bo Góc (Border Radius) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <span>Bo Góc Khối (Border Radius)</span>
                                <span className="text-[10px] text-slate-400 font-normal">Bo tròn viền hộp & cắt ảnh nền</span>
                              </label>
                              <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400">
                                <span>{sec.data?.borderRadius !== undefined ? sec.data.borderRadius : 0}</span>
                                <span className="text-[10px] text-slate-500">px</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={0}
                                max={60}
                                step={2}
                                value={sec.data?.borderRadius !== undefined ? sec.data.borderRadius : 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), borderRadius: val },
                                  });
                                }}
                                className="flex-1 accent-blue-500 cursor-pointer"
                              />
                              <input
                                type="number"
                                min={0}
                                max={99}
                                value={sec.data?.borderRadius !== undefined ? sec.data.borderRadius : 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), borderRadius: val },
                                  });
                                }}
                                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                              {[
                                { label: 'Vuông (0px)', val: 0 },
                                { label: 'Nhẹ (6px)', val: 6 },
                                { label: 'Vừa (12px)', val: 12 },
                                { label: 'Lớn (20px)', val: 20 },
                                { label: 'Tròn (30px)', val: 30 },
                                { label: 'Viên thuốc (99px)', val: 99 },
                              ].map((preset) => (
                                <button
                                  key={preset.val}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), borderRadius: preset.val },
                                    });
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                                    (sec.data?.borderRadius !== undefined ? sec.data.borderRadius : 0) === preset.val
                                      ? 'border-blue-500 bg-blue-600/30 text-white font-bold'
                                      : 'border-slate-700 bg-slate-850 hover:bg-slate-700 text-slate-400'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Hiệu Ứng Đổ Bóng (Box Shadow) */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                              Hiệu Ứng Đổ Bóng &amp; Phát Sáng (Shadow Effect)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {[
                                { id: '', label: 'Không bóng (None)', desc: 'Phẳng mặc định' },
                                { id: 'box-shadow-1', label: 'Bóng nhẹ (Depth 1)', desc: 'Đổ bóng tinh tế' },
                                { id: 'box-shadow-2', label: 'Bóng vừa (Depth 2)', desc: 'Chuẩn Flatsome' },
                                { id: 'box-shadow-3', label: 'Bóng nổi bật (Depth 3)', desc: 'Nổi bật hơn lề' },
                                { id: 'box-shadow-4', label: 'Bóng đậm (Depth 4)', desc: 'Khối bay bổng' },
                                { id: 'box-shadow-5', label: 'Bóng sâu (Depth 5)', desc: 'Độ sâu tối đa' },
                                { id: 'glow-alert', label: '🔴 Neon Đỏ Casino', desc: 'Hào quang đỏ rực' },
                                { id: 'glow-gold', label: '🟡 Neon Vàng Gold', desc: 'Hào quang vàng VIP' },
                                { id: 'glow-primary', label: '🔵 Neon Xanh Cyber', desc: 'Hào quang xanh biển' },
                              ].map((sh) => (
                                <button
                                  key={sh.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), shadow: sh.id },
                                    });
                                  }}
                                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                    (sec.data?.shadow || '') === sh.id
                                      ? 'border-blue-500 bg-blue-600/30 text-white font-bold shadow-2xs'
                                      : 'border-slate-700 bg-slate-800 hover:bg-slate-700/80 text-slate-300'
                                  }`}
                                >
                                  <div className="text-xs truncate">{sh.label}</div>
                                  <div className="text-[9px] text-slate-400 font-normal truncate">{sh.desc}</div>
                                </button>
                              ))}
                            </div>

                            {/* Hover Elevation Checkbox */}
                            {sec.data?.shadow && (
                              <div className="pt-1.5 animate-in fade-in duration-100">
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(sec.data?.shadowHover)}
                                    onChange={(e) => {
                                      handleUpdateSection(sec.id, {
                                        data: { ...(sec.data || {}), shadowHover: e.target.checked },
                                      });
                                    }}
                                    className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span>Tăng độ bóng &amp; bay bổng khi rê chuột (Hover Elevation Effect)</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 5. Layout Mode & Text Content */}
                        <div className="pt-2 border-t border-slate-800 space-y-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                              Bố Cục Hiển Thị (Content &amp; Buttons Layout)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'center', label: 'Chữ & Nút ở Giữa', desc: 'Xếp dọc ở tâm' },
                                { id: 'inline', label: 'Chữ Trái - Nút Phải', desc: 'Dạng thanh ngang 2 bên' },
                                { id: 'buttons_only', label: 'Chỉ Hiện Nút Bấm', desc: 'Không cần chữ' },
                              ].map((mode) => (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), boxLayout: mode.id },
                                    });
                                  }}
                                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                    (sec.data?.boxLayout || 'center') === mode.id
                                      ? 'border-blue-500 bg-blue-600/30 text-white font-bold shadow-2xs'
                                      : 'border-slate-700 bg-slate-800 hover:bg-slate-700/80 text-slate-300'
                                  }`}
                                >
                                  <div className="text-xs">{mode.label}</div>
                                  <div className="text-[9px] text-slate-400 font-normal">{mode.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Button Position & Alignment (Trái / Giữa / Phải) */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>Vị Trí Nút Bấm (Button Position &amp; Alignment)</span>
                              <span className="text-[10px] text-blue-400 font-normal">
                                {sec.data?.boxLayout === 'inline'
                                  ? (sec.data?.buttonAlign === 'left' ? 'Nút bên Trái ⬅️' : 'Nút bên Phải ➡️')
                                  : (sec.data?.buttonAlign === 'left' ? 'Canh Lề Trái' : sec.data?.buttonAlign === 'right' ? 'Canh Lề Phải' : 'Canh Giữa')}
                              </span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                {
                                  id: 'left',
                                  label: 'Bên Trái (Left)',
                                  desc: sec.data?.boxLayout === 'inline' ? 'Nút Trái - Chữ Phải' : 'Căn sang trái',
                                },
                                {
                                  id: 'center',
                                  label: 'Ở Giữa (Center)',
                                  desc: sec.data?.boxLayout === 'inline' ? 'Căn giữa 2 bên' : 'Căn giữa trung tâm',
                                },
                                {
                                  id: 'right',
                                  label: 'Bên Phải (Right)',
                                  desc: sec.data?.boxLayout === 'inline' ? 'Chữ Trái - Nút Phải' : 'Căn sang phải',
                                },
                              ].map((al) => (
                                <button
                                  key={al.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), buttonAlign: al.id },
                                    });
                                  }}
                                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                    (sec.data?.buttonAlign || (sec.data?.boxLayout === 'inline' ? 'right' : 'center')) === al.id
                                      ? 'border-blue-500 bg-blue-600/30 text-white font-bold shadow-2xs'
                                      : 'border-slate-700 bg-slate-800 hover:bg-slate-700/80 text-slate-300'
                                  }`}
                                >
                                  <div className="text-xs">{al.label}</div>
                                  <div className="text-[9px] text-slate-400 font-normal">{al.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Message Text (Hidden if buttons_only) */}
                          {sec.data?.boxLayout !== 'buttons_only' ? (
                            <div className="space-y-3 animate-in fade-in duration-100">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                    Nội Dung Thông Báo (Message Text)
                                  </label>
                                  <span className="text-[10px] text-slate-400">Có thể để trống nếu chỉ muốn icon / nút</span>
                                </div>
                                <textarea
                                  rows={2}
                                  value={sec.content !== undefined ? sec.content : (sec.subtitle || sec.title || '')}
                                  placeholder="Nhập thông điệp nổi bật, thông báo khuyến mãi, sự kiện... (Hoặc để trống)"
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      content: e.target.value,
                                      subtitle: e.target.value,
                                      title: e.target.value,
                                    });
                                  }}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-blue-500"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                                    Icon / Biểu Tượng Phía Trước
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    {['📢', 'ℹ️', '⚠️', '✅', '🎁', '🔥', 'none'].map((ic) => (
                                      <button
                                        key={ic}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), icon: ic === 'none' ? '' : ic },
                                          });
                                        }}
                                        className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition cursor-pointer ${
                                          (sec.data?.icon === '' && ic === 'none') ||
                                          sec.data?.icon === ic ||
                                          (!sec.data?.icon && ic === '📢')
                                            ? 'border-blue-500 bg-blue-600/30 text-white font-bold'
                                            : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                                        }`}
                                      >
                                        {ic === 'none' ? '✕' : ic}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {sec.data?.boxLayout !== 'inline' && (
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                                      Căn Lề Chữ (Text Alignment)
                                    </label>
                                    <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                                      {[
                                        { id: 'left', label: 'Trái' },
                                        { id: 'center', label: 'Giữa' },
                                        { id: 'right', label: 'Phải' },
                                      ].map((al) => (
                                        <button
                                          key={al.id}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), textAlign: al.id },
                                            });
                                          }}
                                          className={`py-1 rounded-lg font-semibold transition cursor-pointer ${
                                            (sec.data?.textAlign || 'center') === al.id
                                              ? 'bg-blue-600 text-white shadow-xs'
                                              : 'text-slate-400 hover:text-white'
                                          }`}
                                        >
                                          {al.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                              <span>ℹ️</span>
                              <span>Đang ở chế độ <strong>Chỉ Nút Bấm</strong>. Khối sẽ ẩn chữ và chỉ hiển thị các nút kêu gọi hành động (CTA).</span>
                            </div>
                          )}
                        </div>

                        {/* 5. Buttons Configuration (Button 1 & Button 2) */}
                        <div className="pt-2 border-t border-slate-800 space-y-3">
                          {/* Button 1 */}
                          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sec.data?.hasButton1 ?? true}
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      data: {
                                        ...(sec.data || {}),
                                        hasButton1: e.target.checked,
                                        button1Text: e.target.checked ? (sec.data?.button1Text || 'Đăng Ký Ngay') : '',
                                      },
                                    });
                                  }}
                                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>Nút Bấm Chính (Button 1)</span>
                              </label>
                              {(sec.data?.hasButton1 ?? true) && (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-400/30">
                                  Đang bật
                                </span>
                              )}
                            </div>

                            {(sec.data?.hasButton1 ?? true) && (
                              <div className="space-y-2 pt-1 animate-in fade-in duration-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Tên Nút Bấm 1</label>
                                    <input
                                      type="text"
                                      value={sec.data?.button1Text !== undefined ? sec.data.button1Text : (sec.buttonText || 'Đăng Ký Ngay')}
                                      placeholder="Ví dụ: Đăng Ký Ngay, Nhận Ưu Đãi..."
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          buttonText: e.target.value,
                                          data: { ...(sec.data || {}), hasButton1: true, button1Text: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Đường Dẫn Link</label>
                                    <input
                                      type="text"
                                      value={sec.data?.button1Link !== undefined ? sec.data.button1Link : (sec.buttonLink || '#')}
                                      placeholder="https://..."
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          buttonLink: e.target.value,
                                          data: { ...(sec.data || {}), hasButton1: true, button1Link: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Màu Sắc Nút</label>
                                    <select
                                      value={sec.data?.button1Color || 'white'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), hasButton1: true, button1Color: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="white">Trắng (White)</option>
                                      <option value="primary">Màu Chính (Primary)</option>
                                      <option value="secondary">Màu Phụ (Secondary)</option>
                                      <option value="success">Xanh Lá (Success)</option>
                                      <option value="alert">Đỏ Cảnh Báo (Alert)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Kiểu Dáng</label>
                                    <select
                                      value={sec.data?.button1Style || ''}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button1Style: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="">Đầy màu (Solid)</option>
                                      <option value="outline">Viền trong suốt (Outline)</option>
                                      <option value="shade">Bóng đổ (Shade)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Kích Cỡ</label>
                                    <select
                                      value={sec.data?.button1Size || 'medium'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button1Size: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="small">Nhỏ (Small)</option>
                                      <option value="medium">Vừa (Medium)</option>
                                      <option value="large">Lớn (Large)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-amber-400 font-medium mb-0.5 block flex items-center gap-1">
                                      <span>✨ Hiệu Ứng Nút</span>
                                    </label>
                                    <select
                                      value={sec.data?.button1Animation || ''}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), hasButton1: true, button1Animation: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-lg px-2 py-1.5 text-xs text-amber-300 outline-hidden font-medium"
                                    >
                                      <option value="">Tĩnh (Không hiệu ứng)</option>
                                      <option value="shimmer">⚡ Làn Mây Quét Sáng (Shimmer)</option>
                                      <option value="shake">📳 Rung Lắc Gây Chú Ý (Shake)</option>
                                      <option value="pulse">💓 Nhịp Thở Phóng To (Pulse)</option>
                                      <option value="glow">🌟 Phát Sáng Hào Quang (Glow)</option>
                                      <option value="combo">🔥 VIP: Làn Mây + Rung Lắc</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Button 2 (Optional) */}
                          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(sec.data?.hasButton2)}
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      data: {
                                        ...(sec.data || {}),
                                        hasButton2: e.target.checked,
                                        button2Text: e.target.checked ? (sec.data?.button2Text || 'Xem Thêm') : '',
                                      },
                                    });
                                  }}
                                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>Nút Bấm Phụ 2 (Button 2 - Tùy chọn)</span>
                              </label>
                              {Boolean(sec.data?.hasButton2) && (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-400/30">
                                  Đang bật
                                </span>
                              )}
                            </div>

                            {Boolean(sec.data?.hasButton2) && (
                              <div className="space-y-2 pt-1 animate-in fade-in duration-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Tên Nút Bấm 2</label>
                                    <input
                                      type="text"
                                      value={sec.data?.button2Text || ''}
                                      placeholder="Ví dụ: Tìm Hiểu Thêm..."
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Text: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Đường Dẫn Link</label>
                                    <input
                                      type="text"
                                      value={sec.data?.button2Link || '#'}
                                      placeholder="https://..."
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Link: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Màu Sắc Nút</label>
                                    <select
                                      value={sec.data?.button2Color || 'secondary'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Color: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="white">Trắng (White)</option>
                                      <option value="primary">Màu Chính (Primary)</option>
                                      <option value="secondary">Màu Phụ (Secondary)</option>
                                      <option value="success">Xanh Lá (Success)</option>
                                      <option value="alert">Đỏ Cảnh Báo (Alert)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Kiểu Dáng</label>
                                    <select
                                      value={sec.data?.button2Style || 'outline'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Style: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="outline">Viền trong suốt (Outline)</option>
                                      <option value="">Đầy màu (Solid)</option>
                                      <option value="shade">Bóng đổ (Shade)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Kích Cỡ</label>
                                    <select
                                      value={sec.data?.button2Size || 'medium'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Size: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                                    >
                                      <option value="small">Nhỏ (Small)</option>
                                      <option value="medium">Vừa (Medium)</option>
                                      <option value="large">Lớn (Large)</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WordPress Media & Image Upload (SEO Optimized) */}
                    {['image', 'image_box', 'banner', 'hero', 'about'].includes(sec.type) && (
                      <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <ImagePlus className="w-4 h-4 text-blue-600" />
                            <span>Hình Ảnh Chuẩn SEO (WordPress Media Library)</span>
                          </label>
                          {sec.data?.imageId ? (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>WP Media #{sec.data.imageId}</span>
                            </span>
                          ) : sec.data?.imageUrl ? (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                              Chưa lưu vào WP Media
                            </span>
                          ) : null}
                        </div>

                        {/* Image preview & action buttons */}
                        <div className="flex items-start gap-3">
                          <div className="w-28 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group shadow-2xs">
                            {sec.data?.imageUrl ? (
                              <>
                                <img
                                  src={sec.data.imageUrl}
                                  alt={sec.data.alt || 'Preview'}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: {
                                        ...(sec.data || {}),
                                        imageUrl: '',
                                        fileData: undefined,
                                        imageId: undefined,
                                      },
                                    });
                                  }}
                                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition cursor-pointer"
                                >
                                  Gỡ ảnh
                                </button>
                              </>
                            ) : (
                              <div className="text-center p-2">
                                <Image className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                <span className="text-[9px] text-slate-400">Chưa có ảnh</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer">
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Chọn ảnh từ máy tính</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelect(sec.id, file);
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleOpenMediaPicker(sec.id)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                                <span>Thư viện Media WP</span>
                              </button>
                            </div>

                            {/* Upload to WP button if file is chosen */}
                            {sec.data?.imageUrl && (
                              <div className="pt-1 flex flex-wrap items-center gap-2">
                                {sec.data?.imageId ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdatingMediaId === sec.id}
                                      onClick={() => handleUpdateWpMedia(sec.id)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      title="Cập nhật lại Tiêu đề, Chú thích, Mô tả và Alt text của ảnh này lên WordPress"
                                    >
                                      {isUpdatingMediaId === sec.id ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Đang cập nhật WP Media...</span>
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="w-3.5 h-3.5" />
                                          <span>🔄 Cập nhật thông tin Media (#{sec.data.imageId})</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUploadingMediaId === sec.id}
                                      onClick={() => handleUploadToWpMedia(sec.id)}
                                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Tải ảnh này lên WordPress thành 1 file ảnh mới riêng biệt"
                                    >
                                      {isUploadingMediaId === sec.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <UploadCloud className="w-3 h-3 text-slate-500" />
                                      )}
                                      <span>Tải thành ảnh mới</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isUploadingMediaId === sec.id}
                                    onClick={() => handleUploadToWpMedia(sec.id)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    {isUploadingMediaId === sec.id ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Đang tải lên WordPress Media...</span>
                                      </>
                                    ) : (
                                      <>
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>🚀 Tải lên WordPress Media ngay</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {uploadSuccessMsg[sec.id] && (
                              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{uploadSuccessMsg[sec.id]}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* WordPress Image Metadata Fields (matching WordPress Screenshot 2) */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          {/* Alt text */}
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[11px] font-bold text-slate-700">
                                Văn bản thay thế (Alternative text)
                              </label>
                              <span className="text-[9px] text-blue-600 font-semibold">Tối ưu SEO Google Image</span>
                            </div>
                            <textarea
                              rows={1}
                              value={sec.data?.alt || ''}
                              placeholder="Mô tả mục đích và nội dung hình ảnh để Google hiểu rõ..."
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), alt: e.target.value },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Để trống nếu hình ảnh chỉ mang tính chất trang trí.
                            </p>
                          </div>

                          {/* Layout Width Mode */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Khung Hiển Thị Ảnh (Layout Width)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), isFullWidth: true },
                                  });
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                  sec.data?.isFullWidth !== false
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Tràn Viền (Full-Width 100%)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), isFullWidth: false },
                                  });
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                  sec.data?.isFullWidth === false
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <Box className="w-3.5 h-3.5" />
                                <span>Trong Khung (Container 1200px)</span>
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {sec.data?.isFullWidth !== false
                                ? '• Tràn viền: Ảnh trải dài 100% sang 2 mép màn hình không có khoảng trắng lề.'
                                : '• Trong khung: Ảnh nằm gọn bên trong khung lề 1200px của website.'}
                            </p>
                          </div>

                          {/* Image Title / Qualification */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Tiêu đề ảnh (Qualification / Title)
                            </label>
                            <input
                              type="text"
                              value={sec.data?.title || ''}
                              placeholder="Tiêu đề tệp ảnh hiển thị trong WordPress..."
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), title: e.target.value },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          {/* Caption */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Chú thích ảnh (Image caption)
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 hover:text-blue-600 select-none bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <input
                                  type="checkbox"
                                  checked={sec.data?.showCaption === true}
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), showCaption: e.target.checked },
                                    });
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={sec.data?.showCaption === true ? 'font-bold text-blue-700' : 'text-slate-500 font-medium'}>
                                  {sec.data?.showCaption === true ? 'Đang hiện ra ngoài web' : 'Ẩn ngoài web (Lưu ngầm SEO)'}
                                </span>
                              </label>
                            </div>
                            <textarea
                              rows={1}
                              value={sec.data?.caption || ''}
                              placeholder="Dòng chú thích lưu trong WordPress Media (Alt/Caption ngầm chuẩn SEO)..."
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), caption: e.target.value },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {sec.data?.showCaption === true
                                ? '• Đang bật hiển thị: Dòng chữ này sẽ xuất hiện bên dưới ảnh ngoài giao diện website.'
                                : '• Đang tắt hiển thị (Khuyên dùng cho Banner): Chú thích chỉ lưu ngầm trong WordPress Media & Google SEO, không hiện chữ làm xấu banner.'}
                            </p>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Mô tả ảnh (Description)
                            </label>
                            <textarea
                              rows={2}
                              value={sec.data?.description || ''}
                              placeholder="Mô tả chi tiết nội dung tệp ảnh lưu trong WordPress..."
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), description: e.target.value },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          {/* File URL */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Đường dẫn file (File URL)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={sec.data?.imageUrl || ''}
                                placeholder="http://mexvip.sh/wp-content/uploads/..."
                                onChange={(e) => {
                                  handleUpdateSection(sec.id, {
                                    data: { ...(sec.data || {}), imageUrl: e.target.value },
                                  });
                                }}
                                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-700 outline-hidden focus:border-blue-500"
                              />
                              {sec.data?.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(sec.data.imageUrl);
                                    alert('Đã copy URL ảnh!');
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium shrink-0 cursor-pointer"
                                >
                                  Copy URL
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Dedicated Update / Sync Action Card */}
                          {sec.data?.imageId ? (
                            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs mt-1">
                              <div className="text-xs text-blue-950">
                                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span>Ảnh đã lưu trên WP Media (ID: #{sec.data.imageId})</span>
                                </div>
                                <p className="text-[11px] text-blue-700 mt-0.5">
                                  Bạn vừa điền/sửa <strong>Văn bản thay thế, Tiêu đề, Chú thích hoặc Mô tả</strong>? Bấm nút này để cập nhật trực tiếp vào WordPress:
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={isUpdatingMediaId === sec.id}
                                onClick={() => handleUpdateWpMedia(sec.id)}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                              >
                                {isUpdatingMediaId === sec.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang cập nhật...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>🔄 Lưu cập nhật thông tin ảnh</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs mt-1">
                              <div className="text-xs text-emerald-950">
                                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                                  <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Lưu ảnh & toàn bộ thông tin SEO lên WordPress</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 mt-0.5">
                                  Sau khi điền đủ Tiêu đề, Chú thích, Mô tả, Alt text, bấm để lưu ảnh kèm siêu dữ liệu vào WP Media.
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={isUploadingMediaId === sec.id}
                                onClick={() => handleUploadToWpMedia(sec.id)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                              >
                                {isUploadingMediaId === sec.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang tải lên WP...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>🚀 Tải lên WP Media ngay</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Universal Advanced Settings: Class & Visibility (Flatsome UX Builder Standard) */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          const isAdv = sec.data?.isAdvancedOpen ?? false;
                          handleUpdateSection(sec.id, {
                            data: { ...(sec.data || {}), isAdvancedOpen: !isAdv },
                          });
                        }}
                        className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-blue-600 py-1.5 cursor-pointer transition select-none bg-slate-50 hover:bg-slate-100 px-3 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-blue-600" />
                          <span>▼ Cài Đặt Nâng Cao (Advanced: Class &amp; Visibility)</span>
                          {(sec.data?.customClass || (sec.data?.visibility && sec.data?.visibility !== 'visible')) && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" title="Có cấu hình nâng cao" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {sec.data?.isAdvancedOpen ? 'Thu gọn ▲' : 'Mở rộng ▼'}
                        </span>
                      </button>

                      {sec.data?.isAdvancedOpen && (
                        <div className="mt-2.5 p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Class (Custom CSS Class)
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">class=""</span>
                            </div>
                            <input
                              type="text"
                              value={sec.data?.customClass || sec.data?.class || ''}
                              placeholder="Ví dụ: my-custom-class shadow-lg rounded-2xl"
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: {
                                    ...(sec.data || {}),
                                    customClass: e.target.value,
                                    class: e.target.value,
                                  },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-hidden focus:border-blue-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Gán thêm class CSS tùy biến để áp dụng các hiệu ứng hoặc style riêng cho khối này.
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Visibility (Khả năng hiển thị theo thiết bị)
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">visibility=""</span>
                            </div>
                            <select
                              value={sec.data?.visibility || 'visible'}
                              onChange={(e) => {
                                handleUpdateSection(sec.id, {
                                  data: { ...(sec.data || {}), visibility: e.target.value },
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 font-medium"
                            >
                              <option value="visible">Visible (Hiển thị trên mọi thiết bị)</option>
                              <option value="hide-for-medium">Hide for Tablet &amp; Mobile (Ẩn trên Tablet &amp; Mobile)</option>
                              <option value="hide-for-small">Hide for Mobile (Ẩn trên điện thoại Mobile)</option>
                              <option value="show-for-small">Show for Mobile Only (Chỉ hiện trên điện thoại Mobile)</option>
                              <option value="show-for-medium">Show for Tablet &amp; Mobile (Chỉ hiện trên Tablet &amp; Mobile)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Ẩn hoặc hiện khối này tùy theo kích thước màn hình người dùng (chuẩn Flatsome).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* WordPress Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Thư Viện Media WordPress ({currentSite?.siteUrl || 'Website'})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {targetSectionIdForMedia
                      ? 'Click chọn ảnh để gán vào section hoặc tích chọn nhiều ảnh để xóa hàng loạt'
                      : 'Quản lý toàn bộ ảnh: Bạn có thể tích chọn nhiều ảnh rồi bấm Xóa Hàng Loạt 🗑️'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshMedia}
                  disabled={isLoadingMedia}
                  className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Tải lại danh sách ảnh từ WordPress"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMedia ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
                <button
                  onClick={() => setIsMediaPickerOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {mediaNotice && (
              <div
                className={`mx-4 mt-3 p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border ${
                  mediaNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{mediaNotice.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaNotice(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold px-1 text-sm cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {/* Toolbar: Chọn tất cả, Lọc tìm kiếm & Nút Xóa Hàng Loạt */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectAllMedia(filteredMediaList)}
                  disabled={filteredMediaList.length === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer select-none bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
                  title={isAllFilteredSelected ? 'Bỏ chọn tất cả ảnh hiển thị' : 'Chọn tất cả ảnh hiển thị'}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                      isAllFilteredSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : selectedMediaIds.length > 0
                        ? 'bg-blue-50 border-blue-400 text-blue-600'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isAllFilteredSelected ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : selectedMediaIds.length > 0 ? (
                      <span className="text-[11px] font-bold leading-none">-</span>
                    ) : (
                      <Square className="w-3.5 h-3.5 text-transparent" />
                    )}
                  </div>
                  <span>
                    {isAllFilteredSelected
                      ? 'Bỏ chọn tất cả'
                      : `Chọn tất cả (${filteredMediaList.length})`}
                  </span>
                </button>

                {selectedMediaIds.length > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span>Đã chọn:</span>
                    <strong className="underline">{selectedMediaIds.length}</strong>
                    <span>ảnh</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Ô tìm kiếm lọc ảnh */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    placeholder="Lọc tên, alt, ID..."
                    className="pl-8 pr-6 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 w-36 sm:w-48 shadow-2xs"
                  />
                  {mediaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMediaSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Nút Xóa Hàng Loạt */}
                {selectedMediaIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteWpMedia}
                    disabled={isBulkDeleting}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 animate-in fade-in"
                    title="Xóa vĩnh viễn toàn bộ các ảnh đã được tích chọn"
                  >
                    {isBulkDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Xóa {selectedMediaIds.length} ảnh đã chọn</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingMedia ? (
                <div className="text-center py-16 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs">Đang tải danh sách ảnh từ WordPress...</p>
                </div>
              ) : wpMediaList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Image className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Chưa có ảnh nào trong thư viện WordPress</p>
                  <p className="text-[11px] text-slate-400 mt-1">Bạn có thể chọn ảnh từ máy tính để tải trực tiếp lên!</p>
                </div>
              ) : filteredMediaList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Không tìm thấy ảnh phù hợp với từ khóa "{mediaSearchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => setMediaSearchQuery('')}
                    className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {filteredMediaList.map((item) => {
                    const isSelected = selectedMediaIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group border rounded-lg overflow-hidden flex flex-col bg-slate-50 transition relative text-left shadow-2xs hover:shadow-xs ${
                          isSelected
                            ? 'ring-2 ring-red-500 border-red-500 bg-red-50/20'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div
                          onClick={(e) => {
                            if (targetSectionIdForMedia) {
                              handleSelectWpMedia(item);
                            } else {
                              handleToggleSelectMedia(e, item.id);
                            }
                          }}
                          className="aspect-square bg-slate-200 overflow-hidden relative cursor-pointer"
                          title={
                            targetSectionIdForMedia
                              ? 'Click để chọn ảnh này'
                              : isSelected
                              ? 'Click để bỏ chọn ảnh này'
                              : 'Click để chọn ảnh này xóa hàng loạt'
                          }
                        >
                          <img
                            src={item.thumb || item.url}
                            alt={item.alt || item.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition duration-200 ${
                              isSelected ? 'opacity-90' : ''
                            }`}
                          />

                          {/* Ô Checkbox Chọn Nhiều ở góc trên bên trái */}
                          <div
                            onClick={(e) => handleToggleSelectMedia(e, item.id)}
                            className="absolute top-1.5 left-1.5 z-10 cursor-pointer"
                            title={isSelected ? 'Bỏ chọn ảnh' : 'Tích chọn để xóa hàng loạt'}
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center transition shadow-xs ${
                                isSelected
                                  ? 'bg-red-600 text-white ring-2 ring-white'
                                  : 'bg-white/95 text-slate-400 hover:bg-white hover:text-slate-800 border border-slate-300'
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>

                          <span className="absolute bottom-1 right-1 bg-slate-900/70 text-white text-[8px] font-bold px-1 rounded">
                            #{item.id}
                          </span>

                          {/* Nút Xóa Đơn Lẻ Vĩnh Viễn */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteWpMedia(e, item)}
                            disabled={deletingMediaId === item.id || isBulkDeleting}
                            title="Xóa vĩnh viễn ảnh này khỏi thư viện WordPress"
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white/95 hover:bg-red-600 text-slate-500 hover:text-white flex items-center justify-center transition shadow-xs z-10 opacity-75 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                          >
                            {deletingMediaId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 hover:text-white" />
                            )}
                          </button>
                        </div>

                        <div
                          onClick={(e) => {
                            if (targetSectionIdForMedia) {
                              handleSelectWpMedia(item);
                            } else {
                              handleToggleSelectMedia(e, item.id);
                            }
                          }}
                          className={`p-1.5 bg-white flex-1 cursor-pointer ${
                            targetSectionIdForMedia ? 'hover:bg-blue-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-slate-800 truncate" title={item.title}>
                            {item.title || `Ảnh #${item.id}`}
                          </div>
                          {item.alt && (
                            <div className="text-[8px] text-blue-600 truncate mt-0.5">
                              Alt: {item.alt}
                            </div>
                          )}
                          {targetSectionIdForMedia && (
                            <div className="mt-1 text-[9px] font-bold text-blue-600 group-hover:underline">
                              + Chọn ảnh này
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  {filteredMediaList.length !== wpMediaList.length
                    ? `Hiển thị ${filteredMediaList.length} / tổng số ${wpMediaList.length} ảnh`
                    : `Tổng cộng ${wpMediaList.length} tệp hình ảnh`}
                </span>
                {selectedMediaIds.length > 0 && (
                  <span className="font-semibold text-red-600">
                    (Đang chọn {selectedMediaIds.length} ảnh)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedMediaIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteWpMedia}
                    disabled={isBulkDeleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isBulkDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Xóa {selectedMediaIds.length} ảnh đã chọn</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMediaPickerOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Step Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          ← Quay lại Bước 4 (Cấu Hình Menu)
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickDeployHomepage}
            disabled={isDeployingHomepage || !currentSite}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Cập nhật trực tiếp nội dung mới của Trang Chủ lên website WordPress"
          >
            {isDeployingHomepage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Rocket className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Cập Nhật Trang Chủ Lên Web</span>
          </button>

          <button
            onClick={onNextStep}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Tiếp Tục: Chọn Bố Cục Footer →
          </button>
        </div>
      </div>
    </div>
  );
};
