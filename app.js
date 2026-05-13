const SUPABASE_URL = "https://pisifwrhsxzsbjhvykvx.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_54ppTsmpRi0dlcHNt_Gp3A_jehgnPPR";

const labels = {
  trabajo: "trabajo",
  escucha: "escucha",
  tramite: "trámite importante",
  autonomia: "autonomía",
  salir: "volver a salir",
  acompanamiento: "acompañamiento",
  ciudad: "ciudad nueva",
  barrio: "barrio",
  manana: "mañana",
  tarde: "tarde",
  noche: "noche",
  finde: "fin de semana",
  flexible: "horario flexible",
  individual: "match individual",
  circulo: "círculo grupal",
  ambos: "individual o círculo",
  mujer: "mujer",
  varon: "varón",
  no_binario: "no binario",
  prefiero_no_decir: "prefiere no decir",
  solo_mujeres: "sólo mujeres",
  sin_preferencia: "sin preferencia",
};

const circles = [
  {
    title: "Trabajo sin hacerlo solo",
    text: "CVs, entrevistas y esa parte rara de venderse sin sonar como folleto.",
    tags: ["online", "sin humo", "con práctica"],
  },
  {
    title: "Atravesar algo acompañado",
    text: "Turnos, trámites y momentos que pesan menos cuando no vas solo.",
    tags: ["cuidado", "presencia", "sin juicio"],
  },
  {
    title: "Autonomía práctica",
    text: "Aprender eso que destraba una parte de la vida. Chiquito para uno, enorme para otro.",
    tags: ["aprendizaje", "autonomía", "dignidad"],
  },
  {
    title: "Ciudad nueva",
    text: "Para quienes se mudaron y necesitan pasar de “no conozco nada” a “ya tengo un lugar”.",
    tags: ["barrio", "pertenencia", "gente real"],
  },
];

const diarySeed = [
  {
    title: "Una entrevista menos solitaria",
    text: "Alguien practicó preguntas difíciles y llegó con más aire.",
  },
  {
    title: "Un estudio médico acompañado",
    text: "Una persona no atravesó sola una espera que le daba miedo.",
  },
  {
    title: "Un trámite explicado",
    text: "Un proceso confuso se volvió una lista de pasos posibles.",
  },
];

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

const authCard = document.querySelector("#authCard");
const authForm = document.querySelector("#authForm");
const authEmail = document.querySelector("#authEmail");
const authStatus = document.querySelector("#authStatus");
const dashboard = document.querySelector("#dashboard");
const sessionEmail = document.querySelector("#sessionEmail");
const signOut = document.querySelector("#signOut");
const profileForm = document.querySelector("#profileForm");
const profileStatus = document.querySelector("#profileStatus");
const matchList = document.querySelector("#matchList");
const refreshMatches = document.querySelector("#refreshMatches");
const messageList = document.querySelector("#messageList");
const messageForm = document.querySelector("#messageForm");
const messageBody = document.querySelector("#messageBody");
const sendMessage = document.querySelector("#sendMessage");
const refreshChat = document.querySelector("#refreshChat");
const chatTitle = document.querySelector("#chatTitle");
const circleGrid = document.querySelector("#circleGrid");
const diaryList = document.querySelector("#diaryList");
const navAccess = document.querySelector("#navAccess");

let currentUser = null;
let currentAct = null;
let activeConversationId = null;

function byId(id) {
  return document.querySelector(`#${id}`);
}

function setStatus(text, kind = "neutral") {
  profileStatus.textContent = text;
  profileStatus.dataset.kind = kind;
}

function label(value) {
  return labels[value] || value || "sin definir";
}

