import type { Metadata } from "next";
import Link from "next/link";
import Alerte from "@/components/Alerte";
import BoutonConfirmation from "@/components/BoutonConfirmation";
import { supprimerActivite } from "@/lib/actions/activites";
import { getActivites } from "@/lib/data/activites";
import { compterReservationsAVenirParActivite } from "@/lib/data/reservations";
import { formaterDateCourte, formaterDuree } from "@/lib/format";
import { heureDe } from "@/lib/seances";
import { exigerAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Gestion des activités",
  description: "Créez, modifiez et supprimez les activités du parc.",
};

/** Messages de confirmation affichés après une action (passés dans l'URL) */
const MESSAGES: Record<string, string> = {
  creee: "L'activité a bien été créée.",
  modifiee: "L'activité a bien été modifiée.",
  supprimee: "L'activité a bien été supprimée.",
};

/** Liste de toutes les activités avec les actions d'administration */
export default async function PageAdminActivites({ searchParams }: PageProps<"/admin/activites">) {
  await exigerAdmin();
  const { message } = await searchParams;
  const confirmation = typeof message === "string" ? MESSAGES[message] : undefined;
  const activites = getActivites();
  const reservationsAVenir = compterReservationsAVenirParActivite();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titre-page">Gestion des activités</h1>
        <Link href="/admin/activites/nouvelle" className="btn btn-principal">
          + Nouvelle activité
        </Link>
      </div>

      {confirmation && (
        <div className="mt-6">
          <Alerte type="succes">{confirmation}</Alerte>
        </div>
      )}

      {activites.length === 0 ? (
        <div className="carte mt-6 p-10 text-center text-stone-600">
          Aucune activité pour le moment. Créez la première !
        </div>
      ) : (
        <div className="carte mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Activité</th>
                <th scope="col" className="px-4 py-3 font-semibold">Séances</th>
                <th scope="col" className="px-4 py-3 font-semibold">Durée</th>
                <th scope="col" className="px-4 py-3 font-semibold">Places / séance</th>
                <th scope="col" className="px-4 py-3 font-semibold">Réservations à venir</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activites.map((activite) => (
                <tr key={activite.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/activites/${activite.id}`}
                      className="font-semibold text-stone-900 hover:text-kaki-700 hover:underline"
                    >
                      {activite.nom}
                    </Link>
                    <p className="text-xs text-stone-500">{activite.type_nom}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                    Tous les jours à {heureDe(activite.datetime_debut)}
                    <p className="text-xs text-stone-500">
                      depuis le {formaterDateCourte(activite.datetime_debut).slice(0, 10)}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                    {formaterDuree(activite.duree)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                    {activite.places_disponibles}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                    {reservationsAVenir[activite.id] ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/activites/${activite.id}/modifier`}
                        className="btn btn-secondaire py-1.5"
                      >
                        Modifier
                      </Link>
                      <BoutonConfirmation
                        action={supprimerActivite.bind(null, activite.id)}
                        question={`Supprimer l'activité « ${activite.nom} » ? Les réservations associées seront aussi supprimées.`}
                        className="btn btn-danger py-1.5"
                      >
                        Supprimer
                      </BoutonConfirmation>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
