const sb = supabaseClient;

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");

async function syncSession(){
  const { data:{ session } } = await sb.auth.getSession();
  if(session){
    loginCard.hidden = true;
    dashboard.hidden = false;
    logoutBtn.hidden = false;
    loadAdminNews();
  } else {
    loginCard.hidden = false;
    dashboard.hidden = true;
    logoutBtn.hidden = true;
  }
}
syncSession();

document.getElementById("loginBtn").addEventListener("click", async()=>{
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");
  msg.textContent = "Login हुँदैछ...";
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if(error){ msg.textContent = error.message; msg.style.color="#b91c1c"; return; }
  msg.textContent = "";
  syncSession();
});

logoutBtn.addEventListener("click", async()=>{ await sb.auth.signOut(); syncSession(); });

function esc(s=""){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function resetForm(){
  ["newsId","title","summary","content"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("category").value="राजनीति";
  document.getElementById("published").value="true";
  document.getElementById("imageFile").value="";
  document.getElementById("imagePreview").innerHTML="";
  document.getElementById("formTitle").textContent="नयाँ समाचार प्रकाशित गर्नुहोस्";
}
document.getElementById("resetBtn").addEventListener("click", resetForm);

async function uploadImage(file){
  if(!file) return null;
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from("news-images").upload(path, file, { upsert:false });
  if(error) throw error;
  const { data } = sb.storage.from("news-images").getPublicUrl(path);
  return data.publicUrl;
}

document.getElementById("saveBtn").addEventListener("click", async()=>{
  const saveMsg = document.getElementById("saveMsg");
  const id = document.getElementById("newsId").value;
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const summary = document.getElementById("summary").value.trim();
  const content = document.getElementById("content").value.trim();
  const published = document.getElementById("published").value === "true";
  const file = document.getElementById("imageFile").files[0];

  if(!title){ saveMsg.textContent="शीर्षक अनिवार्य छ।"; saveMsg.style.color="#b91c1c"; return; }

  saveMsg.textContent="Saving...";
  try{
    let payload = { title, category, summary, content, published };
    if(file){
      payload.image_url = await uploadImage(file);
    }

    let result;
    if(id){
      result = await sb.from("news").update(payload).eq("id", id);
    } else {
      result = await sb.from("news").insert(payload);
    }
    if(result.error) throw result.error;

    saveMsg.textContent = id ? "समाचार update भयो।" : "समाचार प्रकाशित भयो।";
    saveMsg.style.color="#0b8f55";
    resetForm();
    loadAdminNews();
  }catch(err){
    saveMsg.textContent = err.message;
    saveMsg.style.color="#b91c1c";
  }
});

async function loadAdminNews(){
  const wrap = document.getElementById("newsTable");
  wrap.innerHTML="Loading...";
  const { data, error } = await sb.from("news").select("*").order("created_at",{ascending:false});
  if(error){ wrap.innerHTML=`<p>${esc(error.message)}</p>`; return; }
  wrap.innerHTML = (data||[]).map(n=>`
    <div class="row">
      <img src="${esc(n.image_url||'')}" alt="">
      <div><h3>${esc(n.title)}</h3><small>${esc(n.category)} · ${n.published ? "Published":"Draft"}</small></div>
      <div class="actions">
        <button onclick='editNews(${JSON.stringify(n).replace(/'/g,"&#39;")})'>Edit</button>
        <button class="danger" onclick="deleteNews('${n.id}')">Delete</button>
      </div>
    </div>`).join("") || "<p>No news yet.</p>";
}

window.editNews = function(n){
  document.getElementById("newsId").value=n.id||"";
  document.getElementById("title").value=n.title||"";
  document.getElementById("category").value=n.category||"राजनीति";
  document.getElementById("summary").value=n.summary||"";
  document.getElementById("content").value=n.content||"";
  document.getElementById("published").value=String(!!n.published);
  document.getElementById("imagePreview").innerHTML=n.image_url?`<img src="${esc(n.image_url)}">`:"";
  document.getElementById("formTitle").textContent="समाचार Edit गर्नुहोस्";
  window.scrollTo({top:0,behavior:"smooth"});
};

window.deleteNews = async function(id){
  if(!confirm("यो समाचार delete गर्ने?")) return;
  const { error } = await sb.from("news").delete().eq("id",id);
  if(error) alert(error.message); else loadAdminNews();
};

document.getElementById("refreshBtn").addEventListener("click", loadAdminNews);
