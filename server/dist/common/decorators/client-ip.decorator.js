"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientIp = void 0;
const common_1 = require("@nestjs/common");
exports.ClientIp = (0, common_1.createParamDecorator)((data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    let rawIp = '';
    const cfConnecting = req.headers['cf-connecting-ip'];
    const xRealIp = req.headers['x-real-ip'];
    const forwarded = req.headers['x-forwarded-for'];
    if (cfConnecting) {
        rawIp = (Array.isArray(cfConnecting) ? cfConnecting[0] : cfConnecting).trim();
    }
    else if (xRealIp) {
        rawIp = (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp).trim();
    }
    else if (forwarded) {
        const fwd = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        rawIp = fwd.split(',')[0].trim();
    }
    if (!rawIp) {
        rawIp = req.socket?.remoteAddress || req.ip || '';
    }
    if (rawIp.startsWith('::ffff:')) {
        rawIp = rawIp.replace('::ffff:', '');
    }
    if (rawIp === '::1')
        return '127.0.0.1';
    return rawIp || '127.0.0.1';
});
//# sourceMappingURL=client-ip.decorator.js.map