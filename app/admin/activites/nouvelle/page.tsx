import type { Metadata } from "next";
import FormulaireActivite from "@/components/FormulaireActivite";
import { getTypes } from "@/lib/data/activites";
import { exigerAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Nouvelle activité",
  description: "Ajoutez une nouvelle activité au programme du parc.",
};

/** Page de création d'une activité (admin) */
export default async function PageNouvelleActivite() {
  await exigerAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="titre-page">Nouvelle activité</h1>
      <div className="carte mt-6 p-6 sm:p-8">
        <FormulaireActivite types={getTypes()} />
      </div>
    </div>
  );
}
