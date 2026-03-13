
const express = require("express");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

app.listen(5000, () => {
    console.log("Salon API running on port 5000");
});
