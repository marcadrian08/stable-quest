// profile.js
// This file controls the Profile page UI + API calls.
// What it does:
// 1) On page load, it checks for a JWT token in localStorage.
// 2) If token exists, it loads the current logged-in user profile using GET /user/me.
// 3) It supports two modes:
//    - View mode: shows username + coins
//    - Edit mode: allows the user to update their username
// 4) Username update uses PUT /user/me (NOT /user/:id), because backend now uses /me.
//
// Notes / CA constraints:
// - No async/await
// - No try/catch
// - Uses fetchMethod(url, callback, method, data, token) from queryCMDS.js
//
// Why your page was "Saving..." forever:
// - It was calling PUT /user/:id (old route). After changing backend to /user/me,
//   PUT /user/:id returns 404 HTML, which can break JSON parsing in fetchMethod.
// - If callback never receives valid JSON, your code may not restore the button text.
// - Fix is to call PUT /user/me and remove dependency on currentUserId.

document.addEventListener("DOMContentLoaded", function () {
  // Alert element at the top of the card (Bootstrap alert styles)
  const alertBox = document.getElementById("alertBox");

  // Two UI states:
  // - viewMode: shows the current username and coins
  // - editMode: shows the form to update username
  const viewMode = document.getElementById("viewMode");
  const editMode = document.getElementById("editMode");

  // Text elements in view mode
  const displayUsername = document.getElementById("displayUsername");
  const displayCoins = document.getElementById("displayCoins");

  // Buttons for switching modes / saving changes
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");

  // Username input in edit mode
  const usernameInput = document.getElementById("usernameInput");

  // JWT token must exist to access this page
  const token = localStorage.getItem("token");
  if (!token) {
    // No token = not logged in
    // Redirect user to login page
    window.location.href = "login.html";
    return;
  }

  // Base route for user endpoints
  // (Your backend routes look like: /user/me, /user/login, /user/register, etc.)
  const USER_BASE = "/user";

  // Store current username so we can:
  // - preload input field when switching to edit mode
  // - update UI immediately after successful save
  let currentUsername = "";

  /* =========================
     ALERT HELPERS
     - showAlert displays a bootstrap alert with message + type
     - hideAlert hides it and clears the text
  ========================= */
  function showAlert(message, type) {
    // type examples: "success", "danger", "warning", "info"
    alertBox.className = "alert alert-" + (type || "info");
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  function hideAlert() {
    alertBox.classList.add("d-none");
    alertBox.textContent = "";
  }

  /* =========================
     VIEW/EDIT MODE TOGGLING
     - switchToView shows the read-only display
     - switchToEdit shows the edit form
  ========================= */
  function switchToView() {
    // Hide edit form, show view mode
    editMode.classList.add("d-none");
    viewMode.classList.remove("d-none");
  }

  function switchToEdit() {
    // Hide view mode, show edit form
    viewMode.classList.add("d-none");
    editMode.classList.remove("d-none");

    // Pre-fill the input with the currently loaded username
    usernameInput.value = currentUsername;

    // Place cursor into input so user can type immediately
    usernameInput.focus();
  }

  /* =========================
     LOAD PROFILE
     GET /user/me (protected)
     - Loads the currently logged-in user's data from backend.
     - We do NOT use /user/:id anymore.
  ========================= */
  function loadProfile() {
    // Always call /me because the backend determines the user from the token
    fetchMethod(
      USER_BASE + "/me",
      function (status, data) {
        console.log("GET /me status:", status, data);

        if (status === 200) {
          // Save username locally for edit mode
          currentUsername = data.username || "";

          // Update UI in view mode
          displayUsername.textContent = currentUsername;

          // Coins might be null/undefined; default to 0 for display
          displayCoins.textContent = (data.coins != null) ? data.coins : 0;

          hideAlert();

          // When profile loads successfully, ensure view mode is shown
          // (useful if user refreshed while in edit mode)
          switchToView();
          return;
        }

        // Common case: 401 if token is invalid/expired
        // You can redirect here if you want (optional)
        // if (status === 401) { localStorage.removeItem("token"); window.location.href = "login.html"; return; }

        showAlert((data && data.message) ? data.message : "Failed to load profile.", "danger");
      },
      "GET",
      null,
      token
    );
  }

  /* =========================
     BUTTON EVENTS
  ========================= */

  // Click "Edit" -> go to edit mode
  editBtn.addEventListener("click", function () {
    hideAlert();
    switchToEdit();
  });

  // Click "Cancel" -> discard changes and go back to view mode
  cancelBtn.addEventListener("click", function () {
    hideAlert();
    switchToView();
  });

  /* =========================
     SUBMIT EDIT FORM
     PUT /user/me (protected)
     - Updates username for currently logged-in user.
     - No longer needs currentUserId in URL.
  ========================= */
  editMode.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert();

    // Let Bootstrap validation styles run if your form uses required attributes
    if (!editMode.checkValidity()) {
      editMode.classList.add("was-validated");
      return;
    }

    // Clean user input
    const newUsername = usernameInput.value.trim();

    // Basic frontend validation (backend should still validate too)
    if (newUsername.length < 3) {
      showAlert("Username must be at least 3 characters.", "danger");
      return;
    }

    // Optional: If user didn't change anything, avoid calling API
    if (newUsername === currentUsername) {
      showAlert("No changes to save.", "info");
      switchToView();
      return;
    }

    // Disable the save button to prevent double submits
    saveBtn.disabled = true;
    const oldText = saveBtn.textContent;
    saveBtn.textContent = "Saving...";

    // IMPORTANT FIX:
    // Use /user/me instead of /user/:id
    fetchMethod(
      USER_BASE + "/me",
      function (status, responseData) {
        // Always re-enable button in the callback (success or fail)
        saveBtn.disabled = false;
        saveBtn.textContent = oldText;

        console.log("PUT /me status:", status, responseData);

        if (status === 200) {
          // Update local cached username so edit mode stays consistent
          currentUsername = newUsername;

          // Update view mode display immediately (no need to refresh page)
          displayUsername.textContent = currentUsername;

          showAlert("Username updated successfully.", "success");

          // Switch back to view mode after save
          switchToView();

          // Optional: refresh user data from server again (safe)
          // This helps if backend also updates other fields.
          loadProfile();
          return;
        }

        // If token expired/invalid, redirect to login
        if (status === 401) {
          localStorage.removeItem("token");
          window.location.href = "login.html";
          return;
        }

        // Show backend error message if provided (e.g., username already exists)
        showAlert(
          (responseData && responseData.message) ? responseData.message : "Update failed.",
          "danger"
        );
      },
      "PUT",
      { username: newUsername },
      token
    );
  });

  // Init: load profile immediately on page load
  loadProfile();
});
