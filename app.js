const days = ["月", "火", "水", "木", "金"];
const periods = [
  { no: 1, time: "09:20\n-\n10:50" },
  { no: 2, time: "11:05\n-\n12:35" },
  { no: 3, time: "13:45\n-\n15:15" },
  { no: 4, time: "15:30\n-\n17:00" },
  { no: 5, time: "17:15\n-\n18:45" }
];
const pageNames = new Set(["timetable", "assignments", "notifications", "mail", "mypage"]);
const deadlineNotificationStorageKey = "tduDeadlineNotification";
const assignmentSubmissionStorageKey = "tduAssignmentSubmissions";
const assignmentReminderStorageKey = "tduAssignmentReminders";
const materialStateStorageKey = "tduMaterialState";
const notificationStateStorageKey = "tduNotificationState";

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
const assignmentDialog = document.querySelector("#assignment-dialog");
const assignmentDialogContent = document.querySelector("#assignment-dialog-content");
const assignmentFileInput = document.querySelector("#assignment-file-input");
const utilityDialog = document.querySelector("#utility-dialog");
const utilityDialogContent = document.querySelector("#utility-dialog-content");
let courseDialogTrigger = null;
let assignmentDialogTrigger = null;
let utilityDialogTrigger = null;
let activeAssignmentCard = null;
let selectedAssignmentFile = null;

renderTimetable();
renderNextClass();
initializeNavigation();
updateDeadlineCountdowns();
initializeAssignmentSubmissions();
initializeAssignmentFilters();
initializeNotificationCenter();
initializeDeadlineNotificationSettings();
registerServiceWorker();

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav-page]");
  const lesson = event.target.closest("[data-course-id]");
  const detailTab = event.target.closest("[data-detail-tab]");
  const belongingsToggle = event.target.closest("[data-toggle-belongings-notice]");
  const sendMail = event.target.closest("[data-send-mail]");
  const saveCustomNotification = event.target.closest("[data-save-custom-notification]");
  const downloadAllMaterialsButton = event.target.closest("[data-download-all-materials]");
  const assignmentSubmit = event.target.closest("[data-submit-assignment]");
  const chooseAssignmentFile = event.target.closest("[data-choose-assignment-file]");
  const confirmAssignment = event.target.closest("[data-confirm-assignment]");
  const closeAssignment = event.target.closest("[data-close-assignment-dialog]");
  const assignmentDetails = event.target.closest("[data-open-assignment-details]");
  const assignmentFilter = event.target.closest("[data-assignment-filter]");
  const clearCourseFilter = event.target.closest("[data-clear-assignment-course-filter]");
  const courseAssignments = event.target.closest("[data-course-assignments]");
  const dialogSubmitAssignment = event.target.closest("[data-dialog-submit-assignment]");
  const cancelSubmission = event.target.closest("[data-cancel-submission]");
  const notificationFilter = event.target.closest("[data-notification-filter]");
  const markAllRead = event.target.closest("[data-mark-all-read]");
  const notificationItem = event.target.closest(".notification-item");
  const pinNotification = event.target.closest("[data-pin-notification]");
  const previewMaterial = event.target.closest("[data-preview-material]");
  const favoriteMaterial = event.target.closest("[data-favorite-material]");
  const materialFilter = event.target.closest("[data-material-filter]");
  const roomMap = event.target.closest("[data-open-room-map]");
  const openEmptyRooms = event.target.closest("[data-open-empty-rooms]");
  const searchEmptyRooms = event.target.closest("[data-search-empty-rooms]");
  const openAttendance = event.target.closest("[data-open-attendance]");
  const closeUtility = event.target.closest("[data-close-utility-dialog]");
  const close = event.target.closest("[data-close-dialog]");

  if (nav) {
    setPage(nav.dataset.navPage);
  }

  if (detailTab) {
    setDetailPanel(detailTab.dataset.detailTab);
  }

  if (belongingsToggle) {
    toggleBelongingsNotice(belongingsToggle);
  }

  if (sendMail) {
    completeMailSend(sendMail);
  }

  if (saveCustomNotification) {
    saveCustomDeadlineNotification();
  }

  if (downloadAllMaterialsButton) {
    downloadAllMaterials(downloadAllMaterialsButton.dataset.downloadCourseId, downloadAllMaterialsButton);
  }

  if (assignmentSubmit) {
    beginAssignmentSubmission(assignmentSubmit);
  }

  if (chooseAssignmentFile) {
    requestAssignmentFile(activeAssignmentCard, assignmentDialogTrigger);
  }

  if (confirmAssignment) {
    confirmAssignmentSubmission();
  }

  if (closeAssignment) {
    closeAssignmentDialog();
  }

  if (assignmentDetails) {
    showAssignmentDetails(assignmentDetails.closest("[data-assignment-id]"), assignmentDetails);
  }

  if (assignmentFilter) {
    applyAssignmentFilter(assignmentFilter.dataset.assignmentFilter);
  }

  if (clearCourseFilter) {
    setAssignmentCourseFilter("");
  }

  if (courseAssignments) {
    closeCourseDialog();
    setPage("assignments");
    setAssignmentCourseFilter(courseAssignments.dataset.courseAssignments);
  }

  if (dialogSubmitAssignment) {
    requestAssignmentFile(activeAssignmentCard, assignmentDialogTrigger);
  }

  if (cancelSubmission) {
    cancelAssignmentSubmission();
  }

  if (notificationFilter) {
    applyNotificationFilter(notificationFilter.dataset.notificationFilter);
  }

  if (markAllRead) {
    markAllNotificationsRead();
  }

  if (pinNotification) {
    event.stopPropagation();
    toggleNotificationPin(pinNotification.closest(".notification-item"));
  } else if (notificationItem) {
    markNotificationRead(notificationItem);
  }

  if (previewMaterial) {
    previewCourseMaterial(previewMaterial);
  }

  if (favoriteMaterial) {
    toggleMaterialFavorite(favoriteMaterial.closest("[data-material-key]"));
  }

  if (materialFilter) {
    applyMaterialFilter(materialFilter.value);
  }

  if (roomMap) {
    showCampusMap(roomMap.dataset.openRoomMap);
  }

  if (openEmptyRooms) {
    showEmptyRoomSearch();
  }

  if (searchEmptyRooms) {
    renderEmptyRoomResults();
  }

  if (openAttendance) {
    showAttendanceOverview();
  }

  if (closeUtility) {
    closeUtilityDialog();
  }

  if (lesson) {
    courseDialogTrigger = lesson;
    openCourseDetail(lesson.dataset.courseId);
  }

  if (close) {
    closeCourseDialog();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-deadline-notification-select]")) {
    updateDeadlineNotificationEditor(event.target.value, true);
  }

  if (event.target === assignmentFileInput && assignmentFileInput.files?.[0]) {
    selectedAssignmentFile = assignmentFileInput.files[0];
    showAssignmentReview(activeAssignmentCard, selectedAssignmentFile);
  }

  if (event.target.matches("[data-assignment-reminder]")) {
    saveAssignmentReminder(event.target.dataset.assignmentReminder, event.target.value);
  }

  if (event.target.matches("[data-material-filter]")) {
    applyMaterialFilter(event.target.value);
  }
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeCourseDialog();
});

