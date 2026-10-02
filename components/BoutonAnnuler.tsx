"use client";

import { useActionState, type SubmitEvent } from "react";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { annuler } from "@/lib/actions/reservations";

/**
 * Bouton "Annuler" d'une réservation, avec une demande de confirmation.
 * Si le serveur refuse l'annulation, le message d'erreur s'affiche sous le bouton.
 */
export default function BoutonAnnuler({ reservationId }: { reservationId: number }) {
  const [etat, action] = useActionState(annuler.bind(null, reservationId), undefined);

  function demanderConfirmation(event: SubmitEvent<HTMLFormElement>) {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={demanderConfirmation} className="text-right">
      <BoutonEnvoi className="btn btn-danger" texteEnCours="Annulation...">
        Annuler
      </BoutonEnvoi>
      {etat?.message && !etat.succes && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {etat.message}
        </p>
      )}
    </form>
  );
}
