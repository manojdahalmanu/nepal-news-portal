const sb = supabaseClient;

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const searchBtn = document.getElementById("searchBtn");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchSubmit = document.getElementById("searchSubmit");
const currentDate = document.getElementById("currentDate");

menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
searchBtn.addEventListener("click", () => {
  searchPanel.classList.toggle("open");
  if (searchPanel.classList.contains("open")) searchInput.focus();
});

currentDate.textContent = new Intl.DateTimeFormat("en-GB", {
  weekday:"long", year:"numeric", month:"long", day:"numeric"
}).format(new Date());

let allNews = [];

function esc(s=""){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatDate(v){
  return new Intl.DateTimeFormat("ne-NP",{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(v));
}
function heroCard(n){
  return `<img src="${esc(n.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80')}" alt="">
  <div class="overlay"></div><div class="hero-content"><span class="category">${esc(n.category)}</span>
  <h2>${esc(n.title)}</h2><p>${esc(n.summary || '')}</p><div class="meta">${formatDate(n.created_at)}</div></div>`;
}
function sideCard(n){
  return `<img src="${esc(n.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80')}" alt="">
  <div class="side-card-body"><span class="category">${esc(n.category)}</span><h3>${esc(n.title)}</h3><div class="meta dark">${formatDate(n.created_at)}</div></div>`;
}
function newsItem(n){
  return `<article class="news-item">
    <img src="${esc(n.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80')}" alt="">
    <div><span class="mini-cat">${esc(n.category)}</span><h3>${esc(n.title)}</h3>
    <p>${esc(n.summary || '')}</p><div class="meta dark">${formatDate(n.created_at)}</div></div>
  </article>`;
}
function popularItem(n,i){
  return `<a class="popular-item" href="#"><span>${String(i+1).padStart(2,"0")}</span><div><h4>${esc(n.title)}</h4><small>${formatDate(n.created_at)}</small></div></a>`;
}
function render(list){
  const heroArea = document.getElementById("heroArea");
  const newsList = document.getElementById("newsList");
  const popularList = document.getElementById("popularList");
  const emptyState = document.getElementById("emptyState");
  const ticker = document.getElementById("ticker");

  if (!list.length){
    heroArea.innerHTML = "";
    newsList.innerHTML = "";
    popularList.innerHTML = "";
    emptyState.hidden = false;
    ticker.textContent = "अहिलेसम्म समाचार प्रकाशित गरिएको छैन।";
    return;
  }
  emptyState.hidden = true;

  const main = list[0];
  const side1 = list[1] || list[0];
  const side2 = list[2] || list[0];

  heroArea.innerHTML = `
    <article class="hero-main">${heroCard(main)}</article>
    <div class="hero-side">
      <article class="side-card">${sideCard(side1)}</article>
      <article class="side-card">${sideCard(side2)}</article>
    </div>`;

  newsList.innerHTML = list.slice(3).map(newsItem).join("") || list.map(newsItem).join("");
  popularList.innerHTML = [...list].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5).map(popularItem).join("");
  ticker.textContent = list.slice(0,6).map(n=>n.title).join("   •   ");
}

async function loadNews(){
  const { data, error } = await sb
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending:false });

  if (error){
    document.getElementById("ticker").textContent = "Supabase configuration मिलेको छैन।";
    console.error(error);
    return;
  }
  allNews = data || [];
  render(allNews);
}

function applySearch(){
  const q = searchInput.value.trim().toLowerCase();
  const filtered = !q ? allNews : allNews.filter(n =>
    [n.title,n.summary,n.content,n.category].filter(Boolean).join(" ").toLowerCase().includes(q)
  );
  render(filtered);
}
searchSubmit.addEventListener("click", applySearch);
searchInput.addEventListener("input", applySearch);

document.querySelectorAll("[data-category]").forEach(a=>{
  a.addEventListener("click", e=>{
    e.preventDefault();
    const cat = a.dataset.category;
    render(allNews.filter(n=>n.category===cat));
    navLinks.classList.remove("open");
  });
});

loadNews();
