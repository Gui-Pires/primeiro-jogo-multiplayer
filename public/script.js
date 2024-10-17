import createGame from './game.js'
import createKeyboardListener from './keyboard-listener.js'
import renderScreen from './render-screen.js'

let screen = document.getElementById('canvas')

function rgbToHex(r, g, b) {
    // Limita os valores de r, g, b para estarem no intervalo [0, 255]
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Converte cada valor para hexadecimal com 2 dígitos, preenchendo com 0 se necessário
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

const game = createGame()
const keyboardListener = createKeyboardListener(document)

const socket = io()
socket.on('connect', () => {
	const playerId = socket.id

	renderScreen(screen, game, requestAnimationFrame, playerId, socket)

	const btnSaveSettings = document.getElementById('save-setting')
	btnSaveSettings.addEventListener('click', () => {
		let nicknamePlayer = document.getElementById('nickname-player').value
			if(nicknamePlayer != '' && nicknamePlayer != null) {
				let colorPlayer = document.getElementById('color-player').value
				const temp = {
					type: 'save-settings',
					playerId: playerId,
					color: colorPlayer,
					nickname: nicknamePlayer
				}
				socket.emit('save-settings', temp)
			}
	})

	const btnSaveRecord = document.getElementById('save-record')
	btnSaveRecord.addEventListener('click', () => {
		const temp = {
			type: 'save-record',
			playerId: playerId
		}
		socket.emit('save-record', temp)
	})

	socket.on('disconnect', (socketServer) => {
		console.log(`> Server diconnected -> ${socketServer}`)
		socketServer.onClose()
		game.unsubscribeAll()
	})
})

socket.on('setup', (state) => {
	const playerId = socket.id
	
	game.getState(state)

	//Atualiza o nickname na tela
	let nickname = game.state.players[playerId].nickname
	document.getElementById('nickname-player').value = nickname

	// Atualiza a cor na tela
	let rgb = game.state.players[playerId].color
	rgb = rgb.slice(4, -1).split(', ')
	document.getElementById('color-player').value = rgbToHex(rgb[0], rgb[1], rgb[2])

	setInterval(() => {
		game.getState()
	}, 10000)

	keyboardListener.registerPlayerId(playerId)
	keyboardListener.subscribe(game.movePlayer)
	keyboardListener.subscribe((command) => {
		socket.emit('move-player', command)
	})
})

socket.on('add-player', (command) => {
	game.addPlayer(command)
})

socket.on('remove-player', (command) => {
	game.removePlayer(command)
})

socket.on('move-player', (command) => {
	const playerId = socket.id

	if(playerId !== command.playerId) {
		game.movePlayer(command)
	}
})

socket.on('add-fruit', (command) => {
	game.addFruit(command)
})

socket.on('remove-fruit', (command) => {
	game.removeFruit(command)
})

socket.on('save-settings', (command) => {
	game.saveSettings(command)
})

socket.on('load-record', (command) => {
	game.state.bestPlayer = command.bestPlayer
})

socket.on('save-record', (command) => {
	game.saveRecord(command)
})