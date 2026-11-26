/* ============================================================
   Router + screens for the Participant Portal demo.
   Hash-based routing so the browser Back button works and every
   screen maps to a box in the "Participants" user flow.
   ============================================================ */

/* ---------- State (persisted in localStorage) ---------- */
const DEFAULT_STATE = {
  loggedIn: false,
  checkedIn: false,      // self check-in done for the live session
  lateRequested: false,  // late submission requested for the closed task
  resubmitted: false,    // task 2 resubmitted after AC feedback
  submitted3: false,     // task 3 submitted
  quiz2: null,           // {score, picks[]} once the JS quiz is taken
  ratings: {},           // sessionId -> stars
};

let S = loadState();

function loadState() {
  try {
    return Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem("pui_state") || "{}"));
  } catch (e) {
    return Object.assign({}, DEFAULT_STATE);
  }
}
function saveState() {
  localStorage.setItem("pui_state", JSON.stringify(S));
}

/* ---------- Small helpers ---------- */
function nav(hash) { location.hash = hash; }

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

/* Breadcrumb: makes "where am I in the flow" visible on every screen */
function crumbs(items) {
  return (
    '<div class="crumbs">' +
    items
      .map((c, i) => {
        const isLast = i === items.length - 1;
        const label = isLast ? "<b>" + c.label + "</b>" : c.label;
        const link = !isLast && c.link
          ? '<a href="' + c.link + '">' + label + "</a>"
          : "<span>" + label + "</span>";
        return link + (isLast ? "" : ' <span class="sep">&#9656;</span> ');
      })
      .join("") +
    "</div>"
  );
}

