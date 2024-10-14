import createGame from './game.js'
import createKeyboardListener from './keyboard-listener.js'
import renderScreen from './render-screen.js'

let screen = document.getElementById('canvas')

const game = createGame()
const keyboardListener = createKeyboardListener(document)

const socket = io()
socket.on('connect', () => {
	const playerId = socket.id

	renderScreen(screen, game, requestAnimationFrame, playerId)

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

	socket.on('disconnect', (socketServer) => {
		console.log(`> Server diconnected -> ${socketServer}`)
		socketServer.onClose()
		game.unsubscribeAll()
	})
})

socket.on('setup', (state) => {
	const playerId = socket.id
	game.getState(state)

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