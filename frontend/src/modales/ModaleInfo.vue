<template>
  <ModalSlug modaleId="modaleInfo">

    <!-- Page d'accueil -->
    <template v-if="page == -1">
      <h2>Bienvenue sur Match & Watch</h2>
      <p>L'app qui règle définitivement la question <em>"On regarde quoi ce soir ?"</em> — enfin, presque.</p>

      <h2>Comment ça marche ?</h2>
      <p><strong>1. Crée ou rejoins une room</strong> avec tes comparses. Un code à 4 lettres, et le tour est joué.</p>
      <p><strong>2. Swipe les films</strong> proposés selon tes filtres. Like ce que tu veux voir, ignore le reste.</p>
      <p><strong>3. Vote pour tes préférés</strong> parmi les films que tout le monde a likés.</p>
      <p><strong>4. Découvre le gagnant</strong> — le film qui a raflé le plus de points. Et cette fois, pas d'excuse pour zapper en cours de route.</p>

      <h2>En mode "vote des filtres"</h2>
      <p>Chaque participant vote pour ses préférences (genres, année, durée…). La médiane des votes est appliquée — la démocratie, mais en bien.</p>
    </template>

    <!-- Page vote des filtres -->
    <template v-if="page == -2">
      <h2>Vote pour tes préférences</h2>
      <p>Chaque participant choisit ses critères de recherche. Pas d'inquiétude, personne ne va te juger pour tes goûts… enfin, ça dépend de ce que tu choisis.</p>

      <h2>Comment sont calculés les filtres ?</h2>
      <p><strong>Sliders (note, année, popularité, durée)</strong> — la médiane de tous les votes est utilisée. Un filtre raisonnable pour tout le monde, plutôt que la dictature du plus exigeant.</p>
      <p><strong>Genres</strong> — l'union. Si au moins une personne veut du thriller, le thriller reste dans la liste. Solidarité.</p>

      <template v-if="stepTimeout">
        <h2>Le timer</h2>
        <p>Tu as {{ formatTimeout(stepTimeout) }} pour voter. Passé ce délai, tes préférences par défaut sont envoyées. Elles sont raisonnables, promis. Mais tu aurais pu faire mieux.</p>
      </template>
    </template>

    <!-- Page swipe -->
    <template v-if="page == 0">
      <h2>Ici ça swipe</h2>
      <p><strong>À gauche</strong> si tu ne veux pas voir ce film. À <strong>droite</strong> si tu es partant. Tu connais le principe, on ne va pas te faire un dessin.</p>

      <h2>Ton quota</h2>
      <p>Le nombre de films à liker est affiché en haut de la page. Tu continues à swiper jusqu'à atteindre ton quota ou épuiser la liste.</p>
      <p>Si les films s'arrêtent avant que tu atteignes ton quota, c'est que la liste était courte. Tant pis, tu feras avec ce que t'a réservé le destin (et les filtres).</p>

      <h2>Ordre aléatoire</h2>
      <p>Tout le monde voit les mêmes films, mais dans un ordre différent. Pas la peine d'essayer de copier sur ton voisin.</p>

      <template v-if="stepTimeout">
        <h2>Le timer</h2>
        <p>Tu as {{ formatTimeout(stepTimeout) }} pour swiper. Quand il atteint zéro, ton bucket est soumis tel quel, même incomplet. Swipe vite.</p>
      </template>
    </template>

    <!-- Page vote final -->
    <template v-if="page == 1">
      <h2>Le vote final</h2>
      <p>Tu retrouves ici tous les films likés par au moins une personne dans la room. Même celui que tu avais mis à gauche. Oui, quelqu'un l'a liké. Tu sais qui.</p>

      <h2>Comment voter ?</h2>
      <p>Sous chaque film, 5 boutons pour exprimer ton niveau d'enthousiasme :</p>
      <p>❌ <strong>Jamais</strong> — plutôt regarder la télé de ta grand-mère</p>
      <p>👎 <strong>Bof</strong> — pourquoi pas, si les autres insistent</p>
      <p>· <strong>Neutre</strong> — tu t'en fous, mais tu es là quand même</p>
      <p>👍 <strong>Ouais</strong> — ça te botte bien</p>
      <p>❤️ <strong>Top</strong> — tu attends que ça depuis des semaines</p>

      <h2>Le synopsis</h2>
      <p>Tu ne te rappelles plus de quoi parle ce film ? Tape sur la cover pour afficher le synopsis. Et non, tu n'as pas de bonne excuse pour voter à l'aveugle.</p>

      <template v-if="stepTimeout">
        <h2>Le timer</h2>
        <p>Tu as {{ formatTimeout(stepTimeout) }} pour voter. Passé ce délai, ton vote est soumis automatiquement avec les notes en cours. Ne procrastine pas.</p>
      </template>

      <h2>Valider</h2>
      <p>Quand tu as noté tous les films, clique sur "Voter" en bas de page. Le résultat arrive ensuite pour tout le monde.</p>
    </template>

  </ModalSlug>
</template>

<script setup lang="ts">
import ModalSlug from "./ModalSlug.vue";

const props = defineProps<{
  page: number;
  stepTimeout?: number | null;
}>();

function formatTimeout(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m > 0 && s > 0) return `${m} min ${s} s`
  if (m > 0) return `${m} min`
  return `${s} s`
}
</script>
