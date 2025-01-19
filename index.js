const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const PORT = parseInt(process.env.PORT) || 5678;

server.listen(PORT, () => console.log(`Those Who Know Server listening at port ${PORT}.`));