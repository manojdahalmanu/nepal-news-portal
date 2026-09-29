const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const searchBtn = document.getElementById("searchBtn");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchSubmit = document.getElementById("searchSubmit");
const subscribeBtn = document.getElementById("subscribeBtn");
const emailInput = document.getElementById("emailInput");
const subscribeMessage = document.getElementById("subscribeMessage");
const currentDate = document.getElementById("currentDate");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

searchBtn.addEventListener("click", () => {
  searchPanel.classList.toggle("open");
  if (searchPanel.classList.contains("open")) {
    searchInput.focus();
  }
});

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const items = document.querySelectorAll(".searchable");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle("hidden-by-search", query && !text.includes(query));
  });
}

searchSubmit.addEventListener("click", runSearch);
searchInput.addEventListener("input", runSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runSearch();
});

subscribeBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!validEmail.test(email)) {
    subscribeMessage.textContent = "कृपया मान्य इमेल ठेगाना लेख्नुहोस्।";
    subscribeMessage.style.color = "#d71920";
    return;
  }

  subscribeMessage.textContent = "धन्यवाद! तपाईं Newsletter मा जोडिनुभयो।";
  subscribeMessage.style.color = "#0b8f55";
  emailInput.value = "";
});

const dateFormatter = new Intl.DateTimeFormat("ne-NP", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

currentDate.textContent = dateFormatter.format(new Date());

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});
