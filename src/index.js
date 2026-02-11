import http from "http"
import express, { json } from "express";
import { matchesRouter } from "./routes/matches.route.js";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(json())

app.get("/", (req, res) => {
  res.end("fvbifshv");
});
app.use("/matches",matchesRouter);

const { broadCastMatchCreated } = attachWebSocketServer(server)
app.locals.broadCastMatchCreated = broadCastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseURl = HOST === '0.0.0.0' ? `http://localhost:${PORT}`:`http://${HOST}:${PORT}`
  console.log(`Server Running On ${baseURl}`);
  console.log(`WEbsocket server is running on ${baseURl.replace('http','ws')}/ws`);
  
});
