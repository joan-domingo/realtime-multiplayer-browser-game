"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const colyseus_1 = require("colyseus");
const MyRoom_1 = require("./MyRoom");
const port = Number(process.env.PORT || 4000);
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.resolve(__dirname, "dist")));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "dist/", "index.html"));
});
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    server,
});
gameServer.define("Room1", MyRoom_1.MyRoom);
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
