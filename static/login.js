// login.js

// 비밀번호 보기/숨기기 기능
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-password");

  // 비밀번호가 보이는 상태인지 확인 후 토글
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

// 로그인 함수
async function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");
  const correctMessage = document.getElementById("correct-message");

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    // 로그인 성공
    localStorage.setItem("username", username);
    alert("로그인 성공!");
    location.replace("/path001.html");
    correctMessage.textContent = "로그인 성공";
    errorMessage.textContent = "";
    updateUI();
  } else {
    // 로그인 실패 시 에러 메시지 표시
    const errorText = await response.text();
    errorMessage.textContent = errorText;
    correctMessage.textContent = "";
  }
}

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
