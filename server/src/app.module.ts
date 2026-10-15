import { Module } from '@nestjs/common';
import { BridgeModule } from './bridge/bridge.module';
import { CompilerModule } from './compiler/compiler.module';
import { TemplatesModule } from './templates/templates.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, BridgeModule, CompilerModule, TemplatesModule],
})
export class AppModule {}
