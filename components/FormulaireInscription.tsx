"use client";

import { useActionState } from "react";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import Champ from "@/components/Champ";
import { inscription } from "@/lib/actions/auth";

/** Formulaire de création de compte */
export default function FormulaireInscription() {
  const [etat, action] = useActionState(inscription, undefined);

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ
          label="Prénom"
          name="prenom"
          autoComplete="given-name"
          defaultValue={etat?.valeurs?.prenom}
          erreurs={etat?.erreurs?.prenom}
          required
        />
        <Champ
          label="Nom"
          name="nom"
          autoComplete="family-name"
          defaultValue={etat?.valeurs?.nom}
          erreurs={etat?.erreurs?.nom}
          required
        />
      </div>
      <Champ
        label="Adresse email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={etat?.valeurs?.email}
        erreurs={etat?.erreurs?.email}
        required
      />
      <Champ
        label="Mot de passe"
        name="motdepasse"
        type="password"
        autoComplete="new-password"
        aide="8 caractères minimum, avec au moins une lettre et un chiffre."
        erreurs={etat?.erreurs?.motdepasse}
        required
      />
      <Champ
        label="Confirmation du mot de passe"
        name="confirmation"
        type="password"
        autoComplete="new-password"
        erreurs={etat?.erreurs?.confirmation}
        required
      />
      <BoutonEnvoi className="btn btn-principal w-full" texteEnCours="Création du compte...">
        Créer mon compte
      </BoutonEnvoi>
    </form>
  );
}
