// myHorses.js

// Base API path for horse-related requests
var HORSE_BASE = "/horse";

// Run once the page HTML is ready
document.addEventListener("DOMContentLoaded", function () {
  // Update navbar based on login state
  setupAuthUI();

  // Block access if not logged in
  var token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Load user's horses and coin balance on page load
  loadMyHorses();
  loadCoins();
});

// Shows/hides navbar items depending on whether token exists
function setupAuthUI() {
  var token = localStorage.getItem("token");

  var navLogin = document.getElementById("navLogin");
  var navRegister = document.getElementById("navRegister");
  var navProfile = document.getElementById("navProfile");
  var navLogout = document.getElementById("navLogout");

  // If logged in, hide Login/Register and show Profile/Logout
  if (token) {
    if (navLogin) navLogin.classList.add("d-none");
    if (navRegister) navRegister.classList.add("d-none");
    if (navProfile) navProfile.classList.remove("d-none");
    if (navLogout) navLogout.classList.remove("d-none");
  }
}

// Displays alert messages in the page alert box
function showAlert(type, msg) {
  var box = document.getElementById("alertBox");
  if (!box) return;

  box.className = "alert alert-" + (type || "info");
  box.textContent = msg;
  box.style.display = "block";
}

// Hides and clears the alert box
function hideAlert() {
  var box = document.getElementById("alertBox");
  if (!box) return;
  box.style.display = "none";
  box.textContent = "";
}

// Maps a rarity string into CSS classes for the rarity badge
function rarityBadgeClass(rarity) {
  var r = String(rarity || "").toLowerCase();
  if (r === "legendary") return "rarityBadge rarity-legendary";
  if (r === "epic") return "rarityBadge rarity-epic";
  if (r === "rare") return "rarityBadge rarity-rare";
  return "rarityBadge rarity-common";
}

// Fetch the logged-in user's horse list from the backend
function loadMyHorses() {
  // Clear old alerts when reloading
  hideAlert();

  var token = localStorage.getItem("token");
  var url = HORSE_BASE + "/my";

  var callback = function (status, data) {
    // On error, show message and render empty state
    if (status >= 400) {
      showAlert(
        "danger",
        (data && data.message) ? data.message : "Failed to load your horses."
      );
      renderMyHorses([]);
      return;
    }

    // Render the horse cards
    renderMyHorses(data);
  };

  fetchMethod(url, callback, "GET", null, token);
}

// Renders the horse list area
function renderMyHorses(list) {
  var container = document.getElementById("myHorsesList");
  if (!container) return;

  // Clear existing cards
  container.innerHTML = "";

  // Empty state UI if user has no horses
  if (!list || list.length === 0) {
    container.innerHTML =
      '<div class="emptyState">' +
        '<div class="emptyCard">' +
          '<h5 class="fw-bold mb-2">No horses yet 🐴</h5>' +
          '<div class="text-muted">Go to Gacha to pull your first horse!</div>' +
        "</div>" +
      "</div>";
    return;
  }

  // Build and append each horse card
  for (var i = 0; i < list.length; i++) {
    container.appendChild(buildHorseCard(list[i]));
  }
}

