const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const wss = new WebSocket.Server({
    server,
    maxPayload: 250 * 1024 * 1024
});

wss.on('connection', (socket) => {
    console.log('Client terhubung');

    socket.on('message', (message) => {
        for (const client of wss.clients) {
            if (
                client !== socket &&
                client.readyState === WebSocket.OPEN
            ) {
                client.send(message);
            }
        }
    });

    socket.on('close', () => {
        console.log('Client terputus');
    });

    socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
