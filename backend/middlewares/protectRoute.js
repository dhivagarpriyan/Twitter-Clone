import User from "../models/usermodel.js";
import jwt from "jsonwebtoken"

export const protectRoute=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
         return res.status(400).json({error:"unauthorized:No token provided"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECERT);
        if(!decoded){
          return res.status(400).json({error:"Invalid Token"})
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
          return  res.status(400).json({error:"user not found"})

        }
        req.user=user;
        next();
    } catch (error) {
        console.log("Error in middleware controller",error.message);
      return  res.status(500).json({error:"internal server error"});
    }
   
}