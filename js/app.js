/* ---------- cloud storage helpers (Firestore-backed, per account) ---------- */
let cloudData = {};
let cloudUid = null;

function loadCloudData(uid) {
  cloudUid = uid;
  return db.collection("users").doc(uid).get().then((snap) => {
    cloudData = snap.exists ? snap.data() : {};
  });
}

function loadData(key, fallback) {
  return key in cloudData ? cloudData[key] : fallback;
}
function saveData(key, value) {
  cloudData[key] = value;
  if (!cloudUid) return;
  db.collection("users").doc(cloudUid).set({ [key]: value }, { merge: true })
    .catch((err) => console.error("Cloud save failed for " + key, err));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function daysBetween(dateStr) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(todayISO() + "T00:00:00");
  return Math.round((target - today) / 86400000);
}
function formatDatePretty(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ---------- app data keys ---------- */
const KEYS = {
  tasks: "sh_planner_tasks",
  blocks: "sh_schedule_blocks",
  courses: "sh_grades_courses",
  apProgress: "sh_ap_progress",
  satDaily: "sh_sat_daily",
  satHistory: "sh_sat_quiz_history"
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_COLORS = ["#3a6ea5", "#2f9e6e", "#c1552c", "#8e5bb5", "#d9534f", "#e0a020", "#2596be"];
const SCHEDULE_START_HOUR = 7;
const SCHEDULE_END_HOUR = 21;

function todayDayIndex() {
  const jsDay = new Date().getDay(); // 0 = Sunday
  return (jsDay + 6) % 7; // 0 = Monday
}

/* ---------- ephemeral in-memory quiz state ---------- */
const quizState = {};
let videoLibraryIndex = 0;

/* ---------- router ---------- */
function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  return hash ? hash.split("/") : ["dashboard"];
}
function navigate(path) {
  location.hash = "#/" + path;
}
window.addEventListener("hashchange", render);

/* ============================================================ AUTH / ACCOUNT GATE */
function initials(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : "?";
}

let authMode = "login";

window.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadCloudData(user.uid)
        .then(showApp)
        .catch(() => showAuth("Couldn't load your data. Try refreshing the page."));
    } else {
      cloudData = {};
      cloudUid = null;
      showAuth();
    }
  });
});

function showApp() {
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app-shell").hidden = false;
  if (!location.hash) location.hash = "#/dashboard";
  render();
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

function showAuth(errorMsg) {
  document.getElementById("app-shell").hidden = true;
  document.getElementById("auth-screen").hidden = false;
  renderAuthScreen(errorMsg);
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email already has an account. Try signing in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Your password needs to be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "That password doesn't match.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
    "auth/network-request-failed": "Couldn't reach the server. Check your connection."
  };
  return (err && map[err.code]) || "Something went wrong. Try again.";
}

function renderAuthScreen(message) {
  const authEl = document.getElementById("auth-screen");
  const isSignup = authMode === "signup";
  authEl.innerHTML = `
    <div class="auth-card">
      <div class="auth-status"><span class="dot"></span> System Ready <span class="dot"></span></div>
      <div class="auth-mark">&#10022;</div>
      <div class="auth-eyebrow">Pyramid Prism Prep</div>
      <h1>${isSignup ? "Create Account" : "Sign In"}</h1>
      <p class="auth-sub">${isSignup ? "Set up an account so your data follows you to any device." : "Sign in to pick up where you left off."}</p>
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
      <form id="auth-form">
        ${isSignup ? `<input type="text" id="auth-name" placeholder="Your name" maxlength="24" required>` : ""}
        <input type="email" id="auth-email" placeholder="Email" required>
        <input type="password" id="auth-password" placeholder="Password" minlength="6" required>
        <button type="submit">${isSignup ? "Create Account" : "Sign In"} &rarr;</button>
      </form>
      <p class="auth-toggle">${isSignup ? "Already have an account?" : "Need an account?"} <button type="button" id="auth-toggle-btn" class="link-btn">${isSignup ? "Sign in" : "Create one"}</button></p>
      ${!isSignup ? `<button type="button" id="auth-forgot-btn" class="link-btn small">Forgot password?</button>` : ""}
    </div>
  `;

  document.getElementById("auth-toggle-btn").addEventListener("click", () => {
    authMode = isSignup ? "login" : "signup";
    renderAuthScreen();
  });

  const forgotBtn = document.getElementById("auth-forgot-btn");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      const email = document.getElementById("auth-email").value.trim();
      if (!email) { renderAuthScreen("Type your email above first, then click Forgot password."); return; }
      auth.sendPasswordResetEmail(email)
        .then(() => renderAuthScreen("Password reset email sent. Check your inbox."))
        .catch((err) => renderAuthScreen(friendlyAuthError(err)));
    });
  }

  document.getElementById("auth-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    if (isSignup) {
      const name = document.getElementById("auth-name").value.trim();
      auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => cred.user.updateProfile({ displayName: name }))
        .catch((err) => { submitBtn.disabled = false; renderAuthScreen(friendlyAuthError(err)); });
    } else {
      auth.signInWithEmailAndPassword(email, password)
        .catch((err) => { submitBtn.disabled = false; renderAuthScreen(friendlyAuthError(err)); });
    }
  });
}

