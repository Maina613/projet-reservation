import type { StaticImageData } from "next/image";
import photoAccrobranche from "@/public/activites/accrobranche.jpg";
import photoBienEtre from "@/public/activites/bien-etre.jpg";
import photoCanoe from "@/public/activites/canoe.jpg";
import photoEscalade from "@/public/activites/escalade.jpg";
import photoNautique from "@/public/activites/nautique.jpg";
import photoRandonnee from "@/public/activites/randonnee.jpg";
import photoTirALArc from "@/public/activites/tir-a-l-arc.jpg";
import photoTyrolienne from "@/public/activites/tyrolienne.jpg";
import photoForet from "@/public/foret.jpg";
import type { ActiviteDetail } from "@/lib/types";

/**
 * Photos des activités.
 * Certaines activités ont leur propre photo (rangée par nom). Les autres prennent
 * la photo de leur type, comme ça une nouvelle activité créée par l'admin a
 * directement une image.
 */

/** Photos propre à une activité précise */
const PHOTOS_PAR_NOM: Record<string, StaticImageData> = {
  "Grande tyrolienne du lac": photoTyrolienne,
  "Balade en canoë": photoCanoe,
};

/** Photo par défaut de chaque type d'activité */
const PHOTOS_PAR_TYPE: Record<string, StaticImageData> = {
  Accrobranche: photoAccrobranche,
  Escalade: photoEscalade,
  Nautique: photoNautique,
  Randonnée: photoRandonnee,
  "Tir à l'arc": photoTirALArc,
  "Bien-être": photoBienEtre,
};

/** Renvoie la photo de l'activité : la sienne, sinon celle de son type, sinon la forêt */
export function photoDeLActivite(activite: Pick<ActiviteDetail, "nom" | "type_nom">): StaticImageData {
  return PHOTOS_PAR_NOM[activite.nom] ?? PHOTOS_PAR_TYPE[activite.type_nom] ?? photoForet;
}
