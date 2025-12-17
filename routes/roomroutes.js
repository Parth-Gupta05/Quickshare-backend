import { Router } from "express";
import {createroom, joinroom} from "../controllers/room.controller.js"
import { auth } from "../middlewares/auth.middleware.js";

const router=Router()
router.post("/joinroom",joinroom)
router.post("/createroom",createroom)
router.post("/changeroomsetting",auth,joinroom)

export default router