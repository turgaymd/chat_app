import { BsThreeDotsVertical, BsTrash } from "react-icons/bs";
import { CgUnblock } from "react-icons/cg";
import React, { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import axios from "axios"
import { BiSearch, BiBlock } from "react-icons/bi";
import  Swal from "sweetalert2";
import Image from "next/image";
import { ApiContext } from "../ApiContext";
import type { User } from "./Chats";
import { AuthContext } from "../AuthContext";


type Props={
  selectedUser:User | null,
  handleSearch:(e:React.FormEvent)=>void
  setSelectedUser:(selected:User)=>void
  filteredUsers:User[],
  setFilteredUsers:React.Dispatch<React.SetStateAction<User[]>>,
  setSearch:React.Dispatch<React.SetStateAction<string>>,
 
}

const Contacts=({handleSearch, filteredUsers, selectedUser,setSelectedUser, setSearch, setFilteredUsers}:Props)=>{
    const {apiUrl}=useContext(ApiContext)
    const [blocked,setBlocked]=React.useState<boolean>(false)
    const {token,user}=useContext(AuthContext)
    const {theme}=useContext(ThemeContext)

    const deleteUser=()=>{
        Swal.fire({
          title:"Delete contact",
          text:"Are you sure?",
          icon:"warning",
          showCancelButton:true,
          confirmButtonText:"Yes"          
        }).then((result)=>{
          if(result.isConfirmed){
            handleDelete()
          }
        })
      }

    const handleBlock=()=>{
      Swal.fire({
        icon:"error",
        text:"User blocked",
        timer:3000
      })
    setBlocked(true)
    }

    const handleUnblock=()=>{
      setBlocked(false)
      Swal.fire({
        title:"Block removed",
        icon:"success"  })   
    }

    const handleDelete= async ()=>{
      try{
        await axios.delete(`${apiUrl}/api/users/${selectedUser?._id}`,
          {
          headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
          }
        })
        setFilteredUsers(prevUsers=>(prevUsers.filter((user)=>user._id!==selectedUser?._id)))
        Swal.fire('User deleted successfully')
      }
      catch(err){
        console.error(err)
      }     
    }
    return (
        <>
          <div className="sidebar-left tab-pane fade" id="contacts" role="tabpanel" aria-labelledby="contacts-tab">
            <div className="header">
              <div className="mb-3 d-flex justify-content-between">
                <div>
                  <h4>Contacts</h4>
                </div>  
              </div>
              <form className="search-form d-flex align-items-center" onSubmit={handleSearch}>
                <input type="text" className={`${theme==='dark' ? 'background-light' : 'background-dark'} w-full  px-4 py-2`} placeholder="Search here..." onChange={(e)=>setSearch(e.target.value)}/>        
                <a type="submit" className="text-muted"> <BiSearch fontSize={24}/></a>
              </form>
            </div>
            <div className="sidebar-body">
              <div className="users">           
                {
                  filteredUsers.filter((item)=>item.username!==user?.username).map((user)=>{             
                return (        
                <div className={theme==='dark' ? 'user-profile border-secondary bs-light' : 'user-profile border-red bs-dark'}  onClick={()=> setSelectedUser(user)}  key={user._id}>
                  <div className="user position-relative d-flex justify-between" >
                    <div className="notifies d-flex pl-3 ">                     
                      <a className="position-relative">
                        <Image className="avatar" src="/user-profile.png"  alt="user"  priority={true}  width={60} height={60}/>{/* <span className="status"></span> */}
                      </a>              
                      <div className="d-flex flex-column justify-center">
                        <h5 className="text-truncate text-capitalize">{user.username}</h5>     
                      </div>      
                    </div>  
                    <ul>  
                      <li className="dropdown contact-actions">
                        <button className={theme==='dark' ? 'text-white' :'text-dark'} role="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" aria-label="dropdown">< BsThreeDotsVertical  fontSize={24} /></button>
                        <ul className={`${theme==='dark' ? 'background-light text-white' : 'background-dark text-muted'} dropdown-menu`} aria-labelledby="dropdownMenuButton" >
                          <li className="dropdown-item" >
                                  { blocked===true ? <a className="d-flex justify-content-between"  onClick={handleUnblock}>Unblock user <span><CgUnblock /></span></a>
                                    :     <a className="d-flex justify-content-between" onClick={handleBlock}>Block user <span><BiBlock  /></span></a> }
                          </li>
                          <li className="dropdown-item"><a className="d-flex justify-content-between">Delete user <span><BsTrash  onClick={deleteUser}/></span></a></li>       
                        </ul>
                      </li>
                    </ul>                        
                  </div>
                </div>
                )
                })
                }
              </div>
            </div>
          </div>
        </>
    )
}
export default Contacts;