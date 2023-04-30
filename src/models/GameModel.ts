import mongoose from 'mongoose';

import { CategoryType, mGameType } from '../utils/types.js';

const Schema = mongoose.Schema;

let GameSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  nexusmods_url: { type: String, required: true },
  domain_name: { type: String, required: true, unique: true },
  categories: [new Schema<CategoryType>({
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

let Game = mongoose.model<mGameType>('Games', GameSchema);
export default Game;
