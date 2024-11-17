function saveText(event) {
  event.preventDefault(); // 페이지 새로고침 방지
  const text = document.getElementById("guneeTextarea").value;

  // AJAX로 서버에 텍스트 전송
  fetch("/save-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("텍스트가 성공적으로 저장되었습니다!");
      } else {
        alert("저장에 실패했습니다.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

// 로그인 상태에 따라 UI를 업데이트하는 함수
function updateUI() {
  const authButtons = document.getElementById("auth-buttons");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");
  const guneewatch = document.getElementById("guneewatch");

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

  if (username === "admin") {
    guneewatch.style.display = "flex";
  } else {
    guneewatch.style.display = "none";
  }
}

// 로그아웃 함수
function logout() {
  localStorage.removeItem("username"); // 로컬 스토리지에서 사용자 이름 삭제
  updateUI(); // UI 업데이트
}

// 페이지 로드 시 UI 업데이트
window.onload = updateUI;
