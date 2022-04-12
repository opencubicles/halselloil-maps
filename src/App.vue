<template>
  <div style="height: 100vh; width: 100vw">
    <loader v-show="show_loader"> </loader>
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
      @ready="refresh"
      @update:center="centerUpdate"
      @refresh="refresh"
    >
     <l-protobuf />
      <l-tile-layer :url="tileUrl" :options="tileOptions"> </l-tile-layer>

      <l-control position="topleft">
        <data-filter-panel v-model="show" @changeTile="currentTile = $event" />

        <filter-panel v-model="show" @apply="apply" @cancel="cancel" />

        <!--<button type="button" class="btn btn-success" @click="show = true">
          Filter Wells
        </button>-->
      </l-control>

      <l-control-zoom position="bottomright"></l-control-zoom>

      <l-feature-group ref="features">
        <l-popup :options="{ autoPan: false }">
          <popup-content :parsed_data="parsed_data"> </popup-content>
        </l-popup>
      </l-feature-group>

      <l-feature-group ref="featureGroup">
        <template v-if="survey_abspt_points && show_survey_abspt">
          <l-geo-json :geojson="survey_abspt_points"> </l-geo-json>
          
        </template>
        <template v-if="well_points_data && show_well_points_data">
          <l-geo-json :geojson="well_points_data"> </l-geo-json>
          
        </template>
        <template v-if="well_lines_data && show_well_lines_data">
          <l-geo-json :geojson="well_lines_data"> </l-geo-json>
        </template>

        <template v-if="survey_p_data && show_survey_p_data">
          

          <l-geo-json :geojson="survey_p_data" :options="options"> </l-geo-json>

          <l-geo-json
            v-if="survey_group_data"
            :geojson="survey_group_data"
            :options="options2"
          >
          </l-geo-json>

          
        </template>
        <template v-if="survey_l_data && show_survey_l_data">
          <l-geo-json
            :geojson="survey_l_data"
            :options="options2"
            :options-style="styleFunction"
          ></l-geo-json>
          
        </template>
      </l-feature-group>
    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LPopup,
  LFeatureGroup,
  LControl,
  LGeoJson,
  LControlZoom
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import "@/assets/css/map.css";
import iconImage from "@/assets/map_icons/symnum_10.png";
import iconPermitMarkerImage from "@/assets/map_icons/symnum_11.png";
import iconWellUrl from "@/assets/map_icons/symnum_9.png";
import FilterPanel from "./components/FilterPanel";
import DataFilterPanel from "./components/DataFilterPanel";
import Loader from "./components/Loader";
import debounce from "lodash/debounce";

import PopupContent from "./components/PopupContent";

import { defineComponent } from "vue";
import { useFiltersStore } from "./stores/filters";

