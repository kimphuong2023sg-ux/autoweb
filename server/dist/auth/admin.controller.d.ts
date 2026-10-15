import { AuthService } from './auth.service';
export declare class AdminController {
    private readonly authService;
    constructor(authService: AuthService);
    getUsers(): {
        success: boolean;
        users: any;
    };
    createUser(body: any, admin: any, clientIp: string): {
        success: boolean;
        user: {
            id: string;
            username: any;
            displayName: any;
            role: string;
            status: string;
            allowedIps: string[];
        };
    };
    updateUser(id: string, body: any, admin: any, clientIp: string): {
        success: boolean;
    };
    deleteUser(id: string, admin: any): {
        success: boolean;
    };
    kickUser(id: string, admin: any): {
        success: boolean;
    };
    getUserActivities(id: string): {
        success: boolean;
        username: any;
        displayName: any;
        activities: any;
    };
    getIpWhitelist(): {
        success: boolean;
        ipWhitelistEnabled: any;
        ipWhitelist: any;
    };
    toggleWhitelist(enabled: boolean, admin: any, clientIp: string): {
        success: boolean;
        ipWhitelistEnabled: any;
    };
    addIpWhitelist(body: any, admin: any, clientIp: string): {
        success: boolean;
        ip: {
            id: string;
            ip: any;
            description: any;
            enabled: boolean;
            createdAt: string;
        };
    };
    removeIpWhitelist(id: string, admin: any): {
        success: boolean;
    };
    toggleIpItem(id: string, admin: any): {
        success: boolean;
        ip: any;
    };
    getAuditLogs(limitStr?: string): {
        success: boolean;
        logs: any;
    };
}
