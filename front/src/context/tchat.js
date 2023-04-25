import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client"
import useAuth from 'hooks/useAuth';
const TchatContext = createContext({});
export const TchatProvider = ({ children }) => {
    const { auth, setAuth } = useAuth();
    const [socket, setSocket] = useState()
    const [allmessages, setAllMessages] = useState([])
    useEffect(() => {
      let isMounted = true 
        if(auth?.token && !auth?.joinedTchat && !socket?.connected && isMounted) {
            setSocket(io(process.env.REACT_APP_BASE_URL), {
                withCredentials: true,
                extraHeaders: {
                  "jwt": "test"
                }
              });
            setAuth(prev => {
                return {
                    ...prev,
                    joinedTchat: true
                }
            });
         }
        if(socket && isMounted) {
              socket.on("connect", () => {
              socket.emit("enter_room", "french");
               });
               socket.on("init_messages", msg => {
                setAllMessages([]);
                if(msg.messages){
                 msg.messages.forEach((el, i) => {
                   setAllMessages(prev => [...prev, el]);
                  })
                  }}
               );
              }
              return () => {
                isMounted = false
               }
      }, [auth?.token, auth?.joinedTchat])
    return (
        <TchatContext.Provider value={{ socket, setSocket, allmessages, setAllMessages }}>
            {children}
        </TchatContext.Provider>
    )
}        

export default TchatContext;