import { Injectable } from '@nestjs/common';

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
  layout?: '1-col' | '2-col-equal' | '2-col-left-wide' | '2-col-right-wide' | '3-col-equal' | '4-col-equal';
  textColor?: 'dark' | 'light';
  data?: any;
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
  copyright?: string;
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

@Injectable()
export class CompilerService {
  /**
   * Biên dịch danh sách các Section thành chuỗi Flatsome UX Builder Shortcodes
   */
  compilePageSections(sections: SectionItem[]): string {
    const shortcodeParts: string[] = [];
    const statePayload = Buffer.from(JSON.stringify(sections)).toString('base64');
    const stateComment = `<!-- FLATSOME_BUILDER_STATE:${statePayload} -->\n`;

    for (const sec of sections) {
      switch (sec.type) {
        case 'hero':
          shortcodeParts.push(this.renderHeroSection(sec));
          break;
        case 'banner':
          shortcodeParts.push(this.renderBannerSection(sec));
          break;
        case 'slider':
          shortcodeParts.push(this.renderSliderSection(sec));
          break;
        case 'row_custom':
          shortcodeParts.push(this.renderRowCustomSection(sec));
          break;
        case 'services':
        case 'icon_box':
          shortcodeParts.push(this.renderServicesSection(sec));
          break;
        case 'about':
          shortcodeParts.push(this.renderAboutSection(sec));
          break;
        case 'image':
          shortcodeParts.push(this.renderImageSection(sec));
          break;
        case 'image_box':
          shortcodeParts.push(this.renderImageBoxSection(sec));
          break;
        case 'text_block':
          shortcodeParts.push(this.renderTextBlockSection(sec));
          break;
        case 'title_divider':
          shortcodeParts.push(this.renderTitleDividerSection(sec));
          break;
        case 'price_table':
          shortcodeParts.push(this.renderPriceTableSection(sec));
          break;
        case 'testimonials':
          shortcodeParts.push(this.renderTestimonialsSection(sec));
          break;
        case 'team':
          shortcodeParts.push(this.renderTeamSection(sec));
          break;
        case 'faq':
          shortcodeParts.push(this.renderFaqSection(sec));
          break;
        case 'tabs':
          shortcodeParts.push(this.renderTabsSection(sec));
          break;
        case 'numbers':
          shortcodeParts.push(this.renderNumbersSection(sec));
          break;
        case 'countdown':
          shortcodeParts.push(this.renderCountdownSection(sec));
          break;
        case 'video':
          shortcodeParts.push(this.renderVideoSection(sec));
          break;
        case 'map':
          shortcodeParts.push(this.renderMapSection(sec));
          break;
        case 'blog':
          shortcodeParts.push(this.renderBlogSection(sec));
          break;
        case 'portfolio':
          shortcodeParts.push(this.renderPortfolioSection(sec));
          break;
        case 'gallery':
          shortcodeParts.push(this.renderGallerySection(sec));
          break;
        case 'social_icons':
          shortcodeParts.push(this.renderSocialIconsSection(sec));
          break;
        case 'message_box':
          shortcodeParts.push(this.renderMessageBoxSection(sec));
          break;
        case 'divider_gap':
          shortcodeParts.push(this.renderDividerGapSection(sec));
          break;
        case 'cta':
          shortcodeParts.push(this.renderCtaSection(sec));
          break;
        case 'features':
          shortcodeParts.push(this.renderFeaturesSection(sec));
          break;
        default:
          break;
      }
    }

    return shortcodeParts.join('\n\n').trim();
  }

  /**
   * Trích xuất danh sách SectionItem từ nội dung Trang chủ WordPress
   * Ưu tiên 1: Giải mã từ comment <!-- FLATSOME_BUILDER_STATE:xxx -->
   * Ưu tiên 2: Parse shortcodes gốc như [ux_image id="..."]
   */
  extractSectionsFromContent(content?: string): SectionItem[] | null {
    if (!content || typeof content !== 'string') return null;

    // 1. Giải mã base64 state tag nếu có
    const stateMatch = content.match(/<!--\s*FLATSOME_BUILDER_STATE:([A-Za-z0-9+/=]+)\s*-->/);
    if (stateMatch && stateMatch[1]) {
      try {
        const decoded = Buffer.from(stateMatch[1], 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Failed to decode FLATSOME_BUILDER_STATE from comment:', err);
      }
    }

    // 2. Dự phòng: Quét các shortcode ảnh / banner từ nội dung gốc nếu chưa có tag
    const recoveredSections: SectionItem[] = [];

    const imageRegex = /\[ux_image\s+id="(\d+)"([^\]]*)\]/g;
    let imgMatch: RegExpExecArray | null;
    let imgIdx = 1;
    while ((imgMatch = imageRegex.exec(content)) !== null) {
      const imgId = imgMatch[1];
      const attrs = imgMatch[2] || '';
      const altMatch = attrs.match(/image_alt="([^"]*)"/);
      const linkMatch = attrs.match(/link="([^"]*)"/);
      recoveredSections.push({
        id: `recovered-img-${imgIdx++}`,
        type: 'image',
        title: `Khối Ảnh #${imgId}`,
        buttonLink: linkMatch ? linkMatch[1] : '#',
        data: {
          imageId: imgId,
          alt: altMatch ? altMatch[1] : '',
        },
      });
    }

    const bannerRegex = /\[ux_banner[^\]]*\]([\s\S]*?)\[\/ux_banner\]/g;
    let bannerMatch: RegExpExecArray | null;
    let bannerIdx = 1;
    while ((bannerMatch = bannerRegex.exec(content)) !== null) {
      const inner = bannerMatch[1];
      const titleMatch = inner.match(/\[title[^\]]*text="([^"]*)"/);
      recoveredSections.push({
        id: `recovered-banner-${bannerIdx++}`,
        type: 'banner',
        title: titleMatch ? titleMatch[1] : `Banner ${bannerIdx}`,
      });
    }

    if (recoveredSections.length > 0) {
      return recoveredSections;
    }

    return null;
  }

  private getPaddingConfig(padding?: string): { singleVal: string; top?: number; bottom?: number; isCustom: boolean } {
    if (!padding) return { singleVal: '60px', isCustom: false };
    const p = padding.trim().toLowerCase();
    if (p === 'none' || p === '0' || p === '0px') return { singleVal: '0px', isCustom: false };
    if (p === '5px' || p === 'xs') return { singleVal: '5px', isCustom: false };
    if (p === 'tight' || p === '10px') return { singleVal: '10px', isCustom: false };
    if (p === 'compact' || p === '15px' || p === 'sm') return { singleVal: '15px', isCustom: false };
    if (p === '20px') return { singleVal: '20px', isCustom: false };
    if (p === 'small' || p === '35px') return { singleVal: '35px', isCustom: false };
    if (p === 'normal' || p === '60px') return { singleVal: '60px', isCustom: false };
    if (p === 'large' || p === '90px') return { singleVal: '90px', isCustom: false };
    if (p === 'xl' || p === '120px') return { singleVal: '120px', isCustom: false };

    // Check if it's formatted as "Top px ... Bottom px ..."
    const parts = p.split(/\s+/);
    if (parts.length >= 3) {
      const top = parseInt(parts[0], 10);
      const bottom = parseInt(parts[2], 10);
      if (!isNaN(top) && !isNaN(bottom)) {
        if (top === bottom) {
          return { singleVal: `${top}px`, isCustom: false };
        }
        return { singleVal: '0px', top, bottom, isCustom: true };
      }
    } else if (parts.length === 1) {
      const match = parts[0].match(/^(\d+)(px|rem|em|%)?$/);
      if (match) {
        return { singleVal: `${match[1]}px`, isCustom: false };
      }
    }

    return { singleVal: '60px', isCustom: false };
  }

  private getPaddingVal(padding?: string): string {
    return this.getPaddingConfig(padding).singleVal;
  }

  private getVisibilityAttr(sec: SectionItem): string {
    const v = (sec.data?.visibility || '').trim();
    if (v && v !== 'visible') {
      return ` visibility="${v}"`;
    }
    return '';
  }

  private renderHeroSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const title = sec.title || 'Giải Pháp Đột Phá Cho Doanh Nghiệp Bạn';
    const subtitle = sec.subtitle || '';
    const btnText = sec.buttonText || '';
    const btnLink = sec.buttonLink || '#contact';
    const btnTarget = sec.buttonTarget || sec.data?.buttonTarget || sec.data?.button1Target || '_self';
    const btnRel = sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel !== undefined ? sec.data.buttonRel : (sec.data?.button1Rel !== undefined ? sec.data.button1Rel : 'nofollow'));
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    const titleBlock = title ? `[title style="bold" text="${title}" tag_name="h1" size="140"]` : '';
    const subtitleBlock = subtitle ? `\n[ux_text font_size="1.1" text_color="rgb(80, 80, 80)"]\n<p>${subtitle}</p>\n[/ux_text]` : '';
    const targetAttr = btnTarget && btnTarget !== '_self' ? ` target="${btnTarget}"` : '';
    const relAttr = btnRel ? ` rel="${btnRel}"` : '';
    const buttonBlock = btnText ? `\n[gap height="15px"]\n[button text="${btnText}" link="${btnLink}"${targetAttr}${relAttr} color="primary" size="large" radius="6"]` : '';

    const hasImage = Boolean(sec.data?.imageId || sec.data?.imageUrl);
    const imageBlock = hasImage ? `[ux_image id="${sec.data?.imageId || ''}" image_size="large" depth="2" depth_hover="4"]` : '';

    if (!hasImage) {
      return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row v_align="middle"]
