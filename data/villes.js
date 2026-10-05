/* Villes et listes à thème de Naklo.
   Ouvrir une nouvelle ville :
   1. créer data/<slug>.js (copie de casablanca.js, avec ses adresses) ;
   2. passer "on: true" ci-dessous ;
   3. copier le dossier casablanca/ en <slug>/ et changer data-ville et le titre dans index.html. */
window.NAKLO_VILLES = [
  { slug: "casablanca", nom: "Casablanca", on: true },
  { slug: "rabat", nom: "Rabat" },
  { slug: "marrakech", nom: "Marrakech" },
  { slug: "tanger", nom: "Tanger" }
];

/* Listes à thème : chaque liste reprend un post Instagram.
   - "post" : l'image du post (assets/posts/), affichée en haut de la liste et dans la galerie de l'accueil ;
   - "ids" : les adresses citées dans le post, affichées en premier, dans le même ordre ;
   - "q" : la recherche Nakli qui complète la liste. Champs possibles : budget (DH max/pers.), foods, who, vibe,
     when, count, boost (mots à favoriser), noAlc, n (nombre d'adresses, 10 par défaut). */
window.NAKLO_LISTES = [
  { slug: "shawarma-moins-50-dh", titre: "Shawarma à moins de 50 DH", humeur: "affame", post: "post-02.jpg",
    intro: "Le shawarma qui cale, sans vider ton portefeuille.", ids: ["loqma", "shawarma2r", "helloshawarma", "tarboush"], q: { foods: ["Libanais / shawarma"], budget: 50 } },
  { slug: "apres-minuit", titre: "Où manger après minuit ?", humeur: "neutre", post: "post-03.jpg",
    intro: "Il est tard, t'as faim. Ces adresses ferment tard, mais vérifie les horaires avant de partir.", ids: ["empirekebab", "koya", "littlemamma", "basmane"], q: { when: "Après minuit" } },
  { slug: "burgers", titre: "Burgers à moins de 60 DH", humeur: "affame", post: "post-04.jpg",
    intro: "Des burgers qui calent, pour le prix d'un café en terrasse.", ids: ["eurosnack", "bsquare", "miga", "tableburger"], q: { foods: ["Burger"], budget: 60 } },
  { slug: "cafes-pour-reviser", titre: "Réviser avec un café à ~35 DH", humeur: "content", post: "post-05.jpg",
    intro: "Des cafés où poser ton ordi. Le wifi et le calme, c'est d'après les avis : ça dépend de l'heure.", ids: ["coinrelax", "coffeecorner", "fontaine", "stockholm"], q: { foods: ["Café"], budget: 50, boost: ["calme", "cosy", "étudiants"] } },
  { slug: "sushis", titre: "Sushis à moins de 100 DH", humeur: "affame", post: "post-06.jpg",
    intro: "Des sushis corrects sans payer le prix d'un lounge.", ids: ["taopan", "nomo", "hanaya", "clap"], q: { foods: ["Sushi"], budget: 100 } },
  { slug: "premier-date", titre: "Un premier date qui fait effet", humeur: "ebloui", post: "post-07.jpg",
    intro: "Une jolie ambiance, sans te ruiner.", ids: ["loliva", "rigatoni", "dardada"], q: { who: "Date", count: 2, budget: 250 } },
  { slug: "glaces", titre: "La pause glace", humeur: "content", post: "post-08.jpg",
    intro: "Pour finir la soirée sur une note sucrée.", ids: ["gelatotime", "glaceriecasa", "neko", "amorino"], q: { foods: ["Desserts / glaces"] } },
  { slug: "tacos", titre: "Tacos à moins de 50 DH", humeur: "affame", post: "post-09.jpg",
    intro: "Tacos français ou mexicains, toujours sous les 50 DH.", ids: ["chefanass", "kingtacos", "marchecentral", "streetfood2mars"], q: { foods: ["Tacos"], budget: 50 } },
  { slug: "mieux-notees", titre: "Les mieux notées", humeur: "ebloui", post: "post-10.jpg",
    intro: "Les meilleures notes Google, pondérées par le nombre d'avis.", ids: ["olivetree", "moods", "greenblack", "asiette"], q: {} },
  { slug: "brunch", titre: "Le brunch du dimanche", humeur: "content", post: "post-11.jpg",
    intro: "Pancakes, œufs, jus frais : le dimanche commence ici.", ids: ["browse", "belati", "soeurettes", "greenblack"], q: { foods: ["Brunch / petit-déj"], when: "Petit-déj" } },
  { slug: "pates", titre: "Des pâtes à moins de 100 DH", humeur: "affame", post: "post-12.jpg",
    intro: "De vraies pâtes, pas juste un plat sur la carte.", ids: ["pasto", "madrina", "littlemamma", "cucinanapoli"], q: { foods: ["Pâtes"], budget: 100 } },
  { slug: "groupes-de-10", titre: "On est 10, on va où ?", humeur: "neutre", post: "post-13.jpg",
    intro: "Des grandes tables et une ambiance qui suit. À partir de 6, pense à réserver.", ids: ["littlemamma", "sforza", "luigi", "mikbbq"], q: { who: "Potes", count: 10, vibe: ["Pour les groupes"], budget: 200 } },
  { slug: "poulet-frit", titre: "Le top 3 du poulet frit", humeur: "ebloui", post: "post-14.jpg",
    intro: "Croustillant, pas cher, efficace. Le podium, puis les autres.", ids: ["kuku", "joa", "ctr"], q: { foods: ["Poulet"] } }
];

/* Posts sans liste : la présentation de Nakli et l'appel à l'outil */
window.NAKLO_POSTS_MARQUE = [
  { post: "post-01.jpg", titre: "Salut, moi c'est Nakli", lien: "#a-propos" },
  { post: "post-15.jpg", titre: "Demande à Nakli", lien: "outil" }
];
