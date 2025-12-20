const MEMBER_LIST_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gmem';
const AUTH_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=gadmin';
const SYNC_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=addmem&apikey=';
const UPDATE_URL = 'https://www.wolfhaven.at/Leaderboard/leaderboard.php?func=chngscore';
const LEADERBOARD_URL = 'https://deviyl.github.io/kfcleaderboard/';
const AUTH_FAILURE = "Imposter";

let cachedMembers = [];
let savedApiKey = ""; // stores key in cache for any future use
let savedAuthResult = ""; // store returned auth result

//back to main
document.getElementById('back-to-main-btn').addEventListener('click', () => {
    window.location.href = LEADERBOARD_URL;
});

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
        const response = await fetch(`${AUTH_URL}`);
        const result = await response.text();
        if (result === AUTH_FAILURE) {
            updateStatus("Access Denied.");
            alert("Access Denied: Your API key is not authorized for admin access.");
        } else {
            savedApiKey = key;
            savedAuthResult = result;
            unlockPage();
        }
    } catch (e) {
        console.error(e);
        updateStatus("Error: Could not reach verification server.");
    }
});

function unlockPage() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    updateStatus(`Welcome...`);
    loadMembers(true); // load muted
}

// ---------------------------------------------------------------------------
// member list and dropdown
// ---------------------------------------------------------------------------
async function loadMembers(mute = false) {
    try {
        const response = await fetch(MEMBER_LIST_URL);
        const data = await response.json();
        cachedMembers = Object.keys(data).map(id => ({
            id: id,
            username: data[id][0] 
        })).sort((a, b) => a.username.localeCompare(b.username));
        
        const firstDropdown = document.querySelector('.member-dropdown');
        if (firstDropdown) populateDropdown(firstDropdown);
        if (!mute) updateStatus("Member list updated.");
    } catch (e) {
        updateStatus("Failed to load members.");
    }
}

function populateDropdown(selectElement) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = '<option value="">Select Member</option>';
    cachedMembers.forEach(member => {
        const opt = document.createElement('option');
        opt.value = member.id;
        opt.textContent = member.username;
        selectElement.appendChild(opt);
    });
    if (currentVal) selectElement.value = currentVal;
}

// ---------------------------------------------------------------------------
// dynamic rows
// ---------------------------------------------------------------------------
function createRow(selectedId = null, initialScore = "") {
    const container = document.getElementById('score-rows-container');
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
        <select class="member-dropdown"></select>
        <input type="number" placeholder="Score" class="score-input" value="${initialScore}">
        <button class="remove-row-btn">-</button>
    `;
    container.appendChild(row);

    const dropdown = row.querySelector('.member-dropdown');
    populateDropdown(dropdown);
    
    if (selectedId) {
        dropdown.value = selectedId;
    }

    row.querySelector('.remove-row-btn').addEventListener('click', () => {
        row.remove();
    });
}

document.getElementById('add-row-btn').addEventListener('click', () => createRow());

document.getElementById('clear-all-btn').addEventListener('click', () => {
    document.getElementById('score-rows-container').innerHTML = '';
    createRow();
});

// add 1 to everyone else
document.getElementById('fill-remainder-btn').addEventListener('click', () => {
    const selectedIds = Array.from(document.querySelectorAll('.member-dropdown'))
                             .map(dropdown => dropdown.value)
                             .filter(id => id !== "");
    const missingMembers = cachedMembers.filter(member => !selectedIds.includes(member.id));
    if (missingMembers.length === 0) {
        updateStatus("All members already listed.");
        return;
    }
    missingMembers.forEach(member => {
        createRow(member.id, 1);
    });

    updateStatus(`Added ${missingMembers.length} members with +1 point.`);
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
        updateStatus("Sync complete...");
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
                await fetch(`${UPDATE_URL}&member=${id}&score=${score}&apikey=${savedApiKey}`);
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
