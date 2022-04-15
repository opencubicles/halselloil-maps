<template>
  <div style="height: 100vh; width: 100vw">
    <l-map
      v-model="zoom"
      v-model:zoom="zoom"
      :center="currentCenter"
      ref="map"
      :options="{
        keyboard: true,
        debounceMoveend: true,
        preferCanvas: true,
        doubleClickZoom: false,
        //dragging: this.enable_change,
        zoomControl: false
      }"
      :zoomAnimation="true"
      :zoomAnimationThreshold="1"
      :fadeAnimation="true"
      :noBlockingAnimations="true"
      @ready="refresh"
      @refresh="refresh"
      @update:center="centerUpdate"
    >
      <l-tile-layer :url="tileUrl" :options="tileOptions"> </l-tile-layer>
      <l-protobuf
        :options="optionsSurveySections"
        :properties="protoOptions"
        layer="survey_block_layer"
      />

      
      <l-protobuf
        :options="optionsSurveySections"
        :properties="protoOptions"
        layer="survey_section_layer"
      />

      <l-protobuf
        :options="optionsSurveyLines"
        :properties="protoOptions"
        layer="survey_lines_layer"
      />
      <l-protobuf
        :options="optionsSurveyPoints"
        :properties="protoOptions"
        layer="survey_points_layer"
      />

      <l-protobuf
        :options="optionsWellLines"
        :properties="protoOptions"
        layer="well_lines_layer"
      />

      <l-protobuf
        :options="optionsWellPoints"
        :properties="protoOptions"
        layer="well_points_layer"
      />

      <l-control position="topleft">
        <data-filter-panel v-model="show" @changeTile="currentTile = $event" />

        <filter-panel v-model="show" @apply="apply" @cancel="cancel" />

        <!--<button type="button" class="btn btn-success" @click="show = true">
          Filter Wells
        </button>-->
      </l-control>

      <l-control-zoom position="bottomright"></l-control-zoom>
    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LControl,
  LControlZoom
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import "@/assets/css/map.css";
import FilterPanel from "./components/FilterPanel";
import DataFilterPanel from "./components/DataFilterPanel";
import debounce from "lodash/debounce";

import { defineComponent } from "vue";
import { useFiltersStore } from "./stores/filters";

import LProtobuf from "./components/LProtobuf.vue";

