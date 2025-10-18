const express=require('express')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const userRouter=express.Router()
const asyncHandler=require('express-async-handler')
const protect=require('../middleware/authMiddleware')
const multer = require('multer')
const bcrypt=require('bcryptjs')

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,`${file.originalname}`)
    }
    })
const upload=multer({storage:storage})
userRouter.post(
    '/login',  
    asyncHandler (async(req,res)=>{
    const {username,password}=req.body
    const user= await User.findOne({username})
if(user && (await bcrypt.compare(password, user?.password || ""))){
            res.json({
                _id:user._id,
                 username:user.username,
                 role:user.role,
                 image:user.image,
                 token:generateToken(user._id),
                 createdAt:user.createdAt,
              
            })
        }
        else{
                res.status(401)
                throw new Error("Invalid user data")
            }
        }))

            // userRouter.put('/profile/:id', protect, upload.single('image'), asyncHandler (async (req,res)=>{
            //     try{      
            //     const user=await User.findById(req.params.id)  

            //     await user.save()
            //     res.status(200).json({success:true, user})
            //     }
            //     catch(err){
            //     res.status(400)
            //     throw new Error('Unable to change a photo')
            //     }
            // }))

            userRouter.put('/profile/:id', protect, upload.single('image'), asyncHandler (async (req,res)=>{
                try{      
                 const  {username, password}=req.body     
                 const user=await User.findById(req.params.id)                 
                 if(username){
                    user.username=username
                 }
                   if(password){
                    user.password=password
                   }      
                   if(req.file){
                    user.image=req.file.path
                   }           
                 await user.save()
                 res.status(200).json({success:true, user})
                }
                catch(err){
                 res.status(400)
                 throw new Error('Unable to change user profile')
                }
             }))
            

            
userRouter.post('/auth',asyncHandler(async (req,res)=>{
const {username, email, password}=req.body
const userExist= await User.findOne({
   $or:[{username},{email}]
})
if(userExist){
    return res.status(401).json({error:"User already exists"})
}
let passwordRegex= /^(?=.*[!@._#+$^&*]).{8,}$/
let emailRegex=/^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/

if(!emailRegex.test(email)){
    return res.status(401).json({error:"Invalid Email format"})
}
if(!passwordRegex.test(password)){
    return res.status(401).json({error:"Password should be at least 8 characters and include one special character"})
}
    const user = await User.create({
        username,
        email,
        password,
    })

    if(user){
    res.status(201).json({
        _id:user._id,
        username:user.username,
        email:user.email,
        image:user.image,
        role:user.role,
        token:generateToken(user._id)
    })        
}

else{
    res.status(401)
    throw new Error('Validation failed')
}
}))




userRouter.delete('/users/:id', protect, async (req,res)=>{
          if(!req.user){
            return res.status(400).json({ message: 'User not authenticated' });
          }
          const deletedUser=await User.deleteOne({_id:req.params.id})
          if (deletedUser){
            res.status(200).json({success:true, message:'User deleted'})
          }
})

userRouter.get('/',async (req,res)=>{
    const users=await User.find({}).select("-password")
    res.json(users)
})



module.exports=userRouter;