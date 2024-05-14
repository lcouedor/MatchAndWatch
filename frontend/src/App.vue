<template>
  <div id="mainApp">
    <router-view />
  </div>
</template>

<script>
import "@/assets/style/main.scss"

export default {
  name: 'App',
  mounted() {
    document.title = "Match&Watch";
  },
  methods: {

  },
}
</script>