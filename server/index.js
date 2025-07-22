const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Online users mapping
const onlineUsers = new Map();

io.use((socket, next) => {
    // const token = socket.handshake.auth.token;
    // if (!token) {
    //     return next(new Error('Authentication error'));
    // }
    // You can verify the token here if needed
    next();
});




app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Import Message model
const Message = require('./models/Message');

// Unified Socket.IO setup
io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    onlineUsers.set(userId, socket.id);
    console.log('A user connected:', socket.id);

    // Broadcast user's online status
    socket.broadcast.emit('user_status', { userId, status: 'online' });

    // Handle legacy 'message' event (direct message with notification)
    socket.on('message', async (message) => {
        const recipientSocket = onlineUsers.get(message.to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('message', message);
            // Send notification if the chat isn't open
            if (!message.isRead) {
                io.to(recipientSocket).emit('notification', {
                    from: message.from,
                    content: message.content,
                    timestamp: message.timestamp
                });
            }
        }
    });

    // Real-time messaging (save to DB and broadcast)
    socket.on('sendMessage', async (data) => {
        // data: { sender, receiver, content }
        const { sender, receiver, content } = data;
        const message = new Message({ sender, receiver, content });
        await message.save();
        io.emit('receiveMessage', {
            sender,
            receiver,
            content,
            timestamp: message.timestamp,
            isRead: message.isRead // <-- include read status
        });
        console.log('Emitted receiveMessage');
    });

    // Typing indicator (both legacy and new)
    socket.on('typing', (data) => {
        // data: { to, from } or { from, to }
        const to = data.to || data.receiver;
        const from = data.from || data.sender;
        const recipientSocket = onlineUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('typing', { from });
        } else {
            // Fallback: broadcast to all (legacy)
            io.emit('typing', { from, to });
        }
    });

    // Read messages event
    socket.on('read_messages', async ({ from, to }) => {
        try {
            await Message.updateMany(
                { sender: from, receiver: to, isRead: false },
                { $set: { isRead: true } }
            );
            const recipientSocket = onlineUsers.get(from);
            if (recipientSocket) {
                io.to(recipientSocket).emit('messages_read', { by: to });
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user_status', { userId, status: 'offline' });
        console.log('User disconnected:', socket.id);
    });
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://lakshmitanmaikavuru:tanmai1234@cluster0.xykuzte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

 