dialog.addEventListener("close", () => {
  courseDialogTrigger?.focus();
});

dialog.addEventListener("keydown", trapDialogFocus);

assignmentDialog.addEventListener("click", (event) => {
  if (event.target === assignmentDialog) closeAssignmentDialog();
});

assignmentDialog.addEventListener("close", () => {
  assignmentDialogTrigger?.focus();
  selectedAssignmentFile = null;
});

assignmentDialog.addEventListener("keydown", trapAssignmentDialogFocus);

utilityDialog.addEventListener("click", (event) => {
  if (event.target === utilityDialog) closeUtilityDialog();
});

utilityDialog.addEventListener("keydown", trapUtilityDialogFocus);

utilityDialog.addEventListener("close", () => {
  utilityDialogTrigger?.focus();
});

function course(id, day, period, title, room, color, teacher, summary) {
  const attendanceSeed = id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const absent = attendanceSeed % 3;
  const late = attendanceSeed % 2;
  const attended = 12 - absent - late;
  return {
    id,
    day,
    period,
    title,
    room,
    color,
    teacher,
    summary,
    belongings: title === "人間中心設計" ? "レビュー用メモ、プロトタイプ画面案、ノートPC" : "授業ノート、筆記用具、前回資料",
    task: "次回までに授業資料を確認してください。",
    material: `${title}_第${period}回資料.pdf`,
    syllabus: `${title}では、授業の到達目標、評価方法、毎回の学習内容を確認できます。出席、課題提出、小テストを総合して評価します。`,
    teacherMail: `${id}@tdu-class.example.jp`,
    attendance: { attended, late, absent, excused: attendanceSeed % 4 === 0 ? 1 : 0 }
  };
}

function renderTimetable() {
  const todayName = ["日", "月", "火", "水", "木", "金", "土"][new Date().getDay()];
  let html = `<div></div>`;
  html += days.map((day) => `<div class="day-label ${day === todayName ? "is-today" : ""}"><span>${day}</span></div>`).join("");

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

  const courseTime = periods[item.period - 1].time.replace(/\n-\n/g, "–");
  detail.innerHTML = `<div class="detail-shell">
    <header class="detail-hero ${item.color}">
      <div class="detail-title-row">
        <h2 id="course-detail-title">${escapeHtml(item.title)}</h2>
        <button class="dialog-close" type="button" data-close-dialog aria-label="授業詳細を閉じる">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div class="detail-meta">
        <span>${escapeHtml(item.day)}曜 ${item.period}限</span>
        <span>${courseTime}</span>
        <span>${escapeHtml(item.room)}</span>
      </div>
    </header>
    <div class="detail-scroll">
      <section class="belongings-highlight">
        <div class="belongings-heading">
          <h3>次回の持ち物</h3>
          <button class="belongings-notice" type="button" data-toggle-belongings-notice aria-pressed="true">
            <span class="notice-state-dot" aria-hidden="true"></span><span data-notice-label>通知ON</span>
          </button>
        </div>
        ${belongingsList(item.belongings)}
      </section>
      <div class="detail-actions" aria-label="授業関連アクション">
        <button class="materials-button" type="button" data-detail-tab="materials">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6Z"/></svg>
          授業資料を表示
        </button>
        <div class="detail-secondary-actions">
          <button class="detail-tab is-active" type="button" data-detail-tab="syllabus">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h7M8 17h7"/></svg>
            シラバスを表示
          </button>
          <button class="detail-tab" type="button" data-detail-tab="mail">
            <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            教授にメールを送る
          </button>
        </div>
        <button class="course-assignment-link" type="button" data-course-assignments="${escapeHtml(item.title)}">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 3h10v4H7zM5 5H3v16h18V5h-2M8 12h8M8 16h5"/></svg>
          この授業の課題を確認
        </button>
      </div>
      <section class="detail-panel is-active syllabus-panel" data-detail-panel="syllabus">
        <h3>シラバス</h3>
        <p>${escapeHtml(item.syllabus)}</p>
      </section>
      <section class="detail-panel" data-detail-panel="mail">
        <div class="mail-draft">
          <h3>教授へのメール</h3>
          <span>宛先: ${escapeHtml(item.teacher)} &lt;${escapeHtml(item.teacherMail)}&gt;</span>
          <textarea aria-label="教授へのメール本文">先生、${escapeHtml(item.title)}について質問があります。</textarea>
          <button class="send-preview" type="button" data-send-mail>メールを送信</button>
          <p class="mail-send-status" data-mail-status role="status" aria-live="polite" hidden></p>
        </div>
      </section>
      <section class="detail-panel" data-detail-panel="materials">
        <div class="material-panel-heading">
          <h3>授業資料</h3>
          <button class="download-all-materials" type="button" data-download-all-materials data-download-course-id="${item.id}">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>
            全14回を一括DL
          </button>
        </div>
        <p class="material-note">第1回から第14回までの資料を選択できます。各項目はプロトタイプ用のダミーファイルです。</p>
        <label class="material-filter-label">表示
          <select data-material-filter aria-label="授業資料の絞り込み">
            <option value="all">すべて</option>
            <option value="unread">未閲覧</option>
            <option value="favorite">お気に入り</option>
            <option value="exercise">演習資料</option>
          </select>
        </label>
        <p class="bulk-download-status" data-bulk-download-status role="status" aria-live="polite" hidden></p>
        ${materialList(item)}
      </section>
      <section class="course-info-card" aria-label="授業情報">
        <div class="course-info-row"><span>担当教員</span><strong>${escapeHtml(item.teacher)}</strong></div>
        <div class="course-info-row"><span>教室</span><button class="course-room-link" type="button" data-open-room-map="${escapeHtml(item.room)}">${escapeHtml(item.room)}<span aria-hidden="true">›</span></button></div>
        <div class="course-info-row"><span>授業時間</span><strong>${courseTime}</strong></div>
      </section>
      ${attendanceCard(item)}
      <div class="detail-body">
        <section class="detail-section">
          <h3>授業概要</h3>
          <p>${escapeHtml(item.summary)}</p>
        </section>
        <section class="detail-section">
          <h3>連絡・課題</h3>
          <p>${escapeHtml(item.task)}</p>
        </section>
      </div>
    </div>
  </div>`;

  applyStoredMaterialState();

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    detail.querySelector("[data-close-dialog]")?.focus();
  }
}

