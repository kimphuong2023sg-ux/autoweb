export interface ConnectedSite {
  siteUrl: string;
  username?: string;
  password?: string;
  token?: string;
  name?: string;
  lastSynced?: string;
}

export interface WpInspectData {
  success: boolean;
  site: {
    name: string;
    url: string;
    theme: string;
    theme_version: string;
    is_flatsome: boolean;
    has_flatsome_installed?: boolean;
    admin_email: string;
    permalink_structure: string;
    site_icon?: number;
    site_icon_url?: string;
  };
  stats: {
    published_posts: number;
    published_pages: number;
    products: number;
    ux_blocks: number;
    active_widgets: number;
    has_hello_world: boolean;
    has_sample_page: boolean;
    is_demo_loaded: boolean;
  };
  flatsome: {
    color_primary: string;
    color_secondary: string;
    topbar_content: string;
    footer_block: string | number;
    site_logo: string;
    site_logo_id?: number;
    site_logo_dark?: string;
    site_logo_dark_id?: number;
    site_logo_sticky?: string;
    site_logo_sticky_id?: number;
    logo_width?: number;
    logo_max_width?: number | string;
    logo_padding?: number;
    logo_position?: 'left' | 'center';
    site_icon?: number;
    site_icon_url?: string;
    layout: string;
    default_page_template?: string;
    header_button_1?: string;
    header_button_1_link?: string;
    header_button_1_link_target?: string;
    header_button_1_link_rel?: string;
    header_button_1_color?: string;
    header_button_1_style?: string;
    header_button_1_radius?: string;
    header_button_2?: string;
    header_button_2_link?: string;
    header_button_2_link_target?: string;
    header_button_2_link_rel?: string;
    header_button_2_color?: string;
    header_button_2_style?: string;
    header_button_2_radius?: string;
  };
  homepage?: {
    id: number;
    title: string;
    content_length: number;
    has_ux_shortcodes: boolean;
    post_content?: string;
    savedSections?: SectionItem[];
  } | null;
  scanProgress?: {
    step1Clean: boolean;
    step2Theme: boolean;
    step3Home: boolean;
    step4Footer: boolean;
    step5Seo: boolean;
    completedCount: number;
    resumeStep: number;
  };
  ux_blocks: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
  subpage_styling?: SubpageStylingConfig;
}

export type FlatsomeElementType =
  | 'hero'
  | 'banner'
  | 'slider'
  | 'row_custom'
  | 'services'
  | 'icon_box'
  | 'image'
  | 'image_box'
  | 'about'
  | 'text_block'
  | 'title_divider'
  | 'button_group'
  | 'price_table'
  | 'testimonials'
  | 'team'
  | 'faq'
  | 'tabs'
  | 'numbers'
  | 'countdown'
  | 'video'
  | 'map'
  | 'blog'
  | 'portfolio'
  | 'gallery'
  | 'social_icons'
  | 'message_box'
  | 'divider_gap'
  | 'cta'
  | 'features';

export type ColumnLayoutPreset =
  | '1-col'
  | '2-col-equal'
  | '2-col-left-wide'
  | '2-col-right-wide'
  | '3-col-equal'
  | '4-col-equal';

export interface SectionItem {
  id: string;
  type: FlatsomeElementType;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTarget?: '_self' | '_blank';
  buttonRel?: string;
  bgColor?: string;
  padding?: string;
  layout?: ColumnLayoutPreset;
  textColor?: 'dark' | 'light';
  data?: any;
}

export interface WpMediaItem {
  id: number;
  url: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  thumb?: string;
  filename?: string;
}

export interface ThemeConfig {
  nicheId: string;
  colorPrimary: string;
  colorSecondary: string;
  topbarText: string;
  headerLayout: string;
  copyrightText: string;
  siteWidth: string;
  fontHeading: string;
  fontBody: string;
  defaultPageTemplate?: string;
  siteLayout?: string;

  // Flatsome Header Options
  headerPreset?: string;
  headerHeight?: number;
  headerBg?: string;
  headerColor?: 'light' | 'dark';
  headerWidth?: 'container' | 'full-width';

