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
    padding?: 'small' | 'normal' | 'large';
    layout?: '1-col' | '2-col-equal' | '2-col-left-wide' | '2-col-right-wide' | '3-col-equal' | '4-col-equal';
    textColor?: 'dark' | 'light';
    data?: any;
}
export interface FooterConfig {
    layout: 'corporate-4col' | 'ecommerce-3col' | 'affiliate-2col';
    brandName: string;
    bio?: string;
    hotline?: string;
    email?: string;
    address?: string;
    bgColor?: string;
    copyright?: string;
}
export declare class CompilerService {
    compilePageSections(sections: SectionItem[]): string;
    extractSectionsFromContent(content?: string): SectionItem[] | null;
    private getPaddingVal;
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
    private renderDividerGapSection;
    compileFooter(cfg: FooterConfig): string;
}
