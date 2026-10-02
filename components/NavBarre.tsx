"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconeFeuille from "@/components/IconeFeuille";
import { deconnexion } from "@/lib/actions/auth";
import type { UserPublic } from "@/lib/types";

interface NavBarreProps {
  /** Utilisateur connecté (null si visiteur) */
  user: UserPublic | null;
  /** Texte du logo */
  logo: string;
  /** Nom complet du parc (lu par les lecteurs d'écran) */
  nomDuParc: string;
}

/**
 * Barre de navigation.
 * Sur l'accueil elle est transparente et se fond dans la photo, puis elle devient
 * blanche quand on descend dans la page (sinon le texte blanc ne se lirait plus).
 * Sur les autres pages elle est blanche tout le temps (et cachée sur la page 404).
 */
export default function NavBarre({ user, logo, nomDuParc }: NavBarreProps) {
  const surPhoto = usePathname() === "/";
  const [defile, setDefile] = useState(false);

  // On écoute le scroll pour savoir si on a quitté le haut de la page
  useEffect(() => {
    const surScroll = () => setDefile(window.scrollY > 40);
    surScroll();
    window.addEventListener("scroll", surScroll, { passive: true });
    return () => window.removeEventListener("scroll", surScroll);
  }, []);

  const transparente = surPhoto && !defile;

  // Les couleurs changent selon que la barre est transparente ou blanche
  const lien = transparente ? "text-white/85 hover:text-white" : "text-stone-600 hover:text-stone-900";

  return (
    <header
      className={`inset-x-0 top-0 z-20 transition-colors duration-300 ${surPhoto ? "fixed" : "sticky"} ${
        transparente ? "bg-transparent" : "border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur"
      }`}
    >
      {/*
        Le nom du parc à gauche, tous les liens et les boutons regroupés à droite.
        La barre est plus large que le contenu des pages pour qu'ils soient près des bords.
      */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8 lg:px-12">
        {/* Logo : une petite feuille + le nom dans une police arrondie (Fredoka) */}
        <Link
          href="/"
          aria-label={`${nomDuParc} - accueil`}
          className={`font-logo flex items-center gap-2 text-2xl leading-none ${
            transparente ? "text-white" : "text-kaki-700"
          }`}
        >
          <IconeFeuille />
          {logo}
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/activites" className={`transition ${lien}`}>
              Activités
            </Link>
            {user && (
              <Link href="/reservations" className={`transition ${lien}`}>
                Mes réservations
              </Link>
            )}
            {/* Le lien vers l'administration n'est visible que pour les admins */}
            {user?.role === "admin" && (
              <Link href="/admin" className={`transition ${lien}`}>
                Administration
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 whitespace-nowrap">
            {user ? (
              <>
                {/* Icône de profil (le prénom reste lu par les lecteurs d'écran et en info-bulle) */}
                <Link
                  href="/profil"
                  title={`Mon profil (${user.prenom})`}
                  aria-label={`Mon profil (${user.prenom})`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    transparente
                      ? "border-white/50 text-white hover:bg-white/10"
                      : "border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
                  </svg>
                </Link>
                <form action={deconnexion}>
                  <button
                    type="submit"
                    className={`btn py-2 ${
                      transparente ? "border border-white/50 text-white hover:bg-white/10" : "btn-secondaire"
                    }`}
                  >
                    Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/connexion" className={`transition ${lien}`}>
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className={`btn py-2 ${
                    transparente ? "bg-white text-stone-900 hover:bg-stone-100" : "btn-principal"
                  }`}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
