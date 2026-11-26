/* ============================================================
   Sample data for the demo UI. Everything here is made up so the
   screens can be clicked through. A real build would fetch this
   from the backend.
   ============================================================ */

const USER = {
  name: "Yazeed Hamdy",
  initials: "YH",
  committee: "Devology",
  id: "P-1042",
  email: "yazeed@example.com",
};

const SESSIONS = [
  {
    id: "s1",
    title: "Git & GitHub Basics",
    committee: "Devology",
    date: "Nov 5, 2026",
    day: 5,
    time: "6:00 PM",
    location: "Room B2",
    status: "done",
    attended: true,
    rated: false,
    materials: "Slides + cheat sheet",
  },
  {
    id: "s2",
    title: "HTML & CSS Deep Dive",
    committee: "Devology",
    date: "Nov 12, 2026",
    day: 12,
    time: "6:00 PM",
    location: "Room B2",
    status: "done",
    attended: true,
    rated: true,
    materials: "Slides + practice files",
  },
  {
    id: "s3",
    title: "JavaScript Fundamentals",
    committee: "Devology",
    date: "Nov 19, 2026",
    day: 19,
    time: "6:00 PM",
    location: "Online (Zoom)",
    status: "done",
    attended: false,
    rated: false,
    materials: "Slides + recording",
  },
  {
    id: "s4",
    title: "JS Fundamentals Recap + Quiz",
    committee: "Devology",
    date: "Nov 26, 2026",
    day: 26,
    time: "7:00 PM",
    location: "Room B2",
    status: "live",
    attended: null, // check-in still open
    rated: false,
    materials: "Recap sheet",
  },
  {
    id: "s5",
    title: "DOM Manipulation Workshop",
    committee: "Devology",
    date: "Nov 29, 2026",
    day: 29,
    time: "6:00 PM",
    location: "Room B2",
    status: "upcoming",
    attended: null,
    rated: false,
    materials: "Will be shared after the session",
  },
];

/* Task statuses: open | pending | approved | resubmit | closed */
const TASKS = [
  {
    id: "t1",
    title: "Task 1: Personal landing page",
    session: "HTML & CSS Deep Dive",
    deadline: "Nov 15, 2026 - 11:59 PM",
    passed: true,
    rules: "One page, semantic HTML, external CSS only. Upload a Drive link to a zip or repo.",
    status: "approved",
    grade: "9/10",
    learningRate: "Excellent",
    submission: "https://drive.google.com/.../task1-yazeed.zip",
    feedback: { from: "AC - Devology", text: "Great structure and clean CSS. Watch image file sizes next time." },
    history: [{ when: "Nov 14, 9:41 PM", what: "Submitted v1" }],
  },
  {
    id: "t2",
    title: "Task 2: Flexbox photo grid",
    session: "HTML & CSS Deep Dive",
    deadline: "Nov 22, 2026 - 11:59 PM",
    passed: true,
    rules: "Responsive grid, 3 columns on desktop, 1 on mobile. No frameworks.",
    status: "resubmit",
    grade: null,
    learningRate: null,
    submission: "https://drive.google.com/.../task2-yazeed.zip",
    feedback: { from: "AC - Devology", text: "The navbar breaks on mobile width. Fix the wrapping and resubmit." },
    history: [{ when: "Nov 21, 8:15 PM", what: "Submitted v1 - needs resubmission" }],
  },
  {
    id: "t3",
    title: "Task 3: JS to-do app",
    session: "JavaScript Fundamentals",
    deadline: "Nov 29, 2026 - 11:59 PM",
    passed: false,
    rules: "Add / delete / mark done. Store items in an array, render with DOM methods. Upload a Drive link.",
    status: "open",
    grade: null,
    learningRate: null,
    submission: null,
    feedback: null,
    history: [],
  },
  {
    id: "t4",
    title: "Task 4: API fetch challenge",
    session: "JavaScript Fundamentals",
    deadline: "Nov 24, 2026 - 11:59 PM",
    passed: true,
    rules: "Fetch users from a public API and render a list. Closed - late submission only if HR allows it.",
    status: "closed",
    grade: null,
    learningRate: null,
    submission: null,
    feedback: null,
    history: [],
  },
];

