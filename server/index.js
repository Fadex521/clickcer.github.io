// Servidor básico con Node.js, Socket.io y MongoDB
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('../client'));
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://alex:nYenwZnOaBbZwYkS@cluster0.vi7d4cg.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String, // En producción, usar hash
    points: { type: Number, default: 0 }
}, { collection: 'fullgame' });
const User = mongoose.model('User', userSchema);

// Ruta de registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuario ya existe' });
    const user = new User({ username, password, points: 0 });
    await user.save();
    res.json({ success: true });
});

// Ruta para guardar puntos
app.post('/api/points', async (req, res) => {
    const { username, points } = req.body;
    try {
        await User.updateOne({ username }, { $set: { points } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'No se pudo guardar los puntos' });
    }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json({ success: true });
});

// Ruta para obtener puntos del usuario
app.post('/api/getpoints', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        res.json({ points: user ? user.points : 0 });
    } catch (e) {
        res.status(500).json({ error: 'No se pudo obtener los puntos' });
    }
});

// Ruta para obtener el ranking de mejores jugadores
app.get('/api/ranking', async (req, res) => {
    try {
        const top = await User.find({}, 'username points').sort({ points: -1 }).limit(10);
        res.json(top);
    } catch (e) {
        res.status(500).json({ error: 'No se pudo obtener el ranking' });
    }
});

io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado');
    // Aquí va la lógica de sincronización
});

server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