function badge(level) {
  return '<span class="badge ' + level + '">' + level + "</span>";
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- Derived data ---------- */
function taskStatus(t) {
  if (t.id === "t2" && S.resubmitted) return "pending";
  if (t.id === "t3" && S.submitted3) return "pending";
  return t.status;
}

function statusLabel(st) {
  return {
    approved: "Approved",
    pending: "Waiting for AC review",
    resubmit: "Needs resubmission",
    open: "Open",
    closed: "Closed",
    live: "Live now",
  }[st] || st;
}

function attendance() {
  let present = 0, total = 0;
  SESSIONS.forEach((s) => {
    if (s.id === CHECKIN.sessionId && S.checkedIn) { present++; total++; return; }
    if (s.attended === true) { present++; total++; }
    else if (s.attended === false) { total++; }
  });
  return { present, total, pct: total ? Math.round((present / total) * 100) : 0 };
}

function quizState(q) {
  if (q.id === "q2" && S.quiz2) {
    return Object.assign({}, q, { status: "done", score: S.quiz2.score, picked: S.quiz2.picks });
  }
  return q;
}

/* ============================================================
   Screens - public
   ============================================================ */

function viewLanding() {
  return (
    '<div class="hero">' +
    "<h1><b>Operations Center</b></h1>" +
    "<p>Participant portal - sessions, tasks, quizzes and attendance in one place.</p>" +
    '<button class="btn primary" onclick="nav(\'#/login\')">Login</button>' +
    '<div class="legend" style="justify-content:center">' +
    "<span>Demo UI of the Participants user flow - sample data, no backend.</span>" +
    "</div></div>"
  );
}

function viewLogin() {
  return (
    '<div class="auth-wrap">' +
    crumbs([{ label: "Landing page", link: "#/" }, { label: "Login page" }]) +
    '<div class="logo"><b>Operations Center</b><span>Login with your issued account (no self sign-up)</span></div>' +
    '<div class="card">' +
    '<div class="field"><label>Username</label><input id="u" value="yazeed" /></div>' +
    '<div class="field"><label>Password</label><input id="p" type="password" value="demo1234" /></div>' +
    '<div class="btn-row">' +
    '<button class="btn primary" onclick="doLogin()">Login</button>' +
    '<button class="btn ghost" onclick="nav(\'#/forgot\')">Forgot password?</button>' +
    "</div>" +
    '<p class="muted mt" style="font-size:12px">Demo: any values work.</p>' +
    "</div></div>"
  );
}

function viewForgot() {
  return (
    '<div class="auth-wrap">' +
    crumbs([{ label: "Login page", link: "#/login" }, { label: "Forgot password" }]) +
    '<div class="card">' +
    "<h2 style=\"margin-top:0\">Reset password</h2>" +
    '<div class="field"><label>Email or phone</label><input placeholder="you@example.com" /></div>' +
    '<div class="btn-row">' +
    '<button class="btn primary" onclick="toast(\'Demo: a reset link would be sent\')">Send reset link</button>' +
    '<button class="btn ghost" onclick="nav(\'#/login\')">Back to login</button>' +
    "</div></div></div>"
  );
}

/* ============================================================
   Screens - after login
   ============================================================ */

const NAV = [
  { hash: "#/profile",       icon: "&#9679;",  label: "Profile" },
  { hash: "#/dashboard",     icon: "&#9632;",  label: "Dashboard" },
  { hash: "#/workshop",      icon: "&#9670;",  label: "Workshop panel" },
  { hash: "#/sessions",      icon: "&#9674;",  label: "Sessions" },
  { hash: "#/checkin",       icon: "&#10003;", label: "Self check-in" },
  { hash: "#/attendance",    icon: "&#9650;",  label: "My attendance" },
  { hash: "#/announcements", icon: "&#9993;",  label: "Announcements" },
  { hash: "#/calendar",      icon: "&#9776;",  label: "Calendar" },
  { hash: "#/achievements",  icon: "&#9733;",  label: "Achievements" },
];

function layout(content, activeHash) {
  const items = NAV.map((n) => {
    const active = activeHash && activeHash.indexOf(n.hash) === 0 ? " active" : "";
    return (
      '<div class="nav-item' + active + '" onclick="nav(\'' + n.hash + "')\">" +
      '<span class="ico">' + n.icon + "</span>" + n.label + "</div>"
    );
  }).join("");
  return (
    '<div class="layout">' +
    '<aside class="sidebar">' +
    '<div class="brand"><b>Operations Center</b><span>Participant portal</span></div>' +
    items +
    '<div class="nav-item" onclick="doLogout()"><span class="ico">&#10005;</span>Log out</div>' +
    '<div class="foot">Demo build - sample data.<br>Colors match the flow diagram.</div>' +
    "</aside>" +
    '<main class="main">' + content + "</main>" +
    "</div>"
  );
}

function viewProfile() {
  const c = crumbs([{ label: "Profile page" }]);
  const body =
    "<h1>" + esc(USER.name) + "</h1>" +
    '<p class="subtitle">The flow hub - every action starts here and returns here.</p>' +
    '<div class="card"><div class="profile-head">' +
    '<div class="avatar">' + USER.initials + "</div>" +
    "<div><div style=\"font-size:18px;font-weight:700\">" + esc(USER.name) + "</div>" +
    '<div class="muted">' + USER.committee + " committee &middot; ID " + USER.id + "</div>" +
    '<div class="muted" style="font-size:12.5px">' + esc(USER.email) + "</div></div>" +
    "</div>" +
    '<div class="btn-row">' +
    '<button class="btn primary" onclick="nav(\'#/workshop\')">Workshop panel</button>' +
    '<button class="btn" onclick="nav(\'#/achievements\')">View achievements</button>' +
    '<button class="btn" onclick="nav(\'#/edit-profile\')">Edit profile</button>' +
    '<button class="btn danger" onclick="doLogout()">Log out</button>' +
    "</div></div>" +
    '<h2>Quick links</h2>' +
    '<div class="grid cols-3">' +
    quickCard("#/dashboard", "Dashboard", "My tasks, status and feedback") +
    quickCard("#/checkin", "Self check-in", "Code or QR for today's session") +
    quickCard("#/sessions", "Sessions", "All and upcoming sessions") +
    "</div>";
  return layout(c + body, "#/profile");
}

function quickCard(hash, title, note) {
  return (
    '<div class="card clickable" onclick="nav(\'' + hash + "')\">" +
    '<div class="card-title" style="color:var(--text);font-weight:600">' + title + "</div>" +
    '<div class="card-note">' + note + "</div></div>"
  );
}

function viewDashboard() {
  const att = attendance();
  const approved = TASKS.filter((t) => taskStatus(t) === "approved").length;
  const q1 = QUIZZES[0];
  const next = SESSIONS.find((s) => s.status === "upcoming");
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Participant dashboard" }]);
  const body =
    "<h1>Dashboard " + badge("must") + "</h1>" +
    '<p class="subtitle">My tasks, status, feedback and attendance at a glance.</p>' +
    '<div class="grid cols-4">' +
    statCard("Attendance", att.pct + "%", att.present + " of " + att.total + " sessions") +
    statCard("Tasks approved", approved + " / " + TASKS.length, "1 needs resubmission") +
    statCard("Quiz average", q1.score + "/" + q1.total, "Git Basics") +
    statCard("Next session", next ? next.day + " Nov" : "-", next ? next.title : "") +
    "</div>" +
    '<div class="btn-row">' +
    '<button class="btn green" onclick="nav(\'#/checkin\')">Self check-in</button>' +
    '<button class="btn" onclick="nav(\'#/tasks\')">My tasks</button>' +
    '<button class="btn" onclick="nav(\'#/quizzes\')">Quizzes</button>' +
    "</div>" +
    "<h2>My tasks - status</h2>" +
    TASKS.map((t) => {
      const st = taskStatus(t);
      return (
        '<div class="list-item clickable" onclick="nav(\'#/task/' + t.id + "')\">" +
        '<span class="dot ' + (st === "approved" ? "green" : st === "resubmit" ? "red" : st === "pending" ? "yellow" : "gray") + '"></span>' +
        '<div class="grow"><div class="title">' + esc(t.title) + "</div>" +
        '<div class="meta">Deadline: ' + t.deadline + "</div></div>" +
        '<span class="status ' + st + '">' + statusLabel(st) + "</span></div>"
      );
    }).join("") +
    "<h2>Latest feedback</h2>" +
    '<div class="feedback"><div class="who">' + esc(TASKS[1].feedback.from) + ' - Task 2</div>' +
    esc(TASKS[1].feedback.text) + "</div>";
  return layout(c + body, "#/dashboard");
}

function statCard(title, value, note) {
  return (
    '<div class="card"><div class="card-title">' + title + "</div>" +
    '<div class="card-value">' + value + "</div>" +
    '<div class="card-note">' + note + "</div></div>"
  );
}

/* ---------- Workshop panel: the "choose action?" diamond ---------- */
function viewWorkshop() {
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Workshop panel" }]);
  const body =
    "<h1>Workshop panel</h1>" +
    '<p class="subtitle">Choose action - the diamond in the flow.</p>' +
    '<div class="grid cols-2">' +
    quickCard("#/materials", "View materials", "Drive links for every session") +
    quickCard("#/notifications", "Notifications", "Deadlines and review results") +
    quickCard("#/quizzes", "View quiz", "Solve, submit, see your result") +
    quickCard("#/tasks", "Tasks list", "Filter by status, upload your work") +
    "</div>";
  return layout(c + body, "#/workshop");
}

function viewMaterials() {
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "View materials" },
  ]);
  const body =
    "<h1>Materials " + badge("must") + "</h1>" +
    '<p class="subtitle">Each session links to its Drive folder for download.</p>' +
    SESSIONS.map((s) =>
      '<div class="list-item"><div class="grow">' +
      '<div class="title">' + esc(s.title) + "</div>" +
      '<div class="meta">' + s.date + " &middot; " + esc(s.materials) + "</div></div>" +
      '<button class="btn small" onclick="toast(\'Demo: opens the session Drive folder\')">Open in Drive</button>' +
      "</div>"
    ).join("");
  return layout(c + body, "#/workshop");
}

