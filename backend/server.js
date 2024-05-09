import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";
import Connect_to_mongodb from "./db/Connect_to_mongodb.js";
import authroutes from "./routes/authroutes.js"
import userroutes from "./routes/userroutes.js"
import postroutes from "./routes/postroutes.js"
import notificationroutes from "./routes/notificationroutes.js"
import cookieParser from "cookie-parser";

dotenv.config();
const app=express();
const PORT=process.env.PORT || 8000;
const __dirname = path.resolve();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECERT

});

app.use(cors());
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",authroutes);
app.use("/api/user",userroutes);
app.use("/api/posts",postroutes);
app.use("/api/notifications",notificationroutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}


app.listen(PORT,()=>{
    console.log(`server is running in port ${PORT}`)
    Connect_to_mongodb()
})