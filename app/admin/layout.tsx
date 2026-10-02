import type { Metadata } from "next";
import Link from "next/link";
import { exigerAdmin } from "@/lib/session";

export const metadata: Metadata = {
  // Les pages d'administration ne doivent pas être référencées par les moteurs de recherche
  robots: { index: false, follow: false },
};

/** Mise en page de l'espace d'administration, avec son propre sous-menu */
export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  await exigerAdmin();

  return (
    <div className="conteneur py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <p className="text-sm font-medium text-stone-500">
          Administration
        </p>
        <nav aria-label="Navigation de l'administration" className="flex gap-2">
          <Link href="/admin" className="btn btn-secondaire py-2">
            Tableau de bord
          </Link>
          <Link href="/admin/activites" className="btn btn-secondaire py-2">
            Activités
          </Link>
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
