<template>
    <div id="modaleInfo" class="modal">
        <div class="dismissModal">
            <div class="dismissButton" @click="dismissModal">✗</div>
        </div>
        <div class="backdrop"></div>

        <div class="modalBody">
            <h2>1. Trouve des gens avec qui tu veux regarder quelque chose</h2>
            <p>(Si tu es tout seul tu peux toujours utiliser Match & Watch pour découvrir des films)</p>
            <p>(Mais essaye de trouver des gens quand même, c'est sympa tu verras)</p>

            <h2>2. Match avec les films les plus CHAUDS de TA room</h2>
            <p>Question simple : Ça te dirait de voir ce film ?</p>
            <p>Si oui tu likes, sinon ça part (après si quelqu'un d'autre le like on peut rien pour toi, pour l'instant ...)</p>

            <h2>3. Classe les films</h2>
            <p>Tu dois classer les films likés par tous les membres de ta room</p>
            <p>(Si tu n'as absolument pas envie de voir un film c'est possible aussi)</p>

            <h2>4. Bon visionnage</h2>
            <p>En espérant que tu apprécies le film sélectionné pour ta room</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ModaleInfo',

    methods: {
        dismissModal() {
            this.$parent.hideModal('modaleInfo');
        }
    }
}
</script>