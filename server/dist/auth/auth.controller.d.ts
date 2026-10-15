import { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMyIp(req: Request): {
        ip: string;
        isWhitelisted: boolean;
        settings: {
            whitelistEnabled: any;
        };
    };
    login(body: any, clientIp: string, res: Response): Response<any, Record<string, any>>;
    logout(req: Request): {
        success: boolean;
    };
    getMe(user: any): {
        success: boolean;
        user: any;
        presence: {
            userId: any;
            username: any;
            displayName: any;
            role: any;
            isOnline: boolean;
            presence: string;
            currentSite: any;
            currentAction: any;
            lastActiveAt: any;
            lastLoginIp: any;
            activities: any;
        };
    };
    heartbeatPost(user: any, body: any, clientIp: string): {
        success: boolean;
        timestamp: string;
        user: {
            id: any;
            username: any;
            role: any;
        };
    };
    heartbeatGet(user: any, clientIp: string): {
        success: boolean;
        timestamp: string;
        user: {
            id: any;
            username: any;
            role: any;
        };
    };
    updateActivity(user: any, body: any, clientIp: string): {
        success: boolean;
    };
}
