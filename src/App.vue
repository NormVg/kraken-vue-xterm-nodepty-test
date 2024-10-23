<template>
  <div ref="terminal"></div>
</template>

<script>
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

export default {
  mounted() {
    const terminal = new Terminal();
    terminal.open(this.$refs.terminal);

    // Connect to the WebSocket server
    const socket = new WebSocket('ws://localhost:8080');

    // Display data received from the server in the terminal
    socket.onmessage = (event) => {
      if (event.data === 'TERMINAL_EXIT') {
        this.handleTerminalExit();  // Call frontend function when terminal exits
      } else {
        terminal.write(event.data);
      }
    };

    // Send terminal input to the server
    terminal.onData(data => {
      socket.send(data);
    });
  },
  methods: {
    handleTerminalExit() {
      alert("The terminal process has exited!");  // Example action
      // You can replace this with any action you want to run after terminal exit
    }
  }
};
</script>

<style>
div {
  width: 100%;
  height: 100%;
}
</style>
