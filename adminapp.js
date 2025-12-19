const MEMBER_LIST_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmem';
const SYNC_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=addmem&apikey=';
const UPDATE_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=chngscore&member=';

let cachedMembers = [];

async function loadMembers() {
    try {
        const response = await fetch(MEMBER_LIST_URL);
        const data = await response.json();
        cachedMembers = Object.entries(data);
        populateDropdown(document.querySelector('.member-dropdown'));
    } catch (e) {
        updateStatus("Failed to load members.");
    }
}

function populateDropdown(selectElement) {
    selectElement.innerHTML = '<option value="">Select Member</option>';
    cachedMembers.forEach(([id, name]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        selectElement.appendChild(opt);
    });
}

document.getElementById('sync-btn').addEventListener('click', async () => {
    const key = document.getElementById('api-key').value;
    if (!key) return alert("Enter API Key first!");
    
    updateStatus("Syncing members...");
    try {
        await fetch(`${SYNC_URL}${key}`);
        updateStatus("Member list refreshed!");
    } catch (e) {
        updateStatus("Sync failed.");
    }
});

document.getElementById('add-row-btn').addEventListener('click', () => {
    const container = document.getElementById('score-rows-container');
    const newRow = document.createElement('div');
    newRow.className = 'score-row';
    newRow.innerHTML = `
        <select class="member-dropdown"></select>
        <input type="number" placeholder="Score" class="score-input">
    `;
    container.appendChild(newRow);
    populateDropdown(newRow.querySelector('.member-dropdown'));
});

document.getElementById('submit-scores-btn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('.score-row');
    updateStatus("Processing batch...");

    for (let row of rows) {
        const memberId = row.querySelector('.member-dropdown').value;
        const score = row.querySelector('.score-input').value;

        if (memberId && score) {
            updateStatus(`Updating ${memberId}...`);
            try {
                await fetch(`${UPDATE_URL}${memberId}&score=${score}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); 
            } catch (e) {
                console.error(`Failed to update ${memberId}`);
            }
        }
    }
    updateStatus("All updates complete!");
});

function updateStatus(msg) {
    document.getElementById('status-msg').innerText = msg;
}

loadMembers();
