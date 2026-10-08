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
exports.BridgeController = void 0;
const common_1 = require("@nestjs/common");
const bridge_service_1 = require("./bridge.service");
let BridgeController = class BridgeController {
    constructor(bridgeService) {
        this.bridgeService = bridgeService;
    }
    validateCredentials(body) {
        if (!body?.siteUrl) {
            throw new common_1.BadRequestException('Vui lòng cung cấp URL Website');
        }
        const hasUserPass = Boolean(body.username && body.password);
        const hasToken = Boolean(body.token);
        if (!hasUserPass && !hasToken) {
            throw new common_1.BadRequestException('Vui lòng nhập Tên đăng nhập và Mật khẩu WordPress (hoặc Secret Token)');
        }
    }
    extractAuth(body) {
        return {
            username: body.username,
            password: body.password,
            token: body.token,
        };
    }
    async sync(body) {
        this.validateCredentials(body);
        return this.bridgeService.syncSite(body.siteUrl, this.extractAuth(body));
    }
    async wipe(body) {
        this.validateCredentials(body);
        return this.bridgeService.wipeDefaults(body.siteUrl, this.extractAuth(body), body.options || {});
    }
    async applyThemeMods(body) {
        this.validateCredentials(body);
        return this.bridgeService.applyThemeMods(body.siteUrl, this.extractAuth(body), body.themeMods || {});
    }
    async deployFooter(body) {
        this.validateCredentials(body);
        return this.bridgeService.deployFooter(body.siteUrl, this.extractAuth(body), body.footerConfig);
    }
    async deployHomepage(body) {
        this.validateCredentials(body);
        return this.bridgeService.deployHomepage(body.siteUrl, this.extractAuth(body), body.sections || [], body.title);
    }
    async setupEssentials(body) {
        this.validateCredentials(body);
        return this.bridgeService.setupEssentials(body.siteUrl, this.extractAuth(body), body.essentials);
    }
    async batchCreateContent(body) {
        this.validateCredentials(body);
        return this.bridgeService.batchCreateContent(body.siteUrl, this.extractAuth(body), {
            default_type: body.default_type,
            items: body.items || [],
        });
    }
    async listContent(body) {
        this.validateCredentials(body);
        return this.bridgeService.listContent(body.siteUrl, this.extractAuth(body), {
            type: body.type || 'all',
        });
    }
    async deleteContent(body) {
        this.validateCredentials(body);
        return this.bridgeService.deleteContent(body.siteUrl, this.extractAuth(body), {
            type: body.type,
            id: body.id,
            slug: body.slug,
        });
    }
    async deployAll(body) {
        this.validateCredentials(body);
        return this.bridgeService.deployAll(body.siteUrl, this.extractAuth(body), body);
    }
    async autoInstall(body) {
        this.validateCredentials(body);
        return this.bridgeService.autoInstallPlugin(body.siteUrl, this.extractAuth(body));
    }
    async pushPluginCode(body) {
        this.validateCredentials(body);
        return this.bridgeService.pushPluginCode(body.siteUrl, this.extractAuth(body));
    }
    async uploadMedia(body) {
        this.validateCredentials(body);
        return this.bridgeService.uploadMedia(body.siteUrl, this.extractAuth(body), {
            mediaId: body.mediaId || body.media_id,
            media_id: body.mediaId || body.media_id,
            filename: body.filename,
            fileData: body.fileData,
            file_data: body.fileData,
            imageUrl: body.imageUrl,
            image_url: body.imageUrl,
            altText: body.altText,
            alt_text: body.altText,
            title: body.title,
            caption: body.caption,
            description: body.description,
        });
    }
    async updateMedia(body) {
        this.validateCredentials(body);
        return this.bridgeService.updateMedia(body.siteUrl, this.extractAuth(body), {
            mediaId: body.mediaId || body.media_id,
            media_id: body.mediaId || body.media_id,
            altText: body.altText || body.alt_text,
            alt_text: body.altText || body.alt_text,
            title: body.title,
            caption: body.caption,
            description: body.description,
        });
    }
    async listMedia(body) {
        this.validateCredentials(body);
        return this.bridgeService.listMedia(body.siteUrl, this.extractAuth(body));
    }
    async deleteMedia(body) {
        this.validateCredentials(body);
        const mediaIds = (body.mediaIds && body.mediaIds.length > 0 && body.mediaIds) ||
            (body.ids && body.ids.length > 0 && body.ids) ||
            (body.mediaId || body.id ? [body.mediaId || body.id] : []);
        if (!mediaIds || mediaIds.length === 0) {
            throw new common_1.BadRequestException('Vui lòng cung cấp mediaId hoặc mediaIds của ảnh cần xóa');
        }
        return this.bridgeService.deleteMedia(body.siteUrl, this.extractAuth(body), mediaIds);
    }
    async getMenu(body) {
        this.validateCredentials(body);
        return this.bridgeService.getMenu(body.siteUrl, this.extractAuth(body), {
            menu_id: body.menu_id,
            menu_name: body.menu_name,
        });
    }
    async saveMenu(body) {
        this.validateCredentials(body);
        return this.bridgeService.saveMenu(body.siteUrl, this.extractAuth(body), {
            menu_id: body.menu_id,
            menu_name: body.menu_name,
            items: body.items,
            locations: body.locations,
            styling: body.styling,
        });
    }
};
exports.BridgeController = BridgeController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)('wipe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "wipe", null);
__decorate([
    (0, common_1.Post)('theme-mods'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "applyThemeMods", null);
__decorate([
    (0, common_1.Post)('deploy-footer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "deployFooter", null);
__decorate([
    (0, common_1.Post)('deploy-homepage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "deployHomepage", null);
__decorate([
    (0, common_1.Post)('setup-essentials'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "setupEssentials", null);
__decorate([
    (0, common_1.Post)('batch-create-content'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "batchCreateContent", null);
__decorate([
    (0, common_1.Post)('list-content'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "listContent", null);
__decorate([
    (0, common_1.Post)('delete-content'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "deleteContent", null);
__decorate([
    (0, common_1.Post)('deploy-all'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "deployAll", null);
__decorate([
    (0, common_1.Post)('auto-install'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "autoInstall", null);
__decorate([
    (0, common_1.Post)('push-plugin-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "pushPluginCode", null);
__decorate([
    (0, common_1.Post)('upload-media'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Post)('update-media'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "updateMedia", null);
__decorate([
    (0, common_1.Post)('list-media'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "listMedia", null);
__decorate([
    (0, common_1.Post)('delete-media'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Post)('get-menu'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Post)('save-menu'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "saveMenu", null);
exports.BridgeController = BridgeController = __decorate([
    (0, common_1.Controller)('api/bridge'),
    __metadata("design:paramtypes", [bridge_service_1.BridgeService])
], BridgeController);
//# sourceMappingURL=bridge.controller.js.map