import "server-only";
import { getDb, lireToutes, lireUne } from "@/lib/db";
import { maintenant } from "@/lib/format";
import { estJourValide, fenetreDeReservation, heureDe, jourDe } from "@/lib/seances";
import type { ReservationDetail, Statistiques } from "@/lib/types";

/**
 * Requêtes SQL sur la table `reservations` + les statistiques de l'admin.
 * Rappel : `date_reservation` contient la séance réservée (jour choisi + heure de l'activité).
 */

/** Résultats possible quand on essaye de réserver */
export type ResultatReservation =
  | "ok"
  | "introuvable"
  | "date_invalide"
  | "passee"
  | "complet"
  | "deja_reserve";

/** Résultats possible quand on essaye d'annuler */
export type ResultatAnnulation = "ok" | "introuvable" | "interdit" | "deja_annulee" | "passee";

/** Une ligne telle qu'elle sort de SQLite : `etat` vaut 0 ou 1 */
type AvecEtatSql<T> = Omit<T, "etat"> & { etat: number };

/** SQLite stocke les booléens en 0/1, on les reconverti en vrai booléen */
function avecBooleen<T extends { etat: boolean }>(ligne: AvecEtatSql<T>): T {
  return { ...ligne, etat: ligne.etat === 1 } as unknown as T;
}

/** Petit raccourci pour les requêtes du type SELECT COUNT(*) AS total */
function compter(sql: string, ...parametres: (string | number)[]): number {
  return lireUne<{ total: number }>(sql, ...parametres)?.total ?? 0;
}

/** Toutes les réservations d'un utilisateur, triées par date de séance */
export function getReservationsDeUser(userId: number): ReservationDetail[] {
  return lireToutes<AvecEtatSql<ReservationDetail>>(
    `SELECT r.*, a.nom AS activite_nom, a.duree, t.nom AS type_nom
     FROM reservations r
     JOIN activites a ON a.id = r.activite_id
     JOIN type_activite t ON t.id = a.type_id
     WHERE r.user_id = ?
     ORDER BY r.date_reservation ASC, r.id DESC`,
    userId,
  ).map((ligne) => avecBooleen<ReservationDetail>(ligne));
}

/**
 * Nombre de places déjà prises pour chaque séance à venir d'une activité.
 * Renvoie un objet du genre { "2026-10-03": 2, "2026-10-05": 1 } (clé = le jour).
 */
export function getPlacesPrisesParJour(activiteId: number): Record<string, number> {
  const lignes = lireToutes<{ seance: string; total: number }>(
    `SELECT date_reservation AS seance, COUNT(*) AS total
     FROM reservations
     WHERE activite_id = ? AND etat = 1 AND date_reservation >= ?
     GROUP BY date_reservation`,
    activiteId,
    maintenant(),
  );
  return Object.fromEntries(lignes.map((ligne) => [jourDe(ligne.seance), ligne.total]));
}

/** Les jours (à venir) pour lesquels l'utilisateur a déjà réservé cette activité */
export function getJoursReservesParUser(userId: number, activiteId: number): string[] {
  return lireToutes<{ seance: string }>(
    `SELECT date_reservation AS seance FROM reservations
     WHERE user_id = ? AND activite_id = ? AND etat = 1 AND date_reservation >= ?`,
    userId,
    activiteId,
    maintenant(),
  ).map((ligne) => jourDe(ligne.seance));
}

/** Nombre de réservations actives à venir pour chaque activité (pour la liste de l'admin) */
export function compterReservationsAVenirParActivite(): Record<number, number> {
  const lignes = lireToutes<{ activite_id: number; total: number }>(
    `SELECT activite_id, COUNT(*) AS total FROM reservations
     WHERE etat = 1 AND date_reservation >= ?
     GROUP BY activite_id`,
    maintenant(),
  );
  return Object.fromEntries(lignes.map((ligne) => [ligne.activite_id, ligne.total]));
}

/**
 * Plus grand nombre de réservations sur une même séance à venir.
 * Utile quand l'admin baisse le nombre de places : il ne peut pas descendre en dessous.
 */
export function maxReservationsParSeance(activiteId: number): number {
  return compter(
    `SELECT COALESCE(MAX(total), 0) AS total FROM (
       SELECT COUNT(*) AS total FROM reservations
       WHERE activite_id = ? AND etat = 1 AND date_reservation >= ?
       GROUP BY date_reservation
     )`,
    activiteId,
    maintenant(),
  );
}

/**
 * Réserve une place sur la séance du jour choisi, en faisant toutes les vérifications.
 * Tout est fait dans une transaction pour que deux personnes ne puissent pas
 * prendre la dernière place en même temps.
 */
export function creerReservation(userId: number, activiteId: number, jour: string): ResultatReservation {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const resultat = verifierEtReserver(userId, activiteId, jour);
    db.exec("COMMIT");
    return resultat;
  } catch (erreur) {
    db.exec("ROLLBACK");
    throw erreur;
  }
}

