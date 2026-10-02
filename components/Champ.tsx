import type { InputHTMLAttributes } from "react";

/** Props du composant Champ : celles d'un <input> + le libellé et les erreurs */
interface ChampProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  /** Erreurs de validation renvoyées par la server action pour ce champ */
  erreurs?: string[];
  /** Petit texte d'aide affiché sous le champ */
  aide?: string;
}

/**
 * Champ de formulaire avec son libellé et ses messages d'erreur.
 * Utilisé dans tout les formulaires pour avoir le même style partout.
 */
export default function Champ({ label, name, erreurs, aide, className, ...props }: ChampProps) {
  const enErreur = erreurs !== undefined && erreurs.length > 0;

  return (
    <div className={className}>
      <label htmlFor={name} className="etiquette">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`champ ${enErreur ? "champ-erreur" : ""}`}
        aria-invalid={enErreur}
        aria-describedby={enErreur ? `${name}-erreur` : undefined}
        {...props}
      />
      {aide && !enErreur && <p className="mt-1 text-xs text-stone-500">{aide}</p>}
      <ErreursChamp id={`${name}-erreur`} erreurs={erreurs} />
    </div>
  );
}

/** Affiche la liste des erreurs d'un champ (rien si il n'y en a pas) */
export function ErreursChamp({ id, erreurs }: { id: string; erreurs?: string[] }) {
  if (!erreurs || erreurs.length === 0) return null;
  return (
    <ul id={id} className="mt-1 space-y-0.5 text-xs text-red-600">
      {erreurs.map((erreur) => (
        <li key={erreur}>{erreur}</li>
      ))}
    </ul>
  );
}
