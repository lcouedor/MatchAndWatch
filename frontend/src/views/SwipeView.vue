<template>
    <div v-if="!ready" class="loadingView">
        <div class="loadingData">
            <p>On y est presque !</p>
            <div class="waiting waitingVisible">
                <div class="spin"></div>
            </div>
        </div>

    </div>

    <div v-else class="stepPage">
        <div class="bandeauSwipe">
            {{ $parent.userBucket.length }}/{{ room.data.bucket_size }} films likés
        </div>

        <div class="titre" v-if="currentFilm">
            <p>{{ currentFilm.title }} ({{ new Date(currentFilm.release_date).getFullYear() }})</p>
        </div>

        <div class="containerFilms">
            <div v-for="film in displayFilms" class="backgroundCard">
                <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film">
            </div>

            <div v-if="currentFilm" class="swipeCard" id="swipeCard">
                <div class="parentImage">
                    <img :src="`https://image.tmdb.org/t/p/w780/${currentFilm.poster_path}`" alt="Affiche du film"
                        @touchstart="onDragStart" @touchmove="onDragMove" @touchend="onDragEnd">
                    <div id="leftZone">
                        <div class="background"></div>
                        <span>No Watch</span>
                    </div>
                    <div id="rightZone">
                        <div class="background"></div>
                        <span>Watch</span>
                    </div>
                </div>

            </div>
        </div>

        <div class="overviewZone" v-if="currentFilm">
            {{ currentFilm.overview }}
        </div>
    </div>


</template>

<script>
export default {
    name: 'SwipeView',

    data() {
        return {
            films: [],
            displayFilms: [],
            currentFilm: null,

            initialX: 0,
            initialLeft: 0,

            card: null,
            actualLeft: null,
            actualRight: null,
        }
    },

    props: {
        room: {
            type: Object,
            default: null
        },
        movies: {
            type: Array,
            default: []
        },
        ready: {
            type: Boolean,
            default: false
        },
    },

    watch: {
        ready: {
            immediate: true,
            handler() {
                if (this.ready) {
                    // Une fois que les films sont chargés, on les copie dans films
                    this.films = this.movies;
                    this.displayFilms = [...this.films];
                    //On shuffle les films à afficher
                    this.displayFilms = this.displayFilms.sort((a, b) => 0.5 - Math.random());
                    this.currentFilm = this.displayFilms.pop();
                }
            }
        },
    },

    methods: {
        //Les fonctions pour le swipe
        onDragStart(e) {
            this.initialX = e.touches[0].clientX;

            //On récupère l'élement à déplacer horizontalement
            this.card = document.getElementById('swipeCard').getElementsByClassName('parentImage')[0];
            this.actualLeft = this.card.querySelector("#leftZone")
            this.actualRight = this.card.querySelector("#rightZone")
            this.initialLeft = this.card.getBoundingClientRect().left;
        },
        onDragMove(e) {
            //On récupère la position actuelle de la souris
            let currentX = e.touches[0].clientX;

            //Si la moitié de l'image est hors de l'écran, on ne fait rien
            if (currentX < 0 || currentX > window.innerWidth) {
                return;
            }

            //On calcule la distance parcourue par la souris depuis le début du drag
            let diff = currentX - this.initialX;

            //On déplace l'élement horizontalement avec un translateX
            this.card.style.transform = `translateX(calc(-50% + ${diff}px))`;

            //On regarde la position du centre de l'image
            let cardCenter = this.card.getBoundingClientRect().left + this.card.getBoundingClientRect().width / 2;

            //On regarde si l'image est dans le quart gauche, le quart droit ou le milieu
            if (cardCenter < window.innerWidth / 4) {
                //On ajoute une rotation à l'image
                let rotation = (cardCenter - window.innerWidth / 4) / (window.innerWidth / 4) * 30;
                this.card.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;

                //On rend visible la zone de gauche
                let opacity = (window.innerWidth / 4 - cardCenter) / (window.innerWidth / 4) * 0.5;
                this.actualLeft.getElementsByClassName("background")[0].style.opacity = opacity;
                this.actualLeft.style.opacity = 1;
            } else if (cardCenter > window.innerWidth * 3 / 4) {
                //On ajoute une rotation à l'image
                let rotation = (cardCenter - window.innerWidth * 3 / 4) / (window.innerWidth / 4) * 30;
                this.card.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;

                //On rend visible la zone de droite (opacité qui dépend de la position de la souris) de 0 à 0.5
                let opacity = (cardCenter - window.innerWidth * 3 / 4) / (window.innerWidth / 4) * 0.5;
                this.actualRight.getElementsByClassName("background")[0].style.opacity = opacity;
                this.actualRight.style.opacity = 1;
            } else {
                this.actualRight.style.opacity = 0;
                this.actualLeft.style.opacity = 0;
            }
        },
        onDragEnd() {
            let transitionDuration = 500;

            let card = document.getElementById('swipeCard').getElementsByClassName('parentImage')[0];
            let cardCenter = card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2;

            //On regarde si l'image est dans le quart gauche, le quart droit ou le milieu
            if (cardCenter < window.innerWidth / 4) {
                card.style.left = '-150%';
                //on met une transition pour l'animation
                card.style.transition = 'all ' + transitionDuration + 'ms, transform ' + transitionDuration + 'ms';

                setTimeout(() => {
                    //On retire le film de la liste
                    this.currentFilm = this.displayFilms.pop();

                    if (!this.currentFilm) {
                        this.$parent.validStep1();
                    }

                    //On remet l'élément au centre sans transition
                    card.style.left = '50%';
                    card.style.transform = 'translateX(-50%)';
                    card.style.transition = 'none';

                    //On rend invisible les zones
                    this.actualLeft.style.opacity = 0;
                    this.actualRight.style.opacity = 0;
                }, transitionDuration);
            } else if (cardCenter > window.innerWidth * 3 / 4) {
                card.style.left = '150%';
                //on met une transition pour l'animation
                card.style.transition = 'all ' + transitionDuration + 'ms, transform ' + transitionDuration + 'ms';

                setTimeout(() => {
                    //On ajoute le film dans le bucket
                    this.$parent.userBucket.push(this.currentFilm);

                    //On regarde si on a atteint le nombre de films à liker
                    if (this.$parent.userBucket.length == this.room.data.bucket_size) {
                        //On change d'étape
                        this.$parent.validStep1();
                    }

                    //On retire le film de la liste
                    this.currentFilm = this.displayFilms.pop();

                    if (!this.currentFilm) {
                        this.$parent.validStep1();
                    }

                    //On remet l'élément au centre sans transition
                    card.style.left = '50%';
                    card.style.transform = 'translateX(-50%)';
                    card.style.transition = 'none';

                    //On rend invisible les zones
                    this.actualLeft.style.opacity = 0;
                    this.actualRight.style.opacity = 0;
                }, transitionDuration);

            } else {
                //On remet l'élément au centre
                card.style.left = '50%';
                card.style.transform = 'translateX(-50%)';

                //Il y a une transition pour le replacement de l'élément
                card.style.transition = 'all ' + transitionDuration + 'ms, transform ' + transitionDuration + 'ms';

                setTimeout(() => {
                    //On retire la transition
                    card.style.transition = 'none';
                }, transitionDuration);
            }
        }
    }


};
</script>