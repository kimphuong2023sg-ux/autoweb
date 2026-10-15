import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { BridgeService } from './bridge.service';

interface AuthBody {
  siteUrl: string;
  username?: string;
  password?: string;
  token?: string;
}

@Controller('api/bridge')
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  private validateCredentials(body: AuthBody) {
    if (!body?.siteUrl) {
      throw new BadRequestException('Vui lòng cung cấp URL Website');
    }
    const hasUserPass = Boolean(body.username && body.password);
    const hasToken = Boolean(body.token);
    if (!hasUserPass && !hasToken) {
      throw new BadRequestException('Vui lòng nhập Tên đăng nhập và Mật khẩu WordPress (hoặc Secret Token)');
    }
  }

  private extractAuth(body: AuthBody) {
    return {
      username: body.username,
      password: body.password,
      token: body.token,
    };
  }

  @Post('sync')
  async sync(@Body() body: AuthBody) {
    this.validateCredentials(body);
    return this.bridgeService.syncSite(body.siteUrl, this.extractAuth(body));
  }

  @Post('wipe')
  async wipe(@Body() body: AuthBody & { options?: any }) {
    this.validateCredentials(body);
    return this.bridgeService.wipeDefaults(body.siteUrl, this.extractAuth(body), body.options || {});
  }

  @Post('theme-mods')
  async applyThemeMods(@Body() body: AuthBody & { themeMods: any }) {
    this.validateCredentials(body);
    return this.bridgeService.applyThemeMods(body.siteUrl, this.extractAuth(body), body.themeMods || {});
  }

  @Post('deploy-footer')
  async deployFooter(@Body() body: AuthBody & { footerConfig: any }) {
    this.validateCredentials(body);
    return this.bridgeService.deployFooter(body.siteUrl, this.extractAuth(body), body.footerConfig);
  }

  @Post('deploy-homepage')
  async deployHomepage(@Body() body: AuthBody & { sections: any[]; title?: string }) {
    this.validateCredentials(body);
    return this.bridgeService.deployHomepage(body.siteUrl, this.extractAuth(body), body.sections || [], body.title);
  }

  @Post('setup-essentials')
  async setupEssentials(@Body() body: AuthBody & { essentials: any }) {
    this.validateCredentials(body);
    return this.bridgeService.setupEssentials(body.siteUrl, this.extractAuth(body), body.essentials);
  }

  @Post('batch-create-content')
  async batchCreateContent(@Body() body: AuthBody & { default_type?: string; items: any[] }) {
    this.validateCredentials(body);
    return this.bridgeService.batchCreateContent(body.siteUrl, this.extractAuth(body), {
      default_type: body.default_type,
      items: body.items || [],
    });
  }

  @Post('list-content')
  async listContent(@Body() body: AuthBody & { type?: string }) {
    this.validateCredentials(body);
    return this.bridgeService.listContent(body.siteUrl, this.extractAuth(body), {
      type: body.type || 'all',
    });
  }

  @Post('delete-content')
  async deleteContent(@Body() body: AuthBody & { type: string; id?: number; slug?: string }) {
    this.validateCredentials(body);
    return this.bridgeService.deleteContent(body.siteUrl, this.extractAuth(body), {
      type: body.type,
      id: body.id,
      slug: body.slug,
    });
  }

  @Post('deploy-all')
  async deployAll(@Body() body: AuthBody & {
    themeMods: any;
    footerConfig: any;
    sections: any[];
    essentials: any;
    wipeFirst?: boolean;
  }) {
    this.validateCredentials(body);
    return this.bridgeService.deployAll(body.siteUrl, this.extractAuth(body), body);
  }

  @Post('auto-install')
  async autoInstall(@Body() body: AuthBody) {
    this.validateCredentials(body);
    return this.bridgeService.autoInstallPlugin(body.siteUrl, this.extractAuth(body));
  }

  @Post('install-flatsome-theme')
  async installFlatsomeTheme(@Body() body: AuthBody) {
    this.validateCredentials(body);
    return this.bridgeService.installFlatsomeTheme(body.siteUrl, this.extractAuth(body));
  }

  @Post('push-plugin-code')
  async pushPluginCode(@Body() body: AuthBody) {
    this.validateCredentials(body);
    return this.bridgeService.pushPluginCode(body.siteUrl, this.extractAuth(body));
  }

  @Post('upload-media')
  async uploadMedia(
    @Body()
    body: AuthBody & {
      mediaId?: number;
      media_id?: number;
      filename?: string;
      fileData?: string;
      imageUrl?: string;
      altText?: string;
      title?: string;
      caption?: string;
      description?: string;
    },
  ) {
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

  @Post('update-media')
  async updateMedia(
    @Body()
    body: AuthBody & {
      mediaId?: number;
      media_id?: number;
      altText?: string;
      alt_text?: string;
      title?: string;
      caption?: string;
      description?: string;
    },
  ) {
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

  @Post('set-favicon')
  async setFavicon(
    @Body()
    body: AuthBody & {
      mediaId?: number;
      media_id?: number;
      fileData?: string;
      imageUrl?: string;
      filename?: string;
      remove?: boolean;
    },
  ) {
    this.validateCredentials(body);
    return this.bridgeService.setFavicon(body.siteUrl, this.extractAuth(body), {
      media_id: body.mediaId || body.media_id,
      mediaId: body.mediaId || body.media_id,
      file_data: body.fileData,
      fileData: body.fileData,
      image_url: body.imageUrl,
      imageUrl: body.imageUrl,
      filename: body.filename,
      remove: body.remove,
    });
  }

  @Post('list-media')
  async listMedia(@Body() body: AuthBody) {
    this.validateCredentials(body);
    return this.bridgeService.listMedia(body.siteUrl, this.extractAuth(body));
  }

  @Post('delete-media')
  async deleteMedia(
    @Body()
    body: AuthBody & {
      mediaId?: number;
      id?: number;
      mediaIds?: number[];
      ids?: number[];
    },
  ) {
    this.validateCredentials(body);
    const mediaIds =
      (body.mediaIds && body.mediaIds.length > 0 && body.mediaIds) ||
      (body.ids && body.ids.length > 0 && body.ids) ||
      (body.mediaId || body.id ? [body.mediaId || body.id] : []);

    if (!mediaIds || mediaIds.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp mediaId hoặc mediaIds của ảnh cần xóa');
    }
    return this.bridgeService.deleteMedia(body.siteUrl, this.extractAuth(body), mediaIds as number[]);
  }

  @Post('get-menu')
  async getMenu(
    @Body()
    body: AuthBody & {
      menu_id?: number;
      menu_name?: string;
    },
  ) {
    this.validateCredentials(body);
    return this.bridgeService.getMenu(body.siteUrl, this.extractAuth(body), {
      menu_id: body.menu_id,
      menu_name: body.menu_name,
    });
  }

  @Post('save-menu')
  async saveMenu(
    @Body()
    body: AuthBody & {
      menu_id?: number;
      menu_name: string;
      items: any[];
      locations?: string[];
      styling?: any;
    },
  ) {
    this.validateCredentials(body);
    return this.bridgeService.saveMenu(body.siteUrl, this.extractAuth(body), {
      menu_id: body.menu_id,
      menu_name: body.menu_name,
      items: body.items,
      locations: body.locations,
      styling: body.styling,
    });
  }

  @Post('save-subpage-styling')
  async saveSubpageStyling(
    @Body()
    body: AuthBody & {
      styling: any;
    },
  ) {
    this.validateCredentials(body);
    return this.bridgeService.saveSubpageStyling(body.siteUrl, this.extractAuth(body), body.styling);
  }
}
