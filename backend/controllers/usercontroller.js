import Notification from "../models/notificationmodel.js";
import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getuserprofile=async(req,res)=>{
       const {username}=req.params;
       try {
          const user = await User.findOne({username}).select("-password");
          if(!user){
            return res.status(400).json({error:"user not found"});
        }
        res.status(200).json(user);
       } catch (error) {
        console.log("Error in getuserprofile controller",error.message);
        res.status(500).json({error:"internal server error"});
       }
};

export const followunfollowuser=async(req,res)=>{
    const {id}=req.params;
    try {
        const usertomodify=await User.findById(id);
        const currentuser=await User.findById(req.user._id);
        if(id === req.user._id.toString()){
            return res.status(400).json({error:"you cannot follow or unfollow yourself"});
        }

        if(!usertomodify || !currentuser){
           return res.status(400).json({error:"user not found"});
        }
        const isFollowing = currentuser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
            res.status(200).json({message:"unfollowed successfully"});
        }else{
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
            const newNotification=new Notification({
                type:"follow",
                from:req.user._id,
                to:usertomodify._id,
            });
            await newNotification.save();
            res.status(200).json({message:"followed successfully"})
        }
    } catch (error) {
        console.log("Error in followunfollowuser controller",error.message);
        res.status(500).json({error:"internal server error"});
    }
};


export const getsuggestedusers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		// 1,2,3,4,5,6,
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUser= async(req,res)=>{
    const {username,fullname,email,newPassword,currentPassword,bio,link}=req.body;
    let {profileImg,coverImg}=req.body;
    const userId=req.user._id;
    
    try {
        let user = await User.findById(userId);
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
           return res.status(400).json({error:"please provide both Currentpassword and Newpassword"})
        }
        if(currentPassword && newPassword){
            const ismatch = await bcrypt.compare(currentPassword,user.password);
            if(!ismatch){
                return res.status(400).json({error:"currentpassword is not correct"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error:"newpassword should have atleast 6 characters"})
            }
        }
        const salt = await bcrypt.genSalt(10);
         user.password = await bcrypt.hash(newPassword,salt);

         if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const updatedresponse = await cloudinary.uploader.upload(profileImg);
            profileImg = updatedresponse.secure_url;
         }
         if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const updatedresponse = await cloudinary.uploader.upload(coverImg);
            coverImg = updatedresponse.secure_url;
         }

         user.username = username || user.username;
         user.fullname = fullname || user.fullname;
         user.email = email || user.email;
         user.bio = bio || user.bio;
         user.link = link || user.link;
         user.profileImg = profileImg || user.profileImg;
         user.coverImg = coverImg || user.coverImg;

       user = await user.save();

       user.password = null;

       res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateuser: ", error.message);
		res.status(500).json({ error: error.message });
        
    }
}; 

export const updateuser = async (req, res) => {
	const { fullname, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullname = fullname || user.fullname;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};