import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { MyRoom } from "./MyRoom";

const port = Number(process.env.PORT || 4000);
const app = express();

//ENABLE CORS
app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("Room1", MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
