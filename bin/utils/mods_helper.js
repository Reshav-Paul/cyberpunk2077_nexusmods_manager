"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModIDAndDomainFromURL = void 0;
const axios_1 = __importDefault(require("axios"));
const ModModel_1 = __importDefault(require("../models/ModModel"));
const error_messages_1 = require("./error_messages");
const url_provider_1 = require("./url_provider");
function fetchMod(mod_id, game_domain, apikey) {
    return __awaiter(this, void 0, void 0, function* () {
        let modPayload = yield axios_1.default.get((0, url_provider_1.urlProvider)().modByID(mod_id, game_domain), { headers: { apikey } });
        if (modPayload.status !== 200)
            throw error_messages_1.modExceptions.fetch_error;
        let modData = Object.assign({}, modPayload.data);
        return modData;
    });
}
function fetchModFiles(mod_id, game_domain, category, apikey) {
    return __awaiter(this, void 0, void 0, function* () {
        let modFilesResponse = yield axios_1.default.get((0, url_provider_1.urlProvider)().modFiles(mod_id, game_domain, category), { headers: { apikey } });
        if (modFilesResponse.status !== 200)
            throw error_messages_1.modExceptions.files_not_found;
        let modFiles = modFilesResponse.data.files.map((modFile) => {
            return Object.assign({}, modFile);
        });
        return modFiles;
    });
}
function saveMod(mod) {
    return __awaiter(this, void 0, void 0, function* () {
        let newMod = new ModModel_1.default(mod);
        try {
            let savedMod = yield newMod.save();
            let savedModJSON = savedMod.toJSON();
            return savedModJSON;
        }
        catch (e) {
            if (e.code === 11000) {
                if (e.keyPattern.id === 1) {
                    throw error_messages_1.modExceptions.duplicate_entry;
                }
            }
            throw error_messages_1.modExceptions.save_error;
        }
    });
}
function getMod(id, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        let mod = yield ModModel_1.default.findOne({ mod_id: id, domain_name: domain }).lean();
        if (!(mod === null || mod === void 0 ? void 0 : mod._id))
            throw error_messages_1.modExceptions.not_found;
        return mod;
    });
}
let getModIDAndDomainFromURL = function (url) {
    const prefix = 'nexusmods.com';
    let game_domain_index = url.indexOf(prefix);
    game_domain_index += (prefix.length + 1);
    let domainAndID = url.substring(game_domain_index, url.length);
    let [domain, id_str] = domainAndID.split('/mods/');
    let id = parseInt(id_str);
    return { domain, id };
};
exports.getModIDAndDomainFromURL = getModIDAndDomainFromURL;
let modHelper = {
    fetchMod,
    fetchModFiles,
    saveMod,
    getMod,
    getModIDAndDomainFromURL: exports.getModIDAndDomainFromURL
};
exports.default = modHelper;
//# sourceMappingURL=mods_helper.js.map