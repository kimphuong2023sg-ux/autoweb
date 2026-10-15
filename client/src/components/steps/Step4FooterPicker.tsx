import React, { useState, useRef } from 'react';
import {
  Building2,
  Crown,
  Newspaper,
  AlignCenter,
  ShoppingBag,
  Columns2,
  Check,
  Sparkles,
  Palette,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  RefreshCw,
  Rocket,
  Loader2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FolderOpen,
  Clock,
  MessageCircle,
  Info,
  Link as LinkIcon,
} from 'lucide-react';
import { FooterConfig, FooterLinkItem, MenuItem, ConnectedSite, WpMediaItem } from '../../types';
import { api } from '../../services/api';
import { WpMediaPickerModal } from '../common/WpMediaPickerModal';
import { formatRichText } from '../../utils/textFormatter';

interface Step4FooterPickerProps {
  footerConfig: FooterConfig;
  onChangeFooterConfig: (newConfig: FooterConfig) => void;
  menuItems?: MenuItem[];
  currentSite?: ConnectedSite | null;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step4FooterPicker: React.FC<Step4FooterPickerProps> = ({
  footerConfig,
  onChangeFooterConfig,
  menuItems = [],
  currentSite,
  onNextStep,
  onPrevStep,
}) => {
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<boolean>(false);

  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [bgUploadSuccess, setBgUploadSuccess] = useState<boolean>(false);

  const [isLogoMediaPickerOpen, setIsLogoMediaPickerOpen] = useState(false);
  const [isBgMediaPickerOpen, setIsBgMediaPickerOpen] = useState(false);

  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertBoldBio = () => {
    const el = bioTextareaRef.current;
    const currentBio = footerConfig.bio || '';
    if (!el) {
      onChangeFooterConfig({ ...footerConfig, bio: currentBio + '**chữ in đậm**' });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = currentBio.substring(start, end);
    const replacement = selected ? `**${selected}**` : '**chữ in đậm**';
    const newText = currentBio.substring(0, start) + replacement + currentBio.substring(end);
    onChangeFooterConfig({ ...footerConfig, bio: newText });

    setTimeout(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start, start + replacement.length);
      } else {
        el.setSelectionRange(start + 2, start + 2 + 'chữ in đậm'.length);
      }
    }, 50);
  };

  const handleInsertLinkBio = () => {
    const el = bioTextareaRef.current;
    const currentBio = footerConfig.bio || '';
    const start = el ? el.selectionStart : currentBio.length;
    const end = el ? el.selectionEnd : currentBio.length;
    const selected = currentBio.substring(start, end) || 'Tên liên kết';

    const url = prompt('Nhập đường link URL muốn chèn:', 'https://');
    if (!url) return;

    const replacement = `[${selected}](${url})`;
    const newText = currentBio.substring(0, start) + replacement + currentBio.substring(end);
    onChangeFooterConfig({ ...footerConfig, bio: newText });

    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(start, start + replacement.length);
      }
    }, 50);
  };

  const handleInsertItalicBio = () => {
    const el = bioTextareaRef.current;
    const currentBio = footerConfig.bio || '';
    if (!el) {
      onChangeFooterConfig({ ...footerConfig, bio: currentBio + '*chữ in nghiêng*' });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = currentBio.substring(start, end);
    const replacement = selected ? `*${selected}*` : '*chữ in nghiêng*';
    const newText = currentBio.substring(0, start) + replacement + currentBio.substring(end);
    onChangeFooterConfig({ ...footerConfig, bio: newText });

    setTimeout(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start, start + replacement.length);
      } else {
        el.setSelectionRange(start + 1, start + 1 + 'chữ in nghiêng'.length);
      }
    }, 50);
  };

  // Trạng thái hiển thị các mục tùy chọn Cột 4 (chỉ hiển thị khi có dữ liệu hoặc khi người dùng bấm "+ Thêm")
  const [showWorkingHours, setShowWorkingHours] = useState<boolean>(() => Boolean(footerConfig.col4WorkingHours));
  const [showActionBtn, setShowActionBtn] = useState<boolean>(() => Boolean(footerConfig.col4LinkText || footerConfig.col4LinkUrl));
  const [showExtraInfo, setShowExtraInfo] = useState<boolean>(() => Boolean(footerConfig.col4ExtraInfo));
  const [showCustomLinks, setShowCustomLinks] = useState<boolean>(() => Boolean(footerConfig.col4Links && footerConfig.col4Links.length > 0));

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      // Cập nhật ngay preview và set logoType là image
      onChangeFooterConfig({
        ...footerConfig,
        logoType: 'image',
        logoUrl: base64,
      });

      if (!currentSite) return;

      try {
        setIsUploadingLogo(true);
        setLogoUploadError(null);
        setLogoUploadSuccess(false);

        const res = await api.uploadMedia(currentSite, {
          filename: file.name,
          fileData: base64,
          title: `Footer Logo - ${file.name}`,
          altText: footerConfig.brandName || 'Footer Logo',
        });

        if (res && res.media) {
          onChangeFooterConfig({
            ...footerConfig,
            logoType: 'image',
            logoUrl: res.media.url,
            logoId: res.media.id,
          });
          setLogoUploadSuccess(true);
          setTimeout(() => setLogoUploadSuccess(false), 3000);
        }
      } catch (err: any) {
        setLogoUploadError(err.message || 'Lỗi khi tải ảnh logo lên WordPress');
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFooterBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 15MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      onChangeFooterConfig({
        ...footerConfig,
        bgType: 'image',
        bgImage: base64,
      });

      if (!currentSite) return;

      try {
        setIsUploadingBg(true);
        setBgUploadError(null);
        setBgUploadSuccess(false);

        const res = await api.uploadMedia(currentSite, {
          filename: file.name,
          fileData: base64,
          title: `Footer Background - ${file.name}`,
          altText: 'Footer Background',
        });

        if (res && res.media) {
          onChangeFooterConfig({
            ...footerConfig,
            bgType: 'image',
            bgImage: res.media.url,
            bgImageId: res.media.id,
          });
          setBgUploadSuccess(true);
          setTimeout(() => setBgUploadSuccess(false), 3000);
        }
      } catch (err: any) {
        setBgUploadError(err.message || 'Lỗi khi tải ảnh nền chân trang lên WordPress');
      } finally {
        setIsUploadingBg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const gradientPresets = [
    {
      id: 'midnight-nebula',
      name: 'Midnight Nebula',
      gradient: 'linear-gradient(135deg, #0b0f19 0%, #1a103c 50%, #050515 100%)',
      desc: 'Huyền bí bóng đêm & ánh tím',
    },
    {
      id: 'casino-gold-luxe',
      name: 'Casino Gold Luxe',
      gradient: 'linear-gradient(135deg, #0d0e15 0%, #292010 50%, #0a0b10 100%)',
      desc: 'Hoàng kim VIP Casino',
    },
    {
      id: 'deep-ocean-cyber',
      name: 'Deep Ocean Cyber',
      gradient: 'linear-gradient(135deg, #0a192f 0%, #0f3057 50%, #031021 100%)',
      desc: 'Xanh thẳm đại dương công nghệ',
    },
    {
      id: 'royal-purple',
      name: 'Royal Velvet Purple',
      gradient: 'linear-gradient(135deg, #13091e 0%, #2d134e 50%, #0e0517 100%)',
      desc: 'Tím nhung quyền lực hoàng gia',
    },
    {
      id: 'emerald-luxury',
      name: 'Emerald Luxury',
      gradient: 'linear-gradient(135deg, #051a14 0%, #0d3d2e 50%, #03100c 100%)',
      desc: 'Xanh ngọc lục bảo quý phái',
    },
    {
      id: 'dark-crimson',
      name: 'Dark Crimson Ruby',
      gradient: 'linear-gradient(135deg, #1c080e 0%, #3d1421 50%, #0f0307 100%)',
      desc: 'Đỏ ruby ma mị quyến rũ',
    },
    {
      id: 'charcoal-carbon',
      name: 'Charcoal Carbon',
      gradient: 'linear-gradient(135deg, #16171b 0%, #292d36 50%, #101114 100%)',
      desc: 'Sợi carbon hiện đại mạnh mẽ',
    },
    {
      id: 'sunset-twilight',
      name: 'Sunset Twilight',
      gradient: 'linear-gradient(135deg, #0d0f1c 0%, #261b38 50%, #2e1d32 100%)',
      desc: 'Hoàng hôn tím chuyển sắc',
    },
    {
      id: 'black-gold-elite',
      name: 'Black & Gold Elite',
      gradient: 'linear-gradient(135deg, #000000 0%, #1f1807 50%, #000000 100%)',
      desc: 'Đen tuyền điểm vàng đẳng cấp',
    },
    {
      id: 'nordic-slate',
      name: 'Nordic Slate',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1222 100%)',
      desc: 'Xám đá phiến thanh lịch',
    },
  ];

  const bgImagePresets = [
    {
      name: 'Casino Chips & Cards Dark',
      url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dark Luxury Abstract',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cyber Mesh Tech Dark',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dark Marble Luxury',
      url: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&auto=format&fit=crop&q=80',
    },
  ];

  // 6 KIỂU FOOTER ĐA DẠNG CHUẨN FLATSOME UX BUILDER
  const layouts = [
    {
      id: 'corporate-4col',
      name: 'Doanh Nghiệp 4 Cột',
      badge: 'Chuẩn SEO',
      desc: 'Bố cục 4 cột cân bằng: Thương hiệu | Menu 1 | Menu 2 | Hotline & Liên hệ.',
      icon: Building2,
    },
    {
      id: 'casino-luxury',
      name: 'Casino & Gaming VIP',
      badge: 'Dark & Gold 18+',
      desc: 'Sang trọng ánh vàng: Huy hiệu 18+ Trách nhiệm người chơi, Chứng nhận PAGCOR/Curaçao & SSL 256-bit.',
      icon: Crown,
    },
    {
      id: 'magazine-3col',
      name: 'Báo Chí & Tin Tức (3 Cột)',
      badge: 'Chuyên Sâu',
      desc: 'Cột 1 lớn (40% Giấy phép/Tôn chỉ) | Cột 2 (Chuyên mục đọc nhiều) | Cột 3 (Tòa soạn & Đường dây nóng).',
      icon: Newspaper,
    },
    {
      id: 'minimal-center',
      name: 'Tối Giản Hiện Đại',
      badge: 'Căn Giữa Tinh Tế',
      desc: 'Logo & Slogan căn giữa, hàng Menu ngang tinh gọn, thông tin liên lạc và bản quyền thanh lịch.',
      icon: AlignCenter,
    },
    {
      id: 'ecommerce-modern',
      name: 'Thương Mại & Dịch Vụ',
      badge: 'Cổng Thanh Toán',
      desc: 'Cam kết chính hãng 24/7, Chính sách đổi trả/CSKH, Sản phẩm bán chạy & Kênh thanh toán đa dạng.',
      icon: ShoppingBag,
    },
    {
      id: 'affiliate-2col',
      name: 'Tin Tức / Affiliate (2 Cột)',
      badge: 'Gọn Nhẹ 7-5',
      desc: 'Cột 1 (Giới thiệu & Miễn trừ trách nhiệm Disclaimer) | Cột 2 (Hotline tư vấn & Bản quyền).',
      icon: Columns2,
    },
  ];

  // Danh sách liên kết hiện tại của Cột 2
  const col2Links: FooterLinkItem[] =
    footerConfig.col2Links && footerConfig.col2Links.length > 0
      ? footerConfig.col2Links
      : [
          { text: 'Giới thiệu công ty', url: '/gioi-thieu/' },
          { text: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat/' },
          { text: 'Điều khoản sử dụng', url: '/dieu-khoan-su-dung/' },
          { text: 'Liên hệ hợp tác', url: '/lien-he/' },
        ];

  // Danh sách liên kết hiện tại của Cột 3
  const col3Links: FooterLinkItem[] =
    footerConfig.col3Links && footerConfig.col3Links.length > 0
      ? footerConfig.col3Links
      : [
          { text: 'Tư vấn chiến lược', url: '#' },
          { text: 'Giải pháp trọn gói', url: '#' },
          { text: 'Tối ưu hóa chuyển đổi', url: '#' },
          { text: 'Hỗ trợ kỹ thuật 24/7', url: '#' },
        ];

  // Cập nhật giá trị link Cột 2
  const handleUpdateCol2Link = (index: number, field: 'text' | 'url', value: string) => {
    const updated = [...col2Links];
    updated[index] = { ...updated[index], [field]: value };
    onChangeFooterConfig({ ...footerConfig, col2Links: updated });
  };

  // Cập nhật giá trị link Cột 3
  const handleUpdateCol3Link = (index: number, field: 'text' | 'url', value: string) => {
    const updated = [...col3Links];
    updated[index] = { ...updated[index], [field]: value };
    onChangeFooterConfig({ ...footerConfig, col3Links: updated });
  };

  // SẮP XẾP LẠI VỊ TRÍ CỘT 2: Di chuyển Lên / Xuống
  const handleMoveCol2Link = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= col2Links.length) return;
    const updated = [...col2Links];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeFooterConfig({ ...footerConfig, col2Links: updated });
  };

  // SẮP XẾP LẠI VỊ TRÍ CỘT 3: Di chuyển Lên / Xuống
  const handleMoveCol3Link = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= col3Links.length) return;
    const updated = [...col3Links];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeFooterConfig({ ...footerConfig, col3Links: updated });
  };

  // Thêm link mới vào Cột 2
  const handleAddCol2Link = () => {
    const updated = [...col2Links, { text: 'Liên kết mới', url: '#' }];
    onChangeFooterConfig({ ...footerConfig, col2Links: updated });
  };

  // Xóa link khỏi Cột 2
  const handleDeleteCol2Link = (index: number) => {
    if (col2Links.length <= 1) return;
    const updated = col2Links.filter((_, i) => i !== index);
    onChangeFooterConfig({ ...footerConfig, col2Links: updated });
  };

  // Thêm link mới vào Cột 3
  const handleAddCol3Link = () => {
    const updated = [...col3Links, { text: 'Dịch vụ / Game mới', url: '#' }];
    onChangeFooterConfig({ ...footerConfig, col3Links: updated });
  };

  // Xóa link khỏi Cột 3
  const handleDeleteCol3Link = (index: number) => {
    if (col3Links.length <= 1) return;
    const updated = col3Links.filter((_, i) => i !== index);
    onChangeFooterConfig({ ...footerConfig, col3Links: updated });
  };

  // TỰ ĐỘNG LẤY LINK TỪ MENU MẶC ĐỊNH / MENU HEADER
  const handleImportFromMenu = () => {
    if (!menuItems || menuItems.length === 0) {
      setSyncNotice('Chưa tìm thấy mục Menu nào trong hệ thống! Bạn có thể vào Bước "Menu Website" để tạo thêm.');
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }

    const validMenuItems = menuItems.filter((item) => item.title && item.title.trim() !== '');

    if (validMenuItems.length === 0) {
      setSyncNotice('Menu hiện tại đang trống.');
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }

    const half = Math.ceil(validMenuItems.length / 2);
    const col2Items: FooterLinkItem[] = validMenuItems.slice(0, half).map((m) => ({
      text: m.title,
      url: m.url || '#',
    }));

    const col3Items: FooterLinkItem[] = validMenuItems.slice(half).map((m) => ({
      text: m.title,
      url: m.url || '#',
    }));

    const finalCol3 = col3Items.length > 0 ? col3Items : col3Links;

    onChangeFooterConfig({
      ...footerConfig,
      col2Links: col2Items,
      col3Links: finalCol3,
    });

    setSyncNotice(`Đã tự động lấy thành công ${validMenuItems.length} liên kết từ Menu Header sang Cột 2 & Cột 3!`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Danh sách liên kết hiện tại của Cột 4 (nếu có)
  const col4Links: FooterLinkItem[] = footerConfig.col4Links || [];

  const isWorkingHoursActive = showWorkingHours || Boolean(footerConfig.col4WorkingHours);
  const isActionBtnActive = showActionBtn || Boolean(footerConfig.col4LinkText || footerConfig.col4LinkUrl);
  const isExtraInfoActive = showExtraInfo || Boolean(footerConfig.col4ExtraInfo);
  const isCustomLinksActive = showCustomLinks || Boolean(footerConfig.col4Links && footerConfig.col4Links.length > 0);

  const handleRemoveWorkingHours = () => {
    setShowWorkingHours(false);
    onChangeFooterConfig({ ...footerConfig, col4WorkingHours: '' });
  };

  const handleRemoveActionBtn = () => {
    setShowActionBtn(false);
    onChangeFooterConfig({ ...footerConfig, col4LinkText: '', col4LinkUrl: '' });
  };

  const handleRemoveExtraInfo = () => {
    setShowExtraInfo(false);
    onChangeFooterConfig({ ...footerConfig, col4ExtraInfo: '' });
  };

  const handleRemoveCustomLinks = () => {
    setShowCustomLinks(false);
    onChangeFooterConfig({ ...footerConfig, col4Links: [] });
  };

  // Cập nhật giá trị link Cột 4
  const handleUpdateCol4Link = (index: number, field: 'text' | 'url', value: string) => {
    const updated = [...col4Links];
    updated[index] = { ...updated[index], [field]: value };
    onChangeFooterConfig({ ...footerConfig, col4Links: updated });
  };

  // SẮP XẾP LẠI VỊ TRÍ CỘT 4: Di chuyển Lên / Xuống
  const handleMoveCol4Link = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= col4Links.length) return;
    const updated = [...col4Links];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeFooterConfig({ ...footerConfig, col4Links: updated });
  };

  // Thêm link mới vào Cột 4
  const handleAddCol4Link = () => {
    const updated = [...col4Links, { text: 'Liên kết liên hệ', url: '#' }];
    setShowCustomLinks(true);
    onChangeFooterConfig({ ...footerConfig, col4Links: updated });
  };

  // Xóa link khỏi Cột 4
  const handleDeleteCol4Link = (index: number) => {
    const updated = col4Links.filter((_, i) => i !== index);
    if (updated.length === 0) {
      setShowCustomLinks(false);
    }
    onChangeFooterConfig({ ...footerConfig, col4Links: updated });
  };

  // Chọn nhanh 1 mục từ Menu Header vào dòng cụ thể
  const handlePickFromMenu = (column: 2 | 3 | 4, index: number, menuItem: MenuItem) => {
    if (column === 2) {
      const updated = [...col2Links];
      updated[index] = { text: menuItem.title, url: menuItem.url || '#' };
      onChangeFooterConfig({ ...footerConfig, col2Links: updated });
    } else if (column === 3) {
      const updated = [...col3Links];
      updated[index] = { text: menuItem.title, url: menuItem.url || '#' };
      onChangeFooterConfig({ ...footerConfig, col3Links: updated });
    } else {
      const updated = [...col4Links];
      updated[index] = { text: menuItem.title, url: menuItem.url || '#' };
      onChangeFooterConfig({ ...footerConfig, col4Links: updated });
    }
  };

  // HÀM ÁP DỤNG TRỰC TIẾP LÊN WEBSITE NGAY TẠI ĐÂY
  const handleApplyToWebNow = async () => {
    if (!currentSite) {
      setDeployError('Chưa có Website nào được kết nối. Vui lòng kết nối Website ở thanh trên cùng trước khi áp dụng.');
      setTimeout(() => setDeployError(null), 6000);
      return;
    }

    try {
      setIsDeploying(true);
      setDeployError(null);
      setDeploySuccess(null);

      await api.deployFooter(currentSite, footerConfig);
      setDeploySuccess(`Đã áp dụng mẫu Footer lên website ${currentSite.siteUrl.replace(/^https?:\/\//, '')} thành công!`);
      setTimeout(() => setDeploySuccess(null), 10000);
    } catch (err: any) {
      console.error('Deploy footer error:', err);
      setDeployError(err?.message || 'Có lỗi xảy ra khi áp dụng Footer lên WordPress.');
      setTimeout(() => setDeployError(null), 8000);
    } finally {
      setIsDeploying(false);
    }
  };

  // Mẫu Preset 1: Casino Mexico (Tiếng Tây Ban Nha cho JuegaLotto)
  const applyMexicoCasinoPreset = () => {
    onChangeFooterConfig({
      ...footerConfig,
      layout: 'casino-luxury',
      brandName: 'JuegaLotto México - Casino y Lotería en Línea Oficial',
      bio: 'Plataforma oficial líder en México con los mejores juegos de casino en vivo, lotería oficial, tragamonedas slots y retiros rápidos y seguros.',
      col2Title: 'Sobre Nosotros',
      col2Links: [
        { text: 'Quiénes Somos', url: '/quienes-somos/' },
        { text: 'Política de Privacidad', url: '/privacidad/' },
        { text: 'Términos y Condiciones', url: '/terminos/' },
        { text: 'Juego Responsable', url: '/juego-responsable/' },
      ],
      col3Title: 'Juegos y Lotería',
      col3Links: [
        { text: 'Casino en Vivo', url: '/casino/' },
        { text: 'Lotería Nacional', url: '/loteria/' },
        { text: 'Tragamonedas Slots', url: '/slots/' },
        { text: 'Promociones y Bonos', url: '/promociones/' },
      ],
      col4Title: 'Atención al Cliente',
      hotline: '+52 55 1234 5678',
      email: 'soporte@juegalotto.mx',
      address: 'Ciudad de México, CDMX, México',
      bgColor: '#0b0f19',
      badgeText: '18+ Juego Responsable & Seguro',
      disclaimerText: 'Advertencia: Los juegos con apuesta están prohibidos para menores de 18 años. Juegue de manera responsable y con fines de entretenimiento.',
      copyrightText: '© 2026 JuegaLotto México. Todos los derechos reservados.',
    });
  };

  // Mẫu Preset 2: Doanh Nghiệp Việt Nam Chuẩn SEO
  const applyVietnamCorporatePreset = () => {
    onChangeFooterConfig({
      ...footerConfig,
      layout: 'corporate-4col',
      brandName: 'Thương Hiệu Doanh Nghiệp',
      bio: 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và cam kết bảo hành dài hạn.',
      col2Title: 'Về Chúng Tôi',
      col2Links: [
        { text: 'Giới thiệu công ty', url: '/gioi-thieu/' },
        { text: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat/' },
        { text: 'Điều khoản sử dụng', url: '/dieu-khoan-su-dung/' },
        { text: 'Liên hệ hợp tác', url: '/lien-he/' },
      ],
      col3Title: 'Dịch Vụ Chính',
      col3Links: [
        { text: 'Tư vấn chiến lược', url: '#' },
        { text: 'Giải pháp trọn gói', url: '#' },
        { text: 'Tối ưu hóa chuyển đổi', url: '#' },
        { text: 'Hỗ trợ kỹ thuật 24/7', url: '#' },
      ],
      col4Title: 'Liên Hệ Nhanh',
      hotline: '0988.xxx.xxx',
      email: 'lienhe@domain.com',
      address: 'Hà Nội, Việt Nam',
      bgColor: '#1e293b',
      copyrightText: '© 2026 Bản quyền thuộc về Doanh Nghiệp.',
    });
  };

  const currentLayout = footerConfig.layout || 'corporate-4col';

  return (
    <div className="space-y-6 w-full">
      {/* Title & Fast Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>4. Thiết Kế Mẫu Footer (UX Block Chân Trang)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Tự Động Nhận Link & Sắp Xếp Vị Trí
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chân trang Flatsome tự động nhận diện liên kết menu, hoạt động chuẩn trên cả <strong>PC</strong> và <strong>Mobile</strong>.
          </p>
        </div>

        {/* Action Presets & NÚT ÁP DỤNG LÊN WEB NGAY */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* NÚT ÁP DỤNG TRỰC TIẾP LÊN WEB NGAY Ở ĐÂY */}
          <button
            type="button"
            onClick={handleApplyToWebNow}
            disabled={isDeploying}
            className="px-4 py-2 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            title="Biên dịch và đẩy cấu hình Footer này lên website WordPress ngay lập tức"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang áp dụng...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>🚀 Áp Dụng Lên Web Ngay</span>
              </>
            )}
          </button>

          {/* NÚT TỰ ĐỘNG ĐỒNG BỘ TỪ MENU */}
          <button
            type="button"
            onClick={handleImportFromMenu}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Tự động lấy toàn bộ link từ Menu chính đưa vào chân trang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>🔄 Lấy Link Từ Menu ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={applyMexicoCasinoPreset}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>🇲🇽 Mẫu JuegaLotto</span>
          </button>

          <button
            type="button"
            onClick={applyVietnamCorporatePreset}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🇻🇳 Mẫu Doanh Nghiệp</span>
          </button>
        </div>
      </div>

      {/* Thông báo Deploy Thành công */}
      {deploySuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{deploySuccess}</span>
          </div>
          {currentSite?.siteUrl && (
            <a
              href={currentSite.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
            >
              <span>Xem Website Ngay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Thông báo Deploy Lỗi */}
      {deployError && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-medium">{deployError}</span>
        </div>
      )}

      {/* Thông báo Sync Menu */}
      {syncNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 transition animate-fade-in">
          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-medium">{syncNotice}</span>
        </div>
      )}

      {/* 1. BỘ CHỌN KIỂU FOOTER (6 KIỂU) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Columns2 className="w-4 h-4 text-blue-600" />
          <span>CHỌN KIỂU BỐ CỤC CHÂN TRANG (LAYOUT STYLE)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {layouts.map((l) => {
            const Icon = l.icon;
            const isSelected = currentLayout === l.id;
            return (
              <div
                key={l.id}
                onClick={() => onChangeFooterConfig({ ...footerConfig, layout: l.id as any })}
                className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{l.name}</span>
                    </div>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-blue-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {l.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{l.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CHỌN MÀU NỀN & BACKGROUND FOOTER (MÀU ĐƠN / GRADIENT / ẢNH NỀN) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              NỀN CHÂN TRANG (FOOTER BACKGROUND)
            </span>
          </div>

          {/* TAB CHỌN LOẠI NỀN */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeFooterConfig({ ...footerConfig, bgType: 'solid' })}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                (!footerConfig.bgType || footerConfig.bgType === 'solid')
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Màu Đơn (Solid)
            </button>
            <button
              type="button"
              onClick={() => onChangeFooterConfig({
                ...footerConfig,
                bgType: 'gradient',
                bgGradient: footerConfig.bgGradient || 'linear-gradient(135deg, #0b0f19 0%, #1a103c 50%, #050515 100%)',
              })}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                footerConfig.bgType === 'gradient'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Màu Gradient Đẹp
            </button>
            <button
              type="button"
              onClick={() => onChangeFooterConfig({ ...footerConfig, bgType: 'image' })}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                footerConfig.bgType === 'image'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Ảnh Nền (Image BG)
            </button>
          </div>
        </div>

        {/* 1. MÀU ĐƠN (SOLID COLOR) */}
        {(!footerConfig.bgType || footerConfig.bgType === 'solid') && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <input
                type="color"
                value={footerConfig.bgColor?.startsWith('#') ? footerConfig.bgColor : '#0b0f19'}
                onChange={(e) => onChangeFooterConfig({ ...footerConfig, bgColor: e.target.value, bgType: 'solid' })}
                className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                title="Chọn màu nền tự do"
              />
              <span className="text-xs font-mono font-medium text-slate-700 px-1">
                {footerConfig.bgColor || '#0b0f19'}
              </span>
            </div>

            {[
              { name: 'Casino VIP', color: '#0b0f19' },
              { name: 'Xám Slate', color: '#1e293b' },
              { name: 'Đen Tuyệt Đối', color: '#000000' },
              { name: 'Xanh Navy', color: '#0f172a' },
              { name: 'Midnight Tím', color: '#130f26' },
              { name: 'Emerald Dark', color: '#062319' },
              { name: 'Nâu Trầm', color: '#1a120b' },
            ].map((p) => {
              const isSelected = footerConfig.bgColor === p.color && (!footerConfig.bgType || footerConfig.bgType === 'solid');
              return (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => onChangeFooterConfig({ ...footerConfig, bgColor: p.color, bgType: 'solid' })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-black/20 shrink-0"
                    style={{ backgroundColor: p.color }}
                  ></span>
                  <span>{p.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. MÀU GRADIENT (CHUYỂN SẮC NGHỆ THUẬT) */}
        {footerConfig.bgType === 'gradient' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>Bấm chọn một kiểu Gradient phối màu chuyên sâu tối ưu cho hiển thị chữ chân trang:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {gradientPresets.map((g) => {
                const isSelected = footerConfig.bgGradient === g.gradient;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onChangeFooterConfig({
                      ...footerConfig,
                      bgType: 'gradient',
                      bgGradient: g.gradient,
                      bgColor: g.gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}/)?.[0] || '#0b0f19',
                    })}
                    className={`relative p-2.5 rounded-xl border text-left transition flex flex-col justify-between min-h-[70px] overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                        : 'border-slate-300 hover:border-slate-400 hover:shadow-2xs'
                    }`}
                    style={{ background: g.gradient }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[11px] font-bold text-white drop-shadow-xs truncate">
                        {g.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-300/90 leading-tight drop-shadow-2xs line-clamp-1">
                      {g.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ẢNH NỀN FOOTER (BACKGROUND IMAGE) */}
        {footerConfig.bgType === 'image' && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tải ảnh lên hoặc xem ảnh hiện tại */}
              <div>
                {footerConfig.bgImage ? (
                  <div className="relative rounded-xl border border-slate-300 overflow-hidden h-[120px] bg-slate-900 shadow-inner flex items-center justify-center">
                    <img
                      src={footerConfig.bgImage}
                      alt="Footer Background"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: footerConfig.bgOverlay || 'rgba(0, 0, 0, 0.72)' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 p-3 flex-wrap">
                      <label className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm transition">
                        {isUploadingBg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{isUploadingBg ? 'Đang tải...' : 'Tải ảnh khác'}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={isUploadingBg} onChange={handleFooterBgFileUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsBgMediaPickerOpen(true)}
                        className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Chọn từ Media</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeFooterConfig({ ...footerConfig, bgImage: '', bgImageId: undefined, bgType: 'solid' })}
                        className="text-[11px] bg-red-600/90 hover:bg-red-600 text-white font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Gỡ ảnh nền</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center group h-[120px]">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition mb-1">
                        {isUploadingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {isUploadingBg ? 'Đang tải...' : 'Tải ảnh từ máy'}
                      </span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" className="hidden" disabled={isUploadingBg} onChange={handleFooterBgFileUpload} />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsBgMediaPickerOpen(true)}
                      className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center group h-[120px]"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition mb-1">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-indigo-950">Chọn từ Media</span>
                      <span className="text-[10px] text-indigo-600/80">Thư viện có sẵn</span>
                    </button>
                  </div>
                )}

                <div className="mt-2">
                  <input
                    type="text"
                    value={footerConfig.bgImage || ''}
                    onChange={(e) => onChangeFooterConfig({ ...footerConfig, bgImage: e.target.value, bgType: 'image' })}
                    placeholder="Hoặc dán link URL ảnh online..."
                    className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-300 focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Tùy chỉnh Độ phủ tối (Overlay) & Mẫu ảnh có sẵn */}
              <div className="space-y-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-700 mb-1">
                    <span>Lớp phủ bóng tối (Overlay) cho chữ rõ nét:</span>
                    <span className="font-bold text-blue-600">
                      {Math.round((parseFloat(footerConfig.bgOverlay?.match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/)?.[1] || '0.72')) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={Math.round((parseFloat(footerConfig.bgOverlay?.match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/)?.[1] || '0.72')) * 100)}
                    onChange={(e) => {
                      const alpha = (parseInt(e.target.value) / 100).toFixed(2);
                      onChangeFooterConfig({ ...footerConfig, bgOverlay: `rgba(0, 0, 0, ${alpha})` });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-600 block mb-1">Hoặc chọn nhanh ảnh nền cao cấp:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {bgImagePresets.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => onChangeFooterConfig({
                          ...footerConfig,
                          bgType: 'image',
                          bgImage: img.url,
                          bgOverlay: footerConfig.bgOverlay || 'rgba(0, 0, 0, 0.72)',
                        })}
                        className={`text-[10px] p-1.5 rounded-lg border text-left truncate transition cursor-pointer ${
                          footerConfig.bgImage === img.url
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        🖼️ {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {bgUploadError && (
              <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded flex items-center gap-1.5 border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{bgUploadError}</span>
              </div>
            )}

            {bgUploadSuccess && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Đã tải ảnh nền lên WordPress Media thành công!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. FORM SOẠN THẢO CHI TIẾT CÁC CỘT (CÓ SẮP XẾP VỊ TRÍ & ĐỒNG BỘ LINK) */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Columns2 className="w-4 h-4 text-blue-600" />
            <span>NỘI DUNG CÁC CỘT & SẮP XẾP VỊ TRÍ LIÊN KẾT</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
              💡 Bấm ⬆️ / ⬇️ để đổi thứ tự link trên PC & Mobile
            </span>
          </div>
        </div>

        {/* GRID CỘT */}
        <div className={`grid gap-4 ${
          currentLayout === 'affiliate-2col'
            ? 'grid-cols-1 md:grid-cols-2'
            : currentLayout === 'magazine-3col'
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* CỘT 1: THƯƠNG HIỆU & BIO */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  CỘT 1: THƯƠNG HIỆU
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                  {currentLayout === 'magazine-3col' ? 'Cột 1 (40%)' : currentLayout === 'affiliate-2col' ? 'Cột 1 (60%)' : 'Cột 1 (25%)'}
                </span>
              </div>

              {/* TẢI ẢNH LOGO THƯƠNG HIỆU */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Logo Thương Hiệu (Ảnh)
                  </label>
                  {currentSite && (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      WP Media sẵn sàng
                    </span>
                  )}
                </div>

                {footerConfig.logoUrl ? (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative shadow-inner">
                    <div className="w-full flex items-center justify-center py-2 min-h-[64px]">
                      <img
                        src={footerConfig.logoUrl}
                        alt={footerConfig.brandName || 'Footer Logo'}
                        style={{ maxWidth: `${footerConfig.logoWidth || 180}px`, maxHeight: '60px' }}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800 w-full justify-center flex-wrap">
                      <label className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded cursor-pointer flex items-center gap-1.5 transition shadow-xs">
                        {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        <span>{isUploadingLogo ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={isUploadingLogo} onChange={handleLogoFileUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsLogoMediaPickerOpen(true)}
                        className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1.5 transition shadow-xs"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Chọn từ Media</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeFooterConfig({ ...footerConfig, logoUrl: '', logoId: undefined })}
                        className="text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium px-2.5 py-1 rounded flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Gỡ ảnh</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Lựa chọn 1: Tải từ máy tính */}
                      <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center group min-h-[110px]">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition mb-1.5 shadow-2xs">
                          {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {isUploadingLogo ? 'Đang tải...' : 'Tải từ máy tính'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PNG, SVG, JPG, WEBP</span>
                        <input type="file" accept="image/*" className="hidden" disabled={isUploadingLogo} onChange={handleLogoFileUpload} />
                      </label>

                      {/* Lựa chọn 2: Chọn từ Media */}
                      <button
                        type="button"
                        onClick={() => setIsLogoMediaPickerOpen(true)}
                        className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center group min-h-[110px]"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition mb-1.5 shadow-2xs">
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-indigo-950">
                          Chọn từ Media
                        </span>
                        <span className="text-[10px] text-indigo-600/80 mt-0.5">Thư viện có sẵn</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={footerConfig.logoUrl || ''}
                        onChange={(e) => onChangeFooterConfig({ ...footerConfig, logoUrl: e.target.value, logoType: 'image' })}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-300 focus:outline-blue-500"
                      />
                    </div>
                  </div>
                )}

                {logoUploadError && (
                  <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded flex items-center gap-1.5 border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                {logoUploadSuccess && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Đã tải ảnh lên WordPress Media thành công!</span>
                  </div>
                )}

                {/* Kéo chỉnh chiều rộng Logo */}
                {footerConfig.logoUrl && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-700 mb-1">
                      <span>Chiều rộng hiển thị Logo:</span>
                      <span className="font-bold text-blue-600">{footerConfig.logoWidth || 180}px</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="320"
                      step="5"
                      value={footerConfig.logoWidth || 180}
                      onChange={(e) => onChangeFooterConfig({ ...footerConfig, logoWidth: parseInt(e.target.value) || 180 })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Đoạn Giới Thiệu Ngắn (Bio)
                  </label>
                  {/* Thanh công cụ định dạng Rich Text */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleInsertBoldBio}
                      title="Bôi đen chữ rồi bấm để in đậm (hoặc chèn **in đậm**)"
                      className="px-2 py-0.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 cursor-pointer transition flex items-center gap-0.5 shadow-2xs"
                    >
                      <span className="font-extrabold font-serif">B</span>
                      <span className="text-[10px] text-slate-500 font-normal">In đậm</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertLinkBio}
                      title="Bôi đen chữ rồi bấm để chèn link liên kết [Tên](url)"
                      className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-blue-700 rounded border border-slate-300 cursor-pointer transition flex items-center gap-1 shadow-2xs"
                    >
                      <LinkIcon className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-medium">Chèn Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertItalicBio}
                      title="In nghiêng chữ đã chọn"
                      className="px-1.5 py-0.5 text-xs italic font-serif bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 cursor-pointer transition shadow-2xs"
                    >
                      I
                    </button>
                  </div>
                </div>

                <textarea
                  ref={bioTextareaRef}
                  rows={3}
                  value={footerConfig.bio || ''}
                  onChange={(e) => onChangeFooterConfig({ ...footerConfig, bio: e.target.value })}
                  placeholder="Nhập giới thiệu... Bôi đen chữ rồi bấm [In đậm] hoặc [Chèn Link]!"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500 resize-none text-slate-700 font-sans"
                />

                {/* Khung xem trước trực tiếp khi Bio có định dạng hoặc xuống dòng */}
                {footerConfig.bio && (footerConfig.bio.includes('*') || footerConfig.bio.includes('[') || footerConfig.bio.includes('<') || footerConfig.bio.includes('\n')) && (
                  <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-500 mb-0.5">👁️ Xem trước định dạng Bio:</div>
                    <div
                      className="text-[11px] text-slate-700 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: formatRichText(footerConfig.bio, '#2563eb') }}
                    />
                  </div>
                )}

                <div className="mt-1 text-[10px] text-slate-400">
                  💡 Hỗ trợ: phím <code>Enter</code> xuống dòng, <code>**in đậm**</code>, <code>[Tên Link](https://...)</code> hoặc thẻ HTML.
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-amber-700 bg-amber-50/60 p-2 rounded">
              💡 Hiển thị ảnh logo thương hiệu ở đầu chân trang và tự động trỏ về trang chủ.
            </div>
          </div>

          {/* CỘT 2: MENU / LIÊN KẾT 1 (CÓ NÚT SẮP XẾP LÊN/XUỐNG VÀ CHỌN TỪ MENU) */}
          {currentLayout !== 'affiliate-2col' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                    CỘT 2: MENU / LIÊN KẾT 1
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                    {col2Links.length} Links
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tiêu Đề Cột 2
                  </label>
                  <input
                    type="text"
                    value={footerConfig.col2Title || 'Về Chúng Tôi'}
                    onChange={(e) => onChangeFooterConfig({ ...footerConfig, col2Title: e.target.value })}
                    placeholder="Về Chúng Tôi / Sobre Nosotros"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Danh Sách Đường Link Cột 2:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCol2Link}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm link</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {col2Links.map((link, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => handleUpdateCol2Link(idx, 'text', e.target.value)}
                            placeholder="Tên liên kết"
                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium"
                          />
                          {/* Nút Sắp xếp Lên / Xuống & Xóa */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveCol2Link(idx, 'up')}
                              disabled={idx === 0}
                              title="Chuyển lên vị trí trước"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCol2Link(idx, 'down')}
                              disabled={idx === col2Links.length - 1}
                              title="Chuyển xuống vị trí sau"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCol2Link(idx)}
                              disabled={col2Links.length <= 1}
                              title="Xóa link này"
                              className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Ô nhập URL và dropdown chọn từ Menu Header nếu có */}
                        <div className="flex items-center gap-1.5 pl-5">
                          <span className="text-[10px] text-slate-400">🔗</span>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleUpdateCol2Link(idx, 'url', e.target.value)}
                            placeholder="/duong-dan/ hoặc https://..."
                            className="flex-1 px-2 py-0.5 text-[11px] font-mono rounded border border-slate-200 bg-white text-slate-600"
                          />
                          {menuItems.length > 0 && (
                            <select
                              onChange={(e) => {
                                const selected = menuItems.find((m) => m.client_id === e.target.value);
                                if (selected) handlePickFromMenu(2, idx, selected);
                              }}
                              defaultValue=""
                              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 bg-white text-slate-500 max-w-[85px] truncate cursor-pointer"
                              title="Chọn nhanh từ Menu Header có sẵn"
                            >
                              <option value="" disabled>Từ Menu...</option>
                              {menuItems.map((m) => (
                                <option key={m.client_id} value={m.client_id}>
                                  {m.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-indigo-700 bg-indigo-50/60 p-2 rounded">
                💡 Tự động nhận link trên PC & Mobile. Bấm nút ⬆️ / ⬇️ để đảo thứ tự hiển thị.
              </div>
            </div>
          )}

          {/* CỘT 3: DỊCH VỤ / GAME (CÓ NÚT SẮP XẾP LÊN/XUỐNG VÀ CHỌN TỪ MENU) */}
          {currentLayout !== 'affiliate-2col' && currentLayout !== 'magazine-3col' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    CỘT 3: DỊCH VỤ / GAME
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                    {col3Links.length} Links
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tiêu Đề Cột 3
                  </label>
                  <input
                    type="text"
                    value={footerConfig.col3Title || 'Dịch Vụ Chính'}
                    onChange={(e) => onChangeFooterConfig({ ...footerConfig, col3Title: e.target.value })}
                    placeholder="Dịch Vụ Chính / Juegos Populares"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Danh Sách Đường Link Cột 3:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCol3Link}
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm link</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {col3Links.map((link, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => handleUpdateCol3Link(idx, 'text', e.target.value)}
                            placeholder="Tên dịch vụ/game"
                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium"
                          />
                          {/* Nút Sắp xếp Lên / Xuống & Xóa */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveCol3Link(idx, 'up')}
                              disabled={idx === 0}
                              title="Chuyển lên vị trí trước"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCol3Link(idx, 'down')}
                              disabled={idx === col3Links.length - 1}
                              title="Chuyển xuống vị trí sau"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCol3Link(idx)}
                              disabled={col3Links.length <= 1}
                              title="Xóa link này"
                              className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Ô nhập URL và dropdown chọn từ Menu Header nếu có */}
                        <div className="flex items-center gap-1.5 pl-5">
                          <span className="text-[10px] text-slate-400">🔗</span>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleUpdateCol3Link(idx, 'url', e.target.value)}
                            placeholder="#"
                            className="flex-1 px-2 py-0.5 text-[11px] font-mono rounded border border-slate-200 bg-white text-slate-600"
                          />
                          {menuItems.length > 0 && (
                            <select
                              onChange={(e) => {
                                const selected = menuItems.find((m) => m.client_id === e.target.value);
                                if (selected) handlePickFromMenu(3, idx, selected);
                              }}
                              defaultValue=""
                              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 bg-white text-slate-500 max-w-[85px] truncate cursor-pointer"
                              title="Chọn nhanh từ Menu Header có sẵn"
                            >
                              <option value="" disabled>Từ Menu...</option>
                              {menuItems.map((m) => (
                                <option key={m.client_id} value={m.client_id}>
                                  {m.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-emerald-700 bg-emerald-50/60 p-2 rounded">
                💡 Thường dùng cho: Danh sách game Casino, Slots, Lô tô, Khuyến mãi...
              </div>
            </div>
          )}

          {/* CỘT 4: THÔNG TIN LIÊN HỆ */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-600" />
                  {currentLayout === 'affiliate-2col' ? 'CỘT 2: LIÊN HỆ' : currentLayout === 'magazine-3col' ? 'CỘT 3: TÒA SOẠN' : 'CỘT 4: LIÊN HỆ'}
                </span>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded">
                  {currentLayout === 'magazine-3col' ? 'Cột 3 (35%)' : currentLayout === 'affiliate-2col' ? 'Cột 2 (40%)' : 'Cột 4 (25%)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tiêu Đề Cột Liên Hệ
                </label>
                <input
                  type="text"
                  value={footerConfig.col4Title || 'Liên Hệ Nhanh'}
                  onChange={(e) => onChangeFooterConfig({ ...footerConfig, col4Title: e.target.value })}
                  placeholder="Liên Hệ Nhanh / Contacto Rápido"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  Hotline / Số Điện Thoại
                </label>
                <input
                  type="text"
                  value={footerConfig.hotline || ''}
                  onChange={(e) => onChangeFooterConfig({ ...footerConfig, hotline: e.target.value })}
                  placeholder="0988.xxx.xxx hoặc +52 55..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  Email Hỗ Trợ
                </label>
                <input
                  type="email"
                  value={footerConfig.email || ''}
                  onChange={(e) => onChangeFooterConfig({ ...footerConfig, email: e.target.value })}
                  placeholder="lienhe@domain.com"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  Địa Chỉ Trụ Sở
                </label>
                <input
                  type="text"
                  value={footerConfig.address || ''}
                  onChange={(e) => onChangeFooterConfig({ ...footerConfig, address: e.target.value })}
                  placeholder="Hà Nội, Việt Nam / CDMX, México"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500"
                />
              </div>

              {/* 1. THỜI GIAN LÀM VIỆC (CHỈ HIỂN THỊ KHI BẬT, CÓ NÚT XÓA) */}
              {isWorkingHoursActive && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Thời Gian / Giờ Làm Việc
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveWorkingHours}
                      title="Xóa mục giờ làm việc này"
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerConfig.col4WorkingHours || ''}
                    onChange={(e) => onChangeFooterConfig({ ...footerConfig, col4WorkingHours: e.target.value })}
                    placeholder="Ví dụ: 24/7 (Cả ngày lễ) hoặc 08:00 - 22:00"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-blue-500"
                  />
                </div>
              )}

              {/* 2. NÚT / LINK HỖ TRỢ NHANH (CHỈ HIỂN THỊ KHI BẬT, CÓ NÚT XÓA) */}
              {isActionBtnActive && (
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      Nút / Link Hỗ Trợ Nhanh (Telegram / WhatsApp / Live Chat)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveActionBtn}
                      title="Xóa nút bấm này"
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Tên nút bấm</label>
                      <input
                        type="text"
                        value={footerConfig.col4LinkText || ''}
                        onChange={(e) => onChangeFooterConfig({ ...footerConfig, col4LinkText: e.target.value })}
                        placeholder="Chat Trực Tuyến 24/7 / Kênh Telegram"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Đường dẫn URL</label>
                      <input
                        type="text"
                        value={footerConfig.col4LinkUrl || ''}
                        onChange={(e) => onChangeFooterConfig({ ...footerConfig, col4LinkUrl: e.target.value })}
                        placeholder="https://t.me/... hoặc https://wa.me/..."
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. THÔNG TIN BỔ SUNG / GHI CHÚ / GIẤY PHÉP (CHỈ HIỂN THỊ KHI BẬT, CÓ NÚT XÓA) */}
              {isExtraInfoActive && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-500" />
                      Thông Tin Bổ Sung / Ghi Chú / Giấy Phép
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveExtraInfo}
                      title="Xóa thông tin bổ sung này"
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerConfig.col4ExtraInfo || ''}
                    onChange={(e) => onChangeFooterConfig({ ...footerConfig, col4ExtraInfo: e.target.value })}
                    placeholder="Ví dụ: Licencia SEGOB No. 1234 / Mã số thuế / Phản hồi 30s"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-blue-500"
                  />
                </div>
              )}

              {/* 4. DANH SÁCH LINK BỔ SUNG CỘT 4 (CHỈ HIỂN THỊ KHI BẬT, CÓ THỂ THÊM/XÓA) */}
              {isCustomLinksActive && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      Danh Sách Đường Link Khác Ở Cột 4:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddCol4Link}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm link</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCustomLinks}
                        title="Đóng và xóa toàn bộ link Cột 4"
                        className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {col4Links.map((link, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => handleUpdateCol4Link(idx, 'text', e.target.value)}
                            placeholder="Tiêu đề (Ví dụ: Autora: Nguyen Leo hoặc Tác giả: Tên)"
                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium"
                          />
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveCol4Link(idx, 'up')}
                              disabled={idx === 0}
                              title="Chuyển lên vị trí trước"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCol4Link(idx, 'down')}
                              disabled={idx === col4Links.length - 1}
                              title="Chuyển xuống vị trí sau"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCol4Link(idx)}
                              title="Xóa link này"
                              className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pl-5">
                          <span className="text-[10px] text-slate-400">🔗</span>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleUpdateCol4Link(idx, 'url', e.target.value)}
                            placeholder="https://... hoặc /tac-gia/..."
                            className="flex-1 px-2 py-0.5 text-[11px] font-mono rounded border border-slate-200 bg-white text-slate-600"
                          />
                          {menuItems.length > 0 && (
                            <select
                              onChange={(e) => {
                                const selected = menuItems.find((m) => m.client_id === e.target.value);
                                if (selected) handlePickFromMenu(4, idx, selected);
                              }}
                              defaultValue=""
                              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 bg-white text-slate-500 max-w-[85px] truncate cursor-pointer"
                              title="Chọn nhanh từ Menu Header có sẵn"
                            >
                              <option value="" disabled>Từ Menu...</option>
                              {menuItems.map((m) => (
                                <option key={m.client_id} value={m.client_id}>
                                  {m.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200 mt-2 flex items-start gap-1.5">
                    <span className="shrink-0 text-xs">💡</span>
                    <span>
                      Nhập theo định dạng <strong>"Nhãn: Tên"</strong> (ví dụ: <code>Autora: Nguyen Leo</code> hoặc <code>Tác giả: Nguyễn Văn A</code>) để hệ thống tự động in đậm chữ <strong>Autora:</strong> và tạo đường link gạch chân nổi bật, liền mạch ngay bên dưới phần Địa chỉ!
                    </span>
                  </div>
                </div>
              )}

              {/* 5. CÁC NÚT BẤM ĐỂ THÊM TÙY CHỌN (KHÔNG BẮT BUỘC, NGƯỜI DÙNG THÍCH MỤC NÀO THÌ BẤM THÊM MỤC ĐÓ) */}
              {(!isWorkingHoursActive || !isActionBtnActive || !isExtraInfoActive || !isCustomLinksActive) && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    + Thêm thông tin / liên kết tùy chọn:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {!isActionBtnActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionBtn(true);
                          onChangeFooterConfig({
                            ...footerConfig,
                            col4LinkText: footerConfig.col4LinkText || 'Chat Hỗ Trợ 24/7',
                            col4LinkUrl: footerConfig.col4LinkUrl || 'https://t.me/...',
                          });
                        }}
                        className="text-[11px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md flex items-center gap-1 border border-amber-200 font-medium transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-600" />
                        <span>Nút Chat / Link nhanh</span>
                      </button>
                    )}

                    {!isWorkingHoursActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowWorkingHours(true);
                          onChangeFooterConfig({
                            ...footerConfig,
                            col4WorkingHours: footerConfig.col4WorkingHours || '24/7 (Cả ngày lễ)',
                          });
                        }}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 border border-slate-200 font-medium transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>Giờ làm việc</span>
                      </button>
                    )}

                    {!isExtraInfoActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowExtraInfo(true);
                          onChangeFooterConfig({
                            ...footerConfig,
                            col4ExtraInfo: footerConfig.col4ExtraInfo || 'Hỗ trợ khách hàng trực tuyến 24/7',
                          });
                        }}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 border border-slate-200 font-medium transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>Ghi chú / Giấy phép</span>
                      </button>
                    )}

                    {!isCustomLinksActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomLinks(true);
                          if (!footerConfig.col4Links || footerConfig.col4Links.length === 0) {
                            onChangeFooterConfig({
                              ...footerConfig,
                              col4Links: [{ text: 'Kênh hỗ trợ', url: '#' }],
                            });
                          }
                        }}
                        className="text-[11px] px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-md flex items-center gap-1 border border-rose-200 font-medium transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-rose-600" />
                        <span>Danh sách liên kết</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-rose-700 bg-rose-50/60 p-2 rounded">
              💡 Hiển thị kênh liên lạc trực tiếp, hotline, link chat 24/7 và thông tin bổ sung.
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN COPYRIGHT CUỐI TRANG */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
          Dòng Bản Quyền Cuối Chân Trang:
        </label>
        <input
          type="text"
          value={footerConfig.copyrightText || ''}
          onChange={(e) => onChangeFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
          placeholder={`© ${new Date().getFullYear()} ${footerConfig.brandName || 'Website'}. Mọi quyền được bảo lưu.`}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-500"
        />
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-3">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          ❮ Quay lại Bước 3 (Trang Chủ)
        </button>

        <div className="flex items-center gap-2">
          {/* NÚT ÁP DỤNG TRỰC TIẾP LÊN WEB Ở THANH DƯỚI */}
          <button
            type="button"
            onClick={handleApplyToWebNow}
            disabled={isDeploying}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang áp dụng Footer...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>🚀 Áp Dụng Lên Web Ngay</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Tiếp tục: Bước 5 (Trang SEO & Bài Viết) ❯</span>
          </button>
        </div>
      </div>

      {/* MODAL CHỌN ẢNH TỪ MEDIA WORDPRESS CHO LOGO */}
      <WpMediaPickerModal
        isOpen={isLogoMediaPickerOpen}
        onClose={() => setIsLogoMediaPickerOpen(false)}
        currentSite={currentSite}
        title="Chọn Logo Thương Hiệu từ Thư Viện Media"
        selectedMediaId={footerConfig.logoId}
        onSelect={(media) => {
          onChangeFooterConfig({
            ...footerConfig,
            logoType: 'image',
            logoUrl: media.url,
            logoId: media.id,
          });
          setIsLogoMediaPickerOpen(false);
        }}
      />

      {/* MODAL CHỌN ẢNH TỪ MEDIA WORDPRESS CHO BACKGROUND */}
      <WpMediaPickerModal
        isOpen={isBgMediaPickerOpen}
        onClose={() => setIsBgMediaPickerOpen(false)}
        currentSite={currentSite}
        title="Chọn Ảnh Nền Footer từ Thư Viện Media"
        selectedMediaId={footerConfig.bgImageId}
        onSelect={(media) => {
          onChangeFooterConfig({
            ...footerConfig,
            bgType: 'image',
            bgImage: media.url,
            bgImageId: media.id,
          });
          setIsBgMediaPickerOpen(false);
        }}
      />
    </div>
  );
};
