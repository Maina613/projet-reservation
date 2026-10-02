"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  compterAdmins,
  getMotDePasse,
  getUserByEmail,
  modifierUser,
  supprimerUser,
} from "@/lib/data/users";
import { getUtilisateurConnecte, supprimerSession } from "@/lib/session";
import { ProfilSchema, champ } from "@/lib/validation";
import type { FormState } from "@/lib/types";

/**
 * Server actions pour le profil : modification et suppression du compte.
 */

/** Modification du profil (et du mot de passe si un nouveau est saisi) */
export async function modifierProfil(_etat: FormState, formData: FormData): Promise<FormState> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect("/connexion");

  const valeurs = {
    prenom: champ(formData, "prenom"),
    nom: champ(formData, "nom"),
    email: champ(formData, "email"),
  };

  const resultat = ProfilSchema.safeParse({
    ...valeurs,
    motdepasse_actuel: champ(formData, "motdepasse_actuel"),
    nouveau_motdepasse: champ(formData, "nouveau_motdepasse"),
  });
  if (!resultat.success) {
    return { erreurs: z.flattenError(resultat.error).fieldErrors, valeurs };
  }
  const donnees = resultat.data;

  // L'email doit rester unique : on vérifie qu'il n'est pas utilisé par quelqu'un d'autre
  const autre = getUserByEmail(donnees.email);
  if (autre && autre.id !== user.id) {
    return { erreurs: { email: ["Cette adresse email est déjà utilisée."] }, valeurs };
  }

  let nouveauHash: string | undefined;
  if (donnees.nouveau_motdepasse !== "") {
    const hashActuel = getMotDePasse(user.id);
    const correct = hashActuel ? await bcrypt.compare(donnees.motdepasse_actuel, hashActuel) : false;
    if (!correct) {
      return { erreurs: { motdepasse_actuel: ["Le mot de passe actuel est incorrect."] }, valeurs };
    }
    nouveauHash = await bcrypt.hash(donnees.nouveau_motdepasse, 10);
  }

  modifierUser(user.id, donnees.prenom, donnees.nom, donnees.email, nouveauHash);

  // Le prénom est affiché dans l'en-tête, il faut donc rafraichir toute les pages
  revalidatePath("/", "layout");
  return { succes: true, message: "Votre profil a bien été mis à jour.", valeurs };
}

/** Suppression définitive du compte de l'utilisateur connecté */
export async function supprimerProfil(): Promise<void> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect("/connexion");

  // On garde toujours au moins un administrateur sinon plus personne ne peut gérer le site
  if (user.role === "admin" && compterAdmins() <= 1) {
    redirect("/profil?erreur=dernier-admin");
  }

  supprimerUser(user.id);
  await supprimerSession();
  redirect("/?message=compte-supprime");
}
