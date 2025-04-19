import express from "express";
import {register, login,logout, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { multiFieldUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(multiFieldUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,multiFieldUpload,updateProfile);

export default router;