[col span="12" align="center"]
${titleBlock}${subtitleBlock}${buttonBlock}
[/col]
[/row]
[/section]`;
    }

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row v_align="middle"]
[col span="7" span__sm="12"]
${titleBlock}${subtitleBlock}${buttonBlock}
[/col]
[col span="5" span__sm="12" align="center"]
${imageBlock}
[/col]
[/row]
[/section]`;
  }

  private renderServicesSection(sec: SectionItem): string {
    const title = sec.title || 'Dịch Vụ Nổi Bật';
    const subtitle = sec.subtitle || 'Các giải pháp toàn diện giúp doanh nghiệp bứt phá doanh thu';
    const items = sec.data?.items || [
      { title: 'Tư Vấn Chiến Lược', desc: 'Định hình lộ trình phát triển chính xác và tiết kiệm ngân sách.' },
      { title: 'Triển Khai Chuyên Nghiệp', desc: 'Đội ngũ chuyên gia giàu kinh nghiệm thực chiến theo chuẩn quốc tế.' },
      { title: 'Tối Ưu & Đo Lường', desc: 'Báo cáo minh bạch, cam kết hiệu quả theo KPI rõ ràng.' }
    ];

    let cols = '';
    for (const item of items) {
      cols += `[col span="4" span__sm="12"]
[featured_box title="${item.title}" img="" pos="center" icon_border="2"]
<p>${item.desc}</p>
[/featured_box]
[/col]\n`;
    }

    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[ux_text text_color="rgb(100, 100, 100)"]
<p>${subtitle}</p>
[/ux_text]
[gap height="25px"]
[/col]
[/row]
[row col_bg="rgb(248, 250, 252)" col_bg_radius="10" padding="25px 20px 25px 20px"]
${cols}[/row]
[/section]`;
  }

  private renderAboutSection(sec: SectionItem): string {
    const title = sec.title || 'Về Chúng Tôi';
    const subtitle = sec.subtitle || 'Hành trình hơn 10 năm khẳng định vị thế và niềm tin từ khách hàng';
    const content = sec.content || 'Chúng tôi tiên phong trong việc ứng dụng công nghệ hiện đại nhằm mang lại trải nghiệm tối ưu nhất. Với tiêu chí lấy khách hàng làm trung tâm, mỗi dự án đều là tâm huyết được trau chuốt tỉ mỉ.';
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    const btnText = sec.buttonText || 'Xem Chi Tiết';
    const btnLink = sec.buttonLink || '#contact';
    const btnTarget = sec.buttonTarget || sec.data?.buttonTarget || '_self';
    const btnRel = sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel !== undefined ? sec.data.buttonRel : 'nofollow');
    const targetAttr = btnTarget && btnTarget !== '_self' ? ` target="${btnTarget}"` : '';
    const relAttr = btnRel ? ` rel="${btnRel}"` : '';

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row v_align="middle"]
[col span="6" span__sm="12"]
[ux_image id="" image_size="large" depth="1" depth_hover="3"]
[/col]
[col span="6" span__sm="12"]
[title style="bold" text="${title}" tag_name="h2"]
[ux_text font_size="1.05" text_color="rgb(70, 70, 70)"]
<p><strong>${subtitle}</strong></p>
<p>${content}</p>
<ul>
  <li>Cam kết chất lượng chuẩn đầu ra</li>
  <li>Đội ngũ tư vấn tận tâm 24/7</li>
  <li>Chính sách bảo hành và hậu mãi minh bạch</li>
</ul>
[/ux_text]
[gap height="10px"]
[button text="${btnText}" link="${btnLink}"${targetAttr}${relAttr} color="primary" radius="5"]
[/col]
[/row]
[/section]`;
  }

  private renderBlogSection(sec: SectionItem): string {
    const title = sec.title || 'Tin Tức & Kiến Thức Mới Nhất';
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row]
[col span="12"]
[blog_posts type="row" columns="3" count="3" image_height="56.25%" show_date="true" excerpt_length="18" readmore="Đọc tiếp" readmore_style="link"]
[/col]
[/row]
[/section]`;
  }

  private renderFaqSection(sec: SectionItem): string {
    const title = sec.title || 'Câu Hỏi Thường Gặp (FAQ)';
    const faqs = sec.data?.faqs || [
      { q: 'Thời gian hoàn thành một dự án thường mất bao lâu?', a: 'Tùy thuộc vào quy mô, thông thường từ 3 đến 7 ngày làm việc.' },
      { q: 'Quy trình tiếp nhận và xử lý yêu cầu diễn ra như thế nào?', a: 'Khách hàng liên hệ -> Tư vấn & khảo sát -> Lên phương án & báo giá -> Triển khai và nghiệm thu.' },
      { q: 'Chính sách hỗ trợ sau khi bàn giao dự án?', a: 'Chúng tôi hỗ trợ kỹ thuật miễn phí trong suốt quá trình vận hành.' }
    ];

    let items = '';
    for (const item of faqs) {
      items += `[accordion-item title="${item.q}"]
<p>${item.a}</p>
[/accordion-item]\n`;
    }

    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row]
[col span="12"]
[accordion]
${items}[/accordion]
[/col]
[/row]
[/section]`;
  }

  private renderCtaSection(sec: SectionItem): string {
    const title = sec.title || 'Sẵn Sàng Nâng Tầm Dự Án Của Bạn?';
    const subtitle = sec.subtitle || '';
    const btnText = sec.buttonText || '';
    const btnLink = sec.buttonLink || 'tel:0988000000';
    const btnTarget = sec.buttonTarget || sec.data?.buttonTarget || '_self';
    const btnRel = sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel !== undefined ? sec.data.buttonRel : 'nofollow');
    const bg = sec.bgColor || 'rgb(30, 41, 59)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    const titleBlock = title ? `[title style="bold" text="${title}" color="rgb(255, 255, 255)" tag_name="h2"]` : '';
    const subtitleBlock = subtitle ? `\n[ux_text text_color="rgb(226, 232, 240)"]\n<p>${subtitle}</p>\n[/ux_text]` : '';
    const targetAttr = btnTarget && btnTarget !== '_self' ? ` target="${btnTarget}"` : '';
    const relAttr = btnRel ? ` rel="${btnRel}"` : '';
    const buttonBlock = btnText ? `[button text="${btnText}" link="${btnLink}"${targetAttr}${relAttr} color="white" style="primary" size="large" radius="6"]` : '';

    if (!btnText) {
      return `[section bg_color="${bg}" dark="true" padding="${padding}"${vis}]
[row v_align="middle"]
[col span="12" align="center"]
${titleBlock}${subtitleBlock}
[/col]
[/row]
[/section]`;
    }

    return `[section bg_color="${bg}" dark="true" padding="${padding}"${vis}]
[row v_align="middle"]
[col span="8" span__sm="12"]
${titleBlock}${subtitleBlock}
[/col]
[col span="4" span__sm="12" align="right" align__sm="center"]
${buttonBlock}
[/col]
[/row]
[/section]`;
  }

  private renderNumbersSection(sec: SectionItem): string {
    const title = sec.title || 'Con Số Ấn Tượng';
    const bg = sec.bgColor || 'rgb(241, 245, 249)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="3" span__sm="6" align="center"]
[title style="bold-center" text="500+" tag_name="h2" size="180" color="rgb(37, 99, 235)"]
<p>Dự Án Thành Công</p>
[/col]
[col span="3" span__sm="6" align="center"]
[title style="bold-center" text="98%" tag_name="h2" size="180" color="rgb(37, 99, 235)"]
<p>Khách Hàng Hài Lòng</p>
[/col]
[col span="3" span__sm="6" align="center"]
[title style="bold-center" text="10+" tag_name="h2" size="180" color="rgb(37, 99, 235)"]
<p>Năm Kinh Nghiệm</p>
[/col]
[col span="3" span__sm="6" align="center"]
[title style="bold-center" text="24/7" tag_name="h2" size="180" color="rgb(37, 99, 235)"]
<p>Hỗ Trợ Kỹ Thuật</p>
[/col]
[/row]
[/section]`;
  }

  private renderFeaturesSection(sec: SectionItem): string {
    const title = sec.title || 'Lợi Ích Khi Hợp Tác';
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row]
[col span="4" span__sm="12"]
[icon_box icon="icon-checkmark" title="Tối Ưu Tốc Độ" pos="left"]
<p>Website tải cực nhanh, chuẩn Core Web Vitals của Google.</p>
[/icon_box]
[/col]
[col span="4" span__sm="12"]
[icon_box icon="icon-shield" title="Bảo Mật Cao" pos="left"]
<p>Chống mã độc, bảo vệ toàn diện dữ liệu khách hàng.</p>
[/icon_box]
[/col]
[col span="4" span__sm="12"]
[icon_box icon="icon-star" title="Chuẩn SEO Onpage" pos="left"]
<p>Cấu trúc Silo khoa học, thân thiện tuyệt đối với Google Bot.</p>
[/icon_box]
[/col]
[/row]
[/section]`;
  }

  private renderBannerSection(sec: SectionItem): string {
    const title = sec.title || '';
    const subtitle = sec.subtitle || '';
    const btnText = sec.buttonText || '';
    const btnLink = sec.buttonLink || '#';
    const btnTarget = sec.buttonTarget || sec.data?.buttonTarget || '_self';
    const btnRel = sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel !== undefined ? sec.data.buttonRel : 'nofollow');
    const bg = sec.bgColor || 'rgb(15, 23, 42)';
    const bgImg = sec.data?.imageId ? `bg="${sec.data.imageId}"` : (sec.data?.imageUrl ? `bg="${sec.data.imageUrl}"` : '');
    const vis = this.getVisibilityAttr(sec);

    const titleBlock = title ? `[title style="bold" text="${title}" color="rgb(255,255,255)" tag_name="h1" size="140"]` : '';
    const subtitleBlock = subtitle ? `\n<p style="color: #f1f5f9; font-size: 1.15em;">${subtitle}</p>` : '';
    const targetAttr = btnTarget && btnTarget !== '_self' ? ` target="${btnTarget}"` : '';
    const relAttr = btnRel ? ` rel="${btnRel}"` : '';
    const buttonBlock = btnText ? `\n[gap height="10px"]\n[button text="${btnText}" link="${btnLink}"${targetAttr}${relAttr} color="primary" size="large" radius="6"]` : '';

    const hasTextBoxContent = Boolean(titleBlock || subtitleBlock || buttonBlock);
    const textBoxContent = hasTextBoxContent
      ? `\n[text_box width="60" position_x="50" position_y="50" text_align="center" text_depth="1"]\n${titleBlock}${subtitleBlock}${buttonBlock}\n[/text_box]`
      : '';

    return `[section bg_color="${bg}" padding="0px"${vis}]
[ux_banner height="450px" ${bgImg} bg_overlay="rgba(0,0,0,0.4)" animate="fadeIn"]${textBoxContent}
[/ux_banner]
[/section]`;
  }

  private renderSliderSection(sec: SectionItem): string {
    const vis = this.getVisibilityAttr(sec);
    return `[section padding="0px"${vis}]
[ux_slider nav_style="simple" bullets="true" auto_slide="true"]
[ux_banner height="400px" bg_overlay="rgba(0,0,0,0.3)"]
[text_box position_x="50" position_y="50" text_align="center"]
<h3>${sec.title || 'Slide 1 - Giải Pháp Đột Phá'}</h3>
<p>${sec.subtitle || 'Dịch vụ chuyên nghiệp hàng đầu'}</p>
[/text_box]
[/ux_banner]
[ux_banner height="400px" bg_overlay="rgba(0,0,0,0.3)"]
[text_box position_x="50" position_y="50" text_align="center"]
<h3>Slide 2 - Tối Ưu Hóa Chi Phí</h3>
<p>Cam kết hiệu quả và tăng trưởng bền vững</p>
[/text_box]
[/ux_banner]
[/ux_slider]
[/section]`;
  }

  private renderRowCustomSection(sec: SectionItem): string {
    const layout = sec.layout || '3-col-equal';
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const title = sec.title ? `[row][col span="12" align="center"][title style="bold-center" text="${sec.title}"][/col][/row]` : '';

    let cols = '';
    if (layout === '1-col') {
      cols = `[col span="12"]\n<p>${sec.content || 'Nội dung cột đơn...'}</p>\n[/col]`;
    } else if (layout === '2-col-equal') {
      cols = `[col span="6" span__sm="12"]\n<p>${sec.subtitle || 'Cột 1: Thông tin giới thiệu'}</p>\n[/col]\n[col span="6" span__sm="12"]\n<p>${sec.content || 'Cột 2: Nội dung chi tiết'}</p>\n[/col]`;
    } else if (layout === '2-col-left-wide') {
      cols = `[col span="4" span__sm="12"]\n<h4>${sec.subtitle || 'Thông tin nhanh'}</h4>\n[/col]\n[col span="8" span__sm="12"]\n<p>${sec.content || 'Nội dung chính chi tiết...'}</p>\n[/col]`;
    } else if (layout === '2-col-right-wide') {
      cols = `[col span="8" span__sm="12"]\n<p>${sec.content || 'Nội dung chính chi tiết...'}</p>\n[/col]\n[col span="4" span__sm="12"]\n<h4>${sec.subtitle || 'Khung thông tin'}</h4>\n[/col]`;
    } else if (layout === '4-col-equal') {
      cols = `[col span="3" span__sm="6"]<h4>Mục 1</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 2</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 3</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 4</h4>[/col]`;
    } else {
      cols = `[col span="4" span__sm="12"]<h4>Mục 1</h4>[/col]\n[col span="4" span__sm="12"]<h4>Mục 2</h4>[/col]\n[col span="4" span__sm="12"]<h4>Mục 3</h4>[/col]`;
    }

    return `[section bg_color="${bg}" padding="${padding}"${vis}]\n${title}\n[row col_spacing="normal"]\n${cols}\n[/row]\n[/section]`;
  }

  private renderImageSection(sec: SectionItem): string {
    const isFullWidth = sec.data?.isFullWidth !== false && sec.data?.fullWidth !== false;
    const bg = sec.bgColor || '#ffffff';
    const padding = isFullWidth ? '0px' : this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const alt = sec.data?.alt || sec.data?.title || sec.title || '';
    const hasCaption = Boolean(sec.data?.caption && sec.data?.caption.trim());
    const shouldShowCaption = Boolean(hasCaption && sec.data?.showCaption === true);
    const captionHtml = shouldShowCaption
      ? (isFullWidth
          ? `\n[row padding="10px 0px 10px 0px"]\n[col span="12" align="center"]\n<p style="text-align: center; font-style: italic; color: #64748b; font-size: 0.9em; margin: 0 auto;">${sec.data.caption}</p>\n[/col]\n[/row]`
          : `\n<p style="text-align: center; font-style: italic; color: #64748b; font-size: 0.9em; margin-top: 10px;">${sec.data.caption}</p>`)
      : '';

    let imageTag = '';
    const linkAttr = sec.buttonLink && sec.buttonLink !== '#' ? ` link="${sec.buttonLink}"` : '';
    const imgTarget = sec.buttonTarget || sec.data?.buttonTarget || '_self';
    const imgRel = sec.buttonRel !== undefined ? sec.buttonRel : (sec.data?.buttonRel !== undefined ? sec.data.buttonRel : 'nofollow');
    const imgTargetAttr = linkAttr && imgTarget && imgTarget !== '_self' ? ` target="${imgTarget}"` : '';
    const imgRelAttr = linkAttr && imgRel ? ` rel="${imgRel}"` : '';
    const depthAttr = isFullWidth ? '' : ' depth="1" depth_hover="3"';

    if (sec.data?.imageId) {
      imageTag = `[ux_image id="${sec.data.imageId}" image_alt="${alt}" image_size="original"${depthAttr}${linkAttr}${imgTargetAttr}${imgRelAttr} width="100"]`;
    } else {
      imageTag = `[ux_image id="" image_alt="${alt}" image_size="original"${depthAttr}${linkAttr}${imgTargetAttr}${imgRelAttr} width="100"]`;
    }

    if (isFullWidth) {
      return `[section bg_color="${bg}" padding="0px"${vis}]
[row width="full-width" col_style="collapse" padding="0px"]
[col span="12" padding="0px"]
${imageTag}
[/col]
[/row]${captionHtml}
[/section]`;
    }

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
${imageTag}${captionHtml}
[/col]
[/row]
[/section]`;
  }

  private renderImageBoxSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const rawItems = sec.data?.items;

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const colSpan = rawItems.length === 2 ? 6 : rawItems.length === 4 ? 3 : 4;
      const cols = rawItems
        .map((item: any, idx: number) => {
          const itemImg = item.imageId || item.imageUrl || item.img || sec.data?.imageId || sec.data?.imageUrl || '';
          const itemTitle = item.title || `Dự Án ${idx + 1}`;
          const itemDesc = item.desc || item.subtitle || '';
          const linkAttr = item.link ? ` link="${item.link}"` : '';
          return `[col span="${colSpan}" span__sm="12"]\n[ux_image_box img="${itemImg}" title="${itemTitle}"${linkAttr}]\n${
            itemDesc ? `<p>${itemDesc}</p>` : ''
          }\n[/ux_image_box]\n[/col]`;
        })
        .join('\n');

      return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row col_spacing="normal"]
${cols}
[/row]
[/section]`;
    }

    const imgParam = sec.data?.imageId || sec.data?.imageUrl || '';
    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row col_spacing="normal"]
