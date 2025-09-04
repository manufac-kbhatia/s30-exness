import { client as redis } from "@repo/redis";
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});
let wsConnections: WebSocket[] = [];

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  wsConnections.push(ws);
  console.log(wsConnections.length);

  ws.on("close", () => {
    wsConnections  = wsConnections.filter((e) => e !== ws);
    console.log(wsConnections.length);
  })
});

redis.subscribe("quote", (message) => {
    wsConnections.map((ws) => ws.send(message))
  });