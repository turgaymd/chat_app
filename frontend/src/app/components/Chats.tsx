
import { BiSearch } from "react-icons/bi";
import { useState, useContext} from "react";
import { ThemeContext } from "../ThemeContext";
import Settings from "./Settings";
import Contacts from "./Contacts"
import type { Message } from "./Messages";
import { AuthContext } from "../AuthContext";

import { ApiContext } from "../ApiContext";
export type User={
    _id:string,
    username?:string,
    token:string,
    status:string,
    image:string
}

type Props={
    users:User[],
    selectedUser:User | null,
    allMessages:Message[],
    filteredUsers:User[],
    messageCount:number,
    setFilteredUsers:React.Dispatch<React.SetStateAction<User[]>>,
    setSelectedUser:(selected:User)=>void,
    setShowSidebar:(showSidebar:boolean)=>void,
    setShowChat:(showChat:boolean)=>void
}

export type chatUser=User & {lastMessage?:Message}
const Chats=({allMessages, selectedUser,setSelectedUser, messageCount,  filteredUsers,setFilteredUsers, users}:Props)=>{
const {theme}=useContext(ThemeContext)
const {user}=useContext(AuthContext)
const [search, setSearch]=useState('')
const {apiUrl}=useContext(ApiContext)

const chatUsers= allMessages.length>0 ? users.filter((u:chatUser)=> allMessages.some(
    (message:Message)=>
      (message.sender===user?._id && message.receiver===u._id) ||
      (message.sender===u?._id && message.receiver===user?._id)) 

) : users

 const filterUsers = search.trim() ? chatUsers.filter((item)=>item?.username?.toLocaleLowerCase().includes(search.toLocaleLowerCase())) : chatUsers
    return(
        <>
          <div className={`${theme==='dark' ? 'darkBg': 'ligthBg'} col-md-3 col-12 chats tab-content`} id="nav-tabContent" >
            <div className="sidebar-left tab-pane fade show active" id="chat" role="tabpanel" aria-labelledby="chat-tab">
              <div className="header">
                <div className="mb-4">
                  <h4>Chats</h4>
                </div>          
                <form className="search-form d-flex align-items-center">
                  <input type="text" className={`${theme==='dark' ? 'background-light' : 'background-dark'} w-full  px-4 py-2`} placeholder="Search here..." onChange={(e)=>setSearch(e.target.value)}/>        
                  <a type="submit" className=" text-muted"> <BiSearch fontSize={24}/></a>
                </form>
              </div>     
             <div className="sidebar-body">
               <div className="users"> 
                {
                filterUsers.map((item)=>{                            
                return (        
                <div className={theme==='dark' ? 'user-profile border-secondary bs-light' : 'user-profile border-red bs-dark'} 
                onClick={()=> setSelectedUser(item)}
                
            key={item?._id}>
                  <div className="user position-relative">
                  {item?.username!==user?.username && ( 
                    <>
                    <div className="d-flex align-items-center justify-content-between">                 
                      <div className="notifies d-flex pl-3 justify-content-between">                                     
                        <a className="position-relative">
                          <img src={`${apiUrl}/${item?.image}`}  className="avatar"  alt="user" width={100} height={100}/>
                        </a>              
                       <div className="d-flex flex-column justify-center">                     
                        <h5 className="text-truncate">{item?.username}</h5>  
                       {/* <div className='overflow-hidden text-ellipsis last-message'>
                        {item?.lastMessage?.sender}
                      
                      </div> */}
                    </div>      
                  </div>             
                    <div>
                      {/* {
                       item?.lastMessage ?  <h5 className="sented">{new Date(item?.lastMessage.createdAt).toLocaleTimeString('en-US', { hour:"numeric",minute:"numeric"})}</h5> : ''
                      } */}
                     <div>
                      {messageCount>0  ? <span className="message-count d-none">{messageCount}</span> : ''}
                </div>
              </div>
       
          </div>
           </>
                  )
                }
        </div>
         </div>
)})
  }
   </div>
   </div>
   </div>
<Contacts filteredUsers={filteredUsers} setFilteredUsers={setFilteredUsers}  selectedUser={selectedUser} setSelectedUser={setSelectedUser} setSearch={setSearch}/>
<Settings setFilteredUsers={setFilteredUsers}/>
        </div>
        </>
    )
}
export default Chats;