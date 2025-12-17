import mongoose from "mongoose";
import { Room } from "./room.model.js";

// files model completed wrote methods and statics need to update them if room methods needed

//sample:  {
//             "format": "pdf",
//             "createdAt": "2025-09-30T23:54:12Z",
//             "pages": 2,
//             "size": 94780,
//             "url": "https://res.cloudinary.com/dkutcr19r/image/upload/v1759276452/urh1fbqbaqolzjzrdox6.pdf",
//             "orignalname": "SSIC IE plan-1759276446358-980089446"
//         },

const fileSchema=mongoose.Schema({
    public_id:{
        type: String,
    },
    resource_type:{
        type: String
    },
    format:{
        type:String,
    },
    createdAt:{
        type:String,
    },
    pages:{
        type:Number,
    },
    size:{
        type:Number,
    },
    url:{
        type:String,
        unique:true,
    },
    originalName:{
        type:String,
    },
    roomcode:{
        type:String,
        required:true
    },
    ip:{
        type:String,
    },
},
{   methods:{
        registerfileinroomcollection:async function(roomcode){
            try {
                return await Room.findOneAndUpdate(
                    {roomcode:roomcode},
                    {$push:{files:this._id}},
                    {new:true}
                )
            } catch (error) {
                console.log("Failed in logging documents in room files :: files.model :: registerfileinroomcollection"+error)
            }
        }
    },
    statics:{
        findByroomid:async function (roomcode){
            try {
                return await this.find({roomcode:roomcode})
            } catch (error) {
                console.log(`Could not find files in room ${roomcode} :: files.model :: filesbyroomid`+error)
            }
        }
    }
}
)


export const File=mongoose.model('File',fileSchema)