  // Header Bottom (Wide Nav Bar)
  headerBottomShow?: boolean;
  headerBottomHeight?: number;
  headerBottomBg?: string;
  headerBottomColor?: 'light' | 'dark';
  headerBottomWidth?: 'container' | 'full-width';
  headerNavNoWrap?: boolean;

  // Sticky Header
  headerSticky?: boolean;
  headerStickyBottom?: boolean;
  headerStickyHeight?: number;
  headerStickyStyle?: 'jump' | 'fade' | 'shrink';
  headerStickyHideOnScroll?: boolean;

  // Header Buttons (CTA 1 & CTA 2)
  headerButton1Show?: boolean;
  headerButton1Text?: string;
  headerButton1Link?: string;
  headerButton1Target?: '_self' | '_blank';
  headerButton1Rel?: string;
  headerButton1Color?: 'primary' | 'secondary' | 'success' | 'alert' | 'white' | 'plain';
  headerButton1Style?: 'is-flat' | 'is-outline' | 'is-shade';
  headerButton1Radius?: string;

  headerButton2Show?: boolean;
  headerButton2Text?: string;
  headerButton2Link?: string;
  headerButton2Target?: '_self' | '_blank';
  headerButton2Rel?: string;
  headerButton2Color?: 'primary' | 'secondary' | 'success' | 'alert' | 'white' | 'plain';
  headerButton2Style?: 'is-flat' | 'is-outline' | 'is-shade';
  headerButton2Radius?: string;

  // Header Elements
  headerShowSearch?: 'none' | 'icon' | 'form';
  headerShowCart?: boolean;
  headerShowAccount?: boolean;
  headerShowContact?: boolean;
  headerContactText?: string;

  // Flatsome Native Header Builder Slots
  topbarElementsLeft?: string[];
  topbarElementsCenter?: string[];
  topbarElementsRight?: string[];
  headerElementsLeft?: string[];
  headerElementsCenter?: string[];
  headerElementsRight?: string[];
  headerElementsBottomLeft?: string[];
  headerElementsBottomCenter?: string[];
  headerElementsBottomRight?: string[];

  // Element Specific Content (HTML, Blocks, Contact)
  topbarLeftHtml?: string;
  topbarRightHtml?: string;
  html3Text?: string;
  html4Text?: string;
  html5Text?: string;
  headerBlock1?: string | number;
  headerBlock2?: string | number;
  headerBlock3?: string | number;
  headerBlock4?: string | number;
  contactPhone?: string;
  contactEmail?: string;
  contactLocation?: string;
  contactHours?: string;

  // Site-wide Background Options (Nền toàn site: Màu sắc, Gradient, Ảnh nền)
  siteBgType?: 'color' | 'gradient' | 'image';
  siteBgColor?: string;
  siteBgGradientColor1?: string;
  siteBgGradientColor2?: string;
  siteBgGradientAngle?: number;
  siteBgGradientType?: 'linear' | 'radial';
  siteBgImage?: string;
  siteBgImageId?: number;
  siteBgImageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  siteBgImageSize?: 'cover' | 'contain' | 'auto';
  siteBgImagePosition?: 'center center' | 'center top' | 'left top' | 'center bottom';
  siteBgImageAttachment?: 'fixed' | 'scroll';
  siteBgOverlayColor?: string;
  siteBgOverlayEnable?: boolean;

  // Flatsome Site Logo (Theme Mods: site_logo, site_logo_dark, site_logo_sticky, logo_width, logo_max_width, logo_padding, logo_position)
  siteLogo?: string;
  siteLogoId?: number;
  siteLogoDark?: string;
  siteLogoDarkId?: number;
  siteLogoSticky?: string;
  siteLogoStickyId?: number;
  logoWidth?: number;
  logoMaxWidth?: number | string;
  logoPadding?: number;
  logoPosition?: 'left' | 'center';

  // Favicon (Site Icon)
  siteIconId?: number;
  siteIconUrl?: string;
}

export interface FooterLinkItem {
  text: string;
  url: string;
}

