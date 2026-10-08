import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  CornerUpLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  Sparkles,
  Link as LinkIcon,
  FileText,
  FileEdit,
  Folder,
  Layers,
  RefreshCw,
  Home,
  Check,
  ChevronRight,
  Send,
  Palette,
  Code2,
  Paintbrush,
  Sliders,
  RotateCcw,
  Smartphone,
  Monitor,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { ConnectedSite, MenuItem, MenuData, MenuStylingConfig } from '../../types';
import { api } from '../../services/api';

interface StepMenuManagerProps {
  currentSite?: ConnectedSite | null;
  onRefreshInspect?: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onMenuChange?: (items: MenuItem[]) => void;
  onStylingChange?: (styling: MenuStylingConfig) => void;
}

// Hàm làm sạch chuỗi loại bỏ hoàn toàn dấu tiếng Việt và chuẩn hóa
const cleanText = (str: any): string => {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ toàn bộ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .trim();
};

const cleanUrl = (u: any): string => {
  return (u || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '') // Loại bỏ hash (#) và query string
    .replace(/\/+$/, '')
    .trim();
};

// Kiểm tra xem một trang WordPress có phải là Trang Chủ không
const isHomePage = (p: any, siteUrl?: string): boolean => {
  if (!p) return false;
  if (p.is_front_page === true || p.is_home === true) return true;

  const t = cleanText(p.title);
  const homeTitles = [
    'trang chu',
    'home',
    'inicio',
    'pagina de inicio',
    'homepage',
    'front page',
    'frontpage',
  ];
  if (homeTitles.includes(t)) return true;

  const s = cleanText(p.slug).replace(/^\/+|\/+$/g, '');
  if (s === '' || s === 'home' || s === 'trang-chu' || s === 'trang chu' || s === 'inicio') return true;

  const pUrl = cleanUrl(p.url);
  const sUrl = cleanUrl(siteUrl);

  if (pUrl === '' || pUrl === '/' || (sUrl && pUrl === sUrl)) return true;

  return false;
};

// Kiểm tra xem một MenuItem có phải là Trang Chủ không
export const isHomeItem = (item: any, siteUrl?: string): boolean => {
  if (!item) return false;
  if (
    item.client_id === 'default_home' ||
    item.client_id === 'item_home' ||
    Boolean(item.client_id?.startsWith('home_'))
  ) {
    return true;
  }

  const t = cleanText(item.title);
  const homeTitles = [
    'trang chu',
    'home',
    'inicio',
    'pagina de inicio',
    'homepage',
    'front page',
    'frontpage',
  ];
  if (homeTitles.includes(t)) return true;

  const rawSlug = (item.slug || '').toString().trim().replace(/^\/+|\/+$/g, '');
  if (rawSlug !== '') {
    const s = cleanText(rawSlug);
    if (s === 'home' || s === 'trang-chu' || s === 'trang chu' || s === 'inicio') return true;
  }

  const rawUrl = (item.url || '').toString().trim();
  const cleanSiteUrl = siteUrl ? siteUrl.replace(/\/+$/, '') : '';
  if (rawUrl === '/' || (cleanSiteUrl !== '' && (rawUrl === cleanSiteUrl || rawUrl === cleanSiteUrl + '/'))) {
    return true;
  }

  const iUrl = cleanUrl(rawUrl);
  const sUrl = cleanUrl(siteUrl);

  if (iUrl !== '' && sUrl !== '' && iUrl === sUrl) return true;

  return false;
};

// Tự động gom gọn: chỉ giữ DUY NHẤT 1 Trang Chủ và luôn neo cố định ở vị trí đầu tiên (#1)
export const consolidateAndPinHome = (items: MenuItem[], siteUrl?: string): MenuItem[] => {
  const cleanSiteUrl = siteUrl ? siteUrl.replace(/\/+$/, '') + '/' : '/';

  // Lọc ra tất cả các mục khớp là Trang Chủ
  const homeItems = (items || []).filter((i) => isHomeItem(i, siteUrl));
  // Lọc ra tất cả các mục KHÔNG phải là Trang Chủ
  const otherItems = (items || []).filter((i) => !isHomeItem(i, siteUrl));

  let homeItem: MenuItem;
  if (homeItems.length > 0) {
    homeItem = {
      ...homeItems[0],
      title: 'Trang Chủ',
      url: cleanSiteUrl,
      type: 'custom',
      object: 'custom',
      order: 1,
      parent_client_id: null, // Không bao giờ là sub-item
    };
  } else {
    homeItem = {
      client_id: `home_${Date.now()}`,
      title: 'Trang Chủ',
      url: cleanSiteUrl,
      type: 'custom',
      object: 'custom',
      order: 1,
      parent_client_id: null,
    };
  }

  // Deduplicate other items: LOẠI BỎ TRIỆT ĐỂ BẤT KỲ MỤC NÀO TRÙNG LẶP HOẶC LÀ TRANG CHỦ
  const seenUrls = new Set<string>();
  const seenObjIds = new Set<string>();
  const seenTitles = new Set<string>();

  seenUrls.add(cleanUrl(cleanSiteUrl));
  seenUrls.add('/');
  seenUrls.add('');
  seenTitles.add('trang chu');
  seenTitles.add('home');
  seenTitles.add('inicio');

  const deduplicatedOthers: MenuItem[] = [];
  for (const item of otherItems) {
    if (isHomeItem(item, siteUrl)) {
      continue;
    }

    const itemUrl = cleanUrl(item.url);
    const objKey = item.object && item.object_id ? `${item.object}_${item.object_id}` : null;
    const titleKey = cleanText(item.title);

    if (itemUrl && seenUrls.has(itemUrl)) {
      continue;
    }
    if (objKey && seenObjIds.has(objKey)) {
      continue;
    }
    if (titleKey && seenTitles.has(titleKey)) {
      continue;
    }

    if (itemUrl) seenUrls.add(itemUrl);
    if (objKey) seenObjIds.add(objKey);
    if (titleKey) seenTitles.add(titleKey);
    deduplicatedOthers.push(item);
  }

  const reorderedOthers = deduplicatedOthers.map((item, idx) => ({
    ...item,
    order: idx + 2,
    parent_client_id:
      item.parent_client_id && homeItems.some((h) => h.client_id === item.parent_client_id)
        ? null
        : item.parent_client_id,
  }));

  return [homeItem, ...reorderedOthers];
};

