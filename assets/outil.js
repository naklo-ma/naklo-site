/* « Demande à Nakli » : l'outil, pour la ville de la page (data-ville sur <body>).
   Raccourcis par l'URL (utilisés par l'accueil et les posts) :
   ?qui=Date&n=2&budget=< 250 DH&envie=Burger&ambiance=Rooftop / vue&quand=Ce soir&go=1
   ?mode=groupe · ?mode=adresses · ?surprise=1 */
(function () {
  "use strict";
  const N = window.Naklo;
  const { $, $$, esc, load, save } = N;
  const racine = $("#outil");
  const VILLE = N.VILLE;
  const url = new URLSearchParams(location.search);

  /* Ville pas encore ouverte */
  if (!VILLE.on) {
    racine.innerHTML = `<div class="panneau bientot">
      ${N.nakliSVG("affame")}
      <h1 class="pinceau penche" style="font-size:clamp(2.2rem,9vw,3rem)">Nakli arrive bientôt à <span class="ambre">${esc(VILLE.nom)}</span></h1>
      <p class="mut" style="max-width:40ch">On construit la liste des adresses de ${esc(VILLE.nom)} à la main avant d'ouvrir. Tu veux qu'il vienne plus vite ? Dis-le-nous.</p>
      <a class="btn" href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener">Écris-nous sur Instagram</a>
      <a class="lien-fleche" href="${N.lienVille(N.villeActive())}">En attendant, essaie Nakli à ${esc(N.villeActive().nom)} →</a>
    </div>`;
    return;
  }

  racine.innerHTML = `
    <div class="outil-tete">
      ${N.nakliSVG("neutre", "nakli", "nakli")}
      <div><h1 class="pinceau penche">Demande à <span class="neon">Nakli</span></h1>
      <p>On mange où à ${esc(VILLE.nom)} ? Dis-moi avec qui, ton budget et ton envie.</p></div>
    </div>
    <div class="modes" role="tablist" aria-label="Modes">
      <button role="tab" id="t-search" data-mode="search" aria-controls="m-search" aria-selected="true">Demander</button>
      <button role="tab" id="t-group" data-mode="group" aria-controls="m-group" aria-selected="false" tabindex="-1">En groupe</button>
      <button role="tab" id="t-base" data-mode="base" aria-controls="m-base" aria-selected="false" tabindex="-1">Les adresses</button>
    </div>
    <section class="panneau" id="m-search" role="tabpanel" aria-labelledby="t-search">
      <div class="q"><p class="surtitre" id="l-who">Avec qui ?</p><div class="chips" role="group" aria-labelledby="l-who" data-key="who" data-single></div></div>
      <div class="q"><p class="surtitre" id="l-count">Combien ?</p>
        <div class="molette-zone">
          <button type="button" class="molette-btn" id="moins" aria-label="Une personne de moins">−</button>
          <div class="molette" id="molette" role="spinbutton" tabindex="0" aria-labelledby="l-count" aria-valuemin="1" aria-valuemax="30" aria-valuenow="4">
            <div class="molette-piste" id="molette-piste">${Array.from({ length: 30 }, (_, i) => `<span data-n="${i + 1}">${i + 1}</span>`).join("")}</div>
          </div>
          <button type="button" class="molette-btn" id="plus" aria-label="Une personne de plus">+</button>
        </div>
        <output id="count" class="sr-only" aria-live="polite">4</output></div>
      <div class="q"><p class="surtitre" id="l-budget">Budget par personne</p><div class="chips" role="group" aria-labelledby="l-budget" data-key="budget" data-single></div></div>
      <div class="q"><p class="surtitre" id="l-food">Envie de…</p><div class="chips" role="group" aria-labelledby="l-food" data-key="food"></div></div>
      <button type="button" class="ouvre-feuille" id="ouvre-crit" aria-haspopup="dialog">
        <span><span class="surtitre">Quand et ambiance</span><span class="resume" id="resume-crit"></span></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>
      </button>
      <div class="actions-2">
        <button class="btn" id="go-search" type="button">Trouve-moi un resto</button>
        <button class="btn btn-secondaire" id="go-surprise" type="button">Surprends-moi</button>
      </div>
    </section>
    <section class="panneau" id="m-group" role="tabpanel" aria-labelledby="t-group" hidden>
      <h2>Chacun coche ce qu'il veut, Nakli trouve le compromis.</h2>
      <ul class="personnes" id="personnes"></ul>
      <button class="btn btn-secondaire" id="ajout" type="button">+ Ajouter quelqu'un</button>
      <button class="btn btn-large" id="go-group" type="button">Trouver le compromis</button>
    </section>
    <section class="panneau" id="m-base" role="tabpanel" aria-labelledby="t-base" hidden>
      <h2 id="base-titre">Les adresses</h2>
      <p class="statut">Notes Google relevées en octobre 2026. Prix par personne estimés. Vérifie les horaires avant de partir.</p>
      <label class="sr-only" for="b-search">Chercher une adresse</label>
      <input id="b-search" type="search" placeholder="Un nom, une cuisine, un quartier" autocomplete="off">
      <ul class="base-liste" id="base"></ul>
      <p class="statut">Une adresse manque ? Écris-nous sur Instagram : <a class="handle" href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener">@naklo_ma</a></p>
    </section>
    <section id="resultats" class="resultats" aria-live="polite"></section>
    <dialog class="feuille" id="f-crit" aria-labelledby="f-crit-titre">
      <div class="feuille-poignee" aria-hidden="true"></div>
      <div class="feuille-tete"><h2 class="pinceau" id="f-crit-titre">Quand et ambiance</h2><button type="button" class="x" data-fermer aria-label="Fermer">×</button></div>
      <div class="feuille-corps">
        <div class="q"><p class="surtitre" id="l-when">Quand ?</p><div class="chips" role="group" aria-labelledby="l-when" data-key="when" data-single></div></div>
        <div class="q"><p class="surtitre" id="l-vibe">Ambiance</p><div class="chips" role="group" aria-labelledby="l-vibe" data-key="vibe"></div></div>
        <button type="button" class="btn btn-large" data-fermer>C'est bon</button>
      </div>
    </dialog>`;

  const nakli = $("#nakli");
  let DB = [];

  /* ---------- Modes (onglets) ---------- */
  const onglets = $$(".modes [role=tab]");
  function choisirMode(mode, focus) {
    onglets.forEach(t => { const on = t.dataset.mode === mode; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    ["search", "group", "base"].forEach(m => $("#m-" + m).hidden = m !== mode);
    $("#resultats").hidden = mode === "base";
    if (mode === "search" && typeof styler === "function") requestAnimationFrame(() => { piste.scrollLeft = (count - 1) * pas(); styler(); });
  }
  onglets.forEach((t, i) => {
    t.addEventListener("click", () => choisirMode(t.dataset.mode));
    t.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); choisirMode(onglets[(i + d + onglets.length) % onglets.length].dataset.mode, true); }
    });
  });

  /* ---------- Options à taper ---------- */
  const OPTS = {
    who: ["Solo", "Date", "Potes", "Famille", "Anniversaire"],
    budget: ["< 50 DH", "< 100 DH", "< 150 DH", "< 250 DH", "Peu importe"],
    food: ["Burger", "Sushi", "Pizza", "Pâtes", "Tacos", "Poulet", "Libanais / shawarma", "Marocain", "Grillades / viande", "Asiatique", "Indien", "Mexicain", "Brunch / petit-déj", "Healthy", "Vegan", "Street food", "Café", "Desserts / glaces", "Peu importe"],
    vibe: ["Sans alcool", "Terrasse / jardin", "Rooftop / vue", "Chic", "Jolie déco", "Pour les groupes"],
    when: ["Petit-déj", "Midi", "Ce soir", "Après minuit"]
  };
  const sel = Object.assign({ who: ["Potes"], budget: ["< 150 DH"], food: ["Peu importe"], vibe: [], when: ["Ce soir"] }, load("nk-sel", {}));
  let count = load("nk-count", 4);
  // un lien partagé (accueil, post) remplace les choix mémorisés
  const depuisUrl = { qui: "who", budget: "budget", envie: "food", ambiance: "vibe", quand: "when" };
  if ([...Object.keys(depuisUrl), "n"].some(k => url.has(k))) {
    Object.entries(depuisUrl).forEach(([k, key]) => { sel[key] = url.has(k) ? url.get(k).split(",") : (key === "food" ? ["Peu importe"] : key === "vibe" ? [] : sel[key]); });
    if (url.has("n")) count = Math.min(30, Math.max(1, +url.get("n") || 1));
  }
  Object.keys(OPTS).forEach(k => { sel[k] = (sel[k] || []).filter(v => OPTS[k].includes(v)); });
  save("nk-sel", sel);
  // « Envie de… » : 8 envies visibles, le reste derrière « Plus d'envies » (sauf si déjà choisi)
  const VISIBLES = 8;
  let envieOuverte = sel.food.some(v => OPTS.food.indexOf(v) >= VISIBLES && v !== "Peu importe");

  const peindre = el => { const k = el.dataset.key; el.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", sel[k].includes(c.dataset.v))); };
  $$(".chips[data-key]").forEach(el => {
    const k = el.dataset.key, single = el.hasAttribute("data-single");
    el.innerHTML = OPTS[k].map(v => `<button type="button" class="chip" data-v="${esc(v)}">${esc(v)}</button>`).join("");
    el.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
      const v = c.dataset.v;
      if (single) sel[k] = sel[k][0] === v ? [] : [v];
      else if (v === "Peu importe") sel[k] = sel[k].includes(v) ? [] : [v];
      else { sel[k] = sel[k].filter(x => x !== "Peu importe"); sel[k] = sel[k].includes(v) ? sel[k].filter(x => x !== v) : [...sel[k], v]; }
      if (k === "who") { const d = { Solo: 1, Date: 2 }; if (d[v] && sel.who.includes(v)) majCount(d[v]); }
      if (k === "food" && sel.food.length && !sel.food.includes("Peu importe")) N.humeur(nakli, "affame");
      save("nk-sel", sel); peindre(el); resumer();
    }));
    peindre(el);
    if (k === "food") {
      el.insertAdjacentHTML("beforeend", `<button type="button" class="chip" id="plus-envies" aria-expanded="false" style="border-style:dashed;color:var(--ambre)">Plus d'envies</button>`);
      const btn = $("#plus-envies");
      const replier = () => {
        el.querySelectorAll(".chip[data-v]").forEach((c, i) => { c.hidden = !envieOuverte && i >= VISIBLES && c.dataset.v !== "Peu importe"; });
        btn.setAttribute("aria-expanded", envieOuverte);
        btn.textContent = envieOuverte ? "Moins d'envies" : "Plus d'envies";
      };
      btn.addEventListener("click", () => { envieOuverte = !envieOuverte; replier(); });
      replier();
    }
  });
  /* Molette « Combien ? » : on fait défiler les chiffres au pouce, celui du milieu est choisi */
  const molette = $("#molette"), piste = $("#molette-piste"), chiffres = [...piste.children];
  const pas = () => (chiffres[1].offsetLeft - chiffres[0].offsetLeft) || 52;
  function styler() {
    const centre = piste.scrollLeft + piste.clientWidth / 2;
    chiffres.forEach(c => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre) / pas();
      c.style.opacity = Math.max(.18, 1 - d * .28);
      c.style.transform = `scale(${Math.max(.62, 1.15 - d * .17)})`;
      c.classList.toggle("actif", d < .5);
    });
  }
  function resumer() {
    const bits = [...sel.when, ...sel.vibe];
    $("#resume-crit").textContent = bits.length ? bits.join(" · ") : "Quand tu veux, peu importe l'ambiance";
  }
  resumer();
  $("#ouvre-crit").addEventListener("click", e => N.feuille({ dialog: $("#f-crit"), declencheur: e.currentTarget }));
  function majCount(n, depuisMolette) {
    count = Math.min(30, Math.max(1, n));
    $("#count").textContent = `${count} personne${count > 1 ? "s" : ""}`;
    molette.setAttribute("aria-valuenow", count);
    molette.setAttribute("aria-valuetext", `${count} personne${count > 1 ? "s" : ""}`);
    save("nk-count", count);
    if (!depuisMolette) piste.scrollTo({ left: (count - 1) * pas(), behavior: N.reduit || !piste.dataset.pret ? "auto" : "smooth" });
  }
  let rafMolette = 0;
  piste.addEventListener("scroll", () => {
    if (rafMolette) return;
    rafMolette = requestAnimationFrame(() => {
      rafMolette = 0; styler();
      const n = Math.round(piste.scrollLeft / pas()) + 1;
      if (n !== count) majCount(n, true);
    });
  }, { passive: true });
  chiffres.forEach(c => c.addEventListener("click", () => majCount(+c.dataset.n)));
  molette.addEventListener("keydown", e => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (d) { e.preventDefault(); majCount(count + d); }
    if (e.key === "Home") { e.preventDefault(); majCount(1); }
    if (e.key === "End") { e.preventDefault(); majCount(30); }
  });
  majCount(count); styler(); piste.dataset.pret = "1";
  $("#moins").addEventListener("click", () => majCount(count - 1));
  $("#plus").addEventListener("click", () => majCount(count + 1));
  const budgetNum = s => { const m = (s || "").match(/\d+/); return m ? +m[0] : null; };

  /* ---------- En groupe ---------- */
  const CONTRAINTES = ["Pas de poisson", "Pas de fast-food", "Végétarien", "Petit budget", "Terrasse", "Envie de viande", "Envie de sucré", "Pas de sushi", "Sans alcool"];
  let personnes = load("nk-people", [{ n: "Toi", c: ["Petit budget"] }, { n: "", c: [] }, { n: "", c: [] }]);
  function rendrePersonnes() {
    $("#personnes").innerHTML = personnes.map((p, i) => `<li><div class="qui"><label class="sr-only" for="pn-${i}">Prénom de la personne ${i + 1}</label><input type="text" id="pn-${i}" data-i="${i}" value="${esc(p.n)}" placeholder="Prénom" maxlength="20" autocomplete="off"><button class="x" type="button" data-i="${i}" aria-label="Retirer ${esc(p.n || "cette personne")}">×</button></div>
      <div class="chips" role="group" aria-label="Contraintes de ${esc(p.n || "la personne " + (i + 1))}">${CONTRAINTES.map(c => `<button type="button" class="chip" data-i="${i}" data-c="${esc(c)}" aria-pressed="${p.c.includes(c)}">${esc(c)}</button>`).join("")}</div></li>`).join("");
    $$("#personnes .qui input").forEach(inp => inp.addEventListener("input", () => { personnes[inp.dataset.i].n = inp.value; save("nk-people", personnes); }));
    $$("#personnes .x").forEach(b => b.addEventListener("click", () => { personnes.splice(+b.dataset.i, 1); save("nk-people", personnes); rendrePersonnes(); }));
    $$("#personnes .chip").forEach(b => b.addEventListener("click", () => { const p = personnes[b.dataset.i], c = b.dataset.c; p.c = p.c.includes(c) ? p.c.filter(x => x !== c) : [...p.c, c]; b.setAttribute("aria-pressed", p.c.includes(c)); save("nk-people", personnes); }));
  }
  $("#ajout").addEventListener("click", () => { personnes.push({ n: "", c: [] }); rendrePersonnes(); $("#personnes li:last-child input").focus(); });
  rendrePersonnes();

  /* ---------- Les adresses ---------- */
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function rendreBase() {
    const q = norm(($("#b-search").value || "").trim());
    const liste = DB.filter(p => !q || norm(p.name + " " + p.cuisine + " " + (p.area || "")).includes(q)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    $("#base").innerHTML = liste.length ? liste.map(p => `<li><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + (p.area || "") + " " + VILLE.nom)}" target="_blank" rel="noopener"><b>${esc(p.name)}</b><small>${esc(p.cuisine)} · ~${p.price} DH${p.area ? " · " + esc(p.area) : ""}${p.rating ? ` · ${N.fmt(p.rating)} ★` : ""}</small></a></li>`).join("") : `<li><small>Aucune adresse ne correspond. Essaie un autre mot.</small></li>`;
    $("#base-titre").textContent = `Les adresses à ${VILLE.nom} (${DB.length})`;
  }
  $("#b-search").addEventListener("input", rendreBase);

  /* ---------- Résultats ---------- */
  function montrer(intro, res, nb, note) {
    let h = `<p class="bulle">${intro}</p>`;
    if (note) h += `<p class="alerte">${note}</p>`;
    else if (res.widened) h += `<p class="alerte">Pas assez d'adresses pile dans ta demande, alors Nakli a pris les plus proches.</p>`;
    h += res.recos.length ? `<ol class="cartes">${res.recos.map((x, i) => N.carte(x, i, { personnes: nb, ville: VILLE.nom })).join("")}</ol>` : `<p class="vide">Nakli n'a rien trouvé. Enlève un critère et réessaie.</p>`;
    $("#resultats").innerHTML = h;
    const top = res.recos[0];
    const pepite = top && (top.p.rating || 0) >= 4.7;
    N.humeur(nakli, !top ? "affame" : pepite ? "ebloui" : "content");
    if (pepite) setTimeout(() => N.etoiles(nakli), 350);
  }
  function lancer(btn, fn) {
    if (btn) btn.disabled = true;
    N.humeur(nakli, "affame", true);
    $("#resultats").innerHTML = `<p class="statut">Nakli cherche…</p>${N.squelette(2)}`;
    setTimeout(() => {
      try { fn(); } finally {
        if (btn) btn.disabled = false;
        nakli.classList.remove("cherche");
        $("#resultats").scrollIntoView({ behavior: N.reduit ? "auto" : "smooth", block: "start" });
      }
    }, 450);
  }

  function demander(btn) {
    lancer(btn, () => {
      const b = budgetNum(sel.budget[0]);
      const res = N.pick(DB, { budget: b, foods: sel.food, noAlc: sel.vibe.includes("Sans alcool"), who: sel.who[0], vibe: sel.vibe, when: sel.when[0], count });
      const bits = [`${count} personne${count > 1 ? "s" : ""}`];
      if (sel.who[0]) bits.push(sel.who[0].toLowerCase());
      if (b) bits.push(`moins de ${b} DH chacun`);
      const f = sel.food.filter(x => x !== "Peu importe"); if (f.length) bits.push(f.join(", ").toLowerCase());
      if (sel.when[0]) bits.push(sel.when[0].toLowerCase());
      const amb = sel.vibe.filter(v => v !== "Sans alcool").map(v => v.toLowerCase());
      const trop = b && res.recos.some(x => x.p.price > b);
      const note = res.raison === "ambiance" && amb.length > 1 ? `Pas d'adresse qui coche tout (${esc(amb.join(" + "))})${b ? ` sous ${b} DH` : ""}. Voilà celles qui ont au moins une de ces ambiances.`
        : trop ? `Rien ne correspond sous ${b} DH. Ces adresses dépassent ton budget : enlève une ambiance ou monte un peu le budget.` : null;
      montrer(`<b>Compris :</b> ${esc(bits.join(" · "))}. Voilà ce que je te propose à ${esc(VILLE.nom)}.`, res, count, note);
    });
  }
  /* ---------- Surprends-moi : des adresses bien notées hors de tes habitudes, à swiper ---------- */
  const ICONES = {
    passe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    garde: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    annuler: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>'
  };
  const melanger = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function surprendre(btn) {
    lancer(btn, () => {
      const b = budgetNum(sel.budget[0]), usual = sel.food.filter(f => f !== "Peu importe");
      let pool = DB.filter(p => (!b || p.price <= b) && (p.rating || 0) >= 4.3 && !(usual.length && N.matchFood(p, usual)) && !(sel.vibe.includes("Sans alcool") && p.alcohol));
      if (pool.length < 4) pool = DB.filter(p => (p.rating || 0) >= 4.3);
      paquet(melanger([...pool]).slice(0, 12), b);
    });
  }

  function paquet(cartes, budget) {
    let idx = 0;
    const gardes = [], historique = [];
    $("#resultats").innerHTML = `<div class="deck-zone">
      <p class="bulle">Tu prends toujours la même chose ? Nakli tente des paris${budget ? " dans ton budget" : ""}. <b>Swipe à droite</b> ce qui te tente, à gauche pour passer.</p>
      <div class="deck" id="deck" tabindex="0" role="group" aria-roledescription="paquet de cartes" aria-label="Adresses à trier. Flèche droite pour garder, flèche gauche pour passer."></div>
      <div class="deck-actions">
        <button type="button" class="btn btn-secondaire" id="d-passe">${ICONES.passe}Passer</button>
        <button type="button" class="btn btn-secondaire btn-rond" id="d-annuler" aria-label="Revenir à la carte précédente" disabled>${ICONES.annuler}</button>
        <button type="button" class="btn" id="d-garde">${ICONES.garde}Je garde</button>
      </div>
      <p class="statut deck-compte" id="d-compte" aria-live="polite"></p>
      <div id="selection"></div>
    </div>`;
    const deck = $("#deck");

    const contenu = p => `<div class="couv" style="background:${["#E8A33D", "#E0705F", "#2FB7A6", "#CDBFA3"][[...p.cuisine].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 4]}"><span class="mono" aria-hidden="true">${esc(p.name.replace(/^(le|la|les|l'|the)\s*/i, "").replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase())}</span><span class="pastille">${esc(p.cuisine.split(",")[0])}</span></div>
      <div class="corps">
        <h3>${esc(p.name)}</h3>
        <div class="infos">
          <span>${N.I.star}<span>${p.rating ? `${N.fmt(p.rating)}<span class="mut"> · ${p.reviews.toLocaleString("fr-FR")} avis</span>` : '<span class="mut">pas encore de note</span>'}</span></span>
          <span>${N.I.cash}<span>~${p.price} DH/pers.</span></span>
          <span>${N.I.lieu}<span>${p.area ? esc(p.area) : '<span class="mut">quartier à préciser</span>'}</span></span>
          <span>${N.I.horloge}<span>${esc(p.hours || "à vérifier")}</span></span>
        </div>
        ${(p.tags || []).length ? `<div class="etiquettes">${p.tags.slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
        ${p.dishes && p.dishes.length ? `<p class="plats">À goûter : ${esc(p.dishes.join(" · "))}</p>` : ""}
      </div>
      <span class="tampon garde" aria-hidden="true">Je garde</span><span class="tampon passe" aria-hidden="true">Passe</span>`;

    function rendre() {
      $("#d-annuler").disabled = !historique.length;
      ["#d-passe", "#d-garde"].forEach(s => $(s).disabled = idx >= cartes.length);
      if (idx >= cartes.length) {
        deck.innerHTML = `<div class="deck-fin">${N.nakliSVG(gardes.length ? "content" : "affame")}<p><b>C'est tout pour cette fois.</b></p><p class="mut">${gardes.length ? `Tu as gardé ${gardes.length} adresse${gardes.length > 1 ? "s" : ""}. Elles sont juste en dessous.` : "Rien ne t'a tenté ? Nakli a d'autres paris en réserve."}</p><button type="button" class="btn btn-secondaire" id="d-relance">Relancer des paris</button></div>`;
        $("#d-relance").addEventListener("click", e => surprendre(e.currentTarget));
        $("#d-compte").textContent = "";
        return;
      }
      deck.innerHTML = cartes.slice(idx, idx + 3).map((p, r) => `<article class="deck-carte" data-rang="${r}" aria-hidden="${r > 0}">${contenu(p)}</article>`).reverse().join("");
      $("#d-compte").textContent = `${idx + 1} / ${cartes.length} · ${cartes[idx].name}`;
      const dessus = deck.querySelector('[data-rang="0"]');
      glisser(dessus);
      if (idx === 0 && !load("nk-astuce-swipe", false) && !N.reduit) {
        dessus.classList.add("astuce");
        dessus.insertAdjacentHTML("beforeend", '<span class="astuce-txt" aria-hidden="true">Glisse la carte</span>');
        dessus.addEventListener("animationend", () => dessus.classList.remove("astuce"), { once: true });
      }
    }

    function rendreSelection() {
      if (!gardes.length) { $("#selection").innerHTML = ""; return; }
      $("#selection").innerHTML = `<div class="selection-tete"><h2 class="pinceau penche">Ta sélection (${gardes.length})</h2><div class="liens"><a class="btn btn-secondaire btn-petit avec-logo" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texteSelection())}">${N.I.whatsapp}WhatsApp</a><button type="button" class="btn btn-secondaire btn-petit" id="d-envoyer">${N.I.partage}Autre</button></div></div>
        <ol class="cartes" style="margin-top:12px">${gardes.map((p, i) => N.carte({ p, pourquoi: `${p.cuisine.split(",")[0]}, environ ${p.price} DH par personne${p.rating ? `, noté ${N.fmt(p.rating)}` : ""}.`, style: [] }, i, { ville: VILLE.nom, top: false, pastille: "Ton pari" })).join("")}</ol>`;
      $("#d-envoyer").addEventListener("click", envoyer);
    }

    const texteSelection = () => `On mange où ? Nakli m'a trouvé :\n${gardes.map(p => `- ${p.name} (~${p.price} DH, ${p.area || VILLE.nom})`).join("\n")}\nVia @naklo_ma ${location.origin + location.pathname}`;
    async function envoyer(e) {
      const texte = texteSelection();
      if (navigator.share) { navigator.share({ title: "Naklo", text: texte }).catch(() => {}); return; }
      try { await navigator.clipboard.writeText(texte); N.toast("Copié, colle-le dans ton groupe"); } catch (err) { N.toast("Impossible de copier sur cet appareil"); }
    }

    function decider(garder, carteEl) {
      if (idx >= cartes.length) return;
      const p = cartes[idx];
      historique.push({ idx, garder });
      save("nk-astuce-swipe", true);
      if (garder) gardes.push(p);
      idx++;
      const fin = () => { rendre(); rendreSelection(); };
      if (garder) {
        const pepite = (p.rating || 0) >= 4.7;
        N.humeur(nakli, pepite ? "ebloui" : "content");
        if (pepite) N.etoiles(carteEl || deck);
      } else N.humeur(nakli, "neutre");
      if (carteEl && !N.reduit) {
        carteEl.classList.remove("drag");
        carteEl.style.transform = `translate(${garder ? 140 : -140}%, 0) rotate(${garder ? 24 : -24}deg)`;
        carteEl.style.opacity = "0";
        setTimeout(fin, 230);
      } else fin();
    }

    function glisser(el) {
      if (!el) return;
      let x0 = 0, y0 = 0, dx = 0, t0 = 0, actif = false;
      const tampons = { g: el.querySelector(".tampon.garde"), p: el.querySelector(".tampon.passe") };
      el.addEventListener("pointerdown", e => { actif = true; x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = Date.now(); el.setPointerCapture(e.pointerId); el.classList.add("drag"); });
      el.addEventListener("pointermove", e => {
        if (!actif) return;
        dx = e.clientX - x0;
        const dy = (e.clientY - y0) * .25;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 18}deg)`;
        tampons.g.style.opacity = Math.max(0, Math.min(1, dx / 90));
        tampons.p.style.opacity = Math.max(0, Math.min(1, -dx / 90));
      });
      const lacher = () => {
        if (!actif) return;
        actif = false;
        const vitesse = Math.abs(dx) / Math.max(1, Date.now() - t0);
        if (Math.abs(dx) > 100 || (vitesse > .6 && Math.abs(dx) > 30)) decider(dx > 0, el);
        else { el.classList.remove("drag"); el.style.transform = ""; tampons.g.style.opacity = tampons.p.style.opacity = 0; }
      };
      el.addEventListener("pointerup", lacher);
      el.addEventListener("pointercancel", lacher);
    }

    $("#d-garde").addEventListener("click", () => decider(true, deck.querySelector('[data-rang="0"]')));
    $("#d-passe").addEventListener("click", () => decider(false, deck.querySelector('[data-rang="0"]')));
    $("#d-annuler").addEventListener("click", () => {
      const h = historique.pop();
      if (!h) return;
      idx = h.idx;
      if (h.garder) gardes.pop();
      N.humeur(nakli, "neutre");
      rendre(); rendreSelection();
    });
    deck.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); decider(true, deck.querySelector('[data-rang="0"]')); }
      if (e.key === "ArrowLeft") { e.preventDefault(); decider(false, deck.querySelector('[data-rang="0"]')); }
    });
    N.humeur(nakli, "neutre");
    rendre();
  }
  $("#go-search").addEventListener("click", e => demander(e.currentTarget));
  $("#go-surprise").addEventListener("click", e => surprendre(e.currentTarget));
  $("#go-group").addEventListener("click", e => {
    const ps = personnes.filter(p => p.n.trim() || p.c.length);
    if (!ps.length) { $("#resultats").innerHTML = `<p class="alerte">Ajoute au moins une personne et coche ce qu'elle veut.</p>`; return; }
    lancer(e.currentTarget, () => {
      const C = ps.flatMap(p => p.c);
      const avoid = [...(C.includes("Pas de poisson") ? ["poisson", "fruits de mer", "sushi", "japonais"] : []), ...(C.includes("Pas de sushi") ? ["sushi", "japonais"] : []), ...(C.includes("Pas de fast-food") ? ["fast-food", "snack", "kebab"] : [])];
      const boost = [...(C.includes("Végétarien") ? ["vegan", "végétarien", "pizza", "pâtes"] : []), ...(C.includes("Terrasse") ? ["terrasse", "jardin", "rooftop"] : []), ...(C.includes("Envie de viande") ? ["grillade", "viande", "burger", "steak"] : []), ...(C.includes("Envie de sucré") ? ["dessert", "brunch", "crêpe", "glace", "pancakes"] : [])];
      const res = N.pick(DB, { budget: C.includes("Petit budget") ? 100 : null, avoid, noAlc: C.includes("Sans alcool"), count: ps.length, boost, n: 3 });
      const noms = ps.map(p => p.n.trim() || "quelqu'un");
      montrer(`Le compromis pour ${esc(noms.join(", "))} : le n°1 respecte ce que chacun a coché, les deux autres sont des plans B.`, res, ps.length);
    });
  });

  /* ---------- Démarrage ---------- */
  N.chargerVille(VILLE.slug).then(data => {
    DB = data;
    rendreBase();
    const mode = url.get("mode");
    if (mode === "groupe") choisirMode("group");
    else if (mode === "adresses") choisirMode("base");
    if (url.has("surprise")) surprendre();
    else if (url.has("go")) demander();
  });
})();
