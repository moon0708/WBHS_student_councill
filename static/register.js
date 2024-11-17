function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

// signup.js
document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json()) // JSON 응답 처리
    .then((data) => {
      if (data.success) {
        successMessage.textContent = data.message; // 성공 메시지 표시
        errorMessage.textContent = "";
        alert("회원가입 성공!");
        location.replace("/login.html");
      } else {
        errorMessage.textContent = data.message; // 오류 메시지 표시
        successMessage.textContent = "";
      }
    })
    .catch((error) => {
      errorMessage.textContent = "회원가입 오류: " + error.message;
      successMessage.textContent = "";
    });
});

// 로그인 상태에 따라 UI를 업데이트하는 함수
function updateUI() {
  const authButtons = document.getElementById("auth-buttons");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");

  // 로컬 스토리지에서 사용자 이름 가져오기
  const username = localStorage.getItem("username");

  if (username) {
    // 로그인 상태일 경우
    authButtons.style.display = "none"; // 로그인/회원가입 버튼 숨기기
    userInfo.style.display = "flex"; // 사용자명 및 로그아웃 버튼 표시
    usernameDisplay.textContent = username; // 사용자 이름 삽입
  } else {
    // 로그아웃 상태일 경우
    authButtons.style.display = "flex"; // 로그인/회원가입 버튼 보이기
    userInfo.style.display = "none"; // 사용자명 및 로그아웃 버튼 숨기기
  }
}

// 로그아웃 함수
function logout() {
  localStorage.removeItem("username"); // 로컬 스토리지에서 사용자 이름 삭제
  updateUI(); // UI 업데이트
}

// 페이지 로드 시 UI 업데이트
window.onload = updateUI;
