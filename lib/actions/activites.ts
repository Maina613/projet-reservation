"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  creerActivite,
  getActiviteById,
  modifierActivite,
  supprimerActivite as supprimerActiviteEnBase,
  typeExiste,
} from "@/lib/data/activites";
import { maxReservationsParSeance } from "@/lib/data/reservations";
import { getUtilisateurConnecte } from "@/lib/session";
import { ActiviteSchema, champ } from "@/lib/validation";
import type { FormState } from "@/lib/types";

/**
 * Server actions pour la gestion des activités (réservées aux administrateurs).
 */

/**
 * Vérifie que la personne qui appelle l'action est bien admin.
 * Important : il ne suffit pas de cacher les pages, une action peut être
 * appelée directement, donc on revérifie le rôle ici à chaque fois.
 */
async function verifierAdmin(): Promise<void> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect("/connexion");
  if (user.role !== "admin") redirect("/?message=acces-refuse");
}

/**
 * Création ou modification d'une activité.
 * Si le formulaire contient un champ caché `id` c'est une modification, sinon une création.
 */
export async function enregistrerActivite(_etat: FormState, formData: FormData): Promise<FormState> {
  await verifierAdmin();

  const idSaisi = champ(formData, "id");
  const id = /^\d+$/.test(idSaisi) ? Number(idSaisi) : null;

  const valeurs = {
    nom: champ(formData, "nom"),
    type_id: champ(formData, "type_id"),
    places_disponibles: champ(formData, "places_disponibles"),
    description: champ(formData, "description"),
    datetime_debut: champ(formData, "datetime_debut"),
    duree: champ(formData, "duree"),
  };

  const resultat = ActiviteSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { erreurs: z.flattenError(resultat.error).fieldErrors, valeurs };
  }
  const donnees = resultat.data;

  if (!typeExiste(donnees.type_id)) {
    return { erreurs: { type_id: ["Ce type d'activité n'existe pas."] }, valeurs };
  }

  if (id === null) {
    creerActivite(donnees);
  } else {
    if (!getActiviteById(id)) {
      return { message: "Cette activité n'existe plus.", valeurs };
    }
    // On ne peut pas mettre moins de places que le nombre de réservations déjà faite sur une séance
    const reservees = maxReservationsParSeance(id);
    if (donnees.places_disponibles < reservees) {
      return {
        erreurs: {
          places_disponibles: [
            `Une séance a déjà ${reservees} réservation(s), le nombre de places ne peut pas être inférieur.`,
          ],
        },
        valeurs,
      };
    }
    modifierActivite(id, donnees);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/activites?message=${id === null ? "creee" : "modifiee"}`);
}

/** Suppression d'une activité */
export async function supprimerActivite(id: number): Promise<void> {
  await verifierAdmin();
  supprimerActiviteEnBase(id);
  revalidatePath("/", "layout");
  redirect("/admin/activites?message=supprimee");
}
