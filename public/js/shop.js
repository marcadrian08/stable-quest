// shop.js

document.addEventListener("DOMContentLoaded", function () {
  // Page UI elements
  const alertBox = document.getElementById("alertBox");
  const displayCoins = document.getElementById("displayCoins");
  const pullBtn = document.getElementById("pullBtn");

  // Result UI elements (shown after a successful pull)
  const resultBox = document.getElementById("resultBox");
  const horseName = document.getElementById("horseName");
  const horseRarity = document.getElementById("horseRarity");

  // Shop page is protected: redirect if not logged in
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Display-friendly rarity labels
  var rarityEmoji = {
    common: "⚪ Common",
    rare: "🔵 Rare",
    epic: "🟣 Epic",
    legendary: "🟡 Legendary"
  };

  // Shows a bootstrap-style alert message
  function showAlert(msg, type) {
    alertBox.className = "alert alert-" + (type || "info");
    alertBox.textContent = msg;
    alertBox.classList.remove("d-none");
  }

  // Hides the alert box
  function hideAlert() {
    alertBox.classList.add("d-none");
  }

  // Loads the user's current coins and updates the display
  function loadCoins() {
    fetchMethod(
      "/user/me",
      function (status, data) {
        if (status === 200) {
          displayCoins.textContent = data.coins;
        }
      },
      "GET",
      null,
      token
    );
  }

  // Handle gacha pull button click
  pullBtn.addEventListener("click", function () {
    // Clear any previous messages and results
    hideAlert();
    resultBox.classList.add("d-none");

    // Loading state so user can't spam pulls
    pullBtn.disabled = true;
    const oldText = pullBtn.textContent;
    pullBtn.textContent = "Pulling...";

    // Request a gacha pull from the backend
    fetchMethod(
      "/shop/gacha",
      function (status, data) {
        // Restore button state
        pullBtn.disabled = false;
        pullBtn.textContent = oldText;

        // Successful pull: backend returns the horse data
        if (status === 201) {
          horseName.textContent = data.horse.name;

          // Convert rarity into a nicer label if possible
          var r = String(data.horse.rarity || "").toLowerCase();
          horseRarity.textContent = rarityEmoji[r] || data.horse.rarity;

          // Show result section and refresh coin balance
          resultBox.classList.remove("d-none");
          loadCoins();
        } else {
          // Failed pull: show backend error message if available
          showAlert(data.message || "Gacha failed.", "danger");
        }
      },
      "POST",
      null,
      token
    );
  });

  // Initial page load: show current coins
  loadCoins();
});
