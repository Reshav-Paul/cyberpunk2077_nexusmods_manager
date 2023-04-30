"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let GameSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    nexusmods_url: { type: String, required: true },
    domain_name: { type: String, required: true, unique: true },
    categories: [new Schema({
            category_id: Number,
            name: String,
            parent_category: { type: Number, default: null },
        })]
});
GameSchema.pre(/^find/, function (next) {
    let doc = this;
    doc.select('-__v');
    next();
});
let Game = mongoose_1.default.model('Games', GameSchema);
exports.default = Game;
//# sourceMappingURL=GameModel.js.map