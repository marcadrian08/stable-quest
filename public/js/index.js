// index.js

// Run this logic once the page HTML has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Read JWT token from localStorage to check login state
  const token = localStorage.getItem("token");

  // Handle links that require login before access
  // Any <a> tag with data-protected="true" will be intercepted
  document.querySelectorAll('a[data-protected="true"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      // If user is logged in, allow normal navigation
      if (token) return;

      // Otherwise, block the link
      e.preventDefault();

      // Save intended destination so we can redirect after login
      localStorage.setItem(
        "afterLoginRedirect",
        link.getAttribute("href")
      );

      // Send user to login page
      window.location.href = "login.html";
    });
  });

  // Navbar elements (may or may not exist depending on page)
  const navLogin = document.getElementById("navLogin");
  const navRegister = document.getElementById("navRegister");
  const navProfile = document.getElementById("navProfile");
  const navLogout = document.getElementById("navLogout");
  const logoutBtn = document.getElementById("logoutBtn");

  // If user is logged in, adjust navbar visibility
  if (token) {
    navLogin?.classList.add("d-none");
    navRegister?.classList.add("d-none");
    navProfile?.classList.remove("d-none");
    navLogout?.classList.remove("d-none");
  }

  // Logout button handler
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    // Clear authentication token
    localStorage.removeItem("token");

    // Return user to home page
    window.location.href = "index.html";
  });
});