function renderSidebarFooter() {
  const footer = document.getElementById("sidebar-footer");
  if (!footer) return;
  const user = auth.currentUser;
  if (!user) { footer.innerHTML = ""; return; }
  const label = user.displayName || user.email;
  footer.innerHTML = `
    <div class="profile-chip">
      <div class="profile-avatar">${escapeHtml(initials(label))}</div>
      <div class="profile-info">
        <div class="profile-name">${escapeHtml(label)}</div>
        <button type="button" class="profile-switch" data-action="log-out">Log out</button>
      </div>
    </div>
  `;
}

document.addEventListener("click", (e) => {
  const el = e.target.closest('[data-action="log-out"]');
  if (!el) return;
  auth.signOut();
});

function render() {
  const parts = currentRoute();
  const root = parts[0] || "dashboard";
  document.querySelectorAll(".nav-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.route === root);
  });
  renderSidebarFooter();
  const app = document.getElementById("app");
  let html = "";
  switch (root) {
    case "dashboard": html = viewDashboard(); break;
    case "planner": html = viewPlanner(); break;
    case "schedule": html = viewSchedule(); break;
    case "grades": html = viewGrades(parts); break;
    case "ap": html = viewAp(parts); break;
    case "videos": html = viewVideoLibrary(); break;
    case "sat": html = viewSat(parts); break;
    default: html = viewDashboard();
  }
  app.innerHTML = `<div class="view-enter">${html}</div>`;
  animateProgressBars();
}

function animateProgressBars() {
  const bars = document.querySelectorAll(".progress-bar-fill[data-target]");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bars.forEach((el) => { el.style.width = el.dataset.target + "%"; });
    });
  });
}

