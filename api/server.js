const express = require('express');
const path = require('path');
const cors = require("cors");
const cookieParser = require("cookie-parser");

require('dotenv').config();

const { checkAPIHealth } = require("./services/checkAPIHealth.js")
const { verify, check } = require("./services/KYCverify.js")


const app = express();
// Init Middleware
app.use(express.json());
app.use(cookieParser())

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


app.get("/health", checkAPIHealth)
app.post("/kyc-verify", verify)

app.post("/kyc-check", check)

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = parseInt(Math.random() * 4000 + 1000);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
