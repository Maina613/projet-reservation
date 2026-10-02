import type { Metadata } from "next";
import Alerte from "@/components/Alerte";
import BoutonConfirmation from "@/components/BoutonConfirmation";
import FormulaireProfil from "@/components/FormulaireProfil";
import { supprimerProfil } from "@/lib/actions/profil";
import { exigerUtilisateur } from "@/lib/session";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Modifiez vos informations personnelles ou supprimez votre compte.",
};

/** Page profil : modification des informations et suppression du compte */
export default async function PageProfil({ searchParams }: PageProps<"/profil">) {
  const user = await exigerUtilisateur();
  const { erreur } = await searchParams;

  return (
    <div className="conteneur max-w-3xl py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titre-page">Mon profil</h1>
        {user.role === "admin" && (
          <span className="badge bg-kaki-100 text-kaki-800">Administrateur</span>
        )}
      </div>

      <section className="carte mt-6 p-6 sm:p-8" aria-labelledby="titre-infos">
        <h2 id="titre-infos" className="mb-4 text-lg font-semibold text-stone-900">
          Mes informations
        </h2>
        <FormulaireProfil user={user} />
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6 sm:p-8" aria-labelledby="titre-danger">
        <h2 id="titre-danger" className="text-lg font-semibold text-red-700">
          Supprimer mon compte
        </h2>
        <p className="mt-1 mb-4 text-sm text-stone-600">
          Cette action est définitive : votre compte et toutes vos réservations seront supprimés.
        </p>
        {erreur === "dernier-admin" && (
          <div className="mb-4">
            <Alerte type="erreur">
              Vous êtes le seul administrateur, votre compte ne peut pas être supprimé.
            </Alerte>
          </div>
        )}
        <BoutonConfirmation
          action={supprimerProfil}
          question="Voulez-vous vraiment supprimer votre compte ? Cette action est définitive."
        >
          Supprimer définitivement mon compte
        </BoutonConfirmation>
      </section>
    </div>
  );
}
