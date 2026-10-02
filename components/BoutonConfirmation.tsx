"use client";

import type { ReactNode, SubmitEvent } from "react";
import BoutonEnvoi from "@/components/BoutonEnvoi";

interface BoutonConfirmationProps {
  /** Server action à exécuter si l'utilisateur confirme */
  action: () => Promise<void>;
  /** Question posée dans la fenêtre de confirmation */
  question: string;
  children: ReactNode;
  className?: string;
}

/**
 * Bouton pour les actions dangereuses (suppression).
 * Il demande une confirmation avant d'envoyer le formulaire.
 */
export default function BoutonConfirmation({
  action,
  question,
  children,
  className = "btn btn-danger",
}: BoutonConfirmationProps) {
  function demanderConfirmation(event: SubmitEvent<HTMLFormElement>) {
    // Si l'utilisateur clique sur "Annuler" on bloque l'envoi du formulaire
    if (!window.confirm(question)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={demanderConfirmation}>
      <BoutonEnvoi className={className} texteEnCours="Suppression...">
        {children}
      </BoutonEnvoi>
    </form>
  );
}
