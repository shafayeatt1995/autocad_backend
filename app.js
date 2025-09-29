require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = parseInt(process.env.PORT || "8000", 10);

app.use(
  cors({
    origin: [process.env.BASE_URL, "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.json({ limit: "100mb" }));
app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});
app.use("/", require("./routes"));

app.listen(port, "0.0.0.0", () => {
  console.log(`> Server listening at http://localhost:${port}`);
});
