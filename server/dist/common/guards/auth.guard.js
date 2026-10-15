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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/auth.service");
let AuthGuard = class AuthGuard {
    constructor(authService) {
        this.authService = authService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : request.query?.token || request.cookies?.token;
        const clientIp = this.authService.getClientIp(request);
        const sessionCheck = this.authService.verifySession(token, clientIp);
        if (!sessionCheck.valid) {
            throw new common_1.HttpException({
                success: false,
                code: sessionCheck.code || 'UNAUTHORIZED',
                message: sessionCheck.message || 'Yêu cầu đăng nhập!',
            }, sessionCheck.code === 'SESSION_KICKED' ? common_1.HttpStatus.UNAUTHORIZED : common_1.HttpStatus.UNAUTHORIZED);
        }
        request.user = sessionCheck.user;
        request.clientIp = clientIp;
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map