import axios from "axios";
import Qs from "qs";

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
    LPopup,
    PopupContent,
    LFeatureGroup,
    FilterPanel,
    DataFilterPanel,
    Loader,
    LGeoJson,
    LProtobuf
  },

  data() {
    return {
      axiosCancelToken: undefined,
      zoom: 12,
      prev_zoom: 12,
      last_fetched_data_zoom: 12,
      map: null,
      bounds: null,
      show: false,
      show_survey_abspt: false,
      show_survey_p_data: true,
      show_survey_l_data: false,
      enable_change: true,
      show_well_points_data: false,
      show_well_lines_data: false,
      showModal: false,
      survey_abspt_points: {},
      survey_p_data: {},
      survey_group_data: {},
      survey_l_data: {},
      well_points_data: {},
      well_lines_data: {},
      parsed_data: {},
      currentCenter: [32.01579054148046, -102.0183563232422],
      iconWidth: 15,
      iconHeight: 15,
      api_number: "",
      operator_name: "",
      show_survey_abspt_loader: true,

      show_survey_p_data_loader: true,

      show_survey_l_data_loader: true,

      show_well_points_data_loader: true,

      show_well_lines_data_loader: true,
      enableTooltip: true,
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
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction
      };
    },
    onEachFeatureFunction() {
      if (!this.enableTooltip) {
        return () => {};
      }
      return (feature, layer) => {
        layer.setStyle({ weight: "1" });
        layer.setStyle({ color: "grey" });

        // layer.bindTooltip(
        //   "<div>"+feature.properties.LEVEL2_BLO+"</div>",
        //   { permanent: true, sticky: false }
        // );
      };
    },

    options2() {
      return {
        onEachFeature: this.onEachFeatureFunction2
      };
    },

    onEachFeatureFunction2() {
      if (!this.enableTooltip) {
        return () => {};
      }
      return (feature, layer) => {
        layer.setStyle({ fillColor: "white" });
        layer.setStyle({ fillOpacity: "0" });
        layer.setStyle({ color: "black" });

        layer.bindTooltip("<div>BLK: " + feature.properties.block + "</div>", {
          permanent: true,
          sticky: true
        });
      };
    },
    iconUrl() {
      return iconImage;
    },
    show_loader() {
      return false;
    },

    iconPermitMarkerImage() {
      return iconPermitMarkerImage;
    },
    iconWellUrl() {
      return iconWellUrl;
    },

    iconSize() {
      return [this.iconWidth, this.iconHeight];
    },
    tileUrl() {
      return this.tiles[this.currentTile].url;
    },
    tileOptions() {
      return this.tiles[this.currentTile].options;
    }
  },
  methods: {
    openPopUp(latLng, parsed_data) {
      this.parsed_data = parsed_data;

      this.$refs.features.leafletObject.openPopup(latLng);
    },

    getMarkerIcon(symnum) {
      try {
        return require(`@/assets/map_icons/symnum_${symnum}.png`);
      } catch (e) {
        return require(`@/assets/map_icons/symnum_9.png`);
      }
    },

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
      const DEBOUNCE_TIME = 600;
      if (this.zoom >= 8) {
        this.fetchBackendData();

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
      console.log();

      const i = this.layers.showLayers.lastIndexOf("survey-layers");
      if (i > -1) {
        this.show_survey_p_data = true;

        this.show_survey_l_data = false;
        this.show_survey_abspt = false;
      } else {
        this.show_survey_p_data = false;
        this.show_survey_l_data = false;
        this.show_survey_abspt = false;
      }
      if (this.zoom < 6) {
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

      if (typeof this.axiosCancelToken !== typeof undefined) {
        this.axiosCancelToken.cancel("Cancelled due to request override");
      }

      this.axiosCancelToken = axios.CancelToken.source();
      this.map = this.$refs.map.leafletObject;
      this.bounds_cords = this.map.getBounds();
      var bounds_cords = this.bounds_cords;

      var northWest = bounds_cords.getNorthWest(),
        southEast = bounds_cords.getSouthEast();

      var qs = Qs;
      var vm = this;
      var par = {
        north_west_lat: northWest.lat,
        north_west_lng: northWest.lng,
        south_east_lat: southEast.lat,
        south_east_lng: southEast.lng,
        api_number: this.api_number
      };
      this.survey_abspt_points = null;
      this.survey_p_data = null;
      this.survey_group_data = null;
      this.survey_l_data = null;
      this.well_points_data = null;
      this.well_lines_data = null;
      this.enable_change = false;
      if (this.show_survey_abspt) {
        par["show_survey_abspt"] = this.show_survey_abspt;

        this.show_survey_abspt_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/leaflet_helper.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: params => {
                return qs.stringify(params);
              }
            }
          )
          .then(function(response) {
            vm.well_data_json = null;
            vm.geo_json_data = null;

            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.survey_abspt_points = response.data;
            }
          })
          .catch(function(error) {
            console.log(error);
          })
          .then(function() {
            // always executed
            vm.show_survey_abspt_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_survey_p_data) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number
        };
        par["show_survey_p_data"] = this.show_survey_p_data;

        this.show_survey_p_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/layer_helper.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: params => {
                return qs.stringify(params);
              }
            }
          )
          .then(function(response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.survey_p_data = response.data.survey_p_data;
              vm.survey_group_data = response.data.survey_group_data;
            }
          })
          .catch(function(error) {
            console.log(error);
          })
          .then(function() {
            // always executed
            vm.show_survey_p_data_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_survey_l_data) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number
        };
        par["show_survey_l_data"] = this.show_survey_l_data;
        this.show_survey_l_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/leaflet_helper.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: params => {
                return qs.stringify(params);
              }
            }
          )
          .then(function(response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              console.log(response.data.survey_l_data);
              vm.survey_l_data = response.data.survey_l_data;
            }
          })
          .catch(function(error) {
            console.log(error);
          })
          .then(function() {
            // always executed
            vm.show_survey_l_data_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_well_lines_data && this.zoom >= 8) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number
        };
        par["show_well_lines_data"] = this.show_well_lines_data;

        this.show_well_lines_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/leaflet_helper.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: params => {
                return qs.stringify(params);
              }
            }
          )
          .then(function(response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.well_lines_data = response.data;
            }
          })
          .catch(function(error) {
            console.log(error);
          })
          .then(function() {
            // always executed
            vm.show_well_lines_data_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_well_points_data && this.zoom >= 8) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number
        };
        par["show_well_points_data"] = this.show_well_points_data;

        this.show_well_points_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/leaflet_helper.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: params => {
                return qs.stringify(params);
              }
            }
          )
          .then(function(response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.well_points_data = response.data;
            }
          })
          .catch(function(error) {
            console.log(error);
          })
          .then(function() {
            // always executed
            vm.show_well_points_data_loader = false;
            vm.enable_change = true;
          });
      }
    }
  }
});
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.css";
</style>
