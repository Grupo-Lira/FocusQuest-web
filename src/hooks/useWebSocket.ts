import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {    
    const socketUrl = process.env.SOCKET_URL || "http://localhost:4000";
    const socketInstance = io(socketUrl, {
      auth: {
        id: "ID DO USUARIO", //Acho que dá para pegarmos do contexto do login de usuario
        email: "EMAIL"
      },          });

    setSocket(socketInstance);
    
    socketInstance.on("connect", () => {
      console.log("Conectado ao servidor Socket.io");          
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Desconectado do servidor Socket.io");
      setIsConnected(false);
    });
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
