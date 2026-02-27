const io = require('socket.io')(process.env.PORT || 3000, {
  cors: { origin: "*" }
});

let estadoDoMapa = {}; // Guarda a posição dos ícones para quem entrar depois
let pedidosDeFala = [];

console.log("Servidor War Room Tacts rodando...");

io.on('connection', (socket) => {
  // 1. O Líder entra e avisa que é o líder
  socket.on('registrar-lider', () => {
    socket.join('sala-comando');
    console.log("Líder conectado e pronto para falar.");
  });

  // 2. Movimentação tática (Todos veem)
  socket.on('arrastar-icone', (dados) => {
    estadoDoMapa[dados.id] = { x: dados.x, y: dados.y };
    socket.broadcast.emit('atualizar-mapa', dados);
  });

  // 3. Lógica de Voz Walkie-Talkie
  socket.on('solicitar-fala', (usuario) => {
    // Adiciona o pedido na fila e avisa o Líder
    const pedido = { id: socket.id, nome: usuario.nome };
    pedidosDeFala.push(pedido);
    io.to('sala-comando').emit('novo-pedido-fala', pedido);
  });

  socket.on('lider-liberou', (idJogador) => {
    // O Líder clica no botão e libera especificamente aquele jogador
    io.to(idJogador).emit('permissao-concedida');
    // Remove da fila
    pedidosDeFala = pedidosDeFala.filter(p => p.id !== idJogador);
  });

  socket.on('disconnect', () => {
    pedidosDeFala = pedidosDeFala.filter(p => p.id !== socket.id);
  });
});
