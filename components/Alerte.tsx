import type { ReactNode } from "react";

interface AlerteProps {
  type: "succes" | "erreur" | "info";
  children: ReactNode;
}

/** Couleurs de l'alerte selon son type */
const STYLES: Record<AlerteProps["type"], string> = {
  succes: "border-kaki-200 bg-kaki-50 text-kaki-800",
  erreur: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

/** Bandeau de message (succès, erreur ou information) */
export default function Alerte({ type, children }: AlerteProps) {
  return (
    <div
      role={type === "erreur" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`}
    >
      {children}
    </div>
  );
}
