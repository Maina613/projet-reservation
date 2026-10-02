/**
 * Petites fonctions utilitaires pour les dates et l'affichage.
 * Les dates sont stockées en base sous la forme `AAAA-MM-JJTHH:mm`
 * (le même format que les champs <input type="datetime-local">).
 */

/** Ajoute un zéro devant les nombres inférieur à 10 */
const pad = (n: number): string => String(n).padStart(2, "0");

/** Transforme un objet Date en chaine `AAAA-MM-JJTHH:mm` (heure locale) */
export function versDateLocale(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Date et heure actuelle au format de la base */
export function maintenant(): string {
  return versDateLocale(new Date());
}

/** Indique si une date (format de la base) est déjà passée */
export function estPassee(datetime: string): boolean {
  return datetime < maintenant();
}

/** Exemple : "samedi 3 octobre 2026 à 14:30" */
export function formaterDateHeure(datetime: string): string {
  const date = new Date(datetime);
  const jour = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(date);
  return `${jour} à ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Exemple : "samedi 3 octobre 2026" (pour une date `AAAA-MM-JJ`) */
export function formaterJour(jour: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date(`${jour}T12:00`));
}

/** Exemple : "03/10/2026 14:30" */
export function formaterDateCourte(datetime: string): string {
  const date = new Date(datetime);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Transforme une durée en minutes en texte lisible. Exemple : 90 -> "1 h 30" */
export function formaterDuree(minutes: number): string {
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  if (heures === 0) return `${reste} min`;
  if (reste === 0) return `${heures} h`;
  return `${heures} h ${pad(reste)}`;
}
