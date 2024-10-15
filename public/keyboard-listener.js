export default function createKeyboardListener(document) {
	const state = {
		observers: [],
		playerId: null
	}

	function registerPlayerId(playerId) {
		state.playerId = playerId
	}

	function subscribe(observerFunction) {
		state.observers.push(observerFunction)
	}

	function notifyAll(command) {
		for (const observerFunction of state.observers) {
			observerFunction(command)
		}
	}

	document.addEventListener('keydown', handleKeyDown)
	const btnsScreen = document.getElementsByName('btnScreen')
	for (let i = 0; i < 4; i++) {
		btnsScreen[i].addEventListener('click', handleKeyDown)
	}
	
	function handleKeyDown(event){
		const keyPressed = event.type == 'keydown' ? event.key : event.currentTarget.value
	
		const command = {
			type: 'move-player',
			playerId: state.playerId,
			keyPressed
		}
	
		notifyAll(command)
	}

	return {
		subscribe,
		registerPlayerId
	}
}