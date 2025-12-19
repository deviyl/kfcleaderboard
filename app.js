const apiUrl = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmemscore';

async function updateLeaderboard() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        let players = Object.keys(data).map(id => {
            return {
                id: id,
                name: data[id][0],
                score: parseInt(data[id][1])
            };
        });

        // sort by score
        players.sort((a, b) => b.score - a.score);

        renderPodium(players.slice(0, 3));
        renderTable(players.slice(3));

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}

function renderPodium(topThree) {
    const podiumEl = document.getElementById('podium');
    podiumEl.innerHTML = '';

    topThree.forEach((player, index) => {
        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
        const div = document.createElement('div');
        div.className = `podium-item ${rankClass}`;
        div.innerHTML = `
            <div>#${index + 1}</div>
            <div style="font-size: 0.9rem">${player.name}</div>
            <div style="font-size: 1.2rem">${player.score}</div>
        `;
        podiumEl.appendChild(div);
    });
}

function renderTable(others) {
    const body = document.getElementById('leaderboard-body');
    body.innerHTML = '';

    others.forEach((player, index) => {
        const row = `
            <tr>
                <td>${index + 4}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
            </tr>
        `;
        body.innerHTML += row;
    });
}

updateLeaderboard();
setInterval(updateLeaderboard, 30000);
