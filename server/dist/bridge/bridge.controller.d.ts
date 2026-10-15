import { BridgeService } from './bridge.service';
interface AuthBody {
    siteUrl: string;
    username?: string;
    password?: string;
    token?: string;
}
export declare class BridgeController {
    private readonly bridgeService;
    constructor(bridgeService: BridgeService);
    private validateCredentials;
    private extractAuth;
    sync(body: AuthBody): Promise<any>;
    wipe(body: AuthBody & {
        options?: any;
    }): Promise<any>;
    applyThemeMods(body: AuthBody & {
        themeMods: any;
    }): Promise<any>;
    deployFooter(body: AuthBody & {
        footerConfig: any;
    }): Promise<any>;
    deployHomepage(body: AuthBody & {
        sections: any[];
        title?: string;
    }): Promise<any>;
    setupEssentials(body: AuthBody & {
        essentials: any;
    }): Promise<any>;
    batchCreateContent(body: AuthBody & {
        default_type?: string;
        items: any[];
    }): Promise<any>;
    listContent(body: AuthBody & {
        type?: string;
    }): Promise<any>;
    deleteContent(body: AuthBody & {
        type: string;
        id?: number;
        slug?: string;
    }): Promise<any>;
    deployAll(body: AuthBody & {
        themeMods: any;
        footerConfig: any;
        sections: any[];
        essentials: any;
        wipeFirst?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        details: any;
    }>;
    autoInstall(body: AuthBody): Promise<{
        success: boolean;
        message: string;
        inspect: any;
    }>;
    installFlatsomeTheme(body: AuthBody): Promise<{
        success: boolean;
        message: any;
        inspect: any;
    }>;
    pushPluginCode(body: AuthBody): Promise<{
        success: boolean;
        message: string;
        inspect: any;
    }>;
    uploadMedia(body: AuthBody & {
        mediaId?: number;
        media_id?: number;
        filename?: string;
        fileData?: string;
        imageUrl?: string;
        altText?: string;
        title?: string;
        caption?: string;
        description?: string;
    }): Promise<any>;
    updateMedia(body: AuthBody & {
        mediaId?: number;
        media_id?: number;
        altText?: string;
        alt_text?: string;
        title?: string;
        caption?: string;
        description?: string;
    }): Promise<any>;
    setFavicon(body: AuthBody & {
        mediaId?: number;
        media_id?: number;
        fileData?: string;
        imageUrl?: string;
        filename?: string;
        remove?: boolean;
    }): Promise<any>;
    listMedia(body: AuthBody): Promise<{
        success: boolean;
        media: any[];
        total: any;
    }>;
    deleteMedia(body: AuthBody & {
        mediaId?: number;
        id?: number;
        mediaIds?: number[];
        ids?: number[];
    }): Promise<any>;
    getMenu(body: AuthBody & {
        menu_id?: number;
        menu_name?: string;
    }): Promise<any>;
    saveMenu(body: AuthBody & {
        menu_id?: number;
        menu_name: string;
        items: any[];
        locations?: string[];
        styling?: any;
    }): Promise<any>;
    saveSubpageStyling(body: AuthBody & {
        styling: any;
    }): Promise<any>;
}
export {};
