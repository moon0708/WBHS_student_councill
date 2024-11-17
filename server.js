const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const os = require("os"); // os 모듈 추가
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Body-parser 미들웨어 설정 (JSON 및 URL 인코딩된 데이터 처리)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 'static' 폴더를 정적 파일로 제공
app.use(express.static(path.join(__dirname, "static")));

// 특정 경로에서 파일을 전송
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "path001.html"));
});

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: "localhost", // 데이터베이스 호스트
  user: "root", // 데이터베이스 사용자
  password: "0000", // 데이터베이스 비밀번호
  database: "studentdb", // 데이터베이스 이름
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL 연결 성공");
});

const cors = require("cors");
// 미들웨어 설정
app.use(cors());

// POST 요청을 처리하고 텍스트를 저장
app.post("/save-text", (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "텍스트가 없습니다." });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `건의 ${timestamp}.txt`;
  const filePath = path.join("static/건의", fileName);

  fs.writeFile(filePath, text, (err) => {
    if (err) {
      console.error("파일 저장 오류:", err);
      return res
        .status(500)
        .json({ success: false, message: "파일 저장 실패" });
    }

    return res.json({ success: true, message: `성공` });
  });
});

// 서버의 IP 주소를 가져오는 함수
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let iface of Object.values(interfaces)) {
    for (let details of iface) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address; // 내부 IP가 아닌 실제 IP 주소 반환
      }
    }
  }
  return "localhost"; // IP 주소를 찾지 못할 경우 localhost 반환
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // 한글 포함 여부 검사 (유니코드 범위 사용)
  const koreanPattern = /[\u3131-\uD79D]/;

  // 아이디와 비밀번호에 한글이 포함된 경우
  if (koreanPattern.test(username)) {
    return res.status(400).json({
      success: false,
      message: "아이디는 한글을 포함할 수 없습니다.",
    });
  }
  if (koreanPattern.test(password)) {
    return res.status(400).json({
      success: false,
      message: "비밀번호는 한글을 포함할 수 없습니다.",
    });
  }

  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 등록 쿼리
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        // 사용자 이름이 이미 존재하는 경우
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "사용자 이름이 이미 존재합니다.",
          });
        }
        // 다른 오류의 경우
        return res.status(500).json({
          success: false,
          message: "사용자 등록 실패",
          error: err,
        });
      }
      // 성공 시 응답
      res.status(201).json({
        success: true,
        message: "사용자 등록 성공",
      });
    });
  } catch (error) {
    // 해싱 오류 발생 시
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다. 다시 시도해 주세요.",
      error: error.message,
    });
  }
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).send("서버 오류");
    }

    if (results.length > 0) {
      const user = results[0];
      // 비밀번호 비교
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          // 비밀번호가 일치하면 성공 응답
          res.status(200).send("로그인 성공");
        } else {
          // 비밀번호 불일치
          res.status(401).send("로그인 실패: 잘못된 비밀번호");
        }
      });
    } else {
      // 사용자 없음
      res.status(401).send("로그인 실패: 사용자 이름이 존재하지 않습니다.");
    }
  });
});

// 회원가입 엔드포인트
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        // 중복 사용자명 오류를 JSON 형식으로 반환
        return res.json({
          success: false,
          message: "이미 존재하는 사용자명입니다.",
        });
      } else {
        // 기타 데이터베이스 오류를 JSON 형식으로 반환
        return res.json({ success: false, message: "데이터베이스 오류" });
      }
    }
    // 회원가입 성공 시 JSON 형식으로 응답
    res.json({ success: true, message: "사용자 등록 성공" });
  });
});

// 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/uploads", express.static(path.join(__dirname, "static/uploads")));

// Multer 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "static/uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// API 경로
// 1. 게시글 작성
app.post("/api/posts", upload.single("image"), (req, res) => {
  const { title, content, username } = req.body; // username 추가
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // 작성자 기본값 설정
  const author = username || "guest";

  const sql =
    "INSERT INTO Posts (title, content, image_url, username) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, content, imageUrl, author], (err, result) => {
    if (err)
      return res.status(500).send({ message: "게시글 작성 실패", error: err });
    res.json({ message: "게시글 작성 완료!", postId: result.insertId });
  });
});

// 2. 게시글 목록 가져오기
app.get("/api/posts", (req, res) => {
  const sql = "SELECT * FROM Posts ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 3. 댓글 작성
app.post("/api/comments", (req, res) => {
  const { postId, comment } = req.body;

  const sql = "INSERT INTO Comments (post_id, comment) VALUES (?, ?)";
  db.query(sql, [postId, comment], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "댓글 작성 완료!", commentId: result.insertId });
  });
});

// 4. 댓글 가져오기
app.get("/api/comments/:postId", (req, res) => {
  const { postId } = req.params;

  const sql =
    "SELECT * FROM Comments WHERE post_id = ? ORDER BY created_at ASC";
  db.query(sql, [postId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// 게시글 상세보기
app.get("/api/posts/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM Posts WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    res.json(results[0]);
  });
});

app.get("/api/auth-check", (req, res) => {
  // 로그인 상태를 확인하는 코드
  if (req.session && req.session.user) {
    res.json({ isAuthenticated: true, username: req.session.user.username });
  } else {
    res.json({ isAuthenticated: false });
  }
});
const directoryPath = path.join(__dirname, "static", "건의");

// API: "건의" 폴더의 텍스트 파일 읽기
app.get("/api/files", (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "폴더를 읽을 수 없습니다." });
    }

    // .txt 파일 필터링
    const txtFiles = files.filter((file) => file.endsWith(".txt"));
    const fileContents = [];

    // 파일 내용 읽기
    txtFiles.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      fileContents.push({ name: file, content });
    });

    res.json(fileContents);
  });
});

// 서버 시작 - 모든 IP에서 접근 가능하도록 수정
app.listen(PORT, "0.0.0.0", () => {
  const ipAddress = getIPAddress(); // IP 주소 가져오기
  console.log(`서버가 http://${ipAddress}:${PORT} 에서 실행 중입니다.`);
});
