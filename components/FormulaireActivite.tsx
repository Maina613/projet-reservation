"use client";

import { useActionState } from "react";
import Link from "next/link";
import Alerte from "@/components/Alerte";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import Champ, { ErreursChamp } from "@/components/Champ";
import { enregistrerActivite } from "@/lib/actions/activites";
import type { Activite, TypeActivite } from "@/lib/types";

interface FormulaireActiviteProps {
  types: TypeActivite[];
  /** Activité à modifier. Si elle est absente, le formulaire sert à créer une activité. */
  activite?: Activite;
}

/**
 * Formulaire des activités, utilisé à la fois pour la création et la modification
 * (ça évite d'écrire deux fois le même formulaire).
 */
export default function FormulaireActivite({ types, activite }: FormulaireActiviteProps) {
  const [etat, action] = useActionState(enregistrerActivite, undefined);

  // Valeur d'un champ : ce que l'utilisateur vient de saisir, sinon la valeur de l'activité
  const valeur = (nom: keyof Omit<Activite, "id">): string | undefined =>
    etat?.valeurs?.[nom] ?? activite?.[nom]?.toString();

  return (
    <form action={action} className="space-y-4" noValidate>
      {etat?.message && <Alerte type="erreur">{etat.message}</Alerte>}
      {/* En modification, l'id de l'activité est envoyé dans un champ caché */}
      {activite && <input type="hidden" name="id" value={activite.id} />}

      <Champ
        label="Nom de l'activité"
        name="nom"
        defaultValue={valeur("nom")}
        erreurs={etat?.erreurs?.nom}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type_id" className="etiquette">
            Type d&apos;activité
          </label>
          {/* La key force React à recréer le select pour reprendre la bonne valeur après une erreur */}
          <select
            id="type_id"
            name="type_id"
            key={valeur("type_id")}
            defaultValue={valeur("type_id") ?? ""}
            className={`champ ${etat?.erreurs?.type_id ? "champ-erreur" : ""}`}
            required
          >
            <option value="" disabled>
              Choisir un type
            </option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>
          <ErreursChamp id="type_id-erreur" erreurs={etat?.erreurs?.type_id} />
        </div>
        <Champ
          label="Places par séance"
          name="places_disponibles"
          type="number"
          min={1}
          max={500}
          defaultValue={valeur("places_disponibles")}
          erreurs={etat?.erreurs?.places_disponibles}
          required
        />
        <Champ
          label="Première séance"
          name="datetime_debut"
          type="datetime-local"
          aide="L'activité a ensuite lieu tous les jours à la même heure."
          defaultValue={valeur("datetime_debut")}
          erreurs={etat?.erreurs?.datetime_debut}
          required
        />
        <Champ
          label="Durée (en minutes)"
          name="duree"
          type="number"
          min={15}
          max={600}
          step={5}
          defaultValue={valeur("duree")}
          erreurs={etat?.erreurs?.duree}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="etiquette">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={valeur("description")}
          className={`champ ${etat?.erreurs?.description ? "champ-erreur" : ""}`}
          required
        />
        <ErreursChamp id="description-erreur" erreurs={etat?.erreurs?.description} />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <BoutonEnvoi texteEnCours="Enregistrement...">
          {activite ? "Enregistrer les modifications" : "Créer l'activité"}
        </BoutonEnvoi>
        <Link href="/admin/activites" className="btn btn-secondaire">
          Annuler
        </Link>
      </div>
    </form>
  );
}
