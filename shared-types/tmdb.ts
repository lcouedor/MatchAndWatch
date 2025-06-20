export interface TMDBFilm {
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    overview: string;
    poster_path: string | null;
    release_date: string;
    title: string;
    vote_average: number;
    vote_count: number;
    genres?: { id: number; name: string }[];
}

export interface TMDBFilmDetails extends TMDBFilm {
    tagline: string;
    genres: { id: number; name: string }[];
}

export interface TMDBDiscoverResponse {
    total_pages: number;
    total_results: number;
    results: TMDBFilm[];
}