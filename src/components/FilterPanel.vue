<template>
  <vue-final-modal
    v-slot="{ close }"
    v-bind="$attrs"
    classes="modal-container"
    content-class="modal-content"
  >
    <div class="modal_content">
      <table>
        <tr>
          <th>Api Number:</th>
          <td style="text-align: center">
            <input v-model="api_number" type="text" />
          </td>
        </tr>
        <tr v-if="false">
          <th>Operator Name:</th>
          <td style="text-align: center">
            <input v-model="operator_name" type="text" />
          </td>
        </tr>
        <tr>
          <th>Show Permit Data Vertical Wells ?</th>
          <td style="text-align: center">
            <input v-model="markersVisible" type="checkbox" />
          </td>
        </tr>
        <tr>
          <th>Show Permit Data Horizontal Wells ?</th>

          <td style="text-align: center">
            <input v-model="polylineVisible" type="checkbox" />
          </td>
        </tr>
        <tr>
          <th>Show Well Data ?</th>
          <td style="text-align: center">
            <input v-model="wellDataVisible" type="checkbox" />
          </td>
        </tr>
        <tr>
          <th>Show Survey Layers Data?</th>

          <td style="text-align: center">
            <input v-model="surveyLayerVisible" type="checkbox" />
          </td>
        </tr>
      </table>
    </div>
    <div class="modal_action row d-flex mt-5">
      <button
        type="button"
        class="col-2 btn btn-success mr-1"
        @click="$emit('apply', this.api_number, this.markersVisible, this.polylineVisible, this.operator_name , this.surveyLayerVisible , this.wellDataVisible)"
      >
        Apply
      </button>
      &nbsp; &nbsp;
      <button
        type="button"
        class="col-2 btn btn-danger ml-2"
        @click="$emit('cancel', close)"
      >
        Cancel
      </button>
    </div>
    <button class="modal__close" @click="close">x</button>
  </vue-final-modal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal'

export default {
  components: {
    VueFinalModal
  },
  data() {
    return {
      api_number:'',
      operator_name: '',
      markersVisible: true,
      polylineVisible: true,
      surveyLayerVisible: true,
      wellDataVisible: true,
      without_bounds: false,
    }
  },


  name: 'FilterPanel',
  inheritAttrs: false
}
</script>

<style scoped>
::v-deep .modal-container {
  display: flex;
  width: 40%;
  left: 30%;
  justify-content: center;
  align-items: center;
}
::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90%;
  margin: 0 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #fff;
}
.modal__title {
  margin: 0 2rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}
.modal__content {
  flex-grow: 1;
  overflow-y: auto;
}
.modal__action {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  padding: 1rem 0 0;
}
.modal__close {
  background: red;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
</style>
