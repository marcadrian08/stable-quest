// badge.js

// Base API path for badge-related requests
var BADGE_BASE = "/trainerBadge";

// How often the badge data auto-refreshes
var REFRESH_MS = 2000;

// Timer reference for auto refresh
var refreshTimer = null;

// Last known EXP value, used to detect changes
var lastExp = null;

// Cached list of all badge tiers
var allBadgesCache = [];

// Run once the page has fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Update navbar login/profile buttons based on auth state
  setupAuthUI();

  // Redirect to login if user is not authenticated
  var token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Hide any existing alert messages
  hideAlert();

  // Load all badge tiers and the user's current badge
  loadAllBadges();
  loadMyBadge();

  // Start automatic refresh for badge progress
  startAutoRefresh();

  // Refresh badge data when the tab becomes active again
  window.addEventListener("focus", function () {
    loadMyBadge();
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      loadMyBadge();
    }
  });
});

/* =========================
   NAV AUTH UI
========================= */

// Controls which navbar buttons are visible
function setupAuthUI() {
  var token = localStorage.getItem("token");

  var navLogin = document.getElementById("navLogin");
  var navRegister = document.getElementById("navRegister");
  var navProfile = document.getElementById("navProfile");
  var navLogout = document.getElementById("navLogout");

  // If logged in, hide login/register and show profile/logout
  if (token) {
    if (navLogin) navLogin.classList.add("d-none");
    if (navRegister) navRegister.classList.add("d-none");
    if (navProfile) navProfile.classList.remove("d-none");
    if (navLogout) navLogout.classList.remove("d-none");
  }
}

/* =========================
   AUTO REFRESH
========================= */

// Starts periodic badge refresh
function startAutoRefresh() {
  stopAutoRefresh();

  refreshTimer = setInterval(function () {
    loadMyBadge();
  }, REFRESH_MS);
}

// Stops the existing refresh timer if one is running
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

/* =========================
   ALERT HELPERS
========================= */

// Shows a bootstrap-style alert message
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

/* =========================
   UTIL
========================= */

// Escapes text before inserting into HTML
// Prevents broken layout and basic injection issues
function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   LOAD ALL BADGES
========================= */

// Fetches the full list of badge tiers
function loadAllBadges() {
  var url = BADGE_BASE + "/badges";

  var callback = function (status, data) {
    // If request fails, clear badge list
    if (status >= 400) {
      showAlert("danger", "Failed to load badge list.");
      allBadgesCache = [];
      renderBadgeList([], null);
      return;
    }

    // Store badge tiers for later use
    allBadgesCache = data || [];
    renderBadgeList(allBadgesCache, null);

    // Update progress bar if EXP already exists
    if (lastExp != null) {
      updateProgress(lastExp);
    }
  };

  fetchMethod(url, callback, "GET", null, null);
}

/* =========================
   LOAD MY BADGE + EXP
========================= */

// Fetches the user's total EXP and current badge
function loadMyBadge() {
  var token = localStorage.getItem("token");
  var url = BADGE_BASE + "/badges/me";

  var callback = function (status, data) {
    if (status >= 400) {
      showAlert(
        "danger",
        (data && data.message) ? data.message : "Failed to load your badge."
      );
      return;
    }

    // Extract total EXP
    var totalExp = (data && data.total_exp != null)
      ? Number(data.total_exp)
      : 0;

    // Extract current badge
    var badge = (data && data.badge) ? data.badge : null;

    // Update EXP display at the top
    var topExpEl = document.getElementById("displayTotalExp");
    if (topExpEl) topExpEl.textContent = totalExp;

    // If EXP did not change, only update small UI parts
    if (lastExp === totalExp) {
      updateMyBadgeUI(totalExp, badge);
      updateProgress(totalExp);
      return;
    }

    // Store new EXP value
    lastExp = totalExp;

    // Update all badge-related UI
    updateMyBadgeUI(totalExp, badge);
    renderBadgeList(allBadgesCache, badge);
    updateProgress(totalExp);
  };

  fetchMethod(url, callback, "GET", null, token);
}

/* =========================
   CURRENT BADGE UI
========================= */

// Updates the current badge name and EXP pill
function updateMyBadgeUI(totalExp, badge) {
  var expPill = document.getElementById("expPill");
  var nameEl = document.getElementById("currentBadgeName");

  if (expPill) expPill.textContent = "EXP: " + totalExp;
  if (nameEl) nameEl.textContent = badge ? badge.name : "No Badge";
}

/* =========================
   PROGRESS BAR
========================= */

// Updates the badge progress bar and next badge hint
function updateProgress(totalExp) {
  var leftEl = document.getElementById("progressLeft");
  var rightEl = document.getElementById("progressRight");
  var barEl = document.getElementById("badgeProgressBar");
  var hintEl = document.getElementById("nextHint");

  if (leftEl) leftEl.textContent = totalExp + " EXP";

  var current = null;
  var next = null;

  // Determine current and next badge tier
  for (var i = 0; i < allBadgesCache.length; i++) {
    var b = allBadgesCache[i];
    if (Number(b.min_exp) <= totalExp) current = b;
    if (Number(b.min_exp) > totalExp) {
      next = b;
      break;
    }
  }

  // Fallback to first badge if none matched
  if (!current && allBadgesCache.length > 0) {
    current = allBadgesCache[0];
  }

  // User has reached the highest tier
  if (!next) {
    if (rightEl) rightEl.textContent = "Max tier";
    if (hintEl) hintEl.textContent = "You reached the highest badge tier 🎉";
    if (barEl) barEl.style.width = "100%";
    return;
  }

  // Show next badge requirement
  if (rightEl) {
    rightEl.textContent = "Next: " + next.name + " (" + next.min_exp + " EXP)";
  }

  var curMin = Number(current.min_exp || 0);
  var nextMin = Number(next.min_exp);

  // Calculate progress percentage
  var pct = 0;
  if (nextMin > curMin) {
    pct = ((totalExp - curMin) / (nextMin - curMin)) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
  }

  if (barEl) barEl.style.width = pct.toFixed(0) + "%";

  var remaining = nextMin - totalExp;
  if (hintEl) {
    hintEl.textContent =
      remaining + " more EXP to reach " + next.name + ".";
  }
}

/* =========================
   BADGE LIST
========================= */

// Renders the full list of badge tiers
function renderBadgeList(list, myBadge) {
  var container = document.getElementById("badgeList");
  if (!container) return;

  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML =
      '<p class="text-muted text-center mb-0">No badges found.</p>';
    return;
  }

  var myName = myBadge ? String(myBadge.name) : "";

  for (var i = 0; i < list.length; i++) {
    container.appendChild(buildBadgeTier(list[i], myName));
  }
}

// Builds the DOM element for a single badge tier
function buildBadgeTier(b, myBadgeName) {
  var wrap = document.createElement("div");

  var minExp = Number(b.min_exp || 0);
  var name = String(b.name || "");

  wrap.className = "badgeTier";

  // Highlight current badge
  if (myBadgeName && name === myBadgeName) {
    wrap.classList.add("current");
  }

  // Lock badges not yet reachable
  if (minExp > Number(lastExp || 0)) {
    wrap.classList.add("locked");
  }

  wrap.innerHTML =
    '<div>' +
      '<div class="small text-muted">Tier</div>' +
      '<h5 class="badgeName mb-1">' + esc(name) + "</h5>" +
      '<div class="smallMuted">Requires total EXP ≥ <span class="fw-bold">' +
        minExp +
      "</span></div>" +
    "</div>" +
    '<div class="badgeReq">' + minExp + " EXP</div>";

  return wrap;
}
