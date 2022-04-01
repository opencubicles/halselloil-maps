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
        dragging: this.enable_change,
        zoomControl: this.enable_change,
      }"
      @ready="refresh"
      @update:center="centerUpdate"
    >
      <l-tile-layer :url="tileUrl" :options="tileOptions"> </l-tile-layer>

      <l-control position="topright">
        <tile-panel :tiles="tiles" @changeTile="changeTile"> </tile-panel>
      </l-control>

      <l-control position="bottomleft">
        <div>
          <ul class="list-group list-group-horizontal">
            <li class="list-group-item">
              <img style="width: 20px" src="./assets/map_icons/symnum_10.png" />
              Survey layer Abspt
              <img
                style="width: 20px"
                v-show="show_survey_abspt_loader"
                src="./assets/map_icons/loader.png"
              />
            </li>
            <li class="list-group-item">
              Black Line: Survey layer LineString
              <img
                style="width: 20px"
                v-show="show_survey_l_data_loader"
                src="./assets/map_icons/loader.png"
              />
            </li>
            <li class="list-group-item">
              Red Block: Survey Block layer
              <img
                style="width: 20px"
                v-show="show_survey_p_data_loader"
                src="./assets/map_icons/loader.png"
              />
            </li>

            <li class="list-group-item">
              <img style="width: 20px" src="./assets/map_icons/symnum_9.png" />
              Well layer Point
              <img
                style="width: 20px"
                v-show="show_well_points_data_loader"
                src="./assets/map_icons/loader.png"
              />
            </li>
            <li class="list-group-item">
              Purple Line: Well layer LineString
              <img
                style="width: 20px"
                v-show="show_well_lines_data_loader"
                src="./assets/map_icons/loader.png"
              />
            </li>

            <li class="list-group-item">Center: {{ currentCenter }}</li>
            <li class="list-group-item">Zoom: {{ zoom }}</li>
          </ul>
        </div>
      </l-control>

      <l-control position="bottomright">
        <filter-panel v-model="show" @apply="apply" @cancel="cancel" />

        <button type="button" class="btn btn-success" @click="show = true">
          Filter Wells
        </button>
      </l-control>

      <l-feature-group ref="features">
        <l-popup :options="{ autoPan: false }">
          <popup-content v-if="parsed_data" :parsed_data="parsed_data">
          </popup-content>
        </l-popup>
      </l-feature-group>
      <l-feature-group ref="featureGroup">
        <template v-if="survey_abspt_points && show_survey_abspt">
          <l-marker
            v-for="each_surveypoint in survey_abspt_points"
            :key="each_surveypoint._id"
            :lat-lng="each_surveypoint._source.geometry.coordinates"
            @click="
              openPopUp(
                each_surveypoint._source.geometry.coordinates,
                each_surveypoint._source.properties
              )
            "
          >
            <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
          </l-marker>
        </template>
        <template
          v-if="well_points_data && show_well_points_data && zoom >= 14"
        >
          <l-marker
            v-for="each_wellpoint in well_points_data"
            :key="each_wellpoint._id"
            :lat-lng="each_wellpoint._source.geometry.coordinates"
            @click="
              openPopUp(
                each_wellpoint._source.geometry.coordinates,
                each_wellpoint._source.properties
              )
            "
          >

          <l-icon v-if="each_wellpoint._source.properties.SYMNUM == 4" :icon-url="iconWellUrl" :icon-size="iconSize" />
          <l-icon v-if="each_wellpoint._source.properties.SYMNUM != 4" :icon-url="iconWellUrl" :icon-size="iconSize" />

          </l-marker>
        </template>
        <template v-if="well_lines_data && show_well_lines_data && zoom >= 14"
          ><!--smoothFactor incrases, performance increases, detail decreases-->
          <l-polyline
            smoothFactor="8"
            v-for="each_wellline in well_lines_data"
            :key="each_wellline._id"
            :lat-lngs="each_wellline._source.geometry.coordinates"
            color="purple"
            @click="
              openPopUp(
                each_wellline._source.geometry.coordinates[0],
                each_wellline._source.properties
              )
            "
          >
          </l-polyline>
        </template>

        <template v-if="survey_p_data && show_survey_p_data">
          <l-polygon
            v-for="each_survey_p_data in survey_p_data"
            :key="each_survey_p_data._id"
            :lat-lngs="each_survey_p_data._source.geometry.coordinates"
            color="red"
          >
          </l-polygon>
        </template>
        <template v-if="survey_l_data && show_survey_l_data">
          <l-polyline
            v-for="each_survey_l_data in survey_l_data"
            :key="each_survey_l_data._id"
            :lat-lngs="each_survey_l_data._source.geometry.coordinates"
            color="black"
            @click="
              openPopUp(
                each_survey_l_data._source.geometry.coordinates[0],
                each_survey_l_data._source.properties
              )
            "
          >
          </l-polyline>
        </template>
      </l-feature-group>
    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LPolygon,
  LPolyline,
  LIcon,
  LFeatureGroup,
  LControl,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import iconImage from "@/assets/map_icons/symnum_10.png";
