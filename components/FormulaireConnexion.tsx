"use client";

import { useActionState } from "react";
import Alerte from "@/components/Alerte";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import Champ from "@/components/Champ";
import { connexion } from "@/lib/actions/auth";

/**
 * Formulaire de connexion.
 * `suite` est la page vers laquelle on renvoit l'utilisateur une fois connecté.
 */
export default function FormulaireConnexion({ suite }: { suite: string }) {
  const [etat, action] = useActionState(connexion, undefined);

  return (
    <form action={action} className="space-y-4" noValidate>
      {etat?.message && <Alerte type="erreur">{etat.message}</Alerte>}
      <input type="hidden" name="suite" value={suite} />
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
        autoComplete="current-password"
        erreurs={etat?.erreurs?.motdepasse}
        required
      />
      <BoutonEnvoi className="btn btn-principal w-full" texteEnCours="Connexion...">
        Se connecter
      </BoutonEnvoi>
    </form>
  );
}
