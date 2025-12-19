const apiUrl = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmemscore';

async function fetchLeaderboard() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        let players = Object.keys(data).map(id => ({
            id: id,
            name: data[id][0],
            score: parseInt(data[id][1])
        })).sort((a, b) => b.score - a.score);

        renderUI(players);
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

function renderUI(players) {
    const podium = document.getElementById('podium');
    const list = document.getElementById('leaderboard-list');

    podium.innerHTML = players.slice(0, 3).map((p, i) => `
        <div class="hex rank-${i+1}">
            <div class="name">${p.name}</div>
            <div class="score">${p.score.toLocaleString()}</div>
        </div>
    `).join('');

    list.innerHTML = players.slice(3).map((p, i) => `
        <div class="list-item">
            <span class="rank-num">#${i + 4}</span>
            <div class="player-info">${p.name} (${p.id})</div>
            <div class="player-score">${p.score.toLocaleString()}</div>
        </div>
    `).join('');
}  
fetchLeaderboard();
setInterval(fetchLeaderboard, 30000);