import iconPermitMarkerImage from "@/assets/map_icons/symnum_11.png";
import iconWellUrl from "@/assets/map_icons/symnum_9.png";
import FilterPanel from "./components/FilterPanel";
import Loader from "./components/Loader";

import TilePanel from "./components/TilePanel";
import PopupContent from "./components/PopupContent";
import debounce from "lodash/debounce";
import axios from "axios";
import Qs from "qs";

export default {
  components: {
    LMap,
    LIcon,
    LTileLayer,
    LMarker,
    LPolygon,
    LPolyline,
    LControl,
    LPopup,
    PopupContent,
    LFeatureGroup,
    FilterPanel,
    TilePanel,
    Loader,
  },

  data() {
    return {
      axiosCancelToken: undefined,
      zoom: 14,
      prev_zoom: 14,
      last_fetched_data_zoom: 14,
      map: null,
      bounds: null,
      show: false,
      show_survey_abspt: true,
      show_survey_p_data: true,
      show_survey_l_data: true,
      enable_change: true,
      show_well_points_data: true,
      show_well_lines_data: true,

      survey_abspt_points: {},
      survey_p_data: {},
      survey_l_data: {},
      well_points_data: {},
      well_lines_data: {},
      parsed_data: {},
      currentCenter: [32.000000, -102.000000],
      iconWidth: 12.5,
      iconHeight: 20,
      api_number: "",
      operator_name: "",
      show_survey_abspt_loader: true,

      show_survey_p_data_loader: true,

      show_survey_l_data_loader: true,

      show_well_points_data_loader: true,

      show_well_lines_data_loader: true,

      tiles: [
        {
          name: "OpenStreetMap",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          options: {
            maxZoom: 19,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        {
          name: "OpenTopoMap",
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          options: {
            maxZoom: 17,
            attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          },
        },
      ],

      currentTile: 0,
    };
  },

  computed: {
    iconUrl() {
      return iconImage;
    },
    show_loader() {
      return this.show_survey_p_data_loader;
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
    },
  },
  methods: {
    openPopUp(latLng, parsed_data) {
      this.parsed_data = parsed_data;

      this.$refs.features.leafletObject.openPopup(latLng);
    },

    centerUpdate(center) {
      this.currentCenter = center;
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
      if (this.zoom >= 10) {
        this.fetchBackendData();

        const vm_this = this;
        this.map.on(
          "dragend",
          debounce(function () {
            vm_this.fetchBackendData("dragend");
          }, DEBOUNCE_TIME)
        );
        this.map.on(
          "zoomend",
          debounce(function () {
            vm_this.fetchBackendData("zoomend");
          }, DEBOUNCE_TIME)
        );
      }
    },
    fetchBackendData(event) {

      if (this.zoom < 12) {
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
        api_number: this.api_number,
      };
      this.survey_abspt_points = null;
      this.survey_p_data = null;
      this.survey_l_data = null;
      this.well_points_data = null;
      this.well_lines_data = null;
      this.enable_change = false;
      if (this.show_survey_abspt) {
        par["show_survey_abspt"] = this.show_survey_abspt;

        this.show_survey_abspt_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/test_search2.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
            }
          )
          .then(function (response) {
            vm.well_data_json = null;
            vm.geo_json_data = null;

            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.survey_abspt_points = response.data.survey_abspt_points;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(function () {
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
          api_number: this.api_number,
        };
        par["show_survey_p_data"] = this.show_survey_p_data;

        this.show_survey_p_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/test_search2.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
            }
          )
          .then(function (response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.survey_p_data = response.data.survey_p_data;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(function () {
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
          api_number: this.api_number,
        };
        par["show_survey_l_data"] = this.show_survey_l_data;
        this.show_survey_l_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/test_search2.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
            }
          )
          .then(function (response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.survey_l_data = response.data.survey_l_data;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(function () {
            // always executed
            vm.show_survey_l_data_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_well_lines_data && this.zoom >= 14) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number,
        };
        par["show_well_lines_data"] = this.show_well_lines_data;

        this.show_well_lines_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/test_search2.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
            }
          )
          .then(function (response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.well_lines_data = response.data.well_lines_data;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(function () {
            // always executed
            vm.show_well_lines_data_loader = false;
            vm.enable_change = true;
          });
      }

      if (this.show_well_points_data && this.zoom >= 14) {
        par = {
          north_west_lat: northWest.lat,
          north_west_lng: northWest.lng,
          south_east_lat: southEast.lat,
          south_east_lng: southEast.lng,
          api_number: this.api_number,
        };
        par["show_well_points_data"] = this.show_well_points_data;

        this.show_well_points_data_loader = true;
        axios
          .get(
            "https://dev-halselloil.opencubicles.com/search_data/test_search2.php",
            {
              cancelToken: this.axiosCancelToken.token,
              params: par,
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
            }
          )
          .then(function (response) {
            if (response.data.result && response.data.result == "error") {
              console.log("error");
            } else {
              vm.well_points_data = response.data.well_points_data;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(function () {
            // always executed
            vm.show_well_points_data_loader = false;
            vm.enable_change = true;
          });
      }
    },
  },
};
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.css";
</style>
