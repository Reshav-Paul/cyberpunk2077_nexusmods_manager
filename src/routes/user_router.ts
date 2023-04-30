import { Router } from 'express';

import * as user_controller from '../controllers/user_controller';
import * as auth_controller from '../controllers/auth_controller';
import { authenticateUserIdInParam } from '../utils/middlewares/auth_middleware';

let userRouter = Router();

userRouter.post('/signup', ...user_controller.userCreationValidation, user_controller.user_create);
userRouter.post('/login', ...auth_controller.userLoginValidation, auth_controller.user_login);
userRouter.post('/logout', auth_controller.user_logout);
userRouter.get('/me', auth_controller.user_auth, user_controller.user_get_me);
userRouter.post('/api_key', auth_controller.user_auth, user_controller.user_set_api_key)
userRouter.get('/:id', auth_controller.user_auth, authenticateUserIdInParam, user_controller.user_get_by_id);
// userRouter.put('/:id', auth_controller.user_auth, authenticateUserIdInParam,
//   ...user_controller.userUpdationValidation, user_controller.user_update);

export default userRouter;
