const http = require('http');
const cors = require('cors');
const dotenv = require("dotenv");
const express = require('express');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const helmet = require('helmet');
const MaxUsers = require('./models/MaxUsers');
const { connectDB } = require('./loaders/database');

dotenv.config();

connectDB();

const app = express();
app.use(helmet());
app.use(cors({
    origin: '*'
}));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
    }
});

const rooms = {};

const loadInitialRoomData = async () => {
    const allMaxUsers = await MaxUsers.find();
    allMaxUsers.forEach(data => {
        const domain = data.domain;
        if (!rooms[domain]) {
            rooms[domain] = {
                activeUsers: 0,
                maxUsers: data.maxUsers,
                timestamp: data.timestamp
            };
        } else {
            rooms[domain].maxUsers = data.maxUsers;
            rooms[domain].timestamp = data.timestamp;
        }
    });
};

loadInitialRoomData();

io.on('connection', async (socket) => {
    const domain = socket.handshake.headers.origin;

    if (!rooms[domain]) {
        rooms[domain] = {
            activeUsers: 0,
            maxUsers: 0,
            timestamp: new Date()
        };
    }

    rooms[domain].activeUsers++;
    if (rooms[domain].activeUsers > rooms[domain].maxUsers) {
        rooms[domain].maxUsers = rooms[domain].activeUsers;
        rooms[domain].timestamp = new Date();
        await MaxUsers.findOneAndUpdate(
            { domain },
            { maxUsers: rooms[domain].maxUsers, timestamp: rooms[domain].timestamp },
            { upsert: true, new: true }
        );
    }

    socket.join(domain);

    io.to(domain).emit('traffic', {
        activeUsers: rooms[domain].activeUsers,
        maxUsers: rooms[domain].maxUsers,
        timestamp: rooms[domain].timestamp
    });

    socket.on('disconnect', () => {
        rooms[domain].activeUsers--;
        io.to(domain).emit('traffic', {
            activeUsers: rooms[domain].activeUsers,
            maxUsers: rooms[domain].maxUsers,
            timestamp: rooms[domain].timestamp
        });
    });
});

app.get('/traffic', async (req, res) => {
    const domain = req.headers.origin;

    const maxUserData = await MaxUsers.findOne({ domain });

    if (maxUserData) {
        res.json({
            activeUsers: rooms[domain].activeUsers,
            maxUsers: maxUserData.maxUsers,
            timestamp: maxUserData.timestamp
        });
    } else {
        res.status(404).json({ message: 'No data found for this domain' });
    }
});

server.listen(process.env.APP_PORT, () => {
    console.log(`Socket server is running on port ${process.env.APP_PORT}`);
});
