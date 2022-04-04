<template>
  <div style="margin-bottom:20px;font-family:monospace;margin-right:20px">
    <select v-model="currentTile" @change="changeTile">
      <option v-for="(t, i) in tiles" :key="i" :value="i">
        {{ t.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "TilePanel",
  data() {
    return {
      currentTile: 0,
    };
  },
  props: {
    tiles: null,
  },

  methods: {
    changeTile() {
      this.$parent.$parent.$parent.changeTile(this.currentTile);
    },
  },
};
</script>