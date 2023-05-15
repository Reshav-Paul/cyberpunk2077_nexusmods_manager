import { Router } from "express";
import multer from 'multer';

import * as mods_controller from '../controllers/mods_controller'
import { getUserAPIKey } from "../utils/middlewares/auth_middleware";
import * as auth_controller from '../controllers/auth_controller';

let modsRouter = Router();
const upload = multer({ storage: multer.memoryStorage() })

// Create
modsRouter.post('/file_upload', auth_controller.user_auth, getUserAPIKey, upload.single('file'), mods_controller.mods_file_upload);
modsRouter.post('/', auth_controller.user_auth, getUserAPIKey, ...mods_controller.modCreationValidation, mods_controller.add_mod);

// Read
modsRouter.get('/:id', auth_controller.user_auth, mods_controller.get_mod_by_id);
modsRouter.get('/', auth_controller.user_auth, mods_controller.get_mods);

// Update
modsRouter.put('/:id/files', auth_controller.user_auth, getUserAPIKey, mods_controller.update_mod_files);

export default modsRouter;