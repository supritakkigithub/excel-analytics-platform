const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
// If behind a proxy (e.g., Render/Heroku/Vercel), trust it so rate-limit can read client IP from X-Forwarded-For
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

// Basic health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.json({ ready: true }));

// Root route to handle GET /
app.get('/', (req, res) => { res.send('API is running...'); });

// Rate limiter for APIs (send standardized RateLimit-* headers)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clean', require('./routes/cleanRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Start DB and server + Socket.IO
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port 5000');
    });

    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
    });

    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('Socket connected', socket.id);
      socket.on('join:user', (userId) => { if (userId) socket.join(`user:${userId}`); });
      socket.on('join:admin', () => socket.join('admins'));
      socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
    });
  })
  .catch((err) => console.log(err));

module.exports = app;
