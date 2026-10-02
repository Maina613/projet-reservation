import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CalendrierReservation from "@/components/CalendrierReservation";
import { getActiviteById } from "@/lib/data/activites";
import { getJoursReservesParUser, getPlacesPrisesParJour } from "@/lib/data/reservations";
import { formaterDuree, maintenant } from "@/lib/format";
import { photoDeLActivite } from "@/lib/images";
import { fenetreDeReservation, heureDe, texteHoraires } from "@/lib/seances";
import { getUtilisateurConnecte } from "@/lib/session";
import { typographie } from "@/lib/typographie";
import type { ActiviteDetail } from "@/lib/types";

/** Récupère l'activité à partir du paramètre d'URL, ou undefined si l'id n'est pas bon */
function chargerActivite(id: string): ActiviteDetail | undefined {
  // L'id doit être un nombre entier, sinon c'est forcément une mauvaise URL
  if (!/^\d+$/.test(id)) return undefined;
  return getActiviteById(Number(id));
}

/** Le titre et la description de la page dépendent de l'activité affichée */
export async function generateMetadata({ params }: PageProps<"/activites/[id]">): Promise<Metadata> {
  const { id } = await params;
  const activite = chargerActivite(id);
  if (!activite) return { title: "Activité introuvable" };

  return {
    title: activite.nom,
    description: activite.description.slice(0, 155),
  };
}

/** Page détail d'une activité, avec le calendrier de réservation */
export default async function PageDetailActivite({ params }: PageProps<"/activites/[id]">) {
  const { id } = await params;
  const activite = chargerActivite(id);
  if (!activite) notFound();

  const user = await getUtilisateurConnecte();
  const maintenantTexte = maintenant();
  const { min, max } = fenetreDeReservation(activite.datetime_debut, maintenantTexte);

  return (
    <div className="conteneur py-10">
      <Link href="/activites" className="text-sm font-semibold text-kaki-700 hover:underline">
        ← Retour aux activités
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <article className="carte overflow-hidden lg:col-span-2">
          <div className="relative aspect-[16/9] bg-stone-200">
            <Image
              src={photoDeLActivite(activite)}
              alt=""
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 sm:p-8">
            <span className="badge bg-stone-100 text-stone-700">{activite.type_nom}</span>
            <h1 className="titre-page mt-3">{typographie(activite.nom)}</h1>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-stone-500">Horaires</dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {texteHoraires(activite.datetime_debut, maintenantTexte)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Durée</dt>
                <dd className="mt-1 text-sm text-stone-900">{formaterDuree(activite.duree)}</dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">
                  Capacité
                </dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {activite.places_disponibles} places par séance
                </dd>
              </div>
            </dl>

            <h2 className="mt-8 text-lg font-semibold text-stone-900">Description</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-stone-700">
              {typographie(activite.description)}
            </p>
          </div>
        </article>

        <aside className="carte h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-stone-900">Choisir une date</h2>
          <CalendrierReservation
            activiteId={activite.id}
            min={min}
            max={max}
            heure={heureDe(activite.datetime_debut)}
            placesParSeance={activite.places_disponibles}
            prises={getPlacesPrisesParJour(activite.id)}
            mesJours={user ? getJoursReservesParUser(user.id, activite.id) : []}
            connecte={user !== null}
          />
        </aside>
      </div>
    </div>
  );
}
