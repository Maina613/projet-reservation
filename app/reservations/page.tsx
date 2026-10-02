import type { Metadata } from "next";
import Link from "next/link";
import BoutonAnnuler from "@/components/BoutonAnnuler";
import { getReservationsDeUser } from "@/lib/data/reservations";
import { estPassee, formaterDateHeure, formaterDuree } from "@/lib/format";
import { exigerUtilisateur } from "@/lib/session";
import type { ReservationDetail } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Retrouvez toutes vos réservations d'activités et annulez-les si besoin.",
};

/** Une ligne de la liste des réservations */
function LigneReservation({ reservation, aVenir }: { reservation: ReservationDetail; aVenir: boolean }) {
  return (
    <li className="carte flex flex-wrap items-center gap-4 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <Link
          href={`/activites/${reservation.activite_id}`}
          className="font-semibold text-stone-900 hover:text-kaki-700 hover:underline"
        >
          {reservation.activite_nom}
        </Link>
        <p className="text-sm text-stone-600 first-letter:uppercase">
          {formaterDateHeure(reservation.date_reservation)}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {reservation.type_nom} · {formaterDuree(reservation.duree)}
        </p>
      </div>

      {/* Le bouton annuler n'est proposé que pour les réservations actives et à venir */}
      {aVenir ? (
        <BoutonAnnuler reservationId={reservation.id} />
      ) : reservation.etat ? (
        <span className="badge bg-stone-100 text-stone-600">Terminée</span>
      ) : (
        <span className="badge bg-red-100 text-red-700">Annulée</span>
      )}
    </li>
  );
}

/** Page "Mes réservations" : les réservations à venir puis l'historique */
export default async function PageReservations() {
  const user = await exigerUtilisateur();
  const reservations = getReservationsDeUser(user.id);

  // On sépare les réservations actives à venir du reste (passées ou annulées)
  // (date_reservation = date et heure de la séance réservée)
  const aVenir = reservations.filter((r) => r.etat && !estPassee(r.date_reservation));
  const historique = reservations.filter((r) => !r.etat || estPassee(r.date_reservation)).reverse();

  return (
    <div className="conteneur max-w-3xl py-10">
      <h1 className="titre-page">Mes réservations</h1>

      <section className="mt-8" aria-labelledby="titre-a-venir">
        <h2 id="titre-a-venir" className="text-lg font-semibold text-stone-900">
          À venir ({aVenir.length})
        </h2>
        {aVenir.length === 0 ? (
          <div className="carte mt-3 p-8 text-center">
            <p className="text-stone-600">Vous n&apos;avez aucune réservation à venir.</p>
            <Link href="/activites" className="btn btn-principal mt-4">
              Découvrir les activités
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {aVenir.map((reservation) => (
              <LigneReservation key={reservation.id} reservation={reservation} aVenir />
            ))}
          </ul>
        )}
      </section>

      {historique.length > 0 && (
        <section className="mt-10" aria-labelledby="titre-historique">
          <h2 id="titre-historique" className="text-lg font-semibold text-stone-900">
            Historique ({historique.length})
          </h2>
          <ul className="mt-3 space-y-3 opacity-80">
            {historique.map((reservation) => (
              <LigneReservation key={reservation.id} reservation={reservation} aVenir={false} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
