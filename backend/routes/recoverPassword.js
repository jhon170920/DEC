import express from "express";

import { requestCode, changePassword } from "../controllers/recoverPassword.js";

const router = express.Router();

router.post('/req-code', requestCode);

router.post('/change-pass', changePassword);

export default router;