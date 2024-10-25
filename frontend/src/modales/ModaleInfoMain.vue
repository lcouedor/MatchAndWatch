<template>
    <div id="modaleInfoMain" class="modal">
        <div class="dismissModal">
            <div class="dismissButton" @click="dismissModal">✗</div>
        </div>
        <div class="backdrop"></div>

        <div class="modalBody" v-if="page == 1">
            swipe
        </div>

        <div class="modalBody" v-if="page == 2">
            vote
        </div>

    </div>
</template>

<script>
export default {
    name: 'ModaleInfoMain',

    props: {
        page: {
            type: Number,
        }
    },

    methods: {
        dismissModal() {
            this.$parent.displayInfo();
        }
    }
}
</script>