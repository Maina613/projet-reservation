import "server-only";
import { getDb, lireToutes, lireUne } from "@/lib/db";
import type { ActiviteDetail, ActiviteInput, TypeActivite } from "@/lib/types";

/**
 * Requêtes SQL sur les tables `activites` et `type_activite`.
 */

// Requête de base : l'activité + le nom de son type.
// Les places restantes dépendent du jour choisi, elles sont calculées à part
// (voir getPlacesPrisesParSeance dans reservations.ts).
const SELECT_ACTIVITE = `
  SELECT a.*, t.nom AS type_nom
  FROM activites a
  JOIN type_activite t ON t.id = a.type_id
`;

/** Filtres possible pour la liste des activités */
export interface FiltresActivites {
  /** Texte recherché dans le nom de l'activité */
  recherche?: string;
  typeId?: number;
  /** Nombre maximum de résultats */
  limite?: number;
}

/** Liste des activités triées par date de première séance, avec recherche par nom et filtre par type */
export function getActivites(filtres: FiltresActivites = {}): ActiviteDetail[] {
  const conditions: string[] = [];
  const parametres: (string | number)[] = [];

  if (filtres.recherche) {
    // On échappe % et _ pour qu'ils soient cherchés comme du texte normal
    const texte = filtres.recherche.replace(/[\\%_]/g, "\\$&");
    conditions.push("a.nom LIKE ? ESCAPE '\\'");
    parametres.push(`%${texte}%`);
  }
  if (filtres.typeId) {
    conditions.push("a.type_id = ?");
    parametres.push(filtres.typeId);
  }


  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limite = filtres.limite ? `LIMIT ${Math.floor(filtres.limite)}` : "";

  return lireToutes<ActiviteDetail>(
    `${SELECT_ACTIVITE} ${where} ORDER BY a.datetime_debut ASC ${limite}`,
    ...parametres,
  );
}

/** Détail d'une activité, ou undefined si elle n'existe pas */
export function getActiviteById(id: number): ActiviteDetail | undefined {
  return lireUne<ActiviteDetail>(`${SELECT_ACTIVITE} WHERE a.id = ?`, id);
}

/** Tous les types d'activité, par ordre alphabétique */
export function getTypes(): TypeActivite[] {
  return lireToutes<TypeActivite>("SELECT * FROM type_activite ORDER BY nom");
}

/** Vérifie qu'un type existe */
export function typeExiste(id: number): boolean {
  return lireUne("SELECT 1 FROM type_activite WHERE id = ?", id) !== undefined;
}

/** Crée une activité et renvoie son id */
export function creerActivite(a: ActiviteInput): number {
  const resultat = getDb()
    .prepare(
      `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(a.nom, a.type_id, a.places_disponibles, a.description, a.datetime_debut, a.duree);
  return Number(resultat.lastInsertRowid);
}

/** Modifie une activité existante */
export function modifierActivite(id: number, a: ActiviteInput): void {
  getDb()
    .prepare(
      `UPDATE activites
       SET nom = ?, type_id = ?, places_disponibles = ?, description = ?, datetime_debut = ?, duree = ?
       WHERE id = ?`,
    )
    .run(a.nom, a.type_id, a.places_disponibles, a.description, a.datetime_debut, a.duree, id);
}

/** Supprime une activité (ses réservations sont supprimées en cascade) */
export function supprimerActivite(id: number): void {
  getDb().prepare("DELETE FROM activites WHERE id = ?").run(id);
}
