document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#fileTable tbody");

  // API에서 파일 데이터 가져오기
  fetch("/api/files")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((file) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = file.name;

        const contentCell = document.createElement("td");
        const pre = document.createElement("pre");
        pre.textContent = file.content;
        contentCell.appendChild(pre);

        row.appendChild(nameCell);
        row.appendChild(contentCell);
        tableBody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("파일 데이터를 불러오는 중 오류가 발생했습니다:", err);
    });
});
