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
exports.game_get_categories = exports.get_game = exports.game_create = void 0;
const axios_1 = __importDefault(require("axios"));
const GameModel_1 = __importDefault(require("../models/GameModel"));
const url_provider_1 = require("../utils/url_provider");
const error_response_1 = require("../utils/error_response");
const error_messages_1 = require("../utils/error_messages");
let game_create = function game_create(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let game_response = yield axios_1.default.get((0, url_provider_1.urlProvider)().gameByDomain(req.params.domain), {
            headers: {
                apikey: req.user_api_key
            }
        });
        if (!game_response.data || !game_response.data.id) {
            res.status(400).json((0, error_response_1.createNotFoundError)(error_messages_1.gameErrors.gameNotFound));
            return;
        }
        // console.log(game_response.data);
        let gameData = {
            id: game_response.data.id,
            name: game_response.data.name,
            domain_name: game_response.data.domain_name,
            nexusmods_url: game_response.data.nexusmods_url,
            categories: game_response.data.categories.map((category) => {
                if (!category.parent_category) {
                    return Object.assign({}, {
                        category_id: category.category_id,
                        name: category.name,
                    });
                }
                else {
                    return category;
                }
            }),
        };
        let newGame = new GameModel_1.default(gameData);
        try {
            let createdGame = yield newGame.save();
            let returnPayload = createdGame.toJSON();
            res.status(200).json(returnPayload);
        }
        catch (e) {
            if (e.code === 11000) {
                if (e.keyPattern.id === 1) {
                    res.status(400).json((0, error_response_1.createEntityExistsError)('Game already added'));
                }
            }
            else {
                res.status(400).json((0, error_response_1.createDbError)(e));
            }
        }
    });
};
exports.game_create = game_create;
let get_game = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let game = yield GameModel_1.default.findOne({ game_domain: req.params.domain }).lean();
        if (game) {
            res.json(game);
        }
        else {
            res.status(404).json((0, error_response_1.createNotFoundError)(error_messages_1.gameErrors.gameNotFound, { domain_name: req.params.domain }));
        }
    });
};
exports.get_game = get_game;
let game_get_categories = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let game = yield GameModel_1.default.findOne({ game_domain: req.params.domain }).lean();
        if (game) {
            res.json(game.categories.filter(category => category.parent_category));
        }
        else {
            res.status(404).json((0, error_response_1.createNotFoundError)(error_messages_1.gameErrors.gameNotFound, { domain_name: req.params.domain }));
        }
    });
};
exports.game_get_categories = game_get_categories;
//# sourceMappingURL=game_controller.js.map