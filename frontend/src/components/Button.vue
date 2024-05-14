<template>
    <button class="customBigBtn">
        {{ text }}
    </button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        text: String,
    },

}
</script>