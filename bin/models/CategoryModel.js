"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let CategorySchema = new Schema({
    category_id: { type: Number, required: true },
    name: { type: String, required: true },
    parent_category: { type: Number, required: false, default: null },
    // categories: category_id name parent_category(integer)
});
CategorySchema.pre(/^find/, function (next) {
    let doc = this;
    doc.select('-__v');
    next();
});
// let Category = mongoose.model<mCategoryType>('CategoryModel', CategorySchema);
// export default Category;
//# sourceMappingURL=CategoryModel.js.map