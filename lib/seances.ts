import { formaterJour, versDateLocale } from "@/lib/format";

/**
 * Gestion des séances.
 * Une activité a lieu tous les jours, à l'heure de son `datetime_debut`,
 * à partir du jour de `datetime_debut`. L'utilisateur choisi le jour dans un calendrier.
 * Une séance est représentée par sa date et son heure : `AAAA-MM-JJTHH:mm`
 * (c'est ce qui est enregistré dans la colonne `date_reservation`).
 */

/** On peut réserver jusqu'à 60 jours à l'avance */
export const JOURS_RESERVABLES = 60;

/** Partie "jour" d'une date : `AAAA-MM-JJ` */
export function jourDe(datetime: string): string {
  return datetime.slice(0, 10);
}

/** Partie "heure" d'une date : `HH:mm` */
export function heureDe(datetime: string): string {
  return datetime.slice(11, 16);
}

/** Ajoute des jours à une date `AAAA-MM-JJ` */
export function ajouterJours(jour: string, nombre: number): string {
  const date = new Date(`${jour}T12:00`);
  date.setDate(date.getDate() + nombre);
  return jourDe(versDateLocale(date));
}

/** Vérifie qu'une chaine est une vraie date `AAAA-MM-JJ` (et pas le 31/02 par ex) */
export function estJourValide(jour: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) return false;
  return jourDe(versDateLocale(new Date(`${jour}T12:00`))) === jour;
}

/**
 * Texte qui décrit quand l'activité a lieu.
 * Exemple : "Tous les jours à 18:30, à partir du mercredi 7 octobre 2026"
 */
export function texteHoraires(datetimeDebut: string, maintenant: string): string {
  const texte = `Tous les jours à ${heureDe(datetimeDebut)}`;
  if (jourDe(datetimeDebut) > jourDe(maintenant)) {
    return `${texte}, à partir du ${formaterJour(jourDe(datetimeDebut))}`;
  }
  return texte;
}

/**
 * Premier et dernier jour qu'on peut réserver pour une activité.
 * - le premier jour : le jour de début de l'activité, ou aujourd'hui s'il est déjà passé
 *   (et demain si la séance d'aujourd'hui a déjà commencé)
 * - le dernier jour : aujourd'hui + JOURS_RESERVABLES
 */
export function fenetreDeReservation(datetimeDebut: string, maintenant: string): { min: string; max: string } {
  const aujourdhui = jourDe(maintenant);
  let min = jourDe(datetimeDebut) > aujourdhui ? jourDe(datetimeDebut) : aujourdhui;
  if (`${min}T${heureDe(datetimeDebut)}` <= maintenant) {
    min = ajouterJours(min, 1);
  }
  return { min, max: ajouterJours(aujourdhui, JOURS_RESERVABLES) };
}
