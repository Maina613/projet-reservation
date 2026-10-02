"use client";

import { useActionState } from "react";
import Alerte from "@/components/Alerte";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import Champ from "@/components/Champ";
import { modifierProfil } from "@/lib/actions/profil";
import type { UserPublic } from "@/lib/types";

/** Formulaire de modification du profil, pré-rempli avec les infos de l'utilisateur */
export default function FormulaireProfil({ user }: { user: UserPublic }) {
  const [etat, action] = useActionState(modifierProfil, undefined);

  return (
    <form action={action} className="space-y-4" noValidate>
      {etat?.message && <Alerte type={etat.succes ? "succes" : "erreur"}>{etat.message}</Alerte>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ
          label="Prénom"
          name="prenom"
          autoComplete="given-name"
          defaultValue={etat?.valeurs?.prenom ?? user.prenom}
          erreurs={etat?.erreurs?.prenom}
          required
        />
        <Champ
          label="Nom"
          name="nom"
          autoComplete="family-name"
          defaultValue={etat?.valeurs?.nom ?? user.nom}
          erreurs={etat?.erreurs?.nom}
          required
        />
      </div>
      <Champ
        label="Adresse email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={etat?.valeurs?.email ?? user.email}
        erreurs={etat?.erreurs?.email}
        required
      />

      <div className="space-y-4 border-t border-stone-200 pt-4">
        <h3 className="text-sm font-semibold text-stone-900">
          Changer de mot de passe <span className="font-normal text-stone-500">(facultatif)</span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            label="Mot de passe actuel"
            name="motdepasse_actuel"
            type="password"
            autoComplete="current-password"
            erreurs={etat?.erreurs?.motdepasse_actuel}
          />
          <Champ
            label="Nouveau mot de passe"
            name="nouveau_motdepasse"
            type="password"
            autoComplete="new-password"
            erreurs={etat?.erreurs?.nouveau_motdepasse}
          />
        </div>
      </div>

      <BoutonEnvoi texteEnCours="Enregistrement...">Enregistrer les modifications</BoutonEnvoi>
    </form>
  );
}