const QUIZZES = [
  {
    id: "q1",
    title: "Git Basics Quiz",
    session: "Git & GitHub Basics",
    status: "done",
    score: 4,
    total: 5,
    questions: [
      {
        q: "Which command creates a new branch?",
        options: ["git branch <name>", "git new <name>", "git checkout <name>", "git make <name>"],
        answer: 0,
        picked: 0,
      },
      {
        q: "What does git clone do?",
        options: ["Copies a remote repo locally", "Deletes a repo", "Renames a branch", "Pushes commits"],
        answer: 0,
        picked: 0,
      },
      {
        q: "Which file lists paths git should ignore?",
        options: [".gitignore", "ignore.txt", ".gitconfig", "README.md"],
        answer: 0,
        picked: 0,
      },
      {
        q: "git push sends commits to...",
        options: ["The remote repository", "The staging area", "The recycle bin", "A branch you deleted"],
        answer: 0,
        picked: 0,
      },
      {
        q: "What is a commit?",
        options: ["A snapshot of changes", "A branch name", "A remote server", "A merge conflict"],
        answer: 0,
        picked: 1, // the one he got wrong
      },
    ],
  },
  {
    id: "q2",
    title: "JavaScript Basics Quiz",
    session: "JavaScript Fundamentals",
    status: "open",
    score: null,
    total: 4,
    questions: [
      {
        q: "Which keyword declares a block-scoped variable?",
        options: ["var", "let", "function", "global"],
        answer: 1,
      },
      {
        q: "What does typeof [] return?",
        options: ["'array'", "'object'", "'list'", "'undefined'"],
        answer: 1,
      },
      {
        q: "Which method adds an item to the end of an array?",
        options: ["push()", "pop()", "shift()", "slice()"],
        answer: 0,
      },
      {
        q: "How do you write an arrow function?",
        options: ["x => x * 2", "def x: x*2", "func(x){x*2}", "x -> x*2"],
        answer: 0,
      },
    ],
  },
];

const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "DOM workshop moved to Sunday 6 PM",
    body: "The DOM Manipulation workshop is on Sunday Nov 29 at 6 PM in Room B2, not Saturday. Bring your laptops.",
    when: "Nov 25, 2026",
  },
  {
    id: "a2",
    title: "Task 3 is out",
    body: "The JS to-do app task is live. Deadline is Nov 29, 11:59 PM. Upload a Drive link from the task page.",
    when: "Nov 23, 2026",
  },
  {
    id: "a3",
    title: "Welcome to Devology cycle 3",
    body: "Check the Materials tab for the intro slides and join the WhatsApp group pinned by HR.",
    when: "Nov 3, 2026",
  },
];

const NOTIFICATIONS = [
  { id: "n1", kind: "review", text: "Review result: Task 2 needs resubmission (navbar on mobile).", when: "Nov 24", isNew: true, link: "#/task/t2" },
  { id: "n2", kind: "deadline", text: "Deadline: Task 3 is due Nov 29, 11:59 PM.", when: "Nov 25", isNew: true, link: "#/task/t3" },
  { id: "n3", kind: "review", text: "Task 1 approved - 9/10. Great work.", when: "Nov 16", isNew: false, link: "#/task/t1" },
  { id: "n4", kind: "deadline", text: "Task 4 deadline passed. Contact HR if you need a late submission.", when: "Nov 24", isNew: false, link: "#/task/t4" },
];

/* The check-in code HR shares at the start of a live session.
   Shown on screen in this demo; in production the participant
   only gets it from HR at the venue or from the QR. */
const CHECKIN = { sessionId: "s4", code: "7392" };
