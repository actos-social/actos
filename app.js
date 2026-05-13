const circles = [
  {
    title: "Trabajo sin hacerlo solo",
    text: "Personas que buscan empleo se cruzan con gente que puede revisar CVs, practicar entrevistas y abrir puertas.",
    tags: ["21 dias", "online", "4 a 6 personas"],
  },
  {
    title: "Ciudad nueva, gente real",
    text: "Para quienes migraron, se mudaron o sienten que arrancan de cero en un lugar desconocido.",
    tags: ["presencial", "barrio", "salidas simples"],
  },
  {
    title: "Salir mas de casa",
    text: "Caminatas, meriendas, bibliotecas y planes chicos para recuperar movimiento con compania tranquila.",
    tags: ["cuidado", "ritmo bajo", "sin presion"],
  },
  {
    title: "Oficios que circulan",
    text: "Vecinos que ensenan, reparan o acompanan aprendizajes practicos sin convertir todo en dinero.",
    tags: ["banco de tiempo", "local", "aprendizaje"],
  },
];

const diarySeed = [
  {
    title: "30 minutos para una entrevista",
    text: "Una persona practico preguntas dificiles con alguien de recursos humanos y llego mas tranquila.",
  },
  {
    title: "Primera caminata compartida",
    text: "Dos desconocidos del mismo barrio salieron a caminar despues de semanas postergandolo.",
  },
  {
    title: "Una campera arreglada",
    text: "Un vecino enseno a coser un cierre y evito que una prenda terminara en la basura.",
  },
];

const copyByPurpose = {
  trabajo: "Te conviene entrar a un circulo de trabajo: alguien puede ayudarte y vos tambien podes sostener a otra persona que esta buscando.",
  amistad: "Te conviene un circulo chico de amistad con proposito: menos charla infinita y mas encuentros simples con gente compatible.",
  habitos: "Te conviene un circulo de habitos: 21 dias con pequenas acciones, seguimiento liviano y actos de apoyo entre pares.",
  ciudad: "Te conviene un circulo de ciudad nueva: personas cerca tuyo para descubrir lugares utiles y armar pertenencia sin forzarla.",
  barrio: "Te conviene un circulo barrial: juntar tiempo disponible para resolver necesidades concretas alrededor tuyo.",
};

const labelByNeed = {
  cv: "CV o entrevista",
  escucha: "escucha y compania",
  idiomas: "practica de idiomas",
  reparar: "reparacion u oficio",
  caminar: "salir a caminar",
};

const labelByOffer = {
  cv: "ayuda con CV o entrevistas",
  escucha: "escucha o acompanamiento",
  idiomas: "practica de idiomas",
  reparar: "reparacion u oficio",
  caminar: "salir a caminar",
};

const labelByAvailability = {
  manana: "manana",
  tarde: "tarde",
  noche: "noche",
  finde: "fin de semana",
  flexible: "horario flexible",
};

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

matchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const personName = document.querySelector("#personName").value.trim();
  const offer = document.querySelector("#offer").value;
  const need = document.querySelector("#need").value;
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
      ? `Hay una compatibilidad fuerte: podes ofrecer ${needLabel} y tambien pedirlo. La app priorizaria un intercambio uno a uno con otra persona cercana.`
      : `${copyByPurpose[purpose]} Ademas, tu pedido de ${needLabel} puede convivir con el tiempo que estas dispuesto a ofrecer.`,
    shareText: `${personName} se suma a Actos en ${zone}: ofrece ${offerLabel}, necesita ${needLabel} y puede participar en ${availabilityLabel}.`,
    needLabel,
    offerLabel,
    zone,
    availabilityLabel,
  };

  saveApplication(latestMatch);
  resultTitle.textContent = latestMatch.title;
  resultText.textContent = latestMatch.text;
  shareCard.textContent = latestMatch.shareText;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

saveAct.addEventListener("click", () => {
  if (!latestMatch) return;

  saveDiaryItem({
    title: `Nuevo acto propuesto: ${latestMatch.needLabel}`,
    text: `${latestMatch.personName} acaba de transformar una necesidad en una posible conexion de tiempo compartido en ${latestMatch.zone}.`,
  });
  renderDiary();
  document.querySelector("#diario").scrollIntoView({ behavior: "smooth", block: "start" });
});

copyAct.addEventListener("click", async () => {
  if (!latestMatch) return;

  const text = `Actos - ficha de piloto\nNombre: ${latestMatch.personName}\nZona: ${latestMatch.zone}\nOfrece: ${latestMatch.offerLabel}\nNecesita: ${latestMatch.needLabel}\nDisponibilidad: ${latestMatch.availabilityLabel}\n\n${latestMatch.text}`;

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
