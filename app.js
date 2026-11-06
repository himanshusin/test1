const STORAGE_KEY = "tiny-wins-habits";
const DAY_KEY = "tiny-wins-day";

const starterHabits = [
  { id: crypto.randomUUID(), name: "Drink a full glass of water", symbol: "☀", completed: false },
  { id: crypto.randomUUID(), name: "Step outside for ten minutes", symbol: "↗", completed: false },
  { id: crypto.randomUUID(), name: "Write down one good thing", symbol: "✦", completed: false },
];

const elements = {
  list: document.querySelector("#habit-list"),
  template: document.querySelector("#habit-template"),
  empty: document.querySelector("#empty-state"),
  dialog: document.querySelector("#habit-dialog"),
  form: document.querySelector("#habit-form"),
  nameInput: document.querySelector("#habit-name"),
  completed: document.querySelector("#completed-count"),
  total: document.querySelector("#total-count"),
  fill: document.querySelector("#progress-fill"),
  progress: document.querySelector(".progress-track"),
  message: document.querySelector("#progress-message"),
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const isNewDay = localStorage.getItem(DAY_KEY) !== todayKey();

    if (!Array.isArray(saved)) return starterHabits;

    if (isNewDay) {
      return saved.map((habit) => ({ ...habit, completed: false }));
    }

    return saved;
  } catch {
    return starterHabits;
  }
}

let habits = loadHabits();

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  localStorage.setItem(DAY_KEY, todayKey());
}

function progressMessage(completed, total) {
  if (total === 0) return "A fresh page is waiting.";
  if (completed === total) return "You showed up beautifully.";
  if (completed === 0) return "One small step is enough.";
  if (completed / total >= 0.5) return "Look at that gentle momentum.";
  return "You’re already on your way.";
}

function updateProgress() {
  const completed = habits.filter((habit) => habit.completed).length;
  const percentage = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  elements.completed.textContent = completed;
  elements.total.textContent = `/ ${habits.length}`;
  elements.fill.style.width = `${percentage}%`;
  elements.progress.setAttribute("aria-valuenow", percentage);
  elements.message.textContent = progressMessage(completed, habits.length);
}

function toggleHabit(id) {
  habits = habits.map((habit) =>
    habit.id === id ? { ...habit, completed: !habit.completed } : habit,
  );
  saveHabits();
  render();
}

function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabits();
  render();
}

function render() {
  elements.list.replaceChildren();
  elements.empty.hidden = habits.length !== 0;

  habits.forEach((habit) => {
    const item = elements.template.content.firstElementChild.cloneNode(true);
    const checkButton = item.querySelector(".check-button");

    item.classList.toggle("completed", habit.completed);
    item.querySelector(".habit-symbol").textContent = habit.symbol;
    item.querySelector(".habit-name").textContent = habit.name;
    checkButton.setAttribute(
      "aria-label",
      habit.completed ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`,
    );
    checkButton.setAttribute("aria-pressed", String(habit.completed));
    checkButton.addEventListener("click", () => toggleHabit(habit.id));
    item
      .querySelector(".delete-button")
      .addEventListener("click", () => deleteHabit(habit.id));

    elements.list.append(item);
  });

  updateProgress();
}

function openDialog() {
  elements.dialog.showModal();
  requestAnimationFrame(() => elements.nameInput.focus());
}

document.querySelector("#today").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

document.querySelector("#open-dialog").addEventListener("click", openDialog);
document.querySelector("#close-dialog").addEventListener("click", () => elements.dialog.close());

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const name = formData.get("habit").trim();

  if (!name) return;

  habits.push({
    id: crypto.randomUUID(),
    name,
    symbol: formData.get("symbol"),
    completed: false,
  });

  saveHabits();
  elements.form.reset();
  elements.dialog.close();
  render();
});

document.querySelector("#clear-completed").addEventListener("click", () => {
  habits = habits.filter((habit) => !habit.completed);
  saveHabits();
  render();
});

saveHabits();
render();
