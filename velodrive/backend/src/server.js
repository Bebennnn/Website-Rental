const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VeloDrive Backend API running on http://localhost:${PORT}`);
});