<template>
  <ModalSlug modaleId="modaleInfo">
    <template v-if="page == -1">
      <h2>1. Trouve des gens avec qui tu veux regarder quelque chose</h2>
      <p>
        (Si tu es tout seul tu peux toujours utiliser Match & Watch pour découvrir
        des films)
      </p>
      <p>(Mais essaye de trouver des gens quand même, c'est sympa tu verras)</p>

      <h2>2. Match avec les films les plus CHAUDS de TA room</h2>
      <p>(Ouais pas sûr de celle-là)</p>
      <p>Question simple : Ça te dirait de voir ce film ?</p>
      <p>
        Si oui tu likes, sinon ça part (après si quelqu'un d'autre le like on peut
        rien pour toi, tu le retrouveras à l'étape d'après)
      </p>

      <h2>3. Classe les films</h2>
      <p>Tu dois classer les films likés par tous les membres de ta room</p>
      <p>
        (Si tu n'as absolument pas envie de voir un film c'est possible aussi)
      </p>

      <h2>4. Bon visionnage</h2>
      <p>En espérant que tu apprécies le film sélectionné pour ta room</p>
    </template>

    <template v-if="page == 0">
      <h2>Ici ça swipe</h2>
      <p>À gauche si tu ne veux pas voir ce film</p>
      <p>À droite si tu est prêt à le voir (je suis sur que tu connais le système mon grand)</p>
      <br>
      <p>Continues à liker jusqu'à atteindre ton quota (c'est indiqué en haut de la page) ou jusqu'à épuiser la liste de films proposés</p>
      <br>
      <p>Chaque personne dans la room se voit proposer les mêmes films mais dans un ordre aléatoire, pas la peine de tricher sur ton voisin</p>
    </template>
    <template v-if="page == 1">
      <h2>C'est l'heure du vote final !</h2>
      <p>Ici tu retrouves tous les films likés par au moins une personne</p>
      <p>(Si tu vois un film que tu avais pourtant dislike c'est normal, c'est qu'au moins un autre membre de la room l'a liké, je te laisse trouver le coupable toi même)</p>
      <br>
      <p>Sous chaque film tu as 5 cercles. Note de 0 à 5 ton envie de voir chaque film</p>
      <p>Si tu votes 0 ton souhait sera (probablement) exaucé, ce film ne gagnera (probablement) pas</p>
      <br>
      <p>Tu as fini de voter ? Valide avec le bouton en fin de page</p>
      <br>
      <p>(Pro tip : Appuie sur la cover d'un film pour afficher son synopsis)</p>
    </template>

  </ModalSlug>
</template>

<script setup lang="ts">
import ModalSlug from "./ModalSlug.vue";

const props = defineProps<{
  page: number;
}>();
</script>
