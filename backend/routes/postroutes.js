import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { commentonpost, createpost, deletepost, getallpost, getfollowingpost, getlikedpost, getuserposts, likeunlikepost } from "../controllers/postcontroller.js";


const router = express.Router();

router.get("/user/:username",protectRoute,getuserposts);
router.get("/following",protectRoute,getfollowingpost);
router.get("/likes/:id",protectRoute,getlikedpost);
router.get("/all",protectRoute,getallpost);
router.post("/create",protectRoute,createpost);
router.post("/like/:id",protectRoute,likeunlikepost);
router.post("/comments/:id",protectRoute,commentonpost);
router.delete("/:id",protectRoute,deletepost);

export default router;