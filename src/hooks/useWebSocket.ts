import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://focusquest-backend-72376614461.us-central1.run.app";
    const socketUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        id: "ID DO USUARIO", //Acho que dá para pegarmos do contexto do login de usuario
        email: "EMAIL"
      },
    });

    setSocket(socketInstance);
    
    socketInstance.on("connect", () => {
      console.log("Conectado ao servidor Socket.io");          
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("Erro ao conectar no Socket.io:", error.message);
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