export const StepMenuManager: React.FC<StepMenuManagerProps> = ({
  currentSite,
  onRefreshInspect,
  onNextStep,
  onPrevStep,
  onMenuChange,
  onStylingChange,
}) => {
  // Menu Configuration State
  const [menuName, setMenuName] = useState('Main Menu');
  const [menuId, setMenuId] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<string[]>(['primary', 'primary_mobile']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (currentSite?.siteUrl) {
      try {
        const cached = localStorage.getItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return consolidateAndPinHome(parsed, currentSite.siteUrl);
          }
        }
      } catch (_) {}
    }
    return [];
  });

  // Menu Styling & Gradient State
  const defaultMenuStyling: MenuStylingConfig = {
    bgType: 'gradient',
    bgColor: '#1e293b',
    gradientColor1: '#0f172a',
    gradientColor2: '#2563eb',
    gradientAngle: '135deg',
    textColor: '#ffffff',
    textHoverColor: '#38bdf8',
    itemHoverBg: 'rgba(255, 255, 255, 0.12)',
    fontSize: '13px',
    fontWeight: '600',
    isUppercase: true,
    itemRadius: '6px',
    dropdownBg: '#0f172a',
    dropdownTextColor: '#f8fafc',
    dropdownHoverBg: 'rgba(255, 255, 255, 0.08)',
    // Borders
    borderStyle: 'solid',
    borderTopWidth: '0px',
    borderTopColor: '#3b82f6',
    borderBottomWidth: '1px',
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftWidth: '0px',
    borderLeftColor: '#3b82f6',
    borderRightWidth: '0px',
    borderRightColor: '#3b82f6',
    customCss: '',
    // Mobile Off-canvas Drawer
    mobileDrawerTheme: 'dark',
    mobileBgColor: '#0f172a',
    mobileTextColor: '#f8fafc',
    mobileTextHoverColor: '#38bdf8',
    mobileHoverBg: 'rgba(255, 255, 255, 0.08)',
    mobileDividerColor: 'rgba(255, 255, 255, 0.08)',
    mobileSubmenuBg: '#1e293b',
    mobileSubmenuTextColor: '#94a3b8',
    mobileFontSize: '14px',
    mobileShowSearch: false,
    mobileShowSocial: false,
    mobileHideWooNotice: true,
    mobileShowNewsletter: false,
    cleanMobileNavOnly: false,
    mobileIconColor: '#ffffff',
    mobileIconHoverColor: '#38bdf8',
    mobileIconBgColor: 'transparent',
  };

  const [menuStyling, setMenuStyling] = useState<MenuStylingConfig>(defaultMenuStyling);
  const [rightTab, setRightTab] = useState<'structure' | 'styling' | 'custom_css'>('structure');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Gradient & Styling Presets
  const gradientPresets = [
    {
      name: 'Đại Dương Huyền Bí',
      desc: 'Navy Xanh Thẳm',
      bgType: 'gradient' as const,
      gradientColor1: '#0f172a',
      gradientColor2: '#1d4ed8',
      gradientAngle: '135deg',
      textColor: '#ffffff',
      textHoverColor: '#38bdf8',
      itemHoverBg: 'rgba(255, 255, 255, 0.14)',
      dropdownBg: '#0f172a',
      dropdownTextColor: '#f8fafc',
      dropdownHoverBg: '#1e293b',
      borderBottomWidth: '1px',
      borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    },
    {
      name: 'Hoàng Hôn Rực Lửa',
      desc: 'Cam Đỏ Cháy',
      bgType: 'gradient' as const,
      gradientColor1: '#7c2d12',
      gradientColor2: '#ea580c',
      gradientAngle: '90deg',
      textColor: '#ffffff',
      textHoverColor: '#fef08a',
      itemHoverBg: 'rgba(255, 255, 255, 0.15)',
      dropdownBg: '#431407',
      dropdownTextColor: '#ffedd5',
      dropdownHoverBg: '#7c2d12',
      borderBottomWidth: '2px',
      borderBottomColor: '#ea580c',
    },
    {
      name: 'Ngọc Lục Bảo Sang',
      desc: 'Emerald Luxury',
      bgType: 'gradient' as const,
      gradientColor1: '#064e3b',
      gradientColor2: '#059669',
      gradientAngle: '120deg',
      textColor: '#ffffff',
      textHoverColor: '#a7f3d0',
      itemHoverBg: 'rgba(255, 255, 255, 0.12)',
      dropdownBg: '#022c22',
      dropdownTextColor: '#ecfdf5',
      dropdownHoverBg: '#064e3b',
      borderBottomWidth: '1px',
      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    {
      name: 'Tím Hoàng Gia',
      desc: 'Royal Purple',
      bgType: 'gradient' as const,
      gradientColor1: '#3b0764',
      gradientColor2: '#7c3aed',
      gradientAngle: '135deg',
      textColor: '#ffffff',
      textHoverColor: '#fbcfe8',
      itemHoverBg: 'rgba(255, 255, 255, 0.14)',
      dropdownBg: '#2e1065',
      dropdownTextColor: '#faf5ff',
      dropdownHoverBg: '#4c1d95',
      borderBottomWidth: '1px',
      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    {
      name: 'Vàng Đen Đẳng Cấp',
      desc: 'Midnight Gold',
      bgType: 'gradient' as const,
      gradientColor1: '#18181b',
      gradientColor2: '#451a03',
      gradientAngle: '90deg',
      textColor: '#fbbf24',
      textHoverColor: '#ffffff',
      itemHoverBg: 'rgba(251, 191, 36, 0.15)',
      dropdownBg: '#18181b',
      dropdownTextColor: '#fef3c7',
      dropdownHoverBg: '#27272a',
      borderBottomWidth: '2px',
      borderBottomColor: '#fbbf24',
    },
    {
      name: 'Sáng Tối Giản',
      desc: 'Clean White',
      bgType: 'solid' as const,
      bgColor: '#ffffff',
      textColor: '#1e293b',
      textHoverColor: '#2563eb',
      itemHoverBg: 'rgba(37, 99, 235, 0.08)',
      dropdownBg: '#ffffff',
      dropdownTextColor: '#1e293b',
      dropdownHoverBg: '#f8fafc',
      borderBottomWidth: '1px',
      borderBottomColor: '#e2e8f0',
    },
  ];

  const mobilePresets = [
    {
      id: 'dark',
      name: 'Dark Luxury Navy (Khuyên Dùng)',
      desc: 'Nền tối sang trọng, tương phản cao, chữ sáng nổi bật',
      tag: 'Khắc phục chìm chữ',
      mobileDrawerTheme: 'dark' as const,
      mobileBgColor: '#0f172a',
      mobileTextColor: '#f8fafc',
      mobileTextHoverColor: '#38bdf8',
      mobileHoverBg: 'rgba(255, 255, 255, 0.08)',
      mobileDividerColor: 'rgba(255, 255, 255, 0.08)',
      mobileSubmenuBg: '#1e293b',
      mobileSubmenuTextColor: '#94a3b8',
      mobileIconColor: '#ffffff',
      mobileIconHoverColor: '#38bdf8',
    },
    {
      id: 'light',
      name: 'Light Clean (Trắng Tinh Tế)',
      desc: 'Nền trắng sạch sẽ, chữ đen xám tương phản tốt',
      tag: 'Tối giản',
      mobileDrawerTheme: 'light' as const,
      mobileBgColor: '#ffffff',
      mobileTextColor: '#0f172a',
      mobileTextHoverColor: '#2563eb',
      mobileHoverBg: 'rgba(0, 0, 0, 0.04)',
      mobileDividerColor: '#e2e8f0',
      mobileSubmenuBg: '#f8fafc',
      mobileSubmenuTextColor: '#475569',
      mobileIconColor: '#1e293b',
      mobileIconHoverColor: '#2563eb',
    },
    {
      id: 'match_desktop',
      name: 'Đồng Bộ Header Desktop',
      desc: 'Kế thừa tự động màu nền & màu chữ từ máy tính',
      tag: 'Đồng điệu',
      mobileDrawerTheme: 'match_desktop' as const,
      mobileBgColor: menuStyling.bgType === 'solid' ? menuStyling.bgColor : menuStyling.gradientColor1,
      mobileTextColor: menuStyling.textColor,
      mobileTextHoverColor: menuStyling.textHoverColor,
      mobileHoverBg: menuStyling.itemHoverBg,
      mobileDividerColor: 'rgba(255, 255, 255, 0.1)',
      mobileSubmenuBg: menuStyling.dropdownBg,
      mobileSubmenuTextColor: menuStyling.dropdownTextColor,
      mobileIconColor: menuStyling.textColor || '#ffffff',
      mobileIconHoverColor: menuStyling.textHoverColor || '#38bdf8',
    },
  ];

  const handleUpdateStyling = (patch: Partial<MenuStylingConfig>) => {
    const updated = { ...menuStyling, ...patch };
    setMenuStyling(updated);
    if (onStylingChange) {
      onStylingChange(updated);
    }
  };

  const handleApplyPreset = (preset: (typeof gradientPresets)[0]) => {
    const patch: Partial<MenuStylingConfig> = {
      bgType: preset.bgType,
      textColor: preset.textColor,
      textHoverColor: preset.textHoverColor,
      itemHoverBg: preset.itemHoverBg,
      dropdownBg: preset.dropdownBg,
      dropdownTextColor: preset.dropdownTextColor,
      dropdownHoverBg: preset.dropdownHoverBg,
    };
    if (preset.bgType === 'gradient') {
      patch.gradientColor1 = preset.gradientColor1;
      patch.gradientColor2 = preset.gradientColor2;
      patch.gradientAngle = preset.gradientAngle;
    } else if (preset.bgColor) {
      patch.bgColor = preset.bgColor;
    }
    if (preset.borderBottomWidth !== undefined) {
      patch.borderBottomWidth = preset.borderBottomWidth;
      patch.borderBottomColor = preset.borderBottomColor;
    }
    handleUpdateStyling(patch);
  };

  // WordPress Content for adding
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  // Selection state for checkboxes
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // Custom link inputs
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customNewTab, setCustomNewTab] = useState(false);

  // Search filters
  const [pageSearch, setPageSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');

  // Active accordion on the left
  const [activeTab, setActiveTab] = useState<'pages' | 'categories' | 'posts' | 'custom'>('pages');

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to parent on change if needed & tự động cache vào localStorage
  useEffect(() => {
    if (onMenuChange) {
      onMenuChange(menuItems);
    }
    if (currentSite?.siteUrl && menuItems.length > 0) {
      try {
        localStorage.setItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`, JSON.stringify(menuItems));
      } catch (_) {}
    }
  }, [menuItems, onMenuChange, currentSite?.siteUrl]);

  // Tự động rà soát và loại bỏ ngay lập tức nếu có bất kỳ Trang Chủ thừa nào trong state
  useEffect(() => {
    if (menuItems.length > 0) {
      const homeMatches = menuItems.filter((i) => isHomeItem(i, currentSite?.siteUrl));
      if (
        homeMatches.length > 1 ||
        menuItems[0]?.order !== 1 ||
        !isHomeItem(menuItems[0], currentSite?.siteUrl)
      ) {
        setMenuItems((prev) => consolidateAndPinHome(prev, currentSite?.siteUrl));
      }
    }
  }, [menuItems, currentSite?.siteUrl]);

  // Load menu and content when site connects
  useEffect(() => {
    if (currentSite) {
      loadInitialData();
    }
  }, [currentSite?.siteUrl]);

  const loadInitialData = async () => {
    if (!currentSite) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Tải danh sách menu từ WordPress
      const menuRes = await api.getMenu(currentSite).catch(() => null);
      if (menuRes?.selected_menu) {
        setMenuName(menuRes.selected_menu.name || 'Main Menu');
        setMenuId(menuRes.selected_menu.id);
        if (menuRes.selected_menu.locations?.length > 0) {
          setLocations(menuRes.selected_menu.locations.filter((l: string) => l !== 'footer'));
        }
        if (Array.isArray(menuRes.selected_menu.items) && menuRes.selected_menu.items.length > 0) {
          const consolidated = consolidateAndPinHome(menuRes.selected_menu.items, currentSite.siteUrl);
          setMenuItems(consolidated);
          try {
            localStorage.setItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`, JSON.stringify(consolidated));
          } catch (_) {}
        } else {
          // Kiểm tra xem localStorage có bản lưu không
          let restored = false;
          try {
            const cached = localStorage.getItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMenuItems(consolidateAndPinHome(parsed, currentSite.siteUrl));
                restored = true;
              }
            }
          } catch (_) {}
          if (!restored) {
            setMenuItems(consolidateAndPinHome([], currentSite.siteUrl));
          }
        }
      } else {
        let restored = false;
        try {
          const cached = localStorage.getItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMenuItems(consolidateAndPinHome(parsed, currentSite.siteUrl));
              restored = true;
            }
          }
        } catch (_) {}
        if (!restored) {
          setMenuItems(consolidateAndPinHome([], currentSite.siteUrl));
        }
      }

      // Nạp cấu hình màu sắc styling đã lưu từ WordPress
      if (menuRes?.styling && typeof menuRes.styling === 'object') {
        const loadedStyling = { ...defaultMenuStyling, ...menuRes.styling };
        setMenuStyling(loadedStyling);
        if (onStylingChange) {
          onStylingChange(loadedStyling);
        }
      } else {
        if (onStylingChange) {
          onStylingChange(defaultMenuStyling);
        }
      }

      // 2. Tải danh sách Trang, Chuyên mục, Bài viết từ WordPress
      const contentRes = await api.listContent(currentSite, { type: 'all' }).catch(() => null);
      if (contentRes?.items) {
        // Loại bỏ hoàn toàn Trang Chủ khỏi danh sách Trang (vì Trang Chủ đã neo cố định ở #1 của Menu)
        const pList = contentRes.items
          .filter((i: any) => i.type === 'page')
          .filter((p: any) => !isHomePage(p, currentSite.siteUrl));
        const cList = contentRes.items.filter((i: any) => i.type === 'category');
        const postList = contentRes.items.filter((i: any) => i.type === 'post');
        setPages(pList);
        setCategories(cList);
        setPosts(postList);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tải thông tin Menu từ WordPress');
    } finally {
      setIsLoading(false);
    }
  };

  // Add selected Pages to Menu
  const handleAddSelectedPages = () => {
    const toAdd = pages
      .filter((p) => selectedPages.includes(p.id))
      .filter((p) => !isHomePage(p, currentSite?.siteUrl));

    if (toAdd.length === 0) {
      if (selectedPages.length > 0) {
        alert('Trang bạn chọn là Trang Chủ, đã được neo cố định ở vị trí đầu tiên (#1) của Menu rồi!');
        setSelectedPages([]);
      }
      return;
    }

    const newItems: MenuItem[] = toAdd.map((p, idx) => ({
      client_id: `page_${p.id}_${Date.now()}_${idx}`,
      title: p.title || 'Trang',
      url: p.slug === '/' ? '/' : p.url || `/${p.slug.replace(/^\//, '')}`,
      slug: p.slug,
      type: 'post_type',
      object: 'page',
      object_id: p.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));

    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
    setSelectedPages([]);
  };

  // Add selected Categories to Menu
  const handleAddSelectedCats = () => {
    const toAdd = categories.filter((c) => selectedCats.includes(c.id));
    if (toAdd.length === 0) return;

    const newItems: MenuItem[] = toAdd.map((c, idx) => ({
      client_id: `cat_${c.id}_${Date.now()}_${idx}`,
      title: c.title || 'Chuyên mục',
      url: c.url || `/category${c.slug}`,
      slug: c.slug,
      type: 'taxonomy',
      object: 'category',
      object_id: c.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));

    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
    setSelectedCats([]);
  };

  // Add selected Posts to Menu
  const handleAddSelectedPosts = () => {
    const toAdd = posts.filter((p) => selectedPosts.includes(p.id));
    if (toAdd.length === 0) return;

    const newItems: MenuItem[] = toAdd.map((p, idx) => ({
      client_id: `post_${p.id}_${Date.now()}_${idx}`,
      title: p.title || 'Bài viết',
      url: p.url || `/${p.slug.replace(/^\//, '')}`,
      slug: p.slug,
      type: 'post_type',
      object: 'post',
      object_id: p.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));

    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
    setSelectedPosts([]);
  };

  // Add Custom Link to Menu
  const handleAddCustomLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTitle.trim()) return;

    const normTitle = customTitle.trim().toLowerCase();
    const normUrl = customUrl.trim().toLowerCase().replace(/\/+$/, '');
    const cleanSiteUrl = (currentSite?.siteUrl || '').trim().toLowerCase().replace(/\/+$/, '');

    if (
      normTitle === 'trang chủ' ||
      normTitle === 'home' ||
      normUrl === '/' ||
      normUrl === '' ||
      normUrl === cleanSiteUrl
    ) {
      alert('Trang Chủ đã được neo cố định ở vị trí đầu tiên của Menu rồi!');
      return;
    }

    const newItem: MenuItem = {
      client_id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      url: customUrl.trim() || '/',
      type: 'custom',
      object: 'custom',
      target: customNewTab ? '_blank' : '',
      parent_client_id: null,
      order: menuItems.length + 1,
    };

    setMenuItems((prev) => consolidateAndPinHome([...prev, newItem], currentSite?.siteUrl));
    setCustomTitle('');
    setCustomUrl('');
    setCustomNewTab(false);
  };

  // Quick Preset: Add Home
  const handleAddHome = () => {
    setMenuItems((prev) => consolidateAndPinHome(prev, currentSite?.siteUrl));
    alert('Trang Chủ đã được neo cố định ở vị trí đầu tiên (#1) của Menu!');
  };

  // Quick Preset: Add All Pages
  const handleAddAllPages = () => {
    if (pages.length === 0) return;
    const existingObjIds = new Set(
      menuItems.filter((i) => i.object === 'page').map((i) => i.object_id)
    );
    // Lọc bỏ các trang đã có VÀ loại bỏ trang chủ (vì Trang Chủ đã được neo sẵn ở đầu)
    const toAdd = pages
      .filter((p) => !existingObjIds.has(p.id))
      .filter((p) => !isHomePage(p, currentSite?.siteUrl));

    if (toAdd.length === 0) {
      alert('Tất cả các trang khác đã có trong Menu rồi! (Trang Chủ đã được neo sẵn ở đầu)');
      return;
    }

    const newItems: MenuItem[] = toAdd.map((p, idx) => ({
      client_id: `page_${p.id}_${Date.now()}_${idx}`,
      title: p.title || 'Trang',
      url: p.slug === '/' ? '/' : p.url || `/${p.slug.replace(/^\//, '')}`,
      slug: p.slug,
      type: 'post_type',
      object: 'page',
      object_id: p.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));
    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
  };

  // Quick Preset: Add All Categories
  const handleAddAllCats = () => {
    if (categories.length === 0) return;
    const existingObjIds = new Set(
      menuItems.filter((i) => i.object === 'category').map((i) => i.object_id)
    );
    const toAdd = categories.filter((c) => !existingObjIds.has(c.id));
    if (toAdd.length === 0) {
      alert('Tất cả các chuyên mục đã có trong Menu rồi!');
      return;
    }

    const newItems: MenuItem[] = toAdd.map((c, idx) => ({
      client_id: `cat_${c.id}_${Date.now()}_${idx}`,
      title: c.title || 'Chuyên mục',
      url: c.url || `/category${c.slug}`,
      slug: c.slug,
      type: 'taxonomy',
      object: 'category',
      object_id: c.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));
    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
  };

  // Quick Preset: Add All Posts
  const handleAddAllPosts = () => {
    if (posts.length === 0) return;
    const existingObjIds = new Set(
      menuItems.filter((i) => i.object === 'post').map((i) => i.object_id)
    );
    const toAdd = posts.filter((p) => !existingObjIds.has(p.id));
    if (toAdd.length === 0) {
      alert('Tất cả các bài viết đã có trong Menu rồi!');
      return;
    }

    const newItems: MenuItem[] = toAdd.map((p, idx) => ({
      client_id: `post_${p.id}_${Date.now()}_${idx}`,
      title: p.title || 'Bài viết',
      url: p.url || `/${p.slug.replace(/^\//, '')}`,
      slug: p.slug,
      type: 'post_type',
      object: 'post',
      object_id: p.id,
      parent_client_id: null,
      order: menuItems.length + idx + 1,
    }));
    setMenuItems((prev) => consolidateAndPinHome([...prev, ...newItems], currentSite?.siteUrl));
  };

  // Move item up / down (Trang Chủ ở index 0 luôn cố định, không thể bị hoán đổi)
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (index === 0) return; // Trang chủ không di chuyển
    if (index === 1 && direction === 'up') return; // Không thể đưa mục nào lên trên Trang Chủ

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 1 || targetIndex >= menuItems.length) return;

    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index orders
    updated.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setMenuItems(consolidateAndPinHome(updated, currentSite?.siteUrl));
  };

  // Make item a sub-item of previous item (Indent ➡️)
  const makeSubItem = (index: number) => {
    if (index <= 1) return; // Không thể làm sub-item cho Trang Chủ
    const prevItem = menuItems[index - 1];
    const parentId = prevItem.parent_client_id || prevItem.client_id;

    const updated = [...menuItems];
    updated[index] = {
      ...updated[index],
      parent_client_id: parentId,
    };
    setMenuItems(consolidateAndPinHome(updated, currentSite?.siteUrl));
  };

  // Make item a root item (Outdent ⬅️)
  const makeRootItem = (index: number) => {
    const updated = [...menuItems];
    updated[index] = {
      ...updated[index],
      parent_client_id: null,
    };
    setMenuItems(consolidateAndPinHome(updated, currentSite?.siteUrl));
  };

  // Delete item from menu (Trang Chủ không thể bị xóa)
  const removeItem = (index: number) => {
    if (index === 0) {
      alert('Trang Chủ là trang chính luôn được neo cố định ở vị trí đầu tiên (#1) của menu, không thể xóa!');
      return;
    }
    const itemToRemove = menuItems[index];
    // Nếu có mục con đang gắn với mục này, giải phóng mục con ra ngoài
    const updated = menuItems
      .filter((_, idx) => idx !== index)
      .map((item) => {
        if (item.parent_client_id === itemToRemove.client_id) {
          return { ...item, parent_client_id: null };
        }
        return item;
      });

    updated.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setMenuItems(consolidateAndPinHome(updated, currentSite?.siteUrl));
  };

  // Update item label
  const updateItemTitle = (index: number, newTitle: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], title: newTitle };
    setMenuItems(updated);
  };

  // Toggle location checkbox
  const toggleLocation = (loc: string) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  // Save Menu to WordPress
  const handleSaveMenu = async () => {
    if (!currentSite) return;
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSaveSuccess(null);

      const finalItems = consolidateAndPinHome(menuItems, currentSite?.siteUrl);

      const res = await api.saveMenu(currentSite, {
        menu_id: menuId,
        menu_name: menuName.trim() || 'Main Menu',
        locations,
        items: finalItems,
        styling: menuStyling,
      });

      setMenuItems(finalItems);
      if (currentSite?.siteUrl) {
        try {
          localStorage.setItem(`flatsome_menu_${cleanUrl(currentSite.siteUrl)}`, JSON.stringify(finalItems));
        } catch (_) {}
      }

      setSaveSuccess(
        `Đã lưu và đồng bộ Menu "${menuName}" (${menuItems.length} mục) cùng màu sắc, hiệu ứng đổ màu & CSS lên WordPress thành công! Menu đã được cập nhật trực tiếp trên Header Flatsome.`
      );
      if (res?.menu_id) {
        setMenuId(res.menu_id);
      }
      if (onRefreshInspect) {
        onRefreshInspect();
      }
      setTimeout(() => setSaveSuccess(null), 8000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu Menu lên WordPress');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered lists for left panel
  const filteredPages = pages.filter((p) =>
    (p.title || '').toLowerCase().includes(pageSearch.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(pageSearch.toLowerCase())
  );

  const filteredCats = categories.filter((c) =>
    (c.title || '').toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredPosts = posts.filter((p) =>
    (p.title || '').toLowerCase().includes(postSearch.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Title & Deploy Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MenuIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cấu Hình Menu Chính WordPress (Giao diện &gt; Menus)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh mục liên kết hiển thị trên Header Flatsome. Hỗ trợ đầy đủ menu cha/con (Dropdown Submenu), sắp xếp thứ tự và đồng bộ thẳng lên WordPress.
          </p>
        </div>

        {currentSite && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadInitialData}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
              title="Tải lại Menu và Trang từ WordPress"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleSaveMenu}
              disabled={isSaving || menuItems.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Lưu Lên WP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu Menu Lên WordPress</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          {currentSite?.siteUrl && (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={currentSite.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Xem Website <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-emerald-300">|</span>
              <a
                href={`${currentSite.siteUrl.replace(/\/+$/, '')}/wp-admin/nav-menus.php`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Mở WP Menus <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Action Presets */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Thao tác nhanh:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddHome}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" /> Thêm Trang Chủ (/)
          </button>
          <button
            type="button"
            onClick={handleAddAllPages}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" /> Nạp tất cả Trang ({pages.length})
          </button>
          <button
            type="button"
            onClick={handleAddAllCats}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-amber-600" /> Nạp tất cả Chuyên mục ({categories.length})
          </button>
          {posts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllPosts}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5 text-purple-600" /> Nạp tất cả Bài viết ({posts.length})
            </button>
          )}
          {menuItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn làm trống danh sách menu? (Trang Chủ luôn được giữ lại ở vị trí đầu tiên #1)')) {
                  setMenuItems(consolidateAndPinHome([], currentSite?.siteUrl));
                }
              }}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Làm trống menu
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Add items to menu */}
        <div className="md:col-span-5 lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Thêm mục vào menu
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Chọn &amp; bấm Thêm</span>
            </div>

            {/* Accordion Selector Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('pages')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'pages'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Trang ({pages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'posts'
                    ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" /> Bài viết ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'categories'
                    ? 'bg-white text-amber-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> Chuyên mục ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'custom'
                    ? 'bg-white text-slate-800 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Tự tạo
              </button>
            </div>

            {/* Tab 1: Pages */}
            {activeTab === 'pages' && (
              <div className="p-3 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    placeholder="Tìm tên trang hoặc đường dẫn..."
                    className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 border border-slate-100 rounded-lg p-1">
                  {filteredPages.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">
                      {pages.length === 0 ? 'Đang tải danh sách trang...' : 'Không tìm thấy trang phù hợp'}
                    </p>
                  ) : (
                    filteredPages.map((p) => {
                      const isHome = isHomePage(p, currentSite?.siteUrl);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 p-1.5 rounded text-xs transition ${
                            isHome
                              ? 'bg-blue-50/60 text-slate-500 cursor-not-allowed border border-blue-100'
                              : 'hover:bg-blue-50/50 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isHome ? false : selectedPages.includes(p.id)}
                            disabled={isHome}
                            onChange={(e) => {
                              if (isHome) return;
                              if (e.target.checked) {
                                setSelectedPages((prev) => [...prev, p.id]);
                              } else {
                                setSelectedPages((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-0 disabled:opacity-30"
                          />
                          <span className={`font-medium truncate flex-1 ${isHome ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                            {p.title}
                          </span>
                          {isHome ? (
                            <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                              📍 Đã neo ở đầu
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 truncate max-w-24">
                              {p.slug}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const selectableIds = filteredPages
                        .filter((p) => !isHomePage(p, currentSite?.siteUrl))
                        .map((p) => p.id);
                      if (selectedPages.length === selectableIds.length) {
                        setSelectedPages([]);
                      } else {
                        setSelectedPages(selectableIds);
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 cursor-pointer"
                  >
                    {selectedPages.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedPages}
                    disabled={selectedPages.length === 0}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm vào menu ({selectedPages.length})
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Posts */}
            {activeTab === 'posts' && (
              <div className="p-3 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    placeholder="Tìm tiêu đề bài viết hoặc slug..."
                    className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-slate-100 border border-slate-100 rounded-lg p-1">
                  {filteredPosts.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">
                      {posts.length === 0 ? 'Chưa có bài viết nào trên website' : 'Không tìm thấy bài viết phù hợp'}
                    </p>
                  ) : (
                    filteredPosts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-purple-50/50 rounded cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPosts((prev) => [...prev, p.id]);
                            } else {
                              setSelectedPosts((prev) => prev.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800 truncate flex-1">{p.title}</span>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-mono shrink-0 truncate max-w-28">
                          {p.slug}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPosts.length === filteredPosts.length) {
                        setSelectedPosts([]);
                      } else {
                        setSelectedPosts(filteredPosts.map((p) => p.id));
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-purple-600 cursor-pointer"
                  >
                    {selectedPosts.length === filteredPosts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedPosts}
                    disabled={selectedPosts.length === 0}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm vào menu ({selectedPosts.length})
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Categories */}
            {activeTab === 'categories' && (
              <div className="p-3 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Tìm chuyên mục..."
                    className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 border border-slate-100 rounded-lg p-1">
                  {filteredCats.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">
                      {categories.length === 0 ? 'Đang tải chuyên mục...' : 'Không tìm thấy chuyên mục'}
                    </p>
                  ) : (
                    filteredCats.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-blue-50/50 rounded cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCats((prev) => [...prev, c.id]);
                            } else {
                              setSelectedCats((prev) => prev.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="font-medium text-slate-800 truncate flex-1">{c.title}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono shrink-0">
                          {c.slug}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCats.length === filteredCats.length) {
                        setSelectedCats([]);
                      } else {
                        setSelectedCats(filteredCats.map((c) => c.id));
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 cursor-pointer"
                  >
                    {selectedCats.length === filteredCats.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedCats}
                    disabled={selectedCats.length === 0}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm vào menu ({selectedCats.length})
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Custom Link */}
            {activeTab === 'custom' && (
              <form onSubmit={handleAddCustomLink} className="p-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Đường dẫn URL:
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://... hoặc /lien-ket hoặc #"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên đường dẫn (Navigation Label):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ví dụ: Trang Chủ, Khuyến Mãi..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customNewTab}
                    onChange={(e) => setCustomNewTab(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Mở liên kết trong tab mới (_blank)</span>
                </label>

                <button
                  type="submit"
                  disabled={!customTitle.trim()}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm liên kết vào menu
                </button>
              </form>
            )}
          </div>

          {/* Menu Settings / Display Location */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block border-b border-slate-100 pb-1.5">
              Vị trí hiển thị (Theme Locations)
            </span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={locations.includes('primary')}
                  onChange={() => toggleLocation('primary')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-semibold">Main Menu (Header Flatsome)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={locations.includes('primary_mobile')}
                  onChange={() => toggleLocation('primary_mobile')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-semibold">Mobile Menu (Điện thoại / Tablet)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Menu structure & Styling & Custom CSS */}
        <div className="md:col-span-7 lg:col-span-8 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {/* Top Sub-tabs Switcher */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setRightTab('structure')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightTab === 'structure'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Cấu Trúc ({menuItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRightTab('styling')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightTab === 'styling'
                    ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span>Màu Sắc &amp; Màu Đổ</span>
              </button>

              <button
                type="button"
                onClick={() => setRightTab('custom_css')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightTab === 'custom_css'
                    ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tuỳ Chỉnh CSS</span>
              </button>
            </div>

            {/* TAB 1: MENU STRUCTURE & REORDERING */}
            {rightTab === 'structure' && (
              <>
                {/* Header: Menu Name */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs font-bold text-slate-700 shrink-0">Tên Menu:</label>
                    <input
                      type="text"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 flex-1 max-w-xs"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {menuItems.length} mục
                  </span>
                </div>

                {/* Items list */}
                <div className="p-3.5 space-y-2 min-h-[300px]">
                  {menuItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <MenuIcon className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs">
                        Chưa có mục nào trong Menu. Hãy chọn Trang hoặc Chuyên mục từ cột bên trái và bấm <strong>"Thêm vào menu"</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddHome}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Home className="w-3.5 h-3.5" /> Nạp Trang Chủ ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {menuItems.map((item, index) => {
                        const isFirstHome = index === 0;
                        const isSubItem = Boolean(item.parent_client_id);
                        return (
                          <div
                            key={item.client_id || index}
                            className={`rounded-xl border transition-all ${
                              isFirstHome
                                ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-blue-300 shadow-xs ring-1 ring-blue-200/70'
                                : isSubItem
                                ? 'ml-8 bg-blue-50/30 border-blue-200/80 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="p-2.5 flex items-center gap-2">
                              {/* Position indicator */}
                              {isFirstHome ? (
                                <div
                                  className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs"
                                  title="Trang Chủ luôn được neo cố định ở vị trí #1"
                                >
                                  <Home className="w-3.5 h-3.5" />
                                </div>
                              ) : isSubItem ? (
                                <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0" />
                              ) : (
                                <span className="w-5 text-center text-xs font-bold text-slate-400 shrink-0">
                                  {index + 1}
                                </span>
                              )}

                              {/* Editable Navigation Label */}
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => updateItemTitle(index, e.target.value)}
                                  className={`font-bold text-xs bg-transparent hover:bg-white focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-hidden w-full ${
                                    isFirstHome ? 'text-blue-950 font-extrabold' : 'text-slate-900'
                                  }`}
                                  title="Bấm vào để chỉnh sửa nhãn hiển thị"
                                />

                                {/* Type badge */}
                                {isFirstHome ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border bg-blue-600 text-white border-blue-700 flex items-center gap-1 shadow-2xs">
                                    <span>📍</span> Neo Cố Định #1
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                                      item.object === 'category'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : item.object === 'page'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : item.object === 'post'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {item.object === 'category'
                                      ? 'Chuyên mục'
                                      : item.object === 'page'
                                      ? 'Trang'
                                      : item.object === 'post'
                                      ? 'Bài viết'
                                      : 'Tự tạo'}
                                  </span>
                                )}
                              </div>

                              {/* Hierarchy Submenu controls */}
                              <div className="flex items-center gap-1 shrink-0">
                                {!isFirstHome && !isSubItem && index > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => makeSubItem(index)}
                                    className="p-1 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded transition cursor-pointer"
                                    title="Thụt dòng vào trong: Làm mục con (Submenu Dropdown) của mục trên"
                                  >
                                    <CornerDownRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {isSubItem && (
                                  <button
                                    type="button"
                                    onClick={() => makeRootItem(index)}
                                    className="p-1 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded transition cursor-pointer"
                                    title="Đưa ra ngoài làm mục chính (Cấp 1)"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Move Up / Down */}
                                <button
                                  type="button"
                                  onClick={() => moveItem(index, 'up')}
                                  disabled={isFirstHome || index <= 1}
                                  className="p-1 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
                                  title={
                                    isFirstHome
                                      ? 'Trang Chủ luôn neo ở vị trí #1'
                                      : index === 1
                                      ? 'Không thể di chuyển lên trước Trang Chủ (Trang Chủ luôn ở đầu)'
                                      : 'Di chuyển lên trên'
                                  }
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem(index, 'down')}
                                  disabled={isFirstHome || index === menuItems.length - 1}
                                  className="p-1 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
                                  title={
                                    isFirstHome
                                      ? 'Trang Chủ luôn neo ở vị trí #1'
                                      : 'Di chuyển xuống dưới'
                                  }
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  disabled={isFirstHome}
                                  className={`p-1 rounded transition ml-1 ${
                                    isFirstHome
                                      ? 'text-slate-300 opacity-25 cursor-not-allowed'
                                      : 'hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer'
                                  }`}
                                  title={
                                    isFirstHome
                                      ? 'Trang Chủ luôn neo ở vị trí #1, không thể xóa'
                                      : 'Xóa mục này khỏi menu'
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* URL info */}
                            <div className="px-3 pb-2 pt-0 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-mono truncate max-w-xs flex items-center gap-1">
                                {isFirstHome && <span className="text-blue-600 font-semibold">🏠 Trang Chủ:</span>}
                                {item.url}
                              </span>
                              {isSubItem && (
                                <span className="text-blue-600 font-medium">↳ Mục con (Dropdown)</span>
                              )}
                              {isFirstHome && (
                                <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">
                                  Cố định #1
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: MENU COLORS & GRADIENT STYLING */}
            {rightTab === 'styling' && (
              <div className="p-4 space-y-4">
                {/* Mini Live Preview Widget (Desktop & Mobile Drawer) */}
                {(() => {
                  const effectiveMobileBg =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#ffffff'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? (menuStyling.bgType === 'solid' ? menuStyling.bgColor : menuStyling.gradientColor1)
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileBgColor || '#0f172a')
                      : '#0f172a';

                  const effectiveMobileText =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#0f172a'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? menuStyling.textColor
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileTextColor || '#f8fafc')
                      : '#f8fafc';

                  const effectiveMobileHover =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#2563eb'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? menuStyling.textHoverColor
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileTextHoverColor || '#38bdf8')
                      : '#38bdf8';

                  const effectiveMobileHoverBg =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? 'rgba(0,0,0,0.04)'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? menuStyling.itemHoverBg
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileHoverBg || 'rgba(255,255,255,0.08)')
                      : 'rgba(255,255,255,0.08)';

                  const effectiveMobileDivider =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#e2e8f0'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileDividerColor || 'rgba(255, 255, 255, 0.08)')
                      : 'rgba(255, 255, 255, 0.08)';

                  const effectiveMobileSubBg =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#f8fafc'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? menuStyling.dropdownBg
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileSubmenuBg || '#1e293b')
                      : '#1e293b';

                  const effectiveMobileSubText =
                    menuStyling.mobileDrawerTheme === 'light'
                      ? '#475569'
                      : menuStyling.mobileDrawerTheme === 'match_desktop'
                      ? menuStyling.dropdownTextColor
                      : menuStyling.mobileDrawerTheme === 'custom'
                      ? (menuStyling.mobileSubmenuTextColor || '#94a3b8')
                      : '#94a3b8';

                  return (
                    <div className="p-3.5 bg-slate-900/5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Xem thử màu thực tế (Live Preview):</span>
                        </span>
                        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/60 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('desktop')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              previewDevice === 'desktop'
                                ? 'bg-white shadow-2xs text-purple-700 font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Monitor className="w-3 h-3" />
                            <span>🖥️ Header Desktop</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('mobile')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              previewDevice === 'mobile'
                                ? 'bg-white shadow-2xs text-purple-700 font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>📱 Mobile Drawer</span>
                          </button>
                        </div>
                      </div>

                      {previewDevice === 'desktop' ? (
                        <div
                          style={{
                            background:
                              menuStyling.bgType === 'gradient'
                                ? `linear-gradient(${menuStyling.gradientAngle}, ${menuStyling.gradientColor1} 0%, ${menuStyling.gradientColor2} 100%)`
                                : menuStyling.bgType === 'solid'
                                ? menuStyling.bgColor
                                : 'transparent',
                            borderTop:
                              menuStyling.borderTopWidth && menuStyling.borderTopWidth !== '0px'
                                ? `${menuStyling.borderTopWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderTopColor || 'transparent'}`
                                : 'none',
                            borderBottom:
                              menuStyling.borderBottomWidth && menuStyling.borderBottomWidth !== '0px'
                                ? `${menuStyling.borderBottomWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderBottomColor || 'transparent'}`
                                : 'none',
                            borderLeft:
                              menuStyling.borderLeftWidth && menuStyling.borderLeftWidth !== '0px'
                                ? `${menuStyling.borderLeftWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderLeftColor || 'transparent'}`
                                : 'none',
                            borderRight:
                              menuStyling.borderRightWidth && menuStyling.borderRightWidth !== '0px'
                                ? `${menuStyling.borderRightWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderRightColor || 'transparent'}`
                                : 'none',
                          }}
                          className="p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xs transition-all duration-200"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              style={{
                                color: menuStyling.textHoverColor,
                                backgroundColor: menuStyling.itemHoverBg,
                                fontSize: menuStyling.fontSize,
                                borderRadius: menuStyling.itemRadius,
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2.5 py-1 font-bold text-xs shadow-2xs transition-all"
                            >
                              Trang Chủ (Hover)
                            </span>
                            <span
                              style={{
                                color: menuStyling.textColor,
                                fontSize: menuStyling.fontSize,
                                borderRadius: menuStyling.itemRadius,
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2 py-1 font-semibold text-xs"
                            >
                              Sản Phẩm ▾
                            </span>
                            <span
                              style={{
                                color: menuStyling.textColor,
                                fontSize: menuStyling.fontSize,
                                borderRadius: menuStyling.itemRadius,
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2 py-1 font-semibold text-xs hidden sm:inline"
                            >
                              Dịch Vụ
                            </span>
                            <span
                              style={{
                                color: menuStyling.textColor,
                                fontSize: menuStyling.fontSize,
                                borderRadius: menuStyling.itemRadius,
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2 py-1 font-semibold text-xs hidden sm:inline"
                            >
                              Liên Hệ
                            </span>
                          </div>

                          {/* Simulated Dropdown Badge */}
                          <div
                            style={{
                              backgroundColor: menuStyling.dropdownBg,
                              color: menuStyling.dropdownTextColor,
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20 shadow-xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Màu Dropdown Con</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: effectiveMobileBg,
                            color: effectiveMobileText,
                            borderColor: effectiveMobileDivider,
                          }}
                          className="p-3 rounded-xl border space-y-2 shadow-xs transition-all duration-200 max-w-md mx-auto"
                        >
                          {/* Top Drawer & Header Simulation Bar */}
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[10px] font-bold">
                            <span className="flex items-center gap-1.5 opacity-90">
                              <span
                                style={{
                                  color: menuStyling.mobileIconColor || '#ffffff',
                                  backgroundColor:
                                    menuStyling.mobileIconBgColor && menuStyling.mobileIconBgColor !== 'transparent'
                                      ? menuStyling.mobileIconBgColor
                                      : 'rgba(255,255,255,0.1)',
                                }}
                                className="px-1.5 py-0.5 rounded font-bold text-xs leading-none shadow-2xs border border-white/10"
                                title="Màu Icon Hamburger ☰ trên Header"
                              >
                                ☰
                              </span>
                              <span>OFF-CANVAS MOBILE DRAWER</span>
                            </span>
                            <span className="text-[10px] opacity-60">✕ Đóng</span>
                          </div>

                          {/* Search Bar */}
                          {!menuStyling.cleanMobileNavOnly && menuStyling.mobileShowSearch ? (
                            <div className="relative">
                              <input
                                type="text"
                                disabled
                                placeholder="Search..."
                                style={{
                                  backgroundColor:
                                    menuStyling.mobileDrawerTheme === 'light'
                                      ? '#f1f5f9'
                                      : 'rgba(255,255,255,0.08)',
                                  color: effectiveMobileText,
                                  borderColor: effectiveMobileDivider,
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded border cursor-not-allowed pr-8 placeholder:opacity-60"
                              />
                              <div className="absolute right-0 top-0 bottom-0 px-2.5 bg-orange-600 rounded-r flex items-center justify-center text-white text-[10px]">
                                🔍
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic text-center py-0.5">
                              (Thanh tìm kiếm: ĐÃ BỎ)
                            </div>
                          )}

                          {/* Menu Items List */}
                          <div className="space-y-0.5 text-left">
                            <div
                              style={{
                                color: effectiveMobileHover,
                                backgroundColor: effectiveMobileHoverBg,
                                borderColor: effectiveMobileDivider,
                                fontSize: menuStyling.mobileFontSize || '13px',
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2.5 py-1.5 rounded font-bold border-b flex items-center justify-between"
                            >
                              <span>TRANG CHỦ (Active / Hover)</span>
                              <span className="text-[10px] opacity-75">★</span>
                            </div>

                            <div
                              style={{
                                color: effectiveMobileText,
                                borderColor: effectiveMobileDivider,
                                fontSize: menuStyling.mobileFontSize || '13px',
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2.5 py-1.5 font-semibold border-b flex items-center justify-between"
                            >
                              <span>SẢN PHẨM &amp; DỊCH VỤ</span>
                              <span className="text-xs opacity-60">▾</span>
                            </div>

                            {/* Submenu Item */}
                            <div
                              style={{
                                backgroundColor: effectiveMobileSubBg,
                                borderLeft: `3px solid ${effectiveMobileHover}`,
                                borderColor: effectiveMobileDivider,
                              }}
                              className="py-1 px-3 space-y-1 rounded-sm ml-2 text-xs"
                            >
                              <div style={{ color: effectiveMobileSubText }} className="py-0.5 border-b border-white/5">
                                ↳ Mục Menu Con 1.1
                              </div>
                              <div style={{ color: effectiveMobileHover }} className="py-0.5 font-medium">
                                ↳ Mục Menu Con 1.2 (Hover)
                              </div>
                            </div>

                            <div
                              style={{
                                color: effectiveMobileText,
                                borderColor: effectiveMobileDivider,
                                fontSize: menuStyling.mobileFontSize || '13px',
                                textTransform: menuStyling.isUppercase ? 'uppercase' : 'none',
                              }}
                              className="px-2.5 py-1.5 font-semibold border-b flex items-center justify-between"
                            >
                              <span>LIÊN HỆ &amp; HỖ TRỢ</span>
                            </div>
                          </div>

                          {/* Newsletter element */}
                          {!menuStyling.cleanMobileNavOnly && menuStyling.mobileShowNewsletter && (
                            <div
                              style={{ borderColor: effectiveMobileDivider }}
                              className="py-1.5 px-2.5 rounded border flex items-center justify-between text-[11px] opacity-85"
                            >
                              <span className="flex items-center gap-1.5 font-semibold">
                                <span>✉</span>
                                <span>NEWSLETTER</span>
                              </span>
                              <span className="text-[9px]">→</span>
                            </div>
                          )}

                          {/* Cleaner Status Alert */}
                          {menuStyling.cleanMobileNavOnly ? (
                            <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300 flex items-center gap-1.5 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>Menu Tinh Gọn: Đã ẩn sạch Tìm Kiếm, Giỏ Hàng, Newsletter, Social</span>
                            </div>
                          ) : menuStyling.mobileHideWooNotice !== false ? (
                            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Đã tự động loại bỏ thông báo "WooCommerce not Found"</span>
                            </div>
                          ) : (
                            <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-400">
                              ⚠️ Đang hiển thị "WooCommerce not Found"
                            </div>
                          )}

                          {/* Social Icons */}
                          {!menuStyling.cleanMobileNavOnly && menuStyling.mobileShowSocial && (
                            <div
                              style={{ borderColor: effectiveMobileDivider }}
                              className="pt-2 border-t flex items-center justify-center gap-3 text-xs opacity-80"
                            >
                              <span className="px-1.5 py-0.5 rounded border border-white/20">f</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/20">📷</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/20">🐦</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/20">✉</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Gradient & Color Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Mẫu phối màu &amp; màu đổ có sẵn (1-Click Áp Dụng):
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {gradientPresets.map((preset, idx) => {
                      const isSelected =
                        preset.bgType === menuStyling.bgType &&
                        (preset.bgType === 'gradient'
                          ? preset.gradientColor1 === menuStyling.gradientColor1 &&
                            preset.gradientColor2 === menuStyling.gradientColor2
                          : preset.bgColor === menuStyling.bgColor);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div
                            style={{
                              background:
                                preset.bgType === 'gradient'
                                  ? `linear-gradient(${preset.gradientAngle}, ${preset.gradientColor1} 0%, ${preset.gradientColor2} 100%)`
                                  : preset.bgColor,
                            }}
                            className="w-full h-6 rounded-md border border-black/10 shadow-2xs flex items-center justify-end px-1.5"
                          >
                            <span
                              style={{ color: preset.textHoverColor }}
                              className="text-[9px] font-bold uppercase"
                            >
                              Hover
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {preset.name}
                            </div>
                            <div className="text-[10px] text-slate-500">{preset.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Background Styling Configuration */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Cấu hình nền Menu (Header Bottom)
                  </span>

                  {/* Bg Type Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStyling({ bgType: 'gradient' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        menuStyling.bgType === 'gradient'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🌈 Màu Đổ (Gradient)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStyling({ bgType: 'solid' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        menuStyling.bgType === 'solid'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ⬛ Màu Đơn (Solid)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStyling({ bgType: 'transparent' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        menuStyling.bgType === 'transparent'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🪟 Trong Suốt
                    </button>
                  </div>

                  {/* Gradient Controls */}
                  {menuStyling.bgType === 'gradient' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Màu bắt đầu (Start):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.gradientColor1}
                            onChange={(e) =>
                              handleUpdateStyling({ gradientColor1: e.target.value })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={menuStyling.gradientColor1}
                            onChange={(e) =>
                              handleUpdateStyling({ gradientColor1: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Màu kết thúc (End):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.gradientColor2}
                            onChange={(e) =>
                              handleUpdateStyling({ gradientColor2: e.target.value })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={menuStyling.gradientColor2}
                            onChange={(e) =>
                              handleUpdateStyling({ gradientColor2: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Hướng đổ màu:
                        </label>
                        <select
                          value={menuStyling.gradientAngle}
                          onChange={(e) => handleUpdateStyling({ gradientAngle: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                        >
                          <option value="90deg">90° (Ngang - Trái qua Phải)</option>
                          <option value="135deg">135° (Góc chéo ↘️ Tuyệt đẹp)</option>
                          <option value="180deg">180° (Dọc - Trên xuống Dưới)</option>
                          <option value="45deg">45° (Góc chéo ↗️)</option>
                          <option value="270deg">270° (Ngang - Phải qua Trái)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Solid Controls */}
                  {menuStyling.bgType === 'solid' && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mã màu nền:
                      </label>
                      <div className="flex items-center gap-2 max-w-xs">
                        <input
                          type="color"
                          value={menuStyling.bgColor}
                          onChange={(e) => handleUpdateStyling({ bgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={menuStyling.bgColor}
                          onChange={(e) => handleUpdateStyling({ bgColor: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Border Configuration (Top / Bottom / Left / Right) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Đường Viền Menu (Border: Trên, Dưới, Trái, Phải)</span>
                    </span>
                    {/* Quick Preset Buttons for borders */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStyling({
                            borderTopWidth: '0px',
                            borderBottomWidth: '2px',
                            borderBottomColor: '#38bdf8',
                            borderLeftWidth: '0px',
                            borderRightWidth: '0px',
                            borderStyle: 'solid',
                          })
                        }
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer shadow-2xs"
                      >
                        Viền đáy 2px sáng
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStyling({
                            borderTopWidth: '1px',
                            borderTopColor: 'rgba(255,255,255,0.15)',
                            borderBottomWidth: '1px',
                            borderBottomColor: 'rgba(0,0,0,0.2)',
                            borderLeftWidth: '0px',
                            borderRightWidth: '0px',
                            borderStyle: 'solid',
                          })
                        }
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer shadow-2xs"
                      >
                        Viền trên &amp; dưới 1px
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStyling({
                            borderTopWidth: '0px',
                            borderBottomWidth: '0px',
                            borderLeftWidth: '0px',
                            borderRightWidth: '0px',
                          })
                        }
                        className="px-2 py-0.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded font-semibold cursor-pointer shadow-2xs"
                      >
                        Tắt viền (0px)
                      </button>
                    </div>
                  </div>

                  {/* Border Style */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-700 shrink-0">Kiểu nét viền:</label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: 'Nét liền (Solid)', value: 'solid' },
                        { label: 'Nét đứt (Dashed)', value: 'dashed' },
                        { label: 'Chấm bi (Dotted)', value: 'dotted' },
                        { label: 'Viền đôi (Double)', value: 'double' },
                      ].map((st) => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => handleUpdateStyling({ borderStyle: st.value })}
                          className={`px-2.5 py-1 text-xs rounded-md border font-semibold transition cursor-pointer ${
                            (menuStyling.borderStyle || 'solid') === st.value
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4 Borders Grid: Top, Bottom, Left, Right */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {/* Border Top */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">⬆️ Viền Trên (Top)</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {menuStyling.borderTopWidth || '0px'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Độ dày viền trên:</label>
                        <select
                          value={menuStyling.borderTopWidth || '0px'}
                          onChange={(e) => handleUpdateStyling({ borderTopWidth: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        >
                          <option value="0px">0px (Không viền)</option>
                          <option value="1px">1px (Mảnh tinh tế)</option>
                          <option value="2px">2px (Vừa)</option>
                          <option value="3px">3px (Dày nổi bật)</option>
                          <option value="4px">4px</option>
                          <option value="5px">5px</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Màu viền trên:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={menuStyling.borderTopColor?.startsWith('#') ? menuStyling.borderTopColor : '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderTopColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.borderTopColor || '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderTopColor: e.target.value })}
                            className="w-full px-1.5 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Border Bottom */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">⬇️ Viền Dưới (Bottom)</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {menuStyling.borderBottomWidth || '0px'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Độ dày viền dưới:</label>
                        <select
                          value={menuStyling.borderBottomWidth || '0px'}
                          onChange={(e) => handleUpdateStyling({ borderBottomWidth: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        >
                          <option value="0px">0px (Không viền)</option>
                          <option value="1px">1px (Mảnh tinh tế)</option>
                          <option value="2px">2px (Vừa sang)</option>
                          <option value="3px">3px (Gạch đáy dày)</option>
                          <option value="4px">4px</option>
                          <option value="5px">5px</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Màu viền dưới:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={menuStyling.borderBottomColor?.startsWith('#') ? menuStyling.borderBottomColor : '#38bdf8'}
                            onChange={(e) => handleUpdateStyling({ borderBottomColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.borderBottomColor || '#38bdf8'}
                            onChange={(e) => handleUpdateStyling({ borderBottomColor: e.target.value })}
                            className="w-full px-1.5 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Border Left */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">⬅️ Viền Trái (Left)</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {menuStyling.borderLeftWidth || '0px'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Độ dày viền trái:</label>
                        <select
                          value={menuStyling.borderLeftWidth || '0px'}
                          onChange={(e) => handleUpdateStyling({ borderLeftWidth: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        >
                          <option value="0px">0px (Không viền)</option>
                          <option value="1px">1px</option>
                          <option value="2px">2px</option>
                          <option value="3px">3px</option>
                          <option value="4px">4px</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Màu viền trái:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={menuStyling.borderLeftColor?.startsWith('#') ? menuStyling.borderLeftColor : '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderLeftColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.borderLeftColor || '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderLeftColor: e.target.value })}
                            className="w-full px-1.5 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Border Right */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">➡️ Viền Phải (Right)</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {menuStyling.borderRightWidth || '0px'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Độ dày viền phải:</label>
                        <select
                          value={menuStyling.borderRightWidth || '0px'}
                          onChange={(e) => handleUpdateStyling({ borderRightWidth: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        >
                          <option value="0px">0px (Không viền)</option>
                          <option value="1px">1px</option>
                          <option value="2px">2px</option>
                          <option value="3px">3px</option>
                          <option value="4px">4px</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Màu viền phải:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={menuStyling.borderRightColor?.startsWith('#') ? menuStyling.borderRightColor : '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderRightColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.borderRightColor || '#3b82f6'}
                            onChange={(e) => handleUpdateStyling({ borderRightColor: e.target.value })}
                            className="w-full px-1.5 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography & Link Hover Colors */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Màu Chữ &amp; Hiệu Ứng Menu Chính (Cấp 1)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu chữ mặc định:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={menuStyling.textColor}
                          onChange={(e) => handleUpdateStyling({ textColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={menuStyling.textColor}
                          onChange={(e) => handleUpdateStyling({ textColor: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu chữ khi Hover:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={menuStyling.textHoverColor}
                          onChange={(e) =>
                            handleUpdateStyling({ textHoverColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={menuStyling.textHoverColor}
                          onChange={(e) =>
                            handleUpdateStyling({ textHoverColor: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu nền khi Hover:
                      </label>
                      <input
                        type="text"
                        value={menuStyling.itemHoverBg}
                        onChange={(e) => handleUpdateStyling({ itemHoverBg: e.target.value })}
                        placeholder="rgba(255,255,255,0.12) hoặc #ffffff"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Cỡ chữ (Font Size):
                      </label>
                      <select
                        value={menuStyling.fontSize}
                        onChange={(e) => handleUpdateStyling({ fontSize: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold"
                      >
                        <option value="12px">12px (Nhỏ gọn)</option>
                        <option value="13px">13px (Tiêu chuẩn Flatsome)</option>
                        <option value="14px">14px (Rõ ràng &amp; Đẹp)</option>
                        <option value="15px">15px (Lớn)</option>
                        <option value="16px">16px (Rất Lớn)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Bo góc nút Hover:
                      </label>
                      <select
                        value={menuStyling.itemRadius}
                        onChange={(e) => handleUpdateStyling({ itemRadius: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold"
                      >
                        <option value="0px">0px (Vuông vắn)</option>
                        <option value="4px">4px (Bo nhẹ)</option>
                        <option value="6px">6px (Bo tròn vừa chuẩn)</option>
                        <option value="8px">8px (Bo mềm mại)</option>
                        <option value="999px">999px (Dạng viên thuốc Pill)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={menuStyling.isUppercase}
                          onChange={(e) =>
                            handleUpdateStyling({ isUppercase: e.target.checked })
                          }
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span>IN HOA TẤT CẢ (UPPERCASE)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dropdown Submenu Colors */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Màu Menu Con Đổ Xuống (Dropdown Submenu)
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Áp dụng cho các mục con thụt lề
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu nền Dropdown:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={menuStyling.dropdownBg}
                          onChange={(e) =>
                            handleUpdateStyling({ dropdownBg: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={menuStyling.dropdownBg}
                          onChange={(e) =>
                            handleUpdateStyling({ dropdownBg: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu chữ Menu Con:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={menuStyling.dropdownTextColor}
                          onChange={(e) =>
                            handleUpdateStyling({ dropdownTextColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={menuStyling.dropdownTextColor}
                          onChange={(e) =>
                            handleUpdateStyling({ dropdownTextColor: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Màu nền Hover mục con:
                      </label>
                      <input
                        type="text"
                        value={menuStyling.dropdownHoverBg}
                        onChange={(e) =>
                          handleUpdateStyling({ dropdownHoverBg: e.target.value })
                        }
                        placeholder="#1e293b hoặc rgba(0,0,0,0.05)"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: MOBILE OFF-CANVAS DRAWER CONFIGURATION */}
                <div className="p-4 bg-slate-900/5 border border-purple-200/80 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                          <span>📱 Cấu Hình Mobile Menu (Off-Canvas Drawer Flatsome)</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded-full border border-purple-200">
                            Khắc phục chìm màu
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tùy chỉnh giao diện menu trượt ra khi bấm nút ☰ (Hamburger) trên điện thoại
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Theme Presets */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                      Chọn phong cách hiển thị trên điện thoại:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {mobilePresets.map((p) => {
                        const isSelected = (menuStyling.mobileDrawerTheme || 'dark') === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              handleUpdateStyling({
                                mobileDrawerTheme: p.mobileDrawerTheme,
                                mobileBgColor: p.mobileBgColor,
                                mobileTextColor: p.mobileTextColor,
                                mobileTextHoverColor: p.mobileTextHoverColor,
                                mobileHoverBg: p.mobileHoverBg,
                                mobileDividerColor: p.mobileDividerColor,
                                mobileSubmenuBg: p.mobileSubmenuBg,
                                mobileSubmenuTextColor: p.mobileSubmenuTextColor,
                                mobileIconColor: p.mobileIconColor,
                                mobileIconHoverColor: p.mobileIconHoverColor,
                              })
                            }
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900">{p.name}</span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    p.id === 'dark'
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {p.tag}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                                {p.desc}
                              </p>
                            </div>
                            {/* Color chips preview */}
                            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                style={{ backgroundColor: p.mobileBgColor }}
                                title="Nền Drawer"
                              ></span>
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                style={{ backgroundColor: p.mobileTextColor }}
                                title="Màu chữ"
                              ></span>
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                style={{ backgroundColor: p.mobileTextHoverColor }}
                                title="Màu hover"
                              ></span>
                              <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                {isSelected ? '✓ Đang chọn' : 'Áp dụng'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1-Click Clean Nav Mode Toggle */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      menuStyling.cleanMobileNavOnly
                        ? 'bg-purple-900/10 border-purple-500/50 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            menuStyling.cleanMobileNavOnly
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                            <span>🧹 Chế Độ Menu Tinh Gọn 100% (Clean Nav Only)</span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                              Khuyên dùng cho SEO
                            </span>
                          </label>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Tự động dọn sạch tất cả thành phần thừa: <strong>Thanh Tìm Kiếm, Giỏ Hàng/WooCommerce, Bản Tin Newsletter, Icon Mạng Xã Hội</strong>. Menu trên điện thoại chỉ hiển thị danh sách trang/chuyên mục đơn thuần.
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(menuStyling.cleanMobileNavOnly)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            handleUpdateStyling({
                              cleanMobileNavOnly: checked,
                              mobileShowSearch: !checked,
                              mobileShowSocial: !checked,
                              mobileShowNewsletter: false,
                              mobileHideWooNotice: true,
                            });
                          }}
                          className="w-5 h-5 rounded text-purple-600 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Detailed Toggles for Mobile Elements */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide block">
                        Tùy Chọn Bật / Tắt Từng Thành Phần Trong Menu Mobile:
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Bỏ tích để loại bỏ khỏi điện thoại
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Toggle Search Form */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                          menuStyling.mobileShowSearch && !menuStyling.cleanMobileNavOnly
                            ? 'border-purple-300 bg-purple-50/50 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/60 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(menuStyling.mobileShowSearch) && !menuStyling.cleanMobileNavOnly}
                          disabled={Boolean(menuStyling.cleanMobileNavOnly)}
                          onChange={(e) =>
                            handleUpdateStyling({ mobileShowSearch: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-0 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            🔍 Thanh Tìm Kiếm
                          </span>
                          <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                            Bỏ tích để xóa ô <code>Search...</code> ở đầu menu
                          </span>
                        </div>
                      </label>

                      {/* 2. Toggle Hide WooCommerce Notice & Cart */}
                      {(() => {
                        const isHidden =
                          menuStyling.mobileHideWooNotice !== false ||
                          Boolean(menuStyling.cleanMobileNavOnly);
                        return (
                          <label
                            className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none shadow-2xs ${
                              isHidden
                                ? 'border-emerald-400 bg-emerald-50/70 hover:bg-emerald-50/90'
                                : 'border-rose-400 bg-rose-50/80 hover:bg-rose-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isHidden}
                              disabled={Boolean(menuStyling.cleanMobileNavOnly)}
                              onChange={(e) =>
                                handleUpdateStyling({ mobileHideWooNotice: e.target.checked })
                              }
                              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-0 shrink-0 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-bold flex items-center gap-1 ${
                                  isHidden ? 'text-emerald-900' : 'text-rose-900'
                                }`}>
                                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${
                                    isHidden ? 'text-emerald-600' : 'text-rose-600'
                                  }`} />
                                  <span>Tích chọn để Xóa "WooCommerce not Found"</span>
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isHidden
                                    ? 'bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-200 text-rose-800 animate-pulse'
                                }`}>
                                  {isHidden ? 'Đã Tắt / Xóa Bỏ' : '⚠️ Đang Để Hiện'}
                                </span>
                              </div>
                              <span className={`text-[11px] leading-snug block mt-1 ${
                                isHidden ? 'text-emerald-700' : 'text-rose-700 font-medium'
                              }`}>
                                {isHidden
                                  ? 'Đã loại bỏ hoàn toàn biểu tượng giỏ hàng & dòng chữ lỗi.'
                                  : '⚠️ BẠN ĐANG BỎ TÍCH: Hãy tích chọn ô này để xóa sạch chữ "WooCommerce not Found"!'}
                              </span>
                            </div>
                          </label>
                        );
                      })()}

                      {/* 3. Toggle Newsletter */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                          menuStyling.mobileShowNewsletter && !menuStyling.cleanMobileNavOnly
                            ? 'border-purple-300 bg-purple-50/50 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/60 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            Boolean(menuStyling.mobileShowNewsletter) &&
                            !menuStyling.cleanMobileNavOnly
                          }
                          disabled={Boolean(menuStyling.cleanMobileNavOnly)}
                          onChange={(e) =>
                            handleUpdateStyling({ mobileShowNewsletter: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-0 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            ✉️ Bản Tin Newsletter
                          </span>
                          <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                            Bỏ tích để loại bỏ nút <code>NEWSLETTER</code>
                          </span>
                        </div>
                      </label>

                      {/* 4. Toggle Social Icons */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                          menuStyling.mobileShowSocial && !menuStyling.cleanMobileNavOnly
                            ? 'border-purple-300 bg-purple-50/50 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/60 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            Boolean(menuStyling.mobileShowSocial) &&
                            !menuStyling.cleanMobileNavOnly
                          }
                          disabled={Boolean(menuStyling.cleanMobileNavOnly)}
                          onChange={(e) =>
                            handleUpdateStyling({ mobileShowSocial: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-0 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            🌐 Icon Mạng Xã Hội
                          </span>
                          <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                            Bỏ tích để xóa hàng icon Facebook, Insta...
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Custom Color Overrides for Mobile */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide block">
                        Tùy chỉnh màu sắc chi tiết Mobile Drawer:
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Điều chỉnh màu sắc riêng nếu muốn khác preset
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Nền Mobile Drawer:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.mobileBgColor || '#0f172a'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileBgColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.mobileBgColor || '#0f172a'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileBgColor: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Màu Chữ Menu Mobile:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.mobileTextColor || '#f8fafc'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileTextColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.mobileTextColor || '#f8fafc'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileTextColor: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Màu Hover / Đang xem:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.mobileTextHoverColor || '#38bdf8'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileTextHoverColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.mobileTextHoverColor || '#38bdf8'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileDrawerTheme: 'custom',
                                mobileTextHoverColor: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Cỡ chữ Mobile:
                        </label>
                        <select
                          value={menuStyling.mobileFontSize || '14px'}
                          onChange={(e) =>
                            handleUpdateStyling({ mobileFontSize: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                        >
                          <option value="13px">13px (Nhỏ gọn)</option>
                          <option value="14px">14px (Chuẩn vừa vặn)</option>
                          <option value="15px">15px (Rõ ràng)</option>
                          <option value="16px">16px (Lớn dễ đọc)</option>
                        </select>
                      </div>

                      {/* Màu Icon Hamburger (3 gạch ☰) */}
                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <span>Màu Icon Menu (Hamburger ☰):</span>
                          </label>
                          <span
                            style={{
                              color: menuStyling.mobileIconColor || '#ffffff',
                              backgroundColor:
                                menuStyling.mobileIconBgColor && menuStyling.mobileIconBgColor !== 'transparent'
                                  ? menuStyling.mobileIconBgColor
                                  : '#0f172a',
                            }}
                            className="px-2 py-0.5 rounded text-xs font-bold border border-slate-300 shadow-2xs font-mono"
                            title="Mô phỏng màu icon ☰"
                          >
                            ☰
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.mobileIconColor || '#ffffff'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileIconColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.mobileIconColor || '#ffffff'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileIconColor: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Màu Hover Icon Menu (☰) */}
                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Màu Hover Icon Menu (☰):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuStyling.mobileIconHoverColor || '#38bdf8'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileIconHoverColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={menuStyling.mobileIconHoverColor || '#38bdf8'}
                            onChange={(e) =>
                              handleUpdateStyling({
                                mobileIconHoverColor: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md uppercase focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM CSS EDITOR */}
            {rightTab === 'custom_css' && (
              <div className="p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-600" />
                      <span>Trình Soạn Thảo CSS Tùy Chỉnh Cho Menu Flatsome</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mã CSS này được biên dịch và inject tự động bằng hook <code>wp_head</code> với độ ưu tiên 999, ghi đè triệt để mọi CSS mặc định của theme Flatsome.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const templateCss = `/* Hiệu ứng viền dưới và bóng mờ hiện đại cho menu Flatsome */
#wide-nav, .header-bottom {
  border-bottom: 2px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12) !important;
}

/* Hiệu ứng trượt gạch chân khi hover vào liên kết */
#wide-nav .nav > li > a {
  position: relative;
  transition: all 0.25s ease-in-out !important;
}

#wide-nav .nav > li > a:hover {
  transform: translateY(-1px);
}

/* Tinh chỉnh hộp menu con đổ xuống (Submenu Dropdown) */
.nav-dropdown {
  border-radius: 10px !important;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  overflow: hidden;
}`;
                      handleUpdateStyling({ customCss: templateCss });
                    }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Nạp Mẫu CSS Mẫu
                  </button>
                </div>

                {/* Quick Selector Snippets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Bấm để chèn nhanh Class Selector của Flatsome:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '#wide-nav (Thanh Menu)', code: '#wide-nav {\n  \n}\n' },
                      {
                        label: '.header-nav > li > a (Link)',
                        code: '#wide-nav .header-nav > li > a {\n  \n}\n',
                      },
                      {
                        label: ':hover (Hiệu ứng hover)',
                        code: '#wide-nav .header-nav > li > a:hover {\n  \n}\n',
                      },
                      {
                        label: '.nav-dropdown (Dropdown)',
                        code: '.nav-dropdown {\n  \n}\n',
                      },
                      {
                        label: 'Bóng Đổ (box-shadow)',
                        code: 'box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;\n',
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = menuStyling.customCss || '';
                          handleUpdateStyling({
                            customCss: current ? `${current}\n${item.code}` : item.code,
                          });
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-mono cursor-pointer transition"
                      >
                        + {item.label}
                      </button>
                    ))}
                    {menuStyling.customCss && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStyling({ customCss: '' })}
                        className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-semibold cursor-pointer transition ml-auto"
                      >
                        Xóa sạch CSS
                      </button>
                    )}
                  </div>
                </div>

                {/* Code Textarea Editor */}
                <div className="relative">
                  <textarea
                    rows={12}
                    value={menuStyling.customCss}
                    onChange={(e) => handleUpdateStyling({ customCss: e.target.value })}
                    placeholder={`/* Viết mã CSS Flatsome của bạn tại đây */\n#wide-nav, .header-bottom {\n  /* Tùy chỉnh thanh menu */\n}\n\n#wide-nav .header-nav > li > a {\n  /* Tùy chỉnh liên kết */\n}`}
                    className="w-full font-mono text-xs p-3.5 bg-slate-900 text-emerald-300 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner leading-relaxed"
                    spellCheck={false}
                  />
                  <div className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono pointer-events-none bg-slate-800/80 px-2 py-0.5 rounded">
                    CSS • Flatsome Hook: wp_head
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar (Visible across all tabs) */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Menu &amp; CSS sẽ xuất hiện ngay trên Header thanh điều hướng Flatsome.
              </span>
              <button
                type="button"
                onClick={handleSaveMenu}
                disabled={isSaving || menuItems.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Lưu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Lưu Menu &amp; Giao Diện Lên WordPress</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          ❮ Quay lại Bước 3 (Cấu Hình Theme)
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Tiếp tục sang Dựng Trang Chủ (Bước 5)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
