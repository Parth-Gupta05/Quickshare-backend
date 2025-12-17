import { Router } from "express";
import { fileupload } from "../controllers/fileupload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/upload").post(upload.fields([{name:"file",maxCount:12}]),fileupload)

export default router