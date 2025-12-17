import mongoose from "mongoose";
// room model completed needed to write methods and statics

const roomSchema=mongoose.Schema({

    roomcode:{
        type:String,
        unique:true
    },
    files:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"files"
    }],
    allowotherstodropdocs:{
        type:Boolean,
        default:false,
    },
    createdAt:{
        type:String,
    },
    activetill:{
        type:Number
    }

},
{
    statics:{
        findRoomByRoomcode:async function(roomcode){
            return await this.findOne({roomcode:roomcode})
        },
        changedroppermission:async function (roomcode) {
            return await this.findOneAndUpdate(
                {roomcode:roomcode},
                {allowotherstodropdocs:!allowotherstodropdocs},
                {new:true}
            )
        }
    }
})

export const Room =mongoose.model("Room",roomSchema)