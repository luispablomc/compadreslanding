async function loadLayout() {
  const load = async (id, file) =>
    document.getElementById(id).innerHTML = await (await fetch(file)).text();

  await load("header", "header.html");
  await load("footer", "footer.html");

  document.body.classList.add("layout-loaded");

  // Esperar a que el DOM se actualice completamente
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Inicializar todo después de cargar el header
  initializeHeaderFunctionality();
}

function initializeHeaderFunctionality() {
  // 1. Inicializar sidebar
  initializeSidebar();
  
  // 2. Inicializar idiomas
  initializeLanguageSelector();
  
  // 3. Inicializar scroll behavior
  initializeScrollBehavior();

  // 4. Manejar sidebar responsive
  handleResponsiveSidebar();
  
  // 5. Manejar language selector responsive
  handleResponsiveLanguageSelector();

  // 6. Manejar navbar para páginas cortas
  handleNavbarForShortPages();

  // 7. Inicializar formulario Netlify
  initializeNetlifyForm();
}

function initializeSidebar() {
  const showSidebarBtn = document.querySelector('.show-sidebar');
  const hideSidebarBtn = document.querySelector('.hide-sidebar');
  const sidebar = document.querySelector('.sidebar');

  console.log('Sidebar elements:', { showSidebarBtn, hideSidebarBtn, sidebar });

  if (showSidebarBtn && sidebar) {
    showSidebarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Opening sidebar');
      sidebar.classList.add('active');
    });
  }

  if (hideSidebarBtn && sidebar) {
    hideSidebarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Closing sidebar');
      sidebar.classList.remove('active');
    });
  }

  // Cerrar sidebar al hacer clic en enlaces
  const sidebarLinks = sidebar?.querySelectorAll('a[href]');
  sidebarLinks?.forEach(link => {
    link.addEventListener('click', function() {
      sidebar.classList.remove('active');
    });
  });

  // Cerrar sidebar al hacer clic fuera de él
  document.addEventListener('click', function(e) {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !showSidebarBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
}

function initializeLanguageSelector() {
  const languageSelectors = document.querySelectorAll(".languageSelector");

  // Carga idioma inicial
  loadLanguage("en");

  // Eventos select idioma
  languageSelectors.forEach(sel => {
    sel.addEventListener("change", (e) => {
      const lang = e.target.value;
      loadLanguage(lang);
      languageSelectors.forEach(s => s.value = lang);
    });
  });
}

function initializeScrollBehavior() {
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function handleResponsiveSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  // Media query para el breakpoint de desktop (800px en tu CSS)
  const mediaQuery = window.matchMedia('(min-width: 800px)');
  
  function handleScreenChange(e) {
    // Si la pantalla es desktop (>= 800px) y el sidebar está abierto, cerrarlo
    if (e.matches && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      console.log('Sidebar cerrado automáticamente por cambio a desktop');
    }
  }
  
  // Escuchar cambios en el tamaño de pantalla
  mediaQuery.addEventListener('change', handleScreenChange);
  
  // También verificar al cargar la página por si acaso
  if (mediaQuery.matches && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }
}

function handleResponsiveLanguageSelector() {
  const languageSelectors = document.querySelectorAll('.languageSelector');
  const mediaQuery = window.matchMedia('(max-width: 800px)');
  
  function updateLanguageOptions(isMobile) {
    languageSelectors.forEach(select => {
      const enOption = select.querySelector('option[value="en"]');
      const esOption = select.querySelector('option[value="es"]');
      
      if (enOption && esOption) {
        if (isMobile) {
          // Versión móvil: abreviaturas
          enOption.textContent = 'EN';
          esOption.textContent = 'ES';
          select.style.width = '70px';
        } else {
          // Versión desktop: texto completo
          enOption.textContent = 'English';
          esOption.textContent = 'Español';
          select.style.width = '';
        }
      }
    });
  }
  
  // Escuchar cambios de tamaño
  mediaQuery.addEventListener('change', (e) => {
    updateLanguageOptions(e.matches);
  });
  
  // Actualizar al cargar
  updateLanguageOptions(mediaQuery.matches);
}

function handleNavbarForShortPages() {
  const navbar = document.querySelector('nav');
  const pageHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  
  // Si la página es más corta que el viewport + 100px O es about page
  if (pageHeight < viewportHeight + 100 || window.location.pathname.includes('about.html')) {
    navbar.classList.add('scrolled');
  }
}

// Manejar formulario Netlify
function initializeNetlifyForm() {
    const form = document.querySelector('form[netlify]');
    const formSuccess = document.querySelector('.form-success');
    
    if (form) {
        // Netlify maneja el envío automáticamente
        // Solo necesitamos mostrar confirmación
        form.addEventListener('submit', function(e) {
            // Opcional: agregar delay para mejor UX
            setTimeout(() => {
                form.style.display = 'none';
                formSuccess.style.display = 'block';
            }, 1000);
        });
    }
}

// ------------------------------
// Traducciones (mantén igual)
// ------------------------------
let translations = {};

async function loadLanguage(lang) {
  try {
    const res = await fetch("assets/lang.json");
    const translations = await res.json();

    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      const translation = translations?.[lang]?.[key];

      if (!translation) return; // no hay traducción para esta clave

      // Priorizar atributos específicos
      // 1) placeholder (inputs, textarea)
      if ("placeholder" in el) {
        // Nota: algunos elementos tienen placeholder pero no lo queremos (ej: elementos custom),
        // por eso comprobamos que el atributo exista en el DOM
        if (el.hasAttribute("placeholder") || el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") {
          el.placeholder = translation;
          return;
        }
      }

      // 2) value (botones, inputs con value)
      if ("value" in el && (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "button")) {
        // solo reemplazar value si el input tiene value (o es button)
        if (el.tagName.toLowerCase() === "button" || el.type === "button" || el.type === "submit" || el.hasAttribute("value")) {
          el.value = translation;
          // para botones <button> también es útil setear textContent
          if (el.tagName.toLowerCase() === "button") el.textContent = translation;
          return;
        }
      }

      // 3) atributos informativos
      if (el.hasAttribute("title")) {
        el.setAttribute("title", translation);
        return;
      }
      if (el.hasAttribute("alt")) {
        el.setAttribute("alt", translation);
        return;
      }
      if (el.hasAttribute("aria-label")) {
        el.setAttribute("aria-label", translation);
        return;
      }

      // 4) texto visible (fallback)
      el.textContent = translation;
    });

  } catch (error) {
    console.error("Error loading language:", error);
  }
}

// Función para scroll suave al formulario de contacto
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Ejecuta el layout
loadLayout();
