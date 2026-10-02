/** Feuille du logo Grand Air (prend la couleur du texte autour) */
export default function IconeFeuille({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20 4c-8.5 0-15 4.5-15 11.5 0 1.3.3 2.5.8 3.5L4 21l1.4 1.4 1.9-1.9c1 .5 2.1.7 3.2.7C17 21.2 20 13.5 20 4zm-9.6 14.7c-.6 0-1.2-.1-1.7-.3l6.1-6.1-1.4-1.4-6.1 6.1c-.2-.5-.3-1.1-.3-1.6C7 10.4 11.6 6.6 17.9 6.1c-.6 7-3.2 12.6-7.5 12.6z" />
    </svg>
  );
}
