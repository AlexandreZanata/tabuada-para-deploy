let currentMultiplier = 1;
let currentMultiplicand = 1;
const playerScores = {};
const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

function generateNextEquation() {
    const equation = `${currentMultiplier} * ${currentMultiplicand}`;
    currentMultiplicand++;
    if (currentMultiplicand > 10) {
        currentMultiplicand = 1;
        currentMultiplier++;
        if (currentMultiplier > 20) {
            currentMultiplier = 1;
        }
    }
    return equation;
}

function calculateEquation(equation) {
    try {
        return eval(equation);
    } catch {
        return null;
    }
}

function updateScoreboard(scores) {
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
    // Ordena os jogadores pelo valor da pontuação em ordem decrescente
    scores.sort((a, b) => b[1] - a[1]);
    for (const [player, score] of scores) {
        const li = document.createElement('li');
        li.textContent = `${player}: ${score}`;
        scoreList.appendChild(li);
    }
}

socket.on('update_scores', function(data) {
    updateScoreboard(data.high_scores);
});

document.getElementById('score-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const player = document.getElementById('player').value;
    const answer = parseFloat(document.getElementById('answer').value);
    const equation = document.getElementById('equation').value;
    const correctAnswer = calculateEquation(equation);

    if (answer === correctAnswer) {
        if (!playerScores[player]) {
            playerScores[player] = 0; // Initialize score for new player
        }
        playerScores[player] += 100; // Add 100 points for correct answer

        fetch('/save_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `player=${player}&score=${playerScores[player]}`
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('answer').value = '';
            document.getElementById('equation').value = generateNextEquation();
        });
    } else {
        alert('RESPOSTA ERRADA RESPONDA OUTRA VEZ.');
    }
});

document.getElementById('equation').value = generateNextEquation();
