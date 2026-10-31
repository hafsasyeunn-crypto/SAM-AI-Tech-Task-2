const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem("daybloomTasks"));
  if (Array.isArray(saved)) {
    tasks = saved.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean" &&
      ["Low", "Medium", "High"].includes(task.priority)
    );
  }
} catch {
  tasks = [];
}

let currentFilter = "all";
let toastTimer;

function saveTasks() {
  try {
    localStorage.setItem("daybloomTasks", JSON.stringify(tasks));
  } catch {
    showToast("Couldn't save tasks in this browser.");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;
  const percent = total ? Math.round(completed / total * 100) : 0;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";

  document.getElementById("progressTitle").textContent =
    total === 0 ? "Ready when you are!"
    : remaining === 0 ? "You did it! Amazing work!"
    : "You're making progress!";

  document.getElementById("progressCaption").textContent =
    total === 0 ? "Your next great day starts here ✨"
    : remaining === 0 ? "All tasks completed. Celebrate yourself! ✨"
    : `${completed} of ${total} completed · ${remaining} more to go`;
}

function createTaskElement(task) {
  const item = document.createElement("article");
  item.className = "task-item" + (task.completed ? " done" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", "Mark task completed");

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();

    if (task.completed) {
      showToast("Task completed. Well done! ✨");
    }
  });

  const content = document.createElement("div");
  content.className = "task-content";

  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = task.text;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const priority = document.createElement("span");
  priority.className = "priority " + task.priority;
  priority.textContent = task.priority + " priority";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Completed ✓" : "In progress";

  meta.append(priority, status);
  content.append(name, meta);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "✕";
  deleteButton.setAttribute("aria-label", "Delete " + task.text);

  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    renderTasks();
    showToast("Task removed.");
  });

  item.append(checkbox, content, deleteButton);
  return item;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  emptyState.hidden = visibleTasks.length > 0;
  updateProgress();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    showToast("Write a task first 🌷");
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString() + Math.random().toString(36).slice(2),
    text,
    priority: priorityInput.value,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  showToast("A new task added. You've got this!");
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
  });
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter(task => !task.completed);

  if (tasks.length === before) {
    showToast("No completed tasks to clear.");
    return;
  }

  saveTasks();
  renderTasks();
  showToast("Completed tasks cleared.");
});

renderTasks();