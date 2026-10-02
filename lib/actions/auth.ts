"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { redirect } from "next/navigation";
import { creerUser, getUserByEmail, getUserById } from "@/lib/data/users";
import { creerSession, supprimerSession } from "@/lib/session";
import { ConnexionSchema, InscriptionSchema, champ } from "@/lib/validation";
import type { FormState } from "@/lib/types";

/**
 * Server actions pour l'authentification : inscription, connexion, déconnexion.
 */

/**
 * Vérifie que l'adresse de redirection est bien une page du site
 * (pour ne pas rediriger vers un site externe après la connexion).
 */
function destinationSure(suite: string): string {
  return suite.startsWith("/") && !suite.startsWith("//") ? suite : "/activites";
}

/** Création d'un compte utilisateur */
export async function inscription(_etat: FormState, formData: FormData): Promise<FormState> {
  const valeurs = {
    prenom: champ(formData, "prenom"),
    nom: champ(formData, "nom"),
    email: champ(formData, "email"),
  };

  const resultat = InscriptionSchema.safeParse({
    ...valeurs,
    motdepasse: champ(formData, "motdepasse"),
    confirmation: champ(formData, "confirmation"),
  });
  if (!resultat.success) {
    return { erreurs: z.flattenError(resultat.error).fieldErrors, valeurs };
  }

  const donnees = resultat.data;
  if (getUserByEmail(donnees.email)) {
    return { erreurs: { email: ["Un compte existe déjà avec cette adresse email."] }, valeurs };
  }

  // On ne stocke jamais le mot de passe en clair, seulement son hash
  const hash = await bcrypt.hash(donnees.motdepasse, 10);
  const id = creerUser(donnees.prenom, donnees.nom, donnees.email, hash);

  // L'utilisateur est connecté directement après son inscription
  const user = getUserById(id);
  if (user) await creerSession(user);
  redirect("/activites");
}

/** Connexion avec email + mot de passe */
export async function connexion(_etat: FormState, formData: FormData): Promise<FormState> {
  const valeurs = { email: champ(formData, "email") };

  const resultat = ConnexionSchema.safeParse({
    ...valeurs,
    motdepasse: champ(formData, "motdepasse"),
  });
  if (!resultat.success) {
    return { erreurs: z.flattenError(resultat.error).fieldErrors, valeurs };
  }

  const user = getUserByEmail(resultat.data.email);
  const motDePasseOk = user ? await bcrypt.compare(resultat.data.motdepasse, user.motdepasse) : false;

  // Meme message dans les deux cas pour ne pas indiquer si l'email existe ou pas
  if (!user || !motDePasseOk) {
    return { message: "Email ou mot de passe incorrect.", valeurs };
  }

  await creerSession(user);
  redirect(destinationSure(champ(formData, "suite")));
}

/** Déconnexion */
export async function deconnexion(): Promise<void> {
  await supprimerSession();
  redirect("/");
}
