import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getuserprofile,followunfollowuser, getsuggestedusers, updateuser } from "../controllers/usercontroller.js";

const router = express.Router();

router.get("/profile/:username",protectRoute,getuserprofile);
router.get("/suggested",protectRoute,getsuggestedusers);
router.post("/follow/:id",protectRoute,followunfollowuser);
router.post("/update",protectRoute,updateuser);

export default router;