export interface FooterConfig {
  layout: 'corporate-4col' | 'casino-luxury' | 'magazine-3col' | 'minimal-center' | 'ecommerce-modern' | 'affiliate-2col';
  brandName: string;
  logoType?: 'text' | 'image';
  logoUrl?: string;
  logoId?: number;
  logoWidth?: number;
  bio?: string;
  hotline?: string;
  email?: string;
  address?: string;
  bgColor?: string;
  bgType?: 'solid' | 'gradient' | 'image';
  bgGradient?: string;
  bgImage?: string;
  bgImageId?: number;
  bgOverlay?: string;
  col2Title?: string;
  col2Links?: FooterLinkItem[];
  col3Title?: string;
  col3Links?: FooterLinkItem[];
  col4Title?: string;
  col4WorkingHours?: string;
  col4ExtraInfo?: string;
  col4LinkText?: string;
  col4LinkUrl?: string;
  col4Links?: FooterLinkItem[];
  disclaimerText?: string;
  badgeText?: string;
  copyrightText?: string;
}

export interface SeoEssentialsConfig {
  brandName: string;
  hotline: string;
  email: string;
  address: string;
  createPages: boolean;
  createMenu: boolean;
  setPermalinks: boolean;
}

export interface MenuItem {
  client_id: string;
  id?: number;
  title: string;
  url: string;
  slug?: string;
  type: 'custom' | 'post_type' | 'taxonomy' | 'page' | 'post' | 'category';
  object: 'page' | 'post' | 'category' | 'custom';
  object_id?: number;
  parent_client_id?: string | null;
  parent_id?: number;
  order: number;
  target?: string;
}

export interface MenuData {
  menu_id?: number;
  menu_name: string;
  locations: string[];
  items: MenuItem[];
}

export interface MenuStylingConfig {
  bgType: 'gradient' | 'solid' | 'transparent';
  bgColor: string;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: string;
  textColor: string;
  textHoverColor: string;
  itemHoverBg: string;
  fontSize: string;
  fontWeight: string;
  isUppercase: boolean;
  itemRadius: string;
  dropdownBg: string;
  dropdownTextColor: string;
  dropdownHoverBg: string;
  // Border Top, Bottom, Left, Right options
  borderStyle?: string;
  borderTopWidth?: string;
  borderTopColor?: string;
  borderBottomWidth?: string;
  borderBottomColor?: string;
  borderLeftWidth?: string;
  borderLeftColor?: string;
  borderRightWidth?: string;
  borderRightColor?: string;
  customCss: string;

  // Mobile Off-Canvas Drawer Configuration
  mobileDrawerTheme?: 'dark' | 'light' | 'match_desktop' | 'custom';
  mobileBgColor?: string;
  mobileTextColor?: string;
  mobileTextHoverColor?: string;
  mobileHoverBg?: string;
  mobileDividerColor?: string;
  mobileSubmenuBg?: string;
  mobileSubmenuTextColor?: string;
  mobileFontSize?: string;
  mobileShowSearch?: boolean;
  mobileShowSocial?: boolean;
  mobileHideWooNotice?: boolean;
  mobileShowNewsletter?: boolean;
  cleanMobileNavOnly?: boolean;
  mobileIconColor?: string;
  mobileIconHoverColor?: string;
  mobileIconBgColor?: string;
}

export interface SubpageStylingConfig {
  // Global Typography & Colors
  themeMode: 'dark' | 'light' | 'auto';
  textColor: string;          // Màu chữ nội dung (Paragraph)
  heading1Color: string;      // Màu tiêu đề H1
  heading2Color: string;      // Màu tiêu đề H2
  heading3Color: string;      // Màu tiêu đề H3
  linkColor: string;          // Màu link liên kết
  linkHoverColor: string;     // Màu hover link
  contentFontSize: string;    // 15px, 16px, 17px
  contentLineHeight: string;  // 1.6, 1.75, 1.8
  contentMaxWidth: string;    // 850px, 960px, 1080px, 1200px, 100%
  pageBgColor?: string;       // Màu nền khung bài viết (transparent / #0f172a / #ffffff)

