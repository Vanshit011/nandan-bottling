require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require('./routes/deliveryRoutes'); // ✅ Add this
// const billingRoutes = require("./routes/monthlybillsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_LIVE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use('/api/deliveries', deliveryRoutes); // ✅ Use this
// app.use("/api/billing", billingRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));