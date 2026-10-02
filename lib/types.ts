/**
 * Types partagés dans toute l'application.
 * Ils reprennent la structure des tables de la base de données.
 */

/** Rôles possible pour un utilisateur */
export type Role = "user" | "admin";

/** Ligne de la table `users` */
export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  motdepasse: string;
  role: Role;
}

/** Utilisateur sans son mot de passe (c'est celui-là qu'on envoie aux pages) */
export type UserPublic = Omit<User, "motdepasse">;

/** Ligne de la table `type_activite` */
export interface TypeActivite {
  id: number;
  nom: string;
}

/** Ligne de la table `activites` */
export interface Activite {
  id: number;
  nom: string;
  type_id: number;
  /** Nombre de places proposées pour chaque séance */
  places_disponibles: number;
  description: string;
  /**
   * Date et heure de la première séance, au format `AAAA-MM-JJTHH:mm`.
   * L'activité a ensuite lieu tous les jours à la même heure.
   */
  datetime_debut: string;
  /** Durée en minutes */
  duree: number;
}

/** Activité avec le nom de son type */
export interface ActiviteDetail extends Activite {
  type_nom: string;
}

/** Ligne de la table `reservations` */
export interface Reservation {
  id: number;
  user_id: number;
  activite_id: number;
  /** Séance réservée (jour choisi + heure de l'activité), format `AAAA-MM-JJTHH:mm` */
  date_reservation: string;
  /** true = réservation active, false = réservation annulée */
  etat: boolean;
}

/** Réservation avec les infos de l'activité, pour la page "Mes réservations" */
export interface ReservationDetail extends Reservation {
  activite_nom: string;
  type_nom: string;
  duree: number;
}

/** Données à fournir pour créer ou modifier une activité */
export type ActiviteInput = Omit<Activite, "id">;

/**
 * Etat renvoyé par les server actions aux formulaires (useActionState).
 * - `erreurs` : les erreurs champ par champ
 * - `message` : un message global (erreur ou succès)
 * - `valeurs` : les valeurs saisies, pour ne pas vider le formulaire en cas d'erreur
 */
export type FormState =
  | {
      succes?: boolean;
      message?: string;
      erreurs?: Record<string, string[] | undefined>;
      valeurs?: Record<string, string>;
    }
  | undefined;

/** Statistiques affichées sur le tableau de bord administrateur */
export interface Statistiques {
  nbUtilisateurs: number;
  nbActivites: number;
  /** Réservations actives pour des séances qui n'ont pas encore eu lieu */
  nbReservationsAVenir: number;
  nbReservationsActives: number;
  nbReservationsAnnulees: number;
  /** Taux de remplissage des séances à venir qui ont au moins une réservation (entre 0 et 100) */
  tauxRemplissage: number;
  topActivites: { id: number; nom: string; reservations: number }[];
  parType: { nom: string; reservations: number }[];
  dernieresReservations: {
    id: number;
    prenom: string;
    nom: string;
    activite_nom: string;
    date_reservation: string;
    etat: boolean;
  }[];
}