  // Highlight Box 1: Table of Contents (Mục lục bài viết)
  tocEnabled: boolean;
  tocBgColor: string;         // #0b1329 / #1e293b
  tocBorderColor: string;     // #334155 / #38bdf8 / #eab308
  tocTitleColor: string;      // #ffffff
  tocLinkColor: string;       // #94a3b8 / #38bdf8
  tocRadius: string;          // 8px, 12px, 16px

  // Highlight Box 2: Meta Tag Badges / Pills (Thẻ nhãn tiêu đề [JUEGALOTTO], [APUESTAS DEPORTIVAS])
  badgeBorderColor: string;   // #eab308 (Gold), #38bdf8 (Cyan), #10b981 (Green)
  badgeBgColor: string;       // rgba(15, 23, 42, 0.8)
  badgeTextColor: string;     // #ffffff
  badgeRadius: string;        // 99px

  // Highlight Box 3: Callout Boxes (Hộp khuyến mãi, lưu ý, tip)
  calloutGoldBorder: string;  // #f59e0b
  calloutBlueBorder: string;  // #38bdf8
  calloutGreenBorder: string; // #10b981
  calloutBgColor: string;     // rgba(15, 23, 42, 0.85)
  calloutRadius: string;      // 12px

  // Highlight Box 4: In-Article CTA Box (Khung kêu gọi đăng ký / vào chơi giữa bài)
  ctaBoxTitle: string;
  ctaBoxSubtitle: string;
  ctaBoxButtonText: string;
  ctaBoxButtonLink: string;
  ctaBoxButtonColor: 'alert' | 'primary' | 'secondary' | 'success';
  ctaBoxRadius: string;

  // Highlight Box 5: Tables (Bảng tỷ lệ, so sánh)
  tableHeaderBg: string;
  tableHeaderColor: string;
  tableBorderColor: string;
  tableRowEvenBg: string;
  tableRowOddBg: string;
  tableRadius: string;

  // Cấu Hình Bài Viết & Gợi Ý (Single Post & Suggested Posts & Sidebar)
  postLayout?: 'right-sidebar' | 'no-sidebar' | 'left-sidebar';
  relatedPostsEnabled?: boolean;
  relatedPostsTitle?: string;
  relatedPostsCount?: number;
  relatedPostsColumns?: number;
  relatedPostsSource?: 'category' | 'recent';

  sidebarEnabled?: boolean;
  sidebarSticky?: boolean;
  sidebarSuggestedPostsEnabled?: boolean;
  sidebarSuggestedPostsTitle?: string;
  sidebarSuggestedPostsCount?: number;
  sidebarCtaEnabled?: boolean;
  sidebarCtaTitle?: string;
  sidebarCtaDesc?: string;
  sidebarCtaBtnText?: string;
  sidebarCtaBtnLink?: string;
  sidebarCleanOnly?: boolean;
  stripArchiveTitlePrefix?: boolean; // Tự động xóa "Category Archives:", "Tag Archives:" khi vào chuyên mục
  hideArchiveCategoryBadge?: boolean; // Tự động ẩn link chuyên mục nhỏ (entry-category) trên từng bài viết ở trang Category & Archive

  // Rank Math & SEO Breadcrumbs (Thanh điều hướng phân cấp chuẩn SEO)
  breadcrumbsEnabled?: boolean;
  breadcrumbsOnPosts?: boolean;
  breadcrumbsOnCategories?: boolean;
  breadcrumbsOnPages?: boolean;

  // Social Share & Post Footer Options (Mạng Xã Hội & Chân Bài Viết)
  postShareEnabled?: boolean;
  postShareTitle?: string;
  postShareNetworks?: string[];
  postShareStyle?: 'outline' | 'fill' | 'plain';
  postShareAlign?: 'center' | 'left' | 'right';
  postAuthorBoxEnabled?: boolean;
  postAuthorName?: string;
  postAuthorRole?: string;
  postAuthorAvatar?: string;
  postAuthorBio?: string;
  postAuthorLink?: string;
  postAuthorBadge?: string;
  postNavEnabled?: boolean;
  postFooterMetaEnabled?: boolean;

  // Custom CSS override
  customCss?: string;
}

