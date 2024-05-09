import mongoose from "mongoose";

const Connect_to_mongodb = async() => {
   try {
      const connect=await mongoose.connect(process.env.MONGO_URI);
      console.log(`Mongodb connect:${connect.connection.host}`)
   } catch (error) {
    console.error(`ERROR:connecting to mongodb ${error.message}`)
   }
}

export default Connect_to_mongodb