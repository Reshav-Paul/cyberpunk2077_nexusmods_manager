"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Schema = mongoose_1.default.Schema;
let UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    api_key: { type: String, required: false, select: false }
});
UserSchema.virtual('url').get(function () {
    return '/user/' + this._id;
});
UserSchema.pre('save', function (next) {
    let doc = this;
    bcryptjs_1.default.genSalt(Math.floor(Math.random() * 10) + 10, function (err, salt) {
        if (err)
            return next(err);
        bcryptjs_1.default.hash(doc.password, salt, function (err, hashedPass) {
            if (err)
                return next(err);
            doc.password = hashedPass;
            next();
        });
    });
});
UserSchema.pre(/^find/, function (next) {
    let doc = this;
    doc.select('-__v');
    next();
});
let User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.js.map