function viewNotifications() {
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Notifications" },
  ]);
  const render = (n) =>
    '<div class="list-item clickable" onclick="nav(\'' + n.link + "')\">" +
    '<span class="dot ' + (n.isNew ? "green" : "gray") + '"></span>' +
    '<div class="grow"><div class="title">' + esc(n.text) + "</div>" +
    '<div class="meta">' + n.when + " &middot; " + n.kind + "</div></div>" +
    (n.isNew ? '<span class="badge could">new</span>' : "") +
    "</div>";
  const body =
    "<h1>Notifications " + badge("must") + "</h1>" +
    '<p class="subtitle">Deadlines and review results, new first.</p>' +
    "<h2>New</h2>" + NOTIFICATIONS.filter((n) => n.isNew).map(render).join("") +
    "<h2>Earlier</h2>" + NOTIFICATIONS.filter((n) => !n.isNew).map(render).join("");
  return layout(c + body, "#/workshop");
}

/* ---------- Quizzes ---------- */
function viewQuizzes() {
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Quizzes" },
  ]);
  const body =
    "<h1>Quizzes " + badge("must") + "</h1>" +
    '<p class="subtitle">Solve the questions, submit, then see score and answers.</p>' +
    QUIZZES.map((qq) => {
      const q = quizState(qq);
      const done = q.status === "done";
      return (
        '<div class="list-item clickable" onclick="nav(\'' + (done ? "#/quiz/" + q.id + "/result" : "#/quiz/" + q.id) + "')\">" +
        '<div class="grow"><div class="title">' + esc(q.title) + "</div>" +
        '<div class="meta">' + esc(q.session) + " &middot; " + q.total + " questions</div></div>" +
        (done
          ? '<span class="status approved">Score ' + q.score + "/" + q.total + "</span>"
          : '<span class="status open">Not taken</span>') +
        "</div>"
      );
    }).join("");
  return layout(c + body, "#/workshop");
}

function viewQuiz(id) {
  const q = QUIZZES.find((x) => x.id === id);
  if (!q) return viewQuizzes();
  const live = quizState(q);
  if (live.status === "done") return viewQuizResult(id);
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Quizzes", link: "#/quizzes" },
    { label: "Solve questions" },
  ]);
  const qs = q.questions.map((qq, i) =>
    '<div class="quiz-q"><div class="q">' + (i + 1) + ". " + esc(qq.q) + "</div>" +
    qq.options.map((o, j) =>
      '<div class="quiz-opt" id="opt-' + i + "-" + j + '" onclick="pickOpt(' + i + "," + j + ')">' +
      "<span>" + String.fromCharCode(65 + j) + ".</span> " + esc(o) + "</div>"
    ).join("") + "</div>"
  ).join("");
  const body =
    "<h1>" + esc(q.title) + "</h1>" +
    '<p class="subtitle">Pick one answer per question, then submit.</p>' +
    qs +
    '<div class="confirm"><p><b>Submit answers?</b> You cannot change them after submitting.</p>' +
    '<div class="btn-row" style="margin-top:0">' +
    '<button class="btn primary" onclick="submitQuiz(\'' + q.id + "')\">Yes, submit</button>" +
    '<button class="btn ghost" onclick="nav(\'#/quizzes\')">No, go back</button>' +
    "</div></div>";
  return layout(c + body, "#/workshop");
}

