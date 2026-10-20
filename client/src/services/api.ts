import { ConnectedSite, ThemeConfig, FooterConfig, SectionItem, SeoEssentialsConfig, SubpageStylingConfig } from '../types';
import { getApiUrl } from '../utils/auth';

const API_BASE = getApiUrl('/api');

export const api = {
  getAuthPayload(site: ConnectedSite) {
    return {
      siteUrl: site.siteUrl,
      username: site.username,
      password: site.password,
      token: site.token,
    };
  },

  async syncSite(site: ConnectedSite) {
    const res = await fetch(`${API_BASE}/bridge/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getAuthPayload(site)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Không thể kết nối website' }));
      throw new Error(err.message || 'Lỗi kết nối website');
    }
    return res.json();
  },

  async wipeDefaults(site: ConnectedSite, options: any) {
    const res = await fetch(`${API_BASE}/bridge/wipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), options }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi dọn dẹp' }));
      throw new Error(err.message || 'Lỗi dọn dẹp website');
    }
    return res.json();
  },

  async installFlatsomeTheme(site: ConnectedSite) {
    const res = await fetch(`${API_BASE}/bridge/install-flatsome-theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getAuthPayload(site)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi cài đặt theme Flatsome' }));
      throw new Error(err.message || 'Lỗi cài đặt theme Flatsome lên website');
    }
    return res.json();
  },

  formatThemeMods(themeConfig: ThemeConfig) {
    return {
      color_primary: themeConfig.colorPrimary,
      color_secondary: themeConfig.colorSecondary,
      topbar_text: themeConfig.topbarText,
      copyright_text: themeConfig.copyrightText,
      site_width: themeConfig.siteWidth,
      font_heading: themeConfig.fontHeading,
      font_body: themeConfig.fontBody,
      default_page_template: themeConfig.defaultPageTemplate || 'default',
      layout: themeConfig.siteLayout || 'full-width',

      // Flatsome Header options
      header_preset: themeConfig.headerPreset,
      header_layout: themeConfig.headerLayout,
      header_height: themeConfig.headerHeight || 90,
      header_height_transparent: 90,
      header_bg: themeConfig.headerBg,
      header_color: themeConfig.headerColor,
      header_width: themeConfig.headerWidth || 'container',

      // Flatsome Logo Options
      site_logo: themeConfig.siteLogo ?? '',
      site_logo_id: themeConfig.siteLogoId ?? 0,
      site_logo_dark: themeConfig.siteLogoDark ?? '',
      site_logo_dark_id: themeConfig.siteLogoDarkId ?? 0,
      site_logo_sticky: themeConfig.siteLogoSticky ?? '',
      site_logo_sticky_id: themeConfig.siteLogoStickyId ?? 0,
      logo_width: themeConfig.logoWidth ?? 200,
      logo_max_width: themeConfig.logoMaxWidth ?? '',
      logo_padding: themeConfig.logoPadding ?? 0,
      logo_position: themeConfig.logoPosition ?? 'left',

      // Header Bottom
      header_bottom_show: themeConfig.headerBottomShow,
      header_bottom_height: themeConfig.headerBottomHeight,
      header_bottom_bg: themeConfig.headerBottomBg,
      header_bottom_color: themeConfig.headerBottomColor,
      header_bottom_width: themeConfig.headerBottomWidth || 'full-width',
      header_nav_no_wrap: themeConfig.headerNavNoWrap ?? true,

      // Sticky Header
      header_sticky: themeConfig.headerSticky ? 1 : 0,
      bottombar_sticky: themeConfig.headerStickyBottom ? 1 : 0,
      header_height_sticky: themeConfig.headerStickyHeight,
      sticky_style: themeConfig.headerStickyStyle,
      sticky_hide_on_scroll: themeConfig.headerStickyHideOnScroll ? 1 : 0,

      // Header Buttons
      header_button_1_show: themeConfig.headerButton1Show,
      header_button_1: themeConfig.headerButton1Text,
      header_button_1_link: themeConfig.headerButton1Link,
      header_button_1_link_target: themeConfig.headerButton1Target || '_self',
      header_button_1_link_rel: themeConfig.headerButton1Rel ?? '',
      header_button_1_color: themeConfig.headerButton1Color,
      header_button_1_style: themeConfig.headerButton1Style,
      header_button_1_radius: themeConfig.headerButton1Radius,

      header_button_2_show: themeConfig.headerButton2Show,
      header_button_2: themeConfig.headerButton2Text,
      header_button_2_link: themeConfig.headerButton2Link,
      header_button_2_link_target: themeConfig.headerButton2Target || '_self',
      header_button_2_link_rel: themeConfig.headerButton2Rel ?? '',
      header_button_2_color: themeConfig.headerButton2Color,
      header_button_2_style: themeConfig.headerButton2Style,
      header_button_2_radius: themeConfig.headerButton2Radius,

      // Header Elements
      header_show_search: themeConfig.headerShowSearch,
      header_show_cart: themeConfig.headerShowCart,
      header_show_account: themeConfig.headerShowAccount,
      header_show_contact: themeConfig.headerShowContact,
      header_contact_text: themeConfig.headerContactText,

      // Flatsome Native Header Builder Slots
      topbar_elements_left: themeConfig.topbarElementsLeft || [],
      topbar_elements_center: themeConfig.topbarElementsCenter || [],
      topbar_elements_right: themeConfig.topbarElementsRight || [],
      header_elements_left: themeConfig.headerElementsLeft || [],
      header_elements_center: themeConfig.headerElementsCenter || [],
      header_elements_right: themeConfig.headerElementsRight || [],
      header_elements_bottom_left: themeConfig.headerElementsBottomLeft || [],
      header_elements_bottom_center: themeConfig.headerElementsBottomCenter || [],
      header_elements_bottom_right: themeConfig.headerElementsBottomRight || [],

      // Element Content (HTML, Blocks, Contact)
      topbar_left: themeConfig.topbarLeftHtml || '',
      topbar_right: themeConfig.topbarRightHtml || '',
      top_right_text: themeConfig.html3Text || '',
      nav_position_text_top: themeConfig.html4Text || '',
      nav_position_text: themeConfig.html5Text || '',
      header_block_1: themeConfig.headerBlock1 || '',
      header_block_2: themeConfig.headerBlock2 || '',
      header_block_3: themeConfig.headerBlock3 || '',
      header_block_4: themeConfig.headerBlock4 || '',
      contact_phone: themeConfig.contactPhone || '',
      contact_email: themeConfig.contactEmail || '',
      contact_location: themeConfig.contactLocation || '',
      contact_hours: themeConfig.contactHours || '',
    };
  },

  async applyThemeMods(site: ConnectedSite, themeConfig: ThemeConfig) {
    const payload = this.formatThemeMods(themeConfig);
    const res = await fetch(`${API_BASE}/bridge/theme-mods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), themeMods: payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi áp dụng theme mods' }));
      throw new Error(err.message || 'Lỗi cập nhật cấu hình theme');
    }
    return res.json();
  },

  async applySiteBackground(site: ConnectedSite, themeConfig: ThemeConfig) {
    const payload = {
      header_width: themeConfig.headerWidth || 'full-width',
      header_bottom_width: themeConfig.headerWidth === 'container' ? 'container' : 'full-width',
      site_bg_type: themeConfig.siteBgType || 'color',
      site_bg_color: themeConfig.siteBgColor || '#ffffff',
      site_bg_gradient_color1: themeConfig.siteBgGradientColor1 || '#0f172a',
      site_bg_gradient_color2: themeConfig.siteBgGradientColor2 || '#1e293b',
      site_bg_gradient_angle: themeConfig.siteBgGradientAngle ?? 135,
      site_bg_gradient_type: themeConfig.siteBgGradientType || 'linear',
      site_bg_image: themeConfig.siteBgImage || '',
      site_bg_image_id: themeConfig.siteBgImageId || 0,
      site_bg_image_repeat: themeConfig.siteBgImageRepeat || 'no-repeat',
      site_bg_image_size: themeConfig.siteBgImageSize || 'cover',
      site_bg_image_position: themeConfig.siteBgImagePosition || 'center center',
      site_bg_image_attachment: themeConfig.siteBgImageAttachment || 'fixed',
      site_bg_overlay_color: themeConfig.siteBgOverlayColor || 'rgba(0, 0, 0, 0.45)',
      site_bg_overlay_enable: themeConfig.siteBgOverlayEnable ? 1 : 0,
      restore_front_page_blank: true,
    };
    const res = await fetch(`${API_BASE}/bridge/theme-mods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), themeMods: payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi áp dụng nền website' }));
      throw new Error(err.message || 'Lỗi cập nhật nền website');
    }
    return res.json();
  },

  async restoreFrontPageBlank(site: ConnectedSite) {
    const payload = {
      restore_front_page_blank: true,
      default_page_template: 'full-width',
    };
    const res = await fetch(`${API_BASE}/bridge/theme-mods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), themeMods: payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi khôi phục trang chủ' }));
      throw new Error(err.message || 'Lỗi khôi phục trang chủ');
    }
    return res.json();
  },

  async setFavicon(
    site: ConnectedSite,
    data: {
      mediaId?: number;
      fileData?: string;
      imageUrl?: string;
      filename?: string;
      remove?: boolean;
    },
  ) {
    const res = await fetch(`${API_BASE}/bridge/set-favicon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), ...data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi cập nhật Favicon' }));
      throw new Error(err.message || 'Lỗi cập nhật Favicon cho website');
    }
    return res.json();
  },

  async deployFooter(site: ConnectedSite, footerConfig: FooterConfig) {
    const res = await fetch(`${API_BASE}/bridge/deploy-footer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), footerConfig }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi deploy footer' }));
      throw new Error(err.message || 'Lỗi triển khai Footer');
    }
    return res.json();
  },

  async deployHomepage(site: ConnectedSite, sections: SectionItem[], title?: string) {
    const res = await fetch(`${API_BASE}/bridge/deploy-homepage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.getAuthPayload(site), sections, title }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi deploy homepage' }));
      throw new Error(err.message || 'Lỗi triển khai Trang Chủ');
    }
    return res.json();
  },

  async setupEssentials(site: ConnectedSite, essentials: SeoEssentialsConfig) {
    const res = await fetch(`${API_BASE}/bridge/setup-essentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        essentials: {
          brand_name: essentials.brandName,
          hotline: essentials.hotline,
          email: essentials.email,
          address: essentials.address,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi setup essentials' }));
      throw new Error(err.message || 'Lỗi tạo trang chính sách SEO');
    }
    return res.json();
  },

  async batchCreateContent(
    site: ConnectedSite,
    payload: {
      default_type?: 'page' | 'post' | 'category';
      items: Array<{
        id?: number | string;
        term_id?: number;
        title: string;
        slug: string;
        type?: 'page' | 'post' | 'category';
        description?: string;
        content?: string;
      }>;
    }
  ) {
    const res = await fetch(`${API_BASE}/bridge/batch-create-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        default_type: payload.default_type || 'page',
        items: payload.items || [],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi tạo liên kết hàng loạt' }));
      throw new Error(err.message || 'Lỗi khi tạo liên kết hàng loạt lên WordPress');
    }
    return res.json();
  },

  async listContent(site: ConnectedSite, options: { type?: string } = {}) {
    const res = await fetch(`${API_BASE}/bridge/list-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        type: options.type || 'all',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi lấy danh sách nội dung' }));
      throw new Error(err.message || 'Lỗi khi tải danh sách từ WordPress');
    }
    return res.json();
  },

  async deleteContent(
    site: ConnectedSite,
    payload: { type: string; id?: number; slug?: string }
  ) {
    const res = await fetch(`${API_BASE}/bridge/delete-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        ...payload,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi xóa nội dung trên WordPress' }));
      throw new Error(err.message || 'Lỗi khi xóa nội dung trên WordPress');
    }
    return res.json();
  },

  async getMenu(site: ConnectedSite, params: { menu_id?: number; menu_name?: string } = {}) {
    const res = await fetch(`${API_BASE}/bridge/get-menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        ...params,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi tải menu từ WordPress' }));
      throw new Error(err.message || 'Lỗi khi tải Menu từ WordPress');
    }
    return res.json();
  },

  async saveMenu(
    site: ConnectedSite,
    payload: {
      menu_id?: number;
      menu_name: string;
      items: any[];
      locations?: string[];
      styling?: any;
    }
  ) {
    const res = await fetch(`${API_BASE}/bridge/save-menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        ...payload,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi lưu menu lên WordPress' }));
      throw new Error(err.message || 'Lỗi khi lưu Menu lên WordPress');
    }
    return res.json();
  },

  async deployAll(
    site: ConnectedSite,
    payload: {
      themeConfig: ThemeConfig;
      footerConfig: FooterConfig;
      sections: SectionItem[];
      essentials: SeoEssentialsConfig;
      wipeFirst?: boolean;
    }
  ) {
    const formattedPayload = {
      ...this.getAuthPayload(site),
      themeMods: this.formatThemeMods(payload.themeConfig),
      footerConfig: payload.footerConfig,
      sections: payload.sections,
      essentials: {
        brand_name: payload.essentials.brandName,
        hotline: payload.essentials.hotline,
        email: payload.essentials.email,
        address: payload.essentials.address,
      },
      wipeFirst: payload.wipeFirst,
      wipeOptions: {
        wipe_posts: true,
        wipe_pages: true,
        wipe_products: true,
        wipe_widgets: true,
        wipe_menus: true,
      },
    };

    const res = await fetch(`${API_BASE}/bridge/deploy-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi khi triển khai website' }));
      throw new Error(err.message || 'Lỗi triển khai toàn bộ website');
    }
    return res.json();
  },

  async autoInstallPlugin(site: ConnectedSite) {
    const res = await fetch(`${API_BASE}/bridge/auto-install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getAuthPayload(site)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi cài đặt plugin' }));
      throw new Error(err.message || 'Lỗi cài đặt plugin lên WordPress');
    }
    return res.json();
  },

  async pushPluginCode(site: ConnectedSite) {
    const res = await fetch(`${API_BASE}/bridge/push-plugin-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getAuthPayload(site)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi đẩy code plugin' }));
      throw new Error(err.message || 'Lỗi đẩy code mới lên WordPress');
    }
    return res.json();
  },

  async uploadMedia(
    site: ConnectedSite,
    data: {
      filename?: string;
      fileData?: string;
      imageUrl?: string;
      altText?: string;
      title?: string;
      caption?: string;
      description?: string;
    },
  ) {
    const res = await fetch(`${API_BASE}/bridge/upload-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        ...data,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi tải ảnh lên WordPress' }));
      throw new Error(err.message || 'Lỗi tải ảnh lên Media WordPress');
    }
    return res.json();
  },

  async updateMedia(
    site: ConnectedSite,
    data: {
      mediaId: number;
      altText?: string;
      title?: string;
      caption?: string;
      description?: string;
    }
  ) {
    const res = await fetch(`${API_BASE}/bridge/update-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        ...data,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi cập nhật ảnh' }));
      throw new Error(err.message || 'Lỗi cập nhật thông tin ảnh trên WordPress');
    }
    return res.json();
  },

  async listMedia(site: ConnectedSite) {
    const res = await fetch(`${API_BASE}/bridge/list-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getAuthPayload(site)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi lấy danh sách Media' }));
      throw new Error(err.message || 'Lỗi lấy thư viện Media WordPress');
    }
    return res.json();
  },

  async deleteMedia(site: ConnectedSite, mediaId: number) {
    const res = await fetch(`${API_BASE}/bridge/delete-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        mediaId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi xóa ảnh khỏi Media' }));
      throw new Error(err.message || 'Lỗi xóa ảnh khỏi Thư viện Media WordPress');
    }
    return res.json();
  },

  async deleteBulkMedia(site: ConnectedSite, mediaIds: number[]) {
    const res = await fetch(`${API_BASE}/bridge/delete-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        mediaIds,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi xóa hàng loạt ảnh khỏi Media' }));
      throw new Error(err.message || 'Lỗi xóa hàng loạt ảnh khỏi Thư viện Media WordPress');
    }
    return res.json();
  },

  async getTemplates() {
    const [sections, niches, footers] = await Promise.all([
      fetch(`${API_BASE}/templates/sections`).then((r) => r.json()),
      fetch(`${API_BASE}/templates/niches`).then((r) => r.json()),
      fetch(`${API_BASE}/templates/footers`).then((r) => r.json()),
    ]);
    return { sections, niches, footers };
  },

  async saveSubpageStyling(site: ConnectedSite, styling: SubpageStylingConfig) {
    const res = await fetch(`${API_BASE}/bridge/save-subpage-styling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...this.getAuthPayload(site),
        styling,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi lưu cấu hình style trang con' }));
      throw new Error(err.message || 'Lỗi lưu cấu hình style trang con lên WordPress');
    }
    return res.json();
  },
};

