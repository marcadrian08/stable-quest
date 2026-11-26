// Run once the login page HTML is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Grab required form and UI elements
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");
  const submitBtn = document.getElementById("submitBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Helper function to show alert messages
  function setAlert(container, message, type) {
    container.className = "alert alert-" + (type || "info");
    container.textContent = message;
    container.classList.remove("d-none");
  }

  // Handle login form submission
  form.addEventListener("submit", function (event) {
    // Stop normal form submission
    event.preventDefault();

    // Reset alert state
    alertBox.classList.add("d-none");
    alertBox.textContent = "";

    // Use browser validation first
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Read and clean input values
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Manual empty checks with user-friendly messages
    if (username.length === 0) {
      setAlert(alertBox, "Username cannot be empty.", "danger");
      return;
    }

    if (password.length === 0) {
      setAlert(alertBox, "Password cannot be empty.", "danger");
      return;
    }

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing in...";

    // Prepare login payload
    const data = { username: username, password: password };

    // Handle server response
    const callback = function (responseStatus, responseData) {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Successful login
      if (responseStatus === 200 && responseData.token) {
        // Save JWT token for authenticated requests
        localStorage.setItem("token", responseData.token);

        setAlert(alertBox, "Login successful! Redirecting...", "success");

        // Small delay so user can see success message
        setTimeout(function () {
          window.location.href = "index.html";
        }, 800);
      } else {
        // Show backend message if available
        const msg =
          responseData && responseData.message
            ? responseData.message
            : "Invalid username or password.";
        setAlert(alertBox, msg, "danger");
      }
    };

    // Send login request to backend
    fetchMethod("/user/login", callback, "POST", data);
  });
});
