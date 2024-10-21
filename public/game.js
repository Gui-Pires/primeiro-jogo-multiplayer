import randomNames from './names.js'

export default function createGame() {
	const state = {
		players: {},
		fruits: {},
		bestPlayer: {},
		screen: {
			width: 15,
			height: 15
		}
	}

	const observers = []

	function start(seconds=2000) {
		const frequency = seconds

		setInterval(addFruit, frequency)
	}

	function startMode2(seconds=2000) {
		addFruit()

		setInterval(() => {
			if (Object.keys(state.fruits).length < 10 || Object.keys(state.fruits).length < Object.keys(state.players).length * 3){
				addFruit()
			}
		}, seconds)
	}
	
	function subscribe(observerFunction) {
		observers.push(observerFunction)
	}

	function unsubscribeAll() {
		observers = []
	}

	function notifyAll(command) {
		for (const observerFunction of observers) {
			observerFunction(command)
		}
	}

	function getState(newState) {
		Object.assign(state, newState)
	}

	function getStateForce() {
		return state
	}

	function addPlayer(command) {
		const playerId = command.playerId
		const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
		const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
		const color = 'color' in command ? command.color : `rgb(${Math.floor(Math.random() * 250)}, ${Math.floor(Math.random() * 250)}, ${Math.floor(Math.random() * 250)})`
		const nickname = 'nickname' in command ? command.nickname : randomNames[Math.floor(Math.random() * 200) - 1]
		const score = 'score' in command ? command.score : 0

		state.players[playerId] = {
			x: playerX,
			y: playerY,
			score: score,
			color: color,
			nickname: nickname
		}

		notifyAll({
			type: 'add-player',
			playerId: playerId,
			playerX: playerX,
			playerY: playerY,
			score: score,
			color: color,
			nickname: nickname
		})
	}

	function removePlayer(command) {
		const playerId = command.playerId

		delete state.players[playerId]

		notifyAll({
			type: 'remove-player',
			playerId: playerId
		})
	}

	function saveSettings(command) {
		const playerId = command.playerId
		const color = command.color
		const nickname = command.nickname

		state.players[playerId].color = color
		state.players[playerId].nickname = nickname

		notifyAll({
			type: 'save-settings',
			playerId: playerId,
			color: color,
			nickname: nickname
		})
	}

	function loadRecord(command) {
		state.bestPlayer = command

		notifyAll({
			type: 'load-record',
			bestPlayer: command
		})
	}

	function saveRecord(command) {
		const playerId = command.playerId
		state.bestPlayer = command.bestPlayer

		notifyAll({
			type: 'save-record',
			playerId: playerId,
			bestPlayer: command.bestPlayer
		})
	}

	function addFruit(command) {
		const fruitId = command ? command.fruitId : Math.floor(Math.random() * 1000000)
		const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
		const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

		state.fruits[fruitId] = {
			x: fruitX,
			y: fruitY
		}

		notifyAll({
			type: 'add-fruit',
			fruitId: fruitId,
			fruitX: fruitX,
			fruitY: fruitY
		})
	}

	function removeFruit(command) {
		const fruitId = command.fruitId

		delete state.fruits[fruitId]

		notifyAll({
			type: 'remove-fruit',
			fruitId: fruitId
		})
	}
	
	function movePlayer(command) {
		notifyAll(command)
		
		const acceptedMoves = {
			ArrowUp(player) {
				if(player.y > 0) {
					player.y--
				} else {
					player.y = state.screen.height - 1
				}
			},
			ArrowDown(player) {
				if(player.y < state.screen.height - 1) {
					player.y++
				} else {
					player.y = 0
				}
			},
			ArrowRight(player) {
				if(player.x < state.screen.width - 1) {
					player.x++
				} else {
					player.x = 0
				}
			},
			ArrowLeft(player) {
				if(player.x > 0) {
					player.x--
				} else {
					player.x = state.screen.width - 1
				}
			}
		}

		const keyPressed = command.keyPressed
		const playerId = command.playerId
		const player = state.players[command.playerId]
		const moveFunction = acceptedMoves[keyPressed]
		if(player && moveFunction) {
			moveFunction(player)
			checkForFruitCollision(playerId)
		}
	}

	function checkForFruitCollision(playerId) {
		const player = state.players[playerId]

		for (const fruitId in state.fruits) {
			const fruit = state.fruits[fruitId]

			if (player.x === fruit.x && player.y === fruit.y) {
				removeFruit({fruitId: fruitId})
				player.score++
			}
		}
	}

	return {
		addPlayer,
		removePlayer,
		addFruit,
		removeFruit,
		saveSettings,
		loadRecord,
		saveRecord,
		movePlayer,
		state,
		getState,
		getStateForce,
		subscribe,
		unsubscribeAll,
		start,
		startMode2
	}
}