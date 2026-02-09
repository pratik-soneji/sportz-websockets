import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.end("fvbifshv");
});

app.listen(8080, () => {
  console.log("app started at http://localhost:8080");
});
