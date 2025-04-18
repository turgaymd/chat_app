import {  useContext, useEffect, useState } from "react";
import { ApiContext } from "../ApiContext";
import axios from "axios";
import { BsTrash,BsThreeDotsVertical } from "react-icons/bs";
import Image from "next/image";
import type { User } from "./Chats";
import { AuthContext } from "../AuthContext";
  
export type Message={
  _id:number,
  message:string,
  image:string,
  audio:string,
  sender:number,
  receiver:number,
  createdAt:string,
  isRead:boolean,
}

type MessageProps={
 user:User | null,
 theme:string,
 messages:Message[],
 onlineUsers:User[]
 setMessages:React.Dispatch<React.SetStateAction<Message[]>>
 setAllMessages:React.Dispatch<React.SetStateAction<Message[]>>
}

const Messages = ({ user, theme,  messages, setMessages, setAllMessages}:MessageProps) => {

  const {apiUrl} = useContext(ApiContext)
  const {token}=useContext(AuthContext)
  const [selectedMessage, setSelectedMessage] = useState<number>()
  const colors = theme ==='dark' ? 'text-white message-text' :'text-dark message-text'

useEffect(()=>{
setTimeout(()=>{
},1500)
  },[])

  const handleDelete=async()=>{
    try{
      await axios.delete(`${apiUrl}/api/messages/message/${selectedMessage}`, {
       headers:{
         "Content-Type":"application/json",
         "Authorization":`Bearer ${token}`
       }
      })
       setMessages((prevMessages)=>prevMessages.filter((message)=>message._id!==selectedMessage))
       setAllMessages((prevMessages)=>prevMessages.filter((message)=>message._id!==selectedMessage))
     }
     catch(err){
       console.log(err)
     }
     }
  return (
    <div className="messages">
    {
       <>
      {messages.length>0 ? (
         [...messages].sort((a:Message,b:Message)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime())
    .map((message:Message) => {
       
  return (
            <div key={message._id}  className={`message ${message.sender===user?._id  ? "justify-content-end" : "justify-content-start"}`} onClick={()=>setSelectedMessage(message._id)}>                 
              <ul>         
                <li className="dropdown">
                  <button className={`${colors} `} role="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" aria-label="dropdown">< BsThreeDotsVertical  fontSize={20} /></button>
                  <ul className={theme==='dark' ? 'background-light text-mute dropdown-menu' : 'background-dark text-muted dropdown-menu'} aria-labelledby="dropdownMenuButton" >               
                    <li className="dropdown-item"><a onClick={handleDelete} ><span><BsTrash fontSize={24}/></span>Delete</a></li>                 
                  </ul>
                </li>
              </ul>
              <div className={theme==='dark' ? 'background-light text-mute message-content d-flex gap-3' : 'background-dark text-muted message-content d-flex gap-3'}>
                {message.image  && 
                <a href={message.image} download className="position-relative"><Image src={message.image} alt="media"  width={200} height={200} />
                  <p className='d-flex justify-content-end pt-1'> {new Date(message.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p> 
                </a> }    
                <div className="d-flex gap-4">                      
                  {message.audio && <><audio src={message.audio}  preload="metadata"  controls  id="records"></audio></>             }
                  {message.message && <div className={colors}>{message.message}</div>  }                                                        
                  {!message.image && <p className='d-flex justify-content-end align-items-end pt-1'>  {new Date(message.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p>    }
                </div>  
                    {/* {
                      message.sender===user?._id ? <span className="text-muted pt-1"><BsCheck fontSize={24}/></span> :  <span className="text-muted"></span> 
                    }                 */}
              </div>    
            </div> 
      )        
  })
):
 <></>
}  
</> 
}
    </div>
  );
};
export default Messages;
