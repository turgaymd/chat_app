import { useState, useContext, useRef, useEffect} from "react"
import { ApiContext } from "../ApiContext"
import { ThemeContext } from "../ThemeContext"
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import type { User } from "./Chats";
// import Image from "next/image";
import { AuthContext } from "../AuthContext";

type Props={
  setFilteredUsers:React.Dispatch<React.SetStateAction<User[]>>
}

const Settings=({setFilteredUsers}:Props)=>{
  const {apiUrl}=useContext(ApiContext)
  const {theme}=useContext(ThemeContext)
  const {user,setUser, token}=useContext(AuthContext)
  const isDark=theme==="dark";
  // const [newPassword, setNewPassword]=useState('')
  const [edit,setEdit]=useState(true)
  // const [about,setAbout]=useState(user?.about || 'change your thoughts and you change your world')
  const [image,setImage]=useState(user?.image || '')
  const [username,setUsername]=useState(user?.username || '') 
  const userId=user ? user._id : null
  const userRef=useRef<HTMLInputElement>(null)
  // const aboutRef=useRef<HTMLTextAreaElement>(null)
useEffect(()=>{
if(user){
  setUsername(user.username || '')
  setImage(user.image || '')
}
},[user])

    const handleImage = async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]
    if(!file) return;
    const formData=new FormData()
    formData.append('image', file)

    try{
 const result  = await axios.put(`${apiUrl}/api/profile/${userId}`, formData, {
        headers:{
         Authorization:`Bearer ${token}`,
        "Content-Type":"multipart/form-data",
        }
    })
     const newImage=result.data.user.image
     setImage(newImage)
     setUser((prevUser)=>(prevUser ? {...prevUser, image:newImage}: null))
     window.localStorage.setItem('userInfo',JSON.stringify({...user, image:newImage}))
     setFilteredUsers((prevUsers)=>prevUsers.map((item)=>
     item._id===userId ? {...item, image:newImage} : item))
     setEdit(false)
    }
    
    catch(err){
        console.log(err)
    } }

    const handleProfile=async(e:React.FormEvent)=>{
      e.preventDefault()
      try{
      await axios.put(`${apiUrl}/api/profile/${userId}`, {username}, {
          headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${token}`
          }
      })      
        window.localStorage.setItem('userInfo',JSON.stringify({...user, username}))
        setFilteredUsers((prevUsers)=>prevUsers.map((item)=>
        item._id===userId ? {...item, username} : item))      
         setEdit(true)  
         setUsername(username)
         console.log(username)
      }      
      catch(err){
          console.log(err)
      }
      }
      const handleEdit=()=>{
        setEdit(false)
        if(userRef.current){
          userRef.current.focus()          
        }   
      }
      const handleCancel=()=>{
        setEdit(true)
        setUsername(user?.username || '')
      }
    return (
 
        <>
        <div className="sidebar-left tab-pane fade" id="settings" role="tabpanel" aria-labelledby="settings-tab">
          <div className="header">
            <div className="mb-2 d-flex justify-content-between">
              <div>
                <h4>Settings</h4>
              </div>          
            </div>           
          </div>
        <div>
          <form onSubmit={handleProfile} id="prof">
             <>
              <div className={isDark ? 'user-profile border-secondary' : 'user-profile border-red'}>         
                <div className="profile-img d-flex justify-content-center">
                  <div className="position-relative">     
                    <img src={`${apiUrl}/${image}`} className={`rounded-circle avatar ${isDark ? 'border-lighted' :'border-grey'}`} alt="user" width={100} height={100} loading="lazy" /> 
                      <label htmlFor="image">
                      <input type="file"  name="image" id="image" accept="image/*"  onChange={handleImage}/>
                      <a className={isDark ? 'btn btn_light' : "btn btn_dark"}><CiEdit /></a>
                      {}
                      </label>
                  </div>
                </div>
              </div>
              <div className='user-content'>
                <div>
                <label className={theme==='light' ? 'text-muted' : 'text-mute'} htmlFor="username">Name</label> 
                  <input className={`${isDark ? 'background-light' : 'background-dark'} w-full  px-4 py-2 mt-2`}  ref={userRef}  value={username}    onChange={(e)=>setUsername(e.target.value)}  id="username" onKeyUp={()=>handleEdit()}/>         
                </div>
                {
                  edit ? 
                   <></>
                  :
                  <div className="d-flex mt-5 gap-3">
                     <button type="submit" className="px-5 py-2 btn btn-dark text-white">Update</button> 
                     <button  type="button" className="px-5 py-2 btn btn-danger text-white" onClick={handleCancel}>Cancel</button> 
                   </div>  
                }
              </div>
           </> 
          </form>
        </div> 
      </div>
 
        </>
    )
}
export default Settings;