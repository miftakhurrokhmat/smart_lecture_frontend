import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer } from "./server";
import { Server } from "socket.io";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);

      // Setup Socket.IO for real-time Live Session Engine
      if (server.httpServer) {
        const io = new Server(server.httpServer, {
          cors: { origin: "*" }
        });
        
        const activeUsersInRoom = new Map<string, Set<string>>(); // sessionId -> Set<userId>

        io.on("connection", (socket: any) => {
          console.log("Socket connected:", socket.id);
          
          // Expects data to be { sessionId, user? }
          socket.on("join-session", (data: any) => {
            const sessionId = typeof data === "string" ? data : data.sessionId;
            const user = data.user;
            
            socket.join(sessionId);
            console.log(`User ${socket.id} joined session ${sessionId}`);

            if (user && user.role === "mahasiswa") {
              if (!activeUsersInRoom.has(sessionId)) {
                activeUsersInRoom.set(sessionId, new Set());
              }
              activeUsersInRoom.get(sessionId)!.add(user.id);
              io.to(sessionId).emit("active-users-update", Array.from(activeUsersInRoom.get(sessionId)!));
              
              socket.data.sessionId = sessionId;
              socket.data.userId = user.id;
              socket.data.userRole = user.role;
            } else if (user && user.role === "dosen") {
              socket.data.sessionId = sessionId;
              socket.data.userId = user.id;
              socket.data.userRole = user.role;
              io.to(sessionId).emit("dosen-status", { online: true, timestamp: Date.now() });
            }
          });

          socket.on("dosen-ping", (data: any) => {
            io.to(data.sessionId).emit("dosen-status", { 
              online: true, 
              isRecording: data.isRecording ?? false,
              latency: data.latency || 24,
              timestamp: Date.now() 
            });
          });

          socket.on("dosen-audio-spectrum", (data: any) => {
            io.to(data.sessionId).emit("dosen-audio-spectrum-update", data);
          });

          socket.on("transcript-chunk", (data: any) => {
            io.to(data.sessionId).emit("transcript-update", data);
          });
          
          socket.on("chat-message", (data: any) => {
            io.to(data.sessionId).emit("chat-update", data);
          });

          socket.on("session-ended", (data: any) => {
            io.emit("session-ended", data);
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            const { sessionId, userId, userRole } = socket.data;
            if (sessionId && userId && userRole === "mahasiswa") {
              const roomUsers = activeUsersInRoom.get(sessionId);
              if (roomUsers) {
                roomUsers.delete(userId);
                io.to(sessionId).emit("active-users-update", Array.from(roomUsers));
              }
            } else if (sessionId && userRole === "dosen") {
              io.to(sessionId).emit("dosen-status", { online: false, isRecording: false, timestamp: Date.now() });
            }
          });
        });
      }
    },
  };
}
