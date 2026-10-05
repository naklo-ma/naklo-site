/* Naklo : code partagé par toutes les pages.
   - en-tête, menu, sélecteur de ville et pied de page
   - Nakli et ses humeurs
   - le moteur de choix (repris de l'outil « Demande à Nakli ») et les cartes de resto
   Tout se passe dans la page : aucun appel payant, aucune API. */
(function () {
  "use strict";
  const body = document.body;
  const ROOT = body.dataset.root || "";
  const PAGE = body.dataset.page || "";
  const VILLES = window.NAKLO_VILLES || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Ville courante ---------- */
  const param = new URLSearchParams(location.search).get("ville");
  const villeDe = slug => VILLES.find(v => v.slug === slug);
  let VILLE = villeDe(body.dataset.ville) || villeDe(param) || villeDe(load("nk-ville", "casablanca")) || VILLES[0];
  if (VILLE && VILLE.on) save("nk-ville", VILLE.slug);
  const villeActive = () => (VILLE && VILLE.on ? VILLE : VILLES.find(v => v.on));
  const lienVille = v => `${ROOT}${v.slug}/`;
  const lienListes = (v, l) => `${ROOT}listes/?ville=${v.slug}${l ? "&l=" + l : ""}`;

  /* ---------- Icônes ---------- */
  const I = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    fermer: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#E8A33D" aria-hidden="true"><path d="M12 2l3 6.6 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.2l1.5-7L2 9.4l7-.8z"/></svg>',
    cash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CDBFA3" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
    lieu: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CDBFA3" stroke-width="2" aria-hidden="true"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    instagram: '<svg class="logo-res" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg class="logo-res" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    whatsapp: '<svg class="logo-res" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.6 8.6 0 1 1 8 19.4z"/><path d="M9 7.8c-.4 0-.9.4-.9 1.2 0 2.6 3.4 6 6.1 6 .8 0 1.3-.5 1.3-.9l-.1-.9-1.8-.8-.8.9c-1-.4-2.3-1.6-2.7-2.7l.9-.8-.8-1.8z" fill="currentColor" stroke="none"/></svg>',
    partage: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    horloge: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CDBFA3" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };

  /* ---------- Nakli : même étoile, seuls le regard et la bouche changent ---------- */
  const ETOILE = '<path d="M100 10 L116 52 L158 30 L142 72 L188 82 L148 106 L178 142 L132 134 L132 182 L104 150 L76 186 L72 140 L26 150 L54 112 L14 88 L58 76 L40 34 L82 54 Z" fill="#E8A33D" stroke="#0B090F" stroke-width="6" stroke-linejoin="round"/>';
  const OEIL = '<ellipse cx="100" cy="88" rx="34" ry="24" fill="#F3E6CC" stroke="#0B090F" stroke-width="5"/>';
  const SOURIRE = '<path d="M70 124 Q100 146 132 122 L126 134 Q100 152 76 136 Z" fill="#F3E6CC" stroke="#0B090F" stroke-width="5" stroke-linejoin="round"/>';
  // l'œil (data-oeil) cligne, la pupille (data-pupille) suit le doigt ou la souris
  const oeil = pupille => `<g data-oeil="">${OEIL}<g data-pupille="">${pupille}</g></g>`;
  const FACES = {
    neutre: oeil('<circle cx="106" cy="90" r="12" fill="#0B090F"/><circle cx="110" cy="86" r="3.5" fill="#F3E6CC"/>') + '<path d="M64 64 L92 70" stroke="#0B090F" stroke-width="6" stroke-linecap="round"/>' + SOURIRE,
    affame: oeil('<circle cx="100" cy="88" r="17" fill="#0B090F"/><circle cx="105" cy="83" r="4" fill="#F3E6CC"/>') + '<path d="M64 58 L92 64" stroke="#0B090F" stroke-width="6" stroke-linecap="round"/><ellipse cx="101" cy="130" rx="22" ry="16" fill="#0B090F"/><ellipse cx="101" cy="138" rx="11" ry="5" fill="#A3261B"/>',
    ebloui: oeil('<path d="M100 72 L105 83 L117 84 L108 92 L111 104 L100 97 L89 104 L92 92 L83 84 L95 83 Z" fill="#A3261B"/>') + '<path d="M64 64 L92 70" stroke="#0B090F" stroke-width="6" stroke-linecap="round"/>' + SOURIRE,
    content: OEIL + '<path d="M66 88 Q100 66 134 88 Q100 104 66 88 Z" fill="#E8A33D" stroke="#0B090F" stroke-width="5" stroke-linejoin="round"/><path d="M80 128 Q100 142 122 128" stroke="#0B090F" stroke-width="6" fill="none" stroke-linecap="round"/>'
  };
  const nakliSVG = (humeur = "neutre", cls = "nakli", id = "") =>
    `<svg class="${cls}"${id ? ` id="${id}"` : ""} data-nakli-svg viewBox="0 0 200 200" role="img" aria-label="Nakli">${ETOILE}<g data-face>${FACES[humeur] || FACES.neutre}</g></svg>`;

  /* Regard : la pupille suit le pointeur, cligne de temps en temps, et s'agite quand Nakli cherche */
  let regard = null; // dernière position du pointeur
  const posePupille = (el, dx, dy) => { const p = el.querySelector("[data-pupille]"); if (p) p.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`; };
  function suivre(el) {
    if (!regard || el.classList.contains("cherche")) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width * .5, cy = r.top + r.height * .44;
    const vx = regard.x - cx, vy = regard.y - cy, d = Math.hypot(vx, vy) || 1, f = Math.min(1, d / 160);
    posePupille(el, vx / d * 10 * f, vy / d * 6 * f);
  }
  const tousNakli = () => $$("svg[data-nakli-svg]");
  let rafRegard = 0;
  const surPointeur = e => { regard = { x: e.clientX, y: e.clientY }; if (!rafRegard) rafRegard = requestAnimationFrame(() => { rafRegard = 0; tousNakli().forEach(suivre); }); };
  window.addEventListener("pointermove", surPointeur, { passive: true });
  window.addEventListener("pointerdown", surPointeur, { passive: true });
  if (!reduit) {
    (function cligner() {
      setTimeout(() => {
        tousNakli().forEach(el => { el.classList.add("cligne"); setTimeout(() => el.classList.remove("cligne"), 140); });
        cligner();
      }, 2600 + Math.random() * 3200);
    })();
  }
  function humeur(el, h, cherche) {
    if (!el) return;
    const g = el.querySelector("[data-face]");
    if (g) g.innerHTML = FACES[h] || FACES.neutre;
    el.classList.toggle("cherche", !!cherche);
    clearInterval(el._agite);
    if (cherche && !reduit) el._agite = setInterval(() => posePupille(el, (Math.random() * 2 - 1) * 10, (Math.random() * 2 - 1) * 6), 220);
    else suivre(el);
  }

  /* Étoiles : petite explosion quand Nakli est ébloui (étincelles, pas des Nakli sans œil) */
  const ETINCELLE = c => `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="${c}"/></svg>`;
  function etoiles(source) {
    if (reduit || !source) return;
    const r = source.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const couleurs = ["#E8A33D", "#E8A33D", "#F3E6CC", "#2FB7A6", "#E0705F"];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("span"), taille = 10 + Math.random() * 14;
      s.className = "etincelle";
      s.style.cssText = `left:${x - taille / 2}px;top:${y - taille / 2}px;width:${taille}px;height:${taille}px`;
      s.innerHTML = ETINCELLE(couleurs[i % couleurs.length]);
      document.body.appendChild(s);
      const a = (Math.PI * 2 * i) / 16 + Math.random() * .4, d = 70 + Math.random() * 90;
      s.animate([
        { transform: "translate(0,0) scale(.3) rotate(0deg)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(1) rotate(${Math.random() * 180}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${Math.cos(a) * d * 1.15}px, ${Math.sin(a) * d * 1.15 + 30}px) scale(.6) rotate(220deg)`, opacity: 0 }
      ], { duration: 950 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
    }
  }

  // remplace chaque <span data-nakli="humeur"> par Nakli
  $$("[data-nakli]").forEach(el => { el.outerHTML = nakliSVG(el.dataset.nakli, el.className || "nakli", el.id); });

  /* ---------- En-tête, menus, pied de page ---------- */
  /* ---------- Favoris : gardés sur le téléphone, sans compte ---------- */
  const lireFavoris = () => { const f = load("nk-favoris", []); return Array.isArray(f) ? f : []; };
  const estFavori = id => lireFavoris().some(f => f.id === id);
  const pastilleFav = () => { const n = lireFavoris().length; return n ? `<span class="compte-fav" data-compte-fav>${n}</span>` : `<span class="compte-fav" data-compte-fav hidden></span>`; };

  const NAV = [
    { id: "outil", label: "Demande à Nakli", href: () => lienVille(villeActive()) },
    { id: "listes", label: "Listes", href: () => lienListes(villeActive()) },
    { id: "restaurants", label: "Restaurants", href: () => `${ROOT}restaurants/` },
    { id: "favoris", label: `Favoris${pastilleFav()}`, href: () => `${ROOT}favoris/` },
    { id: "a-propos", label: "À propos", href: () => `${ROOT}#a-propos` }
  ];
  const filtre = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="rough" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs></svg>';
  body.insertAdjacentHTML("afterbegin", filtre + '<a class="skip" href="#contenu">Aller au contenu</a>');

  const entete = $("[data-entete]");
  if (entete) {
    entete.outerHTML = `<header class="entete"><div class="wrap">
      <a class="logo" href="${ROOT}index.html" aria-label="naklo, accueil">naklo</a>
      <nav class="nav-liens" aria-label="Principal">${NAV.map(n => `<a href="${n.href()}"${n.id === PAGE ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}</nav>
      <button class="ville-btn" type="button" aria-expanded="false" aria-controls="tiroir-ville">${I.pin}<span>${esc(VILLE.nom)}</span>${I.chevron}<span class="sr-only">, changer de ville</span></button>
      <a class="btn" href="${lienVille(villeActive())}">Demande à Nakli</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="tiroir-menu" aria-label="Menu">${I.menu}</button>
    </div></header>
    <div class="tiroir" id="tiroir-ville" hidden><div class="wrap wrap-etroit"><p class="surtitre" style="margin-bottom:6px">Choisis ta ville</p><ul>
      ${VILLES.map(v => `<li><a href="${PAGE === "listes" ? lienListes(v) : lienVille(v)}"${v.slug === VILLE.slug ? ' class="actif" aria-current="true"' : ""}>${esc(v.nom)} <small>${v.on ? (v.slug === VILLE.slug ? "ta ville" : "ouverte") : "bientôt"}</small></a></li>`).join("")}
    </ul></div></div>
    <div class="tiroir" id="tiroir-menu" hidden><div class="wrap wrap-etroit"><nav aria-label="Menu mobile"><ul>
      ${NAV.map(n => `<li><a href="${n.href()}"${n.id === PAGE ? ' aria-current="page"' : ""}>${n.label}</a></li>`).join("")}
      <li><a href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener"><span class="avec-logo">${I.instagram}Instagram</span> <small>@naklo_ma</small></a></li>
      <li><a href="https://www.tiktok.com/@naklo_ma" target="_blank" rel="noopener"><span class="avec-logo">${I.tiktok}TikTok</span> <small>@naklo_ma</small></a></li>
    </ul></nav></div></div>`;
    const paires = [[".ville-btn", "#tiroir-ville"], [".menu-btn", "#tiroir-menu"]];
    const mobile = matchMedia("(max-width: 859px)");
    // sur mobile, la ville se choisit dans un panneau qui monte du bas
    $(".ville-btn").addEventListener("click", e => {
      if (!mobile.matches) return;
      e.stopImmediatePropagation();
      feuille({ titre: "Choisis ta ville", html: $("#tiroir-ville ul").outerHTML, declencheur: $(".ville-btn") });
    }, true);
    const fermerTout = () => paires.forEach(([b, t]) => { $(b).setAttribute("aria-expanded", "false"); $(t).hidden = true; $(".menu-btn").innerHTML = I.menu; });
    paires.forEach(([b, t]) => $(b).addEventListener("click", e => {
      e.stopPropagation();
      const ouvert = !$(t).hidden;
      fermerTout();
      if (!ouvert) {
        $(t).hidden = false; $(b).setAttribute("aria-expanded", "true");
        if (b === ".menu-btn") $(b).innerHTML = I.fermer;
        $(t).querySelector("a")?.focus();
      }
    }));
    document.addEventListener("click", e => { if (!e.target.closest(".tiroir")) fermerTout(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") fermerTout(); });
  }

  const pied = $("[data-pied]");
  if (pied) {
    const on = villeActive();
    pied.outerHTML = `<footer class="pied"><div class="wrap">
      <div class="pied-grille">
        <div><a class="logo" href="${ROOT}index.html">naklo</a><p class="promesse">On mange où ? Nakli te trouve le bon resto, à toute heure.</p>
          <div class="reseaux"><a href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener" aria-label="Naklo sur Instagram">${I.instagram}</a><a href="https://www.tiktok.com/@naklo_ma" target="_blank" rel="noopener" aria-label="Naklo sur TikTok">${I.tiktok}</a></div></div>
        <div><h2>Naklo</h2><ul>
          <li><a href="${lienVille(on)}">Demande à Nakli</a></li>
          <li><a href="${lienListes(on)}">Les listes</a></li>
          <li><a href="${ROOT}#a-propos">À propos</a></li></ul></div>
        <div><h2>Villes</h2><ul>${VILLES.map(v => `<li><a href="${lienVille(v)}">${esc(v.nom)}${v.on ? "" : ' <span class="mut">· bientôt</span>'}</a></li>`).join("")}</ul></div>
        <div><h2>Contact</h2><ul>
          <li><a class="avec-logo" href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener">${I.instagram}Instagram @naklo_ma</a></li>
          <li><a class="avec-logo" href="https://www.tiktok.com/@naklo_ma" target="_blank" rel="noopener">${I.tiktok}TikTok @naklo_ma</a></li>
          <li><a href="mailto:contact.naklo@gmail.com">contact.naklo@gmail.com</a></li>
          <li><a href="${ROOT}restaurants/">Restaurants : travaillons ensemble</a></li></ul></div>
      </div>
      <div class="pied-bas"><span>Aucun resto ne paie pour être classé. Un partenariat est toujours indiqué.</span><span>Notes Google relevées en octobre 2026 · prix estimés · horaires à vérifier.</span></div>
    </div></footer>`;
  }

  /* ---------- Données de la ville ---------- */
  function chargerVille(slug) {
    return new Promise(res => {
      window.NAKLO_DATA = window.NAKLO_DATA || {};
      const v = villeDe(slug);
      if (!v || !v.on) return res([]);
      if (window.NAKLO_DATA[slug]) return res(window.NAKLO_DATA[slug]);
      const s = document.createElement("script");
      s.src = `${ROOT}data/${slug}.js`;
      s.onload = () => res(window.NAKLO_DATA[slug] || []);
      s.onerror = () => res([]);
      document.head.appendChild(s);
    });
  }

  /* ---------- Moteur de choix ---------- */
  const FOODMAP = { "Burger": ["burger"], "Sushi": ["sushi", "japonais"], "Pizza": ["pizza"], "Pâtes": ["pâtes", "italien"], "Tacos": ["tacos"], "Poulet": ["poulet", "chicken"], "Libanais / shawarma": ["libanais", "syrien", "shawarma", "chawarma", "turc"], "Marocain": ["marocain", "tajine", "pastilla"], "Grillades / viande": ["grillade", "viande", "steak", "barbecue", "bbq"], "Asiatique": ["asiatique", "chinois", "thaï", "vietnamien", "coréen", "japonais", "sushi", "wok"], "Indien": ["indien"], "Mexicain": ["mexicain", "latino"], "Brunch / petit-déj": ["brunch", "petit-déj", "petit-déjeuner"], "Healthy": ["healthy", "bowl", "salade", "vegan", "bio", "poke"], "Vegan": ["vegan", "végétarien", "végétal"], "Street food": ["street food", "snack", "fast-food", "kebab", "shawarma", "tacos"], "Café": ["café", "coffee"], "Desserts / glaces": ["dessert", "glace", "crêpe", "gaufre", "pâtisserie"] };
  const VIBES = { "Terrasse / jardin": { w: ["terrasse", "jardin"], l: "terrasse" }, "Rooftop / vue": { w: ["rooftop", "vue"], l: "avec vue" }, "Chic": { w: ["chic", "occasion spéciale", "haut de gamme"], l: "chic" }, "Jolie déco": { w: ["déco"], l: "jolie déco" }, "Pour les groupes": { w: ["groupes", "grandes tables", "animé"], l: "pour les groupes" } };
  const WHO = { Date: { w: ["date", "intime", "romantique", "rooftop", "chic", "déco"], l: "idéal pour un date" }, Famille: { w: ["famille", "familial", "groupes"], l: "en famille" }, Anniversaire: { w: ["groupes", "animé", "grandes tables"], l: "pour fêter" }, Potes: { w: ["ambiance jeune", "animé", "groupes", "entre amis", "petit budget"], l: "entre potes" } };
  const hay = p => (p.cuisine + " " + (p.tags || []).join(" ") + " " + (p.dishes || []).join(" ")).toLowerCase();
  const has = (p, words) => words.some(w => hay(p).includes(w));
  // mot entier : « chic » ne doit pas trouver « chicken », ni « vue » trouver « revue »
  const motRe = new Map();
  const aMot = (p, words) => words.some(w => {
    if (!motRe.has(w)) motRe.set(w, new RegExp(`(^|[^a-zà-ÿ])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-zà-ÿ]|$)`));
    return motRe.get(w).test(hay(p));
  });
  const matchFood = (p, foods) => foods.some(f => (FOODMAP[f] || [f.toLowerCase()]).some(k => hay(p).includes(k)));
  const fmt = n => String(n).replace(".", ",");
  function closesLate(p) {
    if (/très tard|ouvert tard/.test((p.tags || []).join(" ").toLowerCase())) return true;
    const m = (p.hours || "").toLowerCase().match(/–\s*(\d{1,2})h(\d{2})?/); if (!m) return false;
    const e = +m[1]; return (e >= 1 && e <= 6) || (e === 0 && !!m[2]);
  }
  function opensEarly(p) { const m = (p.hours || "").match(/^(\d{1,2})h/); return (m && +m[1] <= 9) || has(p, ["brunch", "petit-déj", "petit-déjeuner", "café", "coffee"]); }

  function pick(DB, { budget = null, foods = [], avoid = [], noAlc = false, who = null, vibe = [], when = null, count = 1, boost = [], n = 4 } = {}) {
    foods = foods.filter(f => f !== "Peu importe");
    let pool = DB.filter(p => !(noAlc && (p.alcohol === "oui" || p.alcohol === "probable")));
    if (avoid.length) pool = pool.filter(p => !aMot(p, avoid));
    let widened = false, raison = null;
    if (foods.length) { const f = pool.filter(p => matchFood(p, foods)); if (f.length) pool = f; else widened = true; }
    if (when === "Après minuit") { const l = pool.filter(closesLate); if (l.length) pool = l; }
    if (when === "Petit-déj") { const l = pool.filter(opensEarly); if (l.length) pool = l; }
    // l'ambiance filtre aussi. Ordre de préférence : toutes les ambiances dans le budget,
    // puis au moins une ambiance dans le budget, puis on dépasse le budget (et on le dit)
    const ambiances = vibe.filter(v => VIBES[v]);
    const dansBudget = l => budget ? l.filter(p => p.price <= budget) : l;
    if (ambiances.length) {
      const toutes = pool.filter(p => ambiances.every(v => aMot(p, VIBES[v].w)));
      const une = pool.filter(p => ambiances.some(v => aMot(p, VIBES[v].w)));
      if (dansBudget(toutes).length) pool = dansBudget(toutes);
      else if (dansBudget(une).length) { pool = dansBudget(une); widened = true; raison = "ambiance"; }
      else if (toutes.length || une.length) { pool = [...(toutes.length ? toutes : une)].sort((a, b) => a.price - b.price).slice(0, 6); widened = true; raison = "budget"; }
      else widened = true;
    }
    if (budget && !ambiances.length) { const inB = pool.filter(p => p.price <= budget); if (inB.length) pool = inB; else { pool = [...pool].sort((a, b) => a.price - b.price).slice(0, 6); widened = true; } }
    // spécialité d'abord, puis note pondérée par le nombre d'avis, léger malus pour les chaînes
    const spec = p => { if (!foods.length) return 0; const c = p.cuisine.toLowerCase(), first = c.split(",")[0]; return foods.some(f => (FOODMAP[f] || []).some(k => first.includes(k))) ? 2 : foods.some(f => (FOODMAP[f] || []).some(k => c.includes(k))) ? 1 : 0; };
    const qual = p => (p.rating || 3.9) * 3 + Math.min(Math.log10((p.reviews || 10) + 10), 3) - (/chaîne/.test(p.cuisine.toLowerCase()) ? 1.5 : 0);
    const vibeHits = p => vibe.filter(v => VIBES[v] && aMot(p, VIBES[v].w));
    const whoHit = p => WHO[who] && aMot(p, WHO[who].w);
    const big = count >= 6;
    const sc = p => spec(p) * 6 + vibeHits(p).length * 3 + (whoHit(p) ? 2.5 : 0) + (big && aMot(p, ["groupes", "grandes tables"]) ? 2 : 0) + boost.filter(w => aMot(p, [w])).length * 2 + qual(p);
    const ranked = pool.map(p => ({ p, s: sc(p) })).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.p);
    return {
      widened, raison, recos: ranked.map(p => {
        const why = [`${p.cuisine.split(",")[0]}, environ ${p.price} DH par personne`];
        if (p.rating) why.push(`noté ${fmt(p.rating)} sur ${p.reviews.toLocaleString("fr-FR")} avis`);
        const style = [...vibeHits(p).map(v => VIBES[v].l), ...(whoHit(p) ? [WHO[who].l] : []), ...(budget && p.price <= budget * 0.6 ? ["petit budget"] : [])].slice(0, 3);
        let attention = null;
        if (when === "Après minuit" && /vérifier/.test(p.hours || "")) attention = "horaires de nuit";
        else if (noAlc && !p.alcohol && !has(p, ["fast-food", "snack", "café", "coffee", "street food", "burger", "tacos", "kebab", "marocain", "shawarma", "brunch", "glace", "dessert"])) attention = "qu'ils ne servent pas d'alcool";
        return { p, pourquoi: why.join(", ") + ".", style, attention };
      })
    };
  }

  /* ---------- Cartes de resto ---------- */
  const TEINTES = ["#E8A33D", "#E0705F", "#2FB7A6", "#CDBFA3"];
  const teinte = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TEINTES[h % TEINTES.length]; };
  const mono = name => name.replace(/^(le|la|les|l'|the)\s*/i, "").replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const maps = (p, ville) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${p.name} ${p.area || ""} ${ville}`.replace(/\s+/g, " ").trim());
  const itineraire = (p, ville) => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(`${p.name} ${ville}`);

  const COEUR = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.8 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.6 0 6 3.6 4.7 7.1-1.8 4.8-9.3 9.4-9.3 9.4z"/></svg>';
  const coeur = (p, ville) => { const on = estFavori(p.id); return `<button type="button" class="coeur" data-fav="${esc(p.id)}" data-fav-ville="${esc(ville)}" aria-pressed="${on}" aria-label="${on ? "Retirer" : "Ajouter"} ${esc(p.name)} ${on ? "de" : "à"} tes favoris">${COEUR}</button>`; };
  const REGISTRE = new Map(); // id → données de la carte, pour « Partager en story »
  function carte(x, i, { personnes = 1, ville = "Casablanca", top = true, pastille = null } = {}) {
    const p = x.p;
    REGISTRE.set(p.id, { p, ville, choix: top && i === 0 });
    const tags = (x.style || []).map(s => `<span class="tag">${esc(s)}</span>`).join("");
    // emplacement partenaire : toujours étiqueté, ne change jamais le classement
    const part = p.partenaire ? `<span class="tag partenaire">Partenaire</span>` : "";
    const att = x.attention ? `<span class="tag attention">À vérifier : ${esc(x.attention)}</span>` : "";
    const alc = p.alcohol === "oui" ? `<span class="tag attention">Sert de l'alcool</span>` : p.alcohol === "probable" ? `<span class="tag attention">Alcool probable</span>` : "";
    const total = personnes > 1 ? ` <span class="mut">(≈ ${(p.price * personnes).toLocaleString("fr-FR")} DH à ${personnes})</span>` : "";
    const estTop = top && i === 0;
    return `<li class="carte${estTop ? " top" : ""}">
      <div class="couv" style="background:${teinte(p.cuisine)}"><span class="mono" aria-hidden="true">${esc(mono(p.name))}</span><span class="pastille${estTop && !pastille ? " neon-pastille" : ""}">${esc(pastille || (estTop ? "Le choix de Nakli" : p.cuisine.split(",")[0]))}</span>${coeur(p, ville)}</div>
      <div class="corps">
        <div class="titre"><h3>${esc(p.name)}</h3><span class="rang" aria-label="numéro ${i + 1}">#${i + 1}</span></div>
        <div class="infos">
          <span>${I.star}<span>${p.rating ? `${fmt(p.rating)}<span class="mut"> · ${p.reviews.toLocaleString("fr-FR")} avis</span>` : '<span class="mut">pas encore de note</span>'}</span></span>
          <span>${I.cash}<span>~${p.price} DH/pers.${total}</span></span>
          <span>${I.lieu}<span>${p.area ? esc(p.area) : '<span class="mut">quartier à préciser</span>'}</span></span>
          <span>${I.horloge}<span>${esc(p.hours || "à vérifier")}</span></span>
        </div>
        <p class="pourquoi">${esc(x.pourquoi || "")}</p>
        ${tags || part || att || alc ? `<div class="etiquettes">${part}${tags}${att}${alc}</div>` : ""}
        ${p.dishes && p.dishes.length ? `<p class="plats">À goûter : ${esc(p.dishes.join(" · "))}</p>` : ""}
        <div class="liens"><a class="btn btn-secondaire btn-petit" href="${maps(p, ville)}" target="_blank" rel="noopener">Photos et avis</a><a class="btn btn-secondaire btn-petit" href="${itineraire(p, ville)}" target="_blank" rel="noopener">Itinéraire</a><button type="button" class="btn btn-petit btn-story" data-story="${esc(p.id)}">${I.partage}Partager en story</button></div>
      </div></li>`;
  }

  /* ---------- Partager en story : une image 9:16 aux couleurs Naklo, faite dans la page ---------- */
  const C = { n9: "#0B090F", n8: "#16131F", n7: "#241E2E", ligne: "#3A3248", creme: "#F3E6CC", mut: "#CDBFA3", ambre: "#E8A33D", rouge: "#A3261B", turq: "#2FB7A6" };
  function lignes(ctx, texte, largeur, max) {
    const mots = String(texte).split(/\s+/), out = [];
    let l = "";
    for (const m of mots) {
      const t = l ? l + " " + m : m;
      if (ctx.measureText(t).width > largeur && l) { out.push(l); l = m; } else l = t;
    }
    if (l) out.push(l);
    if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/\s*\S*$/, "") + "…"; }
    return out;
  }
  function rect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  const imageNakli = h => new Promise(res => {
    const img = new Image();
    img.onload = () => res(img); img.onerror = () => res(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 200 200">${ETOILE}${FACES[h]}</svg>`);
  });
  async function dessinerStory({ p, ville, choix }) {
    await Promise.all(["400 120px Mansalva", "700 80px 'Instrument Sans'", "600 40px 'Instrument Sans'", "400 40px 'Instrument Sans'"].map(f => document.fonts.load(f).catch(() => {})));
    const W = 1080, H = 1920, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const pepite = (p.rating || 0) >= 4.7;
    // fond nuit + lumière de scène chaude
    ctx.fillStyle = C.n9; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * .85, 260, 40, W * .85, 260, 900);
    g.addColorStop(0, "rgba(232,163,61,.30)"); g.addColorStop(.5, "rgba(163,38,27,.12)"); g.addColorStop(1, "rgba(11,9,15,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // logo
    ctx.save(); ctx.translate(84, 250); ctx.rotate(-3 * Math.PI / 180);
    ctx.fillStyle = C.ambre; ctx.font = "400 150px Mansalva"; ctx.shadowColor = "rgba(232,163,61,.45)"; ctx.shadowBlur = 30;
    ctx.fillText("naklo", 0, 0); ctx.restore();
    // étiquette
    const tag = choix ? "Le choix de Nakli" : pepite ? "Pépite validée" : "Validé par Nakli";
    ctx.font = "600 40px 'Instrument Sans'";
    const tw = ctx.measureText(tag).width + 56;
    ctx.fillStyle = C.turq; rect(ctx, 84, 330, tw, 72, 36); ctx.fill();
    ctx.fillStyle = C.n9; ctx.fillText(tag, 112, 380);
    // carte : on mesure d'abord le contenu, puis on dessine une carte à sa taille, centrée dans l'espace libre
    const cx = 72, cw = W - 144, pad = cx + 64, larg = cw - 128;
    const ops = []; // [décalage y, fonction de dessin]
    let y = 110;
    const txt = (font, couleur, t, dy, x = pad) => { const yy = y; ops.push(() => { ctx.font = font; ctx.fillStyle = couleur; ctx.fillText(t, x, yy0 + yy); }); y += dy || 0; };
    let yy0 = 0;
    txt("600 40px 'Instrument Sans'", C.turq, p.cuisine.split(",")[0].toUpperCase(), 0);
    ctx.font = "700 100px 'Instrument Sans'";
    lignes(ctx, p.name, larg - 40, 3).forEach(l => { y += 112; txt("700 100px 'Instrument Sans'", C.creme, l); });
    y += 110;
    ctx.font = "700 84px 'Instrument Sans'";
    const lp = ctx.measureText(`~${p.price} DH`).width;
    txt("700 84px 'Instrument Sans'", C.ambre, `~${p.price} DH`);
    txt("400 48px 'Instrument Sans'", C.mut, " / pers.", 92, pad + lp);
    if (p.rating) {
      ctx.font = "700 56px 'Instrument Sans'";
      const lr = ctx.measureText(`★ ${fmt(p.rating)}`).width;
      txt("700 56px 'Instrument Sans'", C.ambre, `★ ${fmt(p.rating)}`);
      txt("400 46px 'Instrument Sans'", C.mut, ` · ${p.reviews.toLocaleString("fr-FR")} avis Google`, 84, pad + lr);
    }
    const lieu = p.area && !/préciser/.test(p.area) ? p.area : null;
    if (lieu) { ctx.font = "400 46px 'Instrument Sans'"; lignes(ctx, lieu, larg, 2).forEach(l => txt("400 46px 'Instrument Sans'", C.creme, l, 62)); }
    if (p.hours && !/vérifier/.test(p.hours)) txt("400 42px 'Instrument Sans'", C.mut, p.hours, 62);
    if (p.dishes && p.dishes.length) {
      const yl = y + 4; ops.push(() => { ctx.strokeStyle = C.n7; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pad, yy0 + yl); ctx.lineTo(pad + larg, yy0 + yl); ctx.stroke(); });
      y += 74;
      ctx.font = "400 44px 'Instrument Sans'";
      lignes(ctx, "À goûter : " + p.dishes.join(" · "), larg, 3).forEach(l => txt("400 44px 'Instrument Sans'", C.mut, l, 60));
    }
    const ch = y + 30, haut = 480, bas = 1590;
    const cy = Math.max(haut, haut + (bas - haut - ch) / 2);
    yy0 = cy;
    ctx.fillStyle = C.n8; rect(ctx, cx, cy, cw, ch, 56); ctx.fill();
    ctx.strokeStyle = choix ? C.ambre : C.ligne; ctx.lineWidth = choix ? 6 : 3; ctx.stroke();
    ops.forEach(f => f());
    // Nakli, à cheval sur la carte
    const img = await imageNakli(pepite ? "ebloui" : "content");
    if (img) { ctx.save(); ctx.translate(W - 250, cy - 20); ctx.rotate(8 * Math.PI / 180); ctx.drawImage(img, -170, -170, 340, 340); ctx.restore(); }
    // bas
    ctx.save(); ctx.translate(84, 1700); ctx.rotate(-2 * Math.PI / 180);
    ctx.fillStyle = C.creme; ctx.font = "400 112px Mansalva"; ctx.fillText("On mange où ?", 0, 0); ctx.restore();
    ctx.fillStyle = C.mut; ctx.font = "600 44px 'Instrument Sans'";
    ctx.fillText(`Demande à Nakli · @naklo_ma · ${ville}`, 84, 1800);
    return new Promise(res => cv.toBlob(res, "image/png"));
  }

  let dialogue = null;
  function ouvrirDialogue() {
    if (dialogue) return dialogue;
    body.insertAdjacentHTML("beforeend", `<dialog class="story-dialog" aria-labelledby="story-titre">
      <div class="story-tete"><h2 id="story-titre" class="pinceau">Ta story est prête</h2><button type="button" class="x" data-fermer aria-label="Fermer">×</button></div>
      <div class="story-apercu"><p class="statut">Nakli dessine…</p></div>
      <div class="story-actions">
        <button type="button" class="btn" data-partager hidden>${I.partage}Partager</button>
        <a class="btn btn-secondaire" data-telecharger hidden>Enregistrer l'image</a>
      </div>
      <p class="statut story-aide">Sur Instagram : nouvelle story, puis choisis l'image dans ta galerie. Tague <b class="ambre">@naklo_ma</b> !</p>
    </dialog>`);
    dialogue = $(".story-dialog");
    dialogue.querySelector("[data-fermer]").addEventListener("click", () => dialogue.close());
    dialogue.addEventListener("click", e => { if (e.target === dialogue) dialogue.close(); });
    dialogue.addEventListener("close", () => { const a = dialogue.querySelector("[data-telecharger]"); if (a.href) URL.revokeObjectURL(a.href); });
    return dialogue;
  }
  async function partagerStory(id) {
    const d = REGISTRE.get(id);
    if (!d) return;
    const dlg = ouvrirDialogue();
    const apercu = dlg.querySelector(".story-apercu"), btnP = dlg.querySelector("[data-partager]"), a = dlg.querySelector("[data-telecharger]");
    apercu.innerHTML = `<p class="statut">Nakli dessine…</p>`; btnP.hidden = true; a.hidden = true;
    dlg.showModal();
    const blob = await dessinerStory(d);
    if (!blob) { apercu.innerHTML = `<p class="alerte">Oups, l'image n'a pas pu être créée sur cet appareil.</p>`; return; }
    const url = URL.createObjectURL(blob), nom = `naklo-${d.p.id}.png`;
    apercu.innerHTML = `<img src="${url}" alt="Story Naklo : ${esc(d.p.name)}, environ ${d.p.price} DH par personne">`;
    a.href = url; a.download = nom; a.hidden = false;
    a.onclick = () => toast("Image enregistrée. Ouvre Instagram et ajoute-la en story !");
    const fichier = new File([blob], nom, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
      btnP.hidden = false;
      btnP.onclick = () => navigator.share({ files: [fichier], title: "Naklo", text: `${d.p.name} · trouvé par Nakli @naklo_ma` }).catch(() => {});
    }
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-story]"); if (b) partagerStory(b.dataset.story); });

  /* ---------- Panneau qui monte du bas : on le referme en le glissant vers le bas ---------- */
  // feuille({ titre, html }) crée un panneau ; feuille({ dialog }) ouvre un <dialog class="feuille"> déjà dans la page
  function feuille({ titre = "", html = "", dialog = null, declencheur = null, alFermer = null } = {}) {
    let dlg = dialog;
    if (!dlg) {
      body.insertAdjacentHTML("beforeend", `<dialog class="feuille" aria-label="${esc(titre)}"><div class="feuille-poignee" aria-hidden="true"></div><div class="feuille-tete"><h2 class="pinceau">${esc(titre)}</h2><button type="button" class="x" data-fermer aria-label="Fermer">×</button></div><div class="feuille-corps">${html}</div></dialog>`);
      dlg = body.lastElementChild;
      dlg.addEventListener("close", () => dlg.remove());
    }
    if (!dlg._pret) {
      dlg._pret = true;
      const fermer = () => {
        dlg.classList.remove("ouverte");
        dlg.style.transform = "";
        setTimeout(() => { if (dlg.open) dlg.close(); }, reduit ? 0 : 220);
      };
      dlg._fermer = fermer;
      dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-fermer]")) fermer(); });
      dlg.addEventListener("cancel", e => { e.preventDefault(); fermer(); });
      dlg.addEventListener("close", () => { if (dlg._alFermer) dlg._alFermer(); if (dlg._declencheur) dlg._declencheur.focus(); });
      // glisser la poignée (ou l'en-tête) vers le bas pour fermer
      const zone = [dlg.querySelector(".feuille-poignee"), dlg.querySelector(".feuille-tete")].filter(Boolean);
      let y0 = null, dy = 0;
      zone.forEach(z => {
        z.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; y0 = e.clientY; dy = 0; z.setPointerCapture(e.pointerId); dlg.classList.add("drag"); });
        z.addEventListener("pointermove", e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); dlg.style.transform = `translateY(${dy}px)`; });
        const lacher = () => { if (y0 === null) return; y0 = null; dlg.classList.remove("drag"); if (dy > 90) fermer(); else dlg.style.transform = ""; };
        z.addEventListener("pointerup", lacher); z.addEventListener("pointercancel", lacher);
      });
    }
    dlg._declencheur = declencheur; dlg._alFermer = alFermer;
    dlg.showModal();
    requestAnimationFrame(() => dlg.classList.add("ouverte"));
    return dlg;
  }

  /* ---------- Squelettes : des cartes vides pendant que Nakli cherche ---------- */
  const squelette = (n = 3, grille = false) => `<p class="sr-only" role="status">Nakli cherche…</p><ol class="cartes${grille ? " grille" : ""}" aria-hidden="true">${Array.from({ length: n }, () => `<li class="carte squelette"><div class="couv"></div><div class="corps"><span class="os" style="width:62%;height:22px"></span><span class="os" style="width:45%"></span><span class="os" style="width:80%"></span><span class="os" style="width:70%"></span><span class="os" style="width:38%;height:40px;border-radius:12px"></span></div></li>`).join("")}</ol>`;

  /* ---------- Inclinaison 3D avec reflet, à la souris seulement (pas au doigt) ---------- */
  const souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  function incliner(racine = document) {
    if (reduit || !souris) return;
    $$(".incline:not([data-incline])", racine).forEach(el => {
      el.dataset.incline = "1";
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(700px) rotateX(${(.5 - y) * 8}deg) rotateY(${(x - .5) * 10}deg) translateY(-2px)`;
        el.style.setProperty("--rx", `${x * 100}%`); el.style.setProperty("--ry", `${y * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
  incliner();

  /* ---------- Barre fixe en bas sur mobile : l'outil toujours à un tap ---------- */
  if (PAGE !== "outil") {
    const v = villeActive();
    body.insertAdjacentHTML("beforeend", `<nav class="barre-mobile" aria-label="Accès rapide"><a class="btn" href="${lienVille(v)}">Demande à Nakli</a><a class="btn btn-secondaire" href="${lienVille(v)}?surprise=1">Surprends-moi</a></nav>`);
    const barre = $(".barre-mobile"), principal = $("[data-cta-principal]");
    body.classList.add("avec-barre");
    if (principal && "IntersectionObserver" in window) {
      barre.classList.add("cachee");
      new IntersectionObserver(([e]) => barre.classList.toggle("cachee", e.isIntersecting || e.boundingClientRect.top > 0)).observe(principal);
    }
  }

  /* ---------- Notifications (toasts) ---------- */
  let zoneToasts = null;
  function toast(message, { duree = 2600 } = {}) {
    if (!zoneToasts) {
      body.insertAdjacentHTML("beforeend", '<div class="toasts" role="status" aria-live="polite"></div>');
      zoneToasts = body.lastElementChild;
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `${nakliSVG("content", "toast-nakli")}<span>${message}</span>`;
    zoneToasts.appendChild(t);
    requestAnimationFrame(() => t.classList.add("visible"));
    setTimeout(() => { t.classList.remove("visible"); setTimeout(() => t.remove(), reduit ? 0 : 300); }, duree);
  }

  /* Favoris : clic sur un cœur, n'importe où dans le site */
  function majCompteurs() {
    const n = lireFavoris().length;
    $$("[data-compte-fav]").forEach(el => { el.textContent = n; el.hidden = !n; });
  }
  function petitCoeurs(source) {
    if (reduit) return;
    const r = source.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span"), a = (Math.PI * 2 * i) / 8, d = 26 + Math.random() * 14;
      s.className = "etincelle"; s.style.cssText = `left:${x - 5}px;top:${y - 5}px;width:10px;height:10px`;
      s.innerHTML = ETINCELLE(i % 2 ? "#E8A33D" : "#E0705F");
      body.appendChild(s);
      s.animate([{ transform: "translate(0,0) scale(.4)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(1)`, opacity: 0 }], { duration: 520, easing: "ease-out" }).onfinish = () => s.remove();
    }
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fav]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const id = b.dataset.fav, d = REGISTRE.get(id);
    let favs = lireFavoris();
    const avant = favs.some(f => f.id === id);
    favs = avant ? favs.filter(f => f.id !== id) : [{ id, ville: villeDe(VILLES.find(v => v.nom === b.dataset.favVille)?.slug)?.slug || villeActive().slug, ajout: Date.now() }, ...favs];
    save("nk-favoris", favs);
    const nom = d ? d.p.name : "Cette adresse";
    $$(`[data-fav="${CSS.escape(id)}"]`).forEach(c => {
      c.setAttribute("aria-pressed", !avant);
      c.setAttribute("aria-label", `${avant ? "Ajouter" : "Retirer"} ${nom} ${avant ? "à" : "de"} tes favoris`);
    });
    if (!avant) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); petitCoeurs(b); }
    majCompteurs();
    toast(avant ? `${esc(nom)} retiré de tes favoris` : `${esc(nom)} ajouté à <a href="${ROOT}favoris/">tes favoris</a>`);
    document.dispatchEvent(new CustomEvent("naklo:favoris"));
  });

  /* Chiffres qui défilent quand on arrive dessus */
  function compter(racine = document) {
    $$("[data-compte]", racine).forEach(el => {
      const cible = +el.dataset.compte;
      if (reduit || !("IntersectionObserver" in window)) { el.textContent = cible.toLocaleString("fr-FR"); return; }
      el.textContent = "0";
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), duree = 1300;
        const pas = t => { const k = Math.min(1, (t - t0) / duree), v = Math.round(cible * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString("fr-FR"); if (k < 1) requestAnimationFrame(pas); };
        requestAnimationFrame(pas);
      }, { threshold: .6 });
      io.observe(el);
    });
  }

  /* Les sections apparaissent en douceur au défilement */
  function reveler(racine = document) {
    if (reduit || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entrees => entrees.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$("[data-reveal]", racine).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight) return; // déjà à l'écran : on ne cache rien
      el.classList.add("reveal"); io.observe(el);
    });
  }
  reveler();

  window.Naklo = { $, $$, esc, load, save, reduit, ROOT, VILLES, VILLE, villeDe, villeActive, lienVille, lienListes, chargerVille, pick, matchFood, carte, humeur, nakliSVG, etoiles, partagerStory, squelette, incliner, feuille, toast, compter, reveler, lireFavoris, fmt, I };
})();
