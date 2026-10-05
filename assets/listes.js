/* Listes à thème : ?ville=casablanca affiche toutes les listes, &l=<slug> en affiche une.
   Une liste montre d'abord le post Instagram et ses adresses, puis celles que Nakli ajoute. */
(function () {
  "use strict";
  const N = window.Naklo;
  const { $, esc } = N;
  const racine = $("#listes");
  const LISTES = window.NAKLO_LISTES || [];
  const VILLE = N.VILLE.on ? N.VILLE : N.villeActive();
  const slug = new URLSearchParams(location.search).get("l");
  const liste = LISTES.find(l => l.slug === slug);
  const fil = `<nav class="fil" aria-label="Fil d'Ariane"><a href="${N.ROOT}index.html">Accueil</a><span aria-hidden="true">/</span>${liste ? `<a href="${N.lienListes(VILLE)}">Listes à ${esc(VILLE.nom)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(liste.titre)}</span>` : `<span aria-current="page">Listes à ${esc(VILLE.nom)}</span>`}</nav>`;

  if (!liste) {
    document.title = `Les listes de Nakli à ${VILLE.nom} · naklo`;
    racine.innerHTML = `<header class="page-tete">${fil}
        <h1 class="pinceau penche">Les listes à <span class="ambre">${esc(VILLE.nom)}</span></h1>
        <p class="chapo">Nos posts, en version complète : les adresses du post, puis celles que Nakli ajoute, classées par spécialité et par note.</p></header>
      <div class="grille-posts" style="margin-top:20px">${LISTES.map(l => `<a class="post-tuile incline" href="${N.lienListes(VILLE, l.slug)}"><img src="${N.ROOT}assets/posts/${l.post}" alt="" loading="lazy" width="720" height="900"><span class="post-titre">${esc(l.titre)}</span></a>`).join("")}</div>`;
    N.incliner && N.incliner();
    return;
  }

  document.title = `${liste.titre} · ${VILLE.nom} · naklo`;
  racine.innerHTML = `<header class="page-tete liste-tete">${fil}
      <div class="liste-tete-grille">
        <div>
          <div style="display:flex;align-items:center;gap:14px">${N.nakliSVG(liste.humeur || "neutre")}
          <h1 class="pinceau penche" style="font-size:clamp(2.2rem,9vw,3.6rem)">${esc(liste.titre)}</h1></div>
          <p class="chapo" style="margin-top:10px">${esc(liste.intro)} <span class="mut">À ${esc(VILLE.nom)}.</span></p>
        </div>
        ${liste.post ? `<figure class="post-vu"><a href="https://www.instagram.com/naklo_ma/" target="_blank" rel="noopener"><img src="${N.ROOT}assets/posts/${liste.post}" alt="Le post Instagram « ${esc(liste.titre)} »" width="720" height="900"></a><figcaption>Vu sur <span class="ambre">@naklo_ma</span></figcaption></figure>` : ""}
      </div></header>
    <div id="contenu-liste" style="margin-top:20px">${N.squelette(4, true)}</div>
    <div class="bandeau nuit" style="margin-top:28px"><div><h2 class="pinceau">Pas tout à fait ça ?</h2><p class="mut" style="margin-top:6px">Dis à Nakli avec qui tu sors et ton budget : il te trouve le bon resto en 3 taps.</p></div><a class="btn" href="${N.lienVille(VILLE)}">Demande à Nakli</a></div>`;

  N.chargerVille(VILLE.slug).then(DB => {
    const q = Object.assign({ n: 10 }, liste.q);
    const nb = q.count || 1;
    const fmtPourquoi = p => `${p.cuisine.split(",")[0]}, environ ${p.price} DH par personne${p.rating ? `, noté ${N.fmt(p.rating)} sur ${p.reviews.toLocaleString("fr-FR")} avis` : ""}.`;
    const epingles = (liste.ids || []).map(id => DB.find(p => p.id === id)).filter(Boolean);
    const res = N.pick(DB.filter(p => !epingles.includes(p)), Object.assign({}, q, { n: Math.max(0, q.n - epingles.length) }));
    const duPost = epingles.map(p => ({ p, pourquoi: fmtPourquoi(p), style: [] }));
    const opts = { personnes: nb, ville: VILLE.nom };
    let h = "";
    if (duPost.length) h += `<h2 class="surtitre" style="margin-bottom:10px">Dans le post</h2><ol class="cartes grille">${duPost.map((x, i) => N.carte(x, i, opts)).join("")}</ol>`;
    if (res.recos.length) h += `<h2 class="surtitre" style="margin:28px 0 10px">${duPost.length ? "Nakli va plus loin" : "La liste"}</h2>` +
      (res.widened ? `<p class="alerte" style="margin-bottom:12px">Peu d'adresses pile dans ce thème pour l'instant : Nakli a ajouté les plus proches.</p>` : "") +
      `<ol class="cartes grille" start="${duPost.length + 1}">${res.recos.map((x, i) => N.carte(x, i + duPost.length, Object.assign({}, opts, { top: !duPost.length }))).join("")}</ol>`;
    $("#contenu-liste").innerHTML = h || `<p class="vide">Pas encore d'adresses pour cette liste.</p>`;
  });
})();
