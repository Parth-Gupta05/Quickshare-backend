import { File } from "../models/files.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import redis from "../utils/redisclient.js";
import fs from 'fs/promises'
import path from "path";

const logFilePath = path.join(process.cwd(), "log.txt");

export const writeFile = async (ip, message) => {
  try {
    await fs.appendFile(
      logFilePath,
      `\nIP: ${ip}, FileData: ${message}`
    );
  } catch (error) {
    console.error("Failed to write log:", error);
  }
};
// file accept
// store in local storage
// upload on cloudinary
// create metadata from cloudinary response: format, createdAt, pages, size(convert bytes to mb), fileUrl, originalfilename, ip
// store metadata at redis
// store metadata at mongodb

const fileupload=async (req,res)=>{
    try {
        console.log(req.files)
        const {roomcode, time}=req.body
        const fileslocalpath=req.files?.file
        console.log(req.files)
        // const fileslocalpath=req.files?.file?.[1]?.path
        // console.log(req.file.filename)
        // console.log(fileslocalpath)
        const uploadedfilesname=[]
        Object.keys(req.files).forEach(field => {
            req.files[field].forEach(file => {
                uploadedfilesname.push(file.filename)
            });
        });
    
        console.log(uploadedfilesname)
    
        const cloudinarypromise=fileslocalpath.map(file=> uploadOnCloudinary(file.path) )
        // const Cloudinaryfileurl=await Promise.all(cloudinarypromise)
        // fileslocalpath.forEach(async (file)=>{
        //     const responseCloudinary=await uploadOnCloudinary(file.path)
        //     Cloudinaryfileurl.push(await responseCloudinary)
        //     console.log(responseCloudinary)
        // })
    
        const cloudfiles=await Promise.allSettled(cloudinarypromise)
        // console.log(cloudfiles)
        const uploadcloudinarysuccess=[]
        const uploadcloudinaryfailed=[]
    
        cloudfiles.forEach(file => {
            if (file.status==="fulfilled") {
                uploadcloudinarysuccess.push(file.value)
            } else {
                uploadcloudinaryfailed.push(file.value)
            }
        });
    
        const metadataPromise=uploadcloudinarysuccess.map(file=>{return {format:file.format, createdAt:file.created_at, pages:file.pages, size:file.bytes, url:file.secure_url, originalName:file.original_filename, roomcode, ip:req.ip,public_id:file.public_id,resource_type:file.resource_type}})
        const metadata=await Promise.all(metadataPromise)
        
        const filesinroom=await File.create(metadata)
        console.log("here:"+filesinroom)
    
        //entry in room db
        const roomlogforfiles=filesinroom.map(file=>file.registerfileinroomcollection(roomcode))
        // await File.registerfileinroomcollection(roomcode)
        const logging=await Promise.all(roomlogforfiles)
        console.log(logging)
        await redis.set(`roombook:${roomcode}`,JSON.stringify(logging[logging.length - 1]),'EX',time*60)
    
        
        // await redis.hset(`room:${roomcode}`,`${metadate.oringinalname}`,JSON.stringify(metadata))
        const redispromise=metadata.map(file=> redis.hset(`room:${roomcode}`,`${file.originalName}`,JSON.stringify(file)))
        await Promise.all(redispromise).catch(err=>console.log(err))
    
        await redis.expire(`room:${roomcode}`,time*60)
    
        res.status(200).json({
            message:"ok",
            uploadedfilesname,
            metadata,
            uploadFailed:uploadcloudinaryfailed
        })
        await Promise.all(
            req.files.file.map(async (f)=>{ 
                try {
                    await fs.unlink(f.path)
                } catch (error) {
                    console.log("Failed to delete temp file:", f.path, err)
                } 
            })
        )
        

        await writeFile(req.ip,JSON.stringify(metadata))
        
        console.log(roomcode)
    } catch (error) {
        console.log("file.upload.contoller"+error)
        res.status(500).send({
            error
        })
    }
}

export {fileupload}