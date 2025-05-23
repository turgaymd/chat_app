const { default: mongoose } = require("mongoose");
mongoose.set('strictQuery', false)
const chatSchema=mongoose.Schema(
    {
     message:{
        type:String,
        required:false,
     },
    image: {
   type:String,
   required:false,

       },
       audio:{
         type:String,
         required:false,
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
    },
     {
        timestamps:true
     }
)
chatSchema.index({sender:1, receiver:1})
chatSchema.pre("save", async function(next){
   next()
})
const Message=mongoose.model("Message",chatSchema)
module.exports=Message;