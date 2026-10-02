import type { Metadata } from "next";
import { Fredoka, Geist, Geist_Mono } from "next/font/google";
import EnTete, { NOM_DU_PARC } from "@/components/EnTete";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police utilisée seulement pour le logo, pour qu'il se démarque du reste du site
const policeLogo = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "400",
});

// Metadata par défaut. Chaque page défini son propre titre, qui est inséré dans le modèle.
export const metadata: Metadata = {
  title: {
    default: `${NOM_DU_PARC} - Réservation d'activités en plein air`,
    template: `%s | ${NOM_DU_PARC}`,
  },
  description:
    "Réservez vos activités en ligne : accrobranche, escalade, canoë, tir à l'arc, randonnée et bien plus.",
};

/** Mise en page commune à toutes les pages : en-tête, contenu, pied de page */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${policeLogo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <EnTete />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-stone-200 bg-white">
          <div className="conteneur flex flex-wrap items-center justify-between gap-2 py-6 text-sm text-stone-500">
            <p>
              © {new Date().getFullYear()} {NOM_DU_PARC} - Projet de réservation d&apos;activités
            </p>
            <p>Réalisé avec Next.js et TypeScript</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
