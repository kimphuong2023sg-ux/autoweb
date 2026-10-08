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
exports.BridgeService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const AdmZip = require('adm-zip');
const compiler_service_1 = require("../compiler/compiler.service");
let BridgeService = class BridgeService {
    constructor(compilerService) {
        this.compilerService = compilerService;
    }
    getClient(siteUrl, auth) {
        let cleanUrl = siteUrl.trim();
        cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
        cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
        cleanUrl = cleanUrl.replace(/\/+$/, '');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (auth.username && auth.password) {
            headers['X-WP-Username'] = auth.username;
            headers['X-WP-Password'] = auth.password;
            const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
            headers['Authorization'] = `Basic ${basic}`;
        }
        else if (auth.token) {
            headers['X-Bridge-Token'] = auth.token;
        }
        return axios_1.default.create({
            baseURL: `${cleanUrl}/wp-json/flatsome-bridge/v1`,
            headers,
            timeout: 25000,
        });
    }
    async syncSite(siteUrl, auth) {
        try {
            const client = this.getClient(siteUrl, auth);
            const res = await client.get('/inspect');
            const inspectData = res.data;
            if (!inspectData || typeof inspectData !== 'object' || typeof inspectData === 'string' || inspectData.success === false) {
                throw new Error((inspectData && inspectData.message) ||
                    'Website phản hồi dữ liệu không hợp lệ (không phải JSON từ Flatsome SEO Bridge). Vui lòng kiểm tra lại URL hoặc cài lại Plugin!');
            }
            const cleanUrl = siteUrl.trim().replace(/\/wp-admin(\/.*)?$/i, '').replace(/\/wp-login\.php.*$/i, '').replace(/\/+$/, '');
            if (!inspectData.site) {
                inspectData.site = {
                    name: 'WordPress Website',
                    url: cleanUrl,
                    theme: 'Flatsome',
                    theme_version: 'v3.x',
                    is_flatsome: true,
                };
            }
            if (!inspectData.stats) {
                inspectData.stats = {
                    published_posts: 0,
                    published_pages: 0,
                    products: 0,
                    ux_blocks: 0,
                    active_widgets: 0,
                    has_hello_world: false,
                    has_sample_page: false,
                    is_demo_loaded: false,
                };
            }
            let postContent = inspectData?.homepage?.post_content;
            let builderState = inspectData?.homepage?.builder_state;
            if ((!postContent || !builderState) && inspectData?.homepage?.id) {
                try {
                    const wpCoreClient = axios_1.default.create({
                        baseURL: `${cleanUrl}/wp-json/wp/v2`,
                        headers: client.defaults.headers,
                        timeout: 10000,
                    });
                    const pageRes = await wpCoreClient.get(`/pages/${inspectData.homepage.id}?context=edit`);
                    if (pageRes.data?.content?.raw) {
                        postContent = pageRes.data.content.raw;
                    }
                    else if (pageRes.data?.content?.rendered) {
                        postContent = pageRes.data.content.rendered;
                    }
                    if (pageRes.data?.meta?._flatsome_autotheme_state) {
                        builderState = pageRes.data.meta._flatsome_autotheme_state;
                    }
                }
                catch (_) {
                    try {
                        const pubRes = await axios_1.default.get(`${cleanUrl}/wp-json/wp/v2/pages/${inspectData.homepage.id}`, { timeout: 8000 });
                        if (pubRes.data?.content?.rendered) {
                            postContent = pubRes.data.content.rendered;
                        }
                    }
                    catch (__) { }
                }
            }
            let savedSections = null;
            if (builderState) {
                try {
                    const parsed = typeof builderState === 'string' ? JSON.parse(builderState) : builderState;
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        savedSections = parsed;
                    }
                }
                catch (_) { }
            }
            if (!savedSections && postContent) {
                savedSections = this.compilerService.extractSectionsFromContent(postContent);
            }
            if (inspectData?.homepage) {
                inspectData.homepage.post_content = postContent;
                inspectData.homepage.savedSections = savedSections;
            }
            const stats = inspectData?.stats || {};
            const flatsome = inspectData?.flatsome || {};
            const homepage = inspectData?.homepage || {};
            const step1Clean = !stats.has_hello_world && !stats.has_sample_page && !stats.is_demo_loaded;
            const step2Theme = Boolean((flatsome.color_primary && flatsome.color_primary !== '#446084') ||
                flatsome.site_logo ||
                flatsome.topbar_content);
            const step3Home = Boolean(homepage.has_ux_shortcodes ||
                (savedSections && savedSections.length > 0) ||
                (homepage.content_length && homepage.content_length > 100));
            const step4Footer = Boolean(flatsome.footer_block && flatsome.footer_block !== '0');
            const stepFlags = [step1Clean, step2Theme, step3Home, step4Footer];
            const completedCount = stepFlags.filter(Boolean).length;
            let resumeStep = stepFlags.findIndex((done) => !done) + 1;
            if (resumeStep === 0)
                resumeStep = 4;
            inspectData.scanProgress = {
                step1Clean,
                step2Theme,
                step3Home,
                step4Footer,
                completedCount,
                resumeStep,
            };
            return inspectData;
        }
        catch (err) {
            this.handleError(err, 'Không thể kết nối đến WordPress. Vui lòng kiểm tra lại URL, Tên đăng nhập và Mật khẩu!');
        }
    }
    async wipeDefaults(siteUrl, auth, options) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước wipe thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/wipe-defaults', options);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi thực hiện dọn dẹp website WordPress.');
        }
    }
    async applyThemeMods(siteUrl, auth, themeMods) {
        try {
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/apply-theme-mods', themeMods);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi cập nhật cấu hình Theme Options.');
        }
    }
    async deployFooter(siteUrl, auth, footerConfig) {
        try {
            const shortcode = this.compilerService.compileFooter(footerConfig);
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/deploy-footer', {
                title: `Footer SEO - ${footerConfig.brandName || 'Chính'}`,
                shortcode,
            });
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi tạo Footer UX Block.');
        }
    }
    async deployHomepage(siteUrl, auth, sections, title) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước deployHomepage thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const shortcode = this.compilerService.compilePageSections(sections);
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/deploy-homepage', {
                title: title || 'Trang Chủ',
                shortcode,
                state_json: JSON.stringify(sections),
            });
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi tạo Trang Chủ Flatsome.');
        }
    }
    async setupEssentials(siteUrl, auth, essentials) {
        try {
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/setup-essentials', essentials);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi thiết lập trang chính sách SEO và Menus.');
        }
    }
    async batchCreateContent(siteUrl, auth, payload) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước batchCreateContent thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/batch-create-content', payload);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi tạo hàng loạt Trang / Bài viết / Chuyên mục trên WordPress.');
        }
    }
    async listContent(siteUrl, auth, options = {}) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước listContent thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/list-content', options);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi lấy danh sách nội dung từ WordPress.');
        }
    }
    async deleteContent(siteUrl, auth, payload) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước deleteContent thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/delete-content', payload);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi xóa nội dung trên WordPress.');
        }
    }
    async getMenu(siteUrl, auth, params = {}) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước getMenu thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/get-menu', params);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi lấy thông tin Menu từ WordPress.');
        }
    }
    async saveMenu(siteUrl, auth, payload) {
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước saveMenu thất bại hoặc bỏ qua:', pushErr?.message);
            }
            const client = this.getClient(siteUrl, auth);
            const res = await client.post('/save-menu', payload);
            return res.data;
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi lưu và đồng bộ Menu lên WordPress.');
        }
    }
    async deployAll(siteUrl, auth, payload) {
        const results = {};
        if (payload.wipeFirst) {
            results.wipe = await this.wipeDefaults(siteUrl, auth, payload.wipeOptions || {});
        }
        results.themeMods = await this.applyThemeMods(siteUrl, auth, payload.themeMods || {});
        results.footer = await this.deployFooter(siteUrl, auth, payload.footerConfig);
        results.homepage = await this.deployHomepage(siteUrl, auth, payload.sections || []);
        if (payload.essentials) {
            results.essentials = await this.setupEssentials(siteUrl, auth, payload.essentials);
        }
        return {
            success: true,
            message: 'Triển khai toàn bộ website Flatsome thành công rực rỡ!',
            details: results,
        };
    }
    async getWpSession(cleanUrl, auth) {
        if (!auth.username || !auth.password) {
            return { cookieStr: '', restNonce: '' };
        }
        try {
            const loginParams = new URLSearchParams();
            loginParams.append('log', auth.username);
            loginParams.append('pwd', auth.password);
            loginParams.append('rememberme', 'forever');
            loginParams.append('redirect_to', `${cleanUrl}/wp-admin/`);
            loginParams.append('testcookie', '1');
            const loginRes = await axios_1.default.post(`${cleanUrl}/wp-login.php`, loginParams.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: 'wordpress_test_cookie=WP%20Cookie%20check',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
                },
                maxRedirects: 0,
                validateStatus: (s) => s >= 200 && s < 400,
                timeout: 25000,
            });
            const setCookies = loginRes.headers['set-cookie'] || [];
            const cookieMap = new Map();
            for (const c of setCookies) {
                const pair = c.split(';')[0].split('=');
                if (pair.length >= 2)
                    cookieMap.set(pair[0].trim(), pair.slice(1).join('=').trim());
            }
            const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
            let restNonce = '';
            try {
                const adminRes = await axios_1.default.get(`${cleanUrl}/wp-admin/upload.php`, {
                    headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' },
                    timeout: 15000,
                });
                const nonceMatch = adminRes.data.match(/"nonce":"([a-f0-9]+)"/i) ||
                    adminRes.data.match(/wpApiSettings\s*=\s*\{[^}]*"nonce":"([a-f0-9]+)"/i) ||
                    adminRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
                    adminRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
                if (nonceMatch)
                    restNonce = nonceMatch[1];
            }
            catch (e) { }
            return { cookieStr, restNonce };
        }
        catch (e) {
            return { cookieStr: '', restNonce: '' };
        }
    }
    async uploadMedia(siteUrl, auth, payload) {
        try {
            let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
            cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
            cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
            try {
                const client = this.getClient(siteUrl, auth);
                const res = await client.post('/upload-media', payload);
                if (res.data?.media)
                    return res.data;
            }
            catch (bridgeErr) {
            }
            let buffer = null;
            let mimeType = 'image/png';
            const filename = payload.filename || `image-${Date.now()}.png`;
            const rawData = payload.fileData || payload.file_data || payload.imageUrl || payload.image_url;
            if (rawData && typeof rawData === 'string') {
                if (rawData.includes(';base64,')) {
                    const parts = rawData.split(';base64,');
                    mimeType = parts[0].replace(/^data:/, '').trim() || 'image/png';
                    buffer = Buffer.from(parts[1].trim(), 'base64');
                }
                else if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
                    try {
                        const imgFetch = await axios_1.default.get(rawData, { responseType: 'arraybuffer', timeout: 15000 });
                        buffer = Buffer.from(imgFetch.data);
                        if (imgFetch.headers['content-type']) {
                            mimeType = String(imgFetch.headers['content-type']);
                        }
                    }
                    catch (e) { }
                }
                else {
                    buffer = Buffer.from(rawData.trim(), 'base64');
                }
            }
            console.log(`🚀 [UploadMedia] Bắt đầu xử lý ảnh: "${filename}" (Kích thước: ${buffer ? (buffer.length / 1024).toFixed(1) : 0} KB), Auth: ${auth.username ? 'Có' : 'Không'}`);
            if (buffer && auth.username && auth.password) {
                console.log(`🚀 Đang tải ảnh "${filename}" vào Thư viện Media WordPress (Core API)...`);
                const session = await this.getWpSession(cleanUrl, auth);
                try {
                    const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                    const wpMediaRes = await axios_1.default.post(`${cleanUrl}/wp-json/wp/v2/media`, buffer, {
                        headers: {
                            'Content-Type': mimeType,
                            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                            ...(session.cookieStr ? { Cookie: session.cookieStr } : {}),
                            ...(session.restNonce ? { 'X-WP-Nonce': session.restNonce } : {}),
                            Authorization: `Basic ${basic}`,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                        },
                        params: {
                            title: payload.title || filename.replace(/\.[^/.]+$/, ''),
                            alt_text: payload.altText || payload.title || '',
                            caption: payload.caption || '',
                            description: payload.description || '',
                        },
                        timeout: 35000,
                    });
                    if (wpMediaRes.data?.id && wpMediaRes.data?.source_url) {
                        console.log(`✅ Đã lưu ảnh vào Media Library WordPress (#${wpMediaRes.data.id}): ${wpMediaRes.data.source_url}`);
                        return {
                            success: true,
                            media: {
                                id: wpMediaRes.data.id,
                                url: wpMediaRes.data.source_url,
                                alt: wpMediaRes.data.alt_text || payload.altText || '',
                                title: wpMediaRes.data.title?.rendered || payload.title || '',
                                caption: wpMediaRes.data.caption?.rendered || payload.caption || '',
                                description: wpMediaRes.data.description?.rendered || payload.description || '',
                            },
                        };
                    }
                }
                catch (v2Err) {
                    console.warn('REST API v2 media upload thất bại, thử async-upload.php:', v2Err.response?.data?.message || v2Err.message);
                }
                if (session.cookieStr) {
                    try {
                        const uploadPageRes = await axios_1.default.get(`${cleanUrl}/wp-admin/media-new.php`, {
                            headers: { Cookie: session.cookieStr },
                            timeout: 15000,
                        });
                        const formNonceMatch = uploadPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
                            uploadPageRes.data.match(/id="_wpnonce"\s+value="([a-f0-9]+)"/i);
                        if (formNonceMatch) {
                            const uploadNonce = formNonceMatch[1];
                            const formData = new FormData();
                            formData.append('_wpnonce', uploadNonce);
                            formData.append('action', 'upload-attachment');
                            formData.append('async-upload', new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
                            const asyncRes = await fetch(`${cleanUrl}/wp-admin/async-upload.php`, {
                                method: 'POST',
                                headers: {
                                    Cookie: session.cookieStr,
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                                },
                                body: formData,
                            });
                            const asyncJson = await asyncRes.json();
                            if (asyncJson.success && asyncJson.data) {
                                console.log(`✅ Đã lưu ảnh qua async-upload.php (#${asyncJson.data.id}): ${asyncJson.data.url}`);
                                return {
                                    success: true,
                                    media: {
                                        id: asyncJson.data.id,
                                        url: asyncJson.data.url,
                                        alt: payload.altText || '',
                                        title: asyncJson.data.title || payload.title || '',
                                        caption: payload.caption || '',
                                        description: payload.description || '',
                                    },
                                };
                            }
                        }
                    }
                    catch (asyncErr) {
                        console.warn('async-upload.php thất bại:', asyncErr.message);
                    }
                }
            }
            return {
                success: false,
                message: 'Không thể upload ảnh vào WP Media Library, tự động dùng ảnh dự phòng',
                fallback: true,
            };
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi tải ảnh lên Thư viện Media WordPress.');
        }
    }
    async updateMedia(siteUrl, auth, payload) {
        try {
            const mediaId = payload.mediaId || payload.media_id;
            if (!mediaId) {
                throw new Error('Thiếu ID ảnh Media WordPress cần cập nhật');
            }
            let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
            cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
            cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
            try {
                const client = this.getClient(siteUrl, auth);
                const res = await client.post('/update-media', {
                    media_id: mediaId,
                    alt_text: payload.altText || payload.alt_text,
                    title: payload.title,
                    caption: payload.caption,
                    description: payload.description,
                });
                if (res.data?.success && res.data?.media) {
                    console.log(`✅ [Bridge] Đã cập nhật thông tin ảnh Media #${mediaId} thành công!`);
                    return res.data;
                }
            }
            catch (bridgeErr) {
                console.warn('Cổng bridge update-media lỗi, chuyển sang cập nhật qua WP Core REST API:', bridgeErr?.message);
            }
            if (auth.username && auth.password) {
                const session = await this.getWpSession(cleanUrl, auth);
                const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                const updateData = {};
                if (payload.title !== undefined)
                    updateData.title = payload.title;
                if (payload.altText !== undefined || payload.alt_text !== undefined)
                    updateData.alt_text = payload.altText || payload.alt_text;
                if (payload.caption !== undefined)
                    updateData.caption = payload.caption;
                if (payload.description !== undefined)
                    updateData.description = payload.description;
                const res = await axios_1.default.post(`${cleanUrl}/wp-json/wp/v2/media/${mediaId}`, updateData, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(session.cookieStr ? { Cookie: session.cookieStr } : {}),
                        ...(session.restNonce ? { 'X-WP-Nonce': session.restNonce } : {}),
                        Authorization: `Basic ${basic}`,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    },
                    timeout: 25000,
                });
                if (res.data?.id) {
                    console.log(`✅ [Core API] Đã cập nhật thành công ảnh Media #${mediaId}: ${res.data.source_url}`);
                    return {
                        success: true,
                        message: `Đã cập nhật thông tin ảnh #${mediaId} trên WordPress thành công!`,
                        media: {
                            id: res.data.id,
                            url: res.data.source_url,
                            alt: res.data.alt_text || payload.altText || '',
                            title: res.data.title?.rendered || payload.title || '',
                            caption: res.data.caption?.rendered || payload.caption || '',
                            description: res.data.description?.rendered || payload.description || '',
                        },
                    };
                }
            }
            return {
                success: false,
                message: 'Không thể cập nhật ảnh trên WordPress',
            };
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi cập nhật thông tin ảnh trên Thư viện Media WordPress.');
        }
    }
    async listMedia(siteUrl, auth) {
        try {
            let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
            cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
            cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
            try {
                const client = this.getClient(siteUrl, auth);
                const res = await client.get('/list-media');
                if (res.data?.media)
                    return res.data;
            }
            catch (bridgeErr) { }
            const res = await axios_1.default.get(`${cleanUrl}/wp-json/wp/v2/media?per_page=50`, {
                timeout: 20000,
            });
            if (Array.isArray(res.data)) {
                const media = res.data.map((item) => ({
                    id: item.id,
                    url: item.source_url,
                    thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
                    title: item.title?.rendered || '',
                    alt: item.alt_text || '',
                    caption: item.caption?.rendered || '',
                    description: item.description?.rendered || '',
                    filename: item.slug || '',
                }));
                return { success: true, media, total: media.length };
            }
            return { success: true, media: [], total: 0 };
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi lấy danh sách Media từ WordPress.');
        }
    }
    async deleteMedia(siteUrl, auth, targetIds) {
        const rawIds = Array.isArray(targetIds) ? targetIds : [targetIds];
        const mediaIds = rawIds.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0);
        if (mediaIds.length === 0) {
            return { success: true, deleted_ids: [], count: 0, message: 'Không có ID ảnh hợp lệ để xóa' };
        }
        try {
            try {
                await this.pushPluginCode(siteUrl, auth);
            }
            catch (pushErr) {
                console.warn('Tự động đẩy code plugin trước deleteMedia thất bại hoặc bỏ qua:', pushErr?.message);
            }
            try {
                const client = this.getClient(siteUrl, auth);
                const res = await client.post('/delete-media', { mediaIds, mediaId: mediaIds[0] });
                if (res.data?.success)
                    return res.data;
            }
            catch (bridgeErr) {
                console.warn('Xóa qua Bridge /delete-media không thành công, thử qua Core WP REST API:', bridgeErr?.message);
            }
            let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
            cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
            cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
            let headers = {};
            if (auth.username && auth.password) {
                const token = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                headers['Authorization'] = `Basic ${token}`;
            }
            const deleted_ids = [];
            const failed_ids = [];
            for (const id of mediaIds) {
                try {
                    await axios_1.default.delete(`${cleanUrl}/wp-json/wp/v2/media/${id}?force=true`, {
                        headers,
                        timeout: 20000,
                    });
                    deleted_ids.push(id);
                }
                catch (e) {
                    failed_ids.push(id);
                }
            }
            if (deleted_ids.length === 0) {
                throw new Error(failed_ids.length > 0
                    ? `Không thể xóa ảnh trên WordPress (Thất bại ${failed_ids.length} ảnh). Vui lòng kiểm tra lại quyền hạn thư mục uploads trên hosting.`
                    : 'Không thể xóa ảnh khỏi WordPress.');
            }
            return {
                success: true,
                message: `Đã xóa vĩnh viễn ${deleted_ids.length} ảnh khỏi thư viện WordPress!`,
                deleted_ids,
                failed_ids,
                count: deleted_ids.length,
            };
        }
        catch (err) {
            this.handleError(err, `Lỗi khi xóa ${mediaIds.length} ảnh khỏi WordPress.`);
        }
    }
    async pushPluginCode(siteUrl, auth) {
        try {
            const fs = await Promise.resolve().then(() => require('fs'));
            const path = await Promise.resolve().then(() => require('path'));
            const possiblePaths = [
                path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge/flatsome-seo-bridge.php'),
                path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge/flatsome-seo-bridge.php'),
                'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge\\flatsome-seo-bridge.php',
            ];
            const foundPath = possiblePaths.find((p) => fs.existsSync(p));
            if (!foundPath) {
                throw new Error('Không tìm thấy file mã nguồn flatsome-seo-bridge.php trên máy local');
            }
            const code = fs.readFileSync(foundPath, 'utf8');
            const functionMatches = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
            if (functionMatches) {
                const funcNames = functionMatches.map((f) => f.replace(/function\s+/, '').replace(/\s*\(/, '').trim());
                const seen = new Set();
                const duplicates = new Set();
                for (const name of funcNames) {
                    if (seen.has(name))
                        duplicates.add(name);
                    else
                        seen.add(name);
                }
                if (duplicates.size > 0) {
                    throw new Error(`Phát hiện hàm PHP bị trùng lặp: ${Array.from(duplicates).join(', ')}. Đã chặn đẩy code để bảo vệ an toàn website!`);
                }
            }
            const client = this.getClient(siteUrl, auth);
            try {
                const res = await client.post('/self-update', { code });
                return res.data;
            }
            catch (postErr) {
                if (auth.username && auth.password) {
                    console.warn('self-update thất bại, tự động khôi phục và cập nhật qua autoInstallPlugin...', postErr?.message);
                    const autoRes = await this.autoInstallPlugin(siteUrl, auth);
                    return {
                        success: true,
                        message: '⚡ Đã tự động khôi phục và cập nhật Plugin trên WordPress lên bản mới nhất!',
                        inspect: autoRes?.inspect,
                    };
                }
                if (postErr.response?.status === 404) {
                    throw new common_1.HttpException('Plugin trên WordPress hiện tại là bản cũ (chưa có cổng tự cập nhật /self-update). Vui lòng bấm nút "🚀 Tự Động Cài & Kích Hoạt Plugin Lên WP" một lần để nâng cấp bản mới nhất!', common_1.HttpStatus.BAD_REQUEST);
                }
                throw postErr;
            }
        }
        catch (err) {
            this.handleError(err, 'Lỗi khi đẩy code mới lên WordPress.');
        }
    }
    async autoInstallPlugin(siteUrl, auth) {
        if (!auth.username || !auth.password) {
            throw new common_1.HttpException('Cần có Tên đăng nhập và Mật khẩu WordPress (Admin) để tự động cài plugin.', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const fs = await Promise.resolve().then(() => require('fs'));
            const path = await Promise.resolve().then(() => require('path'));
            let cleanUrl = siteUrl.trim();
            cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
            cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
            cleanUrl = cleanUrl.replace(/\/+$/, '');
            let zipBuffer;
            let rawPluginCode = '';
            try {
                const pluginFolderCandidates = [
                    path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge'),
                    path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge'),
                    'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge',
                ];
                const pluginFolder = pluginFolderCandidates.find((p) => fs.existsSync(p));
                if (pluginFolder) {
                    const mainPhp = path.join(pluginFolder, 'flatsome-seo-bridge.php');
                    if (fs.existsSync(mainPhp)) {
                        rawPluginCode = fs.readFileSync(mainPhp, 'utf8');
                    }
                    const zip = new AdmZip();
                    zip.addLocalFolder(pluginFolder, 'flatsome-seo-bridge');
                    zip.getEntries().forEach((entry) => {
                        entry.entryName = entry.entryName.replace(/\\/g, '/');
                    });
                    zipBuffer = zip.toBuffer();
                    const targets = [
                        path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge.zip'),
                        path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge.zip'),
                        'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge.zip',
                        'c:\\Project\\seo\\toolautothemewp\\client\\public\\wp-bridge-plugin\\flatsome-seo-bridge.zip',
                        'c:\\Project\\seo\\toolautothemewp\\client\\dist\\wp-bridge-plugin\\flatsome-seo-bridge.zip',
                    ];
                    for (const t of targets) {
                        try {
                            if (fs.existsSync(path.dirname(t))) {
                                fs.writeFileSync(t, zipBuffer);
                            }
                        }
                        catch (err) { }
                    }
                }
                else {
                    const possibleZipPaths = [
                        path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge.zip'),
                        path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge.zip'),
                        'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge.zip',
                    ];
                    const foundZip = possibleZipPaths.find((p) => fs.existsSync(p));
                    if (!foundZip)
                        throw new Error('Không tìm thấy file zip để cài đặt');
                    const zip = new AdmZip(foundZip);
                    zip.getEntries().forEach((entry) => {
                        entry.entryName = entry.entryName.replace(/\\/g, '/');
                    });
                    zipBuffer = zip.toBuffer();
                }
            }
            catch (zipErr) {
                const possibleZipPaths = [
                    path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge.zip'),
                    path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge.zip'),
                    'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge.zip',
                ];
                const foundZip = possibleZipPaths.find((p) => fs.existsSync(p));
                if (!foundZip)
                    throw new Error('Không tìm thấy file flatsome-seo-bridge.zip');
                const zip = new AdmZip(foundZip);
                zip.getEntries().forEach((entry) => {
                    entry.entryName = entry.entryName.replace(/\\/g, '/');
                });
                zipBuffer = zip.toBuffer();
            }
            const loginParams = new URLSearchParams();
            loginParams.append('log', auth.username);
            loginParams.append('pwd', auth.password);
            loginParams.append('rememberme', 'forever');
            loginParams.append('redirect_to', `${cleanUrl}/wp-admin/`);
            loginParams.append('testcookie', '1');
            const loginRes = await axios_1.default.post(`${cleanUrl}/wp-login.php`, loginParams.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: 'wordpress_test_cookie=WP%20Cookie%20check',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
                },
                maxRedirects: 0,
                validateStatus: (s) => s >= 200 && s < 400,
                timeout: 25000,
            });
            const setCookies = loginRes.headers['set-cookie'] || [];
            const cookieMap = new Map();
            for (const c of setCookies) {
                const pair = c.split(';')[0].split('=');
                if (pair.length >= 2)
                    cookieMap.set(pair[0].trim(), pair.slice(1).join('=').trim());
            }
            const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
            if (!cookieStr.includes('wordpress_logged_in')) {
                throw new Error('Đăng nhập WordPress thất bại! Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu Quản trị viên (Admin).');
            }
            if (rawPluginCode) {
                try {
                    const editorPageRes = await axios_1.default.get(`${cleanUrl}/wp-admin/plugin-editor.php?file=flatsome-seo-bridge%2Fflatsome-seo-bridge.php&plugin=flatsome-seo-bridge%2Fflatsome-seo-bridge.php`, {
                        headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' },
                        timeout: 15000,
                    });
                    const editorNonceMatch = editorPageRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
                        editorPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
                    if (editorNonceMatch && !editorPageRes.data.includes('DISALLOW_FILE_EDIT')) {
                        const editParams = new URLSearchParams();
                        editParams.append('_wpnonce', editorNonceMatch[1]);
                        editParams.append('_wp_http_referer', '/wp-admin/plugin-editor.php');
                        editParams.append('newcontent', rawPluginCode);
                        editParams.append('action', 'update');
                        editParams.append('file', 'flatsome-seo-bridge/flatsome-seo-bridge.php');
                        editParams.append('plugin', 'flatsome-seo-bridge/flatsome-seo-bridge.php');
                        const editRes = await axios_1.default.post(`${cleanUrl}/wp-admin/plugin-editor.php`, editParams.toString(), {
                            headers: {
                                Cookie: cookieStr,
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'User-Agent': 'Mozilla/5.0',
                            },
                            timeout: 20000,
                        });
                        if (editRes.status === 200) {
                            const inspectData = await this.syncSite(siteUrl, auth);
                            return {
                                success: true,
                                message: 'Đã cập nhật trực tiếp mã nguồn Plugin Flatsome SEO Bridge thành công!',
                                inspect: inspectData,
                            };
                        }
                    }
                }
                catch (editorErr) {
                    console.log('Plugin editor chưa cập nhật được, chuyển sang tải ZIP chuẩn hóa...', editorErr.message);
                }
            }
            const uploadPageRes = await axios_1.default.get(`${cleanUrl}/wp-admin/plugin-install.php?tab=upload`, {
                headers: {
                    Cookie: cookieStr,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
                },
                timeout: 25000,
            });
            const nonceMatch = uploadPageRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
                uploadPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
            if (!nonceMatch) {
                throw new Error('Không trích xuất được mã bảo mật (_wpnonce) từ trang cài đặt plugin WordPress.');
            }
            const nonce = nonceMatch[1];
            const formData = new FormData();
            formData.append('_wpnonce', nonce);
            formData.append('_wp_http_referer', '/wp-admin/plugin-install.php?tab=upload');
            formData.append('pluginzip', new Blob([new Uint8Array(zipBuffer)], { type: 'application/zip' }), 'flatsome-seo-bridge.zip');
            const uploadRes = await fetch(`${cleanUrl}/wp-admin/update.php?action=upload-plugin`, {
                method: 'POST',
                headers: {
                    Cookie: cookieStr,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
                },
                body: formData,
            });
            let uploadHtml = await uploadRes.text();
            if (uploadHtml.includes('update-from-upload-form') ||
                uploadHtml.includes('overwrite') ||
                uploadHtml.includes('Replace current with uploaded') ||
                uploadHtml.includes('Thay thế hiện tại') ||
                uploadHtml.includes('Reemplazar')) {
                const formNonceMatch = uploadHtml.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
                const packageMatch = uploadHtml.match(/name="package"\s+value="([^"]+)"/i);
                if (packageMatch) {
                    const overwriteParams = new URLSearchParams();
                    overwriteParams.append('_wpnonce', formNonceMatch ? formNonceMatch[1] : nonce);
                    overwriteParams.append('_wp_http_referer', '/wp-admin/plugin-install.php?tab=upload');
                    overwriteParams.append('package', packageMatch[1]);
                    overwriteParams.append('overwrite', 'package');
                    overwriteParams.append('update-selected', 'Replace current with uploaded');
                    const overwriteRes = await axios_1.default.post(`${cleanUrl}/wp-admin/update.php?action=upload-plugin`, overwriteParams.toString(), {
                        headers: {
                            Cookie: cookieStr,
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
                        },
                        timeout: 25000,
                    });
                    uploadHtml = overwriteRes.data;
                }
            }
            let activateMatch = uploadHtml.match(/plugins\.php\?action=activate[^"'\s]+/i) ||
                uploadHtml.match(/href="([^"]*plugins\.php\?action=activate[^"]*)"/i);
            if (activateMatch) {
                let activateUrl = activateMatch[1] || activateMatch[0];
                activateUrl = activateUrl.replace(/&amp;/g, '&');
                if (!activateUrl.startsWith('http')) {
                    activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
                }
                await axios_1.default.get(activateUrl, {
                    headers: { Cookie: cookieStr },
                    timeout: 25000,
                });
            }
            else {
                try {
                    const pluginsPageRes = await axios_1.default.get(`${cleanUrl}/wp-admin/plugins.php`, {
                        headers: { Cookie: cookieStr },
                        timeout: 25000,
                    });
                    const pageMatch = pluginsPageRes.data.match(/href="([^"]*plugins\.php\?action=activate[^"]*flatsome-seo-bridge[^"]*)"/i);
                    if (pageMatch) {
                        let activateUrl = pageMatch[1].replace(/&amp;/g, '&');
                        if (!activateUrl.startsWith('http')) {
                            activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
                        }
                        await axios_1.default.get(activateUrl, {
                            headers: { Cookie: cookieStr },
                            timeout: 25000,
                        });
                    }
                }
                catch (e) { }
            }
            const inspectData = await this.syncSite(siteUrl, auth);
            return {
                success: true,
                message: 'Đã tự động tải lên, giải nén và kích hoạt Plugin Flatsome SEO Bridge thành công 100%!',
                inspect: inspectData,
            };
        }
        catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lỗi khi tự động cài plugin lên WordPress';
            throw new common_1.HttpException(msg, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    handleError(err, defaultMsg) {
        if (err.response) {
            const status = err.response.status;
            if (status === 404) {
                const reqUrl = err.config?.url || '';
                if (reqUrl.includes('/inspect')) {
                    throw new common_1.HttpException('Không tìm thấy Plugin Bridge trên website này! Hãy chắc chắn bạn đã upload file flatsome-seo-bridge.zip và bấm Kích hoạt (Activate) trong menu Plugins của WordPress.', common_1.HttpStatus.NOT_FOUND);
                }
                throw new common_1.HttpException('Chức năng này không tồn tại trên bản plugin hiện tại của website. Vui lòng cập nhật lại Plugin Flatsome SEO Bridge bản mới nhất!', common_1.HttpStatus.NOT_FOUND);
            }
            if (status === 401) {
                const detail = err.response.data?.message || 'Tên đăng nhập hoặc Mật khẩu WordPress (Admin) không chính xác!';
                throw new common_1.HttpException(detail, common_1.HttpStatus.UNAUTHORIZED);
            }
            const msg = err.response.data?.message || defaultMsg;
            throw new common_1.HttpException(msg, status);
        }
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            throw new common_1.HttpException('Không thể truy cập tên miền website này. Vui lòng kiểm tra lại URL!', common_1.HttpStatus.BAD_REQUEST);
        }
        throw new common_1.HttpException(err.message || defaultMsg, common_1.HttpStatus.BAD_REQUEST);
    }
};
exports.BridgeService = BridgeService;
exports.BridgeService = BridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [compiler_service_1.CompilerService])
], BridgeService);
//# sourceMappingURL=bridge.service.js.map