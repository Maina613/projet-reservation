import type { Metadata } from "next";
import Link from "next/link";
import CarteActivite from "@/components/CarteActivite";
import { getActivites, getTypes } from "@/lib/data/activites";

export const metadata: Metadata = {
  title: "Les activités",
  description: "Consultez toutes les activités du parc, recherchez celle qui vous plait et choisissez votre date.",
};

/** Construit l'URL de la liste avec la recherche et le type choisis (sans les paramètres vides) */
function urlActivites(recherche: string, typeId?: number): string {
  const params = new URLSearchParams();
  if (recherche) params.set("q", recherche);
  if (typeId) params.set("type", String(typeId));
  const texte = params.toString();
  return texte ? `/activites?${texte}` : "/activites";
}

/**
 * Liste des activités, accessible à tout le monde (connecté ou non).
 * La recherche passe par l'URL (?q=...&type=...), comme ça on peut partager
 * le lien d'une recherche et le bouton retour du navigateur fonctionne.
 * Tout marche sans JavaScript : la recherche est un formulaire GET et les types sont des liens.
 */
export default async function PageActivites({ searchParams }: PageProps<"/activites">) {
  const { q, type } = await searchParams;
  const recherche = typeof q === "string" ? q.trim() : "";
  const typeId = typeof type === "string" && /^\d+$/.test(type) ? Number(type) : undefined;

  const types = getTypes();
  // Toutes les activités qui correspondent au texte cherché, pour compter combien il y en a par type
  const correspondantes = getActivites({ recherche });
  const activites = typeId ? correspondantes.filter((a) => a.type_id === typeId) : correspondantes;
  const nombreParType = (id: number) => correspondantes.filter((a) => a.type_id === id).length;

  // Style d'une pastille de type, selon qu'elle est sélectionnée ou non
  const pastille = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-kaki-700 bg-kaki-700 text-white"
        : "border-stone-300 text-stone-700 hover:border-stone-500 hover:text-stone-900"
    }`;

  return (
    <div className="conteneur py-12">
      <p className="text-sm font-medium text-stone-500">
        {correspondantes.length} activité{correspondantes.length > 1 ? "s" : ""} au programme
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        Trouvez votre prochaine aventure
      </h1>

      {/* Recherche par nom : une seule ligne soulignée, on valide avec Entrée ou la flèche */}
      <form action="/activites" role="search" className="mt-8">
        {typeId && <input type="hidden" name="type" value={typeId} />}
        <label htmlFor="q" className="sr-only">
          Rechercher une activité par nom
        </label>
        <div className="flex items-center gap-3 border-b border-stone-900 pb-2 focus-within:border-kaki-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="h-5 w-5 shrink-0 text-stone-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={recherche}
            placeholder="Canoë, escalade, yoga..."
            className="w-full min-w-0 bg-transparent text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Rechercher"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kaki-600 text-white transition hover:bg-kaki-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>

      {/* Filtre par type : des pastilles cliquables avec le nombre d'activités de chaque type */}
      <nav aria-label="Filtrer par type d'activité" className="mt-6 flex flex-wrap gap-2">
        <Link href={urlActivites(recherche)} className={pastille(!typeId)} aria-current={!typeId ? "page" : undefined}>
          Tout <span className="tabular-nums opacity-60">{correspondantes.length}</span>
        </Link>
        {types.map((t) => (
          <Link
            key={t.id}
            href={urlActivites(recherche, t.id)}
            className={pastille(typeId === t.id)}
            aria-current={typeId === t.id ? "page" : undefined}
          >
            {t.nom} <span className="tabular-nums opacity-60">{nombreParType(t.id)}</span>
          </Link>
        ))}
      </nav>

      {recherche !== "" && (
        <p className="mt-8 text-sm text-stone-500" aria-live="polite">
          {activites.length} résultat{activites.length > 1 ? "s" : ""} pour « {recherche} » ·{" "}
          <Link href={urlActivites("", typeId)} className="font-medium text-stone-900 underline underline-offset-4">
            effacer la recherche
          </Link>
        </p>
      )}

      {activites.length === 0 ? (
        <div className="mt-10 border-t border-stone-200 pt-10">
          <p className="text-2xl font-semibold text-stone-900">Rien par ici...</p>
          <p className="mt-2 text-stone-600">Essayez avec un autre mot ou un autre type d&apos;activité.</p>
          <Link href="/activites" className="btn btn-principal mt-6">
            Voir toutes les activités
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activites.map((activite) => (
            <CarteActivite key={activite.id} activite={activite} />
          ))}
        </div>
      )}
    </div>
  );
}
