// wellnessChallenge.js

// Base API path for wellness challenge endpoints
var API_BASE = "/challenge";

// Used to track who is currently logged in (for showing delete button on own challenges)
var currentUserId = null;

// Stores which challenges are already completed so we can hide them from the active list
// challenge_id => {details: "..."}
var completedMap = {};

document.addEventListener("DOMContentLoaded", function () {
  // Navbar buttons + create button visibility
  setupAuthUI();

  // Hook up refresh/create buttons
  setupButtons();

  // Load user info first (so we know currentUserId)
  loadMeThenChallenges();

  // Load completions first so completed items can be filtered out
  loadCompletedThenChallenges();
});

function loadCompletedThenChallenges() {
  var token = localStorage.getItem("token");

  // Reset completion cache before reloading
  completedMap = {};

  // Token check: if user isn't logged in, just render as empty completions
  if (!token) {
    renderCompletedFromApi([]);
    loadChallenges();
    return;
  }

  // Fetch list of completed challenges for this user
  fetchMethod(API_BASE + "/completions", function (status, data) {
    // If token is invalid/expired, force logout
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    // Build a quick lookup map so we can hide completed items from the active list
    if (status < 400 && Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        completedMap[data[i].challenge_id] = { details: data[i].details };
      }
      renderCompletedFromApi(data);
    } else {
      renderCompletedFromApi([]);
    }

    // After completions are loaded, load the active challenge list
    loadChallenges();
  }, "GET", null, token);
}

function renderCompletedFromApi(list) {
  var completedList = document.getElementById("completedList");
  if (!completedList) return;

  completedList.innerHTML = "";

  // If nothing completed, leave this section empty
  if (!list || list.length === 0) return;

  // Add each completed challenge row
  for (var i = 0; i < list.length; i++) {
    completedList.appendChild(buildCompletedRow(list[i]));
  }
}

function loadMeThenChallenges() {
  var token = localStorage.getItem("token");

  // If not logged in, we won't show delete buttons (no user id)
  if (!token) {
    currentUserId = null;
    loadChallenges();
    return;
  }

  // Load user profile to get user_id
  fetchMethod("/user/me", onMeLoaded, "GET", null, token);
}

function onMeLoaded(status, data) {
  // If token is invalid/expired, force logout
  if (status === 401) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  // If request failed, continue without user id
  if (status >= 400) {
    currentUserId = null;
    loadChallenges();
    return;
  }

  // Store user id so we can compare ownership of challenges
  currentUserId = data.user_id;
  loadChallenges();
}

function setupAuthUI() {
  var token = localStorage.getItem("token");

  var navProfile = document.getElementById("navProfile");
  var navLogout = document.getElementById("navLogout");
  var toggleCreateBtn = document.getElementById("toggleCreateBtn");

  // If logged in, show profile/logout and allow creating new challenges
  if (token) {
    if (navProfile) navProfile.classList.remove("d-none");
    if (navLogout) navLogout.classList.remove("d-none");
    if (toggleCreateBtn) toggleCreateBtn.classList.remove("d-none");
  }
}

function setupButtons() {
  var refreshBtn = document.getElementById("refreshBtn");
  var createBtn = document.getElementById("createBtn");

  // Refresh reloads both active challenges and completed list
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      loadMeThenChallenges();
      loadCompletedThenChallenges();
    });
  }

  // Create a new custom challenge
  if (createBtn) {
    createBtn.addEventListener("click", createChallenge);
  }
}

function loadChallenges() {
  hideAlert();

  var token = localStorage.getItem("token");
  var url = API_BASE + "/challenges";
  console.log("GET", url);

  // Fetch all challenges from backend
  fetchMethod(url, function (status, data) {
    console.log("Challenges status:", status, data);

    // Generic error state
    if (status >= 400) {
      showAlert("danger", "Failed to load challenges (check console/network).");
      renderList([]);
      return;
    }

    renderList(data);
  }, "GET", null, token);
}

function renderList(list) {
  var container = document.getElementById("challengeList");
  var emptyState = document.getElementById("emptyState");

  if (!container) return;

  container.innerHTML = "";

  var shown = 0;

  // Build active list, skipping anything already completed
  if (list && list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      var id = list[i].challenge_id;

      // Completed challenges should not appear in active list
      if (completedMap[id]) continue;

      container.appendChild(buildRow(list[i]));
      shown++;
    }
  }

  // Toggle empty state if there are no active challenges to show
  if (emptyState) {
    if (shown === 0) emptyState.classList.remove("d-none");
    else emptyState.classList.add("d-none");
  }
}

