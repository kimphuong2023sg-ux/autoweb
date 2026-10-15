"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const admin_guard_1 = require("../common/guards/admin.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_ip_decorator_1 = require("../common/decorators/client-ip.decorator");
let AdminController = class AdminController {
    constructor(authService) {
        this.authService = authService;
    }
    getUsers() {
        return { success: true, users: this.authService.getUsersList() };
    }
    createUser(body, admin, clientIp) {
        try {
            const user = this.authService.createUser(body, { ...admin, ip: clientIp });
            return { success: true, user };
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    updateUser(id, body, admin, clientIp) {
        try {
            const result = this.authService.updateUser(id, body, { ...admin, ip: clientIp });
            return result;
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    deleteUser(id, admin) {
        try {
            const result = this.authService.deleteUser(id, admin);
            return result;
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    kickUser(id, admin) {
        try {
            const result = this.authService.kickUserSession(id, admin);
            return result;
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    getUserActivities(id) {
        const user = (this.authService.db.users || []).find((u) => u.id === id);
        if (!user) {
            throw new common_1.BadRequestException({ success: false, error: 'Không tìm thấy người dùng!' });
        }
        return {
            success: true,
            username: user.username,
            displayName: user.displayName,
            activities: user.activityHistory || [],
        };
    }
    getIpWhitelist() {
        const settings = this.authService.getSettings();
        return {
            success: true,
            ipWhitelistEnabled: settings.ipWhitelistEnabled || false,
            ipWhitelist: settings.ipWhitelist || [],
        };
    }
    toggleWhitelist(enabled, admin, clientIp) {
        return this.authService.toggleIpWhitelist(enabled, { ...admin, ip: clientIp });
    }
    addIpWhitelist(body, admin, clientIp) {
        try {
            return this.authService.addIpToWhitelist(body, { ...admin, ip: clientIp });
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    removeIpWhitelist(id, admin) {
        try {
            return this.authService.removeIpFromWhitelist(id, admin);
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    toggleIpItem(id, admin) {
        try {
            return this.authService.toggleIpInWhitelist(id, admin);
        }
        catch (err) {
            throw new common_1.BadRequestException({ success: false, error: err.message });
        }
    }
    getAuditLogs(limitStr) {
        const limit = limitStr ? parseInt(limitStr, 10) : 100;
        return {
            success: true,
            logs: this.authService.getAuditLogs(limit),
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, client_ip_decorator_1.ClientIp)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, client_ip_decorator_1.ClientIp)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('users/:id/kick'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "kickUser", null);
__decorate([
    (0, common_1.Get)('users/:id/activities'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserActivities", null);
__decorate([
    (0, common_1.Get)('ip-whitelist'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getIpWhitelist", null);
__decorate([
    (0, common_1.Put)('ip-whitelist/toggle'),
    __param(0, (0, common_1.Body)('enabled')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, client_ip_decorator_1.ClientIp)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleWhitelist", null);
__decorate([
    (0, common_1.Post)('ip-whitelist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, client_ip_decorator_1.ClientIp)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addIpWhitelist", null);
__decorate([
    (0, common_1.Delete)('ip-whitelist/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "removeIpWhitelist", null);
__decorate([
    (0, common_1.Put)('ip-whitelist/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleIpItem", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map