/**
 * Petites règles de typographie française appliquées aux textes affichés.
 * - une espace fine insécable avant ! ? ; : et » (sinon le navigateur peut
 *   renvoyer le "!" tout seul à la ligne suivante)
 * - une espace fine insécable après «
 * - l'apostrophe droite ' remplacée par l'apostrophe typographique ’
 */

/** Espace fine insécable (U+202F) */
const ESPACE_FINE = " ";

export function typographie(texte: string): string {
  return texte
    .replace(/\s+([!?;:»])/g, `${ESPACE_FINE}$1`)
    .replace(/«\s+/g, `«${ESPACE_FINE}`)
    .replace(/'/g, "’");
}