function toggleBelongingsNotice(button) {
  const nextState = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(nextState));
  const label = button.querySelector("[data-notice-label]");
  if (label) label.textContent = nextState ? "通知ON" : "通知OFF";
  button.classList.toggle("is-off", !nextState);
}

function completeMailSend(button) {
  const status = button.closest(".mail-draft")?.querySelector("[data-mail-status]");
  button.textContent = "送信済み";
  button.disabled = true;
  if (status) {
    status.textContent = "メールの送信が完了しました。";
    status.hidden = false;
  }
}

function beginAssignmentSubmission(button) {
  const card = button.closest("[data-assignment-id]");
  if (!card || button.disabled) return;

  activeAssignmentCard = card;
  assignmentDialogTrigger = button;
  if (button.dataset.submitted === "true") {
    const submission = loadAssignmentSubmissions()[card.dataset.assignmentId];
    if (submission) showSubmittedAssignment(card, submission);
    return;
  }

  requestAssignmentFile(card, button);
}

function requestAssignmentFile(card, trigger) {
  if (!card) return;
  activeAssignmentCard = card;
  if (trigger) assignmentDialogTrigger = trigger;
  assignmentFileInput.value = "";
  assignmentFileInput.click();
}

function showAssignmentReview(card, file) {
  if (!card || !file) return;
  const assignment = getAssignmentDetails(card);
  assignmentDialogContent.innerHTML = `${assignmentDialogHeader(assignment.title)}
    <div class="assignment-dialog-body">
      ${assignmentOverview(assignment)}
      ${assignmentSupportPanel(assignment)}
      <section class="selected-file-card" aria-label="選択したファイル">
        <span class="selected-file-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M13 3v5h5"/></svg></span>
        <span><strong>${escapeHtml(file.name)}</strong><small>${formatFileSize(file.size)}</small></span>
      </section>
      <p class="submission-caution">選択したファイルと課題名を確認してから提出してください。</p>
      <div class="assignment-dialog-actions">
        <button class="assignment-secondary-action" type="button" data-choose-assignment-file>ファイルを選び直す</button>
        <button class="assignment-primary-action" type="button" data-confirm-assignment>このファイルを提出</button>
      </div>
    </div>`;
  openAssignmentDialog();
}

function confirmAssignmentSubmission() {
  if (!activeAssignmentCard || !selectedAssignmentFile) return;
  const submission = {
    fileName: selectedAssignmentFile.name,
    fileSize: selectedAssignmentFile.size,
    submittedAt: new Date().toISOString()
  };
  const submissions = loadAssignmentSubmissions();
  submissions[activeAssignmentCard.dataset.assignmentId] = submission;
  saveAssignmentSubmissions(submissions);
  applyAssignmentSubmittedState(activeAssignmentCard, submission);
  applyAssignmentFilter(document.querySelector("[data-assignment-filter].is-active")?.dataset.assignmentFilter || "all");
  showSubmittedAssignment(activeAssignmentCard, submission);
}

function showSubmittedAssignment(card, submission) {
  const assignment = getAssignmentDetails(card);
  assignmentDialogContent.innerHTML = `${assignmentDialogHeader(assignment.title)}
    <div class="assignment-dialog-body">
      <div class="submission-success" role="status">
        <span aria-hidden="true">✓</span>
        <div><strong>提出が完了しました</strong><small>${formatSubmittedAt(submission.submittedAt)}</small></div>
      </div>
      ${assignmentOverview(assignment)}
      ${assignmentSupportPanel(assignment)}
      <section class="selected-file-card" aria-label="提出したファイル">
        <span class="selected-file-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M13 3v5h5"/></svg></span>
        <span><strong>${escapeHtml(submission.fileName)}</strong><small>${formatFileSize(submission.fileSize)}</small></span>
      </section>
      <div class="assignment-dialog-actions">
        <button class="assignment-secondary-action" type="button" data-choose-assignment-file>別のファイルで再提出</button>
        <button class="assignment-danger-action" type="button" data-cancel-submission>提出を取り消す</button>
      </div>
    </div>`;
  openAssignmentDialog();
}

function assignmentDialogHeader(title) {
  return `<header class="assignment-dialog-header">
    <div><span class="assignment-dialog-eyebrow">課題提出</span><h2 id="assignment-dialog-title">${escapeHtml(title)}</h2></div>
    <button class="dialog-close" type="button" data-close-assignment-dialog aria-label="課題提出画面を閉じる">
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </header>`;
}

