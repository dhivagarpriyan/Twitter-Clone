import { generateTokenandSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/usermodel.js";
import bcrypt from "bcryptjs"

export const signup=async(req,res)=>{
    try {
        const {username,fullname,password,email}=req.body;

        const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid email format"})
        }
        
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error:"Username is already taken"})
        }
        const existingEmail=await User.findOne({email});
        if(existingEmail){
          return res.status(400).json({error:"Email is already taken"})
        }
        if(password.length < 6){
           return res.status(400).json({error:"password should have atleast 6 characters"})
        }
        const salt =await bcrypt.genSalt(10);
        const hashedpassword= await bcrypt.hash(password,salt);

        const newUser=new User({username,fullname,email,password:hashedpassword});
        if(newUser){
            generateTokenandSetCookie(newUser._id,res);
            await newUser.save()
            res.status(200).json({
                _id:newUser._id,
                username:newUser.username,
                fullname:newUser.fullname,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg
            });
        }else{
            res.status(404).json({error:"Invalid user data"})
        }

    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({error:"internal server error"});
    }
  
};

export const login=async(req,res)=>{
   try {
      
     const {username,password}=req.body;
     const user = await User.findOne({username});
     const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

     if (!user || !isPasswordCorrect) {
         return res.status(400).json({ error: "Invalid username or password" });
     }

     generateTokenandSetCookie(user._id,res);
     res.status(200).json({
        _id:user._id,
        username:user.username,
        fullname:user.fullname,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg
     });
   } catch (error) {
    console.log("Error in login controller",error.message);
    res.status(500).json({error:"internal server error"});
   }
}

export const logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({error:"internal server error"});
    }
}

export const getme=async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getme controller",error.message);
        res.status(500).json({error:"internal server error"});
    }
}