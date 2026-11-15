'use strict';

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'NUSANTARA LIVE',
        websocket: 'enabled'
    });
});

const wss = new WebSocket.Server({
    server,
    maxPayload: 150 * 1024 * 1024
});

function broadcast(data, sender) {
    const message = JSON.stringify(data);

    for (const client of wss.clients) {
        if (
            client !== sender &&
            client.readyState === WebSocket.OPEN
        ) {
            client.send(message);
        }
    }
}

wss.on('connection', (ws, req) => {
    console.log('Client terhubung:', req.socket.remoteAddress);

    ws.send(JSON.stringify({
        type: 'SERVER_CONNECTED',
        message: 'Berhasil terhubung ke NUSANTARA LIVE'
    }));

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());

            if (!data || typeof data.type !== 'string') {
                return;
            }

            const allowedTypes = [
                'SET_HOST_VIDEO',
                'RESET_HOST_MEDIA',
                'PLAY_GIFT',
                'UPDATE_SLOT',
                'UPDATE_SLOT_MUTE',
                'SLOT_MUTE_UPDATE',
                'PLAY_SOUND',
                'STOP_SOUND'
            ];

            if (!allowedTypes.includes(data.type)) {
                return;
            }

            broadcast(data, ws);

            console.log('Perintah diteruskan:', data.type);

        } catch (error) {
            console.error('Pesan tidak valid:', error.message);
        }
    });

    ws.on('close', () => {
        console.log('Client terputus');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('================================');
    console.log(' NUSANTARA LIVE SERVER ONLINE');
    console.log(' Port:', PORT);
    console.log('================================');
});