/* ============================================================ DASHBOARD */
function viewDashboard() {
  const tasks = loadData(KEYS.tasks, []);
  const blocks = loadData(KEYS.blocks, []);
  const courses = loadData(KEYS.courses, []);

  const upcomingTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
    .slice(0, 5);

  const todayIdx = todayDayIndex();
  const todaysBlocks = blocks
    .filter((b) => b.day === todayIdx)
    .sort((a, b) => a.start.localeCompare(b.start));

  const upcomingTests = [];
  courses.forEach((c) => {
    (c.tests || []).forEach((t) => {
      upcomingTests.push({ course: c.name, name: t.name, date: t.date });
    });
  });
  upcomingTests.sort((a, b) => a.date.localeCompare(b.date));
  const nearTests = upcomingTests.filter((t) => daysBetween(t.date) >= -1).slice(0, 5);

  const dailyQ = getDailyQuestion();
  const satAnswered = loadData(KEYS.satDaily, {})[dailyQ.dateKey];
  const user = auth.currentUser;
  const firstName = user && user.displayName ? user.displayName.split(" ")[0] : null;

  return `
    <div class="page-header">
      <div>
        <h1>Welcome back${firstName ? ", " + escapeHtml(firstName) : ""}</h1>
        <p class="subtitle">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h2>Today's Schedule</h2>
        ${todaysBlocks.length ? todaysBlocks.map((b) => `
          <div class="list-item">
            <span style="width:10px;height:10px;border-radius:50%;background:${b.color}"></span>
            <div class="grow">
              <div class="title">${escapeHtml(b.title)}</div>
              <div class="meta">${formatTime(b.start)} &ndash; ${formatTime(b.end)}${b.location ? " &middot; " + escapeHtml(b.location) : ""}</div>
            </div>
          </div>`).join("") : `<div class="empty-state">Nothing scheduled today. <a href="#/schedule">Add a block &rarr;</a></div>`}
      </div>
      <div class="card">
        <h2>Upcoming Tasks</h2>
        ${upcomingTasks.length ? upcomingTasks.map((t) => `
          <div class="list-item">
            <span class="badge ${t.priority}">${t.priority}</span>
            <div class="grow">
              <div class="title">${escapeHtml(t.title)}</div>
              <div class="meta">${escapeHtml(t.course || "")} ${t.due ? "&middot; due " + formatDatePretty(t.due) : ""}</div>
            </div>
          </div>`).join("") : `<div class="empty-state">No tasks yet. <a href="#/planner">Add one &rarr;</a></div>`}
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h2>Upcoming Tests</h2>
        ${nearTests.length ? nearTests.map((t) => `
          <div class="list-item">
            <div class="grow">
              <div class="title">${escapeHtml(t.name)}</div>
              <div class="meta">${escapeHtml(t.course)} &middot; ${formatDatePretty(t.date)}</div>
            </div>
          </div>`).join("") : `<div class="empty-state">No upcoming tests logged. <a href="#/grades">Add one &rarr;</a></div>`}
      </div>
      <div class="card">
        <h2>SAT Daily Question</h2>
        <p class="meta">${dailyQ.q.section}</p>
        <p>${escapeHtml(dailyQ.q.q)}</p>
        ${satAnswered
          ? `<p class="meta">You already answered this one today. ${satAnswered.correct ? "Correct! &#9989;" : "Not quite. &#10060;"} <a href="#/sat">Review &rarr;</a></p>`
          : `<a href="#/sat"><button>Answer Today's Question</button></a>`}
      </div>
    </div>
  `;
}

/* ============================================================ PLANNER */
function viewPlanner() {
  const tasks = loadData(KEYS.tasks, []);
  const filter = window.__plannerFilter || "all";
  let shown = tasks;
  if (filter === "active") shown = tasks.filter((t) => !t.done);
  if (filter === "done") shown = tasks.filter((t) => t.done);
  shown = [...shown].sort((a, b) => {
    if (!!a.done !== !!b.done) return a.done ? 1 : -1;
    return (a.due || "9999").localeCompare(b.due || "9999");
  });

  return `
    <div class="page-header">
      <div><h1>Planner</h1><p class="subtitle">Track assignments and to-dos across all your classes</p></div>
    </div>
    <div class="card">
      <h2>Add a task</h2>
      <form data-form="add-task">
        <div class="form-row">
          <input name="title" placeholder="Task title" required>
          <input name="course" placeholder="Course (optional)">
        </div>
        <div class="form-row">
          <input type="date" name="due">
          <select name="priority">
            <option value="low">Low priority</option>
            <option value="medium" selected>Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <button type="submit">Add Task</button>
        </div>
      </form>
    </div>
    <div class="card">
      <div class="form-row tight" style="margin-bottom:14px;">
        <button class="${filter === "all" ? "" : "secondary"}" data-action="planner-filter" data-filter="all">All</button>
        <button class="${filter === "active" ? "" : "secondary"}" data-action="planner-filter" data-filter="active">Active</button>
        <button class="${filter === "done" ? "" : "secondary"}" data-action="planner-filter" data-filter="done">Done</button>
      </div>
      ${shown.length ? shown.map((t) => `
        <div class="task-block ${t.done ? "done" : ""}">
          <div class="task-row">
            <input type="checkbox" ${t.done ? "checked" : ""} data-action="toggle-task" data-id="${t.id}">
            <div class="grow">
              <div class="title">${escapeHtml(t.title)}</div>
              <div class="meta">${escapeHtml(t.course || "")} ${t.due ? "&middot; due " + formatDatePretty(t.due) : ""}</div>
            </div>
            <span class="badge ${t.priority}">${t.priority}</span>
            <button class="icon-btn" data-action="delete-task" data-id="${t.id}">&#10005;</button>
          </div>
          <textarea class="task-notes" style="${t.notesHeight ? `height:${t.notesHeight};` : ""}" placeholder="Add notes for this task, and drag the corner to expand it." data-action="save-notes" data-id="${t.id}">${escapeHtml(t.notes || "")}</textarea>
        </div>`).join("") : `<div class="empty-state">No tasks in this view.</div>`}
    </div>
  `;
}

function addTask(fields) {
  const tasks = loadData(KEYS.tasks, []);
  tasks.push({ id: uid(), title: fields.title, course: fields.course, due: fields.due, priority: fields.priority || "medium", done: false, notes: "", notesHeight: null });
  saveData(KEYS.tasks, tasks);
}
function saveTaskNotes(id, notes, height) {
  const tasks = loadData(KEYS.tasks, []);
  const t = tasks.find((x) => x.id === id);
  if (t) { t.notes = notes; if (height) t.notesHeight = height; }
  saveData(KEYS.tasks, tasks);
}
function toggleTask(id) {
  const tasks = loadData(KEYS.tasks, []);
  const t = tasks.find((x) => x.id === id);
  if (t) t.done = !t.done;
  saveData(KEYS.tasks, tasks);
}
function deleteTask(id) {
  saveData(KEYS.tasks, loadData(KEYS.tasks, []).filter((t) => t.id !== id));
}

/* ============================================================ SCHEDULE */
function timeToRow(t) {
  const [h, m] = t.split(":").map(Number);
  const minutesFromStart = (h - SCHEDULE_START_HOUR) * 60 + m;
  const slot = Math.round(minutesFromStart / 30);
  return 2 + Math.max(0, Math.min(slot, (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 2));
}

function viewSchedule() {
  const blocks = loadData(KEYS.blocks, []);
  const totalSlots = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 2;

  let gridCells = "";
  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    const row = timeToRow(`${String(h).padStart(2, "0")}:00`);
    gridCells += `<div class="hour-label" style="grid-column:1; grid-row:${row} / span 2;">${formatTime(`${String(h).padStart(2, "0")}:00`)}</div>`;
  }
  for (let day = 0; day < 7; day++) {
    for (let slot = 0; slot < totalSlots; slot++) {
      gridCells += `<div class="filler" style="grid-column:${day + 2}; grid-row:${slot + 2};"></div>`;
    }
  }
  const blockCells = blocks.map((b) => {
    const startRow = timeToRow(b.start);
    const endRow = timeToRow(b.end);
    return `<div class="schedule-block" style="grid-column:${b.day + 2}; grid-row:${startRow} / ${Math.max(endRow, startRow + 1)}; background:${b.color};" data-action="select-block" data-id="${b.id}" title="${escapeHtml(b.title)}">
      <strong>${escapeHtml(b.title)}</strong><br>${formatTime(b.start)}&ndash;${formatTime(b.end)}
    </div>`;
  }).join("");

  const headerCells = `<div class="head"></div>` + DAY_SHORT.map((d) => `<div class="head">${d}</div>`).join("");

  const colorOptions = BLOCK_COLORS.map((c) => `<option value="${c}">${c}</option>`).join("");

  const list = [...blocks].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  return `
    <div class="page-header">
      <div><h1>Schedule Maker</h1><p class="subtitle">Build your weekly class &amp; activity schedule</p></div>
    </div>
    <div class="card">
      <h2>Add a block</h2>
      <form data-form="add-block">
        <div class="form-row">
          <input name="title" placeholder="Class / activity name" required>
          <input name="location" placeholder="Room / location (optional)">
        </div>
        <div class="form-row">
          <select name="day">
            ${DAY_NAMES.map((d, i) => `<option value="${i}">${d}</option>`).join("")}
          </select>
          <input type="time" name="start" value="09:00" required>
          <input type="time" name="end" value="10:00" required>
          <select name="color">${colorOptions}</select>
          <button type="submit">Add Block</button>
        </div>
      </form>
    </div>
    <div class="card">
      <div class="schedule-grid" style="grid-template-rows: auto repeat(${totalSlots}, 22px);">
        ${headerCells}
        ${gridCells}
        ${blockCells}
      </div>
    </div>
    <div class="card">
      <h2>All Blocks</h2>
      ${list.length ? list.map((b) => `
        <div class="list-item">
          <span style="width:10px;height:10px;border-radius:50%;background:${b.color}"></span>
          <div class="grow">
            <div class="title">${escapeHtml(b.title)}</div>
            <div class="meta">${DAY_NAMES[b.day]} &middot; ${formatTime(b.start)}&ndash;${formatTime(b.end)}${b.location ? " &middot; " + escapeHtml(b.location) : ""}</div>
          </div>
          <button class="icon-btn" data-action="delete-block" data-id="${b.id}">&#10005;</button>
        </div>`).join("") : `<div class="empty-state">No blocks yet. Add your first class above.</div>`}
    </div>
  `;
}

function addBlock(fields) {
  if (fields.end <= fields.start) { alert("End time must be after start time."); return; }
  const blocks = loadData(KEYS.blocks, []);
  blocks.push({ id: uid(), day: Number(fields.day), start: fields.start, end: fields.end, title: fields.title, location: fields.location, color: fields.color || BLOCK_COLORS[0] });
  saveData(KEYS.blocks, blocks);
}
function deleteBlock(id) {
  saveData(KEYS.blocks, loadData(KEYS.blocks, []).filter((b) => b.id !== id));
}

/* ============================================================ GRADES */
function letterGrade(pct) {
  if (pct >= 97) return "A+"; if (pct >= 93) return "A"; if (pct >= 90) return "A-";
  if (pct >= 87) return "B+"; if (pct >= 83) return "B"; if (pct >= 80) return "B-";
  if (pct >= 77) return "C+"; if (pct >= 73) return "C"; if (pct >= 70) return "C-";
  if (pct >= 67) return "D+"; if (pct >= 63) return "D"; if (pct >= 60) return "D-";
  return "F";
}
function courseAverage(course) {
  const assignments = course.assignments || [];
  if (!assignments.length) return null;
  if (!course.categories || !course.categories.length) {
    const earned = assignments.reduce((s, a) => s + Number(a.score), 0);
    const possible = assignments.reduce((s, a) => s + Number(a.max), 0);
    return possible ? (earned / possible) * 100 : null;
  }
  const catStats = course.categories.map((cat) => {
    const items = assignments.filter((a) => a.category === cat.id);
    if (!items.length) return null;
    const earned = items.reduce((s, a) => s + Number(a.score), 0);
    const possible = items.reduce((s, a) => s + Number(a.max), 0);
    if (!possible) return null;
    return { weight: Number(cat.weight), pct: (earned / possible) * 100 };
  }).filter(Boolean);
  const uncategorized = assignments.filter((a) => !course.categories.some((c) => c.id === a.category));
  if (uncategorized.length) {
    const earned = uncategorized.reduce((s, a) => s + Number(a.score), 0);
    const possible = uncategorized.reduce((s, a) => s + Number(a.max), 0);
    if (possible) catStats.push({ weight: 100 / (course.categories.length || 1), pct: (earned / possible) * 100 });
  }
  if (!catStats.length) return null;
  const totalWeight = catStats.reduce((s, c) => s + c.weight, 0);
  if (!totalWeight) return null;
  return catStats.reduce((s, c) => s + c.pct * c.weight, 0) / totalWeight;
}

function viewGrades(parts) {
  const courses = loadData(KEYS.courses, []);
  if (parts[1]) return viewCourseDetail(courses, parts[1]);

  return `
    <div class="page-header">
      <div><h1>Grades &amp; Tests</h1><p class="subtitle">Track your courses, assignments, and upcoming tests</p></div>
    </div>
    <div class="card">
      <h2>Add a course</h2>
      <form data-form="add-course">
        <div class="form-row">
          <input name="name" placeholder="Course name (e.g. AP Biology)" required>
          <button type="submit">Add Course</button>
        </div>
      </form>
    </div>
    <div class="grid-3">
      ${courses.length ? courses.map((c) => {
        const avg = courseAverage(c);
        const nextTest = (c.tests || []).slice().sort((a, b) => a.date.localeCompare(b.date))[0];
        return `
        <div class="card clickable">
          <h3><a href="#/grades/${c.id}">${escapeHtml(c.name)}</a></h3>
          <div class="grade-letter" style="color:${avg == null ? "var(--text-muted)" : "var(--primary-dark)"}">
            ${avg == null ? "&ndash;" : avg.toFixed(1) + "% (" + letterGrade(avg) + ")"}
          </div>
          <p class="meta">${(c.assignments || []).length} assignment(s)</p>
          ${nextTest ? `<p class="meta">Next test: ${escapeHtml(nextTest.name)} &middot; ${formatDatePretty(nextTest.date)}</p>` : `<p class="meta">No upcoming tests</p>`}
          <div class="form-row tight" style="margin-top:10px;">
            <a href="#/grades/${c.id}"><button class="secondary">Open</button></a>
            <button class="danger" data-action="delete-course" data-id="${c.id}">Delete</button>
          </div>
        </div>`;
      }).join("") : `<div class="empty-state">No courses yet. Add one above.</div>`}
    </div>
  `;
}

function viewCourseDetail(courses, courseId) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return `<div class="empty-state">Course not found. <a href="#/grades">Back to Grades</a></div>`;
  const avg = courseAverage(course);
  const cats = course.categories || [];
  const catOptions = cats.map((c) => `<option value="${c.id}">${escapeHtml(c.name)} (${c.weight}%)</option>`).join("");

  return `
    <div class="page-header">
      <div><h1>${escapeHtml(course.name)}</h1><p class="subtitle"><a href="#/grades">&larr; Back to all courses</a></p></div>
      <div class="grade-letter">${avg == null ? "&ndash;" : avg.toFixed(1) + "% (" + letterGrade(avg) + ")"}</div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>Grade Categories</h2>
        <p class="meta">Optional: weight categories like Tests 50%, Homework 20%, etc. Assignments with no category are averaged in equally.</p>
        <form data-form="add-category" data-course="${course.id}">
          <div class="form-row">
            <input name="name" placeholder="Category (e.g. Tests)" required>
            <input name="weight" type="number" min="0" max="100" placeholder="Weight %" required>
            <button type="submit">Add</button>
          </div>
        </form>
        ${cats.length ? cats.map((c) => `
          <div class="list-item">
            <div class="grow">${escapeHtml(c.name)}</div>
            <span class="badge">${c.weight}%</span>
            <button class="icon-btn" data-action="delete-category" data-course="${course.id}" data-id="${c.id}">&#10005;</button>
          </div>`).join("") : `<div class="empty-state">No categories yet, so all assignments are weighted equally.</div>`}
      </div>

      <div class="card">
        <h2>Upcoming Tests</h2>
        <form data-form="add-test" data-course="${course.id}">
          <div class="form-row">
            <input name="name" placeholder="Test / quiz name" required>
            <input name="date" type="date" required>
            <button type="submit">Add</button>
          </div>
        </form>
        ${(course.tests || []).length ? [...course.tests].sort((a, b) => a.date.localeCompare(b.date)).map((t) => `
          <div class="list-item">
            <div class="grow">
              <div class="title">${escapeHtml(t.name)}</div>
              <div class="meta">${formatDatePretty(t.date)}</div>
            </div>
            <button class="icon-btn" data-action="delete-test" data-course="${course.id}" data-id="${t.id}">&#10005;</button>
          </div>`).join("") : `<div class="empty-state">No tests logged yet.</div>`}
      </div>
    </div>

    <div class="card">
      <h2>Assignments</h2>
      <form data-form="add-assignment" data-course="${course.id}">
        <div class="form-row">
          <input name="name" placeholder="Assignment name" required>
          ${cats.length ? `<select name="category"><option value="">No category</option>${catOptions}</select>` : ""}
          <input name="score" type="number" step="any" placeholder="Score" required>
          <input name="max" type="number" step="any" placeholder="Out of" required>
          <button type="submit">Add</button>
        </div>
      </form>
      <table class="grades-table">
        <thead><tr><th>Name</th><th>Category</th><th>Score</th><th>%</th><th></th></tr></thead>
        <tbody>
        ${(course.assignments || []).map((a) => {
          const cat = cats.find((c) => c.id === a.category);
          const pct = a.max ? ((a.score / a.max) * 100).toFixed(1) : "-";
          return `<tr>
            <td>${escapeHtml(a.name)}</td>
            <td>${cat ? escapeHtml(cat.name) : "None"}</td>
            <td>${a.score} / ${a.max}</td>
            <td>${pct}%</td>
            <td><button class="icon-btn" data-action="delete-assignment" data-course="${course.id}" data-id="${a.id}">&#10005;</button></td>
          </tr>`;
        }).join("") || `<tr><td colspan="5"><div class="empty-state">No assignments yet.</div></td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function addCourse(fields) {
  const courses = loadData(KEYS.courses, []);
  courses.push({ id: uid(), name: fields.name, categories: [], assignments: [], tests: [] });
  saveData(KEYS.courses, courses);
}
function deleteCourse(id) {
  saveData(KEYS.courses, loadData(KEYS.courses, []).filter((c) => c.id !== id));
}
function withCourse(courseId, fn) {
  const courses = loadData(KEYS.courses, []);
  const course = courses.find((c) => c.id === courseId);
  if (course) fn(course);
  saveData(KEYS.courses, courses);
}
function addCategory(courseId, fields) {
  withCourse(courseId, (c) => c.categories.push({ id: uid(), name: fields.name, weight: Number(fields.weight) }));
}
function deleteCategory(courseId, id) {
  withCourse(courseId, (c) => c.categories = c.categories.filter((x) => x.id !== id));
}
function addTest(courseId, fields) {
  withCourse(courseId, (c) => (c.tests = c.tests || []).push({ id: uid(), name: fields.name, date: fields.date }));
}
function deleteTest(courseId, id) {
  withCourse(courseId, (c) => c.tests = (c.tests || []).filter((x) => x.id !== id));
}
function addAssignment(courseId, fields) {
  withCourse(courseId, (c) => c.assignments.push({ id: uid(), name: fields.name, category: fields.category || null, score: Number(fields.score), max: Number(fields.max) }));
}
function deleteAssignment(courseId, id) {
  withCourse(courseId, (c) => c.assignments = c.assignments.filter((x) => x.id !== id));
}

/* ============================================================ AP EXAM PREP */
function apProgressFor(subjectKey, unitId) {
  const store = loadData(KEYS.apProgress, {});
  return store[`${subjectKey}-${unitId}`];
}
function saveApProgress(subjectKey, unitId, score, total) {
  const store = loadData(KEYS.apProgress, {});
  const key = `${subjectKey}-${unitId}`;
  const prevBest = store[key] ? store[key].best : 0;
  store[key] = { score, total, best: Math.max(prevBest, score), date: todayISO() };
  saveData(KEYS.apProgress, store);
}

function viewAp(parts) {
  const subjectKey = parts[1];
  const unitId = parts[2] ? Number(parts[2]) : null;
  if (subjectKey && SUBJECTS[subjectKey] && unitId) return viewApUnit(subjectKey, unitId);
  if (subjectKey && SUBJECTS[subjectKey]) return viewApSubject(subjectKey);
  return viewApHub();
}

function viewApHub() {
  const progress = loadData(KEYS.apProgress, {});
  return `
    <div class="page-header">
      <div><h1>AP Exam Prep</h1><p class="subtitle">Unit-by-unit videos, explanations, and quizzes</p></div>
    </div>
    <div class="grid-3">
      ${Object.entries(SUBJECTS).map(([key, subj]) => {
        const total = subj.units.length;
        const done = subj.units.filter((u) => progress[`${key}-${u.id}`]).length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        return `
        <div class="card clickable">
          <h3 style="color:${subj.color}">${subj.name}</h3>
          <p class="meta">${total} unit${total === 1 ? "" : "s"}</p>
          <div class="progress-bar"><div class="progress-bar-fill" data-target="${pct}" style="width:0%; background:${subj.color}"></div></div>
          <p class="meta">${done}/${total} units quizzed</p>
          <a href="#/ap/${key}"><button>Open</button></a>
        </div>`;
      }).join("")}
    </div>
  `;
}

function viewApSubject(subjectKey) {
  const subj = SUBJECTS[subjectKey];
  const progress = loadData(KEYS.apProgress, {});
  return `
    <div class="page-header">
      <div><h1>${subj.name}</h1><p class="subtitle"><a href="#/ap">&larr; All AP subjects</a></p></div>
    </div>
    ${subj.units.map((u) => {
      const p = progress[`${subjectKey}-${u.id}`];
      return `
      <div class="card unit-card clickable">
        <div>
          <h3>${escapeHtml(u.title)}</h3>
          ${p ? `<div class="unit-progress">Best score: ${p.best}/${u.quiz.length} &middot; last attempt ${formatDatePretty(p.date)}</div>` : `<div class="unit-progress">Not started</div>`}
        </div>
        <a href="#/ap/${subjectKey}/${u.id}"><button style="background:${subj.color}">${p ? "Review Unit" : "Start Unit"}</button></a>
      </div>`;
    }).join("")}
  `;
}

function viewApUnit(subjectKey, unitId) {
  const subj = SUBJECTS[subjectKey];
  const unit = subj.units.find((u) => u.id === unitId);
  if (!unit) return `<div class="empty-state">Unit not found.</div>`;
  const key = `ap:${subjectKey}:${unitId}`;
  if (!quizState[key]) quizState[key] = { answers: {} };

  return `
    <div class="page-header">
      <div><h1>${escapeHtml(unit.title)}</h1><p class="subtitle"><a href="#/ap/${subjectKey}">&larr; ${subj.name} units</a></p></div>
    </div>
    <div class="card">
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${unit.videoId}" title="${escapeHtml(unit.title)}" allowfullscreen></iframe>
      </div>
      <a class="watch-yt-link" href="https://www.youtube.com/watch?v=${unit.videoId}" target="_blank" rel="noopener">&#9654; Watch on YouTube &#8599;</a>
      <p class="watch-yt-hint">If the player above doesn't load, use the link to open it directly on YouTube.</p>
      <h2>Explanation</h2>
      <p>${escapeHtml(unit.explanation)}</p>
    </div>
    <div class="card">
      <h2>Unit Quiz</h2>
      ${renderQuiz(key, unit.quiz)}
    </div>
  `;
}

function flatVideoList() {
  const flat = [];
  Object.entries(SUBJECTS).forEach(([key, subj]) => {
    subj.units.forEach((u) => {
      flat.push({ subjectKey: key, subject: subj.name, color: subj.color, unit: `Unit ${u.id}`, unitId: u.id, title: u.title, videoId: u.videoId, blurb: u.explanation });
    });
  });
  return flat;
}

function playIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.35)"/><path d="M9.5 7.5v9l7-4.5z" fill="white"/></svg>';
}

function viewVideoLibrary() {
  const videos = flatVideoList();
  const index = Math.min(videoLibraryIndex, videos.length - 1);
  const v = videos[index];

  const groups = [];
  videos.forEach((item) => {
    let group = groups.find((g) => g.subject === item.subject);
    if (!group) { group = { subject: item.subject, color: item.color, items: [] }; groups.push(group); }
    group.items.push(item);
  });

  return `
    <div class="page-header">
      <div><h1>Video Library</h1><p class="subtitle">Every AP unit video in one player. Pick one from the shelf below.</p></div>
    </div>
    <div class="card">
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${v.videoId}?rel=0" title="${escapeHtml(v.title)}" allowfullscreen></iframe>
      </div>
      <a class="watch-yt-link" href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" rel="noopener">&#9654; Watch on YouTube &#8599;</a>
      <p class="watch-yt-hint">If the player above doesn't load, use the link to open it directly on YouTube.</p>
      <span class="now-playing-chip" style="--chip-color:${v.color}">${escapeHtml(v.subject)} &middot; ${v.unit}</span>
      <h2 style="margin:2px 0 8px;">${escapeHtml(v.title)}</h2>
      <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin:0 0 10px;">${escapeHtml(v.blurb)}</p>
      <a href="#/ap/${v.subjectKey}/${v.unitId}">Open full unit &amp; quiz &rarr;</a>
    </div>
    ${groups.map((group) => `
      <div class="playlist-group">
        <div class="playlist-group-label" style="--group-color:${group.color}">${escapeHtml(group.subject)} &middot; ${group.items.length} video${group.items.length === 1 ? "" : "s"}</div>
        <div class="playlist-grid">
          ${group.items.map((item) => {
            const i = videos.indexOf(item);
            return `
            <button type="button" class="video-card ${i === index ? "active" : ""}" style="--card-color:${item.color}" data-action="play-video" data-index="${i}" aria-pressed="${i === index}">
              <div class="video-thumb-wrap">
                <img src="https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="thumb-fallback">${playIconSvg()}</div>
                <div class="play-badge">${playIconSvg()}</div>
              </div>
              <div class="video-card-body">
                <span class="unit-tag">${item.unit}</span>
                <h4>${escapeHtml(item.title)}</h4>
              </div>
            </button>`;
          }).join("")}
        </div>
      </div>
    `).join("")}
  `;
}

/* generic quiz renderer, works for AP units and SAT practice quizzes */
function renderQuiz(key, questions) {
  const state = quizState[key];
  let correctCount = 0;
  const questionsHtml = questions.map((q, i) => {
    const selected = state.answers[i];
    const answered = selected !== undefined;
    if (answered && selected === q.answer) correctCount++;
    return `
      <div class="quiz-question">
        <div><strong>${i + 1}. ${escapeHtml(q.q)}</strong></div>
        ${q.choices.map((choice, ci) => {
          let cls = "quiz-choice";
          if (answered) {
            if (ci === q.answer) cls += " correct";
            else if (ci === selected) cls += " incorrect";
          } else if (ci === selected) cls += " selected";
          return `<button type="button" class="${cls}" ${answered ? "disabled" : ""} data-action="quiz-answer" data-key="${key}" data-qindex="${i}" data-choice="${ci}">${escapeHtml(choice)}</button>`;
        }).join("")}
        <div class="quiz-explain ${answered ? "show" : ""}">${answered ? escapeHtml(q.explain) : ""}</div>
      </div>`;
  }).join("");

  const allAnswered = Object.keys(state.answers).length === questions.length;
  const scorePct = allAnswered ? correctCount / questions.length : 0;
  const scoreColor = scorePct >= 0.8 ? "var(--accent)" : scorePct >= 0.5 ? "var(--warning)" : "var(--danger)";
  const summary = allAnswered
    ? `<div class="card score-reveal" style="border-color:${scoreColor}"><strong style="color:${scoreColor}; font-size:17px;">Score: ${correctCount} / ${questions.length}</strong></div>`
    : "";

  if (allAnswered && !state.saved) {
    state.saved = true;
    if (key.startsWith("ap:")) {
      const [, subjectKey, unitId] = key.split(":");
      saveApProgress(subjectKey, Number(unitId), correctCount, questions.length);
    } else if (key.startsWith("sat:quiz")) {
      const history = loadData(KEYS.satHistory, []);
      history.push({ date: todayISO(), score: correctCount, total: questions.length });
      saveData(KEYS.satHistory, history);
    } else if (key.startsWith("sat:daily")) {
      const dateKey = key.split(":")[2];
      const daily = loadData(KEYS.satDaily, {});
      daily[dateKey] = { qId: questions[0].id, correct: correctCount === questions.length };
      saveData(KEYS.satDaily, daily);
    }
  }

  return questionsHtml + summary + (allAnswered ? `<div class="form-row tight" style="margin-top:12px;"><button class="secondary" data-action="quiz-reset" data-key="${key}">Retake Quiz</button></div>` : "");
}

function answerQuiz(key, qindex, choice) {
  if (!quizState[key]) quizState[key] = { answers: {} };
  if (quizState[key].answers[qindex] !== undefined) return;
  quizState[key].answers[qindex] = choice;
}
function resetQuiz(key) {
  quizState[key] = { answers: {} };
}

/* ============================================================ SAT PRACTICE */
function dayNumber(dateStr) {
  return Math.floor(new Date(dateStr + "T00:00:00").getTime() / 86400000);
}
function getDailyQuestion() {
  const dateKey = todayISO();
  const idx = dayNumber(dateKey) % SAT_QUESTIONS.length;
  return { q: SAT_QUESTIONS[idx], dateKey };
}

function viewSat(parts) {
  const mode = parts[1];
  if (mode === "quiz") return viewSatQuiz();

  const { q, dateKey } = getDailyQuestion();
  const key = `sat:daily:${dateKey}`;
  if (!quizState[key]) {
    const already = loadData(KEYS.satDaily, {})[dateKey];
    quizState[key] = { answers: already ? { 0: already.correct ? q.answer : (q.answer + 1) % q.choices.length } : {}, saved: !!already };
  }

  const history = loadData(KEYS.satHistory, []);
  const recent = [...history].reverse().slice(0, 5);

  return `
    <div class="page-header">
      <div><h1>SAT Practice</h1><p class="subtitle">A new daily question, plus full practice quizzes</p></div>
    </div>
    <div class="card sat-question-card">
      <div class="sat-meta">
        <h2 style="margin:0;">Today's Daily Question</h2>
        <span class="badge">${q.section}</span>
      </div>
      ${renderQuiz(key, [q])}
    </div>
    <div class="card">
      <h2>Practice Quiz</h2>
      <p class="meta">Take a randomized 10-question quiz covering Math, Reading, and Writing.</p>
      <a href="#/sat/quiz"><button>Start Practice Quiz</button></a>
      ${recent.length ? `
        <h3 style="margin-top:16px;">Recent Results</h3>
        ${recent.map((r) => `<div class="list-item"><div class="grow">${formatDatePretty(r.date)}</div><span class="badge">${r.score}/${r.total}</span></div>`).join("")}
      ` : ""}
    </div>
  `;
}

function viewSatQuiz() {
  const key = "sat:quiz:active";
  if (!quizState[key] || !quizState[key].questions) {
    const shuffled = [...SAT_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    quizState[key] = { answers: {}, questions: shuffled };
  }
  return `
    <div class="page-header">
      <div><h1>SAT Practice Quiz</h1><p class="subtitle"><a href="#/sat">&larr; Back to SAT Practice</a></p></div>
    </div>
    <div class="card">
      ${renderQuiz(key, quizState[key].questions)}
    </div>
  `;
}

/* ============================================================ GLOBAL EVENT DELEGATION */
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case "planner-filter":
        window.__plannerFilter = el.dataset.filter;
        render();
        break;
      case "toggle-task":
        toggleTask(el.dataset.id); render(); break;
      case "delete-task":
        deleteTask(el.dataset.id); render(); break;
      case "delete-block":
        deleteBlock(el.dataset.id); render(); break;
      case "delete-course":
        if (confirm("Delete this course and all its data?")) { deleteCourse(el.dataset.id); render(); }
        break;
      case "delete-category":
        deleteCategory(el.dataset.course, el.dataset.id); render(); break;
      case "delete-test":
        deleteTest(el.dataset.course, el.dataset.id); render(); break;
      case "delete-assignment":
        deleteAssignment(el.dataset.course, el.dataset.id); render(); break;
      case "quiz-answer":
        answerQuiz(el.dataset.key, Number(el.dataset.qindex), Number(el.dataset.choice)); render(); break;
      case "quiz-reset":
        if (el.dataset.key === "sat:quiz:active") delete quizState[el.dataset.key];
        else resetQuiz(el.dataset.key);
        render(); break;
      case "play-video":
        videoLibraryIndex = Number(el.dataset.index);
        render();
        document.querySelector(".video-embed")?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
    }
  });

  app.addEventListener("focusout", (e) => {
    const el = e.target;
    if (!el.matches || !el.matches('[data-action="save-notes"]')) return;
    saveTaskNotes(el.dataset.id, el.value, el.style.height || null);
  });

  app.addEventListener("submit", (e) => {
    const form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    switch (form.dataset.form) {
      case "add-task": addTask(data); break;
      case "add-block": addBlock(data); break;
      case "add-course": addCourse(data); break;
      case "add-category": addCategory(form.dataset.course, data); break;
      case "add-test": addTest(form.dataset.course, data); break;
      case "add-assignment": addAssignment(form.dataset.course, data); break;
    }
    render();
  });
});
