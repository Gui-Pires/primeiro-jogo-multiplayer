import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import {Server as io} from 'socket.io'
import fs from 'fs'

const app = express()
const server = http.createServer(app)
const sockets = new io(server)

app.use(express.static('public'))

const game = createGame()
game.startMode2(500)

game.subscribe((command) => {
	sockets.emit(command.type, command)
})

function loadBestOfAllTime() {
	const data = JSON.parse(fs.readFileSync('./public/bestOfAllTime.json', 'utf8') || "{}")
	let top5 = {}
	for (let p in data) {
		top5[p] = data[p]
	}
	game.loadRecord(top5)
}

function saveProgressToFile(id, progresso) {
	const data = JSON.parse(fs.readFileSync('./public/bestOfAllTime.json', 'utf8') || "{}")
	data[id] = progresso

	const dataArray = Object.keys(data).map(id => ({
        id,
        ...data[id]
    }))

    dataArray.sort((a, b) => b.score - a.score)

	const orderedData = dataArray.reduce((obj, item) => {
		obj[item.id] = {
			nickname: item.nickname,
			color: item.color,
			score: item.score
		};
		return obj;
	}, {})

	fs.writeFileSync('./public/bestOfAllTime.json', JSON.stringify(orderedData, null, 4), 'utf8')
	loadBestOfAllTime()
}

sockets.on('connection', (socket) => {
	const playerId = socket.id

	game.addPlayer({ playerId: playerId })
	loadBestOfAllTime()
	
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

	socket.on('load-record', (command) => {
		const dataJson = command ? command : loadBestOfAllTime()
		game.loadRecord(dataJson)
	})

	socket.on('save-record', (command) => {
		const nickname = game.state.players[playerId].nickname
		const color = game.state.players[playerId].color
		const score = game.state.players[playerId].score

		const toFile = {nickname, color, score}

		saveProgressToFile(command.playerId, toFile)
	})
})

server.listen(3000, () => {
	console.log('> Server listening on port: 3000')
})