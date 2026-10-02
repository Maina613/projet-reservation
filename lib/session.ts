import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSION, DUREE_SESSION, signerSession, verifierSession } from "@/lib/jwt";
import { getUserById } from "@/lib/data/users";
import type { UserPublic } from "@/lib/types";

/**
 * Gestion de la session côté serveur (cookie httpOnly + vérifications d'accès).
 */

/** Crée le cookie de session après une connexion ou une inscription */
export async function creerSession(user: UserPublic): Promise<void> {
  const jeton = await signerSession({ userId: user.id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSION, jeton, {
    httpOnly: true, // le cookie n'est pas lisible en JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION,
  });
}

/** Supprime le cookie de session (déconnexion) */
export async function supprimerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSION);
}

/**
 * Renvoie l'utilisateur connecté, ou null.
 * On relit l'utilisateur dans la base à chaque fois, comme ça si le compte a été
 * supprimer la session ne marche plus. `cache` évite de refaire la requête
 * plusieurs fois pendant le même rendu.
 */
export const getUtilisateurConnecte = cache(async (): Promise<UserPublic | null> => {
  const cookieStore = await cookies();
  const session = await verifierSession(cookieStore.get(COOKIE_SESSION)?.value);
  if (!session) return null;
  return getUserById(session.userId) ?? null;
});

/** A utiliser sur les pages réservées aux utilisateurs connectés */
export async function exigerUtilisateur(): Promise<UserPublic> {
  const user = await getUtilisateurConnecte();
  if (!user) redirect("/connexion");
  return user;
}

/** A utiliser sur les pages réservées aux administrateurs */
export async function exigerAdmin(): Promise<UserPublic> {
  const user = await exigerUtilisateur();
  if (user.role !== "admin") redirect("/?message=acces-refuse");
  return user;
}
