/**
 * Un rating/reviewCount absent ou à 0 produit un JSON-LD AggregateRating
 * rejeté par Google (reviewCount doit être positif, rating dans ]0, 5]).
 * Séparé de google-reviews.ts (qui importe react.cache) pour rester
 * testable en node --test sans contexte de rendu React.
 */
export function isValidRating(
  rating: unknown,
  userRatingsTotal: unknown,
): boolean {
  return (
    typeof rating === "number" &&
    rating > 0 &&
    rating <= 5 &&
    typeof userRatingsTotal === "number" &&
    userRatingsTotal > 0
  );
}
