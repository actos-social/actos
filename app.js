const circles = [
  {
    title: "Trabajo sin hacerlo solo",
    text: "Personas que buscan empleo se cruzan con gente que puede revisar CVs, practicar entrevistas y abrir una primera orientacion.",
    tags: ["21 dias", "online", "4 a 6 personas"],
  },
  {
    title: "Ciudad nueva, gente real",
    text: "Para quienes migraron, se mudaron o sienten que arrancan de cero en un lugar desconocido.",
    tags: ["presencial", "barrio", "salidas simples"],
  },
  {
    title: "Atravesar algo acompanado",
    text: "Turnos, tramites, conversaciones y momentos importantes que pesan menos con alguien al lado.",
    tags: ["cuidado", "presencia", "sin juicio"],
  },
  {
    title: "Autonomia practica",
    text: "Personas que ensenan saberes concretos para que otra persona gane independencia.",
    tags: ["aprendizaje", "autonomia", "dignidad"],
  },
];

const diarySeed = [
  {
    title: "30 minutos para una entrevista",
    text: "Una persona practico preguntas dificiles con alguien de recursos humanos y llego mas tranquila.",
  },
  {
    title: "Un estudio medico acompanado",
    text: "Una persona no tuvo que atravesar sola una espera que le daba miedo.",
  },
  {
    title: "Un tramite traducido",
    text: "Alguien explico un proceso confuso hasta convertirlo en pasos posibles.",
  },
];

const copyByPurpose = {
  trabajo: "Te conviene entrar a un circulo de trabajo: alguien puede ayudarte y vos tambien podes sostener a otra persona que esta buscando.",
  acompanamiento: "Te conviene un circulo de acompanamiento: personas disponibles para atravesar momentos importantes sin hacerlo todo en soledad.",
  autonomia: "Te conviene un circulo de autonomia: pequenos aprendizajes y apoyos concretos que ayudan a destrabar la vida cotidiana.",
  ciudad: "Te conviene un circulo de ciudad nueva: personas cerca tuyo para descubrir lugares utiles y armar pertenencia sin forzarla.",
  barrio: "Te conviene un circulo barrial: juntar tiempo disponible para cuidar necesidades reales alrededor tuyo.",
};

const labelByNeed = {
  trabajo: "prepararse para buscar trabajo",
  escucha: "escucha y compania",
  tramite: "afrontar un tramite importante",
  autonomia: "aprender algo que destrabe",
  salir: "volver a salir con compania",
};

const labelByOffer = {
  trabajo: "orientacion laboral o entrevistas",
  escucha: "escucha o acompanamiento",
  tramite: "acompanamiento a tramite esencial",
  autonomia: "ensenar una habilidad para autonomia",
  salir: "acompanar a volver a salir",
};

const labelByAvailability = {
  manana: "manana",
  tarde: "tarde",
  noche: "noche",
  finde: "fin de semana",
  flexible: "horario flexible",
};

const SUPABASE_REST_URL = "https://pisifwrhsxzsbjhvykvx.supabase.co/rest/v1/actos_intake";
const SUPABASE_PUBLIC_KEY = "sb_publisable_54ppTsmpRi0dlcHNt_Gp3A_jehgnPPR";

const circleGrid = document.querySelector("#circleGrid");
const diaryList = document.querySelector("#diaryList");
const matchForm = document.querySelector("#matchForm");
const resultSection = document.querySelector("#resultado");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const shareCard = document.querySelector("#shareCard");
const saveAct = document.querySelector("#saveAct");
const copyAct = document.querySelector("#copyAct");

let latestMatch = null;

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

function getDiary() {
  const stored = window.localStorage.getItem("actos-diary");
  if (!stored) return diarySeed;

  try {
    return [...JSON.parse(stored), ...diarySeed];
  } catch {
    return diarySeed;
  }
}

