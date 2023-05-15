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
exports.update_mod_files = exports.get_mod_by_id = exports.get_mods = exports.add_mod = exports.mods_file_upload = exports.modCreationValidation = void 0;
const XLSX = __importStar(require("xlsx"));
const mods_helper_1 = __importStar(require("../utils/mods_helper"));
const error_response_1 = require("../utils/error_response");
const error_messages_1 = require("../utils/error_messages");
const ModModel_1 = __importDefault(require("../models/ModModel"));
const express_validator_1 = require("express-validator");
const error_response_2 = require("../utils/error_response");
const isURL_1 = __importDefault(require("validator/lib/isURL"));
const custom_validators_1 = require("../utils/custom_validators");
exports.modCreationValidation = [
    (0, express_validator_1.body)('mod_id', error_messages_1.modExceptions.mod_id_empty.message).exists().bail().trim().notEmpty().isNumeric(),
    (0, express_validator_1.body)('domain_name', error_messages_1.modExceptions.game_domain_empty.message).exists().bail().trim().notEmpty(),
    (0, express_validator_1.body)('url', error_messages_1.modExceptions.url_empty.message).exists().bail().trim().notEmpty().isURL(),
    (0, express_validator_1.body)('url', error_messages_1.modExceptions.url_invalid.message).exists().bail().custom(custom_validators_1.isNexusModURL),
];
let mods_file_upload = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = XLSX.read(req.file.buffer, { type: 'buffer' });
        let urlColumnHeader = 'URL';
        let modURLs = [];
        data.SheetNames.forEach((sheetName) => {
            let sheetData = XLSX.utils.sheet_to_json(data.Sheets[sheetName]);
            modURLs = modURLs.concat(sheetData.map((sheetRow) => sheetRow[urlColumnHeader]).filter(value => value));
        });
        let modIDandDomains = modURLs.filter(url => (0, isURL_1.default)(url)).map(modURL => (0, mods_helper_1.getModIDAndDomainFromURL)(modURL));
        let response = [];
        for (let modIDandDomain of modIDandDomains) {
            if (!modIDandDomain.domain_name || isNaN(modIDandDomain.mod_id))
                return {};
            let existingMod;
            try {
                existingMod = yield mods_helper_1.default.getMod(modIDandDomain.mod_id, modIDandDomain.domain_name);
                if (existingMod === null || existingMod === void 0 ? void 0 : existingMod._id) {
                    response.push((0, error_response_1.createModError)(modIDandDomain.mod_id, modIDandDomain.domain_name, error_messages_1.modExceptions.duplicate_entry, existingMod.name));
                    continue;
                }
            }
            catch (error) { }
            try {
                let fetchedMod = yield mods_helper_1.default.fetchMod(modIDandDomain.mod_id, modIDandDomain.domain_name, req.user_api_key);
                fetchedMod.files = yield mods_helper_1.default.fetchModFiles(fetchedMod.mod_id, fetchedMod.domain_name, 'main', req.user_api_key);
                let savedMod = yield mods_helper_1.default.saveMod(fetchedMod);
                response.push(savedMod);
            }
            catch (error) {
                response.push((0, error_response_1.createModError)(modIDandDomain.mod_id, modIDandDomain.domain_name, error));
            }
        }
        res.json(response);
    });
};
exports.mods_file_upload = mods_file_upload;
let add_mod = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        let shouldFetchFromURL = false;
        if (!errors.isEmpty()) {
            let validationErrors = errors.array();
            let urlErrors = validationErrors.filter(error => error.param === 'url');
            let otherErrors = validationErrors.filter(error => error.param !== 'url');
            validationErrors = [];
            if (req.body.url) {
                if (urlErrors.length > 0 && otherErrors.length !== 0)
                    validationErrors = urlErrors;
                if (urlErrors.length === 0)
                    shouldFetchFromURL = true;
            }
            else {
                if (otherErrors.length > 0)
                    validationErrors = otherErrors;
            }
            if (validationErrors.length > 0) {
                res.status(400).json((0, error_response_2.createValidationError)(validationErrors));
                return;
            }
        }
        else
            shouldFetchFromURL = true;
        try {
            let { mod_id, domain_name } = req.body;
            if (shouldFetchFromURL) {
                let modIDandDomainFromURL = (0, mods_helper_1.getModIDAndDomainFromURL)(req.body.url);
                mod_id = modIDandDomainFromURL.mod_id;
                domain_name = modIDandDomainFromURL.domain_name;
            }
            let fetchedMod = yield mods_helper_1.default.fetchMod(mod_id, domain_name, req.user_api_key);
            fetchedMod.files = yield mods_helper_1.default.fetchModFiles(fetchedMod.mod_id, fetchedMod.domain_name, 'main', req.user_api_key);
            let savedMod = yield mods_helper_1.default.saveMod(fetchedMod);
            res.json(savedMod);
        }
        catch (error) {
            res.json((0, error_response_1.createModError)(req.body.mod_id, req.body.domain_name, error));
        }
    });
};
exports.add_mod = add_mod;
let get_mods = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = {};
        if (req.query.category) {
            query.category_id = req.query.category.split(',')
                .map((id) => id.trim())
                .filter((id) => id);
        }
        if (req.query.domain_name) {
            query.domain_name = req.query.domain_name.split(',')
                .map((name) => name.trim())
                .filter((name) => name);
        }
        if (req.query.mod_id && req.query.domain_name) {
            query.mod_id = req.query.mod_id.split(',')
                .map((id) => id.trim())
                .filter((id) => id);
        }
        let queryAnd = {};
        let searchQuery;
        if (req.query.search) {
            query.name = req.query.search.split(',')
                .map((name) => name.trim())
                .filter((name) => name);
            query.description = query.name;
            query.summary = query.name;
            searchQuery = {
                $or: createSearchParameters(query.name, query.description, query.summary)
            };
            queryAnd.$and = [searchQuery];
        }
        console.log(query);
        try {
            let mods = yield ModModel_1.default.find(Object.assign(Object.assign(Object.assign(Object.assign({}, query.category_id ? { category_id: query.category_id } : {}), query.domain_name ? { domain_name: query.domain_name } : {}), query.mod_id ? { mod_id: query.mod_id } : {}), queryAnd));
            res.json(mods);
        }
        catch (error) {
            console.log(error);
            res.status(500).json((0, error_response_1.createGenericServerError)());
        }
    });
};
exports.get_mods = get_mods;
let get_mod_by_id = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mod = yield ModModel_1.default.findById(req.params.id).lean();
        if (mod === null || mod === void 0 ? void 0 : mod._id) {
            res.json(mod);
        }
        else {
            res.json((0, error_response_1.createNotFoundError)(error_messages_1.modExceptions.not_found.message, { _id: req.params.id }));
        }
    });
};
exports.get_mod_by_id = get_mod_by_id;
let update_mod_files = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mod = yield ModModel_1.default.findById(req.params.id).lean();
        if (!mod) {
            res.json((0, error_response_1.createNotFoundError)(error_messages_1.modExceptions.not_found.message, { _id: req.params.id }));
            return;
        }
        try {
            mod.files = yield mods_helper_1.default.fetchModFiles(mod.mod_id, mod.domain_name, 'main', req.user_api_key);
            let updatedMod = yield ModModel_1.default.findByIdAndUpdate(mod._id, { files: mod.files }, {
                new: true
            });
            res.json(updatedMod);
        }
        catch (error) {
            console.log(error);
            res.json((0, error_response_1.createModError)(mod.mod_id, mod.domain_name, error));
        }
    });
};
exports.update_mod_files = update_mod_files;
function createSearchParameters(nameQuery, descQuery, summaryQuery) {
    let searchParams = [];
    searchParams = searchParams.concat(nameQuery.map(function (nameSearchString) {
        return { name: { $regex: nameSearchString, $options: 'i' } };
    }));
    searchParams = searchParams.concat(descQuery.map(function (descSearchString) {
        return { name: { $regex: descSearchString, $options: 'i' } };
    }));
    searchParams = searchParams.concat(summaryQuery.map(function (summarySearchString) {
        return { name: { $regex: summarySearchString, $options: 'i' } };
    }));
    return searchParams;
}
//# sourceMappingURL=mods_controller.js.map