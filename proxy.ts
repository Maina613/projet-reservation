import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESSION, verifierSession } from "@/lib/jwt";

/**
 * Proxy (l'ancien "middleware" de Next.js) : il s'exécute avant l'affichage des pages.
 * Il sert à rediriger rapidement les visiteurs qui n'ont pas le droit d'accéder
 * à une page. C'est une première barrière : les pages et les server actions
 * refont la vérification de leur côté avec la base de données.
 */

/** Pages accessibles seulement si on est connecté */
const PAGES_CONNECTE = ["/profil", "/reservations", "/admin"];

/** Vrai si le chemin correspond à une des pages de la liste (ou une sous-page) */
function correspond(chemin: string, pages: string[]): boolean {
  return pages.some((page) => chemin === page || chemin.startsWith(`${page}/`));
}

export async function proxy(request: NextRequest) {
  const chemin = request.nextUrl.pathname;
  const session = await verifierSession(request.cookies.get(COOKIE_SESSION)?.value);

  // Visiteur non connecté sur une page protégée -> page de connexion
  if (!session && correspond(chemin, PAGES_CONNECTE)) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("suite", chemin);
    return NextResponse.redirect(url);
  }

  // Utilisateur simple qui essaye d'aller sur l'administration -> accueil
  if (session && session.role !== "admin" && correspond(chemin, ["/admin"])) {
    return NextResponse.redirect(new URL("/?message=acces-refuse", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/reservations/:path*", "/admin/:path*"],
};