function buildRow(item) {
  var token = localStorage.getItem("token");

  var wrap = document.createElement("div");
  wrap.className = "border rounded-4 p-3 bg-white";

  // Delete button is only shown if user is logged in and owns the challenge
  var showDelete = false;
  if (token && currentUserId && item.created_by_user_id) {
    showDelete = Number(item.created_by_user_id) === Number(currentUserId);
  }

  var deleteBtnHtml = "";
  if (showDelete) {
    deleteBtnHtml =
      '<button class="btn btn-outline-danger btn-sm" type="button" data-action="delete" data-id="' +
      item.challenge_id +
      '">Delete</button>';
  }

  // One row: description, reward, optional details, and actions
  wrap.innerHTML =
    '<div class="d-flex justify-content-between align-items-start gap-2">' +
      '<div class="fw-semibold">' + esc(item.description) + '</div>' +
      '<span class="badge text-bg-warning">+' + item.coins_reward + ' coins</span>' +
    '</div>' +
    '<div class="mt-2">' +
      '<input class="form-control form-control-sm" placeholder="Optional details" data-details="' + item.challenge_id + '">' +
    '</div>' +
    '<div class="d-flex gap-2 mt-3">' +
      '<button class="btn btn-success btn-sm flex-grow-1" type="button" data-action="complete">Complete</button>' +
      deleteBtnHtml +
    '</div>';

  // Complete action
  var completeBtn = wrap.querySelector('[data-action="complete"]');
  if (completeBtn) {
    completeBtn.addEventListener("click", function () {
      onComplete(item.challenge_id, wrap);
    });

    // If not logged in, disable complete button
    if (!token) completeBtn.disabled = true;
  }

  // Delete action (only present if user owns the challenge)
  var deleteBtn = wrap.querySelector('[data-action="delete"]');
  if (deleteBtn) {
    deleteBtn.addEventListener("click", onDelete);
  }

  return wrap;
}

function buildCompletedRow(item) {
  var wrap = document.createElement("div");
  wrap.className = "border rounded-4 p-3 bg-light";

  // Completed item may include optional details text
  var detailsText = item.details ? esc(item.details) : "";

  wrap.innerHTML =
    '<div class="d-flex justify-content-between align-items-start">' +
      '<div class="fw-semibold">' + esc(item.description) + '</div>' +
      '<span class="badge bg-secondary">Completed</span>' +
    '</div>' +
    '<div class="small text-muted mt-1">+' + item.coins_reward + ' coins</div>' +
    (detailsText
      ? '<div class="mt-2 small"><span class="fw-semibold">Details:</span> ' + detailsText + '</div>'
      : '');

  return wrap;
}

function onComplete(id, challengeEl) {
  var token = localStorage.getItem("token");
  if (!token) return showAlert("warning", "Please login first.");

  // Read optional details input for that challenge
  var input = challengeEl.querySelector('[data-details="' + id + '"]');
  var details = input ? input.value.trim() : null;

  var payload = { details: details };

  var callback = function (status, data) {
    onCompleteDone(status, data);
  };

  // Mark the challenge as completed in the backend
  fetchMethod(
    API_BASE + "/challenges/" + id + "/complete",
    callback,
    "POST",
    payload,
    token
  );
}

function onCompleteDone(status, data) {
  // Conflict: already completed
  if (status === 409) {
    showAlert(
      "warning",
      (data && data.message) ? data.message : "You already completed this challenge."
    );
    loadCompletedThenChallenges();
    return;
  }

  // General error
  if (status >= 400) {
    showAlert("danger", (data && data.message) ? data.message : "Complete failed.");
    return;
  }

  // Success message includes coins earned
  showAlert("success", "Completed! +" + data.coins_earned + " coins.");

  // Reload completions so UI updates immediately
  loadCompletedThenChallenges();
}

function createChallenge() {
  var token = localStorage.getItem("token");
  if (!token) return showAlert("warning", "Please login first.");

  var descEl = document.getElementById("createDescription");
  var coinsEl = document.getElementById("createCoins");

  // Read inputs for new challenge
  var desc = (descEl ? descEl.value : "").trim();
  var coins = Number(coinsEl ? coinsEl.value : "");

  // Basic validation before sending to backend
  if (!desc) return showAlert("warning", "Description cannot be empty.");
  if (!Number.isFinite(coins) || coins < 1 || coins > 50) {
    return showAlert("warning", "Coins must be 1–50.");
  }

  var url = API_BASE + "/challenges";
  var payload = { description: desc, coins_reward: coins };

  fetchMethod(url, onCreateDone, "POST", payload, token);
}

function onCreateDone(status, data) {
  if (status >= 400) {
    return showAlert("danger", (data && data.message) ? data.message : "Create failed.");
  }

  showAlert("success", "Challenge created!");

  // Clear inputs after creating
  var descEl = document.getElementById("createDescription");
  var coinsEl = document.getElementById("createCoins");
  if (descEl) descEl.value = "";
  if (coinsEl) coinsEl.value = "";

  // Reload lists to include the new challenge
  loadMeThenChallenges();
  loadCompletedThenChallenges();
}

function onDelete(e) {
  var token = localStorage.getItem("token");
  if (!token) return showAlert("warning", "Please login first.");

  // Button stores challenge id in data-id
  var id = e.currentTarget.getAttribute("data-id");
  var url = API_BASE + "/challenges/" + id;

  fetchMethod(url, onDeleteDone, "DELETE", null, token);
}

function onDeleteDone(status, data) {
  if (status >= 400) {
    return showAlert("danger", (data && data.message) ? data.message : "Delete failed.");
  }

  showAlert("success", "Challenge deleted.");

  // Reload lists so deleted item disappears
  loadMeThenChallenges();
  loadCompletedThenChallenges();
}

// UI alert helper
function showAlert(type, msg) {
  var box = document.getElementById("alertBox");
  if (!box) return;

  box.className = "alert alert-" + type;
  box.textContent = msg;
  box.classList.remove("d-none");
}

// Hide alert helper
function hideAlert() {
  var box = document.getElementById("alertBox");
  if (!box) return;

  box.classList.add("d-none");
  box.textContent = "";
}

// Escape text before inserting into HTML
function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