function viewQuizResult(id) {
  const q = QUIZZES.find((x) => x.id === id);
  const live = quizState(q);
  const picks = live.status === "done"
    ? (q.id === "q2" && S.quiz2 ? S.quiz2.picks : q.questions.map((x) => x.picked))
    : [];
  const score = live.status === "done"
    ? (q.id === "q2" && S.quiz2 ? S.quiz2.score : q.score)
    : 0;
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Quizzes", link: "#/quizzes" },
    { label: "Quiz result" },
  ]);
  const review = q.questions.map((qq, i) =>
    '<div class="quiz-q"><div class="q">' + (i + 1) + ". " + esc(qq.q) + "</div>" +
    qq.options.map((o, j) => {
      let cls = "quiz-opt";
      if (j === qq.answer) cls += " correct";
      else if (picks[i] === j) cls += " wrong";
      return '<div class="' + cls + '"><span>' + String.fromCharCode(65 + j) + ".</span> " + esc(o) +
        (j === qq.answer ? ' <span class="muted">(correct)</span>' : "") +
        (picks[i] === j && j !== qq.answer ? ' <span class="muted">(your answer)</span>' : "") +
        "</div>";
    }).join("") + "</div>"
  ).join("");
  const body =
    "<h1>" + esc(q.title) + " - Result</h1>" +
    '<p class="subtitle">Quiz result: score and answers. Green = correct.</p>' +
    '<div class="card" style="max-width:320px;margin-bottom:20px">' +
    '<div class="card-title">Your score</div>' +
    '<div class="card-value">' + score + " / " + q.total + "</div></div>" +
    "<h2>Review quiz</h2>" + review +
    '<div class="btn-row"><button class="btn" onclick="nav(\'#/quizzes\')">Back to quizzes</button></div>';
  return layout(c + body, "#/workshop");
}

/* ---------- Tasks ---------- */
function viewTasks() {
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Tasks list" },
  ]);
  const filters = ["all", "open", "pending", "approved", "resubmit", "closed"];
  const body =
    "<h1>Tasks list " + badge("must") + "</h1>" +
    '<p class="subtitle">Filter by status. "Due soon" and "Overdue" are the deadline indicators ' + badge("should") + "</p>" +
    '<div class="btn-row" style="margin-top:0;margin-bottom:16px">' +
    filters.map((f) =>
      '<button class="btn small" id="flt-' + f + '" onclick="filterTasks(\'' + f + "')\">" +
      f.charAt(0).toUpperCase() + f.slice(1) + "</button>"
    ).join("") + "</div>" +
    '<div id="task-rows"></div>';
  const html = layout(c + body, "#/workshop");
  // render rows after mount
  setTimeout(() => filterTasks("all"), 0);
  return html;
}

function filterTasks(f) {
  document.querySelectorAll('[id^="flt-"]').forEach((b) => (b.style.borderColor = ""));
  const active = document.getElementById("flt-" + f);
  if (active) active.style.borderColor = "var(--pink)";
  const rows = TASKS.filter((t) => f === "all" || taskStatus(t) === f);
  const box = document.getElementById("task-rows");
  if (!box) return;
  box.innerHTML = rows.length
    ? rows.map((t) => {
        const st = taskStatus(t);
        const indicator = !t.passed
          ? '<span class="badge should">due soon</span>'
          : st === "closed"
          ? '<span class="badge" style="background:#f8717122;color:var(--red);border:1px solid var(--red)">overdue</span>'
          : "";
        return (
          '<div class="list-item clickable" onclick="nav(\'#/task/' + t.id + "')\">" +
          '<div class="grow"><div class="title">' + esc(t.title) + " " + indicator + "</div>" +
          '<div class="meta">' + esc(t.session) + " &middot; Deadline: " + t.deadline + "</div></div>" +
          '<span class="status ' + st + '">' + statusLabel(st) + "</span></div>"
        );
      }).join("")
    : '<p class="muted">No tasks with this status.</p>';
}

