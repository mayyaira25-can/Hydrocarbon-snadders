const express = require('http');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// State Game
let players = [];
let boardState = {}; // Menyimpan posisi pion pemain

io.on('connection', (socket) => {
    console.log(`Pemain terhubung: ${socket.id}`);

    socket.on('join-game', (playerName) => {
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF5'];
        const playerColor = colors[players.length % colors.length];
        
        const newPlayer = {
            id: socket.id,
            name: playerName,
            position: 1,
            color: playerColor
        };

        players.push(newPlayer);
        io.emit('update-players', players);
    });

    socket.on('roll-dice', () => {
        const diceValue = Math.floor(Math.random() * 6) + 1;
        const player = players.find(p => p.id === socket.id);
        
        if (player) {
            player.position += diceValue;
            if (player.position > 35) player.position = 35; // Kotak Max 35 sesuai board

            // Simulasi Tangga & Ular Sederhana
            const snakesAndLadders = {
                5: 15,  // Tangga
                12: 8,  // Ular
                20: 28, // Tangga
                30: 22  // Ular
            };

            if (snakesAndLadders[player.position]) {
                player.position = snakesAndLadders[player.position];
            }

            io.emit('update-players', players);
            io.emit('dice-rolled', { playerName: player.name, diceValue, newPos: player.position });
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('update-players', players);
        console.log(`Pemain terputus: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Hydro Snadders berjalan di port ${PORT}`));
