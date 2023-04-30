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
exports.getUserAPIKey = exports.authenticateUserIdInBody = exports.authenticateUserIdInParam = void 0;
const custom_validators_1 = require("../custom_validators");
const error_messages_1 = require("../error_messages");
const User_1 = __importDefault(require("../../models/User"));
const error_response_1 = require("../error_response");
let authenticateUserIdInParam = function (req, res, next) {
    if (!req.params.id || !(0, custom_validators_1.validateMongoId)(req.params.id)) {
        res.status(400).json({ message: error_messages_1.generalErrors.invalidMongoId });
        return;
    }
    if (req.user._id.toString() === req.params.id) {
        return next();
    }
    res.status(401).send('Unauthorized');
};
exports.authenticateUserIdInParam = authenticateUserIdInParam;
let authenticateUserIdInBody = function (param, req, res, next) {
    let validationError = [{
            value: req.body[param],
            msg: error_messages_1.generalErrors.invalidMongoId,
            param,
            location: 'body'
        }];
    if (!req.body[param] || !(0, custom_validators_1.validateMongoId)(req.body[param])) {
        let errorBody = {
            error: {
                status: 'Validation_Error',
                errors: validationError
            }
        };
        res.status(400).json(errorBody);
        return;
    }
    if (req.user._id.toString() === req.body[param]) {
        return next();
    }
    res.status(401).send('Unauthorized');
};
exports.authenticateUserIdInBody = authenticateUserIdInBody;
let getUserAPIKey = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield User_1.default.findById(req.user._id, '+api_key');
        if (!user) {
            res.status(400).json((0, error_response_1.createNotFoundError)(error_messages_1.userErrors.noUserFound));
            return;
        }
        if (!user.api_key) {
            res.status(400).json((0, error_response_1.createNotFoundError)(error_messages_1.userErrors.noAPIKey));
            return;
        }
        req.user_api_key = user.api_key;
        next();
    });
};
exports.getUserAPIKey = getUserAPIKey;
//# sourceMappingURL=auth_middleware.js.map