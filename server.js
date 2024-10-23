import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn } from 'node-pty';
import os from 'os';

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));

// Start WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    
    const ptyProcess = spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env
    });

    // Send terminal output to the WebSocket
    ptyProcess.on('data', function (data) {
        ws.send(data);
    });

    // Send a message to the frontend when the terminal process exits
    ptyProcess.on('exit', (code, signal) => {
        console.log(`Terminal exited with code ${code} and signal ${signal}`);
        ws.send('TERMINAL_EXIT'); // Send exit signal to the frontend
        ws.close(); // Close WebSocket connection
    });

    // Receive input from WebSocket and send it to the terminal
    ws.on('message', function (msg) {
        ptyProcess.write(msg);
    });

    ws.on('close', () => {
        ptyProcess.kill(); // Kill terminal process if WebSocket closes
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