function viewTask(id) {
  const t = TASKS.find((x) => x.id === id);
  if (!t) return viewTasks();
  const st = taskStatus(t);
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Tasks list", link: "#/tasks" },
    { label: "Task details" },
  ]);
  let actions = "";
  if (st === "closed") {
    actions =
      '<div class="confirm"><p><b>Deadline passed.</b> Late submission is only possible if HR allows it ' +
      badge("could") + "</p>" +
      '<div class="btn-row" style="margin-top:0">' +
      (S.lateRequested
        ? '<span class="status pending">Late submission requested - waiting for HR</span>'
        : '<button class="btn primary" onclick="requestLate()">Flag as late / request late submission</button>') +
      "</div></div>";
  } else if (st === "open") {
    actions = '<button class="btn primary" onclick="nav(\'#/task/' + t.id + '/upload\')">Upload your task</button>';
  } else if (st === "resubmit") {
    actions = '<button class="btn primary" onclick="nav(\'#/task/' + t.id + '/upload\')">Resubmit task</button>' +
      '<button class="btn" onclick="nav(\'#/task/' + t.id + '/status\')">View AC feedback &amp; status</button>';
  } else {
    actions = '<button class="btn" onclick="nav(\'#/task/' + t.id + '/status\')">View AC feedback &amp; status</button>';
  }
  const history = t.history.length || S.resubmitted || S.submitted3
    ? "<h2>Submission history " + badge("must") + "</h2>" +
      t.history.map((h) => '<div class="list-item"><div class="grow"><div class="title">' + esc(h.what) + '</div><div class="meta">' + h.when + "</div></div></div>").join("") +
      ((t.id === "t2" && S.resubmitted) ? '<div class="list-item"><div class="grow"><div class="title">Submitted v2</div><div class="meta">just now</div></div><span class="status pending">waiting review</span></div>' : "") +
      ((t.id === "t3" && S.submitted3) ? '<div class="list-item"><div class="grow"><div class="title">Submitted v1</div><div class="meta">just now</div></div><span class="status pending">waiting review</span></div>' : "")
    : "";
  const body =
    "<h1>" + esc(t.title) + ' <span class="status ' + st + '">' + statusLabel(st) + "</span></h1>" +
    '<p class="subtitle">' + esc(t.session) + "</p>" +
    '<div class="card" style="max-width:560px">' +
    '<div class="card-title">Deadline</div><div style="font-size:17px;font-weight:600">' + t.deadline + "</div>" +
    '<div class="card-title" style="margin-top:14px">Rules</div><div>' + esc(t.rules) + "</div></div>" +
    '<div class="btn-row">' + actions + "</div>" +
    history;
  return layout(c + body, "#/workshop");
}

function viewTaskUpload(id) {
  const t = TASKS.find((x) => x.id === id);
  if (!t) return viewTasks();
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Workshop panel", link: "#/workshop" },
    { label: "Tasks list", link: "#/tasks" },
    { label: "Task details", link: "#/task/" + t.id },
    { label: "Upload your task" },
  ]);
  const body =
    "<h1>Upload your task</h1>" +
    '<p class="subtitle">' + esc(t.title) + " - paste a Drive link " +
    '<span class="muted">(or upload a file instead ' + badge("could") + ")</span></p>" +
    '<div class="card" style="max-width:560px">' +
    '<div class="field"><label>Drive link</label><input id="task-link" placeholder="https://drive.google.com/..." value="https://drive.google.com/drive/folders/demo-submission" /></div>' +
    '<div class="confirm"><p><b>Submit task?</b> The AC will review it after you submit.</p>' +
    '<div class="btn-row" style="margin-top:0">' +
    '<button class="btn primary" onclick="submitTask(\'' + t.id + "')\">Yes, submit task</button>" +
    '<button class="btn ghost" onclick="nav(\'#/task/' + t.id + "')\">Back to task details</button>" +
    "</div></div></div>";
  return layout(c + body, "#/workshop");
}

function viewTaskSuccess(id) {
  const t = TASKS.find((x) => x.id === id);
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Tasks list", link: "#/tasks" },
    { label: "Upload successful" },
  ]);
  const body =
    '<div class="card" style="max-width:520px;margin-top:40px;text-align:center">' +
    '<div style="font-size:42px">&#10003;</div>' +
    "<h1 style=\"margin:10px 0 4px\">Upload successful</h1>" +
    '<p class="subtitle">Status: Submitted - waiting for AC review ' + badge("must") + "</p>" +
    '<div class="btn-row" style="justify-content:center">' +
    '<button class="btn primary" onclick="nav(\'#/task/' + t.id + '/status\')">View status &amp; feedback</button>' +
    '<button class="btn" onclick="nav(\'#/tasks\')">Back to tasks</button>' +
    "</div></div>";
  return layout(c + body, "#/workshop");
}

function viewTaskStatus(id) {
  const t = TASKS.find((x) => x.id === id);
  if (!t) return viewTasks();
  const st = taskStatus(t);
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Tasks list", link: "#/tasks" },
    { label: "Task details", link: "#/task/" + t.id },
    { label: "AC feedback & status" },
  ]);
  let inner = "";
  if (st === "approved") {
    inner =
      '<span class="status approved">Approved</span>' +
      '<div class="feedback good"><div class="who">' + esc(t.feedback.from) + "</div>" + esc(t.feedback.text) + "</div>" +
      '<div class="card" style="max-width:320px;margin-top:14px">' +
      '<div class="card-title">View learning rate ' + badge("could") + "</div>" +
      '<div class="card-value">' + esc(t.learningRate) + ' <span class="muted" style="font-size:15px">(' + t.grade + ")</span></div></div>";
  } else if (st === "resubmit") {
    inner =
      '<span class="status resubmit">Needs resubmission</span>' +
      '<div class="feedback"><div class="who">' + esc(t.feedback.from) + "</div>" + esc(t.feedback.text) + "</div>" +
      '<div class="btn-row"><button class="btn primary" onclick="nav(\'#/task/' + t.id + '/upload\')">Resubmit task</button></div>' +
      '<p class="muted mt" style="font-size:13px">After resubmitting you loop back to "waiting for AC review" - the Needs resubmission? diamond in the flow.</p>';
  } else {
    inner =
      '<span class="status pending">Submitted - waiting for AC review</span>' +
      '<p class="muted mt">The AC has not reviewed this submission yet. You will get a notification with the result.</p>';
  }
  const body =
    "<h1>" + esc(t.title) + "</h1>" +
    '<p class="subtitle">View AC feedback &amp; status ' + badge("must") + "</p>" +
    '<div class="card" style="max-width:560px">' + inner + "</div>" +
    '<div class="btn-row"><button class="btn" onclick="nav(\'#/task/' + t.id + "')\">Back to task details</button></div>";
  return layout(c + body, "#/workshop");
}

