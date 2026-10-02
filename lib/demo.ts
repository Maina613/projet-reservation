import type { DatabaseSync } from "node:sqlite";

/**
 * Réservations de démonstration.
 * Des participants fictifs remplissent certaines séances, comme ça le calendrier
 * montre des jours complets (barrés) et des jours à moitié pleins.
 *
 * Ce fichier n'importe rien d'autre du projet pour pouvoir aussi être lancé
 * directement avec Node (pour remplir une base qui existe déjà).
 */

/** Participants fictifs : prénom, nom, email (mot de passe : Demo1234) */
export const PARTICIPANTS_DEMO: [string, string, string][] = [
  ["Lucas", "Bernard", "lucas@parc.fr"],
  ["Inès", "Petit", "ines@parc.fr"],
  ["Hugo", "Durand", "hugo.durand@demo.fr"],
  ["Léa", "Moreau", "lea.moreau@demo.fr"],
  ["Nathan", "Laurent", "nathan.laurent@demo.fr"],
  ["Chloé", "Simon", "chloe.simon@demo.fr"],
  ["Louis", "Michel", "louis.michel@demo.fr"],
  ["Manon", "Lefebvre", "manon.lefebvre@demo.fr"],
  ["Gabriel", "Leroy", "gabriel.leroy@demo.fr"],
  ["Jade", "Roux", "jade.roux@demo.fr"],
  ["Arthur", "David", "arthur.david@demo.fr"],
  ["Louise", "Bertrand", "louise.bertrand@demo.fr"],
  ["Jules", "Morel", "jules.morel@demo.fr"],
  ["Emma", "Fournier", "emma.fournier@demo.fr"],
  ["Adam", "Girard", "adam.girard@demo.fr"],
  ["Alice", "Bonnet", "alice.bonnet@demo.fr"],
  ["Raphaël", "Dupont", "raphael.dupont@demo.fr"],
  ["Lina", "Lambert", "lina.lambert@demo.fr"],
  ["Tom", "Fontaine", "tom.fontaine@demo.fr"],
  ["Rose", "Rousseau", "rose.rousseau@demo.fr"],
];

/**
 * Séances à remplir pour chaque activité.
 * Les nombres sont des jours après la première séance (0 = la première séance).
 * - complets : toutes les places sont prises
 * - partiels : la moitié des places sont prises
 */
const PLAN_DEMO: Record<string, { complets: number[]; partiels: number[] }> = {
  "Parcours des poussins": { complets: [1, 5], partiels: [2, 8] },
  "Grande tyrolienne du lac": { complets: [0, 3, 7], partiels: [1] },
  "Initiation à l'escalade": { complets: [2, 4, 9], partiels: [0] },
  "Balade en canoë": { complets: [1, 6], partiels: [3] },
  "Stand up paddle au coucher du soleil": { complets: [0, 2, 5, 8], partiels: [1, 3] },
  "Tir à l'arc découverte": { complets: [0, 4], partiels: [2, 6] },
  "Randonnée de la vallée": { complets: [3, 10], partiels: [0] },
  "Yoga en plein air": { complets: [2, 9], partiels: [5] },
};

/** Ajoute des jours à une date `AAAA-MM-JJTHH:mm` en gardant l'heure */
function decalerSeance(datetime: string, jours: number): string {
  const date = new Date(datetime);
  date.setDate(date.getDate() + jours);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${datetime.slice(11, 16)}`;
}

/**
 * Crée les participants (s'ils n'existent pas) et remplit les séances du plan.
 * On ne dépasse jamais le nombre de places, et un participant ne réserve pas
 * deux fois la même séance.
 */
export function remplirSeancesDemo(db: DatabaseSync, hashMotDePasse: string): void {
  const ajouterUser = db.prepare(
    "INSERT OR IGNORE INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, 'user')",
  );
  const idUser = db.prepare("SELECT id FROM users WHERE email = ?");
  const participants = PARTICIPANTS_DEMO.map(([prenom, nom, email]) => {
    ajouterUser.run(prenom, nom, email, hashMotDePasse);
    return (idUser.get(email) as { id: number }).id;
  });

  const activite = db.prepare("SELECT id, datetime_debut, places_disponibles FROM activites WHERE nom = ?");
  const compterSeance = db.prepare(
    "SELECT COUNT(*) AS total FROM reservations WHERE activite_id = ? AND date_reservation = ? AND etat = 1",
  );
  const dejaInscrit = db.prepare(
    "SELECT 1 FROM reservations WHERE user_id = ? AND activite_id = ? AND date_reservation = ? AND etat = 1",
  );
  const reserver = db.prepare(
    "INSERT INTO reservations (user_id, activite_id, date_reservation, etat) VALUES (?, ?, ?, 1)",
  );

  for (const [nom, plan] of Object.entries(PLAN_DEMO)) {
    const a = activite.get(nom) as { id: number; datetime_debut: string; places_disponibles: number } | undefined;
    if (!a) continue;

    const objectifs: [number, number][] = [
      ...plan.complets.map((jour): [number, number] => [jour, a.places_disponibles]),
      ...plan.partiels.map((jour): [number, number] => [jour, Math.floor(a.places_disponibles / 2)]),
    ];

    for (const [jour, objectif] of objectifs) {
      const seance = decalerSeance(a.datetime_debut, jour);
      let prises = (compterSeance.get(a.id, seance) as { total: number }).total;
      for (const userId of participants) {
        if (prises >= objectif) break;
        if (dejaInscrit.get(userId, a.id, seance)) continue;
        reserver.run(userId, a.id, seance);
        prises++;
      }
    }
  }
}
