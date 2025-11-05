const express=require("express");
const asyncHandler=require('express-async-handler')
const protect=require('../middleware/authMiddleware')
const Message = require('../models/Messages')
const multer = require('multer')
const MessageRouter=express.Router()
const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,`${file.originalname}`)
    }
    })
const upload=multer({storage:storage})

MessageRouter.get('/messages/:id', protect, async (req,res)=>{
    if (!req.user) {
        return res.status(400).json({ message: 'User not authenticated' });
    }
    const messages=await Message.find({
    $or:[
        {sender:req.user._id,receiver:req.params.id},
        {sender:req.params.id,receiver:req.user._id}
    ] 
    }).sort({createdAt:1})
    messages.status="seen"
    res.json(messages)
})

MessageRouter.delete('/messages/:id', protect, async (req,res)=>{
    if (!req.user) {
        return res.status(400).json({ message: 'User not authenticated' });
    }
    const messages=await Message.deleteMany({
    $or:[
        {sender:req.user._id,receiver:req.params.id},
        {sender:req.params.id,receiver:req.user._id}
    ] 
    })
    if(messages){
         res.status(200).json({success:true, message:'jj'})
    }
    else{
        res.json({message:"Messages are deleted"})
    }

})
MessageRouter.delete('/messages/message/:id', protect, async (req,res)=>{
    if (!req.user) {
        return res.status(400).json({ message: 'User not authenticated' });
    }
    const message=await Message.deleteOne({_id:req.params.id})
    if(message){
         res.status(200).json({success:true, message:'message deleted'})
    }
    else{
        res.json({message:"Messages are deleted"})
    }
})
        MessageRouter.post('/messages/:id', protect, upload.single('image'), asyncHandler(async (req,res)=>{
            try{
                const {message, image,audio}=req.body   
                const sender=req.user._id
                const receiver=req.params.id
                    const newMessage=new Message({
                        message,
                        receiver,
                        sender,
                        image,
                        audio,
                    })
                    await newMessage.save()
                    res.status(201).json(newMessage)           
            }
            catch(err){
                res.status(400).json({error:'Unable to send a message', details:err.message})
                throw new Error('Unable to send a message')
            }
            }))
MessageRouter.delete('/messages/receiver/:id', protect, async (req, res) => {
  try {
    const result = await Message.deleteMany({
      sender: req.user._id,
      receiver: req.params.id
    });
    if (result.deletedCount > 0) {
      res.status(200).json({ success: true, message: 'Sent messages deleted successfully.' });
    } else {
      res.status(404).json({ message: 'No sent messages found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sent messages.' });
  }
});
    MessageRouter.get('/messages/', async (req,res)=>{
    const messages=await Message.find({})
    res.json(messages)
})
module.exports=MessageRouter;