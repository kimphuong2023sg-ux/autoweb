import { ConnectedSite, ThemeConfig, FooterConfig, SectionItem, SeoEssentialsConfig } from '../types';

const API_BASE = '/api';

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
      header_width: themeConfig.headerWidth,

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
      header_button_1_color: themeConfig.headerButton1Color,
      header_button_1_style: themeConfig.headerButton1Style,
      header_button_1_radius: themeConfig.headerButton1Radius,

      header_button_2_show: themeConfig.headerButton2Show,
      header_button_2: themeConfig.headerButton2Text,
      header_button_2_link: themeConfig.headerButton2Link,
      header_button_2_link_target: themeConfig.headerButton2Target || '_self',
      header_button_2_color: themeConfig.headerButton2Color,
      header_button_2_style: themeConfig.headerButton2Style,
      header_button_2_radius: themeConfig.headerButton2Radius,

      // Header Elements
      header_show_search: themeConfig.headerShowSearch,
      header_show_cart: themeConfig.headerShowCart,
      header_show_account: themeConfig.headerShowAccount,
      header_show_contact: themeConfig.headerShowContact,
      header_contact_text: themeConfig.headerContactText,
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
};

