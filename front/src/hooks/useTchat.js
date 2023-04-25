import { useContext } from "react";
import TchatContext from "../context/tchat";

const useTchat = () => {
    const { socket } = useContext(TchatContext);
    return useContext(TchatContext); 
}

export default useTchat;