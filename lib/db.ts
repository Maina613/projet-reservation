import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { remplirSeancesDemo } from "@/lib/demo";
import { versDateLocale } from "@/lib/format";

/**
 * Connexion à la base de données SQLite.
 * On utilise le module `node:sqlite` intégré à Node, donc il n'y a rien à installer.
 * Le fichier est créé tout seul dans le dossier /data au premier lancement.
 */

const DOSSIER = path.join(process.cwd(), "data");
const FICHIER = path.join(DOSSIER, "parc.db");

/** Création des 4 tables demandées dans la consigne */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom      TEXT NOT NULL,
    nom         TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    motdepasse  TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
  );

  CREATE TABLE IF NOT EXISTS type_activite (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nom  TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS activites (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                 TEXT NOT NULL,
    type_id             INTEGER NOT NULL REFERENCES type_activite(id),
    places_disponibles  INTEGER NOT NULL CHECK (places_disponibles > 0),
    description         TEXT NOT NULL,
    datetime_debut      TEXT NOT NULL,
    duree               INTEGER NOT NULL CHECK (duree > 0)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activite_id       INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
    date_reservation  TEXT NOT NULL,
    etat              INTEGER NOT NULL DEFAULT 1 CHECK (etat IN (0, 1))
  );

  CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
  CREATE INDEX IF NOT EXISTS idx_reservations_activite ON reservations(activite_id);
`;

/** Renvoie une date dans `jours` jours, à l'heure donnée (pour les données de démo) */
function dansXJours(jours: number, heure: number, minutes = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + jours);
  date.setHours(heure, minutes, 0, 0);
  return versDateLocale(date);
}

/**
 * Remplit la base avec des données de démonstration si elle est vide :
 * les types d'activité, un compte admin, un compte utilisateur et quelques activités.
 */
function insererDonneesDeDemo(db: DatabaseSync): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    const { total } = db.prepare("SELECT COUNT(*) AS total FROM users").get() as { total: number };
    // Si il y a déja des utilisateurs c'est que la base a déjà été remplie
    if (total > 0) {
      db.exec("COMMIT");
      return;
    }

    const types = ["Accrobranche", "Escalade", "Nautique", "Tir à l'arc", "Randonnée", "Bien-être"];
    const ajouterType = db.prepare("INSERT OR IGNORE INTO type_activite (nom) VALUES (?)");
    types.forEach((nom) => ajouterType.run(nom));

    const ajouterUser = db.prepare(
      "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, ?)",
    );
    ajouterUser.run("Admin", "Du Parc", "admin@parc.fr", bcrypt.hashSync("Admin1234", 10), "admin");
    ajouterUser.run("Camille", "Martin", "camille@parc.fr", bcrypt.hashSync("Camille1234", 10), "user");

    const ajouterActivite = db.prepare(
      `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
      VALUES (?, (SELECT id FROM type_activite WHERE nom = ?), ?, ?, ?, ?)`,
    );
    const activites: [string, string, number, string, string, number][] = [
      [
        "Parcours des poussins",
        "Accrobranche",
        12,
        "Un parcours dans les arbres accessible à tous, avec des ponts de singe, des tyroliennes et des filets. Idéal pour découvrir l'accrobranche en famille.",
        dansXJours(2, 10),
        90,
      ],
      [
        "Grande tyrolienne du lac",
        "Accrobranche",
        8,
        "300 mètres de descente au dessus du lac ! Sensations garanties pour cette tyrolienne géante, encadrée par nos moniteurs diplômés.",
        dansXJours(3, 14, 30),
        45,
      ],
      [
        "Initiation à l'escalade",
        "Escalade",
        6,
        "Découverte de l'escalade sur notre mur extérieur de 12 mètres. Le matériel est fourni (baudrier, chaussons, casque).",
        dansXJours(4, 9, 30),
        120,
      ],
      [
        "Balade en canoë",
        "Nautique",
        10,
        "Une balade tranquille en canoë sur la rivière qui traverse le parc. Prévoir des affaires de rechange et une bouteille d'eau.",
        dansXJours(5, 15),
        120,
      ],
      [
        "Stand up paddle au coucher du soleil",
        "Nautique",
        2,
        "Session de paddle en petit groupe sur le lac, au moment où la lumière est la plus belle. Niveau débutant accepté.",
        dansXJours(6, 18, 30),
        60,
      ],
      [
        "Tir à l'arc découverte",
        "Tir à l'arc",
        8,
        "Apprenez les bases du tir à l'arc avec un moniteur : posture, visée et lâcher. Séance sur cibles à 10 et 18 mètres.",
        dansXJours(7, 11),
        60,
      ],
      [
        "Randonnée de la vallée",
        "Randonnée",
        15,
        "Randonnée guidée de 8 km avec un superbe point de vue sur la vallée. De bonnes chaussures de marche sont nécessaires.",
        dansXJours(9, 8, 30),
        180,
      ],
      [
        "Yoga en plein air",
        "Bien-être",
        20,
        "Séance de yoga douce dans la clairière du parc. Les tapis sont fournis, il suffit de venir avec une tenue confortable.",
        dansXJours(10, 9),
        75,
      ],
    ];
    activites.forEach((activite) => ajouterActivite.run(...activite));

    // Des participants fictifs remplissent certaines séances,
    // comme ça le calendrier montre des jours complets qu'on ne peut plus réserver
    remplirSeancesDemo(db, bcrypt.hashSync("Demo1234", 10));

    db.exec("COMMIT");
  } catch (erreur) {
    db.exec("ROLLBACK");
    throw erreur;
  }
}

/** Ouvre la base, crée les tables si besoin et insère les données de démo */
function ouvrirBase(): DatabaseSync {
  mkdirSync(DOSSIER, { recursive: true });
  const db = new DatabaseSync(FICHIER);
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA journal_mode = WAL");
  // Obligatoire pour que les ON DELETE CASCADE fonctionnent avec SQLite
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  insererDonneesDeDemo(db);
  return db;
}

// En développement Next recharge souvent les fichiers, on garde donc la connexion
// dans une variable globale pour ne pas réouvrir la base à chaque rechargement.
const globalPourDb = globalThis as unknown as { db?: DatabaseSync };

/** Renvoie la connexion à la base (toujours la même) */
export function getDb(): DatabaseSync {
  if (!globalPourDb.db) {
    globalPourDb.db = ouvrirBase();
  }
  return globalPourDb.db;
}

/** Valeurs qu'on peut passer en paramètre d'une requête */
type Parametre = string | number | null;

/**
 * Exécute un SELECT et renvoie la première ligne (ou undefined).
 * Les lignes renvoyées par node:sqlite n'ont pas de prototype, et Next refuse de
 * les envoyer aux composants client. On les recopie donc dans des objets normaux.
 */
export function lireUne<T>(sql: string, ...parametres: Parametre[]): T | undefined {
  const ligne = getDb().prepare(sql).get(...parametres);
  return ligne ? ({ ...ligne } as T) : undefined;
}

/** Exécute un SELECT et renvoie toutes les lignes */
export function lireToutes<T>(sql: string, ...parametres: Parametre[]): T[] {
  return getDb()
    .prepare(sql)
    .all(...parametres)
    .map((ligne) => ({ ...ligne }) as T);
}
