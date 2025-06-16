<template>
  <ModalSlug modaleId="modaleInfo">
    <template v-if="page == 0">
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

    <template v-if="page == 1">
      swipe
    </template>
    <template v-if="page == 2">
      vote
    </template>

  </ModalSlug>
</template>

<script setup lang="ts">
import ModalSlug from "./ModalSlug.vue";

const props = defineProps<{
  page: number;
}>();
</script>
