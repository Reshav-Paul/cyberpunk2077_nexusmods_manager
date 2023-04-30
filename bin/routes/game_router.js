"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller = __importStar(require("../controllers/game_controller"));
const auth_controller = __importStar(require("../controllers/auth_controller"));
const auth_middleware_1 = require("../utils/middlewares/auth_middleware");
let gameRouter = (0, express_1.Router)();
// gameRouter.get('/:id', auth_controller.user_auth, game_controller);
gameRouter.get('/:domain/categories', auth_controller.user_auth, auth_middleware_1.getUserAPIKey, game_controller.game_get_categories);
gameRouter.get('/:domain', auth_controller.user_auth, game_controller.get_game);
gameRouter.post('/:domain', auth_controller.user_auth, game_controller.game_create);
exports.default = gameRouter;
//# sourceMappingURL=game_router.js.map