const jwt= require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler=require('express-async-handler')
const protect=asyncHandler (async (req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try{
  token=req.headers.authorization.split(' ')[1]
  const decoded=jwt.verify(token,process.env.SECRET_CODE)
  req.user=await User.findById(decoded.id).select("-password")
  if(!req.user){
    res.status(401)
    throw new Error("User not found")
  }
  next()
    }

    catch(err){
        console.error(err)
        res.status(401)
        throw new Error("Not authorized")
    }
}
if(!token){
    res.status(401)
    throw new Error("Not authorized, no token")
}
})
module.exports=protect