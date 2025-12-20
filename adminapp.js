const MEMBER_LIST_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmem';
const SYNC_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=addmem&apikey=';
const UPDATE_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=chngscore&member=';

let cachedMembers = [];
let savedApiKey = ""; // stores key in cache for refresh logic
const WHITELIST = ["Dev"]; // Authorized users

// ---------------------------------------------------------------------------
// security and login
// ---------------------------------------------------------------------------
document.getElementById('login-btn').addEventListener('click', async () => {
    const key = document.getElementById('auth-key').value;
    if (!key) {
        alert("Please enter a public API Key.");
        return;
    }

    updateStatus("Verifying Identity...");

    try {
        const response = await fetch(`https://api.torn.com/v2/user/basic?key=${key}`);
        const data = await response.json();
        const tornName = data.profile?.name;

        if (WHITELIST.includes(tornName)) {
            savedApiKey = key;
            unlockPage(tornName);
        } else {
            updateStatus("Access Denied.");
            alert(`Access Denied: ${tornName || "Unknown User"} is not authorized.`);
        }
    } catch (e) {
        console.error(e);
        updateStatus("Error: Could not reach Torn API.");
    }
});

function unlockPage(name) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    updateStatus(`Welcome, ${name}. Terminal Online.`);
    loadMembers();
}

// ---------------------------------------------------------------------------
// member list and dropdown
// ---------------------------------------------------------------------------
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
        updateStatus("Member list updated.");
    } catch (e) {
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

// ---------------------------------------------------------------------------
// dynamic rows
// ---------------------------------------------------------------------------
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

document.getElementById('add-row-btn').addEventListener('click', createRow);
document.getElementById('clear-all-btn').addEventListener('click', () => {
    document.getElementById('score-rows-container').innerHTML = '';
    createRow();
});

// ---------------------------------------------------------------------------
// refresh and submit
// ---------------------------------------------------------------------------
function updateStatus(msg) {
    const statusEl = document.getElementById('status-msg');
    if (statusEl) {
        statusEl.innerText = msg;
    }
}

document.getElementById('sync-btn').addEventListener('click', async () => {
    if (!savedApiKey) return alert("API Key missing. Please refresh and login again.");
    
    updateStatus("Syncing faction member list...");
    try {
        await fetch(`${SYNC_URL}${savedApiKey}`);
        updateStatus("Sync complete. Refreshing dropdown list...");
        setTimeout(loadMembers, 200);
    } catch (e) {
        updateStatus("Sync failed.");
    }
});

document.getElementById('submit-scores-btn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('.score-row');
    const btn = document.getElementById('submit-scores-btn');
    
    btn.disabled = true;
    updateStatus("Processing score updates...");

    for (const row of rows) {
        const id = row.querySelector('.member-dropdown').value;
        const score = row.querySelector('.score-input').value;

        if (id && score) {
            row.style.background = "rgba(241, 196, 15, 0.2)"; // yellow while updating
            updateStatus(`Updating ID: ${id}...`);
            try {
                await fetch(`${UPDATE_URL}${id}&score=${score}`);
                await new Promise(r => setTimeout(r, 200));
                row.style.background = "rgba(46, 204, 113, 0.2)"; // green if success
            } catch (e) {
                row.style.background = "rgba(231, 76, 60, 0.2)"; // red if fail
                console.error(`Error updating ${id}:`, e);
            }
        }
    }
    
    updateStatus("Score update complete!");
    btn.disabled = false;
});
