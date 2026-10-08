"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeModule = void 0;
const common_1 = require("@nestjs/common");
const bridge_controller_1 = require("./bridge.controller");
const bridge_service_1 = require("./bridge.service");
const compiler_module_1 = require("../compiler/compiler.module");
let BridgeModule = class BridgeModule {
};
exports.BridgeModule = BridgeModule;
exports.BridgeModule = BridgeModule = __decorate([
    (0, common_1.Module)({
        imports: [compiler_module_1.CompilerModule],
        controllers: [bridge_controller_1.BridgeController],
        providers: [bridge_service_1.BridgeService],
        exports: [bridge_service_1.BridgeService],
    })
], BridgeModule);
//# sourceMappingURL=bridge.module.js.map