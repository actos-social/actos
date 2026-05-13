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
    text: "Caminatas, meriendas, bibliotecas y planes chicos para recuperar movimiento con compañía tranquila.",
    tags: ["cuidado", "ritmo bajo", "sin presion"],
  },
  {
    title: "Oficios que circulan",
    text: "Vecinos que enseñan, reparan o acompañan aprendizajes practicos sin convertir todo en dinero.",
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
    text: "Un vecino enseño a coser un cierre y evito que una prenda terminara en la basura.",
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

const circleGrid = document.querySelector("#circleGrid");
const diaryList = document.querySelector("#diaryList");
const matchForm = document.querySelector("#matchForm");
const resultSection = document.querySelector("#resultado");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const saveAct = document.querySelector("#saveAct");

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

matchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const form = new FormData(matchForm);
  const offer = form.get("offer") || document.querySelector("#offer").value;
  const need = form.get("need") || document.querySelector("#need").value;
  const zone = document.querySelector("#zone").value.trim();
  const purpose = document.querySelector("#purpose").value;
  const needLabel = labelByNeed[need] || "una ayuda concreta";
  const isDirectMatch = offer === need;

  latestMatch = {
    title: isDirectMatch ? `Acto directo en ${zone}` : `Circulo sugerido en ${zone}`,
    text: isDirectMatch
      ? `Hay una compatibilidad fuerte: podes ofrecer ${needLabel} y tambien pedirlo. La app priorizaria un intercambio uno a uno con otra persona cercana.`
      : `${copyByPurpose[purpose]} Ademas, tu pedido de ${needLabel} puede convivir con el tiempo que estas dispuesto a ofrecer.`,
    needLabel,
    zone,
  };

  resultTitle.textContent = latestMatch.title;
  resultText.textContent = latestMatch.text;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

saveAct.addEventListener("click", () => {
  if (!latestMatch) return;

  saveDiaryItem({
    title: `Nuevo acto propuesto: ${latestMatch.needLabel}`,
    text: `Alguien en ${latestMatch.zone} acaba de transformar una necesidad en una posible conexion de tiempo compartido.`,
  });
  renderDiary();
  document.querySelector("#diario").scrollIntoView({ behavior: "smooth", block: "start" });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderCircles();
renderDiary();
