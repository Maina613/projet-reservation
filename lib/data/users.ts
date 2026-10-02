import "server-only";
import { getDb, lireUne } from "@/lib/db";
import type { User, UserPublic } from "@/lib/types";

/**
 * Requêtes SQL sur la table `users`.
 */

/** Cherche un utilisateur par son email (avec le mot de passe, pour la connexion) */
export function getUserByEmail(email: string): User | undefined {
  return lireUne<User>("SELECT * FROM users WHERE email = ?", email);
}

/** Cherche un utilisateur par son id, sans le mot de passe */
export function getUserById(id: number): UserPublic | undefined {
  return lireUne<UserPublic>("SELECT id, prenom, nom, email, role FROM users WHERE id = ?", id);
}

/** Renvoie le mot de passe haché d'un utilisateur */
export function getMotDePasse(id: number): string | undefined {
  return lireUne<{ motdepasse: string }>("SELECT motdepasse FROM users WHERE id = ?", id)?.motdepasse;
}

/** Crée un utilisateur (rôle "user" par défaut) et renvoie son id */
export function creerUser(prenom: string, nom: string, email: string, hash: string): number {
  const resultat = getDb()
    .prepare("INSERT INTO users (prenom, nom, email, motdepasse) VALUES (?, ?, ?, ?)")
    .run(prenom, nom, email, hash);
  return Number(resultat.lastInsertRowid);
}

/** Met à jour le profil. Le mot de passe n'est modifié que si un nouveau hash est donné. */
export function modifierUser(
  id: number,
  prenom: string,
  nom: string,
  email: string,
  nouveauHash?: string,
): void {
  const db = getDb();
  db.prepare("UPDATE users SET prenom = ?, nom = ?, email = ? WHERE id = ?").run(prenom, nom, email, id);
  if (nouveauHash) {
    db.prepare("UPDATE users SET motdepasse = ? WHERE id = ?").run(nouveauHash, id);
  }
}

/** Supprime un utilisateur (ses réservations sont supprimées en cascade) */
export function supprimerUser(id: number): void {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

/** Nombre d'administrateurs, pour éviter de supprimer le dernier */
export function compterAdmins(): number {
  return lireUne<{ total: number }>("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'")?.total ?? 0;
}
