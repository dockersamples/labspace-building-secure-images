const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(3000, () => console.log("App listening on port 3000"));

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });
});
