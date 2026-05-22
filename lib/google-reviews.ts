export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description: string;
}

export interface ReviewsResult {
  reviews: GoogleReview[];
  rating: number;
  user_ratings_total: number;
}

const PLACE_ID = "ChIJedvCcgDvrw0Reom1to6D0VQ";

export async function getGoogleReviews(): Promise<ReviewsResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&language=fr&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" || !data.result) return null;
    return {
      reviews: data.result.reviews ?? [],
      rating: data.result.rating ?? 0,
      user_ratings_total: data.result.user_ratings_total ?? 0,
    };
  } catch {
    return null;
  }
}
