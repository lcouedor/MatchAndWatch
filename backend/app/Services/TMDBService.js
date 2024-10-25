'use strict';

const axios = require('axios');
class TMDBService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.themoviedb.org/3';
    }

    getParams() {
        return {
            api_key: this.apiKey,
            'vote_average.gte': 7.0,
            'primary_release_date.gte': '2018-01-01',
            'vote_count.gte': 1000,
        };
    }


    async getNumberOfPages() {
        try {
            const response = await axios.get(`${this.baseURL}/discover/movie`, {
                params: this.getParams(),
            });

            return response.data.total_pages;
        } catch (error) {
            console.error('Error fetching number of pages from TMDB:', error);
            throw new Error('Failed to fetch number of pages from TMDB');
        }
    }

    async getRandomMovies(numMovies) {
        try {
            const maxPages = await this.getNumberOfPages();
            let randomMovies = [];
            let totalMovies = 0;

            while (totalMovies < numMovies) {
                //On génère un nombre entre 1 et le nombre de pages si il est inférieur à 500, sinon entre 1 et 500
                let randomPage;
                if (maxPages <= 500) {
                    randomPage = Math.floor(Math.random() * maxPages) + 1; // Ajouter 1 pour commencer à partir de la page 1
                    randomPage = Math.min(randomPage, maxPages); // Limiter la valeur à 500 au maximum

                } else {
                    randomPage = Math.floor(Math.random() * 500) + 1;
                    randomPage = Math.min(randomPage, 500);
                }

                let params = this.getParams();
                params.page = randomPage;

                //On récupère les films de la page aléatoire
                const response = await axios.get(`${this.baseURL}/discover/movie`, {
                    params: {
                        ...this.getParams(), // Ajouter les paramètres de filtrage
                        page: randomPage,
                    },
                });

                //Le nombre de films de la page
                let numMoviesPage = response.data.results.length;

                //Un indice aléatoire pour choisir un film de la page
                let randomIndex = Math.floor(Math.random() * numMoviesPage);

                //On ajoute le film à la liste des films aléatoires si il n'est pas déjà présent
                if (!randomMovies.includes(response.data.results[randomIndex])) {
                    randomMovies.push(response.data.results[randomIndex]);
                    totalMovies++;
                }
            }

            return randomMovies;
        } catch (error) {
            console.error('Error fetching random movies from TMDB:', error);
            throw new Error('Failed to fetch random movies from TMDB');
        }
    }

    async getMovieDetails(movieId) {
        try {
            const response = await axios.get(`${this.baseURL}/movie/${movieId}`, {
                params: {
                    api_key: this.apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching movie details from TMDB:', error);
            throw new Error('Failed to fetch movie details from TMDB');
        }
    }



}


module.exports = TMDBService;
