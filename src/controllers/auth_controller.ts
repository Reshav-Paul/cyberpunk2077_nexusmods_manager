import passport from 'passport';
import passportJwt from 'passport-jwt';
import { IStrategyOptions, Strategy as LocalStrategy, VerifyFunction } from 'passport-local';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { RequestHandler } from 'express';

import User from '../models/User';
import { mUserType } from '../utils/types';
import { userErrors } from '../utils/error_messages';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export let userLoginValidation = [
  body('email', userErrors.noEmail).exists().bail().trim().notEmpty(),
  body('email', userErrors.invalidEmail).exists().bail().optional({ checkFalsy: true }).isEmail(),
  body('password', userErrors.noPassword).exists().bail().trim().notEmpty(),
];

let userLoginVerify: VerifyFunction = async function userLoginVerify(email, password, done) {
  try {
    let user = await User.findOne({ email: email }).select('+email +password').lean();
    if (!user) {
      return done(null, false, { message: userErrors.noUserFound });
    }
    let compareSuccess = await bcrypt.compare(password, user.password);
    if (compareSuccess) return done(null, user);
    else return done(null, false, { message: userErrors.wrongPassword });
  } catch (e) {
    return done(e);
  }
}

let userAuthVerify: passportJwt.VerifyCallback = async function userAuthVerify(payload, done) {
  if (payload.user) {
    try {
      let user = await User.findById(payload.user._id).lean();
      if (user) return done(null, user);
      else return done(null, false);
    } catch (e) {
      return done(e, false);
    }
  }
}

let localStrategyOptions: IStrategyOptions = {
  passwordField: 'password',
  usernameField: 'email',
  session: false,
};
passport.use('user-login', new LocalStrategy(
  localStrategyOptions,
  userLoginVerify
));

let jwtStrategyOptions: passportJwt.StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.jwtSecret,
};

passport.use('user-auth', new JwtStrategy(
  jwtStrategyOptions,
  userAuthVerify
));

export let user_login: RequestHandler = function userLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({
      error: { status: 'Validation_Error', errors: errors.array() }
    });
    return;
  }
  passport.authenticate('user-login', function (err, user: mUserType, message) {
    if (err || !user) {
      if (message) {
        res.status(400).json(message);
        return;
      }
      res.status(400).json({ message: userErrors.loginDefaultError });
      return;
    }

    req.login(
      user,
      { session: false },
      err => {
        if (err) return next(err);
        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, process.env.jwtSecret!);

        res.json({
          login: true,
          email: user.email,
          id: user._id,
          token: token,
        });
      }
    );
  })(req, res, next);
}

export let user_auth = passport.authenticate('user-auth', { session: false });
export let user_logout: RequestHandler = function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.json({ logout: true });
  });
}