// Builds a single horse card with stats and buttons
function buildHorseCard(h) {
  var wrap = document.createElement("div");
  wrap.className = "horseCard";

  // Base stats from the horse data
  var baseSpeed = Number(h.speed || 0);
  var baseStamina = Number(h.stamina || 0);
  var baseStrength = Number(h.strength || 0);

  // Bonus stats from upgrades/training (if any)
  var bSpeed = Number(h.bonus_speed || 0);
  var bStamina = Number(h.bonus_stamina || 0);
  var bStrength = Number(h.bonus_strength || 0);

  // Total stats shown to the user
  var totalSpeed = baseSpeed + bSpeed;
  var totalStamina = baseStamina + bStamina;
  var totalStrength = baseStrength + bStrength;

  // Card UI layout
  wrap.innerHTML =
    '<div class="horseTop">' +
      '<div>' +
        '<h3 class="horseName">' + esc(h.name) + "</h3>" +
      "</div>" +
      '<div class="' + rarityBadgeClass(h.rarity) + '">' + esc(h.rarity) + "</div>" +
    "</div>" +

    '<ul class="statList">' +
      '<li><span>EXP</span><span>' + esc(h.exp) + "</span></li>" +
      '<li><span>Speed</span><span>' + totalSpeed + (bSpeed ? " (+" + bSpeed + ")" : "") + "</span></li>" +
      '<li><span>Stamina</span><span>' + totalStamina + (bStamina ? " (+" + bStamina + ")" : "") + "</span></li>" +
      '<li><span>Strength</span><span>' + totalStrength + (bStrength ? " (+" + bStrength + ")" : "") + "</span></li>" +
    "</ul>" +

    '<div class="horseActions">' +
      '<button class="btn btn-success btnCute" data-action="train">Train (+10 EXP)</button>' +
      '<button class="btn btn-outline-danger btnCute" data-action="release">Release</button>' +
    "</div>";

  // Buttons inside the card
  var trainBtn = wrap.querySelector('[data-action="train"]');
  var releaseBtn = wrap.querySelector('[data-action="release"]');

  // Training increases EXP (and may spend coins depending on backend rules)
  trainBtn.addEventListener("click", function () {
    trainHorse(h.user_horse_id, trainBtn);
  });

  // Release removes the horse from user's collection
  releaseBtn.addEventListener("click", function () {
    releaseHorse(h.user_horse_id, releaseBtn);
  });

  return wrap;
}

// Sends a request to train a specific horse
function trainHorse(user_horse_id, btnEl) {
  hideAlert();

  // Token is required for protected endpoints
  var token = localStorage.getItem("token");
  if (!token) return showAlert("warning", "Please login first.");

  // Basic loading state so user can't spam-click
  btnEl.disabled = true;
  var oldText = btnEl.textContent;
  btnEl.textContent = "Training...";

  var url = HORSE_BASE + "/my/" + user_horse_id + "/train";

  var callback = function (status, data) {
    // Restore button state
    btnEl.disabled = false;
    btnEl.textContent = oldText;

    // Error handling
    if (status >= 400) {
      showAlert("danger", (data && data.message) ? data.message : "Train failed.");
      return;
    }

    // Success message, optionally showing coin cost if backend returns it
    if (data && data.coins_spent != null) {
      showAlert("success", "Training success! -" + data.coins_spent + " coins.");
    } else {
      showAlert("success", "Training success!");
    }

    // Reload UI so the updated stats/EXP/coins show up
    loadMyHorses();
    loadCoins();
  };

  fetchMethod(url, callback, "PUT", null, token);
}

// Sends a request to release (delete) a specific horse
function releaseHorse(user_horse_id, btnEl) {
  hideAlert();

  var token = localStorage.getItem("token");
  if (!token) return showAlert("warning", "Please login first.");

  // Basic loading state so user can't spam-click
  btnEl.disabled = true;
  var oldText = btnEl.textContent;
  btnEl.textContent = "Releasing...";

  var url = HORSE_BASE + "/my/" + user_horse_id;

  var callback = function (status, data) {
    // Restore button state
    btnEl.disabled = false;
    btnEl.textContent = oldText;

    // Error handling
    if (status >= 400) {
      showAlert("danger", (data && data.message) ? data.message : "Release failed.");
      return;
    }

    // Success + refresh list
    showAlert("success", "Horse released!");
    loadMyHorses();
  };

  fetchMethod(url, callback, "DELETE", null, token);
}

// Escapes user-controlled text before inserting into HTML
function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Loads the user's current coin balance and updates the navbar/top display
function loadCoins() {
  var token = localStorage.getItem("token");
  var coinsEl = document.getElementById("displayCoins");
  if (!coinsEl) return;

  var callback = function (status, data) {
    if (status === 200) coinsEl.textContent = data.coins;
  };

  fetchMethod("/user/me", callback, "GET", null, token);
}
