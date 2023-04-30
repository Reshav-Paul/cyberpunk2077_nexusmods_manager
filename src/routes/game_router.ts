import { Router } from 'express';

import * as game_controller from '../controllers/game_controller';
import * as auth_controller from '../controllers/auth_controller';
import { getUserAPIKey } from '../utils/middlewares/auth_middleware';

let gameRouter = Router();


// gameRouter.get('/:id', auth_controller.user_auth, game_controller);
gameRouter.get('/:domain/categories', auth_controller.user_auth, getUserAPIKey, game_controller.game_get_categories);
gameRouter.get('/:domain', auth_controller.user_auth, game_controller.get_game);
gameRouter.post('/:domain', auth_controller.user_auth, game_controller.game_create);

export default gameRouter;
