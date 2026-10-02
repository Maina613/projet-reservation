/**
 * Petit badge qui indique le nombre de places restantes.
 * La couleur change quand il reste peu de places ou que c'est complet.
 */
export default function BadgePlaces({ restantes }: { restantes: number }) {
  if (restantes <= 0) {
    return <span className="badge bg-red-100 text-red-700">Complet</span>;
  }
  if (restantes <= 3) {
    return (
      <span className="badge bg-amber-100 text-amber-800">
        Plus que {restantes} place{restantes > 1 ? "s" : ""}
      </span>
    );
  }
  return <span className="badge bg-kaki-100 text-kaki-800">{restantes} places</span>;
}
