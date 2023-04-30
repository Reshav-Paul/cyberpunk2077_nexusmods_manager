"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let ModSchema = new Schema({
    name: { type: String, required: true },
    summary: { type: String },
    description: { type: String },
    picture_url: { type: String },
    mod_id: { type: Number, required: true, unique: false },
    game_id: { type: Number, required: true },
    domain_name: { type: String, required: true, unique: false },
    category_id: { type: Number },
    version: { type: String },
    author: { type: String },
    contains_adult_content: { type: Boolean },
    files: [new Schema({
            file_id: { type: Number },
            name: { type: String },
            version: { type: String },
            category_id: { type: Number },
            category_name: { type: String },
            is_primary: { type: Boolean },
            file_name: { type: String },
            uploaded_timestamp: { type: Number },
            uploaded_time: { type: String },
            mod_version: { type: String },
            description: { type: String },
            size_kb: { type: Number },
            content_preview_link: { type: String },
        })]
});
ModSchema.index({ domain_name: 1, mod_id: 1 }, { unique: true });
ModSchema.pre(/^find/, function (next) {
    let doc = this;
    doc.select('-__v');
    next();
});
let Mod = mongoose_1.default.model('Mods', ModSchema);
exports.default = Mod;
//# sourceMappingURL=ModModel.js.map