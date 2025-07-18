// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { io as ClientIO } from 'socket.io-client';

// type SocketContextType = {
//   socket: any | null;
//   isConnected: boolean;
// };

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
// });

// export const useSocket = () => {
//   return useContext(SocketContext);
// };

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [transport, setTransport] = useState("N/A");

//   useEffect(() => {
//     const socketInstance = new (ClientIO as any)(
//       process.env.NEXT_PUBLIC_SITE_URL!,
//       {
//         path: '/api/socket/io',
//         addTrailingSlash: false,
//       }
//     );
//     socketInstance.on('connect', () => {
//       setTransport(socketInstance.transport);
//       setIsConnected(true);

//       socketInstance.on("upgrade", (transport: any) => {
//         setTransport(transport);
//       });
//     });

//     socketInstance.on('disconnect', () => {
//       setIsConnected(false);
//       setTransport("N/A");
//     });

//     socketInstance.on("connect_error", (err: any) => {
//       // the reason of the error, for example "xhr poll error"
//       // some additional description, for example the status code of the initial HTTP response
//       // some additional context, for example the XMLHttpRequest object
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };