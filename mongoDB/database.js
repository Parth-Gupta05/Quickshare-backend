import mongoose from "mongoose";

export const databaseConnect=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}/quickshare`)
        console.log("Mongodb connected!!")
    } catch (error) {
        console.log("failed",error)
    }
}

