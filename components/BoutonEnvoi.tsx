"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface BoutonEnvoiProps {
  children: ReactNode;
  /** Texte affiché pendant l'envoi du formulaire */
  texteEnCours?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Bouton d'envoi de formulaire.
 * Il se désactive tout seul pendant que la server action s'exécute,
 * ce qui évite les doubles clics (et donc les doubles réservations).
 */
export default function BoutonEnvoi({
  children,
  texteEnCours = "Envoi en cours...",
  className = "btn btn-principal",
  disabled = false,
}: BoutonEnvoiProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? texteEnCours : children}
    </button>
  );
}