function assignmentOverview(assignment) {
  return `<section class="assignment-overview">
    <div class="assignment-overview-row"><span>授業</span><strong>${escapeHtml(assignment.course)}</strong></div>
    <div class="assignment-overview-row"><span>開講</span><strong>${escapeHtml(assignment.schedule)}</strong></div>
    <div class="assignment-overview-row"><span>締切</span><strong>${escapeHtml(assignment.deadline)}</strong></div>
    <p>${escapeHtml(assignment.description)}</p>
    <small>対応形式: PDF、Word、PowerPoint、ZIP、画像</small>
  </section>`;
}

function assignmentSupportPanel(assignment) {
  const reminder = loadAssignmentReminders()[assignment.id] || "day";
  const attachmentText = `${assignment.title}\n\n${assignment.description}\n提出形式: PDF、Word、PowerPoint、ZIP、画像`;
  const attachmentHref = `data:text/plain;charset=utf-8,${encodeURIComponent(attachmentText)}`;
  return `<section class="assignment-support-panel">
    <a href="${escapeHtml(attachmentHref)}" download="${escapeHtml(sanitizeFileName(assignment.title))}_課題説明.txt">
      <span>添付ファイル</span><strong>課題説明・提出要項.txt</strong><em>DL</em>
    </a>
    <label><span>この課題の通知</span>
      <select data-assignment-reminder="${assignment.id}" aria-label="${escapeHtml(assignment.title)}の通知設定">
        <option value="off" ${reminder === "off" ? "selected" : ""}>通知しない</option>
        <option value="day" ${reminder === "day" ? "selected" : ""}>1日前</option>
        <option value="three-hours" ${reminder === "three-hours" ? "selected" : ""}>3時間前</option>
        <option value="both" ${reminder === "both" ? "selected" : ""}>1日前と3時間前</option>
      </select>
    </label>
  </section>`;
}

function showAssignmentDetails(card, trigger) {
  if (!card) return;
  activeAssignmentCard = card;
  assignmentDialogTrigger = trigger;
  const submission = loadAssignmentSubmissions()[card.dataset.assignmentId];
  if (submission) {
    showSubmittedAssignment(card, submission);
    return;
  }

  const assignment = getAssignmentDetails(card);
  const expired = card.dataset.deadlineState === "overdue";
  assignmentDialogContent.innerHTML = `${assignmentDialogHeader(assignment.title)}
    <div class="assignment-dialog-body">
      <div class="assignment-status-banner ${expired ? "is-overdue" : ""}">
        <strong>${expired ? "提出期限を過ぎています" : "未提出"}</strong>
        <span>${expired ? "この課題は現在提出できません。" : "提出ファイルはまだ選択されていません。"}</span>
      </div>
      ${assignmentOverview(assignment)}
      ${assignmentSupportPanel(assignment)}
      ${expired ? "" : `<button class="assignment-primary-action" type="button" data-dialog-submit-assignment>ファイルを選択して提出</button>`}
    </div>`;
  openAssignmentDialog();
}

function getAssignmentDetails(card) {
  return {
    id: card.dataset.assignmentId,
    title: card.querySelector(".assignment-card-main > strong")?.textContent.trim() || "課題",
    course: card.dataset.assignmentCourse || "授業",
    schedule: card.dataset.assignmentSchedule || "未設定",
    description: card.dataset.assignmentDescription || "課題ファイルを提出してください。",
    deadline: card.querySelector(".deadline-date")?.textContent.trim() || "未設定"
  };
}

function openAssignmentDialog() {
  if (!assignmentDialog.open && typeof assignmentDialog.showModal === "function") {
    assignmentDialog.showModal();
  }
  assignmentDialogContent.querySelector("[data-close-assignment-dialog]")?.focus();
}

function closeAssignmentDialog() {
  if (assignmentDialog.open) assignmentDialog.close();
}

function initializeAssignmentSubmissions() {
  const submissions = loadAssignmentSubmissions();
  document.querySelectorAll("[data-assignment-id]").forEach((card) => {
    const submission = submissions[card.dataset.assignmentId];
    if (submission) applyAssignmentSubmittedState(card, submission);
  });
}

function applyAssignmentSubmittedState(card, submission) {
  const action = card.querySelector("[data-submit-assignment]");
  const meta = card.querySelector("[data-assignment-submission-meta]");
  if (action) {
    action.textContent = "提出済み";
    action.disabled = false;
    action.dataset.submitted = "true";
    action.classList.remove("is-expired");
    action.classList.add("is-submitted");
    action.setAttribute("aria-label", `${getAssignmentDetails(card).title}の提出内容を確認`);
  }
  card.dataset.submissionState = "submitted";
  if (meta) {
    meta.textContent = `${submission.fileName}・${formatSubmittedAt(submission.submittedAt)}`;
    meta.hidden = false;
  }
}

function cancelAssignmentSubmission() {
  if (!activeAssignmentCard) return;
  const submissions = loadAssignmentSubmissions();
  delete submissions[activeAssignmentCard.dataset.assignmentId];
  saveAssignmentSubmissions(submissions);
  const action = activeAssignmentCard.querySelector("[data-submit-assignment]");
  const meta = activeAssignmentCard.querySelector("[data-assignment-submission-meta]");
  activeAssignmentCard.dataset.submissionState = "unsubmitted";
  if (action) {
    action.dataset.submitted = "false";
    action.classList.remove("is-submitted");
  }
  if (meta) {
    meta.hidden = true;
    meta.textContent = "";
  }
  updateDeadlineCountdowns();
  applyAssignmentFilter(document.querySelector("[data-assignment-filter].is-active")?.dataset.assignmentFilter || "all");
  showAssignmentDetails(activeAssignmentCard, assignmentDialogTrigger);
}

