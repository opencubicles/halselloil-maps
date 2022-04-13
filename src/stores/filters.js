// @ts-check
import { defineStore } from 'pinia'

export const useFiltersStore = defineStore({
  id: 'filters',
  state: () => ({
    showLayers: [
      'survey-layers',
      'survey-block-layer',
      'survey-section-layer',
      'survey-lines-layer',
      'survey-points-layer'
    ],
    applyFilters: false
  }),
  getters: {
    layers: (state) =>
      state.showLayers.reduce((layers, layer) => {
        const existingLayer = layers.find((l) => l === layer)

        if (!existingLayer) {
          layers.push(layer)
        }

        return layers
      }, []),
  },
  actions: {
    
    toggleLayer(name) {
      const i = this.showLayers.lastIndexOf(name)
        if (i > -1) {
          this.showLayers.splice(i, 1)
        }else{
          this.showLayers.push(name)
        }      
    },
    applyFiltersMethod() {
    
      this.applyFilters =  true;
              
    }

  },
})