/* ---------- Sessions / calendar / attendance ---------- */
function viewSessions() {
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Sessions list" }]);
  const body =
    "<h1>Sessions " + badge("must") + "</h1>" +
    '<p class="subtitle">All and upcoming sessions. Open one for details.</p>' +
    SESSIONS.map((s) =>
      '<div class="list-item clickable" onclick="nav(\'#/session/' + s.id + "')\">" +
      '<span class="dot ' + (s.status === "live" ? "green" : s.status === "done" ? "gray" : "yellow") + '"></span>' +
      '<div class="grow"><div class="title">' + esc(s.title) + "</div>" +
      '<div class="meta">' + s.date + " &middot; " + s.time + " &middot; " + esc(s.location) + "</div></div>" +
      '<span class="status ' + (s.status === "live" ? "live" : s.status === "done" ? "closed" : "open") + '">' +
      (s.status === "live" ? "Live now" : s.status === "done" ? "Done" : "Upcoming") + "</span></div>"
    ).join("");
  return layout(c + body, "#/sessions");
}

function viewSession(id) {
  const s = SESSIONS.find((x) => x.id === id);
  if (!s) return viewSessions();
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Sessions list", link: "#/sessions" },
    { label: "Session details" },
  ]);
  const att = attendance();
  const isLive = s.status === "live";
  const attendanceRow =
    s.attended === true ? '<span class="status approved">Present</span>'
    : s.attended === false ? '<span class="status resubmit">Absent</span>'
    : (isLive && S.checkedIn) ? '<span class="status approved">Present (checked in)</span>'
    : isLive ? '<span class="status open">Check-in open</span>'
    : '<span class="muted">Not held yet</span>';
  const rating = S.ratings[s.id];
  const rateBlock =
    s.status === "done"
      ? "<h2>Rate session &amp; suggest improvements " + badge("could") + "</h2>" +
        '<div class="card" style="max-width:560px">' +
        (rating
          ? '<p>You rated this session <b style="color:var(--yellow)">' + rating + " / 5</b>. Thanks!</p>"
          : '<div class="btn-row" style="margin-top:0">' +
            [1, 2, 3, 4, 5].map((n) =>
              '<button class="btn" onclick="rateSession(\'' + s.id + "'," + n + ')">' + n + " &#9733;</button>"
            ).join("") + "</div>" +
            '<div class="field" style="margin-top:14px"><label>Suggest an improvement (optional)</label>' +
            '<textarea rows="2" placeholder="e.g. more hands-on time"></textarea></div>') +
        "</div>"
      : "";
  const body =
    "<h1>" + esc(s.title) + "</h1>" +
    '<p class="subtitle">Session details ' + badge("must") + "</p>" +
    '<div class="card" style="max-width:560px">' +
    "<table><tr><th>Date</th><td>" + s.date + "</td></tr>" +
    "<tr><th>Time</th><td>" + s.time + "</td></tr>" +
    "<tr><th>Location</th><td>" + esc(s.location) + "</td></tr>" +
    "<tr><th>Committee</th><td>" + esc(s.committee) + "</td></tr>" +
    "<tr><th>Your attendance</th><td>" + attendanceRow + "</td></tr></table>" +
    '<div class="btn-row">' +
    '<button class="btn" onclick="toast(\'Demo: added to your calendar\')">Add to calendar ' + "</button>" +
    (isLive && !S.checkedIn ? '<button class="btn green" onclick="nav(\'#/checkin\')">Self check-in</button>' : "") +
    "</div></div>" +
    rateBlock;
  return layout(c + body, "#/sessions");
}

function viewCheckin() {
  const att = attendance();
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Self check-in" }]);
  const live = SESSIONS.find((s) => s.id === CHECKIN.sessionId);
  const inner = S.checkedIn
    ? '<div style="font-size:42px;text-align:center">&#10003;</div>' +
      '<h1 style="text-align:center;margin:10px 0 4px">You are checked in</h1>' +
      '<p class="subtitle" style="text-align:center">' + esc(live.title) + " - " + live.date + "</p>" +
      '<div class="btn-row" style="justify-content:center"><button class="btn primary" onclick="nav(\'#/attendance\')">My attendance</button></div>'
    : '<div class="grid cols-2" style="max-width:640px">' +
      '<div class="card"><div class="card-title">Enter the session code ' + badge("must") + "</div>" +
      '<div class="field" style="margin-top:10px"><input id="cc" maxlength="4" placeholder="4-digit code" style="font-size:20px;letter-spacing:6px;text-align:center" /></div>' +
      '<button class="btn primary" onclick="doCheckin()">Check in</button>' +
      '<p class="muted mt" style="font-size:12px">Demo: HR shares the code at the venue. Today\'s code is <b>7392</b>.</p></div>' +
      '<div class="card" style="text-align:center"><div class="card-title">or scan the QR ' + badge("must") + "</div>" +
      '<div class="qr-box" style="margin:10px auto" title="QR placeholder">QR</div>' +
      '<p class="muted" style="font-size:12px">Scanning opens this same check-in with the code filled in.</p></div>' +
      "</div>";
  const body =
    "<h1>Self check-in</h1>" +
    '<p class="subtitle">Live session: ' + esc(live.title) + " (" + live.time + "). Current attendance: " + att.pct + "%</p>" +
    inner;
  return layout(c + body, "#/checkin");
}

