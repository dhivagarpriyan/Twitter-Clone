import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { deletenotification, getnotification } from "../controllers/notificationcontroller.js";

const router = express.Router();

router.get("/",protectRoute,getnotification);
router.delete("/",protectRoute,deletenotification);

export default router