import NavBarre from "@/components/NavBarre";
import { getUtilisateurConnecte } from "@/lib/session";

/** Nom complet du parc, utilisé dans les metadata */
export const NOM_DU_PARC = "Grand Air";

/** Texte du logo affiché dans la barre de navigation */
const LOGO = "Grand Air";

/**
 * En-tête du site.
 * Ce composant serveur récupère l'utilisateur connecté, et la barre de navigation
 * (composant client, car elle réagit au scroll) s'occupe de l'affichage.
 */
export default async function EnTete() {
  const user = await getUtilisateurConnecte();
  return <NavBarre user={user} logo={LOGO} nomDuParc={NOM_DU_PARC} />;
}