function viewAttendance() {
  const att = attendance();
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Self check-in", link: "#/checkin" },
    { label: "My attendance" },
  ]);
  const body =
    "<h1>My attendance " + badge("should") + "</h1>" +
    '<p class="subtitle">Attendance % per participant ' + badge("could") + "</p>" +
    '<div class="card" style="max-width:420px">' +
    '<div class="pbar-label"><span>Attendance</span><span>' + att.present + " / " + att.total + " sessions</span></div>" +
    '<div class="pbar"><div style="width:' + att.pct + '%"></div></div>' +
    '<div class="card-value" style="margin-top:8px">' + att.pct + "%</div></div>" +
    "<h2>Sessions</h2>" +
    SESSIONS.map((s) => {
      let st, label;
      if (s.id === CHECKIN.sessionId && S.checkedIn) { st = "approved"; label = "Present"; }
      else if (s.attended === true) { st = "approved"; label = "Present"; }
      else if (s.attended === false) { st = "resubmit"; label = "Absent"; }
      else if (s.status === "live") { st = "open"; label = "Not marked yet"; }
      else { st = "closed"; label = "Upcoming"; }
      return (
        '<div class="list-item"><div class="grow"><div class="title">' + esc(s.title) + "</div>" +
        '<div class="meta">' + s.date + "</div></div>" +
        '<span class="status ' + st + '">' + label + "</span></div>"
      );
    }).join("");
  return layout(c + body, "#/attendance");
}

function viewAnnouncements() {
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Announcements" }]);
  const body =
    "<h1>Announcements " + badge("must") + "</h1>" +
    '<p class="subtitle">Announcements view - newest first.</p>' +
    ANNOUNCEMENTS.map((a) =>
      '<div class="card" style="margin-bottom:12px">' +
      '<div style="font-weight:700">' + esc(a.title) + '</div>' +
      '<div class="muted" style="font-size:12px;margin:3px 0 8px">' + a.when + "</div>" +
      "<div>" + esc(a.body) + "</div></div>"
    ).join("");
  return layout(c + body, "#/announcements");
}

function viewCalendar() {
  const c = crumbs([{ label: "Profile page", link: "#/profile" }, { label: "Calendar view" }]);
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // November 2026 starts on a Sunday and has 30 days.
  let cells = dows.map((d) => '<div class="dow">' + d + "</div>").join("");
  for (let d = 1; d <= 30; d++) {
    const s = SESSIONS.find((x) => x.day === d);
    const today = d === 26 ? " today" : "";
    cells +=
      '<div class="day' + (s ? " has-session" : "") + today + '"' +
      (s ? ' onclick="nav(\'#/session/' + s.id + "')\"" : "") + ">" +
      d + (s ? '<span class="chip">' + esc(s.title) + "</span>" : "") + "</div>";
  }
  const body =
    "<h1>Calendar " + badge("could") + "</h1>" +
    '<p class="subtitle">Calendar view - November 2026. Days with sessions are highlighted.</p>' +
    '<div class="cal">' + cells + "</div>";
  return layout(c + body, "#/calendar");
}

function viewAchievements() {
  const tasksDone = TASKS.filter((t) => taskStatus(t) === "approved").length;
  const quizzesDone = QUIZZES.filter((q) => quizState(q).status === "done").length;
  const total = TASKS.length + QUIZZES.length;
  const done = tasksDone + quizzesDone;
  const pct = Math.round((done / total) * 100);
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "View achievements" },
  ]);
  const body =
    "<h1>Achievements</h1>" +
    '<p class="subtitle">Progress bar (tasks + quizzes) and the certificate Drive link.</p>' +
    '<div class="card" style="max-width:480px">' +
    '<div class="pbar-label"><span>Tasks + quizzes completed</span><span>' + done + " / " + total + "</span></div>" +
    '<div class="pbar"><div style="width:' + pct + '%"></div></div>' +
    '<div class="card-value" style="margin-top:8px">' + pct + "%</div>" +
    '<div class="card-note">Finish all tasks and quizzes to unlock the certificate.</div></div>' +
    "<h2>Certificate</h2>" +
    '<div class="list-item"><div class="grow"><div class="title">Cycle 3 certificate (Drive)</div>' +
    '<div class="meta">Unlocks at 100%</div></div>' +
    '<button class="btn small" disabled>Open in Drive</button></div>';
  return layout(c + body, "#/achievements");
}

