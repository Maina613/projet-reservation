import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormulaireConnexion from "@/components/FormulaireConnexion";
import { getUtilisateurConnecte } from "@/lib/session";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte pour réserver et gérer vos activités.",
};

/** Page de connexion */
export default async function PageConnexion({ searchParams }: PageProps<"/connexion">) {
  if (await getUtilisateurConnecte()) redirect("/activites");

  // Page demandée avant d'arriver ici (ex : /activites/3), pour y retourner après la connexion
  const { suite } = await searchParams;

  return (
    <div className="conteneur py-12">
      <div className="carte mx-auto max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-stone-900">Connexion</h1>
        <p className="mt-1 mb-6 text-sm text-stone-600">Content de vous revoir !</p>
        <FormulaireConnexion suite={typeof suite === "string" ? suite : ""} />
        <p className="mt-6 text-center text-sm text-stone-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-kaki-700 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
