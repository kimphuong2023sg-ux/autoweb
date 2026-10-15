export type FlatsomeElementType = 'hero' | 'banner' | 'slider' | 'row_custom' | 'services' | 'icon_box' | 'image' | 'image_box' | 'about' | 'text_block' | 'title_divider' | 'button_group' | 'price_table' | 'testimonials' | 'team' | 'faq' | 'tabs' | 'numbers' | 'countdown' | 'video' | 'map' | 'blog' | 'portfolio' | 'gallery' | 'social_icons' | 'message_box' | 'divider_gap' | 'cta' | 'features';
export interface SectionItem {
    id: string;
    type: FlatsomeElementType;
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
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
export declare class CompilerService {
    compilePageSections(sections: SectionItem[]): string;
    extractSectionsFromContent(content?: string): SectionItem[] | null;
    private getPaddingConfig;
    private getPaddingVal;
    private getVisibilityAttr;
    private renderHeroSection;
    private renderServicesSection;
    private renderAboutSection;
    private renderBlogSection;
    private renderFaqSection;
    private renderCtaSection;
    private renderNumbersSection;
    private renderFeaturesSection;
    private renderBannerSection;
    private renderSliderSection;
    private renderRowCustomSection;
    private renderImageSection;
    private renderImageBoxSection;
    private renderTextBlockSection;
    private renderTitleDividerSection;
    private renderPriceTableSection;
    private renderTestimonialsSection;
    private renderTeamSection;
    private renderTabsSection;
    private renderCountdownSection;
    private renderVideoSection;
    private renderMapSection;
    private renderPortfolioSection;
    private renderGallerySection;
    private renderSocialIconsSection;
    private renderMessageBoxSection;
    compilePageCustomCss(sections: SectionItem[]): string;
    private renderDividerGapSection;
    private formatRichText;
    compileFooter(cfg: FooterConfig): string;
}
