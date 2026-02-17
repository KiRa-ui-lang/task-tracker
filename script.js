const STORAGE_KEY = "taskTracker.tasks.v1";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const countLabel = document.getElementById("countLabel");
const clearDoneBtn = document.getElementById("clearDoneBtn");
const filterButtons = Array.from(document.querySelectorAll(".filter"));

/**
 * Task shape:
 * { id: string, text: string, done: boolean, createdAt: number }
 */
let tasks = loadTasks();
let currentFilter = "all";

render();

// ---------- Events ----------
addBtn.addEventListener("click", addTaskFromInput);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTaskFromInput();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks(tasks);
  render();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

// ---------- Core actions ----------
function addTaskFromInput() {
  const raw = taskInput.value.trim();
  if (!raw) return;

  const newTask = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text: raw,
    done: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  taskInput.value = "";
  taskInput.focus();

  saveTasks(tasks);
  render();
}

function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks(tasks);
  render();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  render();
}

// ---------- Render ----------
function render() {
  const visible = applyFilter(tasks, currentFilter);

  taskList.innerHTML = "";
  visible.forEach(task => {
    taskList.appendChild(renderTask(task));
  });

  emptyState.style.display = tasks.length === 0 ? "block" : "none";
  countLabel.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = `task ${task.done ? "done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleDone(task.id));

  const label = document.createElement("label");
  label.className = "text";
  label.textContent = task.text;
  label.title = new Date(task.createdAt).toLocaleString();

  const delBtn = document.createElement("button");
  delBtn.className = "iconBtn";
  delBtn.type = "button";
  delBtn.textContent = "🗑️";
  delBtn.setAttribute("aria-label", "Delete task");
  delBtn.addEventListener("click", () => removeTask(task.id));

  li.appendChild(checkbox);
  li.appendChild(label);
  li.appendChild(delBtn);
  return li;
}

function applyFilter(allTasks, filter) {
  if (filter === "active") return allTasks.filter(t => !t.done);
  if (filter === "done") return allTasks.filter(t => t.done);
  return allTasks;
}

// ---------- Storage ----------
function saveTasks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
