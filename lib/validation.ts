import * as z from "zod";

/**
 * Schémas de validation (zod) utilisés par les server actions.
 * Les messages d'erreurs sont affichés directement sous les champs des formulaires.
 */

const prenom = z
  .string()
  .trim()
  .min(2, "Le prénom doit faire au moins 2 caractères.")
  .max(50, "Le prénom est trop long.");

const nom = z
  .string()
  .trim()
  .min(2, "Le nom doit faire au moins 2 caractères.")
  .max(50, "Le nom est trop long.");

// L'email est mis en minuscule pour éviter les doublons du genre Test@mail.fr / test@mail.fr
const email = z.string().trim().toLowerCase().pipe(z.email("L'adresse email n'est pas valide."));

const motdepasse = z
  .string()
  .min(8, "Le mot de passe doit faire au moins 8 caractères.")
  .max(100, "Le mot de passe est trop long.")
  .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

/** Formulaire d'inscription */
export const InscriptionSchema = z
  .object({ prenom, nom, email, motdepasse, confirmation: z.string() })
  .refine((donnees) => donnees.motdepasse === donnees.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne sont pas identiques.",
  });

/** Formulaire de connexion */
export const ConnexionSchema = z.object({
  email,
  motdepasse: z.string().min(1, "Le mot de passe est obligatoire."),
});

/** Formulaire de modification du profil (le nouveau mot de passe est facultatif) */
export const ProfilSchema = z
  .object({
    prenom,
    nom,
    email,
    motdepasse_actuel: z.string(),
    nouveau_motdepasse: z.union([z.literal(""), motdepasse]),
  })
  .refine((donnees) => donnees.nouveau_motdepasse === "" || donnees.motdepasse_actuel !== "", {
    path: ["motdepasse_actuel"],
    message: "Indiquez votre mot de passe actuel pour le changer.",
  });

/** Formulaire de création / modification d'une activité */
export const ActiviteSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(3, "Le nom doit faire au moins 3 caractères.")
    .max(100, "Le nom est trop long."),
  type_id: z.coerce.number("Choisissez un type.").int().positive("Choisissez un type."),
  places_disponibles: z.coerce
    .number("Le nombre de places doit être un nombre.")
    .int("Le nombre de places doit être un nombre entier.")
    .min(1, "Il faut au moins 1 place.")
    .max(500, "500 places maximum."),
  description: z
    .string()
    .trim()
    .min(10, "La description doit faire au moins 10 caractères.")
    .max(2000, "La description est trop longue."),
  datetime_debut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "La date de début n'est pas valide."),
  duree: z.coerce
    .number("La durée doit être un nombre.")
    .int("La durée doit être un nombre entier de minutes.")
    .min(15, "La durée minimum est de 15 minutes.")
    .max(600, "La durée maximum est de 600 minutes."),
});

/** Récupère un champ texte d'un FormData (chaine vide si absent) */
export function champ(formData: FormData, nomDuChamp: string): string {
  const valeur = formData.get(nomDuChamp);
  return typeof valeur === "string" ? valeur : "";
}