function loadAssignmentReminders() {
  try {
    return JSON.parse(localStorage.getItem(assignmentReminderStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveAssignmentReminder(assignmentId, value) {
  const reminders = loadAssignmentReminders();
  reminders[assignmentId] = value;
  localStorage.setItem(assignmentReminderStorageKey, JSON.stringify(reminders));
}

function loadAssignmentSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(assignmentSubmissionStorageKey)) || {};
  } catch (error) {
    console.info("Assignment submissions could not be loaded:", error);
    return {};
  }
}

function saveAssignmentSubmissions(submissions) {
  try {
    localStorage.setItem(assignmentSubmissionStorageKey, JSON.stringify(submissions));
  } catch (error) {
    console.info("Assignment submissions could not be saved:", error);
  }
}

function formatSubmittedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "提出日時不明";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} 提出`;
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function belongingsList(value) {
  const items = String(value).split("、").map((item) => item.trim()).filter(Boolean);
  return `<ul class="belongings-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function closeCourseDialog() {
  if (dialog.open) dialog.close();
}

function trapDialogFocus(event) {
  trapFocusWithin(event, dialog);
}

function trapAssignmentDialogFocus(event) {
  trapFocusWithin(event, assignmentDialog);
}

function trapUtilityDialogFocus(event) {
  trapFocusWithin(event, utilityDialog);
}

