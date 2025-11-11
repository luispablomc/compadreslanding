// ------------------------------
// Elementos del DOM
// ------------------------------
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

// Todos los selects de idioma (escritorio + móvil)
const languageSelectors = document.querySelectorAll(".languageSelector");

// ------------------------------
// Manejo de traducciones
// ------------------------------
let translations = {};

async function loadLanguage(lang) {
  try {
    const response = await fetch("assets/lang.json");
    translations = await response.json();

    document.querySelectorAll("[data-key]").forEach(element => {
      const key = element.getAttribute("data-key");
      if (translations[lang] && translations[lang][key]) {
        element.innerHTML = translations[lang][key];
      }
    });
  } catch (err) {
    console.error("Error cargando lang.json:", err);
  }
}

// Escucha cambios en todos los selects y sincroniza
languageSelectors.forEach(sel => {
  sel.addEventListener("change", (e) => {
    const lang = e.target.value;
    loadLanguage(lang);

    // Sincroniza todos los selects
    languageSelectors.forEach(s => s.value = lang);
  });
});

// Inicializa idioma por defecto
loadLanguage("en");

// ------------------------------
// Funciones para abrir/cerrar menú móvil
// ------------------------------
function openMenu() {
  if (!mobileMenu || !menuToggle) return;
  menuToggle.classList.add("active");
  mobileMenu.classList.add("open");
  document.body.style.overflow = "hidden";

  // Ajusta idioma en el select dentro del menú móvil
  const mobileLangSelect = mobileMenu.querySelector(".languageSelector");
  if (mobileLangSelect) {
    mobileLangSelect.value = document.querySelector(".desktop-language .languageSelector").value;
  }
}

function closeMenuFunc() {
  if (!mobileMenu || !menuToggle) return;
  menuToggle.classList.remove("active");
  mobileMenu.classList.remove("open");
  document.body.style.overflow = "";
}

// ------------------------------
// Eventos del menú
// ------------------------------

// Toggle del menú hamburguesa
menuToggle.addEventListener("click", () => {
  if (mobileMenu.classList.contains("open")) {
    closeMenuFunc();
  } else {
    openMenu();
  }
});

// Botón de cerrar (X)
closeMenu.addEventListener("click", closeMenuFunc);

// Cerrar al hacer clic en un enlace del menú móvil
mobileMenu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", closeMenuFunc);
});

// Cerrar al tocar fuera del contenido
mobileMenu.addEventListener("click", (e) => {
  if (e.target === mobileMenu) closeMenuFunc();
});

// Cerrar con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenuFunc();
});
