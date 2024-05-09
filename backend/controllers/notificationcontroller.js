import Notification from "../models/notificationmodel.js"

export const getnotification=async(req,res)=>{
    const userId=req.user._id;
    try {
        const notification = await Notification.find({to:userId})
                                   .populate({path:"from",select:"username profileImg"});
        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notification);                           
    } catch (error) {
        console.log("Error in getnotification: ", error.message);
        res.status(500).json({ error: error.message });  
    }
}

export const deletenotification=async(req,res)=>{
    const userId=req.user._id;
    try {
        await Notification.deleteMany({to:userId});
        res.status(200).json({Message:"Notofications deleted successfully"});
    } catch (error) {
        console.log("Error in delete notification: ", error.message);
        res.status(500).json({ error: error.message });  
    }
}