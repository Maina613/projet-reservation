"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { typographie } from "@/lib/typographie";

/** Un avis laissé par un visiteur */
interface Avis {
  prenom: string;
  ville: string;
  activite: string;
  /** Note sur 5 */
  note: number;
  texte: string;
}

// Avis fictifs pour la démonstration du site
const AVIS: Avis[] = [
  {
    prenom: "Sophie",
    ville: "Lyon",
    activite: "Parcours des poussins",
    note: 5,
    texte:
      "Nos deux enfants ont adoré le parcours ! Les moniteurs sont super patients et on se sent en sécurité du début à la fin. On reviendra cet été.",
  },
  {
    prenom: "Karim",
    ville: "Grenoble",
    activite: "Grande tyrolienne du lac",
    note: 5,
    texte:
      "Sensations incroyables au dessus du lac. La réservation en ligne a pris deux minutes et il n'y a eu aucune attente sur place.",
  },
  {
    prenom: "Julie",
    ville: "Annecy",
    activite: "Stand up paddle au coucher du soleil",
    note: 4,
    texte:
      "Un moment magique, la lumière sur le lac était superbe. Petit groupe donc très bien encadré, même pour une débutante comme moi.",
  },
  {
    prenom: "Thomas",
    ville: "Chambéry",
    activite: "Initiation à l'escalade",
    note: 5,
    texte:
      "Je n'avais jamais grimpé et le moniteur m'a mis en confiance tout de suite. Le matériel est fourni, il n'y a vraiment rien à prévoir.",
  },
  {
    prenom: "Nadia",
    ville: "Valence",
    activite: "Yoga en plein air",
    note: 5,
    texte:
      "Une séance très apaisante au milieu des arbres. Parfait pour décompresser après une semaine chargée, je recommande les yeux fermés.",
  },
  {
    prenom: "Pierre",
    ville: "Genève",
    activite: "Randonnée de la vallée",
    note: 4,
    texte:
      "Belle balade avec une vue magnifique sur la vallée. Le guide connait plein d'anecdotes sur la région, on ne voit pas le temps passer.",
  },
  {
    prenom: "Emma",
    ville: "Grenoble",
    activite: "Tir à l'arc découverte",
    note: 5,
    texte:
      "Activité parfaite pour un anniversaire entre amis. On a beaucoup rigolé et on a même fini par toucher le centre de la cible !",
  },
  {
    prenom: "Marc",
    ville: "Lyon",
    activite: "Balade en canoë",
    note: 5,
    texte:
      "Super sortie en famille sur la rivière. Le parcours est calme et accessible, les enfants ont pu pagayer eux-mêmes.",
  },
];