[col span="4" span__sm="12"]
[ux_image_box img="${imgParam}" title="${sec.title || 'Dự Án Tiêu Biểu 1'}"]
<p>${sec.subtitle || 'Giải pháp toàn diện và tối ưu chi phí.'}</p>
[/ux_image_box]
[/col]
[col span="4" span__sm="12"]
[ux_image_box img="${imgParam}" title="Dự Án Tiêu Biểu 2"]
<p>Quy trình triển khai bài bản và chuyên nghiệp.</p>
[/ux_image_box]
[/col]
[col span="4" span__sm="12"]
[ux_image_box img="${imgParam}" title="Dự Án Tiêu Biểu 3"]
<p>Hiệu quả bền vững và cam kết chất lượng.</p>
[/ux_image_box]
[/col]
[/row]
[/section]`;
  }

  private renderTextBlockSection(sec: SectionItem): string {
    const data = sec.data || {};
    const boxEnabled = Boolean(data.boxEnabled);

    // Section BG: if user set 'transparent' or left empty with boxEnabled, do not force white
    const bg = sec.bgColor === 'transparent' ? 'transparent' : (sec.bgColor || (boxEnabled ? 'transparent' : '#ffffff'));
    const bgAttr = bg === 'transparent' ? '' : ` bg_color="${bg}"`;
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);

    // Text & Title Colors
    const isLightText = data.boxTextColor === 'light' || data.boxTextColor === 'gold' || sec.textColor === 'light';
    const isGoldTitle = data.boxTextColor === 'gold';
    const titleCss = isGoldTitle ? '#f59e0b' : (isLightText ? '#ffffff' : '#0f172a');
    const textColorCss = isLightText ? 'color: #f1f5f9;' : 'color: #1e293b;';

    let rawContent = (sec.content || sec.subtitle || 'Nội dung bài viết giới thiệu chi tiết về dịch vụ và cam kết chất lượng của doanh nghiệp.').trim();
    // Tự động quét sạch toàn bộ thẻ shortcode thừa [ux_text], [/ux_text], [title...] nếu còn sót lại từ lần lưu trước
    rawContent = rawContent
      .replace(/\[\/?ux_text[^\]]*\]/gi, '')
      .replace(/\[title[^\]]*\]/gi, '')
      .trim();

    const hasHtmlTags = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|strong|em|a|pre|hr|span)\b/i.test(rawContent);
    const formattedContent = hasHtmlTags ? rawContent : `<p>${rawContent}</p>`;

    // Build native HTML H2 tag instead of raw shortcode [title] so UXBuilder displays real Heading tag
    let titleTag = '';
    if (sec.title && sec.title.trim()) {
      const cleanTitle = sec.title.trim();
      const alreadyHasHeading = new RegExp(`^<h[1-3][^>]*>\\s*${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<\\/h[1-3]>`, 'i').test(rawContent);
      if (!alreadyHasHeading) {
        titleTag = `<h2 class="section-title-main" style="color: ${titleCss}; font-size: 1.75rem; font-weight: 700; line-height: 1.3; margin-top: 0; margin-bottom: 16px;">${cleanTitle}</h2>\n`;
      }
    }

    let boxOpenTag = '';
    let boxCloseTag = '';
    let scopedStyle = '';

    if (boxEnabled) {
      const boxBg = data.boxBgColor || 'rgba(15, 23, 42, 0.85)';
      const boxBorderW = data.boxBorderWidth !== undefined ? Number(data.boxBorderWidth) : 1;
      const boxBorderColor = data.boxBorderColor || '#f59e0b';
      const boxBorderStyle = data.boxBorderStyle || 'solid';
      const boxRadius = data.boxRadius !== undefined ? Number(data.boxRadius) : 12;
      const boxPadding = data.boxPadding || '24px 28px';
      const boxBlur = data.boxBackdropBlur ? 'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);' : '';
      const boxMaxWidth = data.boxMaxWidth && data.boxMaxWidth !== '100%' ? `max-width: ${data.boxMaxWidth}; margin-left: auto; margin-right: auto;` : '';

      let boxShadowStyle = '';
      if (data.boxShadow === 'subtle') boxShadowStyle = 'box-shadow: 0 4px 15px rgba(0,0,0,0.08);';
      else if (data.boxShadow === 'medium') boxShadowStyle = 'box-shadow: 0 8px 25px rgba(0,0,0,0.18);';
      else if (data.boxShadow === 'deep') boxShadowStyle = 'box-shadow: 0 15px 35px rgba(0,0,0,0.35);';
      else if (data.boxShadow === 'glow-gold') boxShadowStyle = 'box-shadow: 0 0 20px rgba(245, 158, 11, 0.4), 0 8px 25px rgba(0,0,0,0.3);';
      else if (data.boxShadow === 'glow-primary') boxShadowStyle = 'box-shadow: 0 0 20px rgba(37, 99, 235, 0.4), 0 8px 25px rgba(0,0,0,0.3);';
      else if (data.boxShadow === 'glow-cyan') boxShadowStyle = 'box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), 0 8px 25px rgba(0,0,0,0.3);';

      const boxBorderCss = boxBorderW > 0 ? `border: ${boxBorderW}px ${boxBorderStyle} ${boxBorderColor};` : 'border: none;';

      const cardClass = `autoweb-box-${(sec.id || 'card').replace(/[^a-zA-Z0-9_-]/g, '')}`;
      const inlineStyle = `background: ${boxBg}; ${boxBorderCss} border-radius: ${boxRadius}px; padding: ${boxPadding}; ${boxShadowStyle} ${boxBlur} ${boxMaxWidth} ${textColorCss} font-size: 1.05em; line-height: 1.7;`;

      boxOpenTag = `<div class="autoweb-text-card ${cardClass}" style="${inlineStyle}">`;
      boxCloseTag = `</div>`;
      scopedStyle = `<style>.${cardClass} h2, .${cardClass} .section-title-main, .${cardClass} .section-title { color: ${titleCss} !important; } .${cardClass} p, .${cardClass} span, .${cardClass} li { color: ${isLightText ? '#f1f5f9' : '#334155'}; } .${cardClass} a { color: ${isLightText ? '#38bdf8' : '#2563eb'}; }</style>\n`;
    }

    const layout = sec.layout || '1-col';
    let cols = '';
    if (layout === '2-col-equal') {
      let rawSub = sec.subtitle && sec.content && sec.subtitle !== sec.content ? sec.subtitle : '';
      rawSub = rawSub.replace(/\[\/?ux_text[^\]]*\]/gi, '').replace(/\[title[^\]]*\]/gi, '').trim();
      const subtitleContent = rawSub
        ? (/<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|strong|em|a)\b/i.test(rawSub) ? rawSub : `<p>${rawSub}</p>`)
        : '';

      if (boxEnabled) {
        cols = `[col span="12"]
${scopedStyle}${boxOpenTag}
${titleTag}[row_inner]
[col_inner span="6" span__sm="12"]
${formattedContent}
[/col_inner]
[col_inner span="6" span__sm="12"]
${subtitleContent}
[/col_inner]
[/row_inner]
${boxCloseTag}
[/col]`;
      } else {
        cols = `[col span="6" span__sm="12"]
${titleTag}${formattedContent}
[/col]
[col span="6" span__sm="12"]
${subtitleContent}
[/col]`;
      }
    } else if (layout === '2-col-left-wide') {
      if (boxEnabled) {
        cols = `[col span="12"]
${scopedStyle}${boxOpenTag}
[row_inner]
[col_inner span="4" span__sm="12"]
${titleTag}
[/col_inner]
[col_inner span="8" span__sm="12"]
${formattedContent}
[/col_inner]
[/row_inner]
${boxCloseTag}
[/col]`;
      } else {
        cols = `[col span="4" span__sm="12"]
${titleTag}
[/col]
[col span="8" span__sm="12"]
${formattedContent}
[/col]`;
      }
    } else if (layout === '2-col-right-wide') {
      if (boxEnabled) {
        cols = `[col span="12"]
${scopedStyle}${boxOpenTag}
[row_inner]
[col_inner span="8" span__sm="12"]
${titleTag}${formattedContent}
[/col_inner]
[col_inner span="4" span__sm="12"]
[/col_inner]
[/row_inner]
${boxCloseTag}
[/col]`;
      } else {
        cols = `[col span="8" span__sm="12"]
${titleTag}${formattedContent}
[/col]
[col span="4" span__sm="12"]
[/col]`;
      }
    } else {
      // 1-col (default)
      if (boxEnabled) {
        cols = `[col span="12"]
${scopedStyle}${boxOpenTag}
${titleTag}${formattedContent}
${boxCloseTag}
[/col]`;
      } else {
        cols = `[col span="12"]
${titleTag}${formattedContent}
[/col]`;
      }
    }

    return `[section${bgAttr} padding="${padding}"${vis}]
[row]
${cols}
[/row]
[/section]`;
  }

  private renderTitleDividerSection(sec: SectionItem): string {
    return `[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'TIÊU ĐỀ PHÂN CÁCH'}" tag_name="h2"]
[divider width="80px" height="3px" color="rgb(37, 99, 235)"]
[/col]
[/row]`;
  }

  private renderPriceTableSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const padding = this.getPaddingVal(sec.padding);
    const title = sec.title || 'Bảng Báo Giá Dịch Vụ';
    const plans = sec.data?.plans || [
      { name: 'Gói Cơ Bản', price: '2.500.000đ', period: '/tháng', desc: 'Phù hợp doanh nghiệp khởi nghiệp', isFeatured: false },
      { name: 'Gói Tiêu Chuẩn', price: '5.500.000đ', period: '/tháng', desc: 'Phổ biến và tối ưu nhất', isFeatured: true },
      { name: 'Gói Cao Cấp', price: '9.900.000đ', period: '/tháng', desc: 'Giải pháp doanh nghiệp lớn', isFeatured: false }
    ];

    let cols = '';
    for (const plan of plans) {
      cols += `[col span="4" span__sm="12"]
[price_box title="${plan.name}" price="${plan.price}" period="${plan.period}" featured="${plan.isFeatured ? 'true' : 'false'}"]
<p>${plan.desc}</p>
<ul>
  <li>Tối ưu hóa SEO Onpage toàn diện</li>
  <li>Báo cáo tiến độ định kỳ</li>
  <li>Hỗ trợ kỹ thuật trực tiếp</li>
</ul>
[gap height="10px"]
[button text="Đăng Ký Ngay" link="#contact" color="${plan.isFeatured ? 'primary' : 'secondary'}" size="medium" radius="5"]
[/price_box]
[/col]\n`;
    }

    const vis = this.getVisibilityAttr(sec);
    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row col_spacing="normal"]
${cols}[/row]
[/section]`;
  }

  private renderTestimonialsSection(sec: SectionItem): string {
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const title = sec.title || 'Khách Hàng Nói Gì Về Chúng Tôi?';
    const items = sec.data?.testimonials || [
      { name: 'Nguyễn Văn An', company: 'CEO AnPhat Corp', quote: 'Dịch vụ rất chuyên nghiệp, tiến độ nhanh và hỗ trợ kỹ thuật cực kỳ nhiệt tình!', stars: 5 },
      { name: 'Trần Thị Mai', company: 'Giám Đốc Marketing MaiHouse', quote: 'Website sau khi tối ưu đạt thứ hạng tìm kiếm vượt kỳ vọng chỉ sau 2 tháng!', stars: 5 },
      { name: 'Lê Hoàng Minh', company: 'Sáng Lập MinhDecor', quote: 'Rất ấn tượng với quy trình làm việc chuẩn chỉ và minh bạch chi phí.', stars: 5 }
    ];

    let cols = '';
    for (const item of items) {
      cols += `[col span="4" span__sm="12"]
[testimonial name="${item.name}" company="${item.company}" stars="${item.stars || 5}"]
<p>“${item.quote}”</p>
[/testimonial]
[/col]\n`;
    }

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row col_spacing="normal"]
${cols}[/row]
[/section]`;
  }

  private renderTeamSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const title = sec.title || 'Đội Ngũ Chuyên Gia E-E-A-T';
    const members = sec.data?.members || [
      { name: 'Nguyễn Hoàng', title: 'Chuyên Gia SEO & Chiến Lược' },
      { name: 'Lê Bảo Anh', title: 'Trưởng Phòng Kỹ Thuật UI/UX' },
      { name: 'Phạm Thu Trang', title: 'Chuyên Viên Tối Ưu Nội Dung' },
      { name: 'Vũ Đức Nam', title: 'Cố Vấn Tăng Trưởng Doanh Số' }
    ];

    let cols = '';
    for (const m of members) {
      cols += `[col span="3" span__sm="6"]
