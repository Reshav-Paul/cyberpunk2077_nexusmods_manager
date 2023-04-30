import { NextFunction, RequestHandler, Response } from "express";
import { validateMongoId } from "../custom_validators";
import { generalErrors, userErrors } from "../error_messages";
import User from "../../models/User";
import { createNotFoundError } from "../error_response";

export let authenticateUserIdInParam: RequestHandler = function (req: any, res, next) {
  if (!req.params.id || !validateMongoId(req.params.id)) {
    res.status(400).json({ message: generalErrors.invalidMongoId });
    return;
  }
  if (req.user._id.toString() === req.params.id) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

export let authenticateUserIdInBody = function (param: string, req: any, res: Response, next: NextFunction) {
  let validationError = [{
    value: req.body[param],
    msg: generalErrors.invalidMongoId,
    param,
    location: 'body'
  }];

  if (!req.body[param] || !validateMongoId(req.body[param])) {
    let errorBody = {
      error: {
        status: 'Validation_Error',
        errors: validationError
      }
    }
    res.status(400).json(errorBody);
    return;
  }
  if (req.user._id.toString() === req.body[param]) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

export let getUserAPIKey: RequestHandler = async function (req: any, res, next) {
  let user = await User.findById(req.user._id, '+api_key');
  if (!user) {
    res.status(400).json(createNotFoundError(userErrors.noUserFound));
    return;
  }
  if (!user.api_key) {
    res.status(400).json(createNotFoundError(userErrors.noAPIKey));
    return;
  }
  req.user_api_key = user.api_key;
  next();
}