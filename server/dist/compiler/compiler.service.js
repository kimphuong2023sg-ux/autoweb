"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerService = void 0;
const common_1 = require("@nestjs/common");
let CompilerService = class CompilerService {
    compilePageSections(sections) {
        const shortcodeParts = [];
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
    extractSectionsFromContent(content) {
        if (!content || typeof content !== 'string')
            return null;
        const stateMatch = content.match(/<!--\s*FLATSOME_BUILDER_STATE:([A-Za-z0-9+/=]+)\s*-->/);
        if (stateMatch && stateMatch[1]) {
            try {
                const decoded = Buffer.from(stateMatch[1], 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
            catch (err) {
                console.warn('Failed to decode FLATSOME_BUILDER_STATE from comment:', err);
            }
        }
        const recoveredSections = [];
        const imageRegex = /\[ux_image\s+id="(\d+)"([^\]]*)\]/g;
        let imgMatch;
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
        let bannerMatch;
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
    getPaddingVal(padding) {
        if (padding === 'small')
            return '35px 0px 35px 0px';
        if (padding === 'large')
            return '90px 0px 90px 0px';
        return '60px 0px 60px 0px';
    }
    renderHeroSection(sec) {
        const bg = sec.bgColor || 'rgb(248, 250, 252)';
        const title = sec.title || 'Giải Pháp Đột Phá Cho Doanh Nghiệp Bạn';
        const subtitle = sec.subtitle || 'Tối ưu hóa hiệu suất, nâng tầm thương hiệu với quy trình chuyên nghiệp và chuẩn SEO hàng đầu.';
        const btnText = sec.buttonText || 'Nhận Tư Vấn Ngay';
        const btnLink = sec.buttonLink || '#contact';
        return `[section bg_color="${bg}" padding="60px 0px 60px 0px"]
[row v_align="middle"]
[col span="7" span__sm="12"]
[title style="bold" text="${title}" tag_name="h1" size="140"]
[ux_text font_size="1.1" text_color="rgb(80, 80, 80)"]
<p>${subtitle}</p>
[/ux_text]
[gap height="15px"]
[button text="${btnText}" link="${btnLink}" color="primary" size="large" radius="6"]
[button text="Tìm Hiểu Thêm" link="#about" color="secondary" style="outline" size="large" radius="6"]
[/col]
[col span="5" span__sm="12" align="center"]
[ux_image id="" image_size="large" depth="2" depth_hover="4"]
[/col]
[/row]
[/section]`;
    }
    renderServicesSection(sec) {
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
        return `[section bg_color="#ffffff" padding="60px 0px 60px 0px"]
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
    renderAboutSection(sec) {
        const title = sec.title || 'Về Chúng Tôi';
        const subtitle = sec.subtitle || 'Hành trình hơn 10 năm khẳng định vị thế và niềm tin từ khách hàng';
        const content = sec.content || 'Chúng tôi tiên phong trong việc ứng dụng công nghệ hiện đại nhằm mang lại trải nghiệm tối ưu nhất. Với tiêu chí lấy khách hàng làm trung tâm, mỗi dự án đều là tâm huyết được trau chuốt tỉ mỉ.';
        return `[section bg_color="#ffffff" padding="60px 0px 60px 0px"]
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
[button text="Xem Chi Tiết" link="#contact" color="primary" radius="5"]
[/col]
[/row]
[/section]`;
    }
    renderBlogSection(sec) {
        const title = sec.title || 'Tin Tức & Kiến Thức Mới Nhất';
        return `[section bg_color="rgb(248, 250, 252)" padding="60px 0px 60px 0px"]
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
    renderFaqSection(sec) {
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
        return `[section bg_color="#ffffff" padding="60px 0px 60px 0px"]
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
    renderCtaSection(sec) {
        const title = sec.title || 'Sẵn Sàng Nâng Tầm Dự Án Của Bạn?';
        const subtitle = sec.subtitle || 'Liên hệ ngay hôm nay để nhận tư vấn miễn phí từ các chuyên gia hàng đầu!';
        const btnText = sec.buttonText || 'Gọi Hotline Ngay';
        const btnLink = sec.buttonLink || 'tel:0988000000';
        return `[section bg_color="rgb(30, 41, 59)" dark="true" padding="50px 0px 50px 0px"]
[row v_align="middle"]
[col span="8" span__sm="12"]
[title style="bold" text="${title}" color="rgb(255, 255, 255)" tag_name="h2"]
[ux_text text_color="rgb(226, 232, 240)"]
<p>${subtitle}</p>
[/ux_text]
[/col]
[col span="4" span__sm="12" align="right"]
[button text="${btnText}" link="${btnLink}" color="white" style="primary" size="large" radius="6"]
[/col]
[/row]
[/section]`;
    }
    renderNumbersSection(sec) {
        const title = sec.title || 'Con Số Ấn Tượng';
        return `[section bg_color="rgb(241, 245, 249)" padding="50px 0px 50px 0px"]
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
    renderFeaturesSection(sec) {
        const title = sec.title || 'Lợi Ích Khi Hợp Tác';
        return `[section bg_color="#ffffff" padding="50px 0px 50px 0px"]
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
    renderBannerSection(sec) {
        const title = sec.title || 'Tiêu Đề Banner Lớn';
        const subtitle = sec.subtitle || 'Mô tả ngắn gọn về chương trình hoặc thông điệp chính';
        const btnText = sec.buttonText || 'Khám Phá Ngay';
        const btnLink = sec.buttonLink || '#';
        const bg = sec.bgColor || 'rgb(15, 23, 42)';
        const bgImg = sec.data?.imageId ? `bg="${sec.data.imageId}"` : (sec.data?.imageUrl ? `bg="${sec.data.imageUrl}"` : '');
        return `[section bg_color="${bg}" padding="0px"]
[ux_banner height="450px" ${bgImg} bg_overlay="rgba(0,0,0,0.4)" animate="fadeIn"]
[text_box width="60" position_x="50" position_y="50" text_align="center" text_depth="1"]
[title style="bold" text="${title}" color="rgb(255,255,255)" tag_name="h1" size="140"]
<p style="color: #f1f5f9; font-size: 1.15em;">${subtitle}</p>
[gap height="10px"]
[button text="${btnText}" link="${btnLink}" color="primary" size="large" radius="6"]
[/text_box]
[/ux_banner]
[/section]`;
    }
    renderSliderSection(sec) {
        return `[section padding="0px"]
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
    renderRowCustomSection(sec) {
        const layout = sec.layout || '3-col-equal';
        const bg = sec.bgColor || '#ffffff';
        const padding = this.getPaddingVal(sec.padding);
        const title = sec.title ? `[row][col span="12" align="center"][title style="bold-center" text="${sec.title}"][/col][/row]` : '';
        let cols = '';
        if (layout === '1-col') {
            cols = `[col span="12"]\n<p>${sec.content || 'Nội dung cột đơn...'}</p>\n[/col]`;
        }
        else if (layout === '2-col-equal') {
            cols = `[col span="6" span__sm="12"]\n<p>${sec.subtitle || 'Cột 1: Thông tin giới thiệu'}</p>\n[/col]\n[col span="6" span__sm="12"]\n<p>${sec.content || 'Cột 2: Nội dung chi tiết'}</p>\n[/col]`;
        }
        else if (layout === '2-col-left-wide') {
            cols = `[col span="4" span__sm="12"]\n<h4>${sec.subtitle || 'Thông tin nhanh'}</h4>\n[/col]\n[col span="8" span__sm="12"]\n<p>${sec.content || 'Nội dung chính chi tiết...'}</p>\n[/col]`;
        }
        else if (layout === '2-col-right-wide') {
            cols = `[col span="8" span__sm="12"]\n<p>${sec.content || 'Nội dung chính chi tiết...'}</p>\n[/col]\n[col span="4" span__sm="12"]\n<h4>${sec.subtitle || 'Khung thông tin'}</h4>\n[/col]`;
        }
        else if (layout === '4-col-equal') {
            cols = `[col span="3" span__sm="6"]<h4>Mục 1</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 2</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 3</h4>[/col]\n[col span="3" span__sm="6"]<h4>Mục 4</h4>[/col]`;
        }
        else {
            cols = `[col span="4" span__sm="12"]<h4>Mục 1</h4>[/col]\n[col span="4" span__sm="12"]<h4>Mục 2</h4>[/col]\n[col span="4" span__sm="12"]<h4>Mục 3</h4>[/col]`;
        }
        return `[section bg_color="${bg}" padding="${padding}"]\n${title}\n[row col_spacing="normal"]\n${cols}\n[/row]\n[/section]`;
    }
    renderImageSection(sec) {
        const isFullWidth = sec.data?.isFullWidth !== false && sec.data?.fullWidth !== false;
        const bg = sec.bgColor || '#ffffff';
        const padding = isFullWidth ? '0px' : this.getPaddingVal(sec.padding);
        const alt = sec.data?.alt || sec.data?.title || sec.title || '';
        const hasCaption = Boolean(sec.data?.caption && sec.data?.caption.trim());
        const shouldShowCaption = Boolean(hasCaption && sec.data?.showCaption === true);
        const captionHtml = shouldShowCaption
            ? (isFullWidth
                ? `\n[row padding="10px 0px 10px 0px"]\n[col span="12" align="center"]\n<p style="text-align: center; font-style: italic; color: #64748b; font-size: 0.9em; margin: 0 auto;">${sec.data.caption}</p>\n[/col]\n[/row]`
                : `\n<p style="text-align: center; font-style: italic; color: #64748b; font-size: 0.9em; margin-top: 10px;">${sec.data.caption}</p>`)
            : '';
        let imageTag = '';
        if (sec.data?.imageId) {
            const depthAttr = isFullWidth ? '' : ' depth="1" depth_hover="3"';
            imageTag = `[ux_image id="${sec.data.imageId}" image_alt="${alt}" image_size="original"${depthAttr} link="${sec.buttonLink || '#'}" width="100"]`;
        }
        else if (sec.data?.imageUrl) {
            const linkStart = sec.buttonLink && sec.buttonLink !== '#' ? `<a href="${sec.buttonLink}">` : '';
            const linkEnd = sec.buttonLink && sec.buttonLink !== '#' ? `</a>` : '';
            if (isFullWidth) {
                imageTag = `${linkStart}<img src="${sec.data.imageUrl}" alt="${alt}" style="width: 100%; height: auto; display: block;" />${linkEnd}`;
            }
            else {
                imageTag = `${linkStart}<img src="${sec.data.imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); display: block; margin: 0 auto;" />${linkEnd}`;
            }
        }
        else {
            imageTag = `<div style="padding: 40px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 8px; color: #94a3b8; font-size: 13px;">Chưa chọn hình ảnh</div>`;
        }
        if (isFullWidth) {
            return `[section bg_color="${bg}" padding="0px"]
[row width="full-width" col_style="collapse" padding="0px"]
[col span="12" padding="0px"]
${imageTag}
[/col]
[/row]${captionHtml}
[/section]`;
        }
        return `[section bg_color="${bg}" padding="${padding}"]
[row]
[col span="12" align="center"]
${imageTag}${captionHtml}
[/col]
[/row]
[/section]`;
    }
    renderImageBoxSection(sec) {
        const bg = sec.bgColor || 'rgb(248, 250, 252)';
        const padding = this.getPaddingVal(sec.padding);
        const imgParam = sec.data?.imageId || sec.data?.imageUrl || '';
        return `[section bg_color="${bg}" padding="${padding}"]
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
    renderTextBlockSection(sec) {
        const bg = sec.bgColor || '#ffffff';
        const padding = this.getPaddingVal(sec.padding);
        return `[section bg_color="${bg}" padding="${padding}"]
[row]
[col span="12"]
[title style="bold" text="${sec.title || 'Nội Dung Chi Tiết'}" tag_name="h2"]
[ux_text font_size="1.05" line_height="1.7"]
<p>${sec.content || sec.subtitle || 'Nội dung bài viết giới thiệu chi tiết về dịch vụ và cam kết chất lượng của doanh nghiệp.'}</p>
[/ux_text]
[/col]
[/row]
[/section]`;
    }
    renderTitleDividerSection(sec) {
        return `[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'TIÊU ĐỀ PHÂN CÁCH'}" tag_name="h2"]
[divider width="80px" height="3px" color="rgb(37, 99, 235)"]
[/col]
[/row]`;
    }
    renderPriceTableSection(sec) {
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
        return `[section bg_color="${bg}" padding="${padding}"]
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
    renderTestimonialsSection(sec) {
        const bg = sec.bgColor || '#ffffff';
        const padding = this.getPaddingVal(sec.padding);
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
        return `[section bg_color="${bg}" padding="${padding}"]
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
    renderTeamSection(sec) {
        const bg = sec.bgColor || 'rgb(248, 250, 252)';
        const padding = this.getPaddingVal(sec.padding);
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
        return `[section bg_color="${bg}" padding="${padding}"]
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
    renderTabsSection(sec) {
        const bg = sec.bgColor || '#ffffff';
        const padding = this.getPaddingVal(sec.padding);
        const title = sec.title || 'Thông Tin Chi Tiết & Quy Trình';
        return `[section bg_color="${bg}" padding="${padding}"]
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
    renderCountdownSection(sec) {
        const bg = sec.bgColor || 'rgb(15, 23, 42)';
        const title = sec.title || 'Ưu Đãi Đặc Biệt Trong Tháng';
        return `[section bg_color="${bg}" dark="true" padding="50px 0px"]
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
    renderVideoSection(sec) {
        const bg = sec.bgColor || '#ffffff';
        const padding = this.getPaddingVal(sec.padding);
        const url = sec.buttonLink || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        return `[section bg_color="${bg}" padding="${padding}"]
[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Video Giới Thiệu Doanh Nghiệp'}"]
[gap height="15px"]
[ux_video url="${url}"]
[/col]
[/row]
[/section]`;
    }
    renderMapSection(sec) {
        const address = sec.subtitle || 'Hà Nội, Việt Nam';
        return `[section padding="0px"]
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
    renderPortfolioSection(sec) {
        return `[section bg_color="rgb(248, 250, 252)" padding="60px 0px"]
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
    renderGallerySection(sec) {
        return `[section bg_color="#ffffff" padding="50px 0px"]
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
    renderSocialIconsSection(sec) {
        return `[row]
[col span="12" align="center"]
[title style="bold-center" text="${sec.title || 'Kết Nối Với Chúng Tôi'}"]
[gap height="10px"]
[follow style="fill" scale="120" facebook="#" instagram="#" youtube="#" twitter="#" email="#"]
[/col]
[/row]`;
    }
    renderMessageBoxSection(sec) {
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
        const hasButton1 = data.hasButton1 !== false;
        const btn1Text = (data.button1Text !== undefined ? data.button1Text : (data.buttonText || sec.buttonText || (hasButton1 ? 'Đăng Ký Ngay' : ''))).trim();
        const btn1Link = data.button1Link || data.buttonLink || sec.buttonLink || '#';
        const btn1Color = data.button1Color || 'white';
        const btn1Style = data.button1Style || '';
        const btn1Size = data.button1Size || 'medium';
        const btn1Animation = (data.button1Animation || '').trim();
        const hasButton2 = Boolean(data.hasButton2);
        const btn2Text = (data.button2Text || '').trim();
        const btn2Link = data.button2Link || '#';
        const btn2Color = data.button2Color || 'secondary';
        const btn2Style = data.button2Style || 'outline';
        const btn2Size = data.button2Size || 'medium';
        const btn2Animation = (data.button2Animation || '').trim();
        const btn1AnimClass = btn1Animation ? `btn-anim-${btn1Animation}` : '';
        const btn2AnimClass = btn2Animation ? `btn-anim-${btn2Animation}` : '';
        let btn1Shortcode = '';
        if (hasButton1 && btn1Text) {
            btn1Shortcode = `[button text="${btn1Text}" link="${btn1Link}" color="${btn1Color}" ${btn1Style ? `style="${btn1Style}"` : ''} size="${btn1Size}" radius="5"${btn1AnimClass ? ` class="${btn1AnimClass}"` : ''}]`;
        }
        let btn2Shortcode = '';
        if (hasButton2 && btn2Text) {
            btn2Shortcode = `[button text="${btn2Text}" link="${btn2Link}" color="${btn2Color}" ${btn2Style ? `style="${btn2Style}"` : ''} size="${btn2Size}" radius="5"${btn2AnimClass ? ` class="${btn2AnimClass}"` : ''}]`;
        }
        const boxLayout = data.boxLayout || (hasButton1 && btn1Text ? 'inline' : 'center');
        const buttonAlign = data.buttonAlign || (boxLayout === 'inline' ? 'right' : 'center');
        const borderRadius = data.borderRadius !== undefined ? Number(data.borderRadius) : 0;
        const shadow = (data.shadow || '').trim();
        const shadowHover = Boolean(data.shadowHover);
        const classesToAdd = [];
        if (customClass)
            classesToAdd.push(customClass);
        if (shadow && shadow.startsWith('box-shadow-')) {
            classesToAdd.push(shadow);
            if (shadowHover) {
                classesToAdd.push(`${shadow}-hover`);
            }
        }
        const mboxUniqueClass = `fs-mbox-${sec.id.replace(/[^a-zA-Z0-9_-]/g, '') || Math.floor(Math.random() * 100000)}`;
        const cssRules = [];
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
        }
        else if (shadow === 'glow-gold') {
            classesToAdd.push(mboxUniqueClass);
            cssRules.push(`box-shadow: 0 0 20px rgba(245, 158, 11, 0.45), 0 8px 25px rgba(0, 0, 0, 0.35) !important;`);
            if (shadowHover) {
                cssRules.push(`transition: all 0.3s ease !important;`);
            }
        }
        else if (shadow === 'glow-primary') {
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
        const hasAnyBtnAnim = Boolean(btn1Animation || btn2Animation);
        let animCss = '';
        if (hasAnyBtnAnim) {
            animCss = `
/* Hiệu Ứng Nút Bấm: Làn Mây Quét Sáng (Shimmer Sweep) */
.btn-anim-shimmer, .btn-anim-combo { position: relative !important; overflow: hidden !important; }
.btn-anim-shimmer::after, .btn-anim-combo::after {
  content: '' !important; position: absolute !important; top: 0 !important; left: -100% !important;
  width: 60% !important; height: 100% !important;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%) !important;
  transform: skewX(-25deg) !important;
  animation: jglBtnShimmerSweep 2.8s infinite ease-in-out !important; pointer-events: none !important;
}
@keyframes jglBtnShimmerSweep { 0% { left: -100%; } 35%, 100% { left: 200%; } }

/* Hiệu Ứng Nút Bấm: Rung Lắc Gây Chú Ý (Shake / Wiggle) */
.btn-anim-shake, .btn-anim-combo { animation: jglBtnShakeNotice 3.5s infinite ease-in-out !important; transform-origin: center center !important; }
@keyframes jglBtnShakeNotice {
  0%, 75%, 100% { transform: scale(1) rotate(0deg); }
  78% { transform: scale(1.06) rotate(-3.5deg); }
  81% { transform: scale(1.06) rotate(3.5deg); }
  84% { transform: scale(1.06) rotate(-3.5deg); }
  87% { transform: scale(1.06) rotate(2deg); }
  90% { transform: scale(1) rotate(0deg); }
}

/* Hiệu Ứng Nút Bấm: Nhịp Thở Phóng To (Heartbeat Pulse) */
.btn-anim-pulse { animation: jglBtnHeartPulse 2s infinite ease-in-out !important; }
@keyframes jglBtnHeartPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }

/* Hiệu Ứng Nút Bấm: Phát Sáng Hào Quang (Pulse Glow) */
.btn-anim-glow { animation: jglBtnGlowPulse 2.2s infinite ease-in-out !important; }
@keyframes jglBtnGlowPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.4), 0 0 10px currentColor; }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px currentColor; }
}`;
        }
        const uniqueClasses = Array.from(new Set(classesToAdd)).filter(Boolean);
        const finalClassStr = uniqueClasses.join(' ');
        const attrs = [];
        if (bgImage)
            attrs.push(`bg="${bgImage}"`);
        if (bgColor && bgColor !== 'transparent')
            attrs.push(`bg_color="${bgColor}"`);
        if (textColor)
            attrs.push(`text_color="${textColor}"`);
        if (padding !== undefined && padding !== '')
            attrs.push(`padding="${padding}"`);
        if (finalClassStr)
            attrs.push(`class="${finalClassStr}"`);
        if (visibility && visibility !== 'visible')
            attrs.push(`visibility="${visibility}"`);
        const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
        const hasAnyBtn = Boolean(btn1Shortcode || btn2Shortcode);
        const content = (sec.content !== undefined ? sec.content : (sec.subtitle || sec.title || '')).trim();
        const iconPrefix = icon && content ? `${icon} ` : '';
        const textHtml = content ? `<p style="text-align: ${textAlign}; margin: 0; font-size: 1.05em; font-weight: 600;">${iconPrefix}${content}</p>` : '';
        const btnCluster = [btn1Shortcode, btn2Shortcode].filter(Boolean).join(' ');
        const minHeightCss = minHeight > 0 ? `min-height: ${minHeight}px; ` : '';
        const flexAlign = buttonAlign === 'left' ? 'flex-start' : buttonAlign === 'right' ? 'flex-end' : 'center';
        let innerContent = '';
        if (boxLayout === 'buttons_only' || !content) {
            innerContent = `<div style="text-align: ${buttonAlign}; ${minHeightCss}display: flex; align-items: center; justify-content: ${flexAlign}; margin: 0;">\n  ${btnCluster}\n</div>`;
        }
        else if (boxLayout === 'inline' && hasAnyBtn && content) {
            if (buttonAlign === 'left') {
                innerContent = `<div style="${minHeightCss}display: flex; align-items: center; width: 100%;">
[row_inner v_align="middle" style="margin-bottom: 0; width: 100%;"]
[col_inner span="4" span__sm="12" align="left" align__sm="center"]
${btnCluster}
[/col_inner]
[col_inner span="8" span__sm="12" align="right" align__sm="center"]
<p style="text-align: right; margin: 0; font-size: 1.05em; font-weight: 600;">${iconPrefix}${content}</p>
[/col_inner]
[/row_inner]
</div>`;
            }
            else {
                innerContent = `<div style="${minHeightCss}display: flex; align-items: center; width: 100%;">
[row_inner v_align="middle" style="margin-bottom: 0; width: 100%;"]
[col_inner span="8" span__sm="12" align="left" align__sm="center"]
<p style="text-align: left; margin: 0; font-size: 1.05em; font-weight: 600;">${iconPrefix}${content}</p>
[/col_inner]
[col_inner span="4" span__sm="12" align="right" align__sm="center"]
${btnCluster}
[/col_inner]
[/row_inner]
</div>`;
            }
        }
        else {
            const buttonsBlock = hasAnyBtn ? `\n[gap height="10px"]\n<div style="text-align: ${buttonAlign};">\n  ${btnCluster}\n</div>` : '';
            innerContent = `<div style="${minHeightCss}display: flex; flex-direction: column; justify-content: center;">${textHtml}${buttonsBlock}</div>`;
        }
        const styleBlock = (cssRules.length > 0 || animCss)
            ? `\n<style>\n${cssRules.length > 0 ? `.${mboxUniqueClass} {\n  ${cssRules.join('\n  ')}\n}${hoverCss}` : ''}${animCss}\n</style>`
            : '';
        const messageBoxShortcode = `[message_box${attrStr}]
${innerContent}
[/message_box]${styleBlock}`;
        const wrapInSection = data.wrapInSection !== false;
        if (!wrapInSection) {
            return messageBoxShortcode;
        }
        const sectionBg = sec.bgColor || '#ffffff';
        const sectionPadding = this.getPaddingVal(sec.padding);
        const layout = sec.layout || '1-col';
        let cols = '';
        if (layout === '1-col') {
            cols = `[col span="12"]
${messageBoxShortcode}
[/col]`;
        }
        else if (layout === '2-col-equal') {
            cols = `[col span="6" span__sm="12"]
${messageBoxShortcode}
[/col]
[col span="6" span__sm="12"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]`;
        }
        else if (layout === '2-col-left-wide') {
            cols = `[col span="4" span__sm="12"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="8" span__sm="12"]
${messageBoxShortcode}
[/col]`;
        }
        else if (layout === '2-col-right-wide') {
            cols = `[col span="8" span__sm="12"]
${messageBoxShortcode}
[/col]
[col span="4" span__sm="12"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]`;
        }
        else if (layout === '3-col-equal') {
            cols = `[col span="4" span__sm="12"]
${messageBoxShortcode}
[/col]
[col span="4" span__sm="12"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="4" span__sm="12"]
[/col]`;
        }
        else if (layout === '4-col-equal') {
            cols = `[col span="3" span__sm="6"]
${messageBoxShortcode}
[/col]
[col span="3" span__sm="6"]
${sec.subtitle ? `<p>${sec.subtitle}</p>` : ''}
[/col]
[col span="3" span__sm="6"]
[/col]
[col span="3" span__sm="6"]
[/col]`;
        }
        else {
            cols = `[col span="12"]
${messageBoxShortcode}
[/col]`;
        }
        return `[section bg_color="${sectionBg}" padding="${sectionPadding}"]
[row]
${cols}
[/row]
[/section]`;
    }
    renderDividerGapSection(sec) {
        return `[gap height="25px"]
[divider width="100%" height="1px" color="rgb(226, 232, 240)"]
[gap height="25px"]`;
    }
    compileFooter(cfg) {
        const bg = cfg.bgColor || 'rgb(30, 41, 59)';
        const brand = cfg.brandName || 'Thương Hiệu Của Bạn';
        const bio = cfg.bio || 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và chuyên nghiệp.';
        const hotline = cfg.hotline || '0988.xxx.xxx';
        const email = cfg.email || 'lienhe@domain.com';
        const address = cfg.address || 'Hà Nội, Việt Nam';
        if (cfg.layout === 'affiliate-2col') {
            return `[section bg_color="${bg}" dark="true" padding="50px 0px 40px 0px"]
[row]
[col span="7" span__sm="12"]
<h3>${brand}</h3>
<p>${bio}</p>
<p><em>Tuyên bố miễn trừ: Thông tin trên website chỉ mang tính chất tham khảo.</em></p>
[/col]
[col span="5" span__sm="12"]
<h4>Thông Tin Liên Hệ</h4>
<p><strong>Hotline:</strong> ${hotline}<br>
<strong>Email:</strong> ${email}<br>
<strong>Địa chỉ:</strong> ${address}</p>
[/col]
[/row]
[/section]`;
        }
        return `[section bg_color="${bg}" dark="true" padding="60px 0px 40px 0px"]
[row]
[col span="3" span__sm="12"]
<h3>${brand}</h3>
<p>${bio}</p>
[/col]
[col span="3" span__sm="12"]
<h4>Về Chúng Tôi</h4>
<ul>
  <li><a href="/gioi-thieu/">Giới thiệu công ty</a></li>
  <li><a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a></li>
  <li><a href="/dieu-khoan-su-dung/">Điều khoản sử dụng</a></li>
  <li><a href="/lien-he/">Liên hệ hợp tác</a></li>
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>Dịch Vụ Chính</h4>
<ul>
  <li><a href="#">Tư vấn chiến lược</a></li>
  <li><a href="#">Giải pháp trọn gói</a></li>
  <li><a href="#">Tối ưu hóa chuyển đổi</a></li>
  <li><a href="#">Hỗ trợ kỹ thuật 24/7</a></li>
</ul>
[/col]
[col span="3" span__sm="12"]
<h4>Liên Hệ Nhanh</h4>
<p><strong>Hotline:</strong> ${hotline}<br>
<strong>Email:</strong> ${email}<br>
<strong>Địa chỉ:</strong> ${address}</p>
[/col]
[/row]
[/section]`;
    }
};
exports.CompilerService = CompilerService;
exports.CompilerService = CompilerService = __decorate([
    (0, common_1.Injectable)()
], CompilerService);
//# sourceMappingURL=compiler.service.js.map