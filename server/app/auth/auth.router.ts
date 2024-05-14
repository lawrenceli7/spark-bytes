// Look at the other router files and figure out how to implement the auth router
// Until you do, you will not be able to login or register or even make requests to those routes

import express from 'express';
import * as authController from './auth.controller.ts';
const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);

export default router;