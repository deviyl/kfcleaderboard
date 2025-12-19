const MEMBER_LIST_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmem';
const SYNC_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=addmem&apikey=';
const UPDATE_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=chngscore&member=';

let cachedMembers = [];

async function loadMembers() {
    try {
        const response = await fetch(MEMBER_LIST_URL);
        const data = await response.json();

        cachedMembers = Object.keys(data).map(id => ({
            id: id,
            username: data[id][0] 
        })).sort((a, b) => a.username.localeCompare(b.username));

        const firstDropdown = document.querySelector('.member-dropdown');
        if (firstDropdown) populateDropdown(firstDropdown);
        updateStatus("Member list loaded.");
    } catch (e) {
        updateStatus("Failed to load members.");
    }
}

function populateDropdown(selectElement) {
    selectElement.innerHTML = '<option value="">Select Member</option>';
    cachedMembers.forEach(member => {
        const opt = document.createElement('option');
        opt.value = member.id;
        opt.textContent = member.username;
        selectElement.appendChild(opt);
    });
}

function createRow() {
    const container = document.getElementById('score-rows-container');
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
        <select class="member-dropdown"></select>
        <input type="number" placeholder="Score" class="score-input">
        <button class="remove-row-btn">-</button>
    `;
    container.appendChild(row);
    populateDropdown(row.querySelector('.member-dropdown'));

    row.querySelector('.remove-row-btn').addEventListener('click', () => {
        row.remove();
    });
}

function updateStatus(msg) {
    const statusEl = document.getElementById('status-msg');
    if (statusEl) {
        statusEl.innerText = msg;
    } else {
        console.log("Status Update:", msg);
    }
}
document.getElementById('add-row-btn').addEventListener('click', createRow);

document.getElementById('clear-all-btn').addEventListener('click', () => {
    document.getElementById('score-rows-container').innerHTML = '';
    createRow();
});

document.getElementById('sync-btn').addEventListener('click', async () => {
    const key = document.getElementById('api-key').value;
    if (!key) return alert("Enter API Key!");
    updateStatus("Syncing...");
    try {
        await fetch(`${SYNC_URL}${key}`);
        updateStatus("Sync complete. Reloading...");
        setTimeout(loadMembers, 2000);
    } catch (e) { updateStatus("Sync failed."); }
});

document.getElementById('submit-scores-btn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('.score-row');
    const btn = document.getElementById('submit-scores-btn');
    btn.disabled = true;

    for (const row of rows) {
        const id = row.querySelector('.member-dropdown').value;
        const score = row.querySelector('.score-input').value;

        if (id && score) {
            row.style.background = "rgba(241, 196, 15, 0.2)";
            updateStatus(`Updating ${id}...`);
            try {
                await fetch(`${UPDATE_URL}${id}&score=${score}`);
                await new Promise(r => setTimeout(r, 2000));
                row.style.background = "rgba(46, 204, 113, 0.2)";
            } catch (e) {
                row.style.background = "rgba(231, 76, 60, 0.2)";
            }
        }
    }
    updateStatus("complete.");
    btn.disabled = false;
});

loadMembers();
