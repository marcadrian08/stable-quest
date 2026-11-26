// logoutUser.js

// Run once the page has fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Retrieve login token to check authentication state
  const token = localStorage.getItem("token");

  // Navbar elements related to user account actions
  const navProfile = document.getElementById("navProfile");
  const navLogout = document.getElementById("navLogout");
  const logoutBtn = document.getElementById("logoutBtn");

  // If user is logged in, show Profile and Logout links
  if (token) {
    if (navProfile) navProfile.classList.remove("d-none");
    if (navLogout) navLogout.classList.remove("d-none");
  }

  // Handle user logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      // Stop default link behavior
      e.preventDefault();

      // Remove authentication token from storage
      localStorage.removeItem("token");

      // Redirect user to the login page
      window.location.href = "login.html";
    });
  }
});
