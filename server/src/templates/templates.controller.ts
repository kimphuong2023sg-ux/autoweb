import { Controller, Get } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('sections')
  getSections() {
    return this.templatesService.getAvailableSections();
  }

  @Get('niches')
  getNiches() {
    return this.templatesService.getNichePresets();
  }

  @Get('footers')
  getFooters() {
    return this.templatesService.getFooterPresets();
  }
}
