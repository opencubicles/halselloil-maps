<template>
  <div style="margin-bottom:20px;font-family:monospace;margin-right:20px">
    <input type="text" v-model="searchQuery" placeholder="Search (eg. '00348509')" />
    &nbsp;
    <button @click="filterWells">Search!</button>

  </div>
</template>

<script>
export default {
  name: 'FilterPanel',
  data() {
    return {
      searchQuery: '',
      }
  },
  
  methods: {
    filterWells(){
        this.$parent.filterWells(this.searchQuery);
    }
  }
}
</script>
