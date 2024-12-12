const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require('cors')

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
// middlewares

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions))

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// routes
const apiRouter = require("./src/routes/apiRouter");
// index route
// app.use("/", (req, res, next) => {
//   res.render("index");
// });
app.use("/api", apiRouter);

// error handler
app.use(function (err, req, res, next) {
  const { error, status, message } = err;

  return res.status(status || 500).json({
    status: status.toString().startsWith("4") ? "failure" : "error",
    message: message
      ? message
      : error
        ? `${error.name} - ${error.message}`
        : "",
  });
});

module.exports = app;
