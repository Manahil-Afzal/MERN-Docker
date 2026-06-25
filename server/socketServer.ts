import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";

export const initSocketServer = (server: Server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        socket.on("notification", (data) => {
            io.emit("newNotification", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
        });
    });
};

