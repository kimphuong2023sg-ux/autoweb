import { CompilerService, SectionItem, FooterConfig } from '../compiler/compiler.service';
export interface AuthParams {
    username?: string;
    password?: string;
    token?: string;
}
export declare class BridgeService {
    private readonly compilerService;
    constructor(compilerService: CompilerService);
    private getClient;
    syncSite(siteUrl: string, auth: AuthParams): Promise<any>;
    wipeDefaults(siteUrl: string, auth: AuthParams, options: any): Promise<any>;
    applyThemeMods(siteUrl: string, auth: AuthParams, themeMods: any): Promise<any>;
    deployFooter(siteUrl: string, auth: AuthParams, footerConfig: FooterConfig): Promise<any>;
    deployHomepage(siteUrl: string, auth: AuthParams, sections: SectionItem[], title?: string): Promise<any>;
    setupEssentials(siteUrl: string, auth: AuthParams, essentials: any): Promise<any>;
    batchCreateContent(siteUrl: string, auth: AuthParams, payload: {
        default_type?: string;
        items: any[];
    }): Promise<any>;
    listContent(siteUrl: string, auth: AuthParams, options?: {
        type?: string;
    }): Promise<any>;
    deleteContent(siteUrl: string, auth: AuthParams, payload: {
        type: string;
        id?: number;
        slug?: string;
    }): Promise<any>;
    getMenu(siteUrl: string, auth: AuthParams, params?: {
        menu_id?: number;
        menu_name?: string;
    }): Promise<any>;
    saveMenu(siteUrl: string, auth: AuthParams, payload: {
        menu_id?: number;
        menu_name: string;
        items: any[];
        locations?: string[];
        styling?: any;
    }): Promise<any>;
    deployAll(siteUrl: string, auth: AuthParams, payload: {
        themeMods: any;
        footerConfig: FooterConfig;
        sections: SectionItem[];
        essentials: any;
        wipeFirst?: boolean;
        wipeOptions?: any;
    }): Promise<{
        success: boolean;
        message: string;
        details: any;
    }>;
    private getWpSession;
    uploadMedia(siteUrl: string, auth: AuthParams, payload: any): Promise<any>;
    updateMedia(siteUrl: string, auth: AuthParams, payload: any): Promise<any>;
    listMedia(siteUrl: string, auth: AuthParams): Promise<any>;
    deleteMedia(siteUrl: string, auth: AuthParams, targetIds: number | number[]): Promise<any>;
    pushPluginCode(siteUrl: string, auth: AuthParams): Promise<any>;
    autoInstallPlugin(siteUrl: string, auth: AuthParams): Promise<{
        success: boolean;
        message: string;
        inspect: any;
    }>;
    private handleError;
}
