require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const bodyParser = require("body-parser");

const authRoute = require("./src/routes/auth-route");
const authResidentRoute = require("./src/routes/auth-resident-route");
const setupRoute = require("./src/routes/account-setup-route");
const businessAccountRoute = require("./src/routes/business-account-route");
const residentsRoute = require("./src/routes/residents-route");
const residentAccountRoute = require("./src/routes/resident-account-route");
const campaignsRoute = require("./src/routes/campaigns-route");
const campaignMailRoute = require("./src/routes/campaign-mail-route");
const dashboardDetailsRoute = require("./src/routes/dashboard-details-route");
const supportRoute = require("./src/routes/support-route");
const envRout = require("./src/routes/env-route");

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("update", { message: "Hello from server" });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the Maildnd Server!");
});

app.use("/api/auth-business", authRoute);
app.use("/api/auth/resident", authResidentRoute);
app.use("/api/account-setup", setupRoute);
app.use("/api/business-account", businessAccountRoute);
app.use("/api/residents", residentsRoute);
app.use("/api/resident-account", residentAccountRoute);
app.use("/api/campaigns", campaignsRoute);
app.use("/api/mail", campaignMailRoute);
app.use("/api/dashboard", dashboardDetailsRoute);
app.use("/api/support", supportRoute);
app.use("/api/env", envRout);

const PORT = process.env.PORT || 4000;
console.log("PORT", PORT);
app.listen(PORT, () => {});
