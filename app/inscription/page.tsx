import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormulaireInscription from "@/components/FormulaireInscription";
import { getUtilisateurConnecte } from "@/lib/session";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte pour réserver des activités et suivre vos réservations.",
};

/** Page d'inscription */
export default async function PageInscription() {
  // Pas besoin de s'inscrire si on est déjà connecté
  if (await getUtilisateurConnecte()) redirect("/activites");

  return (
    <div className="conteneur py-12">
      <div className="carte mx-auto max-w-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-stone-900">Créer un compte</h1>
        <p className="mt-1 mb-6 text-sm text-stone-600">
          Quelques informations et vous pourrez réserver vos activités.
        </p>
        <FormulaireInscription />
        <p className="mt-6 text-center text-sm text-stone-600">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-kaki-700 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
