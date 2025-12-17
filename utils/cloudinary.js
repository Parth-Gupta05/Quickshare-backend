import dotenv from "dotenv";
dotenv.config(); // ✅ ensure envs are loaded first

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    secure:true,
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

export const uploadOnCloudinary=async (localfilepath)=>{
    try {
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        console.log("File uploaded on Cloudinary",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove locally stored file
        return error
    }
}

export const deleteFromCloudinary = async (resource_type, public_id) => {
  try {
    if (!resource_type || !public_id) return;

    // Extract public_id from Cloudinary URL
    // Example:
    // https://res.cloudinary.com/<cloud>/image/upload/v1234567/myfile_xyz.pdf
    // public_id = myfile_xyz (without extension)
    // const parts = fileUrl.split("/");
    // console.log(parts)
    // const filename = parts[parts.length - 1]; // "myfile_xyz.pdf"
    // console.log(filename)
    // const publicId = filename.substring(0, filename.lastIndexOf(".")); // "myfile_xyz"
    // const filetypeparts = filename.split(".")
    // const extension = filetypeparts.at(-1).toLowerCase();

// const resourceType =
//   ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
//     ? "image"
//     : ["mp4", "mov", "avi", "webm"].includes(extension)
//     ? "video"
//     : "raw";
    // console.log(resourceType)
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });

    console.log("Deleted from Cloudinary:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return null;
  }
};