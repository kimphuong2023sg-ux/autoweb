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
    admin_email: string;
    permalink_structure: string;
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
    layout: string;
    default_page_template?: string;
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
  bgColor?: string;
  padding?: 'small' | 'normal' | 'large';
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
  headerButton1Color?: 'primary' | 'secondary' | 'success' | 'alert' | 'white' | 'plain';
  headerButton1Style?: 'is-flat' | 'is-outline' | 'is-shade';
  headerButton1Radius?: string;

  headerButton2Show?: boolean;
  headerButton2Text?: string;
  headerButton2Link?: string;
  headerButton2Target?: '_self' | '_blank';
  headerButton2Color?: 'primary' | 'secondary' | 'success' | 'alert' | 'white' | 'plain';
  headerButton2Style?: 'is-flat' | 'is-outline' | 'is-shade';
  headerButton2Radius?: string;

  // Header Elements
  headerShowSearch?: 'none' | 'icon' | 'form';
  headerShowCart?: boolean;
  headerShowAccount?: boolean;
  headerShowContact?: boolean;
  headerContactText?: string;
}

export interface FooterConfig {
  layout: 'corporate-4col' | 'affiliate-2col';
  brandName: string;
  bio?: string;
  hotline?: string;
  email?: string;
  address?: string;
  bgColor?: string;
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


