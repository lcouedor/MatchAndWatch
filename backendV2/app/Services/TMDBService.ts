import axios, { AxiosInstance, AxiosResponse } from "axios";
import { TMDBDiscoverResponse, TMDBFilm, TMDBFilmDetails } from "../../../shared-types/tmdb";

import Env from "@ioc:Adonis/Core/Env";

export default class TMDBService {
    private apiKey: string;
    private baseURL: string;
    private http: AxiosInstance;

    constructor() {
        this.apiKey = Env.get("TMDB_API_KEY");
        this.baseURL = Env.get("TMDB_BASE_URL");
        this.http = axios.create({
            baseURL: this.baseURL,
            params: {
                api_key: this.apiKey,
            },
        });
    }

    //TODO rendre les params dynamiques
    private getParams() {
        return {
            "vote_average.gte": 7.0,
            "primary_release_date.gte": "2018-01-01",
            "vote_count.gte": 1000,
        };
    }

    public async getNumberOfPages(): Promise<number> {
        try {
            const response: AxiosResponse<TMDBDiscoverResponse> =
                await this.http.get("/discover/movie", {
                    params: this.getParams(),
                });
            return response.data.total_pages;
        } catch (error) {
            throw new Error("Failed to fetch number of pages from TMDB");
        }
    }

    public async getRandomFilms(numFilms: number): Promise<TMDBFilm[]> {
        try {
            const maxPages = await this.getNumberOfPages();
            const randomFilms: TMDBFilm[] = [];

            while (randomFilms.length < numFilms) {
                const randomPage =
                    Math.floor(Math.random() * Math.min(maxPages, 500)) + 1;

                const response = await this.http.get("/discover/movie", {
                    params: {
                        ...this.getParams(),
                        page: randomPage,
                    },
                });

                const films: TMDBFilm[] = response.data.results as TMDBFilm[];
                const randomIndex: number = Math.floor(Math.random() * films.length);
                const film: TMDBFilm = films[randomIndex];

                if (!randomFilms.some((m) => m.id === film.id)) {
                    randomFilms.push(film);
                }
            }

            return randomFilms;
        } catch (error) {
            throw new Error("Failed to fetch random films from TMDB : " + error);
        }
    }

    public async getFilmDetails(film_id: number): Promise<TMDBFilmDetails> {
        try {
            const response: AxiosResponse<TMDBFilmDetails> = await this.http.get(`/movie/${film_id}`);
            return response.data as TMDBFilmDetails;
        } catch (error) {
            throw new Error("Failed to fetch film details from TMDB");
        }
    }
}
