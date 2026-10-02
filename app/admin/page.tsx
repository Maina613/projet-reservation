import type { Metadata } from "next";
import { getStatistiques } from "@/lib/data/reservations";
import { formaterDateCourte } from "@/lib/format";
import { exigerAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Statistiques du parc : utilisateurs, activités et réservations.",
};

/** Une tuile avec un chiffre clé */
function Tuile({ libelle, valeur, detail }: { libelle: string; valeur: string | number; detail?: string }) {
  return (
    <div className="carte p-5">
      <p className="text-sm text-stone-500">{libelle}</p>
      <p className="mt-1 text-3xl font-bold text-stone-900 tabular-nums">{valeur}</p>
      {detail && <p className="mt-1 text-xs text-stone-500">{detail}</p>}
    </div>
  );
}

/** Barre horizontale proportionnelle à une valeur (entre 0 et max) */
function Barre({ valeur, max }: { valeur: number; max: number }) {
  const largeur = max > 0 ? Math.round((valeur / max) * 100) : 0;
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
      <div className="h-full rounded-full bg-kaki-500" style={{ width: `${largeur}%` }} />
    </div>
  );
}

/** Tableau de bord administrateur (bonus) : statistiques sur le parc */
export default async function PageTableauDeBord() {
  // Le layout vérifie déjà le rôle mais on le refait ici par sécurité
  await exigerAdmin();
  const stats = getStatistiques();
  const maxTop = Math.max(...stats.topActivites.map((a) => a.reservations), 0);
  const maxParType = Math.max(...stats.parType.map((t) => t.reservations), 0);

  return (
    <>
      <h1 className="titre-page">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tuile libelle="Utilisateurs inscrits" valeur={stats.nbUtilisateurs} />
        <Tuile libelle="Activités" valeur={stats.nbActivites} />
        <Tuile
          libelle="Réservations actives"
          valeur={stats.nbReservationsActives}
          detail={`dont ${stats.nbReservationsAVenir} à venir, ${stats.nbReservationsAnnulees} annulée(s)`}
        />
        <Tuile
          libelle="Taux de remplissage"
          valeur={`${stats.tauxRemplissage} %`}
          detail="des séances à venir déjà réservées"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="carte p-6" aria-labelledby="titre-top">
          <h2 id="titre-top" className="text-lg font-semibold text-stone-900">
            Activités les plus réservées
          </h2>
          <ul className="mt-4 space-y-3">
            {stats.topActivites.map((activite) => (
              <li key={activite.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="truncate text-stone-800">{activite.nom}</span>
                  <span className="shrink-0 text-stone-500">
                    {activite.reservations} réservation{activite.reservations > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-1 flex">
                  <Barre valeur={activite.reservations} max={maxTop} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="carte p-6" aria-labelledby="titre-types">
          <h2 id="titre-types" className="text-lg font-semibold text-stone-900">
            Réservations par type d&apos;activité
          </h2>
          <ul className="mt-4 space-y-3">
            {stats.parType.map((type) => (
              <li key={type.nom} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-stone-800">{type.nom}</span>
                <Barre valeur={type.reservations} max={maxParType} />
                <span className="w-6 shrink-0 text-right text-stone-500">{type.reservations}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="carte mt-6 p-6" aria-labelledby="titre-dernieres">
        <h2 id="titre-dernieres" className="text-lg font-semibold text-stone-900">
          Dernières réservations
        </h2>
        {stats.dernieresReservations.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">Aucune réservation pour le moment.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-stone-500 uppercase">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-semibold">Utilisateur</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Activité</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Séance</th>
                  <th scope="col" className="py-2 font-semibold">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.dernieresReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="py-2.5 pr-4 text-stone-900">
                      {reservation.prenom} {reservation.nom}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-700">{reservation.activite_nom}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-stone-600">
                      {formaterDateCourte(reservation.date_reservation)}
                    </td>
                    <td className="py-2.5">
                      {reservation.etat ? (
                        <span className="badge bg-kaki-100 text-kaki-800">Active</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">Annulée</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
