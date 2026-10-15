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
  Smartphone,
  Monitor,
  Pencil,
  Check,
  X,
  Tag,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { SectionItem, FlatsomeElementType, ColumnLayoutPreset, ConnectedSite, WpMediaItem } from '../../types';
import { api } from '../../services/api';
import { WpRichTextEditor } from '../common/WpRichTextEditor';

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

const parsePaddingTop = (padding?: string): number => {
  if (!padding) return 60;
  if (padding === 'none') return 0;
  if (padding === '5px') return 5;
  if (padding === 'tight') return 10;
  if (padding === 'compact') return 15;
  if (padding === '20px') return 20;
  if (padding === 'small') return 35;
  if (padding === 'normal') return 60;
  if (padding === 'large') return 90;
  const parts = padding.trim().split(/\s+/);
  if (parts.length > 0) {
    const val = parseInt(parts[0], 10);
    return isNaN(val) ? 60 : val;
  }
  return 60;
};

const parsePaddingBottom = (padding?: string): number => {
  if (!padding) return 60;
  if (padding === 'none') return 0;
  if (padding === '5px') return 5;
  if (padding === 'tight') return 10;
  if (padding === 'compact') return 15;
  if (padding === '20px') return 20;
  if (padding === 'small') return 35;
  if (padding === 'normal') return 60;
  if (padding === 'large') return 90;
  const parts = padding.trim().split(/\s+/);
  if (parts.length >= 3) {
    const val = parseInt(parts[2], 10);
    return isNaN(val) ? 60 : val;
  } else if (parts.length > 0) {
    const val = parseInt(parts[0], 10);
    return isNaN(val) ? 60 : val;
  }
  return 60;
};

// --- 3 MẪU TRANG CHỦ ĐƠN GIẢN: BANNER + IMGBOX + MESSBOX + TEXT DEMO ---
export interface HomepageTemplatePreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  blocks: { icon: string; name: string; desc: string }[];
  generateSections: () => SectionItem[];
}

