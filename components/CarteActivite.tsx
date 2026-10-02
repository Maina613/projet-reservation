import Image from "next/image";
import Link from "next/link";
import { formaterDuree } from "@/lib/format";
import { photoDeLActivite } from "@/lib/images";
import { heureDe } from "@/lib/seances";
import { typographie } from "@/lib/typographie";
import type { ActiviteDetail } from "@/lib/types";

/**
 * Carte d'une activité au format portrait : la photo prend toute la carte,
 * le nom et l'horaire sont écrits par dessus en haut, et une flèche en bas
 * à droite invite à cliquer. Toute la carte est cliquable.
 */
export default function CarteActivite({ activite }: { activite: ActiviteDetail }) {
  return (
    <Link
      href={`/activites/${activite.id}`}
      className="group relative isolate block aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-sm transition-[transform,box-shadow] duration-300 ease-(--ease-sortie) hover:shadow-lg motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kaki-600"
    >
      <Image
        src={photoDeLActivite(activite)}
        alt=""
        fill
        placeholder="blur"
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="-z-10 object-cover transition-transform duration-500 ease-(--ease-sortie) motion-safe:group-hover:scale-105"
      />
      {/* Dégradés sombres en haut et en bas pour que le texte blanc reste lisible */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-transparent to-black/40"
        aria-hidden="true"
      />

      <div className="p-4">
        <h3 className="text-lg leading-tight font-semibold text-white">{typographie(activite.nom)}</h3>
        <p className="mt-1 text-sm text-white/85">
          Tous les jours à {heureDe(activite.datetime_debut)} · {formaterDuree(activite.duree)}
        </p>
      </div>

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
        <span className="badge bg-white/90 text-stone-800 backdrop-blur">{activite.type_nom}</span>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-lg text-white backdrop-blur transition group-hover:bg-white group-hover:text-stone-900"
          aria-hidden="true"
        >
          ↗
        </span>
      </div>
    </Link>
  );
}
