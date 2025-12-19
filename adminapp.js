const MEMBER_LIST_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmem';
const SYNC_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=addmem&apikey=';
const UPDATE_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=chngscore&member=';

let cachedMembers = [];

async function loadMembers() {
    try {
        const response = await fetch(MEMBER_LIST_URL);
        const data = await response.json();
        cachedMembers = Object.keys(data).map(id => {
            return {
                id: id,
                username: data[id][0]
            };
        });
        cachedMembers.sort((a, b) => a.username.localeCompare(b.username));

        populateDropdown(document.querySelector('.member-dropdown'));
        updateStatus("Member list loaded.");
    } catch (e) {
        console.error("Fetch Error:", e);
        updateStatus("Failed to load members.");
    }
}

function populateDropdown(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Select Member</option>';
    cachedMembers.forEach(member => {
        const opt = document.createElement('option');
        opt.value = member.id; 
        opt.textContent = member.username;
        selectElement.appendChild(opt);
    });
}

document.getElementById('sync-btn').addEventListener('click', async () => {
    const key = document.getElementById('api-key').value;
    if (!key) return alert("Enter API Key first!");
    
    updateStatus("Syncing members...");
    try {
        await fetch(`${SYNC_URL}${key}`);
        updateStatus("Sync command sent! Reloading list...");
        setTimeout(loadMembers, 2000);
    } catch (e) {
        updateStatus("Sync failed.");
    }
});

document.getElementById('add-row-btn').addEventListener('click', () => {
    const container = document.getElementById('score-rows-container');
    const newRow = document.createElement('div');
    newRow.className = 'score-row';
    newRow.style.display = 'flex';
    newRow.style.gap = '10px';
    newRow.innerHTML = `
        <select class="member-dropdown"></select>
        <input type="number" placeholder="Score" class="score-input">
        <button class="remove-btn" onclick="this.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
    `;
    container.appendChild(newRow);
    populateDropdown(newRow.querySelector('.member-dropdown'));
});

document.getElementById('submit-scores-btn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('.score-row');
    const submitBtn = document.getElementById('submit-scores-btn');
    
    submitBtn.disabled = true;
    updateStatus("Processing batch updates...");

    for (let row of rows) {
        const memberId = row.querySelector('.member-dropdown').value;
        const score = row.querySelector('.score-input').value;

        if (memberId && score) {
            row.style.opacity = "0.5";
            updateStatus(`Updating ${memberId}...`);
            
            try {
                await fetch(`${UPDATE_URL}${memberId}&score=${score}`);
                await new Promise(resolve => setTimeout(resolve, 2500)); 
            } catch (e) {
                console.error(`Failed to update ${memberId}`);
            }
            row.style.border = "1px solid green";
        }
    }
    
    updateStatus("All scores submitted successfully!");
    submitBtn.disabled = false;
});

function updateStatus(msg) {
    document.getElementById('status-msg').innerText = msg;
}

loadMembers();
