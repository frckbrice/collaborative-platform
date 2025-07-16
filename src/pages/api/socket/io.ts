// import { NextApiResponseServerIo } from '@/lib/type';
// import { Server as NetServer } from 'http';
// import { Server as ServerIO } from 'socket.io';
// import { NextApiRequest } from 'next';

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };


// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
//     if (!res.socket.server.io) {
//         const path = '/api/socket/io';
//         const httpServer: NetServer = res.socket.server as any;
//         const io = new ServerIO(httpServer, {
//             path,
//             addTrailingSlash: false,
//         });
//         io.on('connection', (s) => {
//             s.on('create-room', (fileId) => {
//                 s.join(fileId);
//             });
//             s.on('send-changes', (deltas, fileId) => {
//                 console.log('QUILL CHANGE ');
//                 s.to(fileId).emit('receive-changes', deltas, fileId);
//             });
//             s.on('send-cursor-move', (range, fileId, cursorId) => {
//                 s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
//             });
//         });
//         io.engine.on("connection_error", (err) => {
//             console.log(err.req);      // the request object
//             console.log(err.code);     // the error code, for example 1
//             console.log(err.message);  // the error message, for example "Session ID unknown"
//             console.log(err.context);  // some additional error context
//         });
//         res.socket.server.io = io;
//     }
//     res.end();
// };

// export default ioHandler;