function viewEditProfile() {
  const c = crumbs([
    { label: "Profile page", link: "#/profile" },
    { label: "Edit profile" },
  ]);
  const body =
    "<h1>Edit profile</h1>" +
    '<p class="subtitle">Edit username &amp; password.</p>' +
    '<div class="card" style="max-width:480px">' +
    '<div class="field"><label>Username</label><input value="yazeed" /></div>' +
    '<div class="field"><label>New password</label><input type="password" placeholder="********" /></div>' +
    '<div class="field"><label>Confirm password</label><input type="password" placeholder="********" /></div>' +
    '<div class="btn-row">' +
    '<button class="btn primary" onclick="toast(\'Demo: profile saved\');nav(\'#/profile\')">Save</button>' +
    '<button class="btn ghost" onclick="nav(\'#/profile\')">Cancel</button>' +
    "</div></div>";
  return layout(c + body, "#/profile");
}

/* ============================================================
   Actions
   ============================================================ */

function doLogin() {
  S.loggedIn = true;
  saveState();
  nav("#/profile");
}

function doLogout() {
  S.loggedIn = false;
  saveState();
  nav("#/");
}

function doCheckin() {
  const v = (document.getElementById("cc") || {}).value || "";
  if (v.trim() === CHECKIN.code) {
    S.checkedIn = true;
    saveState();
    render();
    toast("Checked in - attendance recorded");
  } else {
    toast("Wrong code. Demo hint: 7392");
  }
}

function submitTask(id) {
  if (id === "t2") S.resubmitted = true;
  if (id === "t3") S.submitted3 = true;
  saveState();
  nav("#/task/" + id + "/success");
}

function requestLate() {
  S.lateRequested = true;
  saveState();
  render();
  toast("Late submission requested - HR will review");
}

let quizPicks = {};
function pickOpt(qi, oi) {
  quizPicks[qi] = oi;
  document.querySelectorAll('[id^="opt-' + qi + '-"]').forEach((e) => e.classList.remove("selected"));
  const el = document.getElementById("opt-" + qi + "-" + oi);
  if (el) el.classList.add("selected");
}

function submitQuiz(id) {
  const q = QUIZZES.find((x) => x.id === id);
  let score = 0;
  q.questions.forEach((qq, i) => { if (quizPicks[i] === qq.answer) score++; });
  S.quiz2 = { score, picks: q.questions.map((_, i) => (quizPicks[i] === undefined ? -1 : quizPicks[i])) };
  quizPicks = {};
  saveState();
  nav("#/quiz/" + id + "/result");
}

function rateSession(id, stars) {
  S.ratings[id] = stars;
  saveState();
  render();
  toast("Thanks - rating saved");
}

/* ============================================================
   Router
   ============================================================ */

function render() {
  const hash = location.hash || "#/";
  const app = document.getElementById("app");

  const publicRoutes = ["#/", "#/login", "#/forgot"];
  const isPublic = publicRoutes.indexOf(hash) !== -1;
  // Demo convenience: a direct deep link auto-logs-in.
  if (!S.loggedIn && !isPublic) {
    S.loggedIn = true;
    saveState();
  }

  let html;
  if (hash === "#/") html = viewLanding();
  else if (hash === "#/login") html = viewLogin();
  else if (hash === "#/forgot") html = viewForgot();
  else if (hash === "#/profile") html = viewProfile();
  else if (hash === "#/dashboard") html = viewDashboard();
  else if (hash === "#/workshop") html = viewWorkshop();
  else if (hash === "#/materials") html = viewMaterials();
  else if (hash === "#/notifications") html = viewNotifications();
  else if (hash === "#/quizzes") html = viewQuizzes();
  else if (hash.match(/^#\/quiz\/\w+\/result$/)) html = viewQuizResult(hash.split("/")[2]);
  else if (hash.match(/^#\/quiz\/\w+$/)) html = viewQuiz(hash.split("/")[2]);
  else if (hash === "#/tasks") html = viewTasks();
  else if (hash.match(/^#\/task\/\w+\/upload$/)) html = viewTaskUpload(hash.split("/")[2]);
  else if (hash.match(/^#\/task\/\w+\/success$/)) html = viewTaskSuccess(hash.split("/")[2]);
  else if (hash.match(/^#\/task\/\w+\/status$/)) html = viewTaskStatus(hash.split("/")[2]);
  else if (hash.match(/^#\/task\/\w+$/)) html = viewTask(hash.split("/")[2]);
  else if (hash === "#/sessions") html = viewSessions();
  else if (hash.match(/^#\/session\/\w+$/)) html = viewSession(hash.split("/")[2]);
  else if (hash === "#/checkin") html = viewCheckin();
  else if (hash === "#/attendance") html = viewAttendance();
  else if (hash === "#/announcements") html = viewAnnouncements();
  else if (hash === "#/calendar") html = viewCalendar();
  else if (hash === "#/achievements") html = viewAchievements();
  else if (hash === "#/edit-profile") html = viewEditProfile();
  else html = viewProfile();

  app.innerHTML = html;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);