function trapFocusWithin(event, container) {
  if (event.key !== "Tab") return;
  const focusable = [...container.querySelectorAll("button:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])")];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function materialList(item) {
  return `<div class="material-list" aria-label="${escapeHtml(item.title)}の授業資料一覧">
    ${Array.from({ length: 14 }, (_, index) => materialLink(item, index + 1)).join("")}
  </div>`;
}

function materialLink(item, number) {
  const numberLabel = String(number).padStart(2, "0");
  const fileName = `${sanitizeFileName(item.title)}_第${numberLabel}回資料.pdf`;
  const key = `${item.id}-${number}`;
  const type = number % 3 === 0 ? "exercise" : "lecture";
  const materialState = loadMaterialState()[key] || {};
  const dummyText = [
    `${item.title} 第${number}回 授業資料`,
    "これはプロトタイプ用のダミーファイルです。",
    `担当教員: ${item.teacher}`,
    `教室: ${item.room}`
  ].join("\n");
  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(dummyText)}`;

  return `<article class="material-item ${materialState.read ? "is-read" : ""} ${materialState.favorite ? "is-favorite" : ""}" data-material-key="${key}" data-material-type="${type}" data-material-course-id="${item.id}" data-material-number="${number}">
    <button class="material-preview-button" type="button" data-preview-material>
      <strong>第${number}回</strong>
      <small>${type === "exercise" ? "演習資料" : "講義資料"}<span data-material-read-label>${materialState.read ? "・閲覧済み" : "・未閲覧"}</span></small>
    </button>
    <div class="material-item-actions">
      <button class="material-favorite" type="button" data-favorite-material aria-pressed="${materialState.favorite ? "true" : "false"}" aria-label="第${number}回資料をお気に入り${materialState.favorite ? "から解除" : "に追加"}">☆</button>
      <a href="${escapeHtml(href)}" download="${escapeHtml(fileName)}" aria-label="${escapeHtml(item.title)} 第${number}回資料をダウンロード">DL</a>
    </div>
  </article>`;
}

function attendanceCard(item) {
  const total = item.attendance.attended + item.attendance.late + item.attendance.absent + item.attendance.excused;
  const rate = Math.round(((item.attendance.attended + item.attendance.excused) / Math.max(1, total)) * 100);
  return `<section class="attendance-card ${rate < 80 ? "has-warning" : ""}" aria-label="出欠状況">
    <div class="attendance-heading"><h3>出欠状況</h3><strong>${rate}%</strong></div>
    <div class="attendance-counts"><span>出席 ${item.attendance.attended}</span><span>遅刻 ${item.attendance.late}</span><span>欠席 ${item.attendance.absent}</span><span>公欠 ${item.attendance.excused}</span></div>
    ${rate < 80 ? "<p>出席率が基準に近づいています。担当教員へ確認してください。</p>" : ""}
  </section>`;
}

function downloadAllMaterials(courseId, button) {
  const item = courses.find((entry) => entry.id === courseId);
  if (!item) return;

  const sections = Array.from({ length: 14 }, (_, index) => {
    const number = index + 1;
    return [
      `第${number}回`,
      `${item.title} 第${number}回 授業資料`,
      "これはプロトタイプ用のダミーファイルです。",
      `担当教員: ${item.teacher}`,
      `教室: ${item.room}`
    ].join("\n");
  });
  const content = `${item.title} 全14回 授業資料\n\n${sections.join("\n\n--------------------\n\n")}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${sanitizeFileName(item.title)}_全14回授業資料.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);

  const status = button.closest("[data-detail-panel]")?.querySelector("[data-bulk-download-status]");
  if (status) {
    status.textContent = "全14回分のダミー資料を1つのファイルにまとめてダウンロードしました。";
    status.hidden = false;
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

function initializeAssignmentFilters() {
  document.querySelectorAll("[data-assignment-id]").forEach((card) => {
    if (!card.dataset.submissionState) card.dataset.submissionState = "unsubmitted";
  });
  applyAssignmentFilter("all");
}

function applyAssignmentFilter(filterName) {
  const filter = filterName || "all";
  let visibleCount = 0;
  const courseFilter = document.querySelector("[data-assignment-course-filter]")?.dataset.course || "";
  document.querySelectorAll("[data-assignment-id]").forEach((card) => {
    const submitted = card.dataset.submissionState === "submitted";
    const deadlineState = card.dataset.deadlineState;
    const statusMatch = filter === "all"
      || (filter === "unsubmitted" && !submitted && deadlineState !== "overdue")
      || (filter === "today" && deadlineState === "today")
      || (filter === "week" && (deadlineState === "today" || deadlineState === "week"))
      || (filter === "submitted" && submitted)
      || (filter === "overdue" && !submitted && deadlineState === "overdue");
    const courseMatch = !courseFilter || card.dataset.assignmentCourse === courseFilter;
    card.hidden = !(statusMatch && courseMatch);
    if (!card.hidden) visibleCount += 1;
  });
  document.querySelectorAll("[data-assignment-filter]").forEach((button) => {
    const active = button.dataset.assignmentFilter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const empty = document.querySelector("[data-assignment-empty-state]");
  if (empty) empty.hidden = visibleCount !== 0;
}

function setAssignmentCourseFilter(courseName) {
  const indicator = document.querySelector("[data-assignment-course-filter]");
  const label = document.querySelector("[data-assignment-course-filter-label]");
  if (!indicator || !label) return;
  indicator.dataset.course = courseName;
  indicator.hidden = !courseName;
  label.textContent = courseName ? `${courseName}の課題` : "";
  applyAssignmentFilter("all");
  document.querySelector('[data-page="assignments"]')?.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeDeadlineNotificationSettings() {
  const select = document.querySelector("[data-deadline-notification-select]");
  if (!select) return;

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(deadlineNotificationStorageKey));
  } catch (error) {
    console.info("Deadline notification setting could not be loaded:", error);
  }

  if (saved?.mode && [...select.options].some((option) => option.value === saved.mode)) {
    select.value = saved.mode;
  }
  const valueInput = document.querySelector("[data-custom-notification-value]");
  const unitSelect = document.querySelector("[data-custom-notification-unit]");
  if (saved?.value && valueInput) valueInput.value = saved.value;
  if (saved?.unit && unitSelect) unitSelect.value = saved.unit;
  updateDeadlineNotificationEditor(select.value, false);
}

function updateDeadlineNotificationEditor(mode, shouldSave) {
  const editor = document.querySelector("[data-custom-notification-editor]");
  const status = document.querySelector("[data-notification-setting-status]");
  if (!editor) return;

  editor.hidden = mode !== "custom";
  if (status) status.textContent = "";
  if (!shouldSave || mode === "custom") return;

  saveDeadlineNotificationSetting({ mode });
  if (status) status.textContent = "通知タイミングを保存しました。";
}

function saveCustomDeadlineNotification() {
  const valueInput = document.querySelector("[data-custom-notification-value]");
  const unitSelect = document.querySelector("[data-custom-notification-unit]");
  const status = document.querySelector("[data-notification-setting-status]");
  if (!valueInput || !unitSelect) return;

  const value = Math.min(99, Math.max(1, Number.parseInt(valueInput.value, 10) || 1));
  const unit = unitSelect.value === "days" ? "days" : "hours";
  valueInput.value = value;
  saveDeadlineNotificationSetting({ mode: "custom", value, unit });
  if (status) {
    status.textContent = `締切の${value}${unit === "days" ? "日前" : "時間前"}に通知する設定を保存しました。`;
  }
}

function saveDeadlineNotificationSetting(setting) {
  try {
    localStorage.setItem(deadlineNotificationStorageKey, JSON.stringify(setting));
  } catch (error) {
    console.info("Deadline notification setting could not be saved:", error);
  }
}

function updateDeadlineCountdowns() {
  const now = new Date();
  document.querySelectorAll(".deadline-line").forEach((line) => {
    const dateElement = line.querySelector(".deadline-date");
    const badge = line.querySelector(".countdown-badge");
    const card = line.closest(".mini-card");
    const action = card?.querySelector(".mini-action");
    if (!dateElement || !badge) return;

    const due = resolveDeadline(dateElement, now);
    const diffMs = due - now;
    if (Number.isNaN(due.getTime())) return;
    badge.classList.remove("is-overdue", "is-urgent");

    if (diffMs <= 0) {
      if (card) card.dataset.deadlineState = "overdue";
      badge.textContent = "締切超過";
      badge.classList.add("is-overdue");
      if (action && action.dataset.submitted !== "true") {
        const assignmentName = card.querySelector("strong")?.textContent.trim() || "この課題";
        action.textContent = "期限切れ";
        action.disabled = true;
        action.classList.add("is-expired");
        action.setAttribute("aria-label", `${assignmentName}は提出期限を過ぎています`);
      }
      return;
    }

    if (action && action.dataset.submitted !== "true") {
      action.textContent = "提出";
      action.disabled = false;
      action.classList.remove("is-expired");
      action.removeAttribute("aria-label");
    }

    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (isSameLocalDate(due, now)) {
      if (card) card.dataset.deadlineState = "today";
      badge.textContent = `本日締切・あと${hours}時間`;
      badge.classList.add("is-urgent");
      return;
    }

    if (hours < 24) {
      if (card) card.dataset.deadlineState = "week";
      badge.textContent = `あと${hours}時間`;
      badge.classList.add("is-urgent");
      return;
    }

    const remainingDays = calendarDaysBetween(now, due);
    if (card) card.dataset.deadlineState = remainingDays <= 7 ? "week" : "future";
    badge.textContent = `あと${remainingDays}日`;
  });
}

function resolveDeadline(dateElement, now) {
  const offset = Number.parseInt(dateElement.dataset.deadlineOffset, 10);
  if (Number.isNaN(offset)) return new Date(dateElement.dateTime);

  const hour = Number.parseInt(dateElement.dataset.deadlineHour, 10) || 0;
  const minute = Number.parseInt(dateElement.dataset.deadlineMinute, 10) || 0;
  const due = new Date(now);
  due.setDate(now.getDate() + offset);
  due.setHours(hour, minute, 0, 0);

  dateElement.dateTime = due.toISOString();
  dateElement.textContent = `${due.getMonth() + 1}/${due.getDate()} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return due;
}

function isSameLocalDate(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function calendarDaysBetween(from, to) {
  const fromDate = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toDate = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)));
}

function renderNextClass() {
  const container = document.querySelector("[data-next-class]");
  if (!container) return;
  const now = new Date();
  const dayNumbers = { "月": 1, "火": 2, "水": 3, "木": 4, "金": 5 };
  const upcoming = courses.map((item) => {
    const [hour, minute] = periods[item.period - 1].time.split("\n")[0].split(":").map(Number);
    let daysAhead = (dayNumbers[item.day] - now.getDay() + 7) % 7;
    const startsAt = new Date(now);
    startsAt.setDate(now.getDate() + daysAhead);
    startsAt.setHours(hour, minute, 0, 0);
    if (startsAt <= now) {
      daysAhead += 7;
      startsAt.setDate(startsAt.getDate() + 7);
    }
    return { item, startsAt, daysAhead };
  }).sort((left, right) => left.startsAt - right.startsAt)[0];

  const dayLabel = upcoming.daysAhead === 0 ? "今日" : upcoming.daysAhead === 1 ? "明日" : `${upcoming.item.day}曜日`;
  const startTime = periods[upcoming.item.period - 1].time.split("\n")[0];
  container.innerHTML = `<div class="next-class-copy">
    <span>次の授業・${dayLabel}</span>
    <strong>${escapeHtml(upcoming.item.title)}</strong>
    <small>${startTime} / ${escapeHtml(upcoming.item.room)} / 教室変更なし</small>
    <small class="next-class-belongings">持ち物: ${escapeHtml(upcoming.item.belongings)}</small>
  </div>
  <button type="button" data-course-id="${upcoming.item.id}" aria-label="${escapeHtml(upcoming.item.title)}の詳細を開く">詳細</button>`;
}

function initializeNotificationCenter() {
  const saved = loadNotificationState();
  document.querySelectorAll(".notification-item").forEach((item, index) => {
    const id = `notification-${index + 1}`;
    const text = item.textContent;
    const category = text.includes("資料") ? "material"
      : text.includes("教室") || text.includes("休講") ? "class"
      : text.includes("教務課") || text.includes("試験") ? "university" : "assignment";
    item.dataset.notificationId = id;
    item.dataset.notificationCategory = category;
    const state = saved[id] || {};
    if (state.read) item.classList.remove("is-unread");
    item.classList.toggle("is-pinned", Boolean(state.pinned));
    item.querySelector(".unread-dot")?.remove();
    if (item.classList.contains("is-unread")) item.insertAdjacentHTML("afterbegin", '<span class="unread-dot" aria-label="未読"></span>');
    item.insertAdjacentHTML("afterbegin", `<span class="notification-category">${notificationCategoryLabel(category)}</span><button class="notification-pin" type="button" data-pin-notification aria-pressed="${state.pinned ? "true" : "false"}" aria-label="重要通知として${state.pinned ? "固定を解除" : "固定"}">${state.pinned ? "★" : "☆"}</button>`);
  });
  sortPinnedNotifications();
}

function notificationCategoryLabel(category) {
  return { assignment: "課題", class: "授業変更", material: "資料追加", university: "大学" }[category] || "通知";
}

function applyNotificationFilter(category) {
  document.querySelectorAll("[data-notification-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.notificationFilter === category));
  document.querySelectorAll(".notification-item").forEach((item) => {
    item.hidden = category !== "all" && item.dataset.notificationCategory !== category;
  });
}

function markNotificationRead(item) {
  if (!item || !item.classList.contains("is-unread")) return;
  item.classList.remove("is-unread");
  item.querySelector(".unread-dot")?.remove();
  updateNotificationState(item, { read: true });
}

function markAllNotificationsRead() {
  document.querySelectorAll(".notification-item.is-unread").forEach(markNotificationRead);
}

function toggleNotificationPin(item) {
  if (!item) return;
  const pinned = !item.classList.contains("is-pinned");
  item.classList.toggle("is-pinned", pinned);
  const button = item.querySelector("[data-pin-notification]");
  if (button) {
    button.textContent = pinned ? "★" : "☆";
    button.setAttribute("aria-pressed", String(pinned));
    button.setAttribute("aria-label", `重要通知として${pinned ? "固定を解除" : "固定"}`);
  }
  updateNotificationState(item, { pinned });
  sortPinnedNotifications();
}

function sortPinnedNotifications() {
  const list = document.querySelector(".notification-list");
  if (!list) return;
  [...list.children].sort((left, right) => Number(right.classList.contains("is-pinned")) - Number(left.classList.contains("is-pinned"))).forEach((item) => list.appendChild(item));
}

function loadNotificationState() {
  try { return JSON.parse(localStorage.getItem(notificationStateStorageKey)) || {}; } catch (error) { return {}; }
}

function updateNotificationState(item, patch) {
  const state = loadNotificationState();
  state[item.dataset.notificationId] = { ...(state[item.dataset.notificationId] || {}), ...patch };
  localStorage.setItem(notificationStateStorageKey, JSON.stringify(state));
}

function loadMaterialState() {
  try { return JSON.parse(localStorage.getItem(materialStateStorageKey)) || {}; } catch (error) { return {}; }
}

function saveMaterialState(state) {
  localStorage.setItem(materialStateStorageKey, JSON.stringify(state));
}

function applyStoredMaterialState() {
  const state = loadMaterialState();
  document.querySelectorAll("[data-material-key]").forEach((item) => {
    const entry = state[item.dataset.materialKey] || {};
    item.classList.toggle("is-read", Boolean(entry.read));
    item.classList.toggle("is-favorite", Boolean(entry.favorite));
    const label = item.querySelector("[data-material-read-label]");
    if (label) label.textContent = entry.read ? "・閲覧済み" : "・未閲覧";
    const favorite = item.querySelector("[data-favorite-material]");
    if (favorite) {
      favorite.textContent = entry.favorite ? "★" : "☆";
      favorite.setAttribute("aria-pressed", String(Boolean(entry.favorite)));
    }
  });
}

function previewCourseMaterial(button) {
  const material = button.closest("[data-material-key]");
  if (!material) return;
  const course = courses.find((item) => item.id === material.dataset.materialCourseId);
  const number = material.dataset.materialNumber;
  const state = loadMaterialState();
  state[material.dataset.materialKey] = { ...(state[material.dataset.materialKey] || {}), read: true };
  saveMaterialState(state);
  applyStoredMaterialState();
  openUtilityDialog(`${utilityHeader(`${course?.title || "授業"} 第${number}回資料`)}
    <div class="utility-dialog-body">
      <div class="material-document-preview">
        <span>LECTURE NOTE ${String(number).padStart(2, "0")}</span>
        <h3>${escapeHtml(course?.title || "授業資料")}</h3>
        <p>${escapeHtml(course?.summary || "授業内容を確認します。")} 第${number}回では、重要語句と演習内容を整理します。</p>
        <ul><li>本時の到達目標</li><li>講義内容の要点</li><li>確認課題と次回予告</li></ul>
      </div>
      <p class="utility-note">プロトタイプ用の資料プレビューです。閲覧済みとして記録しました。</p>
    </div>`);
}

function toggleMaterialFavorite(material) {
  if (!material) return;
  const key = material.dataset.materialKey;
  const state = loadMaterialState();
  state[key] = { ...(state[key] || {}), favorite: !state[key]?.favorite };
  saveMaterialState(state);
  applyStoredMaterialState();
  applyMaterialFilter(document.querySelector("[data-material-filter]")?.value || "all");
}

function applyMaterialFilter(filter) {
  const state = loadMaterialState();
  document.querySelectorAll(".material-list [data-material-key]").forEach((item) => {
    const entry = state[item.dataset.materialKey] || {};
    item.hidden = (filter === "unread" && entry.read)
      || (filter === "favorite" && !entry.favorite)
      || (filter === "exercise" && item.dataset.materialType !== "exercise");
  });
}

function utilityHeader(title) {
  return `<header class="utility-dialog-header">
    <h2 id="utility-dialog-title">${escapeHtml(title)}</h2>
    <button class="dialog-close" type="button" data-close-utility-dialog aria-label="画面を閉じる"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  </header>`;
}

function openUtilityDialog(content) {
  utilityDialogTrigger = document.activeElement;
  utilityDialogContent.innerHTML = content;
  if (!utilityDialog.open && typeof utilityDialog.showModal === "function") utilityDialog.showModal();
  utilityDialogContent.querySelector("[data-close-utility-dialog]")?.focus();
}

function closeUtilityDialog() {
  if (utilityDialog.open) utilityDialog.close();
}

function showCampusMap(room) {
  const building = /^5/.test(room) ? "5号館" : /^2/.test(room) ? "2号館" : "本館";
  const floor = room.match(/^\d/)?.[0] || "1";
  openUtilityDialog(`${utilityHeader(`${room} 教室マップ`)}
    <div class="utility-dialog-body">
      <div class="campus-map" role="img" aria-label="${escapeHtml(building)}${escapeHtml(floor)}階の案内図">
        <div class="map-corridor">廊下</div>
        <div>階段</div><div>EV</div><div class="is-destination">${escapeHtml(room)}</div><div>ラウンジ</div>
      </div>
      <section class="map-route"><strong>${building} ${floor}階</strong><p>正面入口からエレベーターで${floor}階へ進み、右側の廊下を直進してください。</p></section>
      <p class="utility-note">この案内図はプロトタイプ用の簡易表示です。</p>
    </div>`);
}

function showEmptyRoomSearch() {
  openUtilityDialog(`${utilityHeader("空き教室検索")}
    <div class="utility-dialog-body">
      <div class="empty-room-form">
        <label>曜日<select data-room-day><option>月</option><option>火</option><option>水</option><option selected>木</option><option>金</option></select></label>
        <label>時限<select data-room-period><option>1限</option><option selected>2限</option><option>3限</option><option>4限</option><option>5限</option></select></label>
        <label>キャンパス<select data-room-campus><option>東京千住</option></select></label>
        <label>建物<select data-room-building><option>すべて</option><option>2号館</option><option>5号館</option></select></label>
      </div>
      <button class="utility-primary-action" type="button" data-search-empty-rooms>検索する</button>
      <div class="empty-room-results" data-empty-room-results aria-live="polite"><p>条件を選択して検索してください。</p></div>
    </div>`);
}

function renderEmptyRoomResults() {
  const day = utilityDialog.querySelector("[data-room-day]")?.value || "木";
  const period = utilityDialog.querySelector("[data-room-period]")?.value || "2限";
  const building = utilityDialog.querySelector("[data-room-building]")?.value || "すべて";
  const rooms = building === "2号館" ? ["2402", "2501"] : building === "5号館" ? ["5301", "5503"] : ["2402", "2501", "5301", "5503"];
  const results = utilityDialog.querySelector("[data-empty-room-results]");
  if (!results) return;
  results.innerHTML = `<strong>${day}曜 ${period}・${rooms.length}室</strong>${rooms.map((room, index) => `<button type="button" data-open-room-map="${room}"><span>${room}</span><small>${index % 2 === 0 ? "定員40名・電源あり" : "定員60名・プロジェクターあり"}</small><em>地図 ›</em></button>`).join("")}`;
}

function showAttendanceOverview() {
  const attendanceCourses = courses.filter((item, index) => index < 6 || item.title === "人間中心設計");
  openUtilityDialog(`${utilityHeader("出欠状況")}
    <div class="utility-dialog-body">
      <div class="attendance-summary"><strong>平均出席率 92%</strong><span>2026年度 前期</span></div>
      <div class="attendance-overview-list">${attendanceCourses.map((item) => {
        const total = item.attendance.attended + item.attendance.late + item.attendance.absent + item.attendance.excused;
        const rate = Math.round(((item.attendance.attended + item.attendance.excused) / Math.max(1, total)) * 100);
        return `<article class="${rate < 80 ? "has-warning" : ""}"><div><strong>${escapeHtml(item.title)}</strong><span>${item.day}曜${item.period}限</span></div><em>${rate}%</em><small>出席 ${item.attendance.attended} / 遅刻 ${item.attendance.late} / 欠席 ${item.attendance.absent} / 公欠 ${item.attendance.excused}</small></article>`;
      }).join("")}</div>
    </div>`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFileName(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, "_");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.info("Service Worker registration skipped:", error);
    });
  });
}
