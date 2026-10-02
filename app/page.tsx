import Image from "next/image";
import Link from "next/link";
import photoForet from "@/public/foret.jpg";
import Alerte from "@/components/Alerte";
import AvisClients from "@/components/AvisClients";
import CarteActivite from "@/components/CarteActivite";
import EtapesReservation from "@/components/EtapesReservation";
import { getActivites } from "@/lib/data/activites";

/** Messages qui peuvent être affichés en haut de l'accueil après une redirection */
const MESSAGES: Record<string, { type: "succes" | "erreur"; texte: string }> = {
  "acces-refuse": {
    type: "erreur",
    texte: "Accès refusé : cette page est réservée aux administrateurs.",
  },
  "compte-supprime": { type: "succes", texte: "Votre compte a bien été supprimé. À bientôt !" },
};

/** Page d'accueil : présentation du parc et prochaines activités */
export default async function PageAccueil({ searchParams }: PageProps<"/">) {
  const { message } = await searchParams;
  const alerte = typeof message === "string" ? MESSAGES[message] : undefined;
  const prochaines = getActivites({ limite: 4 });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-stone-900 text-white">
        {/* Image de fond + voile sombre par dessus pour que le texte reste lisible */}
        <Image
          src={photoForet}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/50 to-black/25" aria-hidden="true" />
        {/* Dégradé en haut pour que les liens de la navbar restent lisibles */}
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-black/50 to-transparent" aria-hidden="true" />
        {/* Grand padding en haut car la barre de navigation est posée par dessus l'image */}
        <div className="conteneur pt-40 pb-24 sm:pt-48 sm:pb-32">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Vivez l’aventure en pleine nature
          </h1>
          <p className="mt-4 max-w-xl text-lg text-kaki-50">
            Accrobranche, escalade, canoë, tir à l’arc… Réservez vos activités en ligne et
            retrouvez toutes vos réservations au même endroit.
          </p>
          {/* Une seule action principale : "Créer un compte" et "Mes réservations" sont déjà dans la barre */}
          <Link href="/activites" className="btn mt-8 bg-white px-6 py-3 text-base text-kaki-800 hover:bg-kaki-50">
            Voir les activités
          </Link>
        </div>
      </section>

      <div className="conteneur">
        {alerte && (
          <div className="mt-6">
            <Alerte type={alerte.type}>{alerte.texte}</Alerte>
          </div>
        )}

        <section className="mt-12" aria-labelledby="titre-prochaines">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="titre-prochaines" className="text-2xl font-bold text-stone-900">
              Prochaines activités
            </h2>
            <Link
              href="/activites"
              className="text-sm font-semibold text-kaki-700 underline decoration-kaki-300 underline-offset-4 hover:decoration-kaki-700"
            >
              Toutes les activités
            </Link>
          </div>

          {prochaines.length === 0 ? (
            <p className="mt-6 text-stone-600">Aucune activité n&apos;est prévue pour le moment.</p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {prochaines.map((activite) => (
                <CarteActivite key={activite.id} activite={activite} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-16">
          <EtapesReservation />
        </div>

        <div className="mt-16">
          <AvisClients />
        </div>
      </div>
    </>
  );
}
