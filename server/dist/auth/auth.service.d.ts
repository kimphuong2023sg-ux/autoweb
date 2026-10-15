import { OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
export declare class AuthService implements OnModuleInit {
    jwtSecret: string | null;
    db: any;
    onModuleInit(): void;
    initDatabase(): void;
    reloadDb(): void;
    saveDb(data?: any): void;
    hashPassword(password: string, salt: string): string;
    createToken(payload: any): string;
    verifyToken(token: string): any;
    getClientIp(req: Request | any): string;
    matchIpPattern(clientIp: string, pattern: string): boolean;
    checkIpAllowed(clientIp: string, user?: any): {
        allowed: boolean;
        code?: string;
        message?: string;
    };
    addAuditLog({ username, ip, action, detail, status }: any): {
        id: string;
        timestamp: string;
        username: any;
        ip: any;
        action: any;
        detail: any;
        status: any;
    };
    login({ username, password, clientIp, portal }: any): {
        allowed: boolean;
        code?: string;
        message?: string;
        success: boolean;
        token?: undefined;
        kickedPreviousSession?: undefined;
        user?: undefined;
    } | {
        success: boolean;
        code: string;
        message: string;
        token?: undefined;
        kickedPreviousSession?: undefined;
        user?: undefined;
    } | {
        success: boolean;
        token: string;
        kickedPreviousSession: boolean;
        user: {
            id: any;
            username: any;
            displayName: any;
            role: any;
            lastLoginAt: any;
            lastLoginIp: any;
        };
        code?: undefined;
        message?: undefined;
    };
    logout(token: string): {
        success: boolean;
    };
    verifySession(token: string, clientIp: string): any;
    updateUserActivity(userId: string, { currentSite, action }?: any, clientIp?: string): void;
    getUserPresence(userId: string): {
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
    getUsersList(): any;
    createUser({ username, password, displayName, role, status, allowedIps }: any, adminUser: any): {
        id: string;
        username: any;
        displayName: any;
        role: string;
        status: string;
        allowedIps: string[];
    };
    updateUser(id: string, { displayName, role, status, allowedIps, newPassword }: any, adminUser: any): {
        success: boolean;
    };
    deleteUser(id: string, adminUser: any): {
        success: boolean;
    };
    kickUserSession(id: string, adminUser: any): {
        success: boolean;
    };
    getSettings(): any;
    toggleIpWhitelist(enabled: boolean, adminUser: any): {
        success: boolean;
        ipWhitelistEnabled: any;
    };
    addIpToWhitelist({ ip, description }: any, adminUser: any): {
        success: boolean;
        ip: {
            id: string;
            ip: any;
            description: any;
            enabled: boolean;
            createdAt: string;
        };
    };
    removeIpFromWhitelist(id: string, adminUser: any): {
        success: boolean;
    };
    toggleIpInWhitelist(id: string, adminUser: any): {
        success: boolean;
        ip: any;
    };
    getAuditLogs(limit?: number): any;
}
