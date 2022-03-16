<template>
  <div style="max-height:500px;max-width:500px;min-width:300px;overflow-x:auto;overflow-y:auto;">
    <table style="background-color:lightgrey" class="table">

     <tr v-for="(each_data , data_index) in parsed_data"  :key="data_index">
        <th>
        {{data_index}}
        </th>
        
        <td>
        {{each_data}}
        </td>
        
      </tr>

    </table>
  </div>
</template>

<script>
export default {
  name: 'PopupContent',
  props:{
    parsed_data: null
  }
}
</script>
