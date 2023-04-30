"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMongoId = void 0;
const validator_1 = __importDefault(require("validator"));
let validateMongoId = function validateMongoId(id) {
    return validator_1.default.isMongoId(id);
};
exports.validateMongoId = validateMongoId;
//# sourceMappingURL=custom_validators.js.map