const days = ["月", "火", "水", "木", "金"];
const periods = [
  { no: 1, time: "09:20\n-\n10:50" },
  { no: 2, time: "11:05\n-\n12:35" },
  { no: 3, time: "13:45\n-\n15:15" },
  { no: 4, time: "15:30\n-\n17:00" },
  { no: 5, time: "17:15\n-\n18:45" }
];
const pageNames = new Set(["timetable", "assignments", "notifications", "mail", "mypage"]);

const courses = [
  course("mon-1", "月", 1, "材料力学", "2604", "blue", "佐々木 亮", "材料に力が加わったときの応力、ひずみ、曲げを扱う授業です。"),
  course("tue-1", "火", 1, "情報数学", "2604", "blue", "高橋 真央", "集合、論理、グラフ理論など、情報分野の基礎数学を学びます。"),
  course("wed-1", "水", 1, "総合英語III", "2802A", "pink", "Brown A.", "技術文書の読解と短いプレゼンテーション練習を行います。"),
  course("thu-1", "木", 1, "英語演習", "5303", "pink", "中村 彩", "ペアワークを中心に、発音と会話表現を練習します。"),
  course("fri-1", "金", 1, "科学技術と企業経営", "2801", "blue", "小林 岳", "技術開発と企業経営の関係を事例から考えます。"),
  course("tue-2", "火", 2, "回路理論および演習", "5303", "blue", "江川 隆輔", "直流回路、交流回路、演習問題を扱います。"),
  course("wed-2", "水", 2, "色彩・構成論", "5708演習室3", "pink", "石井 奈々", "色彩計画とレイアウト構成の基礎を制作で確認します。"),
  course("thu-2", "木", 2, "デザインのための認知科学", "2401", "blue", "森田 景子", "人の知覚、注意、記憶をUIデザインの観点で学びます。"),
  course("fri-2", "金", 2, "隔週 回路理論および演習", "2904", "blue", "江川 隆輔", "隔週開講の補足演習です。回路計算の確認を行います。"),
  course("mon-3", "月", 3, "コンピュータプログラムII", "5402", "blue", "田村 航", "JavaScriptを使って、配列、関数、DOM操作を学びます。"),
  course("wed-3", "水", 3, "芸術", "21001", "pink", "井上 美咲", "造形表現と鑑賞を通して、デザインの感性を広げます。"),
  course("thu-3", "木", 3, "人間中心設計", "5501", "pink", "山本 景子", "ユーザ調査、ペルソナ、プロトタイプ、評価までを扱います。"),
  course("fri-3", "金", 3, "デザイン工学PBL-A", "5501", "blue", "PBL担当教員", "チームで課題を設定し、プロトタイプ制作と発表を行います。"),
  course("thu-4", "木", 4, "コンピュータアーキテクチャ", "5501", "pink", "鈴木 茂", "CPU、メモリ、命令実行の仕組みを学びます。"),
  course("fri-4", "金", 4, "デザイン工学PBL-A", "未登録", "blue", "PBL担当教員", "PBL作業時間です。教室は週ごとに掲示で確認します。")
];

const timetableGrid = document.querySelector("#timetable-grid");
const dialog = document.querySelector("#course-dialog");
const detail = document.querySelector("#course-detail");

renderTimetable();
initializeNavigation();
updateDeadlineCountdowns();
registerServiceWorker();

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav-page]");
  const lesson = event.target.closest("[data-course-id]");
  const detailTab = event.target.closest("[data-detail-tab]");
  const close = event.target.closest("[data-close-dialog]");

  if (nav) {
    setPage(nav.dataset.navPage);
  }

  if (detailTab) {
    setDetailPanel(detailTab.dataset.detailTab);
  }

  if (lesson) {
    openCourseDetail(lesson.dataset.courseId);
  }

  if (close) {
    dialog.close();
  }
});

function course(id, day, period, title, room, color, teacher, summary) {
  return {
    id,
    day,
    period,
    title,
    room,
    color,
    teacher,
    summary,
    task: "次回までに授業資料を確認してください。",
    material: `${title}_第${period}回資料.pdf`,
    syllabus: `${title}では、授業の到達目標、評価方法、毎回の学習内容を確認できます。出席、課題提出、小テストを総合して評価します。`,
    teacherMail: `${id}@tdu-class.example.jp`
  };
}