/** Les vérifications de creerReservation (appelée à l'intérieur de la transaction) */
function verifierEtReserver(userId: number, activiteId: number, jour: string): ResultatReservation {
  const activite = lireUne<{ datetime_debut: string; places_disponibles: number }>(
    "SELECT datetime_debut, places_disponibles FROM activites WHERE id = ?",
    activiteId,
  );
  if (!activite) return "introuvable";
  if (!estJourValide(jour)) return "date_invalide";

  // Le jour doit être dans la période réservable (pas avant le début, pas trop loin)
  const { min, max } = fenetreDeReservation(activite.datetime_debut, maintenant());
  if (jour < min) return "passee";
  if (jour > max) return "date_invalide";

  const seance = `${jour}T${heureDe(activite.datetime_debut)}`;

  const dejaReserve = compter(
    `SELECT COUNT(*) AS total FROM reservations
     WHERE user_id = ? AND activite_id = ? AND date_reservation = ? AND etat = 1`,
    userId,
    activiteId,
    seance,
  );
  if (dejaReserve > 0) return "deja_reserve";

  // La séance est complète, on refuse la réservation
  const prises = compter(
    `SELECT COUNT(*) AS total FROM reservations
    WHERE activite_id = ? AND date_reservation = ? AND etat = 1`,
    activiteId,
    seance,
  );
  if (prises >= activite.places_disponibles) return "complet";

  getDb()
    .prepare("INSERT INTO reservations (user_id, activite_id, date_reservation, etat) VALUES (?, ?, ?, 1)")
    .run(userId, activiteId, seance);
  return "ok";
}

/**
 * Annule une réservation (etat passe à false).
 * On vérifie que la réservation appartient bien à l'utilisateur qui fait la demande.
 */
export function annulerReservation(reservationId: number, userId: number): ResultatAnnulation {
  const reservation = lireUne<{ user_id: number; etat: number; date_reservation: string }>(
    "SELECT user_id, etat, date_reservation FROM reservations WHERE id = ?",
    reservationId,
  );

  if (!reservation) return "introuvable";
  if (reservation.user_id !== userId) return "interdit";
  if (reservation.etat === 0) return "deja_annulee";
  if (reservation.date_reservation < maintenant()) return "passee";

  getDb().prepare("UPDATE reservations SET etat = 0 WHERE id = ?").run(reservationId);
  return "ok";
}

/** Calcule toutes les statistiques du tableau de bord administrateur */
export function getStatistiques(): Statistiques {
  const date = maintenant();

  // Remplissage des séances à venir qui ont au moins une réservation :
  // places réservées / places proposées sur ces séances
  const remplissage = lireUne<{ places: number; reservees: number }>(
    `SELECT COALESCE(SUM(a.places_disponibles), 0) AS places, COALESCE(SUM(s.total), 0) AS reservees
     FROM (
       SELECT activite_id, COUNT(*) AS total FROM reservations
       WHERE etat = 1 AND date_reservation >= ?
       GROUP BY activite_id, date_reservation
     ) s
     JOIN activites a ON a.id = s.activite_id`,
    date,
  ) ?? { places: 0, reservees: 0 };

  const topActivites = lireToutes<Statistiques["topActivites"][number]>(
    `SELECT a.id, a.nom, COUNT(r.id) AS reservations
     FROM activites a
     LEFT JOIN reservations r ON r.activite_id = a.id AND r.etat = 1
     GROUP BY a.id
     ORDER BY reservations DESC, a.nom ASC
     LIMIT 5`,
  );

  const parType = lireToutes<Statistiques["parType"][number]>(
    `SELECT t.nom, COUNT(r.id) AS reservations
     FROM type_activite t
     LEFT JOIN activites a ON a.type_id = t.id
     LEFT JOIN reservations r ON r.activite_id = a.id AND r.etat = 1
     GROUP BY t.id
     ORDER BY reservations DESC, t.nom ASC`,
  );

  type Derniere = Statistiques["dernieresReservations"][number];
  const dernieres = lireToutes<AvecEtatSql<Derniere>>(
    `SELECT r.id, u.prenom, u.nom, a.nom AS activite_nom, r.date_reservation, r.etat
     FROM reservations r
     JOIN users u ON u.id = r.user_id
     JOIN activites a ON a.id = r.activite_id
     ORDER BY r.id DESC
     LIMIT 8`,
  );

  return {
    nbUtilisateurs: compter("SELECT COUNT(*) AS total FROM users"),
    nbActivites: compter("SELECT COUNT(*) AS total FROM activites"),
    nbReservationsAVenir: compter(
      "SELECT COUNT(*) AS total FROM reservations WHERE etat = 1 AND date_reservation >= ?",
      date,
    ),
    nbReservationsActives: compter("SELECT COUNT(*) AS total FROM reservations WHERE etat = 1"),
    nbReservationsAnnulees: compter("SELECT COUNT(*) AS total FROM reservations WHERE etat = 0"),
    tauxRemplissage:
      remplissage.places > 0 ? Math.round((remplissage.reservees / remplissage.places) * 100) : 0,
    topActivites,
    parType,
    dernieresReservations: dernieres.map((ligne) => avecBooleen<Derniere>(ligne)),
  };
}
