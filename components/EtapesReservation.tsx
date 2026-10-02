import type { ReactNode } from "react";
import { typographie } from "@/lib/typographie";

/** Une étape : son titre, son texte et son icône */
interface Etape {
  titre: string;
  texte: string;
  icone: ReactNode;
}

/** Props communes à toutes les icônes (trait fin, couleur du texte) */
const PROPS_ICONE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-11 w-11",
  "aria-hidden": true,
};

const ETAPES: Etape[] = [
  {
    titre: "Choisissez une activité",
    texte: "Parcourez les activités du parc et trouvez celle qui vous fait envie.",
    icone: (
      // Loupe
      <svg {...PROPS_ICONE}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </svg>
    ),
  },
  {
    titre: "Choisissez la date",
    texte: "Sélectionnez le jour qui vous arrange dans le calendrier.",
    icone: (
      // Calendrier
      <svg {...PROPS_ICONE}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
      </svg>
    ),
  },
  {
    titre: "Réservez votre place",
    texte: "Connectez-vous et confirmez votre réservation en un clic.",
    icone: (
      // Ticket avec une coche
      <svg {...PROPS_ICONE}>
        <path d="M3.5 8.5V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    titre: "Profitez !",
    texte: "Présentez-vous à l'accueil du parc le jour J, on s'occupe du reste.",
    icone: (
      // Montagnes et soleil
      <svg {...PROPS_ICONE}>
        <circle cx="17" cy="6.5" r="2" />
        <path d="m2.5 19.5 6-9 4 6 2.5-3.5 6.5 6.5Z" />
      </svg>
    ),
  },
];

/** Petite flèche en pointillés affichée entre deux étapes (grand écran seulement) */
function FlecheEntreEtapes() {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="absolute top-4 -right-10 hidden w-10 text-stone-300 lg:block"
      aria-hidden="true"
    >
      <path d="M1 6h40" strokeDasharray="3 4" />
      <path d="m41 2 5 4-5 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Section "Comment réserver" de l'accueil : les 4 étapes avec leurs icônes */
export default function EtapesReservation() {
  return (
    <section aria-labelledby="titre-etapes">
      <h2 id="titre-etapes" className="text-2xl font-bold text-stone-900">
        Comment réserver ?
      </h2>

      <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
        {ETAPES.map((etape, index) => (
          <li key={etape.titre} className="relative flex items-start gap-3">
            <span className="shrink-0 text-kaki-600">{etape.icone}</span>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                {index + 1}. {typographie(etape.titre)}
              </h3>
              <p className="mt-1 text-sm text-stone-500">{typographie(etape.texte)}</p>
            </div>
            {index < ETAPES.length - 1 && <FlecheEntreEtapes />}
          </li>
        ))}
      </ol>
    </section>
  );
}
