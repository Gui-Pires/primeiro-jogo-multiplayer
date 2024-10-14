import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import {Server as io} from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = new io(server)

app.use(express.static('public'))

const game = createGame()
game.startMode2(500)

game.subscribe((command) => {
	sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
	const playerId = socket.id

	game.addPlayer({ playerId: playerId })

	socket.emit('setup', game.state)

	socket.on('disconnect', () => {
		game.removePlayer({ playerId: playerId })
	})

	socket.on('move-player', (command) => {
		command.playerId = playerId
		command.type = 'move-player'

		game.movePlayer(command)
	})

	socket.on('save-settings', (command) => {
		game.saveSettings(command)
	})
})

server.listen(3000, () => {
	console.log('> Server listening on port: 3000')
})