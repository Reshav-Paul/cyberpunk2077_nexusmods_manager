"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNexusModURL = exports.validateMongoId = void 0;
const validator_1 = __importDefault(require("validator"));
const mods_helper_1 = require("./mods_helper");
let validateMongoId = function validateMongoId(id) {
    return validator_1.default.isMongoId(id);
};
exports.validateMongoId = validateMongoId;
let isNexusModURL = function (nexusURL) {
    let { domain_name, mod_id } = (0, mods_helper_1.getModIDAndDomainFromURL)(nexusURL);
    if (domain_name && mod_id)
        return true;
    return false;
};
exports.isNexusModURL = isNexusModURL;
//# sourceMappingURL=custom_validators.js.map