import express from 'express';
import * as userController from './user.controller.ts';
import { authToken } from '../middleware/authToken.ts';
const router = express.Router();

// This applies token checking to everything on this router
router.use(authToken);
router.get("/", userController.getUsers);
router.post('/update/:userId', userController.updateUser);
router.patch("/update/permissions/:userId", userController.updateUserPermissions)

export default router;
