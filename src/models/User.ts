import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { mUserType } from '../utils/types.js';

const Schema = mongoose.Schema;

let UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  api_key: { type: String, required: false, select: false }
});

UserSchema.virtual('url').get(function (this: mUserType) {
  return '/user/' + this._id;
});

UserSchema.pre('save', function (next) {
  let doc = this;
  bcrypt.genSalt(Math.floor(Math.random() * 10) + 10,
    function (err: mongoose.CallbackError | undefined, salt: any) {
      if (err) return next(err);
      bcrypt.hash(doc.password, salt, function (err: mongoose.CallbackError | undefined, hashedPass: any) {
        if (err) return next(err);
        doc.password = hashedPass;
        next();
      })
    }
  );
});

UserSchema.pre(/^find/, function (next) {
  let doc = this;
  doc.select('-__v');
  next();
});

let User = mongoose.model<mUserType>('User', UserSchema);
export default User;
