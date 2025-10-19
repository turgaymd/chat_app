"use client";
import { BsEmojiSmile, BsImage, BsSend } from "react-icons/bs";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { useEffect, useRef } from "react";
import { useContext } from "react";
import { useState,useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { FaRegStopCircle, FaTrash } from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";
import axios from "axios";
import Messages from "../components/Messages";
import Header from "../components/Header";
import { socket } from "../Socket";
import { ApiContext } from "../ApiContext";
import Chats from "../components/Chats";
import Swal from "sweetalert2";
import emojii from "../emojis";
import type { Message } from "../components/Messages";
import type { User } from "../components/Chats";
import { AuthContext } from "../AuthContext";


function Chat() {
  const { theme } = useContext(ThemeContext);
  const [attach, setAttach] = useState<File | undefined>(undefined);
  const [image, setImage] = useState("");
  const [typing,setTyping]=useState(false)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [item, setItem] = useState("");
  const [record, setRecord] = useState<string>("") || null;
  const [muted, setMuted] = useState<boolean>(true);
  const [recording, setRecording] = useState<boolean>(false);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [users, setUsers] = useState([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount]=useState<number>(0)
  const { apiUrl } = useContext(ApiContext);
  const { user, token } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const mediaRecorder = useRef<MediaRecorder>(null);
  const mediaStream = useRef<MediaStream>(null);
  const chunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleSize = () => {
      if (showSidebar && window.innerWidth <= 768) {
        setShowChat(false);
      } else {
        setShowChat(true);
      }
    };
    handleSize();
    window.addEventListener("resize", handleSize);
    if (user) {
      socket.emit("join", user._id, user.username);
      socket.on("online", (users) => {
        setOnlineUsers(users);
      });
    }
    return ()=>{
      window.removeEventListener('resize', handleSize)
    }
  }, [user, showSidebar]);


  const fetchingAll = useCallback(async () => {
    const response = await fetch(`${apiUrl}/api/messages/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setAllMessages(data);
  },[apiUrl, token,setAllMessages]);
  const fetching = async () => {
    const response = await fetch(`${apiUrl}/api/messages/${selectedUser?._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setMessages(data);
  };
    useEffect(() => {
      fetchingAll()
    fetch(`${apiUrl}/api/`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      });
  }, [apiUrl, fetchingAll]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }
    fetching()
    socket.on("message", (data) => {
      setMessageCount((prevCount)=>(prevCount+1))
      if (data.sender === selectedUser._id) {
        setMessages((prevMessage) => {
          if (!prevMessage.some((item) => item._id === data._id)) {
          
            return [...prevMessage, data];
          }
          return prevMessage;
        });
      }
    });
    socket.on('typing', ( data)=>{
      if(data.sender===selectedUser?._id && data.receiver===user?._id){
        setTyping(true)
        setTimeout(()=>{
          setTyping(false)
        },3000)
      }
      })

   
  //  const interval= setInterval(()=>{
  //     fetching()     
  //   },5000)
    return () => {
      socket.off("message");
      socket.off('typing')
      // clearInterval(interval)
    };

  
  }, [selectedUser, token, apiUrl]);

  const handleCancel=()=>{
    setRecording(false)
    if(record){
      URL.revokeObjectURL(record)
    }
    setRecord('')
  }
  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    const file = e.target.files?.[0];
    setAttach(file);
    if (file) {
      formData.append("image", file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudio = async () => {
    setItem('');
    setRecording(true);
    try {
      setTimer(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      const timers = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/mp3" });
        const audioURL = URL.createObjectURL(blob);
        setRecord(audioURL);
        chunks.current = [];
        clearInterval(timers);
      };
      mediaRecorder.current.start();
    } catch (err) {
      console.log(err);
    }
  };
  const handleStop = () => {
    setRecording(false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaStream.current?.getTracks().forEach((track) => track.stop());
    }
  };

  const handleEmojis = (e: React.MouseEvent<HTMLButtonElement>) => {
    const emoji = e.target as HTMLButtonElement;
    setItem((prev)=>prev+emoji.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!item && !image && !record) return;
    setTyping(false)
    if (blocked === false) {
      if (audioRef.current !== null && muted === false) {
        audioRef.current.play();
      }
      const formData = new FormData();
      formData.append("message", item);
      formData.append("image", image);
      formData.append("audio", record);
      if (user) {
        formData.append("sender", user._id.toString());
      }
      try {
        const response = await axios.post(
          `${apiUrl}/api/messages/${selectedUser?._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        const data = response.data;
        setMessages((prevMessage) => [...prevMessage, data]);
        setAllMessages((prevMessage) => [...prevMessage, data]);
        socket.emit("message", formData);
      } catch (err) {
        console.log(err);
      }
      setItem("");
      setImage("");
      setRecord("");
      setBlocked(false)
      setAttach(undefined);
    } else {
      Swal.fire({
        icon: "error",
        title: "User blocked",
        text: "You can't send message to this user",
        timer: 3000,
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2,"0")}`;
  };

  const handleTyping=(e:React.KeyboardEvent<HTMLInputElement>)=>{
    socket.emit("typing", {receiver: selectedUser?._id, sender:user?._id})
    if(e.key==="Enter"){
      setTyping(false)
    }
  }
  return (
    <>
      <div>
        <div className="chat-row d-flex">
          {showSidebar ? (
            <>
              <Sidebar />
              <Chats
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                setShowSidebar={setShowSidebar}
                users={users}
                messageCount={messageCount}
                filteredUsers={filteredUsers}
                setFilteredUsers={setFilteredUsers}
                allMessages={allMessages}
                setShowChat={setShowChat}
              />
            </>
          ) : (
            <></>
          )}
          {showChat === true ? (
            <>
              <div className={ `${theme === "dark" ? "chatDark" : "chatLight"} chat-body`} id="chatbody">
                {selectedUser ? (
                  <>
                    <Header
                      theme={theme}
                      muted={muted}
                      setMuted={setMuted}
                      selectedUser={selectedUser}
                      setMessages={setMessages}
                      onlineUsers={onlineUsers}
                      setAllMessages={setAllMessages}
                      typing={typing}
                      fetchingAll={fetchingAll}
                      setShowSidebar={setShowSidebar}
                      setShowChat={setShowChat}
                   
                    />
                    <div className="conversation-body overflow-auto text-center">
                      <Messages
                        messages={messages}
                        user={user}
                        theme={theme}
                        setMessages={setMessages}
                        onlineUsers={onlineUsers}
                        setAllMessages={setAllMessages}
                      />
                    </div>
                    <div className={`${ theme === "dark" ? "borderDark" : "borderLight"} msg-body p-3 p-lg-4`}>               
                      <form onSubmit={handleSubmit} className={ theme === "dark" ? "form-dark" : "form-light"}>                     
                        <div className="d-flex align-items-center justify-center">
                        {recording ? (
                          <>
                           <div className="d-flex gap-2 align-items-center">
                           Recording ... 
                           <div className="btn d-flex justify-center align-items-center rounded">
                               {formatTime(timer)}
                             </div>
                             <button className="btn btn-primary" aria-label="stop" onClick={handleStop} >
                             <FaRegStopCircle fontSize={24} />
                             </button>
                             <button className="btn btn-danger"  aria-label="cancel" onClick={handleCancel}><FaTrash fontSize={24}/></button>
                           </div>
                          </>
                    ) : (
                      <>
                          <div className="col-md-2 justify-content-center align-items-center icons">                        
                            <div className="d-flex justify-content-center align-items-center">        
                              <label htmlFor="files">
                                <a className="btn rounded-circle text-white">
                                  <BsImage fontSize={28} />
                                </a>
                                <input type="file" id="files" onChange={handleAttach} accept="image/*"/>
                                {}
                              </label>                             
                              <div className="dropup">
                                <a className="btn rounded-circle text-white" data-bs-toggle="dropdown" id="emojiMenu"> <BsEmojiSmile fontSize={28} />{" "}</a>
                                <ul className="dropdown-menu emoji-menu" aria-labelledby="emojiMenu">
                                  {emojii.map((emoji) => {
                                  return (
                                  <li className="dropdown-item" key={emoji.id}>
                                  <button className="btn" type="button" onClick={(e) => handleEmojis(e)} value={emoji.text} > {emoji.text}</button>
                                    </li>
                                    );
                                    })}
                                  </ul>                                
                              </div>                                            
                            </div>                        
                          </div>
                          <div className={`${theme === "dark" ? "background-light text-mute": "background-dark text-muted"} d-flex col-md-9 align-items-center gap-2 py-2 px-4 rounded-lg`}>
                              <>
                              {attach  ? (
                              <p className="attached">Image</p>
                            ) : (
                             <></>
                            )}  
                              {record ? (
                              <p className="attached"> Audio</p>
                            ) : (
                             <></>
                            )} 
                              <input type="text" value={item} className="w-full py-2 rounded-lg " placeholder="Write a message..." id="msg" onChange={(e) => setItem(e.target.value)} onKeyDown={handleTyping}/>                        
                              <button type="button" className="position-relative" aria-label="audio">
                              <HiOutlineMicrophone onClick={handleAudio} className="text-3xl" id="record"/>
                              </button>
                              </>                                                                                                       
                            <audio src="beep.mp3" ref={audioRef}></audio>
                            <button type="submit" className="pr-2.5 " aria-label="send"> <BsSend className="stopped text-2xl" /></button>
                          </div>
                          </>)}                   
                        </div>                
                      </form>                    
                    </div>
                  </>              
                ) : <>
                    <div className="starting">
                      <h2 className="text-center text-white"> Select a chat to start conversation</h2>
                    </div>                
                </>}
              </div>
            </>
          ) : (
            <>
            </>
          )}
        </div>
      </div>
    </>
  );
}
export default Chat;