[team_member name="${m.name}" title="${m.title}" style="shade"]
[/team_member]
[/col]\n`;
    }

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="20px"]
[/col]
[/row]
[row col_spacing="normal"]
${cols}[/row]
[/section]`;
  }

  private renderTabsSection(sec: SectionItem): string {
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const title = sec.title || 'Thông Tin Chi Tiết & Quy Trình';

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" tag_name="h2"]
[gap height="15px"]
[/col]
[/row]
[row]
[col span="12"]
[tabgroup style="tabs-normal" align="center"]
[tab title="Quy Trình Triển Khai"]
<p>Bước 1: Tiếp nhận yêu cầu và nghiên cứu đối thủ.<br>Bước 2: Lập kế hoạch chi tiết và duyệt phương án.<br>Bước 3: Tiến hành thực thi và đo lường định kỳ.</p>
[/tab]
[tab title="Cam Kết Chất Lượng"]
<p>Cam kết hiệu quả đo lường theo chỉ số KPI thực tế, báo cáo minh bạch và bảo mật 100% dữ liệu khách hàng.</p>
[/tab]
[tab title="Chính Sách Hỗ Trợ"]
<p>Hỗ trợ kỹ thuật 24/7 trong suốt quá trình đồng hành, cập nhật giải pháp mới nhất cho khách hàng định kỳ.</p>
[/tab]
[/tabgroup]
[/col]
[/row]
[/section]`;
  }

  private renderCountdownSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(15, 23, 42)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const title = sec.title || 'Ưu Đãi Đặc Biệt Trong Tháng';

    return `[section bg_color="${bg}" dark="true" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${title}" color="rgb(255,255,255)"]
<p>${sec.subtitle || 'Nhanh tay đăng ký để nhận ngay gói quà tặng tối ưu miễn phí!'}</p>
[gap height="10px"]
[ux_countdown year="2026" month="12" day="31" time="23:59" t_size="150"]
[gap height="15px"]
[button text="Nhận Ưu Đãi Ngay" link="#contact" color="primary" size="large" radius="5"]
[/col]
[/row]
[/section]`;
  }

  private renderVideoSection(sec: SectionItem): string {
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    const url = sec.buttonLink || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Video Giới Thiệu Doanh Nghiệp'}"]
[gap height="15px"]
[ux_video url="${url}"]
[/col]
[/row]
[/section]`;
  }

  private renderMapSection(sec: SectionItem): string {
    const address = sec.subtitle || 'Hà Nội, Việt Nam';
    const vis = this.getVisibilityAttr(sec);
    return `[section padding="0px"${vis}]
[row col_spacing="collapse"]
[col span="12"]
[title style="bold-center" text="${sec.title || 'Bản Đồ Chỉ Đường Đến Trụ Sở'}"]
[gap height="10px"]
[map lat="21.0285" long="105.8542" zoom="15" height="350px"]
<p><strong>${sec.title || 'Trụ sở chính'}</strong><br>${address}</p>
[/map]
[/col]
[/row]
[/section]`;
  }

  private renderPortfolioSection(sec: SectionItem): string {
    const bg = sec.bgColor || 'rgb(248, 250, 252)';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Dự Án Tiêu Biểu'}"]
[gap height="20px"]
[/col]
[/row]
[row]
[col span="12"]
[portfolio type="row" columns="3" count="6" image_height="65%" depth="1" depth_hover="3"]
[/col]
[/row]
[/section]`;
  }

  private renderGallerySection(sec: SectionItem): string {
    const bg = sec.bgColor || '#ffffff';
    const padding = this.getPaddingVal(sec.padding);
    const vis = this.getVisibilityAttr(sec);
    return `[section bg_color="${bg}" padding="${padding}"${vis}]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Thư Viện Hình Ảnh'}"]
[gap height="15px"]
[/col]
[/row]
[row]
[col span="12"]
[ux_gallery ids="" type="slider" columns="4" image_height="75%" lightbox="true"]
[/col]
[/row]
[/section]`;
  }

  private renderSocialIconsSection(sec: SectionItem): string {
    return `[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Kết Nối Với Chúng Tôi'}"]
[gap height="10px"]
[follow style="fill" scale="120" facebook="#" instagram="#" youtube="#" twitter="#" email="#"]
[/col]
[/row]`;
  }

  private renderMessageBoxSection(sec: SectionItem): string {
    const data = sec.data || {};
    const bgImage = data.bgImage || (data.imageId ? String(data.imageId) : '');
    const bgColor = data.bgColor || (sec.bgColor !== '#ffffff' ? sec.bgColor : '') || '';
    const textColor = data.textColor || sec.textColor || 'dark';
    const padding = data.padding !== undefined ? data.padding : 15;
    const minHeight = data.minHeight ? Number(data.minHeight) : 0;
    const customClass = (data.customClass || data.class || '').trim();
    const visibility = (data.visibility || '').trim();
    const textAlign = data.textAlign || 'center';
    const icon = data.icon !== undefined ? data.icon : '📢';

    // Buttons
    // Fix: hasButton1 defaults to true if not explicitly set to false (matching UI: sec.data?.hasButton1 ?? true)
    const hasButton1 = data.hasButton1 !== false;
    const btn1Text = (data.button1Text !== undefined ? data.button1Text : (data.buttonText || sec.buttonText || (hasButton1 ? 'Đăng Ký Ngay' : ''))).trim();
    const btn1Link = data.button1Link || data.buttonLink || sec.buttonLink || '#';
    const btn1Target = data.button1Target || sec.buttonTarget || '_self';
    const btn1Rel = data.button1Rel !== undefined ? data.button1Rel : (sec.buttonRel !== undefined ? sec.buttonRel : 'nofollow');
    const btn1Color = data.button1Color || 'white';
    const btn1Style = data.button1Style || '';
    const btn1Size = data.button1Size || 'medium';
    const btn1Animation = (data.button1Animation || '').trim();

    const hasButton2 = Boolean(data.hasButton2);
    const btn2Text = (data.button2Text || '').trim();
    const btn2Link = data.button2Link || '#';
    const btn2Target = data.button2Target || '_self';
    const btn2Rel = data.button2Rel !== undefined ? data.button2Rel : 'nofollow';
    const btn2Color = data.button2Color || 'secondary';
    const btn2Style = data.button2Style || 'outline';
    const btn2Size = data.button2Size || 'medium';
    const btn2Animation = (data.button2Animation || '').trim();

    const btn1AnimClass = btn1Animation ? `btn-anim-${btn1Animation}` : '';
    const btn2AnimClass = btn2Animation ? `btn-anim-${btn2Animation}` : '';

    const btn1TargetAttr = btn1Target && btn1Target !== '_self' ? ` target="${btn1Target}"` : '';
    const btn1RelAttr = btn1Rel ? ` rel="${btn1Rel}"` : '';
    let btn1Shortcode = '';
    if (hasButton1 && btn1Text) {
      btn1Shortcode = `[button text="${btn1Text}" link="${btn1Link}"${btn1TargetAttr}${btn1RelAttr} color="${btn1Color}" ${btn1Style ? `style="${btn1Style}"` : ''} size="${btn1Size}" radius="5"${btn1AnimClass ? ` class="${btn1AnimClass}"` : ''}]`;
    }

    const btn2TargetAttr = btn2Target && btn2Target !== '_self' ? ` target="${btn2Target}"` : '';
    const btn2RelAttr = btn2Rel ? ` rel="${btn2Rel}"` : '';
    let btn2Shortcode = '';
    if (hasButton2 && btn2Text) {
      btn2Shortcode = `[button text="${btn2Text}" link="${btn2Link}"${btn2TargetAttr}${btn2RelAttr} color="${btn2Color}" ${btn2Style ? `style="${btn2Style}"` : ''} size="${btn2Size}" radius="5"${btn2AnimClass ? ` class="${btn2AnimClass}"` : ''}]`;
    }

    const boxLayout = data.boxLayout || (hasButton1 && btn1Text ? 'inline' : 'center');
    const buttonAlign = data.buttonAlign || (boxLayout === 'inline' ? 'right' : 'center');

    // Bo góc & Đổ bóng (Border Radius & Box Shadow)
    const borderRadius = data.borderRadius !== undefined ? Number(data.borderRadius) : 0;
    const shadow = (data.shadow || '').trim();
    const shadowHover = Boolean(data.shadowHover);

    const classesToAdd: string[] = ['mb-0', 'no-margin'];
    if (customClass) classesToAdd.push(customClass);

    // Flatsome native shadows (box-shadow-1 .. 5)
    if (shadow && shadow.startsWith('box-shadow-')) {
      classesToAdd.push(shadow);
      if (shadowHover) {
        classesToAdd.push(`${shadow}-hover`);
      }
    }

    // Scoped unique class cho Border Radius & Neon Glow & Zero Margin
    const mboxUniqueClass = `fs-mbox-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '') || Math.floor(Math.random() * 100000)}`;
    const cssRules: string[] = [];

    // Triệt tiêu margin-bottom mặc định (1.5em) của Flatsome .message-box
    // để khoảng cách giữa các khối hoàn toàn theo cấu hình Section Padding
    classesToAdd.push(mboxUniqueClass);
    cssRules.push(`margin-bottom: 0 !important;`);

    if (borderRadius > 0) {
      classesToAdd.push(mboxUniqueClass);
      cssRules.push(`border-radius: ${borderRadius}px !important;`);
      cssRules.push(`overflow: hidden !important;`);
    }

    if (shadow === 'glow-alert') {
      classesToAdd.push(mboxUniqueClass);
      cssRules.push(`box-shadow: 0 0 20px rgba(239, 68, 68, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
      if (shadowHover) {
        cssRules.push(`transition: all 0.3s ease !important;`);
      }
    } else if (shadow === 'glow-gold') {
      classesToAdd.push(mboxUniqueClass);
      cssRules.push(`box-shadow: 0 0 20px rgba(245, 158, 11, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
      if (shadowHover) {
        cssRules.push(`transition: all 0.3s ease !important;`);
      }
    } else if (shadow === 'glow-primary') {
      classesToAdd.push(mboxUniqueClass);
      cssRules.push(`box-shadow: 0 0 20px rgba(37, 99, 235, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
      if (shadowHover) {
        cssRules.push(`transition: all 0.3s ease !important;`);
      }
    }

    let hoverCss = '';
    if (shadowHover && (shadow === 'glow-alert' || shadow === 'glow-gold' || shadow === 'glow-primary')) {
      const glowColor = shadow === 'glow-alert' ? 'rgba(239, 68, 68, 0.75)' : shadow === 'glow-gold' ? 'rgba(245, 158, 11, 0.75)' : 'rgba(37, 99, 235, 0.75)';
      hoverCss = `\n.${mboxUniqueClass}:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 0 30px ${glowColor}, 0 12px 30px rgba(0, 0, 0, 0.5) !important;\n}`;
    }

    // CSS Keyframes cho hiệu ứng Hoạt Họa Nút Bấm (Shimmer / Shake / Pulse / Glow / Combo)
    const hasAnyBtnAnim = Boolean(btn1Animation || btn2Animation);
    let animCss = '';
    if (hasAnyBtnAnim) {
      animCss = `
/* Hiệu Ứng Nút Bấm: Làn Mây Quét Sáng (Shimmer Sweep) */
.button.btn-anim-shimmer, a.button.btn-anim-shimmer, .btn-anim-shimmer {
  position: relative !important;
  overflow: hidden !important;
  z-index: 1 !important;
}
.button.btn-anim-shimmer::after, a.button.btn-anim-shimmer::after, .btn-anim-shimmer::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -120% !important;
  width: 70% !important;
  height: 100% !important;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%) !important;
  transform: skewX(-25deg) !important;
  animation: jglBtnShimmerSweep 2.2s infinite ease-in-out !important;
  pointer-events: none !important;
  z-index: 2 !important;
}
@keyframes jglBtnShimmerSweep { 0% { left: -120%; } 35%, 100% { left: 220%; } }

/* Hiệu Ứng Nút Bấm: Rung Lắc Gây Chú Ý (Shake / Wiggle) */
.button.btn-anim-shake, a.button.btn-anim-shake, .btn-anim-shake {
  display: inline-block !important;
  animation: jglBtnShakeNotice 2.2s infinite ease-in-out !important;
  transform-origin: center center !important;
}
@keyframes jglBtnShakeNotice {
  0%, 65%, 100% { transform: scale(1) rotate(0deg); }
  68% { transform: scale(1.08) rotate(-6deg); }
  72% { transform: scale(1.08) rotate(6deg); }
  76% { transform: scale(1.08) rotate(-5deg); }
  80% { transform: scale(1.08) rotate(4deg); }
  84% { transform: scale(1.04) rotate(-2deg); }
  88% { transform: scale(1) rotate(0deg); }
}

/* Hiệu Ứng Nút Bấm: Lan Tỏa Màu (Ripple Waves / Sóng Màu Lan Tỏa) */
.button.btn-anim-ripple, a.button.btn-anim-ripple, .btn-anim-ripple {
  position: relative !important;
  overflow: visible !important;
  z-index: 1 !important;
  animation: jglBtnRipplePulse 2s infinite ease-in-out !important;
}
.button.btn-anim-ripple::before, a.button.btn-anim-ripple::before, .btn-anim-ripple::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 2px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
.button.btn-anim-ripple::after, a.button.btn-anim-ripple::after, .btn-anim-ripple::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 1.5px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) 0.9s !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
@keyframes jglBtnRippleRing {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.38, 1.48); opacity: 0; }
}
@keyframes jglBtnRipplePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 16px 2px rgba(255, 255, 255, 0.8), 0 0 20px 4px currentColor; }
}

/* Hiệu Ứng Nút Bấm: Phát Sáng Hào Quang (Pulse Glow) */
.button.btn-anim-glow, a.button.btn-anim-glow, .btn-anim-glow {
  animation: jglBtnGlowPulse 1.8s infinite ease-in-out !important;
}
@keyframes jglBtnGlowPulse {
  0%, 100% {
    box-shadow: 0 0 6px rgba(255, 120, 0, 0.4), 0 0 12px currentColor;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 24px rgba(255, 120, 0, 0.9), 0 0 38px currentColor, 0 0 50px rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
}

/* Hiệu Ứng Nút Bấm: Nhịp Thở Phóng To (Heartbeat Pulse) */
.button.btn-anim-pulse, a.button.btn-anim-pulse, .btn-anim-pulse {
  display: inline-block !important;
  animation: jglBtnHeartPulse 1.6s infinite ease-in-out !important;
  transform-origin: center center !important;
}
@keyframes jglBtnHeartPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
}

/* Hiệu Ứng Nút Bấm: Combo VIP: Rung Lắc + Lan Tỏa Màu */
.button.btn-anim-combo, a.button.btn-anim-combo, .btn-anim-combo {
  display: inline-block !important;
  position: relative !important;
  overflow: visible !important;
  z-index: 1 !important;
  animation: jglBtnShakeNotice 2.2s infinite ease-in-out !important;
  transform-origin: center center !important;
}
.button.btn-anim-combo::before, a.button.btn-anim-combo::before, .btn-anim-combo::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 2px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
.button.btn-anim-combo::after, a.button.btn-anim-combo::after, .btn-anim-combo::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  border-radius: inherit !important;
  background: inherit !important;
  border: 1.5px solid currentColor !important;
  opacity: 0.75 !important;
  animation: jglBtnRippleRing 1.8s infinite cubic-bezier(0.24, 0, 0.38, 1) 0.9s !important;
  pointer-events: none !important;
  z-index: -1 !important;
}`;
    }

    // Lọc các class trùng lặp
    const uniqueClasses = Array.from(new Set(classesToAdd)).filter(Boolean);
    const finalClassStr = uniqueClasses.join(' ');

    const attrs: string[] = [];
    if (bgImage) attrs.push(`bg="${bgImage}"`);
    if (bgColor && bgColor !== 'transparent') attrs.push(`bg_color="${bgColor}"`);
    if (textColor) attrs.push(`text_color="${textColor}"`);
    if (padding !== undefined && padding !== '') attrs.push(`padding="${padding}"`);
    if (finalClassStr) attrs.push(`class="${finalClassStr}"`);
    if (visibility && visibility !== 'visible') attrs.push(`visibility="${visibility}"`);

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    const hasAnyBtn = Boolean(btn1Shortcode || btn2Shortcode);
    const content = (sec.content !== undefined ? sec.content : (sec.subtitle || sec.title || '')).trim();
    const iconPrefix = icon && content ? `${icon} ` : '';
    const textHtml = content ? `<p style="margin: 0; font-size: 1.05em; font-weight: 600;">${iconPrefix}${content}</p>` : '';
    const btnCluster = [btn1Shortcode, btn2Shortcode].filter(Boolean).join(' ');

    let innerContent = '';
    if (boxLayout === 'buttons_only' || !content) {
      innerContent = btnCluster;
    } else if (boxLayout === 'inline' && hasAnyBtn && content) {
      if (buttonAlign === 'left') {
        innerContent = `[row_inner v_align="middle" style="margin-bottom: 0;"]
[col_inner span="4" span__sm="12" align="left" align__sm="center"]
${btnCluster}
[/col_inner]
[col_inner span="8" span__sm="12" align="right" align__sm="center"]
${textHtml}
[/col_inner]
[/row_inner]`;
      } else {
        innerContent = `[row_inner v_align="middle" style="margin-bottom: 0;"]
[col_inner span="8" span__sm="12" align="left" align__sm="center"]
${textHtml}
[/col_inner]
[col_inner span="4" span__sm="12" align="right" align__sm="center"]
${btnCluster}
[/col_inner]
[/row_inner]`;
      }
    } else {
      const buttonsBlock = hasAnyBtn ? `\n[gap height="10px"]\n${btnCluster}` : '';
      innerContent = `${textHtml}${buttonsBlock}`;
    }

    // Mobile responsive settings
    const mobileBgImage = (data.mobileBgImage || '').trim();
    const mobileMinHeight = data.mobileMinHeight ? Number(data.mobileMinHeight) : 0;
    const mobileBtnAlign = data.mobileBtnAlign || 'right';
    const mobileBtnSize = data.mobileBtnSize || 'compact';
    const mobileBtnOffsetRight = data.mobileBtnOffsetRight ? Number(data.mobileBtnOffsetRight) : 0;
    const mobileBtnMarginTop = data.mobileBtnMarginTop ? Number(data.mobileBtnMarginTop) : 0;

    let mobileCss = '';
    const mobileRules: string[] = [];
    if (mobileBgImage) {
      mobileRules.push(`background-image: url('${mobileBgImage}') !important;`);
    }
    if (mobileMinHeight > 0) {
      mobileRules.push(`min-height: ${mobileMinHeight}px !important;`);
    }

    let mobileBtnRules = '';
    if (mobileBtnAlign === 'hidden') {
      mobileBtnRules = `\n@media (max-width: 549px) {\n  .${mboxUniqueClass} .button { display: none !important; }\n}`;
    } else {
      const btnCss: string[] = [];
      if (mobileBtnSize === 'compact') {
        btnCss.push('font-size: 0.75em !important;');
        btnCss.push('padding: 4px 10px !important;');
        btnCss.push('min-height: auto !important;');
        btnCss.push('line-height: 1.2 !important;');
      } else if (mobileBtnSize === 'small') {
        btnCss.push('font-size: 0.85em !important;');
        btnCss.push('padding: 5px 12px !important;');
        btnCss.push('min-height: auto !important;');
      }

      if (mobileBtnOffsetRight > 0) {
        btnCss.push(`margin-right: ${mobileBtnOffsetRight}px !important;`);
      }
      if (mobileBtnMarginTop > 0) {
        btnCss.push(`margin-top: ${mobileBtnMarginTop}px !important;`);
      }

      const justify = mobileBtnAlign === 'center' ? 'center' : mobileBtnAlign === 'left' ? 'flex-start' : 'flex-end';
      const marginAuto = mobileBtnAlign === 'center' ? '0 auto !important' : mobileBtnAlign === 'left' ? '0 auto 0 0 !important' : '0 0 0 auto !important';

      mobileBtnRules = `\n@media (max-width: 549px) {\n  .${mboxUniqueClass},\n  .${mboxUniqueClass} .col,\n  .${mboxUniqueClass} .col-inner {\n    text-align: ${mobileBtnAlign} !important;\n  }\n  .${mboxUniqueClass} > div {\n    display: flex !important;\n    justify-content: ${justify} !important;\n    text-align: ${mobileBtnAlign} !important;${mobileMinHeight > 0 ? `\n    min-height: ${mobileMinHeight}px !important;` : ''}\n  }\n  .${mboxUniqueClass} .button {\n    display: inline-block !important;\n    margin: ${marginAuto};\n    ${btnCss.join('\n    ')}\n  }\n}`;
    }

    // Container and Gutter settings (Chống tràn viền Mobile)
    const containerMode = (data.container || sec.data?.container || 'container').trim();
    const isFullWidthContainer = containerMode === 'full-width';

    // Desktop gutter (15px for container, 0px for full-width)
    const desktopGutter = data.gutter !== undefined && data.gutter !== '' ? Number(data.gutter) : (isFullWidthContainer ? 0 : 15);

    // Mobile gutter (15px for container, 0px for full-width, or explicit mobileGutter)
    const mobileGutter = data.mobileGutter !== undefined && data.mobileGutter !== ''
      ? Number(data.mobileGutter)
      : (isFullWidthContainer ? 0 : 15);

    const mboxColClass = `fs-col-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '') || Math.floor(Math.random() * 100000)}`;
    const colPadding = `0px ${desktopGutter}px 0px ${desktopGutter}px`;
    const colClass = `pb-0 mb-0 ${mboxColClass}`;

    const mobileGutterRules = `\n@media (max-width: 549px) {\n  .${mboxColClass} {\n    padding-left: ${mobileGutter}px !important;\n    padding-right: ${mobileGutter}px !important;\n  }\n}`;

    if (mobileRules.length > 0) {
      mobileCss = `\n@media (max-width: 549px) {\n  .${mboxUniqueClass} {\n    ${mobileRules.join('\n    ')}\n  }\n}${mobileBtnRules}${mobileGutterRules}`;
    } else if (mobileBtnRules || mobileGutterRules) {
      mobileCss = `${mobileBtnRules}${mobileGutterRules}`;
    }

    const messageBoxShortcode = `[message_box${attrStr}]
${innerContent}
[/message_box]`;

    const wrapInSection = data.wrapInSection !== false;
    if (!wrapInSection) {
      return messageBoxShortcode;
    }

    const hasExplicitBg = sec.bgColor && sec.bgColor !== 'transparent';
    const bgAttr = hasExplicitBg ? ` bg_color="${sec.bgColor}"` : '';
    const padCfg = this.getPaddingConfig(sec.padding);
    const sectionPadding = padCfg.singleVal;
    const customSectionClass = padCfg.isCustom ? `fs-sec-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
    const layout = sec.layout || '1-col';

    let cols = '';
    if (layout === '1-col') {
      cols = `[col span="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]`;
    } else if (layout === '2-col-equal') {
      cols = `[col span="6" span__sm="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]
[col span="6" span__sm="12" padding="${colPadding}" class="${colClass}"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]`;
    } else if (layout === '2-col-left-wide') {
      cols = `[col span="4" span__sm="12" padding="${colPadding}" class="${colClass}"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="8" span__sm="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]`;
    } else if (layout === '2-col-right-wide') {
      cols = `[col span="8" span__sm="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]
[col span="4" span__sm="12" padding="${colPadding}" class="${colClass}"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]`;
    } else if (layout === '3-col-equal') {
      cols = `[col span="4" span__sm="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]
[col span="4" span__sm="12" padding="${colPadding}" class="${colClass}"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="4" span__sm="12" padding="${colPadding}" class="${colClass}"]
[/col]`;
    } else if (layout === '4-col-equal') {
      cols = `[col span="3" span__sm="6" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]
[col span="3" span__sm="6" padding="${colPadding}" class="${colClass}"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="3" span__sm="6" padding="${colPadding}" class="${colClass}"]
[/col]
[col span="3" span__sm="6" padding="${colPadding}" class="${colClass}"]
[/col]`;
    } else {
      cols = `[col span="12" padding="${colPadding}" class="${colClass}"]
${messageBoxShortcode}
[/col]`;
    }

    const rowAttrs = isFullWidthContainer
      ? `width="full-width" col_style="collapse" col_spacing="collapse" class="mb-0" style="margin-bottom: 0;"`
      : `class="mb-0" style="margin-bottom: 0;"`;

    const visibilityAttr = this.getVisibilityAttr(sec);
    return `[section${bgAttr} padding="${sectionPadding}"${visibilityAttr}${customSectionClass ? ` class="${customSectionClass}"` : ''}]
[row ${rowAttrs}]
${cols}
[/row]
[/section]`;
  }

  /**
   * Biên dịch toàn bộ CSS tùy biến của trang (chống tràn viền, bo góc, bóng đổ, padding custom, responsive mobile)
   * Để lưu vào post meta _custom_css của Flatsome Theme và load trong <head>
   * Tuyệt đối không nhét thẻ <style> vào post_content để giữ UX Builder sạch 100% không bị sinh thẻ Text thừa
   */
  compilePageCustomCss(sections: SectionItem[]): string {
    const cssParts: string[] = [];

    for (const sec of sections) {
      if (sec.type === 'message_box') {
        const data = sec.data || {};
        const borderRadius = data.borderRadius !== undefined ? Number(data.borderRadius) : 0;
        const shadow = (data.shadow || '').trim();
        const shadowHover = Boolean(data.shadowHover);
        const mboxUniqueClass = `fs-mbox-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '') || Math.floor(Math.random() * 100000)}`;

        const mboxRules: string[] = [];
        mboxRules.push(`margin-bottom: 0 !important;`);

        const minHeight = data.minHeight ? Number(data.minHeight) : 0;
        const buttonAlign = data.buttonAlign || 'center';
        const boxLayout = data.boxLayout || 'inline';

        if (minHeight > 0) {
          mboxRules.push(`min-height: ${minHeight}px !important;`);
          mboxRules.push(`display: flex !important;`);
          mboxRules.push(`flex-direction: column !important;`);
          mboxRules.push(`justify-content: center !important;`);
        }
        if (boxLayout === 'buttons_only') {
          mboxRules.push(`text-align: ${buttonAlign} !important;`);
        }

        if (borderRadius > 0) {
          mboxRules.push(`border-radius: ${borderRadius}px !important;`);
          mboxRules.push(`overflow: hidden !important;`);
        }

        if (shadow === 'glow-alert') {
          mboxRules.push(`box-shadow: 0 0 20px rgba(239, 68, 68, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
        } else if (shadow === 'glow-gold') {
          mboxRules.push(`box-shadow: 0 0 20px rgba(245, 158, 11, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
        } else if (shadow === 'glow-primary') {
          mboxRules.push(`box-shadow: 0 0 20px rgba(37, 99, 235, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
        }

        if (shadowHover && (shadow === 'glow-alert' || shadow === 'glow-gold' || shadow === 'glow-primary')) {
          mboxRules.push(`transition: all 0.3s ease !important;`);
          const glowColor = shadow === 'glow-alert' ? 'rgba(239, 68, 68, 0.75)' : shadow === 'glow-gold' ? 'rgba(245, 158, 11, 0.75)' : 'rgba(37, 99, 235, 0.75)';
          cssParts.push(`.${mboxUniqueClass}:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 0 30px ${glowColor}, 0 12px 30px rgba(0, 0, 0, 0.5) !important;\n}`);
        }

        if (mboxRules.length > 0) {
          cssParts.push(`.${mboxUniqueClass} {\n  ${mboxRules.join('\n  ')}\n}`);
        }

        // Mobile responsive settings
        const mobileBgImage = (data.mobileBgImage || '').trim();
        const mobileMinHeight = data.mobileMinHeight ? Number(data.mobileMinHeight) : 0;
        const mobileBtnAlign = data.mobileBtnAlign || 'right';
        const mobileBtnSize = data.mobileBtnSize || 'compact';
        const mobileBtnOffsetRight = data.mobileBtnOffsetRight ? Number(data.mobileBtnOffsetRight) : 0;
        const mobileBtnMarginTop = data.mobileBtnMarginTop ? Number(data.mobileBtnMarginTop) : 0;

        const mobileRules: string[] = [];
        if (mobileBgImage) {
          mobileRules.push(`background-image: url('${mobileBgImage}') !important;`);
        }
        if (mobileMinHeight > 0) {
          mobileRules.push(`min-height: ${mobileMinHeight}px !important;`);
        }
        if (mobileRules.length > 0) {
          cssParts.push(`@media (max-width: 549px) {\n  .${mboxUniqueClass} {\n    ${mobileRules.join('\n    ')}\n  }\n}`);
        }

        if (mobileBtnAlign === 'hidden') {
          cssParts.push(`@media (max-width: 549px) {\n  .${mboxUniqueClass} .button { display: none !important; }\n}`);
        } else {
          const btnCss: string[] = [];
          if (mobileBtnSize === 'compact') {
            btnCss.push('font-size: 0.75em !important;');
            btnCss.push('padding: 4px 10px !important;');
            btnCss.push('min-height: auto !important;');
            btnCss.push('line-height: 1.2 !important;');
          } else if (mobileBtnSize === 'small') {
            btnCss.push('font-size: 0.85em !important;');
            btnCss.push('padding: 5px 12px !important;');
            btnCss.push('min-height: auto !important;');
          }

          if (mobileBtnOffsetRight > 0) {
            btnCss.push(`margin-right: ${mobileBtnOffsetRight}px !important;`);
          }
          if (mobileBtnMarginTop > 0) {
            btnCss.push(`margin-top: ${mobileBtnMarginTop}px !important;`);
          }

          const justify = mobileBtnAlign === 'center' ? 'center' : mobileBtnAlign === 'left' ? 'flex-start' : 'flex-end';
          const marginAuto = mobileBtnAlign === 'center' ? '0 auto !important' : mobileBtnAlign === 'left' ? '0 auto 0 0 !important' : '0 0 0 auto !important';

          cssParts.push(`@media (max-width: 549px) {\n  .${mboxUniqueClass},\n  .${mboxUniqueClass} .col,\n  .${mboxUniqueClass} .col-inner {\n    text-align: ${mobileBtnAlign} !important;\n  }\n  .${mboxUniqueClass} > div {\n    display: flex !important;\n    justify-content: ${justify} !important;\n    text-align: ${mobileBtnAlign} !important;${mobileMinHeight > 0 ? `\n    min-height: ${mobileMinHeight}px !important;` : ''}\n  }\n  .${mboxUniqueClass} .button {\n    display: inline-block !important;\n    margin: ${marginAuto};\n    ${btnCss.join('\n    ')}\n  }\n}`);
        }

        // Gutter Mobile
        const containerMode = (data.container || sec.data?.container || 'container').trim();
        const isFullWidthContainer = containerMode === 'full-width';
        const mobileGutter = data.mobileGutter !== undefined && data.mobileGutter !== ''
          ? Number(data.mobileGutter)
          : (isFullWidthContainer ? 0 : 15);
        const mboxColClass = `fs-col-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '') || Math.floor(Math.random() * 100000)}`;

        cssParts.push(`@media (max-width: 549px) {\n  .${mboxColClass} {\n    padding-left: ${mobileGutter}px !important;\n    padding-right: ${mobileGutter}px !important;\n  }\n}`);

        // Custom Section padding
        const padCfg = this.getPaddingConfig(sec.padding);
        if (padCfg.isCustom) {
          const customSectionClass = `fs-sec-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
          cssParts.push(`.${customSectionClass} {\n  padding-top: ${padCfg.top}px !important;\n  padding-bottom: ${padCfg.bottom}px !important;\n}`);
        }
      }
    }

    return cssParts.join('\n\n').trim();
  }

  private renderDividerGapSection(sec: SectionItem): string {
    return `[divider width="100%" height="1px" margin="25px" color="rgb(226, 232, 240)"]`;
  }

  private formatRichText(text: string, linkColor = '#fbbf24'): string {
    if (!text) return '';
    let res = text;
    // Markdown bold: **text** or __text__ -> <strong>text</strong>
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Markdown italic: *text* or _text_ -> <em>text</em>
    res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Markdown link: [text](url) -> <a href="url" ...>text</a>
    res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener" style="color: ${linkColor}; text-decoration: underline;">$1</a>`);
    // Line breaks: convert \r\n or \n to <br>
    res = res.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
    return res;
  }

  compileFooter(cfg: FooterConfig): string {
    const bg = cfg.bgColor || '#0b0f19';
    const brand = cfg.brandName || 'Thương Hiệu Của Bạn';
    const bioRaw = cfg.bio || 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và chuyên nghiệp.';
    const bio = this.formatRichText(bioRaw, '#fbbf24');
    const hotline = cfg.hotline || '0988.xxx.xxx';
    const email = cfg.email || 'lienhe@domain.com';
    const address = cfg.address || 'Hà Nội, Việt Nam';
    const currentYear = new Date().getFullYear();
    const copyright = cfg.copyrightText || cfg.copyright || `© ${currentYear} ${brand}. Tất cả các quyền được bảo lưu.`;
    const logoW = cfg.logoWidth || 180;

    const brandImgHtml = (cfg.logoUrl)
      ? `<div class="footer-brand-logo" style="margin-bottom: 14px;"><a href="/" title="${brand}"><img src="${cfg.logoUrl}" alt="${brand}" style="max-width: ${logoW}px; width: 100%; height: auto; display: block;" /></a></div>`
      : null;

    // Common column links
    const col2Title = cfg.col2Title || 'Về Chúng Tôi';
    const col2Links = (cfg.col2Links && cfg.col2Links.length > 0) ? cfg.col2Links : [
      { text: 'Giới thiệu công ty', url: '/gioi-thieu/' },
      { text: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat/' },
      { text: 'Điều khoản sử dụng', url: '/dieu-khoan-su-dung/' },
      { text: 'Liên hệ hợp tác', url: '/lien-he/' },
    ];

    const col3Title = cfg.col3Title || 'Dịch Vụ Chính';
    const col3Links = (cfg.col3Links && cfg.col3Links.length > 0) ? cfg.col3Links : [
      { text: 'Tư vấn chiến lược', url: '#' },
      { text: 'Giải pháp trọn gói', url: '#' },
      { text: 'Tối ưu hóa chuyển đổi', url: '#' },
      { text: 'Hỗ trợ kỹ thuật 24/7', url: '#' },
    ];

    const col4Title = cfg.col4Title || 'Liên Hệ Nhanh';
    const col4ActionBtn = (cfg.col4LinkText && cfg.col4LinkUrl)
      ? `<div style="margin-top: 10px;"><a href="${cfg.col4LinkUrl}" target="_blank" rel="noopener" style="display: inline-block; padding: 6px 14px; background: #f59e0b; color: #000; font-weight: 700; font-size: 11px; border-radius: 99px; text-decoration: none;">💬 ${cfg.col4LinkText}</a></div>`
      : '';

    const formatCol4LinkItem = (link: { text?: string; url?: string }, accentColor = '#fbbf24') => {
      const url = link.url || '#';
      const text = (link.text || '').trim();
      if (!text) return '';

      // Tự động nhận diện định dạng "Nhãn: Tên" (Ví dụ: "Autora: Nguyen Leo" hoặc "Tác giả: Nguyễn Văn A")
      if (text.includes(':')) {
        const colonIdx = text.indexOf(':');
        const label = text.substring(0, colonIdx).trim();
        const value = text.substring(colonIdx + 1).trim();
        return `<strong>${label}:</strong> <a href="${url}" target="_blank" rel="noopener" style="color: ${accentColor}; text-decoration: underline;">${value}</a>`;
      }

      // Tiêu đề link thông thường
      return `<a href="${url}" target="_blank" rel="noopener" style="color: ${accentColor}; text-decoration: underline;">🔗 ${text}</a>`;
    };

    const buildCol4ContactHtml = (accentColor = '#fbbf24') => {
      const lines: string[] = [];
      if (hotline) lines.push(`<strong>Hotline / CSKH:</strong> ${hotline}`);
      if (email) lines.push(`<strong>Email VIP:</strong> ${email}`);
      if (address) lines.push(`<strong>Trụ sở:</strong> ${address}`);
      if (cfg.col4WorkingHours) lines.push(`<strong>Giờ làm việc:</strong> ${cfg.col4WorkingHours}`);
      if (cfg.col4ExtraInfo) lines.push(`<span style="color: #94a3b8; font-size: 11px;">📌 ${cfg.col4ExtraInfo}</span>`);

      if (cfg.col4Links && cfg.col4Links.length > 0) {
        cfg.col4Links.forEach(l => {
          const formatted = formatCol4LinkItem(l, accentColor);
          if (formatted) lines.push(formatted);
        });
      }
      return lines.join('<br>\n  ');
    };

    const col2ListHtml = col2Links.map(l => `  <li><a href="${l.url || '#'}">${l.text || 'Liên kết'}</a></li>`).join('\n');
    const col3ListHtml = col3Links.map(l => `  <li><a href="${l.url || '#'}">${l.text || 'Dịch vụ'}</a></li>`).join('\n');

    const bgType = cfg.bgType || (cfg.bgImage ? 'image' : cfg.bgGradient ? 'gradient' : 'solid');
    let sectionAttrs = `bg_color="${bg}" dark="true"`;
    let customStyleHeader = '';

    if (bgType === 'image' && cfg.bgImage) {
      const overlay = cfg.bgOverlay || 'rgba(0,0,0,0.72)';
      sectionAttrs = `bg="${cfg.bgImage}" bg_overlay="${overlay}" bg_pos="center center" dark="true"`;
    } else if (bgType === 'gradient' && cfg.bgGradient) {
      customStyleHeader = `<style>.ux-footer-gradient-bg { background: ${cfg.bgGradient} !important; }</style>\n`;
      sectionAttrs = `class="ux-footer-gradient-bg" bg_color="${bg}" dark="true"`;
    }

    // 1. MẪU CASINO & GAMING VIP (Luxury Dark + Gold Accent + 18+ & Giấy phép)
    if (cfg.layout === 'casino-luxury') {
      const badge = cfg.badgeText || '18+ Chơi Có Trách Nhiệm & Giấy Phép Quốc Tế';
      const disclaimer = cfg.disclaimerText || 'Cảnh báo: Tham gia giải trí cá cược trực tuyến chỉ dành cho người đủ 18 tuổi trở lên. Hãy chơi có trách nhiệm và tuân thủ các quy định hiện hành.';
      return `${customStyleHeader}[section ${sectionAttrs} padding="60px 0px 30px 0px"]
[row]
[col span="3" span__sm="12"]
${brandImgHtml || `<h3 style="color: #f59e0b; margin-bottom: 12px; font-weight: 800; font-size: 1.3rem;">${brand}</h3>`}
<p style="color: #cbd5e1; font-size: 0.9em; line-height: 1.6;">${bio}</p>
<div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid #f59e0b; border-radius: 6px; padding: 6px 12px; margin-top: 10px;">
  <span style="background: #f59e0b; color: #000; font-weight: 800; font-size: 11px; padding: 1px 6px; border-radius: 3px;">18+</span>
  <span style="color: #fbbf24; font-size: 11px; font-weight: 600;">${badge}</span>
</div>
[/col]
[col span="3" span__sm="12"]
<h4 style="color: #ffffff; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; display: inline-block;">${col2Title}</h4>
<ul style="list-style: none; padding-left: 0; margin-top: 14px; line-height: 2.1;">
${col2ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4 style="color: #ffffff; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; display: inline-block;">${col3Title}</h4>
<ul style="list-style: none; padding-left: 0; margin-top: 14px; line-height: 2.1;">
${col3ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4 style="color: #ffffff; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; display: inline-block;">${col4Title}</h4>
<div style="color: #cbd5e1; font-size: 0.9em; line-height: 1.8; margin-top: 14px;">
  <p style="margin-bottom: 0;">
  ${buildCol4ContactHtml('#fbbf24')}
  </p>
  ${col4ActionBtn}
</div>
<div style="background: rgba(255,255,255,0.04); border: 1px dashed rgba(245,158,11,0.35); border-radius: 6px; padding: 8px 12px; margin-top: 10px;">
  <small style="color: #94a3b8; font-size: 10px; display: block; line-height: 1.4;">🔒 Bảo mật mã hóa SSL 256-Bit • Chứng nhận PAGCOR & Curaçao eGaming</small>
</div>
[/col]
[/row]
[divider width="100%" height="1px" margin="25px" color="rgba(255,255,255,0.08)"]
[row]
[col span="12" align="center"]
<p style="color: #64748b; font-size: 11px; margin-bottom: 6px; line-height: 1.5;">${disclaimer}</p>
<p style="color: #475569; font-size: 11px; margin-bottom: 0;">${copyright}</p>
[/col]
[/row]
[/section]`;
    }

    // 2. MẪU TẠP CHÍ & CỔNG THÔNG TIN (3 Cột Lớn 5 - 3 - 4)
    if (cfg.layout === 'magazine-3col') {
      const disclaimer = cfg.disclaimerText || 'Trang thông tin tổng hợp chuyên đề. Giấy phép thiết lập trang tin điện tử tổng hợp số 48/GP-TTĐT do Sở TT&TT cấp.';
      return `${customStyleHeader}[section ${sectionAttrs} padding="55px 0px 35px 0px"]
[row]
[col span="5" span__sm="12"]
${brandImgHtml || `<h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 12px;">${brand}</h3>`}
<p style="color: #cbd5e1; font-size: 0.95em; line-height: 1.6;">${bio}</p>
<div style="background: rgba(255,255,255,0.05); border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 4px; margin-top: 14px;">
  <p style="margin: 0; font-size: 0.85em; color: #94a3b8; line-height: 1.5;">${disclaimer}</p>
</div>
[/col]
[col span="3" span__sm="12"]
<h4>${col2Title || 'Chuyên Mục Nổi Bật'}</h4>
<ul style="line-height: 2;">
${col2ListHtml}
</ul>
[/col]
[col span="4" span__sm="12"]
<h4>${col4Title || 'Tòa Soạn & Đặt Bài'}</h4>
<p style="line-height: 1.8; margin-bottom: 0;">
  ${buildCol4ContactHtml('#60a5fa')}
</p>
${col4ActionBtn}
<p style="font-size: 0.85em; color: #64748b; margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">${copyright}</p>
[/col]
[/row]
[/section]`;
    }

    // 3. MẪU TỐI GIẢN HIỆN ĐẠI CĂN GIỮA (Minimalist Centered)
    if (cfg.layout === 'minimal-center') {
      const combinedLinks = [...col2Links, ...col3Links].slice(0, 8);
      const horizontalLinksHtml = combinedLinks
        .map(l => `<a href="${l.url || '#'}" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">${l.text}</a>`)
        .join('<span style="color: #475569; margin: 0 8px;">•</span>');

      return `${customStyleHeader}[section ${sectionAttrs} padding="65px 0px 45px 0px"]
[row]
[col span="12" align="center"]
${(cfg.logoUrl)
  ? `<div class="footer-brand-logo" style="margin-bottom: 16px; display: flex; justify-content: center;"><a href="/" title="${brand}"><img src="${cfg.logoUrl}" alt="${brand}" style="max-width: ${logoW}px; width: 100%; height: auto; display: block; margin: 0 auto;" /></a></div>`
  : `<h2 style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 10px;">${brand}</h2>`}
<p style="max-width: 680px; margin: 0 auto 22px auto; color: #94a3b8; font-size: 0.95em; line-height: 1.6;">${bio}</p>
<div style="margin-bottom: 22px; font-weight: 500; font-size: 0.9em; display: flex; justify-content: center; flex-wrap: wrap; align-items: center;">
${horizontalLinksHtml}
</div>
<div style="color: #cbd5e1; font-size: 0.88em; margin-bottom: 16px;">
  <span>📞 ${hotline}</span> &nbsp;&nbsp;|&nbsp;&nbsp; <span>✉️ ${email}</span> &nbsp;&nbsp;|&nbsp;&nbsp; <span>📍 ${address}</span>${cfg.col4WorkingHours ? ` &nbsp;&nbsp;|&nbsp;&nbsp; <span>⏰ ${cfg.col4WorkingHours}</span>` : ''}
  ${cfg.col4Links && cfg.col4Links.length > 0 ? cfg.col4Links.map(l => ` &nbsp;&nbsp;|&nbsp;&nbsp; ${formatCol4LinkItem(l, '#fbbf24')}`).join('') : ''}
</div>
${col4ActionBtn ? `<div style="margin-bottom: 16px;">${col4ActionBtn}</div>` : ''}
<div style="border-top: 1px solid rgba(255,255,255,0.08); max-width: 650px; margin: 20px auto 0 auto; padding-top: 16px;">
  <p style="color: #64748b; font-size: 0.82em; margin: 0;">${copyright}</p>
</div>
[/col]
[/row]
[/section]`;
    }

    // 4. MẪU THƯƠNG MẠI & BÁN HÀNG (Ecommerce 4 Cột + Cam kết + Cổng thanh toán)
    if (cfg.layout === 'ecommerce-modern') {
      return `${customStyleHeader}[section ${sectionAttrs} padding="60px 0px 35px 0px"]
[row]
[col span="3" span__sm="12"]
${brandImgHtml || `<h3 style="font-size: 1.25rem; font-weight: 700;">${brand}</h3>`}
<p style="font-size: 0.9em; color: #cbd5e1; line-height: 1.6;">${bio}</p>
<div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 6px 10px; margin-top: 12px; display: inline-block;">
  <span style="color: #10b981; font-size: 11px; font-weight: bold;">✓ Cam kết chính hãng & Hỗ trợ 24/7</span>
</div>
[/col]
[col span="3" span__sm="12"]
<h4>${col2Title || 'Chăm Sóc Khách Hàng'}</h4>
<ul style="line-height: 2;">
${col2ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>${col3Title || 'Sản Phẩm & Dịch Vụ'}</h4>
<ul style="line-height: 2;">
${col3ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>${col4Title || 'Tổng Đài Mua Hàng'}</h4>
<p style="line-height: 1.7; font-size: 0.9em; margin-bottom: 0;">
  ${buildCol4ContactHtml('#10b981')}
</p>
${col4ActionBtn}
<div style="margin-top: 12px; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 6px;">
  <span style="font-size: 10px; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px;">PHƯƠNG THỨC THANH TOÁN:</span>
  <span style="font-size: 11px; color: #e2e8f0;">💳 Thẻ Visa/Master • 🏦 Chuyển khoản • 📱 Ví điện tử • 🪙 USDT</span>
</div>
[/col]
[/row]
[divider width="100%" height="1px" margin="20px" color="rgba(255,255,255,0.08)"]
[row]
[col span="12" align="center"]
<p style="color: #64748b; font-size: 11px; margin-bottom: 0;">${copyright}</p>
[/col]
[/row]
[/section]`;
    }

    // 5. MẪU TIN TỨC / AFFILIATE 2 CỘT (Gọn Nhẹ 7 - 5)
    if (cfg.layout === 'affiliate-2col') {
      const disclaimer = cfg.disclaimerText || 'Tuyên bố miễn trừ: Thông tin trên website chỉ mang tính chất tham khảo. Chúng tôi không chịu trách nhiệm đối với bất kỳ quyết định cá nhân nào của người dùng.';
      return `${customStyleHeader}[section ${sectionAttrs} padding="50px 0px 40px 0px"]
[row]
[col span="7" span__sm="12"]
${brandImgHtml || `<h3>${brand}</h3>`}
<p>${bio}</p>
<p style="font-size: 0.88em; color: #94a3b8; font-style: italic;">${disclaimer}</p>
[/col]
[col span="5" span__sm="12"]
<h4>${col4Title || 'Thông Tin Liên Hệ'}</h4>
<p style="line-height: 1.8; margin-bottom: 0;">
  ${buildCol4ContactHtml('#f59e0b')}
</p>
${col4ActionBtn}
<p style="font-size: 0.85em; color: #64748b; margin-top: 14px;">${copyright}</p>
[/col]
[/row]
[/section]`;
    }

    // 6. DEFAULT: DOANH NGHIỆP 4 CỘT TIÊU CHUẨN (Corporate 4-col)
    return `${customStyleHeader}[section ${sectionAttrs} padding="60px 0px 40px 0px"]
[row]
[col span="3" span__sm="12"]
${brandImgHtml || `<h3>${brand}</h3>`}
<p>${bio}</p>
[/col]
[col span="3" span__sm="12"]
<h4>${col2Title}</h4>
<ul>
${col2ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>${col3Title}</h4>
<ul>
${col3ListHtml}
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>${col4Title}</h4>
<p style="line-height: 1.8; margin-bottom: 0;">
  ${buildCol4ContactHtml('#3b82f6')}
</p>
${col4ActionBtn}
[/col]
[divider width="100%" height="1px" margin="20px" color="rgba(255,255,255,0.08)"]
[row]
[col span="12" align="center"]
<p style="color: #64748b; font-size: 11px; margin-bottom: 0;">${copyright}</p>
[/col]
[/row]
[/section]`;
  }
}
