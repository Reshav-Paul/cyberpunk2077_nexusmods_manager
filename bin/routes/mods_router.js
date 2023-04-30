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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const mods_controller = __importStar(require("../controllers/mods_controller"));
const auth_middleware_1 = require("../utils/middlewares/auth_middleware");
const auth_controller = __importStar(require("../controllers/auth_controller"));
let modsRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Create
modsRouter.post('/file_upload', auth_controller.user_auth, auth_middleware_1.getUserAPIKey, upload.single('file'), mods_controller.mods_file_upload);
// Read
modsRouter.get('/:id', auth_controller.user_auth, mods_controller.get_mod_by_id);
modsRouter.get('/', auth_controller.user_auth, mods_controller.get_mods);
// Update
modsRouter.put('/:id/files', auth_controller.user_auth, auth_middleware_1.getUserAPIKey, mods_controller.update_mod_files);
exports.default = modsRouter;
//# sourceMappingURL=mods_router.js.map