<template>
  <div class="home">

    <button @click="joinRoom">Rejoindre une room</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import * as requests from "@/api/services";

export default defineComponent({
  name: "HomeView",
  components: {
    HelloWorld,
  },

  async mounted() {
    let rooms = await requests.getAll("room");
    console.log(rooms);
  },

  methods: {
    async joinRoom() {
      await requests.post("room/join", { code: "S36T", watcher_name: "test"});

    },
  },
});
</script>