export const HOMEPAGE_TEMPLATES: HomepageTemplatePreset[] = [
  {
    id: 'template-seo-standard',
    name: 'Mẫu 1: Doanh Nghiệp & Dịch Vụ SEO',
    badge: '⭐ Chuẩn SEO & Doanh Nghiệp',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    description: 'Bố cục chuẩn mực giới thiệu năng lực thương hiệu, thông báo khuyến mãi và dịch vụ chuyên sâu.',
    blocks: [
      { icon: '🌄', name: 'Banner', desc: 'Banner giải pháp đột phá, H1 chuẩn SEO' },
      { icon: '📢', name: 'MessBox', desc: 'Hộp ưu đãi & nút tư vấn trực tiếp' },
      { icon: '🎴', name: 'ImgBox', desc: 'Lưới 3 ảnh dịch vụ nổi bật' },
      { icon: '📝', name: 'Text Demo', desc: 'Văn bản cam kết chất lượng, danh sách tiện ích' },
    ],
    generateSections: (): SectionItem[] => {
      const now = Date.now();
      return [
        {
          id: `banner-${now}-1`,
          type: 'banner',
          title: 'GIẢI PHÁP ĐỘT PHÁ CHO DOANH NGHIỆP BẠN',
          subtitle: 'Tối ưu hóa hiệu suất, nâng tầm thương hiệu với quy trình chuyên nghiệp và chuẩn SEO hàng đầu.',
          buttonText: 'Khám Phá Dịch Vụ',
          buttonLink: '#services',
          bgColor: '#0f172a',
          textColor: 'light',
          padding: 'large',
          data: {
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80',
            alt: 'Banner doanh nghiệp chuẩn SEO',
          },
        },
        {
          id: `message_box-${now}-2`,
          type: 'message_box',
          content: '🔥 Ưu đãi độc quyền: Tặng gói audit SEO Onpage & hỗ trợ cấu hình kỹ thuật miễn phí cho 30 khách hàng đăng ký sớm nhất!',
          subtitle: '🔥 Ưu đãi độc quyền: Tặng gói audit SEO Onpage & hỗ trợ cấu hình kỹ thuật miễn phí cho 30 khách hàng đăng ký sớm nhất!',
          bgColor: '#f59e0b',
          textColor: 'dark',
          padding: '20px',
          data: {
            wrapInSection: true,
            boxLayout: 'inline',
            buttonAlign: 'right',
            icon: '🔥',
            hasButton1: true,
            button1Text: 'Nhận Ưu Đãi Ngay',
            button1Link: '#contact',
            button1Color: 'primary',
            borderRadius: 12,
            boxShadow: 'subtle',
          },
        },
        {
          id: `image_box-${now}-3`,
          type: 'image_box',
          title: 'Lĩnh Vực Hoạt Động & Dịch Vụ Nổi Bật',
          subtitle: 'Hệ thống giải pháp đồng bộ đem lại hiệu quả tăng trưởng bền vững',
          bgColor: '#f8fafc',
          padding: 'normal',
          layout: '3-col-equal',
          data: {
            items: [
              {
                title: 'Tối Ưu SEO & Content Marketing',
                desc: 'Đưa từ khóa lên Top Google bền vững, gia tăng lượng truy cập tự nhiên.',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
                link: '#seo',
              },
              {
                title: 'Thiết Kế Web Flatsome Cao Cấp',
                desc: 'Giao diện hiện đại, tốc độ tải trang dưới 1s, chuẩn Core Web Vitals.',
                img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
                link: '#web-design',
              },
              {
                title: 'Hạ Tầng & Vận Hành Kỹ Thuật',
                desc: 'Bảo mật đa tầng, chống DDoS và hỗ trợ vận hành 24/7 không gián đoạn.',
                img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
                link: '#cloud-hosting',
              },
            ],
          },
        },
        {
          id: `text_block-${now}-4`,
          type: 'text_block',
          title: 'Giới Thiệu Thương Hiệu & Cam Kết Chất Lượng',
          bgColor: '#ffffff',
          padding: 'normal',
          data: {
            boxEnabled: true,
            boxPreset: 'clean-border',
            boxBgColor: '#ffffff',
            boxTextColor: 'dark',
            boxBorderWidth: 1.5,
            boxBorderColor: '#e2e8f0',
            boxBorderStyle: 'solid',
            boxRadius: 14,
            boxPadding: '24px 28px',
            boxShadow: 'subtle',
          },
          content: `<h2>Chào Mừng Đến Với Hệ Thống Nền Tảng Dịch Vụ Đẳng Cấp</h2>
<p>Chúng tôi tự hào là đơn vị tiên phong cung cấp giải pháp công nghệ và truyền thông số toàn diện. Với định hướng lấy chất lượng và sự hài lòng của đối tác làm kim chỉ nam, mỗi sản phẩm bàn giao đều được kiểm định khắt khe theo các tiêu chuẩn khắt khe nhất của Google.</p>
<p><strong>Những cam kết chất lượng cốt lõi:</strong></p>
<ul>
  <li><strong>Hiệu năng vượt trội:</strong> Tối ưu mã nguồn sạch sẽ, không dư thừa tài nguyên, đạt điểm PageSpeed 90+.</li>
  <li><strong>Bảo mật tối đa:</strong> Cơ chế mã hóa dữ liệu an toàn và hệ thống tường lửa chủ động.</li>
  <li><strong>Đồng hành 24/7:</strong> Đội ngũ kỹ thuật viên luôn túc trực hỗ trợ giải đáp mọi lúc mọi nơi.</li>
</ul>`,
        },
      ];
    },
  },
  {
    id: 'template-casino-entertainment',
    name: 'Mẫu 2: Cổng Game & Giải Trí Luxury',
    badge: '🎰 Casino & Game Luxury',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    description: 'Giao diện bắt mắt dành cho sân chơi giải trí, thể thao và sòng bài với phong cách viền vàng đẳng cấp.',
    blocks: [
      { icon: '🌄', name: 'Banner', desc: 'Thưởng nạp 100%, nút Đăng Ký nổi bật' },
      { icon: '🎴', name: 'ImgBox', desc: '3 sảnh game hot: Nổ Hũ, Casino, Thể Thao' },
      { icon: '📢', name: 'MessBox', desc: 'Thông báo hoàn trả VIP & nhận thưởng' },
      { icon: '📝', name: 'Text Demo', desc: 'Chính sách minh bạch khung viền vàng Gold Luxury' },
    ],
    generateSections: (): SectionItem[] => {
      const now = Date.now();
      return [
        {
          id: `banner-${now}-1`,
          type: 'banner',
          title: 'SÂN CHƠI ĐẲNG CẤP QUỐC TẾ - THƯỞNG NẠP 100%',
          subtitle: 'Trải nghiệm hàng ngàn trò chơi nổ hũ, live casino và cá cược thể thao uy tín minh bạch số 1 Châu Á.',
          buttonText: 'ĐĂNG KÝ THAM GIA',
          buttonLink: '#register',
          bgColor: '#090d16',
          textColor: 'light',
          padding: 'large',
          data: {
            imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1400&auto=format&fit=crop&q=80',
            alt: 'Banner Sân Chơi Quốc Tế',
          },
        },
        {
          id: `image_box-${now}-2`,
          type: 'image_box',
          title: 'Sảnh Trò Chơi Nổi Bật Được Yêu Thích Nhất',
          subtitle: 'Khám phá thế giới giải trí đỉnh cao cùng tỷ lệ trả thưởng cực khủng',
          bgColor: '#0b0f19',
          textColor: 'light',
          padding: 'normal',
          layout: '3-col-equal',
          data: {
            items: [
              {
                title: '🎰 Nổ Hũ Slots Jackpot',
                desc: 'Hàng trăm hũ vàng nổ liên tục mỗi ngày cùng đồ họa 3D sống động.',
                img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
                link: '#slots',
              },
              {
                title: '🎲 Live Casino Trực Tuyến',
                desc: 'Sòng bài trực tiếp cùng dàn Dealer xinh đẹp chuyên nghiệp chuẩn 5 sao.',
                img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
                link: '#casino',
              },
              {
                title: '⚽ Cá Cược Thể Thao',
                desc: 'Đầy đủ các giải đấu Ngoại Hạng Anh, C1, World Cup với kèo cược tốt nhất.',
                img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
                link: '#sports',
              },
            ],
          },
        },
        {
          id: `message_box-${now}-3`,
          type: 'message_box',
          content: '💎 Khuyến Mãi VIP Đặc Quyền: Hoàn trả không giới hạn lên đến 1.5% mỗi ngày + Thưởng nạp đầu 100% cho mọi tân thủ đăng ký hôm nay!',
          subtitle: '💎 Khuyến Mãi VIP Đặc Quyền: Hoàn trả không giới hạn lên đến 1.5% mỗi ngày + Thưởng nạp đầu 100% cho mọi tân thủ đăng ký hôm nay!',
          bgColor: '#dc2626',
          textColor: 'dark',
          padding: '20px',
          data: {
            wrapInSection: true,
            boxLayout: 'inline',
            buttonAlign: 'right',
            icon: '🎁',
            hasButton1: true,
            button1Text: 'Nhận Khuyến Mãi',
            button1Link: '#promo',
            button1Color: 'alert',
            borderRadius: 12,
            boxShadow: 'subtle',
          },
        },
        {
          id: `text_block-${now}-4`,
          type: 'text_block',
          title: 'Hướng Dẫn Tham Gia & Giấy Phép Hoạt Động Minh Bạch',
          bgColor: '#090d16',
          textColor: 'light',
          padding: 'normal',
          data: {
            boxEnabled: true,
            boxPreset: 'gold-luxury',
            boxBgColor: 'rgba(10, 15, 29, 0.95)',
            boxTextColor: 'gold',
            boxBorderWidth: 1.5,
            boxBorderColor: '#f59e0b',
            boxBorderStyle: 'solid',
            boxRadius: 16,
            boxPadding: '24px 28px',
            boxShadow: 'glow-gold',
            boxBackdropBlur: true,
          },
          content: `<h2>Chính Sách Hoạt Động & Cam Kết Minh Bạch</h2>
<p>Cổng game hoạt động dưới sự giám sát nghiêm ngặt của tổ chức cấp phép quốc tế PAGCOR và Isle of Man. Mọi kết quả cá cược đều được vận hành bằng thuật toán ngẫu nhiên RNG đã qua kiểm định độc lập, đảm bảo tính công bằng tuyệt đối cho tất cả thành viên.</p>
<p><strong>Ưu điểm khi đồng hành cùng chúng tôi:</strong></p>
<ul>
  <li><strong>Nạp rút siêu tốc:</strong> Tự động xử lý lệnh nạp rút chỉ từ 1 - 3 phút qua ngân hàng và ví điện tử.</li>
  <li><strong>Bảo mật thông tin:</strong> Áp dụng công nghệ mã hóa SSL 256-bit chuẩn ngân hàng quốc tế.</li>
  <li><strong>Hỗ trợ tận tâm:</strong> Kênh chat trực tuyến và hotline hoạt động liên tục 24/7.</li>
</ul>`,
        },
      ];
    },
  },
  {
    id: 'template-minimal-announcement',
    name: 'Mẫu 3: Thông Báo Đầu Trang & Tối Giản',
    badge: '⚡ Hiện Đại & Thông Báo Đầu Trang',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    description: 'Thanh thông báo hotline & CSKH ngay đầu trang, tiếp nối bởi banner công nghệ và 3 giá trị cốt lõi.',
    blocks: [
      { icon: '📢', name: 'MessBox', desc: 'Thanh hotline CSKH 24/7 trên đầu trang' },
      { icon: '🌄', name: 'Banner', desc: 'Banner công nghệ hiện đại, tương thích đa thiết bị' },
      { icon: '🎴', name: 'ImgBox', desc: '3 khối giá trị cốt lõi: Tốc độ, Bảo mật, Hỗ trợ' },
      { icon: '📝', name: 'Text Demo', desc: 'Tầm nhìn chiến lược và tiêu chuẩn vận hành' },
    ],
    generateSections: (): SectionItem[] => {
      const now = Date.now();
      return [
        {
          id: `message_box-${now}-1`,
          type: 'message_box',
          content: '📢 Hotline CSKH & Tư Vấn Kỹ Thuật 24/7: 1900 xxxx - Cam kết hỗ trợ nhiệt tình, giải quyết mọi thắc mắc tức thì!',
          subtitle: '📢 Hotline CSKH & Tư Vấn Kỹ Thuật 24/7: 1900 xxxx - Cam kết hỗ trợ nhiệt tình, giải quyết mọi thắc mắc tức thì!',
          bgColor: '#0f172a',
          textColor: 'dark',
          padding: '15px',
          data: {
            wrapInSection: true,
            boxLayout: 'inline',
            buttonAlign: 'right',
            icon: '📢',
            hasButton1: true,
            button1Text: 'Gọi Tư Vấn',
            button1Link: 'tel:1900xxxx',
            button1Color: 'primary',
            borderRadius: 10,
            boxShadow: 'subtle',
          },
        },
        {
          id: `banner-${now}-2`,
          type: 'banner',
          title: 'KIẾN TẠO TƯƠNG LAI BỀN VỮNG VÀ KHÁC BIỆT',
          subtitle: 'Cung cấp nền tảng vận hành tinh gọn, bảo mật cao và tương thích tối đa trên mọi thiết bị di động.',
          buttonText: 'Tìm Hiểu Thêm',
          buttonLink: '#about',
          bgColor: '#1e1b4b',
          textColor: 'light',
          padding: 'large',
          data: {
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80',
            alt: 'Banner Công Nghệ Bền Vững',
          },
        },
        {
          id: `image_box-${now}-3`,
          type: 'image_box',
          title: 'Giá Trị Cốt Lõi Của Nền Tảng',
          subtitle: '3 trụ cột tạo nên uy tín và vị thế vững chắc trên thị trường',
          bgColor: '#ffffff',
          padding: 'normal',
          layout: '3-col-equal',
          data: {
            items: [
              {
                title: 'Tốc Độ & Ổn Định',
                desc: 'Thời gian phản hồi máy chủ dưới 200ms, đảm bảo trải nghiệm mượt mà không gián đoạn.',
                img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
                link: '#speed',
              },
              {
                title: 'Bảo Mật Tiên Tiến',
                desc: 'Hệ thống tường lửa đa tầng và cơ chế phòng vệ tự động theo thời gian thực.',
                img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
                link: '#security',
              },
              {
                title: 'Hỗ Trợ Chuyên Nghiệp',
                desc: 'Đội ngũ kỹ sư giàu kinh nghiệm sẵn sàng giải quyết mọi yêu cầu 24/7.',
                img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
                link: '#support',
              },
            ],
          },
        },
        {
          id: `text_block-${now}-4`,
          type: 'text_block',
          title: 'Về Doanh Nghiệp & Tầm Nhìn Chiến Lược Dài Hạn',
          bgColor: '#f8fafc',
          padding: 'normal',
          data: {
            boxEnabled: true,
            boxPreset: 'clean-border',
            boxBgColor: '#ffffff',
            boxTextColor: 'dark',
            boxBorderWidth: 1,
            boxBorderColor: '#cbd5e1',
            boxBorderStyle: 'solid',
            boxRadius: 12,
            boxPadding: '20px 24px',
            boxShadow: 'subtle',
          },
          content: `<h2>Khát Vọng Trở Thành Thương Hiệu Số 1 Về Độ Tin Cậy</h2>
<p>Với nhiều năm kinh nghiệm nghiên cứu và phát triển giải pháp số, chúng tôi không ngừng cải tiến sản phẩm để mang đến giá trị thực chất nhất cho cộng đồng người dùng. Mỗi tính năng được phát triển đều dựa trên sự thấu hiểu sâu sắc hành vi và nhu cầu thực tế.</p>
<p><strong>Tiêu chuẩn vận hành hàng đầu:</strong></p>
<ul>
  <li>Minh bạch tuyệt đối trong quy trình và chính sách dịch vụ.</li>
  <li>Ứng dụng công nghệ điện toán đám mây tiên tiến nhất hiện nay.</li>
  <li>Luôn lắng nghe phản hồi của người dùng để hoàn thiện mỗi ngày.</li>
</ul>`,
        },
      ];
    },
  },
];

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
  const [richEditorActive, setRichEditorActive] = useState<Record<string, boolean>>({});
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleApplyTemplate = (template: HomepageTemplatePreset) => {
    if (sections.length > 0) {
      const ok = window.confirm(
        `Áp dụng "${template.name}" sẽ thay thế bố cục hiện tại bằng 4 khối: Banner, ImgBox, MessBox và Text Demo.\n\nBạn có muốn tiếp tục không?`
      );
      if (!ok) return;
    }
    const newSections = template.generateSections();
    onChangeSections(newSections);
    setSelectedTemplateId(template.id);
  };

  const startEditingTitle = (sec: SectionItem) => {
    const currentName = sec.type === 'image'
      ? (sec.data?.title || sec.data?.caption || 'Hình Ảnh Nổi Bật')
      : (sec.title || availableElements.find((e) => e.type === sec.type)?.name || sec.type);
    setEditingTitleId(sec.id);
    setEditingTitleText(currentName);
  };

  const saveTitle = (secId: string) => {
    const trimmed = editingTitleText.trim();
    if (trimmed) {
      handleUpdateSection(secId, {
        title: trimmed,
        data: { ...(sections.find((s) => s.id === secId)?.data || {}), title: trimmed },
      });
    }
    setEditingTitleId(null);
  };

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
    const clonedData = sec.data ? JSON.parse(JSON.stringify(sec.data)) : {};

    // Tự động đánh số bản sao thông minh (Bản sao 2, Bản sao 3...) thay vì nối chuỗi dài dằng dặc
    let newTitle: string | undefined = undefined;
    const baseTitle = sec.title || availableElements.find((e) => e.type === sec.type)?.name || sec.type;
    const copyMatch = baseTitle.match(/^(.*?)(?:\s*\(Bản sao(?:\s*(\d+))?\))$/);
    if (copyMatch && copyMatch[1]) {
      const cleanBase = copyMatch[1].trim();
      const nextNum = copyMatch[2] ? parseInt(copyMatch[2], 10) + 1 : 2;
      newTitle = `${cleanBase} (Bản sao ${nextNum})`;
    } else {
      newTitle = `${baseTitle} (Bản sao)`;
    }

    const cloned: SectionItem = {
      ...sec,
      id: `${sec.type}-${Date.now()}`,
      title: newTitle,
      data: { ...clonedData, title: newTitle },
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
          imageUrl: base64, // Instant preview for image section
          bgImage: base64,  // Instant preview for message_box and banner
          imageId: undefined, // Reset imageId so deployHomepage knows this new file needs upload to WP!
          bgImageId: undefined, // Reset bgImageId
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
            bgImage: res.media.url,
            bgImageId: res.media.id,
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
        // Tự động tải ảnh Base64 local lên WordPress Media nếu chưa có ID
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
                ...processedSections[i],
                data: {
                  ...processedSections[i].data,
                  imageId: uploadRes.media.id,
                  imageUrl: uploadRes.media.url,
                  bgImage: uploadRes.media.url,
                  bgImageId: uploadRes.media.id,
                  fileData: undefined,
                  isUploaded: true,
                },
              };
            }
          } catch (uploadErr) {
            console.warn('Auto upload image failed, continuing with direct fallback:', uploadErr);
          }
        }

        // Tự động tải ảnh Base64 mobile lên WordPress Media nếu có
        if (sec.data?.mobileFileData && !sec.data?.mobileImageId) {
          try {
            const uploadRes = await api.uploadMedia(currentSite, {
              filename: sec.data.mobileFilename || `mobile-${Date.now()}.png`,
              fileData: sec.data.mobileFileData,
              altText: sec.data.alt ? `${sec.data.alt} Mobile` : 'Mobile Banner',
              title: sec.data.title ? `${sec.data.title} Mobile` : 'Mobile Banner',
            });
            if (uploadRes && uploadRes.media) {
              processedSections[i] = {
                ...processedSections[i],
                data: {
                  ...processedSections[i].data,
                  mobileImageId: uploadRes.media.id,
                  mobileBgImage: uploadRes.media.url,
                  mobileFileData: undefined,
                },
              };
            }
          } catch (uploadErr) {
            console.warn('Auto upload mobile image failed:', uploadErr);
          }
        }
      }

      // Làm sạch dữ liệu fileData Base64 trước khi gửi deploy
      const sanitizedSections = processedSections.map((sec) => {
        if (sec.data?.fileData || sec.data?.mobileFileData) {
          const { fileData, mobileFileData, ...restData } = sec.data;
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
    <div className="space-y-6 w-full">
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

          {currentSite?.siteUrl && (
            <a
              href={currentSite.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Mở trang chủ website thật trên tab mới để xem kết quả thực tế"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Xem Web Thật</span>
            </a>
          )}
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

      {/* 🌟 3 MẪU TRANG CHỦ ĐƠN GIẢN: BANNER, IMGBOX, MESSBOX, TEXT DEMO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-500/40 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  3 Mẫu Bố Cục Trang Chủ Đơn Giản (1-Click Chọn Ngay)
                </h3>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 font-bold">
                  Banner + ImgBox + MessBox + Text Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Được thiết kế tinh gọn chuẩn 4 khối UX Builder theo yêu cầu. Nhấp chọn 1 trong 3 mẫu dưới đây để nạp nhanh cấu trúc trang chủ:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-indigo-300 bg-indigo-900/50 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-mono">
              Flatsome UX Builder
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {HOMEPAGE_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 text-left relative ${
                  isSelected
                    ? 'bg-slate-800/95 border-amber-400/80 ring-2 ring-amber-400/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-indigo-400/60 hover:bg-slate-800/80 shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-300">
                    <Check className="w-3 h-3 stroke-[3]" /> Đang Sử Dụng
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tmpl.badgeColor}`}>
                      {tmpl.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">4 Khối</span>
                  </div>

                  <h4 className="font-bold text-xs text-white leading-snug">
                    {tmpl.name}
                  </h4>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* 4 Blocks list */}
                  <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Cấu trúc 4 khối trong mẫu:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {tmpl.blocks.map((blk, bIdx) => (
                        <div
                          key={bIdx}
                          className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-1.5 flex items-start gap-1.5 text-slate-200"
                        >
                          <span className="text-xs shrink-0">{blk.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-white truncate">{blk.name}</div>
                            <div className="text-[8px] text-slate-400 line-clamp-1">{blk.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Nạp Lại Mẫu Này' : 'Áp Dụng Mẫu Này'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

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
                    <div className="flex items-center gap-2 flex-wrap">
                      {editingTitleId === sec.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveTitle(sec.id);
                              } else if (e.key === 'Escape') {
                                setEditingTitleId(null);
                              }
                            }}
                            autoFocus
                            placeholder="Nhập tên mới cho khối..."
                            className="bg-white border-2 border-blue-500 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-hidden shadow-xs min-w-[220px]"
                          />
                          <button
                            type="button"
                            onClick={() => saveTitle(sec.id)}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer shadow-xs transition"
                            title="Lưu tên (Enter)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs cursor-pointer transition"
                            title="Hủy (Esc)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/title">
                          <span
                            className="font-bold text-xs text-slate-900 truncate max-w-[280px] sm:max-w-md hover:text-blue-600 transition cursor-pointer"
                            title="Bấm hoặc nhấp đúp để đổi tên khối"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(sec);
                            }}
                          >
                            {sec.type === 'image'
                              ? (sec.data?.title || sec.data?.caption || 'Hình Ảnh Nổi Bật')
                              : (sec.title || name)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(sec);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                            title="Đổi tên khối này"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 uppercase">
                        {sec.type}
                      </span>
                      {sec.layout && (
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                          {columnOptions.find((c) => c.id === sec.layout)?.label || sec.layout}
                        </span>
                      )}
                      {sec.data?.visibility === 'hide-for-small' && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-amber-600" />
                          <span>Chỉ Máy Tính</span>
                        </span>
                      )}
                      {sec.data?.visibility === 'show-for-small' && (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200 shrink-0 flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-purple-600" />
                          <span>Chỉ Mobile</span>
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
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                  {/* Tên / Nhãn Gợi Nhớ Cho Khối (Dễ Dàng Quản Lý Danh Sách) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <label className="text-xs font-bold text-slate-800 block">
                          Tên / Nhãn Khối Quản Lý
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Đặt tên gợi nhớ để phân biệt nhanh giữa các khối (vd: Banner Desktop, Banner Mobile, Khuyến mãi...)
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-80">
                      <input
                        type="text"
                        value={sec.title || ''}
                        placeholder={name}
                        onChange={(e) => {
                          handleUpdateSection(sec.id, {
                            title: e.target.value,
                            data: { ...(sec.data || {}), title: e.target.value },
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

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

                  {/* Section Container Style (Background, Padding, Container & Device Visibility) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Màu Nền Section</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={sec.bgColor || '#ffffff'}
                          onChange={(e) => handleUpdateSection(sec.id, { bgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <div className="flex gap-1 flex-wrap">
                          {[
                            { label: 'Trắng', val: '#ffffff' },
                            { label: 'Xám', val: '#f8fafc' },
                            { label: 'Tối', val: '#0f172a' },
                            { label: 'Trong suốt', val: 'transparent' },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => handleUpdateSection(sec.id, { bgColor: b.val })}
                              className={`px-2 py-1 text-[11px] border rounded transition cursor-pointer ${
                                (sec.bgColor || '#ffffff') === b.val
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-600">Khoảng Cách (Padding)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const isCustom = sec.padding && (sec.padding.includes(' ') || !['none', '5px', 'tight', 'compact', '20px', 'small', 'normal', 'large'].includes(sec.padding));
                            if (isCustom) {
                              handleUpdateSection(sec.id, { padding: 'normal' });
                            } else {
                              const top = parsePaddingTop(sec.padding);
                              const bot = parsePaddingBottom(sec.padding);
                              handleUpdateSection(sec.id, { padding: `${top}px 0px ${bot}px 0px` });
                            }
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                        >
                          {sec.padding && (sec.padding.includes(' ') || !['none', '5px', 'tight', 'compact', '20px', 'small', 'normal', 'large'].includes(sec.padding))
                            ? '← Mẫu có sẵn'
                            : '⚙ Tùy chỉnh Top/Bottom'}
                        </button>
                      </div>

                      {sec.padding && (sec.padding.includes(' ') || !['none', '5px', 'tight', 'compact', '20px', 'small', 'normal', 'large'].includes(sec.padding)) ? (
                        <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-lg space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-600 block mb-1">Đệm Trên (Top px)</span>
                              <input
                                type="number"
                                min="0"
                                max="200"
                                step="5"
                                value={parsePaddingTop(sec.padding)}
                                onChange={(e) => {
                                  const top = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  const bottom = parsePaddingBottom(sec.padding);
                                  handleUpdateSection(sec.id, { padding: `${top}px 0px ${bottom}px 0px` });
                                }}
                                className="w-full bg-white border border-slate-200 text-xs rounded p-1.5 font-mono text-center"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-600 block mb-1">Đệm Dưới (Bottom px)</span>
                              <input
                                type="number"
                                min="0"
                                max="200"
                                step="5"
                                value={parsePaddingBottom(sec.padding)}
                                onChange={(e) => {
                                  const top = parsePaddingTop(sec.padding);
                                  const bottom = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  handleUpdateSection(sec.id, { padding: `${top}px 0px ${bottom}px 0px` });
                                }}
                                className="w-full bg-white border border-slate-200 text-xs rounded p-1.5 font-mono text-center"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 justify-between pt-1 border-t border-slate-200/60 flex-wrap">
                            <span className="text-[9px] text-slate-500">Mẹo đặt 2 khối sát nhau: Đặt 0px</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateSection(sec.id, { padding: 'none' })}
                                className="px-1.5 py-0.5 text-[9px] bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 cursor-pointer font-medium"
                              >
                                0px sát
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSection(sec.id, { padding: '20px 0px 0px 0px' })}
                                className="px-1.5 py-0.5 text-[9px] bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="Đệm trên 20px, đệm dưới 0px để nối tiếp hộp bên dưới"
                              >
                                Dưới 0px
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSection(sec.id, { padding: '0px 0px 20px 0px' })}
                                className="px-1.5 py-0.5 text-[9px] bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="Đệm trên 0px, đệm dưới 20px"
                              >
                                Trên 0px
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={sec.padding || 'normal'}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              const top = parsePaddingTop(sec.padding);
                              const bot = parsePaddingBottom(sec.padding);
                              handleUpdateSection(sec.id, { padding: `${top}px 0px ${bot}px 0px` });
                            } else {
                              handleUpdateSection(sec.id, { padding: e.target.value });
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 outline-hidden cursor-pointer"
                        >
                          <option value="none">Sát nhau / Không đệm (0px)</option>
                          <option value="5px">Siêu sát (5px)</option>
                          <option value="tight">Cực gọn (10px)</option>
                          <option value="compact">Gọn nhẹ (15px)</option>
                          <option value="20px">Vừa gọn (20px)</option>
                          <option value="small">Vừa phải (35px)</option>
                          <option value="normal">Tiêu chuẩn (60px)</option>
                          <option value="large">Rộng rãi (90px)</option>
                          <option value="custom">⚙ Tùy chỉnh (Top / Bottom px)...</option>
                        </select>
                      )}
                    </div>

                    {/* Container Width (Khung Chứa) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-600">Khung Chứa (Container)</label>
                        <span className="text-[9px] text-slate-400">Độ rộng lề ngang</span>
                      </div>
                      <select
                        value={sec.data?.container || 'container'}
                        onChange={(e) => {
                          handleUpdateSection(sec.id, {
                            data: { ...(sec.data || {}), container: e.target.value },
                          });
                        }}
                        className={`w-full text-xs rounded-lg p-2 outline-hidden cursor-pointer font-medium border ${
                          (sec.data?.container || 'container') === 'container'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="container">📦 Khung Container (Có lề 15px - Chống tràn)</option>
                        <option value="full-width">↔️ Tràn Viền 100% (Sát mép 0px)</option>
                      </select>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {(sec.data?.container || 'container') === 'container'
                          ? 'Khối thụt vào 15px hai bên lề trên Mobile & bo gọn trên PC, chống dính mép màn hình.'
                          : 'Khối kéo dài 100% sát mép màn hình không có khoảng hở.'}
                      </p>
                    </div>

                    {/* Device Visibility (Hiển Thị Thiết Bị) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-600">Thiết Bị Hiển Thị</label>
                        {sec.data?.visibility && sec.data.visibility !== 'visible' && (
                          <span className="text-[9px] font-bold text-amber-600">Đã tách riêng</span>
                        )}
                      </div>
                      <select
                        value={sec.data?.visibility || ''}
                        onChange={(e) => {
                          handleUpdateSection(sec.id, {
                            data: { ...(sec.data || {}), visibility: e.target.value },
                          });
                        }}
                        className={`w-full text-xs rounded-lg p-2 outline-hidden cursor-pointer font-medium border ${
                          sec.data?.visibility === 'hide-for-small'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : sec.data?.visibility === 'show-for-small'
                            ? 'bg-purple-50 border-purple-300 text-purple-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="">🌐 Tất Cả Thiết Bị (Mặc định)</option>
                        <option value="hide-for-small">💻 Chỉ Máy Tính (Ẩn trên Mobile)</option>
                        <option value="show-for-small">📱 Chỉ Điện Thoại (Ẩn trên Máy Tính)</option>
                        <option value="hide-for-medium">🖥️ Ẩn trên Mobile &amp; Tablet</option>
                      </select>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {sec.data?.visibility === 'hide-for-small'
                          ? 'Khối này sẽ bị ẩn hoàn toàn khi người dùng xem bằng điện thoại.'
                          : sec.data?.visibility === 'show-for-small'
                          ? 'Khối này chỉ xuất hiện trên điện thoại (máy tính không thấy).'
                          : 'Tự động co giãn responsive trên cả máy tính, tablet và điện thoại.'}
                      </p>
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

                        {sec.type === 'text_block' ? (
                          <div className="space-y-3 pt-1">
                            {/* Cấu Hình Khung Box & Đường Viền (Card & Box Styling) */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-xl border border-slate-700/80 shadow-md text-slate-100 space-y-3.5">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                    <Box className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white tracking-wide uppercase">
                                        Thiết Kế Khung Box &amp; Đường Viền (Card Styling)
                                      </span>
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                          sec.data?.boxEnabled
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                            : 'bg-slate-700 border-slate-600 text-slate-300'
                                        }`}
                                      >
                                        {sec.data?.boxEnabled ? '✓ Đang Bật Box' : '○ Trong Suốt (Không Box)'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Tạo khung thẻ bài viết có màu nền, đường viền bo góc, phát sáng viền và chỉnh tương phản chữ cho website nền tối hoặc nền sáng.
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const isEnabled = !sec.data?.boxEnabled;
                                    handleUpdateSection(sec.id, {
                                      data: {
                                        ...(sec.data || {}),
                                        boxEnabled: isEnabled,
                                        ...(isEnabled && !sec.data?.boxBgColor
                                          ? {
                                              boxPreset: 'gold-luxury',
                                              boxBgColor: 'rgba(10, 15, 29, 0.92)',
                                              boxTextColor: 'gold',
                                              boxBorderWidth: 1.5,
                                              boxBorderColor: '#f59e0b',
                                              boxBorderStyle: 'solid',
                                              boxRadius: 16,
                                              boxPadding: '24px 28px',
                                              boxShadow: 'glow-gold',
                                              boxBackdropBlur: true,
                                            }
                                          : {}),
                                      },
                                      textColor: isEnabled && (sec.data?.boxTextColor || 'gold') !== 'dark' ? 'light' : sec.textColor,
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                    sec.data?.boxEnabled
                                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                                  }`}
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>{sec.data?.boxEnabled ? 'Tắt Khung Box' : 'Bật Khung Box'}</span>
                                </button>
                              </div>

                              {/* 1-Click Quick Presets */}
                              <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                                  <span className="flex items-center gap-1 text-amber-400">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Chọn Nhanh Mẫu Phối Sẵn (1-Click Presets):</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-normal">Click để áp dụng ngay màu nền &amp; viền</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                  {/* Preset 1: Casino Gold VIP */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: true,
                                          boxPreset: 'gold-luxury',
                                          boxBgColor: 'rgba(10, 15, 29, 0.92)',
                                          boxTextColor: 'gold',
                                          boxBorderWidth: 1.5,
                                          boxBorderColor: '#f59e0b',
                                          boxBorderStyle: 'solid',
                                          boxRadius: 16,
                                          boxPadding: '24px 28px',
                                          boxShadow: 'glow-gold',
                                          boxBackdropBlur: true,
                                        },
                                        textColor: 'light',
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      sec.data?.boxEnabled && sec.data?.boxPreset === 'gold-luxury'
                                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/50 shadow-md'
                                        : 'border-amber-500/30 bg-slate-900/80 hover:border-amber-400/70'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-black text-amber-400">👑 Casino Gold VIP</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 leading-tight">
                                      Nền đen sẫm, viền vàng kim óng ánh, phát sáng Glow.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded bg-[#0b0f19] border border-amber-500 flex items-center px-1">
                                      <div className="w-8 h-1 rounded bg-amber-400"></div>
                                    </div>
                                  </button>

                                  {/* Preset 2: Glassmorphism Dark */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: true,
                                          boxPreset: 'glass-dark',
                                          boxBgColor: 'rgba(15, 23, 42, 0.78)',
                                          boxTextColor: 'light',
                                          boxBorderWidth: 1,
                                          boxBorderColor: 'rgba(255, 255, 255, 0.2)',
                                          boxBorderStyle: 'solid',
                                          boxRadius: 16,
                                          boxPadding: '24px 28px',
                                          boxShadow: 'deep',
                                          boxBackdropBlur: true,
                                        },
                                        textColor: 'light',
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      sec.data?.boxEnabled && sec.data?.boxPreset === 'glass-dark'
                                        ? 'border-cyan-400 bg-slate-800 ring-2 ring-cyan-500/50 shadow-md'
                                        : 'border-slate-600 bg-slate-900/80 hover:border-slate-500'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-cyan-300">💎 Kính Tối Mờ</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 leading-tight">
                                      Nền kính đen trong mờ, viền trắng mờ tinh tế, 3D Blur.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded bg-slate-800/80 border border-white/30 flex items-center px-1">
                                      <div className="w-8 h-1 rounded bg-cyan-300"></div>
                                    </div>
                                  </button>

                                  {/* Preset 3: Clean White Card */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: true,
                                          boxPreset: 'card-white',
                                          boxBgColor: '#ffffff',
                                          boxTextColor: 'dark',
                                          boxBorderWidth: 1,
                                          boxBorderColor: '#e2e8f0',
                                          boxBorderStyle: 'solid',
                                          boxRadius: 12,
                                          boxPadding: '24px 28px',
                                          boxShadow: 'subtle',
                                          boxBackdropBlur: false,
                                        },
                                        textColor: 'dark',
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      sec.data?.boxEnabled && sec.data?.boxPreset === 'card-white'
                                        ? 'border-white bg-white text-slate-900 ring-2 ring-white/50 shadow-md'
                                        : 'border-slate-600 bg-slate-900/80 hover:border-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-white group-hover:text-white">📄 Thẻ Trắng Sáng</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 leading-tight">
                                      Nền trắng tinh, chữ than nổi bật trên website nền tối.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded bg-white border border-slate-300 flex items-center px-1">
                                      <div className="w-8 h-1 rounded bg-slate-800"></div>
                                    </div>
                                  </button>

                                  {/* Preset 4: Viền Vàng Trong Suốt */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: true,
                                          boxPreset: 'border-only-gold',
                                          boxBgColor: 'transparent',
                                          boxTextColor: 'light',
                                          boxBorderWidth: 2,
                                          boxBorderColor: '#f59e0b',
                                          boxBorderStyle: 'solid',
                                          boxRadius: 14,
                                          boxPadding: '20px 24px',
                                          boxShadow: 'glow-gold',
                                          boxBackdropBlur: false,
                                        },
                                        textColor: 'light',
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      sec.data?.boxEnabled && sec.data?.boxPreset === 'border-only-gold'
                                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/50 shadow-md'
                                        : 'border-slate-600 bg-slate-900/80 hover:border-amber-400/50'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-amber-300">✨ Viền Vàng Trong</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 leading-tight">
                                      Không nền (trong suốt), chỉ đóng khung viền vàng óng.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded bg-transparent border-2 border-amber-500 flex items-center px-1">
                                      <div className="w-8 h-1 rounded bg-amber-300"></div>
                                    </div>
                                  </button>

                                  {/* Preset 5: Viền Trắng Trong Suốt */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: true,
                                          boxPreset: 'border-only-white',
                                          boxBgColor: 'transparent',
                                          boxTextColor: 'light',
                                          boxBorderWidth: 1.5,
                                          boxBorderColor: 'rgba(255, 255, 255, 0.35)',
                                          boxBorderStyle: 'solid',
                                          boxRadius: 12,
                                          boxPadding: '20px 24px',
                                          boxShadow: 'none',
                                          boxBackdropBlur: false,
                                        },
                                        textColor: 'light',
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      sec.data?.boxEnabled && sec.data?.boxPreset === 'border-only-white'
                                        ? 'border-white bg-slate-800 ring-2 ring-white/50 shadow-md'
                                        : 'border-slate-600 bg-slate-900/80 hover:border-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-slate-200">🛡️ Viền Trắng Tối Giản</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 leading-tight">
                                      Không nền, viền trắng mờ tối giản bao quanh khối chữ.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded bg-transparent border border-white/40 flex items-center px-1">
                                      <div className="w-8 h-1 rounded bg-white"></div>
                                    </div>
                                  </button>

                                  {/* Preset 6: Tắt Box (Trong suốt mặc định) */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSection(sec.id, {
                                        data: {
                                          ...(sec.data || {}),
                                          boxEnabled: false,
                                          boxPreset: 'none',
                                        },
                                      });
                                    }}
                                    className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                                      !sec.data?.boxEnabled
                                        ? 'border-slate-400 bg-slate-800 ring-2 ring-slate-400/50 shadow-md'
                                        : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-slate-400">✕ Không Box</span>
                                    </div>
                                    <div className="text-[9px] text-slate-400 leading-tight">
                                      Hiển thị tự nhiên nguyên bản, không khung bao quanh.
                                    </div>
                                    <div className="mt-1.5 h-3 rounded border border-dashed border-slate-600 flex items-center justify-center">
                                      <span className="text-[8px] text-slate-500">None</span>
                                    </div>
                                  </button>
                                </div>
                              </div>

                              {/* Chi Tiết Tùy Chỉnh Màu Sắc, Viền, Bo Góc & Tương Phản (Hiển thị khi Bật Box) */}
                              {sec.data?.boxEnabled && (
                                <div className="space-y-3 pt-2.5 border-t border-slate-700/60 text-xs">
                                  {/* Row 1: Màu Nền Box + Chế Độ Màu Chữ */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Màu Nền Box */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                        Màu Nền Của Khung (Box Background)
                                      </label>
                                      <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <input
                                          type="text"
                                          value={sec.data?.boxBgColor || 'rgba(15, 23, 42, 0.85)'}
                                          onChange={(e) => {
                                            handleUpdateSection(sec.id, {
                                              data: {
                                                ...(sec.data || {}),
                                                boxBgColor: e.target.value,
                                                boxPreset: 'custom',
                                              },
                                            });
                                          }}
                                          placeholder="rgba(15, 23, 42, 0.85) hoặc #000000"
                                          className="flex-1 min-w-[140px] bg-slate-900 border border-slate-600 rounded px-2.5 py-1 text-xs text-white font-mono"
                                        />
                                        <div
                                          className="w-7 h-7 rounded border border-slate-500 shrink-0"
                                          style={{ backgroundColor: sec.data?.boxBgColor || 'rgba(15, 23, 42, 0.85)' }}
                                          title="Màu nền đang chọn"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-slate-400">Nhanh:</span>
                                        {[
                                          { label: 'Kính Đen', val: 'rgba(15, 23, 42, 0.85)' },
                                          { label: 'Casino VIP', val: 'rgba(10, 15, 29, 0.95)' },
                                          { label: 'Trắng Tinh', val: '#ffffff' },
                                          { label: 'Xám Slate', val: '#1e293b' },
                                          { label: 'Trong Suốt', val: 'transparent' },
                                        ].map((swatch) => (
                                          <button
                                            key={swatch.val}
                                            type="button"
                                            onClick={() => {
                                              handleUpdateSection(sec.id, {
                                                data: {
                                                  ...(sec.data || {}),
                                                  boxBgColor: swatch.val,
                                                  boxPreset: 'custom',
                                                  ...(swatch.val === '#ffffff' ? { boxTextColor: 'dark' } : {}),
                                                },
                                                textColor: swatch.val === '#ffffff' ? 'dark' : sec.textColor,
                                              });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                                              (sec.data?.boxBgColor || 'rgba(15, 23, 42, 0.85)') === swatch.val
                                                ? 'bg-blue-600 border-blue-400 text-white font-bold'
                                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                            }`}
                                          >
                                            {swatch.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Chế Độ Tương Phản Màu Chữ (Khắc phục hoàn toàn chữ đen chìm trên web tối) */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                        Chế Độ Màu Chữ &amp; Tiêu Đề (Text Contrast)
                                      </label>
                                      <div className="grid grid-cols-3 gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxTextColor: 'light' },
                                              textColor: 'light',
                                            });
                                          }}
                                          className={`p-2 rounded text-center border transition flex flex-col items-center gap-0.5 cursor-pointer ${
                                            (sec.data?.boxTextColor || 'gold') === 'light'
                                              ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400 font-bold'
                                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                          }`}
                                        >
                                          <Sun className="w-3.5 h-3.5 text-amber-300" />
                                          <span className="text-[10px]">Chữ Sáng (Trắng)</span>
                                          <span className="text-[8px] text-slate-400">Cho web nền tối</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxTextColor: 'gold' },
                                              textColor: 'light',
                                            });
                                          }}
                                          className={`p-2 rounded text-center border transition flex flex-col items-center gap-0.5 cursor-pointer ${
                                            (sec.data?.boxTextColor || 'gold') === 'gold'
                                              ? 'bg-amber-600/30 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-bold'
                                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                          }`}
                                        >
                                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                          <span className="text-[10px]">Chữ Trắng + Tiêu Đề Vàng</span>
                                          <span className="text-[8px] text-amber-400/80">Casino Luxury</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxTextColor: 'dark' },
                                              textColor: 'dark',
                                            });
                                          }}
                                          className={`p-2 rounded text-center border transition flex flex-col items-center gap-0.5 cursor-pointer ${
                                            sec.data?.boxTextColor === 'dark'
                                              ? 'bg-slate-300 border-white text-slate-950 ring-1 ring-white font-bold'
                                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                          }`}
                                        >
                                          <Moon className="w-3.5 h-3.5 text-slate-400" />
                                          <span className="text-[10px]">Chữ Tối (Than Đen)</span>
                                          <span className="text-[8px] text-slate-400">Cho web nền sáng</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Row 2: Đường Viền (Border) + Bo Góc (Radius) + Đệm (Padding) + Phát Sáng (Glow) */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {/* Đường Viền */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-semibold text-slate-300">Đường Viền (Border)</label>
                                        <select
                                          value={sec.data?.boxBorderStyle || 'solid'}
                                          onChange={(e) => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxBorderStyle: e.target.value },
                                            });
                                          }}
                                          className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1.5 py-0.5"
                                        >
                                          <option value="solid">Liền nét</option>
                                          <option value="dashed">Nét đứt</option>
                                          <option value="double">Viền đôi</option>
                                        </select>
                                      </div>

                                      <div className="flex items-center gap-1.5 mb-2">
                                        <span className="text-[10px] text-slate-400 shrink-0">Dày:</span>
                                        {[0, 1, 1.5, 2, 3].map((w) => (
                                          <button
                                            key={w}
                                            type="button"
                                            onClick={() => {
                                              handleUpdateSection(sec.id, {
                                                data: { ...(sec.data || {}), boxBorderWidth: w },
                                              });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer font-mono ${
                                              (sec.data?.boxBorderWidth !== undefined ? Number(sec.data?.boxBorderWidth) : 1) === w
                                                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                            }`}
                                          >
                                            {w}px
                                          </button>
                                        ))}
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="color"
                                          value={sec.data?.boxBorderColor?.startsWith('#') ? sec.data.boxBorderColor : '#f59e0b'}
                                          onChange={(e) => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxBorderColor: e.target.value },
                                            });
                                          }}
                                          className="w-6 h-6 rounded border border-slate-600 cursor-pointer shrink-0"
                                        />
                                        <div className="flex items-center gap-1 flex-wrap">
                                          {[
                                            { label: 'Gold', val: '#f59e0b' },
                                            { label: 'Trắng', val: 'rgba(255, 255, 255, 0.3)' },
                                            { label: 'Xanh', val: '#3b82f6' },
                                            { label: 'Đỏ', val: '#ef4444' },
                                          ].map((c) => (
                                            <button
                                              key={c.val}
                                              type="button"
                                              onClick={() => {
                                                handleUpdateSection(sec.id, {
                                                  data: { ...(sec.data || {}), boxBorderColor: c.val },
                                                });
                                              }}
                                              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-700 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                            >
                                              {c.label}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Bo Góc (Border Radius) */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-semibold text-slate-300">Bo Góc (Radius)</label>
                                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                                          {sec.data?.boxRadius !== undefined ? Number(sec.data?.boxRadius) : 12}px
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 flex-wrap mb-2">
                                        {[0, 8, 12, 16, 24].map((r) => (
                                          <button
                                            key={r}
                                            type="button"
                                            onClick={() => {
                                              handleUpdateSection(sec.id, {
                                                data: { ...(sec.data || {}), boxRadius: r },
                                              });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer font-mono ${
                                              (sec.data?.boxRadius !== undefined ? Number(sec.data?.boxRadius) : 12) === r
                                                ? 'bg-blue-600 border-blue-400 text-white font-bold'
                                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                            }`}
                                          >
                                            {r === 0 ? 'Vuông' : `${r}px`}
                                          </button>
                                        ))}
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="36"
                                        value={sec.data?.boxRadius !== undefined ? Number(sec.data?.boxRadius) : 12}
                                        onChange={(e) => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), boxRadius: Number(e.target.value) },
                                          });
                                        }}
                                        className="w-full accent-amber-500 cursor-pointer"
                                      />
                                    </div>

                                    {/* Đệm Trong Box (Padding) */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                        Đệm Trong Khung (Padding)
                                      </label>
                                      <div className="grid grid-cols-3 gap-1 mb-2">
                                        {[
                                          { label: 'Gọn', val: '16px 20px' },
                                          { label: 'Chuẩn', val: '24px 28px' },
                                          { label: 'Rộng', val: '32px 36px' },
                                        ].map((p) => (
                                          <button
                                            key={p.val}
                                            type="button"
                                            onClick={() => {
                                              handleUpdateSection(sec.id, {
                                                data: { ...(sec.data || {}), boxPadding: p.val },
                                              });
                                            }}
                                            className={`p-1 rounded text-center text-[10px] border transition cursor-pointer ${
                                              (sec.data?.boxPadding || '24px 28px') === p.val
                                                ? 'bg-blue-600 border-blue-400 text-white font-bold'
                                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                            }`}
                                          >
                                            {p.label}
                                          </button>
                                        ))}
                                      </div>
                                      <input
                                        type="text"
                                        value={sec.data?.boxPadding || '24px 28px'}
                                        onChange={(e) => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), boxPadding: e.target.value },
                                          });
                                        }}
                                        placeholder="24px 28px"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-200 font-mono text-center"
                                      />
                                    </div>

                                    {/* Đổ Bóng & Phát Sáng Viền (Glow / Shadow) */}
                                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                        Đổ Bóng &amp; Phát Sáng (Glow)
                                      </label>
                                      <select
                                        value={sec.data?.boxShadow || 'glow-gold'}
                                        onChange={(e) => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), boxShadow: e.target.value },
                                          });
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 text-[11px] text-white rounded p-1.5 outline-hidden cursor-pointer mb-2"
                                      >
                                        <option value="none">Không bóng (None)</option>
                                        <option value="subtle">Bóng nhẹ êm dịu (Subtle Card)</option>
                                        <option value="medium">Bóng 3D vừa phải (Medium)</option>
                                        <option value="deep">Bóng sâu nổi khối (Deep Float)</option>
                                        <option value="glow-gold">🌟 Ánh Vàng Phát Sáng (Casino Gold Glow)</option>
                                        <option value="glow-primary">🔷 Ánh Xanh Neon (Primary Cyan Glow)</option>
                                      </select>

                                      <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={sec.data?.boxBackdropBlur ?? true}
                                          onChange={(e) => {
                                            handleUpdateSection(sec.id, {
                                              data: { ...(sec.data || {}), boxBackdropBlur: e.target.checked },
                                            });
                                          }}
                                          className="rounded text-amber-500 accent-amber-500"
                                        />
                                        <span>Hiệu ứng kính mờ (Backdrop Blur)</span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* Live Mini Preview inside card */}
                                  <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-950/70">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Mô Phỏng Trực Tiếp Box Trên Nền Tối
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        Live Preview
                                      </span>
                                    </div>

                                    <div
                                      style={{
                                        backgroundColor: sec.data?.boxBgColor || 'rgba(10, 15, 29, 0.92)',
                                        border: `${sec.data?.boxBorderWidth !== undefined ? Number(sec.data?.boxBorderWidth) : 1.5}px ${sec.data?.boxBorderStyle || 'solid'} ${sec.data?.boxBorderColor || '#f59e0b'}`,
                                        borderRadius: `${sec.data?.boxRadius !== undefined ? Number(sec.data?.boxRadius) : 16}px`,
                                        padding: '16px 20px',
                                        boxShadow:
                                          sec.data?.boxShadow === 'glow-gold'
                                            ? '0 0 16px rgba(245, 158, 11, 0.4), 0 4px 15px rgba(0,0,0,0.3)'
                                            : sec.data?.boxShadow === 'glow-primary'
                                            ? '0 0 16px rgba(37, 99, 235, 0.4), 0 4px 15px rgba(0,0,0,0.3)'
                                            : sec.data?.boxShadow === 'deep'
                                            ? '0 12px 28px rgba(0,0,0,0.45)'
                                            : sec.data?.boxShadow === 'subtle'
                                            ? '0 2px 8px rgba(0,0,0,0.1)'
                                            : undefined,
                                        backdropFilter: (sec.data?.boxBackdropBlur ?? true) ? 'blur(8px)' : undefined,
                                        maxWidth: sec.data?.boxMaxWidth && sec.data?.boxMaxWidth !== '100%' ? sec.data?.boxMaxWidth : '100%',
                                        margin: '0 auto',
                                      }}
                                      className="transition-all duration-200"
                                    >
                                      <div
                                        style={{
                                          color:
                                            (sec.data?.boxTextColor || 'gold') === 'gold'
                                              ? '#f59e0b'
                                              : sec.data?.boxTextColor === 'dark'
                                              ? '#0f172a'
                                              : '#ffffff',
                                        }}
                                        className="text-xs font-black tracking-wide uppercase mb-1"
                                      >
                                        {sec.title || 'Tiêu Đề Khối Văn Bản'}
                                      </div>
                                      <div
                                        style={{
                                          color: sec.data?.boxTextColor === 'dark' ? '#334155' : '#f1f5f9',
                                        }}
                                        className="text-[10px] leading-relaxed line-clamp-2"
                                      >
                                        Nội dung văn bản bên trong khung box sẽ hiển thị rõ nét, sắc sảo, chống bị chìm màu chữ trên website nền tối như Casino / Lô tô.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <WpRichTextEditor
                              label="Soạn Thảo Nội Dung Văn Bản (CKEditor Chuẩn WordPress)"
                              value={(sec.content !== undefined && sec.content !== '' ? sec.content : (sec.subtitle || ''))
                                .replace(/\[\/?ux_text[^\]]*\]/gi, '')
                                .replace(/\[title[^\]]*\]/gi, '')
                              }
                              onChange={(html) => {
                                const cleanHtml = html
                                  .replace(/\[\/?ux_text[^\]]*\]/gi, '')
                                  .replace(/\[title[^\]]*\]/gi, '');
                                handleUpdateSection(sec.id, {
                                  content: cleanHtml,
                                  subtitle: cleanHtml,
                                });
                              }}
                              currentSite={currentSite}
                              minHeight={250}
                              placeholder="Nhập nội dung bài viết hoặc đoạn văn bản tại đây (hỗ trợ tải ảnh lên, lấy ảnh từ thư viện media, in đậm, in nghiêng, tiêu đề, danh sách, link, màu sắc...)"
                            />
                          </div>
                        ) : sec.type !== 'divider_gap' && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Mô Tả / Phụ Đề
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setRichEditorActive((prev) => ({
                                    ...prev,
                                    [sec.id]: !prev[sec.id],
                                  }))
                                }
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>{richEditorActive[sec.id] ? 'Dùng ô chữ thường' : 'Mở CKEditor Trực Quan'}</span>
                              </button>
                            </div>
                            {richEditorActive[sec.id] ? (
                              <WpRichTextEditor
                                label="Soạn Thảo Phụ Đề (CKEditor)"
                                value={sec.subtitle || sec.content || ''}
                                onChange={(html) =>
                                  handleUpdateSection(sec.id, {
                                    subtitle: html,
                                    content: html,
                                  })
                                }
                                currentSite={currentSite}
                                minHeight={180}
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={sec.subtitle || sec.content || ''}
                                onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value, content: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-hidden focus:border-blue-500"
                              />
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Button Text & Link (if applicable) */}
                    {['hero', 'banner', 'cta', 'about'].includes(sec.type) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Nút Bấm</label>
                          <input
                            type="text"
                            value={sec.buttonText || ''}
                            onChange={(e) => handleUpdateSection(sec.id, { buttonText: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Link Nút Bấm</label>
                          <input
                            type="text"
                            value={sec.buttonLink || ''}
                            onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mở Tab</label>
                          <select
                            value={sec.buttonTarget || sec.data?.buttonTarget || '_self'}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                buttonTarget: e.target.value as '_self' | '_blank',
                                data: { ...(sec.data || {}), buttonTarget: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-500 cursor-pointer"
                          >
                            <option value="_self">Cùng Tab (_self)</option>
                            <option value="_blank">Tab Mới (_blank)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">SEO Rel</label>
                          <select
                            value={sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel ?? 'nofollow')}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                buttonRel: e.target.value,
                                data: { ...(sec.data || {}), buttonRel: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-500 cursor-pointer"
                          >
                            <option value="nofollow">Nofollow (Khuyên dùng)</option>
                            <option value="">Dofollow (Mặc định)</option>
                            <option value="nofollow noopener noreferrer">nofollow noopener noreferrer</option>
                            <option value="sponsored nofollow">sponsored nofollow</option>
                          </select>
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

                        {/* Mẹo chỉnh khoảng cách khi đặt các Message Box kế nhau */}
                        <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl text-blue-200 text-xs flex items-start gap-2.5">
                          <span className="text-base shrink-0 mt-0.5">💡</span>
                          <div className="space-y-1">
                            <span className="font-bold text-white block">
                              Mẹo chỉnh khoảng cách khi đặt 2 Message Box kề nhau:
                            </span>
                            <div className="text-[11px] text-blue-200/90 leading-relaxed space-y-0.5">
                              <div>
                                • Cách 1: Tại mục <strong>Khoảng Cách (Padding)</strong> của cả 2 khối ở trên, chọn <strong>"Sát nhau / Không đệm (0px)"</strong> hoặc <strong>"Cực gọn (10px)"</strong>.
                              </div>
                              <div>
                                • Cách 2: Bấm <strong>"⚙ Tùy chỉnh Top/Bottom"</strong> ở trên: Đặt Đệm Dưới của hộp trên = 0px và Đệm Trên của hộp dưới = 0px để nối dính liền vào nhau.
                              </div>
                              <div>
                                • Cách 3: Bỏ chọn <em>"Bọc trong Section &amp; Row"</em> nếu bạn muốn 2 hộp nối tiếp nhau không qua thẻ bao ngoài của Flatsome.
                              </div>
                            </div>
                          </div>
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
                                  onClick={(e) => {
                                    (e.target as HTMLInputElement).value = '';
                                  }}
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
                                  value={sec.content !== undefined ? sec.content : (sec.subtitle || '')}
                                  placeholder="Nhập thông điệp nổi bật, thông báo khuyến mãi, sự kiện... (Hoặc để trống)"
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      content: e.target.value,
                                      subtitle: e.target.value,
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Mở Tab</label>
                                    <select
                                      value={sec.data?.button1Target || sec.buttonTarget || '_self'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          buttonTarget: e.target.value as '_self' | '_blank',
                                          data: { ...(sec.data || {}), button1Target: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 cursor-pointer"
                                    >
                                      <option value="_self">Cùng Tab (_self)</option>
                                      <option value="_blank">Tab Mới (_blank)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">SEO Rel</label>
                                    <select
                                      value={sec.data?.button1Rel !== undefined ? sec.data.button1Rel : (sec.buttonRel ?? 'nofollow')}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          buttonRel: e.target.value,
                                          data: { ...(sec.data || {}), button1Rel: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 cursor-pointer"
                                    >
                                      <option value="nofollow">Nofollow (Khuyên dùng)</option>
                                      <option value="">Dofollow (Mặc định)</option>
                                      <option value="nofollow noopener noreferrer">nofollow noopener noreferrer</option>
                                      <option value="sponsored nofollow">sponsored nofollow</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                                </div>

                                {/* Hiệu Ứng Nút Bấm 1 (Hoạt họa thu hút click) */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                      <span>✨ Hiệu Ứng Nút Bấm (Button Animation)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">Rung lắc, lan tỏa màu, hào quang để tăng CTR</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                                    {[
                                      { id: '', label: 'Tĩnh', icon: '⏹️', desc: 'Không hiệu ứng' },
                                      { id: 'shake', label: 'Rung Lắc', icon: '📳', desc: 'Lắc rung chú ý' },
                                      { id: 'ripple', label: 'Lan Tỏa Màu', icon: '🌊', desc: 'Sóng màu tỏa ra' },
                                      { id: 'glow', label: 'Hào Quang', icon: '🌟', desc: 'Phát sáng Neon' },
                                      { id: 'shimmer', label: 'Quét Sáng', icon: '⚡', desc: 'Làn mây sáng' },
                                      { id: 'pulse', label: 'Nhịp Thở', icon: '💓', desc: 'Phóng to thu nhỏ' },
                                      { id: 'combo', label: 'Combo VIP', icon: '🔥', desc: 'Rung + Lan tỏa' },
                                    ].map((anim) => (
                                      <button
                                        key={anim.id}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), hasButton1: true, button1Animation: anim.id },
                                          });
                                        }}
                                        className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                          (sec.data?.button1Animation || '') === anim.id
                                            ? 'border-amber-400 bg-amber-500/25 text-white font-bold shadow-xs ring-1 ring-amber-400/40'
                                            : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <span className="text-base">{anim.icon}</span>
                                        <span className="text-xs font-semibold">{anim.label}</span>
                                        <span className="text-[9px] text-slate-400 font-normal">{anim.desc}</span>
                                      </button>
                                    ))}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">Mở Tab</label>
                                    <select
                                      value={sec.data?.button2Target || '_self'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Target: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 cursor-pointer"
                                    >
                                      <option value="_self">Cùng Tab (_self)</option>
                                      <option value="_blank">Tab Mới (_blank)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block">SEO Rel</label>
                                    <select
                                      value={sec.data?.button2Rel !== undefined ? sec.data.button2Rel : 'nofollow'}
                                      onChange={(e) => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), button2Rel: e.target.value },
                                        });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-hidden focus:border-blue-500 cursor-pointer"
                                    >
                                      <option value="nofollow">Nofollow (Khuyên dùng)</option>
                                      <option value="">Dofollow (Mặc định)</option>
                                      <option value="nofollow noopener noreferrer">nofollow noopener noreferrer</option>
                                      <option value="sponsored nofollow">sponsored nofollow</option>
                                    </select>
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

                                {/* Hiệu Ứng Nút Bấm 2 (Hoạt họa thu hút click) */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                      <span>✨ Hiệu Ứng Nút Bấm 2 (Hoạt Họa Bắt Mắt)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">Rung lắc, lan tỏa màu, hào quang để tăng CTR</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                                    {[
                                      { id: '', label: 'Tĩnh', icon: '⏹️', desc: 'Không hiệu ứng' },
                                      { id: 'shake', label: 'Rung Lắc', icon: '📳', desc: 'Lắc rung chú ý' },
                                      { id: 'ripple', label: 'Lan Tỏa Màu', icon: '🌊', desc: 'Sóng màu tỏa ra' },
                                      { id: 'glow', label: 'Hào Quang', icon: '🌟', desc: 'Phát sáng Neon' },
                                      { id: 'shimmer', label: 'Quét Sáng', icon: '⚡', desc: 'Làn mây sáng' },
                                      { id: 'pulse', label: 'Nhịp Thở', icon: '💓', desc: 'Phóng to thu nhỏ' },
                                      { id: 'combo', label: 'Combo VIP', icon: '🔥', desc: 'Rung + Lan tỏa' },
                                    ].map((anim) => (
                                      <button
                                        key={anim.id}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), hasButton2: true, button2Animation: anim.id },
                                          });
                                        }}
                                        className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                          (sec.data?.button2Animation || '') === anim.id
                                            ? 'border-amber-400 bg-amber-500/25 text-white font-bold shadow-xs ring-1 ring-amber-400/40'
                                            : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <span className="text-base">{anim.icon}</span>
                                        <span className="text-xs font-semibold">{anim.label}</span>
                                        <span className="text-[9px] text-slate-400 font-normal">{anim.desc}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 7. Cấu Hình Riêng Cho Mobile (Vị Trí Nút & Đệm Lề) */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-4 pt-3.5">
                          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                📱 Cài Đặt Riêng Cho Mobile (Vị Trí Nút &amp; Đệm Lề)
                              </span>
                            </div>
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
                              @media &le; 549px
                            </span>
                          </div>

                          {/* 1. Vị Trí & Căn Lề Nút Bấm Trên Mobile */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                                Vị Trí Nút Bấm Trên Mobile (Button Alignment)
                              </label>
                              <span className="text-[10px] text-slate-400">Tránh đè chữ trên banner</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: 'right', label: '👉 Căn Phải', desc: 'Sát lề phải banner' },
                                { id: 'center', label: '🎯 Căn Giữa', desc: 'Canh giữa màn hình' },
                                { id: 'left', label: '👈 Căn Trái', desc: 'Sát lề trái' },
                                { id: 'hidden', label: '🚫 Ẩn Nút', desc: 'Nếu ảnh đã vẽ nút' },
                              ].map((pos) => (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), mobileBtnAlign: pos.id },
                                    });
                                  }}
                                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                    (sec.data?.mobileBtnAlign || 'right') === pos.id
                                      ? 'border-indigo-400 bg-indigo-600/30 text-white font-bold shadow-2xs'
                                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="text-xs">{pos.label}</div>
                                  <div className="text-[9px] text-slate-400 font-normal">{pos.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Tinh Chỉnh Nút: Kích Cỡ, Lùi Lề Phải & Đẩy Lề Trên */}
                          {sec.data?.mobileBtnAlign !== 'hidden' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl animate-in fade-in duration-100">
                              {/* Kích Cỡ Nút Mobile */}
                              <div>
                                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                                  Kích Cỡ Nút (Mobile Size)
                                </label>
                                <select
                                  value={sec.data?.mobileBtnSize || 'compact'}
                                  onChange={(e) => {
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), mobileBtnSize: e.target.value },
                                    });
                                  }}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-indigo-500 cursor-pointer"
                                >
                                  <option value="compact">Thu nhỏ gọn (Font 12px - Khuyên dùng)</option>
                                  <option value="small">Vừa vặn (Font 13px)</option>
                                  <option value="normal">Giữ nguyên kích cỡ như PC</option>
                                </select>
                              </div>

                              {/* Lùi Vào Từ Mép Phải */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-semibold text-slate-300">Lùi Vào Từ Mép Phải</label>
                                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                                    {sec.data?.mobileBtnOffsetRight || 0}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={sec.data?.mobileBtnOffsetRight || 0}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                      handleUpdateSection(sec.id, {
                                        data: { ...(sec.data || {}), mobileBtnOffsetRight: val },
                                      });
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-indigo-500"
                                  />
                                  <div className="flex gap-1 flex-1">
                                    {[0, 10, 15, 20].map((v) => (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), mobileBtnOffsetRight: v },
                                          });
                                        }}
                                        className={`flex-1 py-1 text-[10px] rounded border transition cursor-pointer ${
                                          (sec.data?.mobileBtnOffsetRight || 0) === v
                                            ? 'border-indigo-400 bg-indigo-500/30 text-white font-bold'
                                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {v}px
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Đẩy Xuống Từ Trên (Margin Top) */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-semibold text-slate-300">Đẩy Xuống (Margin Top)</label>
                                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                                    {sec.data?.mobileBtnMarginTop || 0}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={sec.data?.mobileBtnMarginTop || 0}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                      handleUpdateSection(sec.id, {
                                        data: { ...(sec.data || {}), mobileBtnMarginTop: val },
                                      });
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-indigo-500"
                                  />
                                  <div className="flex gap-1 flex-1">
                                    {[0, 10, 20, 30].map((v) => (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSection(sec.id, {
                                            data: { ...(sec.data || {}), mobileBtnMarginTop: v },
                                          });
                                        }}
                                        className={`flex-1 py-1 text-[10px] rounded border transition cursor-pointer ${
                                          (sec.data?.mobileBtnMarginTop || 0) === v
                                            ? 'border-indigo-400 bg-indigo-500/30 text-white font-bold'
                                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {v}px
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. Chiều Cao Hộp Trên Mobile (Min-Height) & Đệm Lề 2 Bên (Container Gutter) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                            {/* Chiều Cao Hộp Trên Mobile */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-300 block">
                                  Chiều Cao Khối Mobile (Min-Height)
                                </label>
                                <span className="text-[10px] text-slate-400">Khuyên dùng 140px</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={500}
                                  step={10}
                                  value={sec.data?.mobileMinHeight || ''}
                                  placeholder="Mặc định (Auto)"
                                  onChange={(e) => {
                                    const val = e.target.value ? parseInt(e.target.value, 10) : '';
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), mobileMinHeight: val },
                                    });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-indigo-500 font-mono"
                                />
                                <div className="flex gap-1 shrink-0">
                                  {[
                                    { label: '140px', val: 140 },
                                    { label: '180px', val: 180 },
                                    { label: 'Auto', val: '' },
                                  ].map((btn) => (
                                    <button
                                      key={btn.label}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), mobileMinHeight: btn.val },
                                        });
                                      }}
                                      className="px-2 py-1 text-[10px] rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                    >
                                      {btn.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Đệm Lề 2 Bên Trên Mobile (Container Gutter) */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-300 block">
                                  Đệm Lề 2 Bên (Container Gutter)
                                </label>
                                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                                  {sec.data?.mobileGutter !== undefined ? sec.data.mobileGutter : 15}px
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={60}
                                  step={5}
                                  value={sec.data?.mobileGutter !== undefined ? sec.data.mobileGutter : 15}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    handleUpdateSection(sec.id, {
                                      data: { ...(sec.data || {}), mobileGutter: val },
                                    });
                                  }}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-hidden focus:border-indigo-500"
                                />
                                <div className="flex gap-1 flex-1">
                                  {[
                                    { label: '15px (Chuẩn)', val: 15 },
                                    { label: '10px', val: 10 },
                                    { label: '20px', val: 20 },
                                    { label: '0px (Tràn)', val: 0 },
                                  ].map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateSection(sec.id, {
                                          data: { ...(sec.data || {}), mobileGutter: preset.val },
                                        });
                                      }}
                                      className={`flex-1 py-1 text-[10px] rounded border transition cursor-pointer ${
                                        (sec.data?.mobileGutter !== undefined ? sec.data.mobileGutter : 15) === preset.val
                                          ? 'border-indigo-400 bg-indigo-500/30 text-white font-bold'
                                          : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[9px] text-slate-400">
                                {(sec.data?.mobileGutter !== undefined ? sec.data.mobileGutter : 15) === 0
                                  ? 'Khối chạm sát 2 mép viền màn hình.'
                                  : `Khối thụt vào ${sec.data?.mobileGutter !== undefined ? sec.data.mobileGutter : 15}px hai bên, bo tròn góc đẹp và chống tràn viền.`}
                              </p>
                            </div>
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
                                  onClick={(e) => {
                                    (e.target as HTMLInputElement).value = '';
                                  }}
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

                          {/* Image Link (Gắn link khi người dùng nhấp vào ảnh) */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-700">
                              🔗 Liên kết khi nhấp vào ảnh (Image Link URL)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={sec.buttonLink || ''}
                                  placeholder="https://... (để trống nếu không gắn link)"
                                  onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 font-mono"
                                />
                              </div>
                              <div>
                                <select
                                  value={sec.buttonTarget || sec.data?.buttonTarget || '_self'}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, {
                                      buttonTarget: e.target.value as '_self' | '_blank',
                                      data: { ...(sec.data || {}), buttonTarget: e.target.value },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="_self">Cùng Tab (_self)</option>
                                  <option value="_blank">Tab Mới (_blank)</option>
                                </select>
                              </div>
                              <div>
                                <select
                                  value={sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel ?? 'nofollow')}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, {
                                      buttonRel: e.target.value,
                                      data: { ...(sec.data || {}), buttonRel: e.target.value },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="nofollow">Nofollow (Khuyên dùng)</option>
                                  <option value="">Dofollow (Mặc định)</option>
                                  <option value="nofollow noopener noreferrer">nofollow noopener noreferrer</option>
                                  <option value="sponsored nofollow">sponsored nofollow</option>
                                </select>
                              </div>
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
          ← Quay lại Bước 5 (Cấu Hình Menu)
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
