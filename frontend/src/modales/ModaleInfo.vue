<template>
  <ModalSlug modaleId="modaleInfo">

    <!-- Page d'accueil -->
    <template v-if="page == -1">
      <h2>{{ $t('info.home.title') }}</h2>
      <p v-html="$t('info.home.intro')"></p>
      <h2>{{ $t('info.home.howTitle') }}</h2>
      <p v-html="$t('info.home.step1')"></p>
      <p v-html="$t('info.home.step2')"></p>
      <p v-html="$t('info.home.step3')"></p>
      <p v-html="$t('info.home.step4')"></p>
      <h2>{{ $t('info.home.filterVoteTitle') }}</h2>
      <p>{{ $t('info.home.filterVoteText') }}</p>
    </template>

    <!-- Page vote des filtres -->
    <template v-if="page == -2">
      <h2>{{ $t('info.filterVote.title') }}</h2>
      <p>{{ $t('info.filterVote.intro') }}</p>
      <h2>{{ $t('info.filterVote.calcTitle') }}</h2>
      <p v-html="$t('info.filterVote.calcSliders')"></p>
      <p v-html="$t('info.filterVote.calcGenres')"></p>
      <template v-if="stepTimeout">
        <h2>{{ $t('info.filterVote.timerTitle') }}</h2>
        <p>{{ $t('info.filterVote.timerText', { time: formatTimeout(stepTimeout) }) }}</p>
      </template>
    </template>

    <!-- Page swipe -->
    <template v-if="page == 0">
      <h2>{{ $t('info.swipe.title') }}</h2>
      <p v-html="$t('info.swipe.swipeText')"></p>
      <h2>{{ $t('info.swipe.quotaTitle') }}</h2>
      <p>{{ $t('info.swipe.quotaText1') }}</p>
      <p>{{ $t('info.swipe.quotaText2') }}</p>
      <h2>{{ $t('info.swipe.randomTitle') }}</h2>
      <p>{{ $t('info.swipe.randomText') }}</p>
      <template v-if="stepTimeout">
        <h2>{{ $t('info.swipe.timerTitle') }}</h2>
        <p>{{ $t('info.swipe.timerText', { time: formatTimeout(stepTimeout) }) }}</p>
      </template>
    </template>

    <!-- Page vote final -->
    <template v-if="page == 1">
      <h2>{{ $t('info.vote.title') }}</h2>
      <p>{{ $t('info.vote.intro') }}</p>
      <h2>{{ $t('info.vote.howTitle') }}</h2>
      <p>{{ $t('info.vote.howIntro') }}</p>
      <p v-html="$t('info.vote.ratingNever')"></p>
      <p v-html="$t('info.vote.ratingMeh')"></p>
      <p v-html="$t('info.vote.ratingNeutral')"></p>
      <p v-html="$t('info.vote.ratingYes')"></p>
      <p v-html="$t('info.vote.ratingTop')"></p>
      <h2>{{ $t('info.vote.synopsisTitle') }}</h2>
      <p>{{ $t('info.vote.synopsisText') }}</p>
      <template v-if="stepTimeout">
        <h2>{{ $t('info.vote.timerTitle') }}</h2>
        <p>{{ $t('info.vote.timerText', { time: formatTimeout(stepTimeout) }) }}</p>
      </template>
      <h2>{{ $t('info.vote.validateTitle') }}</h2>
      <p>{{ $t('info.vote.validateText') }}</p>
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
