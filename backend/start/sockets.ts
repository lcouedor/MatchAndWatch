import Ws from 'App/Services/Ws'

Ws.boot()

Ws.io.on('connection', (socket) => {
  console.log('User connected via socket:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})
