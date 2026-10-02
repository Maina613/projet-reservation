import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import photoForet404 from "@/public/foret-404.jpg";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

/**
 * Page 404 : affichée pour toutes les URL qui n'existent pas.
 * Elle prend tout l'écran avec une photo de forêt sombre en fond, sans barre de
 * navigation (elle est cachée grâce à l'attribut data-sans-navbar, voir globals.css).
 */
export default function PageIntrouvable() {
  return (
    <section
      className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-stone-900 px-4 text-center text-white"
      data-sans-navbar
    >
      <Image src={photoForet404} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-10 object-cover" />
      {/* Voile sombre pour que le texte reste lisible */}
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />

      <div className="flex flex-col items-center">
        <p className="text-lg text-white/80">Oups, c&apos;est embarrassant...</p>

        <h1 className="mt-2 text-[7rem] leading-none font-bold sm:text-[10rem]">404</h1>

        <p className="mt-6 max-w-md text-lg text-white/85">
          Vous vous êtes perdu dans la forêt ? Pas de panique, on vous ramène sur le bon chemin.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-principal px-8">
            Retour à l&apos;accueil
          </Link>
          <Link href="/activites" className="btn border border-white/50 text-white hover:bg-white/10">
            Voir les activités
          </Link>
        </div>
      </div>
    </section>
  );
}
