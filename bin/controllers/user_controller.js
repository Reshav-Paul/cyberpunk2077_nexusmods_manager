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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_set_api_key = exports.user_get_me = exports.user_get_by_id = exports.user_create = exports.userCreationValidation = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const error_messages_1 = require("../utils/error_messages");
const error_response_1 = require("../utils/error_response");
exports.userCreationValidation = [
    (0, express_validator_1.body)('username', error_messages_1.userErrors.noUsername).exists().bail().trim().notEmpty(),
    (0, express_validator_1.body)('email', error_messages_1.userErrors.noEmail).exists().bail().trim().notEmpty(),
    (0, express_validator_1.body)('email', error_messages_1.userErrors.invalidEmail).exists().bail().optional({ checkFalsy: true }).isEmail(),
    (0, express_validator_1.body)('password', error_messages_1.userErrors.noPassword).exists().bail().trim().notEmpty(),
];
let user_create = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json((0, error_response_1.createValidationError)(errors.array()));
            return;
        }
        let newUserData = {
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
        };
        let newUser = new User_1.default(newUserData);
        try {
            let createdUser = yield newUser.save();
            let _a = createdUser.toJSON(), { password, __v } = _a, returnUserData = __rest(_a, ["password", "__v"]);
            res.status(200).json(returnUserData);
        }
        catch (e) {
            if (e.code === 11000) {
                if (e.keyPattern.email === 1) {
                    res.status(400).json((0, error_response_1.createValidationError)([(0, error_response_1.formatToValidationErrorInBody)(e.keyValue.email, error_messages_1.userErrors.duplicateEmail, 'email')]));
                }
            }
            else {
                res.status(400).json((0, error_response_1.createDbError)(e));
            }
        }
    });
};
exports.user_create = user_create;
let user_get_by_id = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let user = yield User_1.default.findById(req.params.id).lean();
            if (!user) {
                res.status(404).json((0, error_response_1.createNotFoundError)(error_messages_1.userErrors.noUserFound));
                return;
            }
            res.status(200).json(user);
        }
        catch (e) {
            return next(e);
        }
    });
};
exports.user_get_by_id = user_get_by_id;
let user_get_me = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user || !req.user._id) {
            res.status(401).send((0, error_response_1.createUnauthorizedError)());
            return;
        }
        try {
            let me = yield User_1.default.findById(req.user._id).lean();
            if (!me) {
                res.status(404).json((0, error_response_1.createNotFoundError)(error_messages_1.userErrors.noUserFound));
                return;
            }
            res.json(me);
        }
        catch (err) {
            return next(err);
        }
    });
};
exports.user_get_me = user_get_me;
let user_set_api_key = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user || !req.user._id) {
            res.status(401).send((0, error_response_1.createUnauthorizedError)());
            return;
        }
        console.log(req.body.api_key);
        let updatedUserData = {};
        if (!req.body.api_key)
            return next();
        updatedUserData.api_key = req.body.api_key;
        try {
            let me = yield User_1.default.findById(req.user._id).lean();
            if (!me) {
                res.status(404).json((0, error_response_1.createNotFoundError)(error_messages_1.userErrors.noUserFound));
                return;
            }
            let updatedUser = yield User_1.default.findByIdAndUpdate(req.user._id, updatedUserData);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            return next(error);
        }
    });
};
exports.user_set_api_key = user_set_api_key;
// export let user_update: RequestHandler = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400).json(createValidationError(errors.array()));
//     return;
//   }
//   const userData: UserUpdateType = {};
//   if (req.body.firstname) userData.firstname = req.body.firstname;
//   if (req.body.lastname) userData.lastname = req.body.lastname;
//   try {
//     let currentUser = await User.findById(req.params.id).lean();
//     if (!currentUser) {
//       res.status(404).json(createNotFoundError(userErrors.noUserFound));
//       return;
//     }
//     if (Object.keys(userData).length === 0) {
//       res.status(200).json(currentUser);
//     } else {
//       let updatedUser = await User.findByIdAndUpdate(req.params.id, userData);
//       res.status(200).json(updatedUser);
//     }
//   } catch (e) {
//     return next(e);
//   }
// }
//# sourceMappingURL=user_controller.js.map