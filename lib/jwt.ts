import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/types";

/**
 * Création et vérification du jeton de session (JWT).
 * Ce fichier est séparé de session.ts car il est aussi utilisé par proxy.ts.
 */

/** Nom du cookie qui contient la session */
export const COOKIE_SESSION = "session";

/** Durée de vie de la session : 7 jours (en secondes) */
export const DUREE_SESSION = 60 * 60 * 24 * 7;

/** Ce qu'on stocke dans le jeton */
export interface SessionPayload {
  userId: number;
  role: Role;
}

// En production il faut définir SESSION_SECRET dans le fichier .env.local
const cle = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "cle-de-developpement-a-remplacer-en-production",
);

/** Signe le contenu de la session et renvoie le jeton */
export async function signerSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DUREE_SESSION}s`)
    .sign(cle);
}

/** Vérifie le jeton. Renvoie null si il est absent, invalide ou expiré. */
export async function verifierSession(jeton: string | undefined): Promise<SessionPayload | null> {
  if (!jeton) return null;
  try {
    const { payload } = await jwtVerify(jeton, cle, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number") return null;
    return { userId: payload.userId, role: payload.role === "admin" ? "admin" : "user" };
  } catch {
    return null;
  }
}