/** Affiche la note sous forme de 5 étoiles (pleines ou vides) */
function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Note : ${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 ${i <= note ? "text-kaki-600" : "text-stone-300"}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

/** Petit bouton rond du carrousel (flèches et pause) */
function BoutonRond({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition-[background-color,transform] duration-150 ease-(--ease-sortie) hover:bg-stone-100 motion-safe:active:scale-[0.94]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

/** Temps entre deux défilements automatiques (en millisecondes) */
const DELAI_DEFILEMENT = 4000;

const REQUETE_ANIMATIONS_REDUITES = "(prefers-reduced-motion: reduce)";

/** Vrai si l'utilisateur a demandé à réduire les animations (suivi en direct si le réglage change) */
function useAnimationsReduites(): boolean {
  return useSyncExternalStore(
    (prevenir) => {
      const requete = window.matchMedia(REQUETE_ANIMATIONS_REDUITES);
      requete.addEventListener("change", prevenir);
      return () => requete.removeEventListener("change", prevenir);
    },
    () => window.matchMedia(REQUETE_ANIMATIONS_REDUITES).matches,
    // Côté serveur on ne sait pas : on part du principe que non
    () => false,
  );
}

/**
 * Fait défiler la bande d'un avis. Arrivé au bout, on repart au début
 * (et inversement), comme ça le carrousel tourne en boucle.
 */
function defilerBande(el: HTMLElement, sens: 1 | -1, doux: boolean) {
  const avis = el.querySelector("li");
  if (!avis) return;
  const behavior: ScrollBehavior = doux ? "smooth" : "auto";
  const auDebut = el.scrollLeft <= 4;
  const aLaFin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;

  if (sens === 1 && aLaFin) el.scrollTo({ left: 0, behavior });
  else if (sens === -1 && auDebut) el.scrollTo({ left: el.scrollWidth, behavior });
  else el.scrollBy({ left: sens * (avis.clientWidth + 40), behavior });
}

/**
 * Section "avis" de l'accueil, sous forme de carrousel qui défile tout seul.
 * - un bouton pause / lecture permet d'arrêter le défilement (obligatoire en accessibilité
 *   pour un contenu qui bouge tout seul plus de 5 secondes)
 * - le défilement se met aussi en pause quand la souris ou le focus clavier est dans la section
 * - si l'utilisateur a demandé à réduire les animations, rien ne défile tout seul
 */
export default function AvisClients() {
  const bande = useRef<HTMLUListElement>(null);
  const animationsReduites = useAnimationsReduites();
  const [pauseDemandee, setPauseDemandee] = useState(false);
  const [survol, setSurvol] = useState(false);

  const defileTout = !pauseDemandee && !animationsReduites;

  // Défilement automatique toutes les 4 secondes
  useEffect(() => {
    if (!defileTout || survol) return;
    const minuteur = setInterval(() => {
      if (bande.current) defilerBande(bande.current, 1, true);
    }, DELAI_DEFILEMENT);
    return () => clearInterval(minuteur);
  }, [defileTout, survol]);

  /** Clic sur une flèche */
  function defiler(sens: 1 | -1) {
    if (bande.current) defilerBande(bande.current, sens, !animationsReduites);
  }

  return (
    <section
      aria-labelledby="titre-avis"
      aria-roledescription="carrousel"
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocus={() => setSurvol(true)}
      onBlur={() => setSurvol(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="titre-avis" className="text-2xl font-bold text-stone-900">
            Ils ont vécu l’aventure
          </h2>
          <p className="mt-1 text-stone-600">Ce que nos visiteurs pensent de leur journée au parc.</p>
        </div>
        <div className="flex gap-2">
          {!animationsReduites && (
            <BoutonRond
              label={pauseDemandee ? "Relancer le défilement des avis" : "Mettre en pause le défilement des avis"}
              onClick={() => setPauseDemandee(!pauseDemandee)}
            >
              {pauseDemandee ? (
                <path d="M8 5.5v13l10-6.5-10-6.5Z" strokeLinejoin="round" />
              ) : (
                <path d="M9 6v12M15 6v12" strokeLinecap="round" />
              )}
            </BoutonRond>
          )}
          <BoutonRond label="Avis précédent" onClick={() => defiler(-1)}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </BoutonRond>
          <BoutonRond label="Avis suivant" onClick={() => defiler(1)}>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </BoutonRond>
        </div>
      </div>

      {/*
        Les avis sont présentés comme des citations (un filet au-dessus, pas de carte),
        la barre de défilement est cachée : on navigue avec les boutons ou au doigt.
      */}
      <ul
        ref={bande}
        aria-live={defileTout && !survol ? "off" : "polite"}
        className="mt-8 flex snap-x snap-mandatory gap-10 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {AVIS.map((avis, index) => (
          <li
            key={avis.prenom}
            aria-roledescription="avis"
            aria-label={`${index + 1} sur ${AVIS.length}`}
            className="flex w-[85%] shrink-0 snap-start flex-col border-t border-stone-300 pt-6 sm:w-[calc((100%-2.5rem)/2)] lg:w-[calc((100%-5rem)/3)]"
          >
            <Etoiles note={avis.note} />
            <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-stone-800">
              {typographie(`« ${avis.texte} »`)}
            </blockquote>
            <p className="mt-6 text-sm">
              <span className="font-semibold text-stone-900">{avis.prenom}</span>
              <span className="text-stone-500">
                {" "}
                · {avis.ville} · {typographie(avis.activite)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
