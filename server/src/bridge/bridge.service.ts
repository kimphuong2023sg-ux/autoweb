import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdmZip = require('adm-zip');
import { CompilerService, SectionItem, FooterConfig } from '../compiler/compiler.service';

export interface AuthParams {
  username?: string;
  password?: string;
  token?: string;
}

@Injectable()
export class BridgeService {
  constructor(private readonly compilerService: CompilerService) {}

  private getClient(siteUrl: string, auth: AuthParams) {
    let cleanUrl = siteUrl.trim();
    cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
    cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
    cleanUrl = cleanUrl.replace(/\/+$/, '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth.username && auth.password) {
      headers['X-WP-Username'] = auth.username;
      headers['X-WP-Password'] = auth.password;
      const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (auth.token) {
      headers['X-Bridge-Token'] = auth.token;
    }

    return axios.create({
      baseURL: `${cleanUrl}/wp-json/flatsome-bridge/v1`,
      headers,
      timeout: 25000,
    });
  }

  async syncSite(siteUrl: string, auth: AuthParams) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.get('/inspect');
      const inspectData = res.data;

      if (!inspectData || typeof inspectData !== 'object' || typeof inspectData === 'string' || inspectData.success === false) {
        throw new Error(
          (inspectData && inspectData.message) ||
          'Website phản hồi dữ liệu không hợp lệ (không phải JSON từ Flatsome SEO Bridge). Vui lòng kiểm tra lại URL hoặc cài lại Plugin!'
        );
      }

      const cleanUrl = siteUrl.trim().replace(/\/wp-admin(\/.*)?$/i, '').replace(/\/wp-login\.php.*$/i, '').replace(/\/+$/, '');

      // Guarantee site & stats objects exist so frontend never crashes
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

      // Extract front page content & builder state
      let postContent = inspectData?.homepage?.post_content;
      let builderState = inspectData?.homepage?.builder_state;

      // Fallback: If post_content or builder_state is missing on older plugin, query WordPress Core REST API
      if ((!postContent || !builderState) && inspectData?.homepage?.id) {
        try {
          const wpCoreClient = axios.create({
            baseURL: `${cleanUrl}/wp-json/wp/v2`,
            headers: client.defaults.headers,
            timeout: 10000,
          });
          const pageRes = await wpCoreClient.get(`/pages/${inspectData.homepage.id}?context=edit`);
          if (pageRes.data?.content?.raw) {
            postContent = pageRes.data.content.raw;
          } else if (pageRes.data?.content?.rendered) {
            postContent = pageRes.data.content.rendered;
          }
          if (pageRes.data?.meta?._flatsome_autotheme_state) {
            builderState = pageRes.data.meta._flatsome_autotheme_state;
          }
        } catch (_) {
          try {
            const pubRes = await axios.get(`${cleanUrl}/wp-json/wp/v2/pages/${inspectData.homepage.id}`, { timeout: 8000 });
            if (pubRes.data?.content?.rendered) {
              postContent = pubRes.data.content.rendered;
            }
          } catch (__) {}
        }
      }

      // Restore sections from state or content
      let savedSections: SectionItem[] | null = null;
      if (builderState) {
        try {
          const parsed = typeof builderState === 'string' ? JSON.parse(builderState) : builderState;
          if (Array.isArray(parsed) && parsed.length > 0) {
            savedSections = parsed;
          }
        } catch (_) {}
      }

      if (!savedSections && postContent) {
        savedSections = this.compilerService.extractSectionsFromContent(postContent);
      }

      if (inspectData?.homepage) {
        inspectData.homepage.post_content = postContent;
        inspectData.homepage.savedSections = savedSections;
      }

      // Calculate Smart Scan Progress (Steps 1 to 5)
      const stats = inspectData?.stats || {};
      const flatsome = inspectData?.flatsome || {};
      const homepage = inspectData?.homepage || {};

      const step1Clean = !stats.has_hello_world && !stats.has_sample_page && !stats.is_demo_loaded;
      const step2Theme = Boolean(
        (flatsome.color_primary && flatsome.color_primary !== '#446084') ||
        flatsome.site_logo ||
        flatsome.topbar_content
      );
      const step3Home = Boolean(
        homepage.has_ux_shortcodes ||
        (savedSections && savedSections.length > 0) ||
        (homepage.content_length && homepage.content_length > 100)
      );
      const step4Footer = Boolean(flatsome.footer_block && flatsome.footer_block !== '0');

      const stepFlags = [step1Clean, step2Theme, step3Home, step4Footer];
      const completedCount = stepFlags.filter(Boolean).length;

      // Find first incomplete step, default to step 1
      let resumeStep = stepFlags.findIndex((done) => !done) + 1;
      if (resumeStep === 0) resumeStep = 4;

      inspectData.scanProgress = {
        step1Clean,
        step2Theme,
        step3Home,
        step4Footer,
        completedCount,
        resumeStep,
      };

      return inspectData;
    } catch (err: any) {
      this.handleError(err, 'Không thể kết nối đến WordPress. Vui lòng kiểm tra lại URL, Tên đăng nhập và Mật khẩu!');
    }
  }

  async wipeDefaults(siteUrl: string, auth: AuthParams, options: any) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/wipe-defaults', options);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi thực hiện dọn dẹp website WordPress.');
    }
  }

  async applyThemeMods(siteUrl: string, auth: AuthParams, themeMods: any) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/apply-theme-mods', themeMods);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi cập nhật cấu hình Theme Options.');
    }
  }

  async deployFooter(siteUrl: string, auth: AuthParams, footerConfig: FooterConfig) {
    try {
      const shortcode = this.compilerService.compileFooter(footerConfig);
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/deploy-footer', {
        title: `Footer SEO - ${footerConfig.brandName || 'Chính'}`,
        shortcode,
      });
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi tạo Footer UX Block.');
    }
  }

  async deployHomepage(siteUrl: string, auth: AuthParams, sections: SectionItem[], title?: string) {
    try {
      const shortcode = this.compilerService.compilePageSections(sections);
      const customCss = this.compilerService.compilePageCustomCss(sections);
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/deploy-homepage', {
        title: title || 'Trang Chủ',
        shortcode,
        custom_css: customCss,
        state_json: JSON.stringify(sections),
      });
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi tạo Trang Chủ Flatsome.');
    }
  }

  async setupEssentials(siteUrl: string, auth: AuthParams, essentials: any) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/setup-essentials', essentials);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi thiết lập trang chính sách SEO và Menus.');
    }
  }

  async batchCreateContent(siteUrl: string, auth: AuthParams, payload: { default_type?: string; items: any[] }) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/batch-create-content', payload);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi tạo hàng loạt Trang / Bài viết / Chuyên mục trên WordPress.');
    }
  }

  async listContent(siteUrl: string, auth: AuthParams, options: { type?: string } = {}) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/list-content', options);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi lấy danh sách nội dung từ WordPress.');
    }
  }

  async deleteContent(siteUrl: string, auth: AuthParams, payload: { type: string; id?: number; slug?: string }) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/delete-content', payload);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi xóa nội dung trên WordPress.');
    }
  }

  async getMenu(siteUrl: string, auth: AuthParams, params: { menu_id?: number; menu_name?: string } = {}) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/get-menu', params);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi lấy thông tin Menu từ WordPress.');
    }
  }

  async saveMenu(siteUrl: string, auth: AuthParams, payload: {
    menu_id?: number;
    menu_name: string;
    items: any[];
    locations?: string[];
    styling?: any;
  }) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/save-menu', payload);
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi lưu và đồng bộ Menu lên WordPress.');
    }
  }

  async saveSubpageStyling(siteUrl: string, auth: AuthParams, styling: any) {
    try {
      const client = this.getClient(siteUrl, auth);
      const res = await client.post('/save-subpage-styling', { styling });
      return res.data;
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi lưu cấu hình style trang con lên WordPress.');
    }
  }


  async deployAll(siteUrl: string, auth: AuthParams, payload: {
    themeMods: any;
    footerConfig: FooterConfig;
    sections: SectionItem[];
    essentials: any;
    wipeFirst?: boolean;
    wipeOptions?: any;
  }) {
    const results: any = {};

    // 1. Wipe if requested
    if (payload.wipeFirst) {
      results.wipe = await this.wipeDefaults(siteUrl, auth, payload.wipeOptions || {});
    }

    // 2. Apply theme mods
    results.themeMods = await this.applyThemeMods(siteUrl, auth, payload.themeMods || {});

    // 3. Deploy footer UX block
    results.footer = await this.deployFooter(siteUrl, auth, payload.footerConfig);

    // 4. Deploy homepage
    results.homepage = await this.deployHomepage(siteUrl, auth, payload.sections || []);

    // 5. Setup SEO essentials
    if (payload.essentials) {
      results.essentials = await this.setupEssentials(siteUrl, auth, payload.essentials);
    }

    return {
      success: true,
      message: 'Triển khai toàn bộ website Flatsome thành công rực rỡ!',
      details: results,
    };
  }

  private async getWpSession(cleanUrl: string, auth: AuthParams) {
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

      const loginRes = await axios.post(`${cleanUrl}/wp-login.php`, loginParams.toString(), {
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
      const cookieMap = new Map<string, string>();
      for (const c of setCookies) {
        const pair = c.split(';')[0].split('=');
        if (pair.length >= 2) cookieMap.set(pair[0].trim(), pair.slice(1).join('=').trim());
      }
      const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');

      let restNonce = '';
      try {
        const adminRes = await axios.get(`${cleanUrl}/wp-admin/upload.php`, {
          headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000,
        });
        const nonceMatch =
          adminRes.data.match(/"nonce":"([a-f0-9]+)"/i) ||
          adminRes.data.match(/wpApiSettings\s*=\s*\{[^}]*"nonce":"([a-f0-9]+)"/i) ||
          adminRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
          adminRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
        if (nonceMatch) restNonce = nonceMatch[1];
      } catch (e) {}

      return { cookieStr, restNonce };
    } catch (e) {
      return { cookieStr: '', restNonce: '' };
    }
  }

  async uploadMedia(siteUrl: string, auth: AuthParams, payload: any) {
    try {
      let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');

      // 1. Thử cổng Bridge nếu đã có
      try {
        const client = this.getClient(siteUrl, auth);
        const res = await client.post('/upload-media', payload);
        if (res.data?.media) return res.data;
      } catch (bridgeErr: any) {
        // Cổng bridge chưa có, chuyển sang upload trực tiếp bằng WordPress Core API
      }

      // 2. Tải trực tiếp vào WordPress Media Library qua WordPress Core REST API (/wp-json/wp/v2/media)
      let buffer: Buffer | null = null;
      let mimeType = 'image/png';
      const filename = payload.filename || `image-${Date.now()}.png`;

      const rawData = payload.fileData || payload.file_data || payload.imageUrl || payload.image_url;

      if (rawData && typeof rawData === 'string') {
        if (rawData.includes(';base64,')) {
          const parts = rawData.split(';base64,');
          mimeType = parts[0].replace(/^data:/, '').trim() || 'image/png';
          buffer = Buffer.from(parts[1].trim(), 'base64');
        } else if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
          try {
            const imgFetch = await axios.get(rawData, { responseType: 'arraybuffer', timeout: 15000 });
            buffer = Buffer.from(imgFetch.data);
            if (imgFetch.headers['content-type']) {
              mimeType = String(imgFetch.headers['content-type']);
            }
          } catch (e) {}
        } else {
          buffer = Buffer.from(rawData.trim(), 'base64');
        }
      }

      console.log(`🚀 [UploadMedia] Bắt đầu xử lý ảnh: "${filename}" (Kích thước: ${buffer ? (buffer.length / 1024).toFixed(1) : 0} KB), Auth: ${auth.username ? 'Có' : 'Không'}`);

      if (buffer && auth.username && auth.password) {
        console.log(`🚀 Đang tải ảnh "${filename}" vào Thư viện Media WordPress (Core API)...`);
        const session = await this.getWpSession(cleanUrl, auth);

        // A. Thử POST /wp-json/wp/v2/media với session cookie & nonce hoặc Basic Auth
        try {
          const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          const wpMediaRes = await axios.post(`${cleanUrl}/wp-json/wp/v2/media`, buffer, {
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
        } catch (v2Err: any) {
          console.warn('REST API v2 media upload thất bại, thử async-upload.php:', v2Err.response?.data?.message || v2Err.message);
        }

        // B. Thử upload qua async-upload.php (Cổng upload mặc định của WordPress Admin Upload)
        if (session.cookieStr) {
          try {
            const uploadPageRes = await axios.get(`${cleanUrl}/wp-admin/media-new.php`, {
              headers: { Cookie: session.cookieStr },
              timeout: 15000,
            });
            const formNonceMatch =
              uploadPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
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
          } catch (asyncErr: any) {
            console.warn('async-upload.php thất bại:', asyncErr.message);
          }
        }
      }

      return {
        success: false,
        message: 'Không thể upload ảnh vào WP Media Library, tự động dùng ảnh dự phòng',
        fallback: true,
      };
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi tải ảnh lên Thư viện Media WordPress.');
    }
  }

  async updateMedia(siteUrl: string, auth: AuthParams, payload: any) {
    try {
      const mediaId = payload.mediaId || payload.media_id;
      if (!mediaId) {
        throw new Error('Thiếu ID ảnh Media WordPress cần cập nhật');
      }

      let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');

      // 1. Thử cổng Bridge nếu đã có
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
      } catch (bridgeErr: any) {
        console.warn('Cổng bridge update-media lỗi, chuyển sang cập nhật qua WP Core REST API:', bridgeErr?.message);
      }

      // 2. Cập nhật trực tiếp qua WordPress Core REST API (/wp-json/wp/v2/media/<id>)
      if (auth.username && auth.password) {
        const session = await this.getWpSession(cleanUrl, auth);
        const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');

        const updateData: any = {};
        if (payload.title !== undefined) updateData.title = payload.title;
        if (payload.altText !== undefined || payload.alt_text !== undefined) updateData.alt_text = payload.altText || payload.alt_text;
        if (payload.caption !== undefined) updateData.caption = payload.caption;
        if (payload.description !== undefined) updateData.description = payload.description;

        const res = await axios.post(`${cleanUrl}/wp-json/wp/v2/media/${mediaId}`, updateData, {
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
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi cập nhật thông tin ảnh trên Thư viện Media WordPress.');
    }
  }

  async setFavicon(siteUrl: string, auth: AuthParams, payload: any) {
    try {
      let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');

      // 1. Thử qua Bridge REST API endpoint /set-favicon
      try {
        const client = this.getClient(siteUrl, auth);
        const res = await client.post('/set-favicon', payload);
        if (res.data?.success) {
          return res.data;
        }
      } catch (bridgeErr: any) {
        console.warn('Bridge /set-favicon không khả dụng, thử chế độ WordPress Core:', bridgeErr?.message);
      }

      // 2. Nếu là yêu cầu gỡ Favicon
      if (payload.remove) {
        try {
          const session = await this.getWpSession(cleanUrl, auth);
          const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          await axios.post(
            `${cleanUrl}/wp-json/wp/v2/settings`,
            { site_icon: 0 },
            {
              headers: {
                'Content-Type': 'application/json',
                ...(session.cookieStr ? { Cookie: session.cookieStr } : {}),
                ...(session.restNonce ? { 'X-WP-Nonce': session.restNonce } : {}),
                Authorization: `Basic ${basic}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              },
              timeout: 15000,
            },
          );
          return {
            success: true,
            message: 'Đã gỡ Favicon thành công! Website đã trở về biểu tượng mặc định.',
            site_icon: 0,
            site_icon_url: '',
          };
        } catch (removeErr: any) {
          console.warn('Gỡ favicon qua WP /settings thất bại:', removeErr?.message);
        }
      }

      // 3. Nếu tải ảnh mới: tải vào Media Library trước để lấy attachment ID
      let mediaId = payload.mediaId || payload.media_id;
      let iconUrl = payload.imageUrl || payload.image_url;

      if (!mediaId && (payload.fileData || payload.file_data || payload.imageUrl || payload.image_url)) {
        const uploadRes = await this.uploadMedia(siteUrl, auth, {
          filename: payload.filename || `favicon-${Date.now()}.png`,
          fileData: payload.fileData || payload.file_data,
          imageUrl: payload.imageUrl || payload.image_url,
          title: 'Site Favicon',
          altText: 'Site Favicon',
          caption: 'Favicon',
          description: 'Biểu tượng trang web (Site Icon / Favicon)',
        });

        if (uploadRes?.media?.id) {
          mediaId = uploadRes.media.id;
          iconUrl = uploadRes.media.url || iconUrl;
        }
      }

      if (mediaId) {
        // Cập nhật settings WordPress: site_icon = mediaId
        try {
          const session = await this.getWpSession(cleanUrl, auth);
          const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          await axios.post(
            `${cleanUrl}/wp-json/wp/v2/settings`,
            { site_icon: Number(mediaId) },
            {
              headers: {
                'Content-Type': 'application/json',
                ...(session.cookieStr ? { Cookie: session.cookieStr } : {}),
                ...(session.restNonce ? { 'X-WP-Nonce': session.restNonce } : {}),
                Authorization: `Basic ${basic}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              },
              timeout: 15000,
            },
          );
        } catch (settingsErr: any) {
          console.warn('Lưu site_icon qua WP /settings lỗi:', settingsErr?.message);
        }

        // Cập nhật theme mods Flatsome
        try {
          await this.applyThemeMods(siteUrl, auth, { site_icon_id: Number(mediaId) });
        } catch (_) {}

        return {
          success: true,
          message: 'Đã cập nhật Favicon (Site Icon) thành công! Biểu tượng mới đã được kích hoạt trên toàn bộ website.',
          site_icon: mediaId,
          site_icon_url: iconUrl,
        };
      }

      return {
        success: false,
        message: 'Không thể thiết lập Favicon, vui lòng thử lại hoặc chọn ảnh khác.',
      };
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi cài đặt Favicon (Site Icon) cho website.');
    }
  }

  async listMedia(siteUrl: string, auth: AuthParams) {
    try {
      let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');

      let bridgeMedia: any[] | null = null;

      // 1. Thử cổng Bridge trước với tham số limit=-1
      try {
        const client = this.getClient(siteUrl, auth);
        const res = await client.get('/list-media?limit=-1&posts_per_page=-1');
        if (res.data?.media && Array.isArray(res.data.media)) {
          bridgeMedia = res.data.media;
          // Nếu bridge đã được cập nhật và trả về nhiều hơn 30 ảnh (hoặc chính xác toàn bộ), trả về ngay
          if (bridgeMedia.length > 30) {
            return { success: true, media: bridgeMedia, total: res.data.total || bridgeMedia.length };
          }
        }
      } catch (bridgeErr) {}

      // 2. Lấy đầy đủ từ Core WordPress REST API (hỗ trợ phân trang nếu website có > 100 ảnh)
      try {
        const authHeaders: Record<string, string> = {};
        if (auth.username && auth.password) {
          const basic = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          authHeaders['Authorization'] = `Basic ${basic}`;
        } else if (auth.token) {
          authHeaders['X-Bridge-Token'] = auth.token;
        }

        const allMedia: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 10) {
          const res = await axios.get(`${cleanUrl}/wp-json/wp/v2/media?per_page=100&page=${page}`, {
            headers: authHeaders,
            timeout: 15000,
          });

          if (Array.isArray(res.data) && res.data.length > 0) {
            allMedia.push(...res.data);
            const totalPages = parseInt(res.headers?.['x-wp-totalpages'] || '1', 10);
            if (page >= totalPages || res.data.length < 100) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }

        if (allMedia.length > 0) {
          const media = allMedia.map((item: any) => ({
            id: item.id,
            url: item.source_url,
            thumbnail: item.media_details?.sizes?.medium?.source_url || item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
            title: item.title?.rendered || item.slug || '',
            alt: item.alt_text || '',
            caption: item.caption?.rendered || '',
            description: item.description?.rendered || '',
            filename: item.slug || '',
            date: item.date,
          }));
          return { success: true, media, total: media.length };
        }
      } catch (restErr: any) {
        console.warn('Không thể quét qua WP REST API, fallback sang Bridge Media nếu có:', restErr?.message);
      }

      // 3. Fallback: Nếu không gọi được WP REST API, dùng kết quả từ Bridge
      if (bridgeMedia && bridgeMedia.length > 0) {
        return { success: true, media: bridgeMedia, total: bridgeMedia.length };
      }

      return { success: true, media: [], total: 0 };
    } catch (err: any) {
      this.handleError(err, 'Lỗi khi lấy danh sách Media từ WordPress.');
    }
  }

  async deleteMedia(siteUrl: string, auth: AuthParams, targetIds: number | number[]) {
    const rawIds = Array.isArray(targetIds) ? targetIds : [targetIds];
    const mediaIds = rawIds.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0);
    if (mediaIds.length === 0) {
      return { success: true, deleted_ids: [], count: 0, message: 'Không có ID ảnh hợp lệ để xóa' };
    }

    try {

      // 2. Thử xóa qua route của Bridge Plugin (/delete-media hỗ trợ cả mediaId và mediaIds)
      try {
        const client = this.getClient(siteUrl, auth);
        const res = await client.post('/delete-media', { mediaIds, mediaId: mediaIds[0] });
        if (res.data?.success) return res.data;
      } catch (bridgeErr: any) {
        console.warn('Xóa qua Bridge /delete-media không thành công, thử qua Core WP REST API:', bridgeErr?.message);
      }

      // 3. Fallback: Xóa trực tiếp qua WordPress Core REST API (/wp-json/wp/v2/media/:id?force=true)
      let cleanUrl = siteUrl.trim().replace(/\/+$/, '');
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');

      let headers: Record<string, string> = {};
      if (auth.username && auth.password) {
        const token = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
        headers['Authorization'] = `Basic ${token}`;
      }

      const deleted_ids: number[] = [];
      const failed_ids: number[] = [];

      for (const id of mediaIds) {
        try {
          await axios.delete(`${cleanUrl}/wp-json/wp/v2/media/${id}?force=true`, {
            headers,
            timeout: 20000,
          });
          deleted_ids.push(id);
        } catch (e: any) {
          failed_ids.push(id);
        }
      }

      if (deleted_ids.length === 0) {
        throw new Error(
          failed_ids.length > 0
            ? `Không thể xóa ảnh trên WordPress (Thất bại ${failed_ids.length} ảnh). Vui lòng kiểm tra lại quyền hạn thư mục uploads trên hosting.`
            : 'Không thể xóa ảnh khỏi WordPress.'
        );
      }

      return {
        success: true,
        message: `Đã xóa vĩnh viễn ${deleted_ids.length} ảnh khỏi thư viện WordPress!`,
        deleted_ids,
        failed_ids,
        count: deleted_ids.length,
      };
    } catch (err: any) {
      this.handleError(err, `Lỗi khi xóa ${mediaIds.length} ảnh khỏi WordPress.`);
    }
  }

  async pushPluginCode(siteUrl: string, auth: AuthParams) {
    // Luôn cập nhật và ghi đè an toàn từ file ZIP chuẩn, không đẩy raw code
    return this.autoInstallPlugin(siteUrl, auth);
  }

  async autoInstallPlugin(siteUrl: string, auth: AuthParams) {
    const fs = await import('fs');
    const path = await import('path');

    // 1. Nếu Plugin Bridge đã cài trên website, cập nhật ghi đè siêu tốc & an toàn qua REST API /self-update
    try {
      const pluginPhpCandidates = [
        path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge/flatsome-seo-bridge.php'),
        path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge/flatsome-seo-bridge.php'),
        'c:\\Project\\seo\\autowebgit\\autoweb\\wp-plugin\\flatsome-seo-bridge\\flatsome-seo-bridge.php',
      ];
      const phpFile = pluginPhpCandidates.find((p) => fs.existsSync(p));
      if (phpFile) {
        const phpCode = fs.readFileSync(phpFile, 'utf8');
        const client = this.getClient(siteUrl, auth);
        const selfUpdateRes = await client.post('/self-update', { code: phpCode }, { timeout: 15000 });
        if (selfUpdateRes?.data?.success) {
          const inspectRes = await this.syncSite(siteUrl, auth).catch(() => null);
          return {
            success: true,
            message: 'Đã cập nhật và ghi đè Plugin Flatsome SEO Bridge lên phiên bản mới nhất thành công!',
            inspect: inspectRes,
          };
        }
      }
    } catch (selfErr) {
      // Nếu /self-update không phản hồi, tiếp tục quy trình upload file ZIP truyền thống
    }

    if (!auth.username || !auth.password) {
      throw new HttpException(
        'Cần có Tên đăng nhập và Mật khẩu WordPress (Admin) để tự động cài hoặc cập nhật ghi đè plugin.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      let cleanUrl = siteUrl.trim();
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
      cleanUrl = cleanUrl.replace(/\/+$/, '');

      // 1. Đóng gói ZIP chuẩn trực tiếp từ thư mục mã nguồn plugin
      let zipBuffer: Buffer;
      try {
        const pluginFolderCandidates = [
          path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge'),
          path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge'),
          'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge',
        ];
        const pluginFolder = pluginFolderCandidates.find((p) => fs.existsSync(p));
        if (pluginFolder) {
          const zip = new AdmZip();
          zip.addLocalFolder(pluginFolder, 'flatsome-seo-bridge');
          // Chuẩn hóa tất cả dấu gạch chéo sang '/' chuẩn Linux
          zip.getEntries().forEach((entry) => {
            entry.entryName = entry.entryName.replace(/\\/g, '/');
          });
          zipBuffer = zip.toBuffer();

          // Đồng bộ ghi đè ra file tĩnh để tải thủ công nếu cần
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
            } catch (err) {}
          }
        } else {
          const possibleZipPaths = [
            path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge.zip'),
            path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge.zip'),
            'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge.zip',
          ];
          const foundZip = possibleZipPaths.find((p) => fs.existsSync(p));
          if (!foundZip) throw new Error('Không tìm thấy file flatsome-seo-bridge.zip');
          const zip = new AdmZip(foundZip);
          zip.getEntries().forEach((entry) => {
            entry.entryName = entry.entryName.replace(/\\/g, '/');
          });
          zipBuffer = zip.toBuffer();
        }
      } catch (zipErr) {
        const possibleZipPaths = [
          path.resolve(process.cwd(), '../wp-plugin/flatsome-seo-bridge.zip'),
          path.resolve(process.cwd(), 'wp-plugin/flatsome-seo-bridge.zip'),
          'c:\\Project\\seo\\toolautothemewp\\wp-plugin\\flatsome-seo-bridge.zip',
        ];
        const foundZip = possibleZipPaths.find((p) => fs.existsSync(p));
        if (!foundZip) throw new Error('Không tìm thấy file flatsome-seo-bridge.zip');
        const zip = new AdmZip(foundZip);
        zip.getEntries().forEach((entry) => {
          entry.entryName = entry.entryName.replace(/\\/g, '/');
        });
        zipBuffer = zip.toBuffer();
      }

      // 2. Đăng nhập vào WordPress
      const loginParams = new URLSearchParams();
      loginParams.append('log', auth.username);
      loginParams.append('pwd', auth.password);
      loginParams.append('rememberme', 'forever');
      loginParams.append('redirect_to', `${cleanUrl}/wp-admin/`);
      loginParams.append('testcookie', '1');

      const loginRes = await axios.post(`${cleanUrl}/wp-login.php`, loginParams.toString(), {
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
      const cookieMap = new Map<string, string>();
      for (const c of setCookies) {
        const pair = c.split(';')[0].split('=');
        if (pair.length >= 2) cookieMap.set(pair[0].trim(), pair.slice(1).join('=').trim());
      }
      const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');

      if (!cookieStr.includes('wordpress_logged_in')) {
        throw new Error('Đăng nhập WordPress thất bại! Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu Quản trị viên (Admin).');
      }

      // 3. Lấy trang upload plugin để trích xuất _wpnonce
      const uploadPageRes = await axios.get(`${cleanUrl}/wp-admin/plugin-install.php?tab=upload`, {
        headers: {
          Cookie: cookieStr,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
        },
        timeout: 25000,
      });

      const nonceMatch =
        uploadPageRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
        uploadPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);

      if (!nonceMatch) {
        throw new Error('Không trích xuất được mã bảo mật (_wpnonce) từ trang cài đặt plugin WordPress.');
      }
      const nonce = nonceMatch[1];

      // 4. Tải file ZIP lên và giải nén qua WordPress update endpoint
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

      // 5. Nếu plugin đã tồn tại (WordPress hiển thị màn hình Replace current with uploaded / Thay thế hiện tại)
      if (
        uploadHtml.includes('update-from-upload-form') ||
        uploadHtml.includes('overwrite') ||
        uploadHtml.includes('Replace current with uploaded') ||
        uploadHtml.includes('Thay thế hiện tại') ||
        uploadHtml.includes('Reemplazar')
      ) {
        const formNonceMatch = uploadHtml.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
        const packageMatch = uploadHtml.match(/name="package"\s+value="([^"]+)"/i);
        if (packageMatch) {
          const overwriteParams = new URLSearchParams();
          overwriteParams.append('_wpnonce', formNonceMatch ? formNonceMatch[1] : nonce);
          overwriteParams.append('_wp_http_referer', '/wp-admin/plugin-install.php?tab=upload');
          overwriteParams.append('package', packageMatch[1]);
          overwriteParams.append('overwrite', 'package');
          overwriteParams.append('update-selected', 'Replace current with uploaded');

          const overwriteRes = await axios.post(
            `${cleanUrl}/wp-admin/update.php?action=upload-plugin`,
            overwriteParams.toString(),
            {
              headers: {
                Cookie: cookieStr,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeBridgeInstaller/1.0',
              },
              timeout: 25000,
            },
          );
          uploadHtml = overwriteRes.data;
        }
      }

      // 6. Kích hoạt (Activate) plugin
      let activateMatch =
        uploadHtml.match(/plugins\.php\?action=activate[^"'\s]+/i) ||
        uploadHtml.match(/href="([^"]*plugins\.php\?action=activate[^"]*)"/i);

      if (activateMatch) {
        let activateUrl = activateMatch[1] || activateMatch[0];
        activateUrl = activateUrl.replace(/&amp;/g, '&');
        if (!activateUrl.startsWith('http')) {
          activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
        }
        await axios.get(activateUrl, {
          headers: { Cookie: cookieStr },
          timeout: 25000,
        });
      } else {
        // Kiểm tra danh sách plugin để kích hoạt nếu chưa kích hoạt
        try {
          const pluginsPageRes = await axios.get(`${cleanUrl}/wp-admin/plugins.php`, {
            headers: { Cookie: cookieStr },
            timeout: 25000,
          });
          const pageMatch = pluginsPageRes.data.match(
            /href="([^"]*plugins\.php\?action=activate[^"]*flatsome-seo-bridge[^"]*)"/i,
          );
          if (pageMatch) {
            let activateUrl = pageMatch[1].replace(/&amp;/g, '&');
            if (!activateUrl.startsWith('http')) {
              activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
            }
            await axios.get(activateUrl, {
              headers: { Cookie: cookieStr },
              timeout: 25000,
            });
          }
        } catch (e) {}
      }

      // 7. Đồng bộ kiểm tra trạng thái ngay lập tức
      const inspectData = await this.syncSite(siteUrl, auth);

      return {
        success: true,
        message: 'Đã tự động tải lên, giải nén và kích hoạt Plugin Flatsome SEO Bridge thành công 100%!',
        inspect: inspectData,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tự động cài plugin lên WordPress';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  async installFlatsomeTheme(siteUrl: string, auth: AuthParams) {
    const fs = await import('fs');
    const path = await import('path');

    let cleanUrl = siteUrl.trim();
    cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
    cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
    cleanUrl = cleanUrl.replace(/\/+$/, '');


    // 2. Tìm gói cài đặt zip Flatsome trong các thư mục
    const themeZipCandidates = [
      path.resolve(process.cwd(), 'themes/flatsome-theme-gpl-v3-18-5.zip'),
      path.resolve(process.cwd(), '../themes/flatsome-theme-gpl-v3-18-5.zip'),
      path.resolve(process.cwd(), 'server/themes/flatsome-theme-gpl-v3-18-5.zip'),
      path.resolve(process.cwd(), '../server/themes/flatsome-theme-gpl-v3-18-5.zip'),
      'c:\\Project\\seo\\autowebgit\\autoweb\\server\\themes\\flatsome-theme-gpl-v3-18-5.zip',
      'c:\\Project\\seo\\autowebgit\\autoweb\\flatsome-theme-gpl-v3-18-5.zip',
      'c:\\Project\\seo\\toolautothemewp\\flatsome-theme-gpl-v3-18-5.zip',
    ];
    const foundZipPath = themeZipCandidates.find((p) => fs.existsSync(p));
    if (!foundZipPath) {
      throw new HttpException(
        'Không tìm thấy file flatsome-theme-gpl-v3-18-5.zip trong thư mục themes của hệ thống.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const zipBuffer = fs.readFileSync(foundZipPath);
    const client = this.getClient(siteUrl, auth);

    // 3. Cách 1: Cài đặt và kích hoạt qua Bridge API (Hỗ trợ Chunked 256KB - Siêu tốc, không lo post_max_size / timeout)
    try {
      // 3.1 Kiểm tra trước xem theme Flatsome đã có sẵn trên máy chủ chưa (nếu có, kích hoạt ngay lập tức)
      try {
        const checkRes = await client.post('/install-theme', { check_only: true });
        if (checkRes.data && (checkRes.data.is_flatsome || checkRes.data.success)) {
          const inspectData = await this.syncSite(siteUrl, auth);
          return {
            success: true,
            message: checkRes.data.message || 'Theme Flatsome đã có sẵn trên website và đã được kích hoạt thành công!',
            inspect: inspectData,
          };
        }
      } catch (checkErr) {
        // Tiếp tục truyền chunk
      }

      // 3.2 Chia file ZIP thành các Chunk 256KB (~340KB base64) để đảm bảo 100% vượt qua mọi giới hạn upload của hosting
      const CHUNK_SIZE = 256 * 1024;
      const totalChunks = Math.ceil(zipBuffer.length / CHUNK_SIZE);
      const fileId = 'flatsome_' + Date.now();
      let lastRes: any = null;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, zipBuffer.length);
        const chunkBuffer = zipBuffer.subarray(start, end);
        const chunkBase64 = chunkBuffer.toString('base64');

        const chunkRes = await client.post('/install-theme', {
          chunk_index: i,
          total_chunks: totalChunks,
          chunk_file_id: fileId,
          chunk_base64: chunkBase64,
        });
        lastRes = chunkRes.data;
      }

      if (lastRes && (lastRes.success || lastRes.is_flatsome)) {
        const inspectData = await this.syncSite(siteUrl, auth);
        return {
          success: true,
          message: lastRes.message || 'Đã cài đặt và kích hoạt hoàn thiện Theme Flatsome thành công 100%!',
          inspect: inspectData,
        };
      }
    } catch (bridgeErr: any) {
      console.warn('Cài Flatsome qua Bridge API thất bại hoặc bị chặn, chuyển sang WP Admin Upload:', bridgeErr.message);
    }

    // 4. Cách 2: Tải lên qua WordPress Admin Upload (/wp-admin/update.php?action=upload-theme)
    if (!auth.username || !auth.password) {
      throw new HttpException(
        'Cần có Tên đăng nhập và Mật khẩu WordPress (Admin) để tự động cài Theme Flatsome.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Đăng nhập WordPress
      const loginParams = new URLSearchParams();
      loginParams.append('log', auth.username);
      loginParams.append('pwd', auth.password);
      loginParams.append('rememberme', 'forever');
      loginParams.append('redirect_to', `${cleanUrl}/wp-admin/`);
      loginParams.append('testcookie', '1');

      const loginRes = await axios.post(`${cleanUrl}/wp-login.php`, loginParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: 'wordpress_test_cookie=WP%20Cookie%20check',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlatsomeInstaller/1.0',
        },
        maxRedirects: 0,
        validateStatus: (s) => s >= 200 && s < 400,
        timeout: 25000,
      });

      const setCookies = loginRes.headers['set-cookie'] || [];
      const cookieMap = new Map<string, string>();
      for (const c of setCookies) {
        const pair = c.split(';')[0].split('=');
        if (pair.length >= 2) cookieMap.set(pair[0].trim(), pair.slice(1).join('=').trim());
      }
      const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');

      if (!cookieStr.includes('wordpress_logged_in')) {
        throw new Error('Đăng nhập WordPress thất bại! Vui lòng kiểm tra lại tài khoản Quản trị viên (Admin).');
      }

      // Lấy trang upload theme để trích xuất _wpnonce
      const uploadPageRes = await axios.get(`${cleanUrl}/wp-admin/theme-install.php?tab=upload`, {
        headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' },
        timeout: 25000,
      });

      const nonceMatch =
        uploadPageRes.data.match(/id="_wpnonce"\s+name="_wpnonce"\s+value="([a-f0-9]+)"/i) ||
        uploadPageRes.data.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);

      if (!nonceMatch) {
        throw new Error('Không trích xuất được _wpnonce từ trang theme-install của WordPress.');
      }
      const nonce = nonceMatch[1];

      // Upload theme zip
      const formData = new FormData();
      formData.append('_wpnonce', nonce);
      formData.append('_wp_http_referer', '/wp-admin/theme-install.php?tab=upload');
      formData.append('themezip', new Blob([new Uint8Array(zipBuffer)], { type: 'application/zip' }), 'flatsome.zip');

      const uploadRes = await fetch(`${cleanUrl}/wp-admin/update.php?action=upload-theme`, {
        method: 'POST',
        headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' },
        body: formData,
      });

      let uploadHtml = await uploadRes.text();

      // Kiểm tra nếu WordPress báo lỗi link expired / kích thước vượt giới hạn upload
      if (
        uploadHtml.includes('caducado') ||
        uploadHtml.includes('The link you followed has expired') ||
        uploadHtml.includes('El enlace que has seguido ha caducado')
      ) {
        throw new Error(
          'Máy chủ hosting giới hạn dung lượng tải lên (upload_max_filesize / post_max_size quá nhỏ). Vui lòng cập nhật cấu hình PHP hoặc tải zip Flatsome v3.18.5 lên thư mục wp-content/themes thủ công.',
        );
      }

      // Nếu theme đã tồn tại (Replace current with uploaded)
      if (
        uploadHtml.includes('update-from-upload-form') ||
        uploadHtml.includes('overwrite') ||
        uploadHtml.includes('Replace current with uploaded') ||
        uploadHtml.includes('Thay thế hiện tại') ||
        uploadHtml.includes('Reemplazar')
      ) {
        const formNonceMatch = uploadHtml.match(/name="_wpnonce"\s+value="([a-f0-9]+)"/i);
        const packageMatch = uploadHtml.match(/name="package"\s+value="([^"]+)"/i);
        if (packageMatch) {
          const overwriteParams = new URLSearchParams();
          overwriteParams.append('_wpnonce', formNonceMatch ? formNonceMatch[1] : nonce);
          overwriteParams.append('_wp_http_referer', '/wp-admin/theme-install.php?tab=upload');
          overwriteParams.append('package', packageMatch[1]);
          overwriteParams.append('overwrite', 'package');
          overwriteParams.append('update-selected', 'Replace current with uploaded');

          const overwriteRes = await axios.post(
            `${cleanUrl}/wp-admin/update.php?action=upload-theme`,
            overwriteParams.toString(),
            {
              headers: {
                Cookie: cookieStr,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0',
              },
              timeout: 35000,
            },
          );
          uploadHtml = overwriteRes.data;
        }
      }

      // Kích hoạt theme Flatsome
      let activateMatch =
        uploadHtml.match(/themes\.php\?action=activate[^"'\s]+/i) ||
        uploadHtml.match(/href="([^"]*themes\.php\?action=activate[^"]*)"/i);

      if (activateMatch) {
        let activateUrl = activateMatch[1] || activateMatch[0];
        activateUrl = activateUrl.replace(/&amp;/g, '&');
        if (!activateUrl.startsWith('http')) {
          activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
        }
        await axios.get(activateUrl, { headers: { Cookie: cookieStr }, timeout: 25000 });
      } else {
        // Kích hoạt thủ công qua themes.php nếu chưa bấm
        try {
          const themesPageRes = await axios.get(`${cleanUrl}/wp-admin/themes.php`, {
            headers: { Cookie: cookieStr },
            timeout: 25000,
          });
          const pageMatch = themesPageRes.data.match(
            /href="([^"]*themes\.php\?action=activate[^"]*stylesheet=flatsome[^"]*)"/i,
          );
          if (pageMatch) {
            let activateUrl = pageMatch[1].replace(/&amp;/g, '&');
            if (!activateUrl.startsWith('http')) {
              activateUrl = `${cleanUrl}/wp-admin/${activateUrl.replace(/^\/+/, '')}`;
            }
            await axios.get(activateUrl, { headers: { Cookie: cookieStr }, timeout: 25000 });
          }
        } catch (e) {}
      }

      const inspectData = await this.syncSite(siteUrl, auth);
      return {
        success: true,
        message: 'Đã tự động tải lên và kích hoạt hoàn thiện Theme Flatsome thành công 100%!',
        inspect: inspectData,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cài đặt theme Flatsome lên WordPress';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  private handleError(err: any, defaultMsg: string) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) {
        const reqUrl = err.config?.url || '';
        if (reqUrl.includes('/inspect')) {
          throw new HttpException(
            'Không tìm thấy Plugin Bridge trên website này! Hãy chắc chắn bạn đã upload file flatsome-seo-bridge.zip và bấm Kích hoạt (Activate) trong menu Plugins của WordPress.',
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Chức năng này không tồn tại trên bản plugin hiện tại của website. Vui lòng cập nhật lại Plugin Flatsome SEO Bridge bản mới nhất!',
          HttpStatus.NOT_FOUND,
        );
      }
      if (status === 401) {
        const detail = err.response.data?.message || 'Tên đăng nhập hoặc Mật khẩu WordPress (Admin) không chính xác!';
        throw new HttpException(detail, HttpStatus.UNAUTHORIZED);
      }
      const msg = err.response.data?.message || defaultMsg;
      throw new HttpException(msg, status);
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      throw new HttpException('Không thể truy cập tên miền website này. Vui lòng kiểm tra lại URL!', HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(err.message || defaultMsg, HttpStatus.BAD_REQUEST);
  }
}
