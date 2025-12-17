// check if room exists
// return res in form {room,  files}

import { Room } from "../models/room.model.js"
import { File } from "../models/files.model.js"
import redis from "../utils/redisclient.js"


const joinroom=async (req,res)=>{
    try {
        const {roomcode}=req.body
        console.log(roomcode)
        
        
        const roomfound=await redis.get(`roombook:${roomcode}`)
        // const roomfound=await Room.find({roomcode:roomcode})
        console.log(roomfound)

        if(!roomfound){
            res.status(404).json({
                message:`${roomcode} not found`
            })
        }
        console.log("file")

        // const filesinroom=await File.findByroomid(roomcode)
        const filesinroom=await redis.hgetall(`room:${roomcode}`)
        const parsedredisdata=[]
        for(const file in filesinroom){
            if(file=="") continue
            const parsed=JSON.parse(filesinroom[file])
            
            parsedredisdata.push(parsed)
        }
        // const filesinroomparsed=await JSON.parse(filesinroom)
        console.log(parsedredisdata)
        res.status(200).send({
            room:roomcode,
            parsedredisdata
        })


    } catch (error) {
        console.log("Room controller :: joinroom"+error)
    }
}

const createroom=async (req,res)=>{
    try {
        const {roomcode, allowotherstodropdocs, time}=req.body
        const roomfound=await redis.get(`roombook:${roomcode}`)
        // const roomfound=await Room.find({roomcode:roomcode})
        console.log(time)
        console.log(roomfound)
        if(roomfound){
            res.status(401).json({
                message:`${roomcode} not available at the moment try another roomcode`
            })
            return
        }
    
        const roomcreated=await Room.create({
            roomcode,
            files:[],
            allowotherstodropdocs,
            createdAt:Date.now().toString(),
            activetill:Number(Date.now()+(time*60*1000))
        })
        // await redis.hset(`room:${roomcode}`,)
        await redis.set(`roombook:${roomcode}`,JSON.stringify(roomcreated),'EX',time*60)
        // .expire(`roombooked`,roomcode,600)

        res.status(200).json({
            room:roomcreated,
            message:`${roomcode} created successfully`
        })
    } catch (error) {
        console.log("room.controller :: createroom"+error)
    }
}

export {joinroom, createroom}