function renderCircles() {
  circleGrid.innerHTML = circles
    .map(
      (circle) => `
        <article class="circle-card">
          <div>
            <strong>${circle.title}</strong>
            <p>${circle.text}</p>
          </div>
          <div class="tag-row">
            ${circle.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderDiary() {
  diaryList.innerHTML = diarySeed
    .map(
      (item) => `
        <article class="diary-card">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `,
    )
    .join("");
}

async function handleAuth(event) {
  event.preventDefault();
  authStatus.textContent = "Mandando enlace...";

  const { error } = await db.auth.signInWithOtp({
    email: authEmail.value.trim(),
    options: {
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  authStatus.textContent = error
    ? "No pudimos mandar el enlace. Revisá el mail e intentá otra vez."
    : "Listo. Ahora abrí tu mail y tocá el enlace para entrar a tu panel.";
}

async function loadSession() {
  const {
    data: { session },
  } = await db.auth.getSession();

  currentUser = session?.user || null;
  renderSession();
}

function renderSession() {
  const isLogged = Boolean(currentUser);
  document.body.classList.toggle("is-logged", isLogged);
  authCard.hidden = isLogged;
  dashboard.hidden = !isLogged;
  navAccess.textContent = isLogged ? "Mi panel" : "Entrar";

  if (!isLogged) {
    window.location.hash = window.location.hash || "#inicio";
    return;
  }

  sessionEmail.textContent = currentUser.email;
  if (window.location.hash !== "#app") {
    window.location.hash = "#app";
  }
  loadProfileAndAct();
}

async function loadProfileAndAct() {
  setStatus("Cargando...", "neutral");

  const [{ data: profile }, { data: acts }] = await Promise.all([
    db.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
    db.from("acts").select("*").eq("user_id", currentUser.id).eq("status", "active").order("updated_at", { ascending: false }).limit(1),
  ]);

  currentAct = acts?.[0] || null;

  byId("displayName").value = profile?.display_name || "";
  byId("zone").value = profile?.zone || currentAct?.zone || "";
  byId("gender").value = profile?.gender || "";
  byId("offer").value = currentAct?.offer || "";
  byId("need").value = currentAct?.need || "";
  byId("availability").value = currentAct?.availability || "";
  byId("purpose").value = currentAct?.purpose || "";
  byId("matchMode").value = currentAct?.match_mode || "";
  byId("safetyPreference").value = currentAct?.safety_preference || "sin_preferencia";
  byId("needStory").value = currentAct?.need_story || "";

  setStatus(currentAct ? "Guardado" : "Nuevo perfil", currentAct ? "ok" : "neutral");
  await loadMatches();
}

async function saveProfile(event) {
  event.preventDefault();
  setStatus("Guardando...", "neutral");

  const profile = {
    id: currentUser.id,
    display_name: byId("displayName").value.trim(),
    zone: byId("zone").value.trim(),
    gender: byId("gender").value,
    updated_at: new Date().toISOString(),
  };

  const act = {
    user_id: currentUser.id,
    offer: byId("offer").value,
    need: byId("need").value,
    need_story: byId("needStory").value.trim(),
    zone: byId("zone").value.trim(),
    availability: byId("availability").value,
    purpose: byId("purpose").value,
    match_mode: byId("matchMode").value,
    safety_preference: byId("safetyPreference").value,
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const profileResult = await db.from("profiles").upsert(profile);
  const actResult = currentAct
    ? await db.from("acts").update(act).eq("id", currentAct.id).select().single()
    : await db.from("acts").insert(act).select().single();

  if (profileResult.error || actResult.error) {
    setStatus("No se guardó", "bad");
    return;
  }

  currentAct = actResult.data;
  setStatus("Guardado", "ok");
  await loadMatches();
}

function renderMatches(matches = []) {
  if (!currentAct) {
    matchList.innerHTML = `<p class="empty-state">Guardá tu acto para buscar compatibilidades.</p>`;
    return;
  }

  if (!matches.length) {
    matchList.innerHTML = `<p class="empty-state">Todavía no hay matches. Mejor eso que forzar uno flojo.</p>`;
    return;
  }

  matchList.innerHTML = matches
    .map(
      (match) => `
        <article class="match-card">
          <div>
            <strong>${match.display_name || "Alguien de Actos"}</strong>
            <p>${match.zone || "Zona a coordinar"} · ${label(match.match_mode)} · ofrece ${label(match.offer)} · necesita ${label(match.need)}</p>
            <p>Seguridad: ${label(match.safety_preference)}</p>
            <small>${match.need_story || "Sin contexto cargado todavía."}</small>
          </div>
          <button class="button secondary" data-match-id="${match.act_id}" type="button">Abrir chat</button>
        </article>
      `,
    )
    .join("");
}

async function loadMatches() {
  if (!currentUser) return;

  matchList.innerHTML = `<p class="empty-state">Buscando matches con criterio...</p>`;
  const { data, error } = await db.rpc("get_match_suggestions");

  if (error) {
    matchList.innerHTML = `<p class="empty-state">Todavía falta activar los matches en Supabase.</p>`;
    return;
  }

  renderMatches(data || []);
}

async function openConversation(matchActId) {
  const { data, error } = await db.rpc("create_conversation_for_match", {
    match_act_id: matchActId,
  });

  if (error || !data) {
    chatTitle.textContent = "No se pudo abrir el chat";
    return;
  }

  activeConversationId = Array.isArray(data) ? data[0]?.conversation_id : data;
  chatTitle.textContent = "Chat abierto";
  messageBody.disabled = false;
  sendMessage.disabled = false;
  await loadMessages();
}

async function loadMessages() {
  if (!activeConversationId) return;

  const { data, error } = await db
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("conversation_id", activeConversationId)
    .order("created_at", { ascending: true });

  if (error) {
    messageList.innerHTML = `<p class="empty-state">No pudimos cargar el chat.</p>`;
    return;
  }

  if (!data?.length) {
    messageList.innerHTML = `<p class="empty-state">Chat listo. Primer mensaje sugerido: “Hola, vi tu acto y creo que puedo ayudarte”.</p>`;
    return;
  }

  messageList.innerHTML = data
    .map(
      (message) => `
        <p class="message ${message.sender_id === currentUser.id ? "mine" : ""}">
          ${message.body}
        </p>
      `,
    )
    .join("");
  messageList.scrollTop = messageList.scrollHeight;
}

async function sendChatMessage(event) {
  event.preventDefault();
  const body = messageBody.value.trim();
  if (!body || !activeConversationId) return;

  const { error } = await db.from("messages").insert({
    conversation_id: activeConversationId,
    sender_id: currentUser.id,
    body,
  });

  if (!error) {
    messageBody.value = "";
    await loadMessages();
  }
}

authForm.addEventListener("submit", handleAuth);
profileForm.addEventListener("submit", saveProfile);
refreshMatches.addEventListener("click", loadMatches);
refreshChat.addEventListener("click", loadMessages);
messageForm.addEventListener("submit", sendChatMessage);
signOut.addEventListener("click", async () => {
  await db.auth.signOut();
  currentUser = null;
  currentAct = null;
  activeConversationId = null;
  renderSession();
  window.location.hash = "#inicio";
});

matchList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-match-id]");
  if (!button) return;
  openConversation(button.dataset.matchId);
});

db.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  renderSession();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderCircles();
renderDiary();
loadSession();
