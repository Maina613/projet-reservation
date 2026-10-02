"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  annulerReservation,
  creerReservation,
  type ResultatAnnulation,
  type ResultatReservation,
} from "@/lib/data/reservations";
import { getUtilisateurConnecte } from "@/lib/session";
import type { FormState } from "@/lib/types";

/**
 * Server actions pour les réservations : réserver et annuler.
 */

/** Message affiché à l'utilisateur quand la réservation est refusée */
const ERREURS_RESERVATION: Record<Exclude<ResultatReservation, "ok">, string> = {
  introuvable: "Cette activité n'existe plus.",
  date_invalide: "Choisissez une date dans le calendrier.",
  passee: "Cette séance est déjà passée, choisissez un autre jour.",
  complet: "Désolé, cette séance est complète. Choisissez un autre jour.",
  deja_reserve: "Vous avez déjà réservé cette activité pour ce jour-là.",
};

/** Message affiché à l'utilisateur quand l'annulation est refusée */
const ERREURS_ANNULATION: Record<Exclude<ResultatAnnulation, "ok">, string> = {
  introuvable: "Cette réservation n'existe pas.",
  interdit: "Vous ne pouvez pas annuler une réservation qui ne vous appartient pas.",
  deja_annulee: "Cette réservation est déjà annulée.",
  passee: "L'activité est déjà passée, la réservation ne peut plus être annulée.",
};

/**
 * Réserve une place pour l'utilisateur connecté, le jour choisi dans le calendrier.
 * L'id de l'activité est passé avec `.bind()`, le jour arrive dans le champ `jour`.
 */
export async function reserver(activiteId: number, _etat: FormState, formData: FormData): Promise<FormState> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect(`/connexion?suite=/activites/${activiteId}`);

  const jour = formData.get("jour");
  const resultat = creerReservation(user.id, activiteId, typeof jour === "string" ? jour : "");
  // On rafraichit dans tous les cas pour afficher le bon nombre de places
  revalidatePath("/", "layout");

  if (resultat !== "ok") {
    return { message: ERREURS_RESERVATION[resultat] };
  }
  return { succes: true, message: "Votre réservation est confirmée !" };
}

/** Annule une réservation de l'utilisateur connecté */
export async function annuler(reservationId: number): Promise<FormState> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect("/connexion");

  // L'id de l'utilisateur vient de la session (et pas du formulaire), comme ça
  // on est sur qu'il ne peut annuler que ses propres réservations
  const resultat = annulerReservation(reservationId, user.id);
  revalidatePath("/", "layout");

  if (resultat !== "ok") {
    return { message: ERREURS_ANNULATION[resultat] };
  }
  return { succes: true, message: "La réservation a bien été annulée." };
}
