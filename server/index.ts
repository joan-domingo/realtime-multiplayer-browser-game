import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { MyRoom } from "./rooms/MyRoom";
import { Chat } from "./rooms/ChatRoom";

const port = Number(process.env.PORT || 4000);
const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("Room1", MyRoom);
gameServer.define("Chat", Chat).enableRealtimeListing();

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
