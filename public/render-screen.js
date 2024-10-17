export default function renderScreen(screen, game, requestAnimationFrame, currentPlayerId){
	const currentPlayer = game.state.players[currentPlayerId]
	const topRanking = 5
	let counter = 0
	let rankingScore = []
	let totalPlayers = 0
	const ctx = screen.getContext('2d')
	ctx.clearRect(0, 0, screen.width, screen.height)

	let bestAllTime = document.getElementById('best-all-time')
	bestAllTime.innerHTML = ''

	const rankingBestPlayers = {...game.state.bestPlayer}

	for (const bestPlayerId in rankingBestPlayers) {
		if (bestPlayerId && counter < topRanking) {
			const bestPlayer = game.state.bestPlayer[bestPlayerId]
			const bestColor = bestPlayer.color
			bestAllTime.innerHTML += `<span class="float-start mx-2" style="color: ${bestColor};">${(counter+1)}</span>`
			bestAllTime.innerHTML += `<span class="float-end mx-2" style="color: ${bestColor};">${bestPlayer.score}</span>`
			bestAllTime.innerHTML += `<p class="card-text mx-2" style="color: ${bestColor};">${bestPlayer.nickname}</p>`
			counter++
		}
	}

	counter = 0

	for (const fruitId in game.state.fruits) {
		const fruit = game.state.fruits[fruitId]
		ctx.fillStyle = 'rgb(210, 65, 65)'
		ctx.fillRect(fruit.x, fruit.y, 1, 1)
	}
	
	for (const playerId in game.state.players) {
		const player = game.state.players[playerId]
		ctx.fillStyle = player.color
		ctx.fillRect(player.x, player.y, 1, 1)
		rankingScore.push({playerId: playerId, score: player.score, color: player.color, nickname: player.nickname})
		totalPlayers++
	}

	let spanTotalPlayers = document.getElementById('total-players')
	spanTotalPlayers.innerHTML = `Players: ${totalPlayers}`

	let spanTotalFruits = document.getElementById('total-fruits')
	spanTotalFruits.innerHTML = `Fruits: ${Object.keys(game.state.fruits).length}`

	let tableScores = document.getElementById('table-scores')
	tableScores.innerHTML = ''
	rankingScore.sort((a, b) => b.score - a.score)
	let color = ''
	
	for (const scoreId in rankingScore) {
		if(scoreId && counter < topRanking) {
			color = rankingScore[scoreId].color
			tableScores.innerHTML += `<span class="float-start mx-2" style="color: ${color};">${(counter+1)}</span>`
			tableScores.innerHTML += `<span class="float-end mx-2" style="color: ${color};">${rankingScore[scoreId].score}</span>`
			tableScores.innerHTML += `<p class="card-text mx-2" style="color: ${color};">${rankingScore[scoreId].nickname}</p>`
			counter++
		}
	}

	if(currentPlayer){
		ctx.fillStyle = currentPlayer.color
		ctx.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)

		let currentPlayerFooter = document.getElementById('current-player-footer')
		currentPlayerFooter.style.color = currentPlayer.color
		
		let scorePlayer = document.getElementById('score-player')
		scorePlayer.innerHTML = currentPlayer.score

		let tagPlayer = document.getElementById('tag-player')
		tagPlayer.innerHTML = currentPlayer.nickname
	}

	
	requestAnimationFrame(() => {
		renderScreen(screen, game, requestAnimationFrame, currentPlayerId)
	})
}