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
        service: 'NUSANTARA LIVE'
    });
});

const wss = new WebSocket.Server({
    server,
    maxPayload: 150 * 1024 * 1024
});

wss.on('connection', socket => {

    console.log('Client terhubung. Total:', wss.clients.size);

    socket.send(JSON.stringify({
        type: 'SERVER_CONNECTED'
    }));

    socket.on('message', (message, isBinary) => {

        if (isBinary) return;

        let data;

        try {
            data = JSON.parse(message.toString());
        } catch (error) {
            console.log('Pesan JSON tidak valid');
            return;
        }

        if (!data || typeof data.type !== 'string') return;

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

        if (!allowedTypes.includes(data.type)) return;

        const outgoing = JSON.stringify(data);

        for (const client of wss.clients) {

            if (
                client !== socket &&
                client.readyState === WebSocket.OPEN
            ) {
                client.send(outgoing);
            }

        }

        console.log('Perintah diteruskan:', data.type);

    });

    socket.on('close', () => {
        console.log('Client terputus. Total:', wss.clients.size);
    });

    socket.on('error', error => {
        console.error('WebSocket error:', error.message);
    });

});

server.listen(PORT, '0.0.0.0', () => {

    console.log('================================');
    console.log(' NUSANTARA LIVE SERVER AKTIF');
    console.log(' Port:', PORT);
    console.log('================================');

});