function renderTimetable() {
  let html = `<div></div>`;
  html += days.map((day) => `<div class="day-label ${day === "木" ? "is-today" : ""}"><span>${day}</span></div>`).join("");

  periods.forEach((period) => {
    html += `<div class="period-label"><strong>${period.no}</strong><span>${period.time}</span></div>`;
    days.forEach((day) => {
      const item = courses.find((entry) => entry.day === day && entry.period === period.no);
      html += item ? lessonCell(item) : `<div class="empty-cell" aria-hidden="true"></div>`;
    });
  });

  timetableGrid.innerHTML = html;
}

function lessonCell(item) {
  return `<button class="lesson-cell ${item.color}" type="button" data-course-id="${item.id}" aria-label="${escapeHtml(item.title)}の詳細を開く">
    <span class="lesson-title">${escapeHtml(item.title)}</span>
    <span class="room-pill">${escapeHtml(item.room)}</span>
  </button>`;
}

function openCourseDetail(courseId) {
  const item = courses.find((entry) => entry.id === courseId);
  if (!item) return;

  detail.innerHTML = `<div class="detail-hero ${item.color}">
      <h2>${escapeHtml(item.title)}</h2>
      <div class="detail-meta">
        <span>${escapeHtml(item.day)}曜 ${item.period}限</span>
        <span>${periods[item.period - 1].time.replace(/\n/g, "")}</span>
        <span>${escapeHtml(item.room)}</span>
      </div>
    </div>
    <div class="detail-tabs" role="tablist" aria-label="授業詳細メニュー">
      <button class="detail-tab is-active" type="button" data-detail-tab="syllabus">シラバスを表示</button>
      <button class="detail-tab" type="button" data-detail-tab="mail">教授にメールを送る</button>
    </div>
    <div class="detail-action-row">
      <button class="materials-button" type="button" data-detail-tab="materials">授業資料を表示</button>
    </div>
    <section class="detail-panel is-active" data-detail-panel="syllabus">
      <h3>シラバス</h3>
      <p>${escapeHtml(item.syllabus)}</p>
    </section>
    <section class="detail-panel" data-detail-panel="mail">
      <div class="mail-draft">
        <h3>教授へのメール</h3>
        <span>宛先: ${escapeHtml(item.teacher)} &lt;${escapeHtml(item.teacherMail)}&gt;</span>
        <textarea aria-label="教授へのメール本文">先生、${escapeHtml(item.title)}について質問があります。</textarea>
        <button class="send-preview" type="button">下書きを保存</button>
      </div>
    </section>
    <section class="detail-panel" data-detail-panel="materials">
      <h3>授業資料</h3>
      <p>${escapeHtml(item.material)}</p>
    </section>
    <div class="detail-body">
      <section class="detail-section">
        <h3>担当教員</h3>
        <p>${escapeHtml(item.teacher)}</p>
      </section>
      <section class="detail-section">
        <h3>授業概要</h3>
        <p>${escapeHtml(item.summary)}</p>
      </section>
      <section class="detail-section">
        <h3>連絡・課題</h3>
        <p>${escapeHtml(item.task)}</p>
      </section>
    </div>`;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function setDetailPanel(panelName) {
  document.querySelectorAll("[data-detail-tab]").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.detailTab === panelName);
  });
  document.querySelectorAll("[data-detail-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.detailPanel === panelName);
  });
}

function setPage(pageName) {
  if (!pageNames.has(pageName)) pageName = "timetable";

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === pageName);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.navPage === pageName);
  });

  if (location.hash.slice(1) !== pageName) {
    history.replaceState(null, "", `#${pageName}`);
  }
}

function initializeNavigation() {
  const hashPage = location.hash.slice(1);
  if (hashPage) setPage(hashPage);
}

function updateDeadlineCountdowns() {
  const now = new Date();
  document.querySelectorAll(".deadline-line").forEach((line) => {
    const dateElement = line.querySelector(".deadline-date");
    const badge = line.querySelector(".countdown-badge");
    if (!dateElement || !badge) return;

    const due = new Date(dateElement.dateTime);
    const diffMs = due - now;
    if (Number.isNaN(due.getTime())) return;

    if (diffMs <= 0) {
      badge.textContent = "締切超過";
      badge.classList.add("is-overdue");
      return;
    }

    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (hours < 24) {
      badge.textContent = `あと${hours}時間`;
      return;
    }

    badge.textContent = `あと${Math.ceil(hours / 24)}日`;
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.info("Service Worker registration skipped:", error);
    });
  });
}
