const mongoose = require("mongoose");
const chatSchema=mongoose.Schema(
    {
     message:{
        type:String,
     },
    image: {
    type:String,
    default:null,
       },
       audio:{
         type:String,
       },
     sender:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:'User'
     },
     receiver:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
     },
     status:{
      type:String,
      enum:['sent', 'delivered', 'seen'],
      default:"sent",
   }
    },
     {
        timestamps:true
     }
)
chatSchema.index({sender:1, receiver:1})

const Message=mongoose.model("Message",chatSchema)
module.exports=Message;