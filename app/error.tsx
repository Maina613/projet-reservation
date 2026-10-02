"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Page affichée si une erreur imprévue arrive pendant l'affichage d'une page
 * (par exemple si la base de données ne répond pas).
 * Ça évite d'avoir l'écran d'erreur par défaut de Next.js.
 */
export default function PageErreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // On garde une trace de l'erreur dans la console pour pouvoir la corriger
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="conteneur flex flex-col items-center py-24 text-center">
      <title>Une erreur est survenue | Grand Air</title>
      <p className="text-8xl font-bold text-kaki-600">Oups</p>
      <h1 className="mt-6 text-4xl font-bold text-stone-900">Une erreur est survenue</h1>
      <p className="mt-4 max-w-md text-stone-600">
        Quelque chose s&apos;est mal passé de notre côté. Vous pouvez réessayer, ou revenir à
        l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-principal">
          Réessayer
        </button>
        <Link href="/" className="btn btn-secondaire">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
