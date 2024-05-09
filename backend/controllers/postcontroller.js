import Notification from "../models/notificationmodel.js";
import Post from "../models/postmodel.js";
import User from "../models/usermodel.js";
import { v2 as cloudinary } from "cloudinary";

export const createpost=async(req,res)=>{
   const {text}=req.body;
   let{img}=req.body;
   const userId = req.user._id.toString();
   try {
    const user = await User.findById(userId);
    if(!user) return res.status(400).json({error:"user not found"});
    if(!text && !img){
        return res.status(400).json({error:"post should have text or image"});

    }
    if(img){
        const updatedresponse = await cloudinary.uploader.upload(img);
        img=updatedresponse.secure_url;
    }

    const newPost = new Post({
        user:userId,
        text,
        img
    });

    await newPost.save();

    res.status(200).json(newPost);
    
   } catch (error) {
    console.log("Error in createpost: ", error.message);
    res.status(500).json({ error: error.message });  
   }  
}

export const deletepost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({error:"post not found"});
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(400).json({error:"you` are not authorized to delete post"})
        }
        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message:"post deleted successfully"});
    } catch (error) {
        console.log("Error in deletepost: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const commentonpost = async(req,res)=>{
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
        
        if(!text){
            return res.status(400).json({error:"textfield is required"});
        }
        const post = await  Post.findById(postId);
        if(!post){
            return res.status(400).json({error:"post not found"});
        }
        const comment = {user:userId, text};

         post.comments.push(comment);

        await post.save();

        res.status(200).json(post);

    } catch (error) {
        console.log("Error in commentonpost: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const likeunlikepost=async(req,res)=>{
   try {
      const userId=req.user._id;
      const postId=req.params.id;

      const post= await Post.findById(postId);

      if(!post){
        return res.status(400).json({error:"post not found"});
      }

      const userlikedpost = post.likes.includes(userId);

      if(userlikedpost){
        await Post.updateOne({_id:postId},{$pull:{likes:userId}});
        await User.updateOne({_id:userId},{$pull:{likedposts: postId}});
        const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
      }else{
        post.likes.push(userId);
        await User.updateOne({_id:userId},{$push:{likedposts:postId}});
        await post.save();

        const notification = new Notification({
            from:userId,
            to:post.user,
            type:"like"
        });

        await notification.save();

        const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);

        
    }

   } catch (error) {
    console.log("Error in likeunlikepost: ", error.message);
    res.status(500).json({ error: error.message });    
  }
}

export const getallpost=async(req,res)=>{
    try {
        
        
        const posts= await Post.find().sort({createdAt:-1})
        .populate({path:"user",select:"-password"})
        .populate({path:"comments.user",select:"-password"});
      
        if(posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getallpost: ", error.message);
        res.status(500).json({ error: error.message });  
    }
}

export const getlikedpost=async(req,res)=>{
    const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedposts = await Post.find({ _id: { $in: user.likedposts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedposts);                              
    } catch (error) {
        console.log("Error in getlikedpost: ", error.message);
        res.status(500).json({ error: error.message });  
    }
}

export const getfollowingpost=async(req,res)=>{
    try {
        const userId=req.user._id;
        const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);

    } catch (error) {
        console.log("Error in getfollowingpost: ", error.message);
        res.status(500).json({ error: error.message });  
    }
}

export const getuserposts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getuserposts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};