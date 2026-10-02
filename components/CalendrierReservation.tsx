"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Alerte from "@/components/Alerte";
import BadgePlaces from "@/components/BadgePlaces";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { reserver } from "@/lib/actions/reservations";
import { formaterJour } from "@/lib/format";

interface CalendrierReservationProps {
  activiteId: number;
  /** Premier jour réservable `AAAA-MM-JJ` */
  min: string;
  /** Dernier jour réservable `AAAA-MM-JJ` */
  max: string;
  /** Heure de la séance `HH:mm` */
  heure: string;
  /** Nombre de places de chaque séance */
  placesParSeance: number;
  /** Places déjà prises, par jour */
  prises: Record<string, number>;
  /** Jours que l'utilisateur a déjà réservés */
  mesJours: string[];
  connecte: boolean;
}

const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const pad = (n: number): string => String(n).padStart(2, "0");

/** Construit la date `AAAA-MM-JJ` d'un jour du mois (mois de 0 à 11) */
const versJour = (annee: number, mois: number, jour: number): string =>
  `${annee}-${pad(mois + 1)}-${pad(jour)}`;

/**
 * Calendrier pour choisir le jour de sa séance, puis réserver.
 * Les jours hors période ou complets ne sont pas cliquables.
 */
export default function CalendrierReservation({
  activiteId,
  min,
  max,
  heure,
  placesParSeance,
  prises,
  mesJours,
  connecte,
}: CalendrierReservationProps) {
  const [etat, action] = useActionState(reserver.bind(null, activiteId), undefined);
  const [jourChoisi, setJourChoisi] = useState<string | null>(null);

  // Mois affiché : on commence sur le mois du premier jour réservable
  const [mois, setMois] = useState({ annee: Number(min.slice(0, 4)), mois: Number(min.slice(5, 7)) - 1 });

  const placesRestantes = (jour: string): number => placesParSeance - (prises[jour] ?? 0);

  // Cases du mois : des cases vides pour décaler le 1er au bon jour de la semaine (lundi en premier)
  const premierDuMois = new Date(mois.annee, mois.mois, 1);
  const decalage = (premierDuMois.getDay() + 6) % 7;
  const nbJours = new Date(mois.annee, mois.mois + 1, 0).getDate();
  const cases: (string | null)[] = [
    ...Array<null>(decalage).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => versJour(mois.annee, mois.mois, i + 1)),
  ];

  // On ne peut pas aller avant le mois du premier jour ni après celui du dernier jour
  const cleMois = versJour(mois.annee, mois.mois, 1).slice(0, 7);
  const peutReculer = cleMois > min.slice(0, 7);
  const peutAvancer = cleMois < max.slice(0, 7);

  function changerMois(ecart: number) {
    const date = new Date(mois.annee, mois.mois + ecart, 1);
    setMois({ annee: date.getFullYear(), mois: date.getMonth() });
  }

  const titreMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(premierDuMois);
  const dejaReserveCeJour = jourChoisi !== null && mesJours.includes(jourChoisi);

  return (
    <div className="space-y-4">
      {/* En-tête : mois affiché + boutons précédent / suivant */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changerMois(-1)}
          disabled={!peutReculer}
          className="btn btn-secondaire h-10 w-10 p-0"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <p className="font-semibold text-stone-900 first-letter:uppercase" aria-live="polite">
          {titreMois}
        </p>
        <button
          type="button"
          onClick={() => changerMois(1)}
          disabled={!peutAvancer}
          className="btn btn-secondaire h-10 w-10 p-0"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {JOURS_SEMAINE.map((nom) => (
          <span key={nom} className="py-1 text-xs font-medium text-stone-500">
            {nom}
          </span>
        ))}

        {cases.map((jour, index) => {
          if (jour === null) return <span key={`vide-${index}`} />;

          const horsPeriode = jour < min || jour > max;
          const complet = !horsPeriode && placesRestantes(jour) <= 0;
          const reserve = mesJours.includes(jour);
          const choisi = jour === jourChoisi;

          // Style de la case selon son état
          let style = "text-stone-800 hover:bg-kaki-50";
          if (horsPeriode) style = "cursor-not-allowed text-stone-300";
          else if (choisi) style = "bg-kaki-600 font-semibold text-white";
          else if (reserve) style = "bg-kaki-100 font-semibold text-kaki-800";
          else if (complet) style = "cursor-not-allowed bg-red-50 text-red-400 line-through";

          return (
            <button
              key={jour}
              type="button"
              disabled={horsPeriode || (complet && !reserve)}
              onClick={() => setJourChoisi(jour)}
              aria-pressed={choisi}
              aria-label={`${formaterJour(jour)}${complet ? ", complet" : ""}${reserve ? ", déjà réservé" : ""}`}
              className={`h-10 rounded-lg tabular-nums transition-[background-color,color,transform] duration-150 ease-(--ease-sortie) motion-safe:active:scale-[0.94] ${style}`}
            >
              {Number(jour.slice(8))}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-kaki-100" /> Déjà réservé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-50 ring-1 ring-red-200" /> Complet
        </span>
      </div>

      {etat?.message && <Alerte type={etat.succes ? "succes" : "erreur"}>{etat.message}</Alerte>}

      {/* Résumé du jour choisi + bouton de réservation */}
      {jourChoisi === null ? (
        <p className="rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Choisissez un jour dans le calendrier.
        </p>
      ) : (
        <div className="space-y-3 rounded-lg bg-stone-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-stone-900 first-letter:uppercase">
              {formaterJour(jourChoisi)} à {heure}
            </p>
            <BadgePlaces restantes={placesRestantes(jourChoisi)} />
          </div>

          {dejaReserveCeJour ? (
            <>
              <p className="text-sm text-kaki-800">Vous avez déjà réservé ce jour-là.</p>
              <Link href="/reservations" className="btn btn-secondaire w-full">
                Voir mes réservations
              </Link>
            </>
          ) : connecte ? (
            <form action={action}>
              <input type="hidden" name="jour" value={jourChoisi} />
              <BoutonEnvoi className="btn btn-principal w-full" texteEnCours="Réservation...">
                Réserver ma place
              </BoutonEnvoi>
            </form>
          ) : (
            <Link href={`/connexion?suite=/activites/${activiteId}`} className="btn btn-principal w-full">
              Se connecter pour réserver
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
