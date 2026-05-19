import AgentAPI from "apminsight";
AgentAPI.config();
import http from "http"
import express, { json } from "express";
import cors from 'cors';
import { matchesRouter } from "./routes/matches.route.js";
import { commentaryRouter } from "./routes/commentary.route.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleWare } from "./arcjet.js";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Replace 'http://localhost:5173' with your actual frontend URL if different
app.use(json())

app.get("/", (req, res) => {
  res.end("fvbifshv");
});
app.use(securityMiddleWare())
app.use("/matches", matchesRouter);
app.use("/matches/:id/commentary", commentaryRouter);

const { broadCastMatchCreated, broadCastCommentary } = attachWebSocketServer(server)
app.locals.broadCastMatchCreated = broadCastMatchCreated;
app.locals.broadCastCommentary = broadCastCommentary;

server.listen(PORT, HOST, () => {
  const baseURl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`
  console.log(`Server Running On ${baseURl}`);
  console.log(`WEbsocket server is running on ${baseURl.replace('http', 'ws')}/ws`);

});