function renderDiary() {
  diaryList.innerHTML = getDiary()
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

function saveDiaryItem(item) {
  const stored = window.localStorage.getItem("actos-diary");
  const current = stored ? JSON.parse(stored) : [];
  window.localStorage.setItem("actos-diary", JSON.stringify([item, ...current].slice(0, 8)));
}

function saveApplication(item) {
  const stored = window.localStorage.getItem("actos-applications");
  const current = stored ? JSON.parse(stored) : [];
  window.localStorage.setItem("actos-applications", JSON.stringify([item, ...current].slice(0, 20)));
}

async function sendApplication(payload) {
  const response = await fetch(SUPABASE_REST_URL, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    throw new Error(`Supabase rejected the intake with status ${response.status}`);
  }
}

matchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const personName = document.querySelector("#personName").value.trim();
  const offer = document.querySelector("#offer").value;
  const need = document.querySelector("#need").value;
  const needStory = document.querySelector("#needStory").value.trim();
  const zone = document.querySelector("#zone").value.trim();
  const availability = document.querySelector("#availability").value;
  const purpose = document.querySelector("#purpose").value;
  const needLabel = labelByNeed[need] || "una ayuda concreta";
  const offerLabel = labelByOffer[offer] || "tiempo disponible";
  const availabilityLabel = labelByAvailability[availability] || "horario a coordinar";
  const isDirectMatch = offer === need;

  latestMatch = {
    personName,
    title: isDirectMatch ? `Acto directo en ${zone}` : `Circulo sugerido en ${zone}`,
    text: isDirectMatch
      ? `Hay una compatibilidad fuerte: podes ofrecer ${needLabel} y tambien pedirlo. Actos priorizaria un intercambio cuidado, acotado y con contexto.`
      : `${copyByPurpose[purpose]} Tu pedido aparece como una necesidad de ${needLabel}, no como un favor suelto.`,
    shareText: `${personName} se suma a Actos en ${zone}: ofrece ${offerLabel}, necesita ${needLabel} y puede participar en ${availabilityLabel}. Contexto: ${needStory}`,
    needLabel,
    offerLabel,
    needStory,
    zone,
    availabilityLabel,
  };

  const intakePayload = {
    personName,
    offer,
    offerLabel,
    need,
    needLabel,
    needStory,
    zone,
    availability,
    availabilityLabel,
    purpose,
    matchTitle: latestMatch.title,
    matchText: latestMatch.text,
    shareText: latestMatch.shareText,
    createdAt: new Date().toISOString(),
    source: "github_pages_pilot",
    pageUrl: window.location.href,
    userAgent: window.navigator.userAgent,
  };

  resultTitle.textContent = latestMatch.title;
  resultText.textContent = "Guardando tu intencion en la mesa de entrada del piloto...";
  shareCard.textContent = latestMatch.shareText;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    await sendApplication(intakePayload);
    saveApplication({ ...latestMatch, savedRemotely: true });
    resultText.textContent = `${latestMatch.text} Tu intencion ya quedo registrada para el piloto.`;
  } catch {
    saveApplication({ ...latestMatch, savedRemotely: false, intakePayload });
    resultText.textContent = `${latestMatch.text} No pudimos confirmar el guardado online, asi que dejamos una copia local para no perderla.`;
  }
});

saveAct.addEventListener("click", () => {
  if (!latestMatch) return;

  saveDiaryItem({
    title: `Nuevo acto propuesto: ${latestMatch.needLabel}`,
    text: `${latestMatch.personName} acaba de transformar una necesidad real en una posible conexion de tiempo compartido en ${latestMatch.zone}.`,
  });
  renderDiary();
  document.querySelector("#diario").scrollIntoView({ behavior: "smooth", block: "start" });
});

copyAct.addEventListener("click", async () => {
  if (!latestMatch) return;

  const text = `Actos - ficha de piloto\nNombre: ${latestMatch.personName}\nZona: ${latestMatch.zone}\nOfrece: ${latestMatch.offerLabel}\nNecesita: ${latestMatch.needLabel}\nDisponibilidad: ${latestMatch.availabilityLabel}\nContexto humano: ${latestMatch.needStory}\n\n${latestMatch.text}`;

  try {
    await navigator.clipboard.writeText(text);
    copyAct.textContent = "Ficha copiada";
  } catch {
    copyAct.textContent = "Copiala desde la tarjeta";
  }

  window.setTimeout(() => {
    copyAct.textContent = "Copiar ficha";
  }, 2200);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderCircles();
renderDiary();