export const getInitialSubpageStyling = (): SubpageStylingConfig => ({
  themeMode: 'dark',
  textColor: '#cbd5e1',
  heading1Color: '#ffffff',
  heading2Color: '#38bdf8',
  heading3Color: '#fde047',
  linkColor: '#38bdf8',
  linkHoverColor: '#fde047',
  contentFontSize: '16px',
  contentLineHeight: '1.75',
  contentMaxWidth: '1080px',
  pageBgColor: 'transparent',

  tocEnabled: true,
  tocBgColor: '#090d16',
  tocBorderColor: '#1e293b',
  tocTitleColor: '#ffffff',
  tocLinkColor: '#94a3b8',
  tocRadius: '10px',

  badgeBorderColor: '#eab308',
  badgeBgColor: 'rgba(15, 23, 42, 0.8)',
  badgeTextColor: '#ffffff',
  badgeRadius: '99px',

  calloutGoldBorder: '#f59e0b',
  calloutBlueBorder: '#38bdf8',
  calloutGreenBorder: '#10b981',
  calloutBgColor: 'rgba(15, 23, 42, 0.85)',
  calloutRadius: '12px',

  ctaBoxTitle: 'Nhận Ưu Đãi Độc Quyền Khi Đăng Ký Tài Khoản',
  ctaBoxSubtitle: 'Đăng ký ngay để nhận 100% hoàn nạp đầu tiên và hàng trăm lượt quay miễn phí!',
  ctaBoxButtonText: 'ĐĂNG KÝ NGAY HÔM NAY',
  ctaBoxButtonLink: '#register',
  ctaBoxButtonColor: 'alert',
  ctaBoxRadius: '99px',

  tableHeaderBg: '#1e293b',
  tableHeaderColor: '#f8fafc',
  tableBorderColor: '#334155',
  tableRowEvenBg: 'rgba(255, 255, 255, 0.02)',
  tableRowOddBg: 'rgba(255, 255, 255, 0.05)',
  tableRadius: '8px',

  // Post & Suggested & Sidebar
  postLayout: 'right-sidebar',
  relatedPostsEnabled: true,
  relatedPostsTitle: 'Artículos Relacionados',
  relatedPostsCount: 3,
  relatedPostsColumns: 3,
  relatedPostsSource: 'category',

  sidebarEnabled: true,
  sidebarSticky: true,
  sidebarSuggestedPostsEnabled: true,
  sidebarSuggestedPostsTitle: 'Artículos Recomendados',
  sidebarSuggestedPostsCount: 5,
  sidebarCtaEnabled: true,
  sidebarCtaTitle: 'Bono Exclusivo 100%',
  sidebarCtaDesc: 'Regístrate hoy y duplica tu primer depósito en JuegaLotto.',
  sidebarCtaBtnText: 'REGÍSTRATE AHORA',
  sidebarCtaBtnLink: '#register',
  sidebarCleanOnly: true,
  stripArchiveTitlePrefix: true,
  hideArchiveCategoryBadge: true,

  // Rank Math Breadcrumbs Defaults
  breadcrumbsEnabled: true,
  breadcrumbsOnPosts: true,
  breadcrumbsOnCategories: true,
  breadcrumbsOnPages: false,

  // Social Share & Footer Controls
  postShareEnabled: true,
  postShareTitle: 'Compartir este artículo',
  postShareNetworks: ['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'pinterest', 'linkedin'],
  postShareStyle: 'outline',
  postShareAlign: 'center',
  postAuthorBoxEnabled: true,
  postAuthorName: '',
  postAuthorRole: 'Chuyên Gia Đánh Giá & Phân Tích Casino',
  postAuthorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  postAuthorBio: 'Chuyên gia nghiên cứu thuật toán trò chơi RNG, phân tích tỷ lệ hoàn trả RTP và giấy phép cá cược trực tuyến. Cam kết đánh giá khách quan và chơi có trách nhiệm.',
  postAuthorLink: '',
  postAuthorBadge: 'Tác Giả Đã Xác Minh',
  postNavEnabled: true,
  postFooterMetaEnabled: false,

  customCss: '',
});



