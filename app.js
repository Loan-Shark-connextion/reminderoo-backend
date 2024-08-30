const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Reminderoo API");
});

app.listen(port, () => {
  console.log(`Reminderoo server running on port ${port}`);
});
