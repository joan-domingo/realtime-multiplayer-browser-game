import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { ScifiRoom } from "./rooms/ScifiRoom";
import { ParkRoom } from "./rooms/ParkRoom";

const port = Number(process.env.PORT || 4000);
const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("park", ParkRoom).enableRealtimeListing();
gameServer.define("scifi", ScifiRoom).enableRealtimeListing();

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
