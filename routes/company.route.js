import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";
import { deleteCompany } from '../controllers/company.controller.js';



const router = express.Router();

router.route("/register").post(isAuthenticated,singleUpload,registerCompany);
router.route("/get/:id").get(isAuthenticated,getCompanyById);
router.route("/update/:id").put(isAuthenticated,singleUpload,updateCompany);
router.route('/:id/delete').delete(isAuthenticated, deleteCompany);
router.get("/me", isAuthenticated, getCompany);



export default router;