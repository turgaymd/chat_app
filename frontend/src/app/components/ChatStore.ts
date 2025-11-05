  
import { useCallback,useContext } from "react";
import { User } from "./Chats";
import { Message } from "./Messages";
import { ApiContext } from "../ApiContext";
import { AuthContext } from "../AuthContext";

  type Props={
    selectedUser:User | null,
    setMessages:React.Dispatch<React.SetStateAction<Message[]>>,
    setAllMessages:React.Dispatch<React.SetStateAction<Message[]>>
  }
  export function useChatStore({selectedUser, setMessages, setAllMessages}:Props){
  const {apiUrl }=useContext(ApiContext)
  const {token } = useContext(AuthContext);
  const fetchingAll = useCallback(async () => {
    const response = await fetch(`${apiUrl}/api/messages/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setAllMessages(data);
  },[apiUrl, token, setAllMessages]);


  const fetching = async () => {
    const response = await fetch(`${apiUrl}/api/messages/${selectedUser?._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setMessages(data);
  };
  return {
    fetchingAll,
    fetching
  }
}