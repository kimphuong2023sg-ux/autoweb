import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    getSections(): ({
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        defaultSubtitle: string;
        defaultButtonText: string;
        defaultButtonLink: string;
        bgColor: string;
        data?: undefined;
        content?: undefined;
    } | {
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        defaultSubtitle: string;
        data: {
            items: {
                title: string;
                desc: string;
            }[];
            faqs?: undefined;
        };
        defaultButtonText?: undefined;
        defaultButtonLink?: undefined;
        bgColor?: undefined;
        content?: undefined;
    } | {
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        defaultSubtitle: string;
        content: string;
        defaultButtonText?: undefined;
        defaultButtonLink?: undefined;
        bgColor?: undefined;
        data?: undefined;
    } | {
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        defaultSubtitle?: undefined;
        defaultButtonText?: undefined;
        defaultButtonLink?: undefined;
        bgColor?: undefined;
        data?: undefined;
        content?: undefined;
    } | {
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        data: {
            faqs: {
                q: string;
                a: string;
            }[];
            items?: undefined;
        };
        defaultSubtitle?: undefined;
        defaultButtonText?: undefined;
        defaultButtonLink?: undefined;
        bgColor?: undefined;
        content?: undefined;
    } | {
        type: string;
        name: string;
        desc: string;
        icon: string;
        defaultTitle: string;
        defaultSubtitle: string;
        defaultButtonText: string;
        defaultButtonLink: string;
        bgColor?: undefined;
        data?: undefined;
        content?: undefined;
    })[];
    getNiches(): {
        id: string;
        name: string;
        badge: string;
        colorPrimary: string;
        colorSecondary: string;
        topbarText: string;
        defaultSections: string[];
    }[];
    getFooters(): {
        id: string;
        name: string;
        desc: string;
        bgColor: string;
        textColor: string;
    }[];
}