export default defineComponent({
  setup() {
    const layers = useFiltersStore();
    return {
      layers
    };
  },

  components: {
    LMap,
    LTileLayer,
    LControl,
    LControlZoom,
    FilterPanel,
    DataFilterPanel,
    LProtobuf
  },

  data() {
    return {
      axiosCancelToken: undefined,
      zoom:6,
      prev_zoom: 6,
      last_fetched_data_zoom: 6,
      map: null,
      bounds: null,
      survey_block_layer: false,
      survey_section_layer: false,
      survey_points_layer: false,
      survey_lines_layer: false,
      well_points_layer: false,
      well_lines_layer: true,
      survey_block_layer_key: 0,
      parsed_data: {},
      currentCenter: [32.01579054148046, -102.0183563232422],
      api_number: "",
      operator_name: "",
      tiles: [
        {
          name: "OpenStreetMap",
          url:
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}?access_token={accessToken}",
          options: {
            maxZoom: 18,
            accessToken:
              "AAPK58bbc50dd13548f6bf6bd4612a4985bbfE54_c5swxaiy_PRJUf0Y2gKkGyVM_1QTy57NlmhD4k_JMPGRhtjg7VjQEwHkwWI",
            attribution: "Tiles &copy; Esri"
          }
        },
        {
          name: "OpenTopoMap",
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          options: {
            maxZoom: 17,
            attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          }
        }
      ],

      currentTile: 0
    };
  },

  computed: {
    optionsSurveySections() {
      return {
        weight: 2,
        color: "red",
        fillColor: "rgba(124,240,10,0.5)",
        fillOpacity: 0
      };
    },
    optionsWellLines() {
      return {
        weight: 2,
        color: "grey",
        fillColor: "rgba(124,240,10,0.5)",
        fillOpacity: 0
      };
    },
    optionsWellPoints() {
      return {
        color: "yellow"
      };
    },
    optionsSurveyBlocks() {
      return {
        weight: 4,
        fillColor: "rgba(124,240,10,0.5)",
        fillOpacity: 0,
        color: "black"
      };
    },

    optionsSurveyLines() {
      return {
        weight: 0.5,
        color: "blue"
      };
    },
    optionsSurveyPoints() {
      return {
        color: "black"
      };
    },

    protoOptions() {
      var bounds_cords = this.$refs.map.leafletObject.getBounds();
      var northWest = bounds_cords.getNorthWest(),
        southEast = bounds_cords.getSouthEast();

      return {
        north_west_lat: northWest.lat,
        north_west_lng: northWest.lng,
        south_east_lat: southEast.lat,
        south_east_lng: southEast.lng
      };
    },
    tileUrl() {
      return this.tiles[this.currentTile].url;
    },
    tileOptions() {
      return this.tiles[this.currentTile].options;
    }
  },
  methods: {
    centerUpdate(center) {
      this.currentCenter = center;
      console.log(center);
    },

    cancel(close) {
      // some code...
      close();
    },

    changeTile(current_tile) {
      this.currentTile = current_tile;
    },

    refresh() {
      this.map = this.$refs.map.leafletObject;
      this.bounds = this.map.getBounds();
      if (this.zoom >= 4) {
        this.fetchBackendData();
        const DEBOUNCE_TIME = 100;
        const vm_this = this;
        this.map.on(
          "dragend",
          debounce(function() {
            vm_this.fetchBackendData("dragend");
          }, DEBOUNCE_TIME)
        );
        this.map.on(
          "zoomend",
          debounce(function() {
            vm_this.fetchBackendData("zoomend");
          }, DEBOUNCE_TIME)
        );
      }
    },
    fetchBackendData(event) {
      if (this.zoom < 4) {
        return;
      }
      if (event == "zoomend" && this.prev_zoom < this.zoom) {
        this.prev_zoom = this.zoom;

        return;
      }

      this.prev_zoom = this.zoom;

      if (event == "zoomend" && this.last_fetched_data_zoom <= this.zoom) {
        return;
      }
      this.last_fetched_data_zoom = this.zoom;

      let show_any_survey_layers = this.layers.showLayers.lastIndexOf(
        "survey-layers"
      );
      if (show_any_survey_layers > -1) {
        let show_survey_block_layer = this.layers.showLayers.lastIndexOf(
          "survey-block-layer"
        );

        if (show_survey_block_layer > -1) {
          this.survey_block_layer = true;
        } else {
          this.survey_block_layer = false;
        }

        let show_survey_section_layer = this.layers.showLayers.lastIndexOf(
          "survey-section-layer"
        );

        if (show_survey_section_layer > -1) {
          this.survey_section_layer = true;
        } else {
          this.survey_section_layer = false;
        }

        let show_survey_points_layer = this.layers.showLayers.lastIndexOf(
          "survey-points-layer"
        );

        if (show_survey_points_layer > -1) {
          this.survey_points_layer = true;
        } else {
          this.survey_points_layer = false;
        }

        let show_survey_lines_layer = this.layers.showLayers.lastIndexOf(
          "survey-lines-layer"
        );

        if (show_survey_lines_layer > -1) {
          this.survey_lines_layer = true;
        } else {
          this.survey_lines_layer = false;
        }
      } else {
        this.survey_block_layer = false;
        this.survey_lines_layer = false;
        this.survey_points_layer = false;
        this.survey_section_layer = false;
      }

      // if(this.survey_block_layer){
      //   this.survey_block_layer += 1;
      // }
      // if(this.survey_section_layer){
      //   this.survey_section_layer = false
      //   this.survey_section_layer = true
      // }
      // if(this.survey_lines_layer){
      //   this.survey_lines_layer = false
      //   this.survey_lines_layer = true
      // }
      // if(this.survey_points_layer){
      //   this.survey_points_layer = false
      //   this.survey_points_layer = true
      // }
      // if(this.well_points_layer){
      //   this.well_points_layer = false
      //   this.well_points_layer = true
      // }
      // if(this.well_lines_layer){
      //   this.well_lines_layer = false
      //   this.well_lines_layer = true
      // }
    }
  }
});
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.css";
</style>