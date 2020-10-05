import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { Server } from "colyseus";
import { MyRoom } from "./MyRoom";

const port = Number(process.env.PORT || 4000);
const app = express();

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "dist")));

app.use(cors());
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist/", "index.html"));
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("Room1", MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
