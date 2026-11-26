// register.js

// Run once the register page HTML has fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Grab required form and UI elements
  const form = document.getElementById("registerForm");
  const alertBox = document.getElementById("alertBox");
  const submitBtn = document.getElementById("submitBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const requirementsBox = document.getElementById("requirements");

  // Checks password against the rules and returns which ones pass/fail
  function getPasswordRules(password) {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }

  // Updates a single requirement line with ✓ or ✗
  function setReqIcon(id, met) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = met ? "✓" : "✗";
  }

  // Shows/hides the requirements box and updates icons as user types
  function updateRequirementsUI() {
    if (!requirementsBox) return;

    const password = passwordInput.value || "";

    // If no password typed yet, keep the requirements box hidden
    if (password.length === 0) {
      requirementsBox.style.display = "none";
      return;
    }

    // Once user starts typing, show the requirements and update each rule
    requirementsBox.style.display = "block";

    const rules = getPasswordRules(password);
    setReqIcon("req-length", rules.length);
    setReqIcon("req-uppercase", rules.uppercase);
    setReqIcon("req-number", rules.number);
    setReqIcon("req-special", rules.special);
  }

  // Live update requirements UI while typing password
  if (passwordInput) {
    passwordInput.addEventListener("input", updateRequirementsUI);
  }

  // Handle register form submit
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear old messages before validating again
    if (alertBox) {
      alertBox.classList.add("d-none");
      alertBox.textContent = "";
    }

    // Use browser validation first (required fields, etc.)
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Read user input values
    const username = (usernameInput.value || "").trim();
    const password = passwordInput.value || "";

    // Basic username rule
    if (username.length < 3) {
      setAlert(alertBox, "Username must be at least 3 characters.", "danger");
      return;
    }

    // Check password rules
    const rules = getPasswordRules(password);
    const allMet = Object.values(rules).every(Boolean);

    if (!allMet) {
      setAlert(alertBox, "Password does not meet the requirements.", "danger");
      return;
    }

    // Disable submit button so user can't spam-submit
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Creating account...";

    // Payload sent to backend
    const data = { username: username, password: password };

    // Handle backend response
    const callback = function (responseStatus, responseData) {
      console.log("responseStatus:", responseStatus);
      console.log("responseData:", responseData);

      // Restore submit button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Registration success
      if (responseStatus === 200 || responseStatus === 201) {
        // If backend returns token on register, store it for instant login
        if (responseData && responseData.token) {
          localStorage.setItem("token", responseData.token);
        }

        setAlert(alertBox, "Account created! Redirecting to home...", "success");

        // Small delay so user sees the success message
        setTimeout(function () {
          window.location.href = "index.html";
        }, 900);

        return;
      }

      // Registration failed: show message from backend if available
      const msg =
        responseData && responseData.message
          ? responseData.message
          : "Registration failed.";
      setAlert(alertBox, msg, "danger");
    };

    // Send request to backend register endpoint
    fetchMethod("/user/register", callback, "POST", data);
  });
});

// Shared alert helper for this page
function setAlert(alertBox, message, type) {
  // Fallback: if alertBox is missing, use browser alert
  if (!alertBox) {
    alert(message);
    return;
  }

  // Display bootstrap-style alert message
  alertBox.className = "alert alert-" + type;
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}
