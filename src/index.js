import express, { json } from "express";
import { matchesRouter } from "./routes/matches.route.js";


const app = express();
app.use(json())

app.get("/", (req, res) => {
  res.end("fvbifshv");
});
app.use("/matches",matchesRouter);
app.listen(8080, () => {
  console.log("app started at http://localhost:8080");
});
