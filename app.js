const apiUrl = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmemscore';
dq = 0;
async function fetchLeaderboard() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        //If some scores are set yet
        console.log(data["Error"] === undefined);
        if(data["Error"] === undefined) {
            let players = Object.keys(data).map(id => ({
                id: id,
                name: data[id][0],
                score: parseInt(data[id][1])
            })).sort((a, b) => b.score - a.score);
            renderUI(players);
        } else{
            //Otherwise Duck
            document.getElementById("error").innerHTML =
                "<img src='duck.png' onclick='quack()'>" + "<br>" +
                "<p id='error_msg'>Nobody scored yet, instead here's a duck! Click the Duck!</p>";
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
﻿
function renderUI(players) {
    console.log("Hello");
    const podium = document.getElementById('podium');
    const list = document.getElementById('leaderboard-list');
﻿
    podium.innerHTML = players.slice(0, 3).map((p, i) => `
        <div class="hex rank-${i+1}">
            <div class="name">${p.name}</div>
            <div class="score">${p.score.toLocaleString()}</div>
        </div>
    `).join('');
﻿
    list.innerHTML = players.slice(3).map((p, i) => `
        <div class="list-item">
            <span class="rank-num">#${i + 4}</span>
            <div class="player-info">${p.name} (${p.id})</div>
            <div class="player-score">${p.score.toLocaleString()}</div>
        </div>
    `).join('');
}
﻿
function quack(){
    const audio = new Audio('https://www.wolfhaven.at/quack.mp3');
    audio.play();
    dq++;
    document.getElementById("error_msg").innerText = "You quacked " + dq + " times!";
    if(dq == 69){
        document.getElementById("error_msg").innerHTML = "You won! <br> Send Wolfylein a message with <br> 'I quacked the last quack' to claim your price!";
    }
}
fetchLeaderboard();
setInterval(fetchLeaderboard, 30000);


