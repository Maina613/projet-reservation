import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FormulaireActivite from "@/components/FormulaireActivite";
import { getActiviteById, getTypes } from "@/lib/data/activites";
import { exigerAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Modifier une activité",
  description: "Modifiez les informations d'une activité du parc.",
};

/** Page de modification d'une activité (admin) */
export default async function PageModifierActivite({
  params,
}: PageProps<"/admin/activites/[id]/modifier">) {
  await exigerAdmin();

  const { id } = await params;
  const activite = /^\d+$/.test(id) ? getActiviteById(Number(id)) : undefined;
  // Si l'activité n'existe pas on affiche la page 404
  if (!activite) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="titre-page">Modifier « {activite.nom} »</h1>
      <div className="carte mt-6 p-6 sm:p-8">
        <FormulaireActivite types={getTypes()} activite={activite} />
      </div>
    </div>
  );
}
