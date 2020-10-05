import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { MyRoom } from "./MyRoom";

const port = Number(process.env.PORT || 4000);
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("dist"));
//assuming app is express Object.
app.get("/", function (req, res) {
  res.sendFile("dist/index.html");
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("Room1", MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
