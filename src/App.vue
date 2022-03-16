<template>
  <div style="height: 100vh; width: 100vw">
    <l-map
      v-model="zoom"
      v-model:zoom="zoom"
      :center="currentCenter"
      ref="map"
      :options="{
        keyboard: true,
        debounceMoveend: true
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
              <img style="width: 20px" src="./assets/symnum_11.png" />: Permit
              vertical Wells
            </li>
            <li class="list-group-item">Blue Line: Permit Horizontal Wells</li>
            <li class="list-group-item">
              <img style="width: 20px" src="./assets/symnum_10.png" /> Survey
              layer Point
            </li>
            <li class="list-group-item">Black Line: Survey layer LineString</li>
            <li class="list-group-item">Red Block: Survey Block layer</li>

            <li class="list-group-item">
              <img style="width: 20px" src="./assets/symnum_9.png" /> Well layer
              Point
            </li>
            <li class="list-group-item">Orange Line: Well layer LineString</li>
            <li class="list-group-item">Center: {{currentCenter}}</li>
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
        <l-popup :options="{autoPan: false}">
          <popup-content :parsed_data="parsed_data"> </popup-content>
        </l-popup>
      </l-feature-group>

      <l-feature-group ref="featureGroup">
        <template v-if="geo_json_data && surveyLayerVisible">
          <template v-for="(each_json,index) in geo_json_data" :key="index">
            <l-marker
              v-if="each_json.type == 'Point'"
              :lat-lng="each_json.coordinates"
              @click="openPopUp(each_json.coordinates, each_json.properties)"
            >
              <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
            </l-marker>
            <l-polygon
              v-if="each_json.type == 'Polygon'"
              :lat-lngs="each_json.coordinates"
              color="red"
              @click="openPopUp(each_json.coordinates[0][0], each_json.properties)"
            >
            </l-polygon>
            <l-polyline
              v-if="each_json.type == 'LineString'"
              :lat-lngs="each_json.coordinates"
              color="black"
              @click="openPopUp(each_json.coordinates[0], each_json.properties)"
            >
            </l-polyline>
          </template>
        </template>

        <template v-if="well_json_data  && wellDataVisible">
          <template v-for="(each_json,index) in well_json_data" :key="index">
            <l-marker
              v-if="each_json.type == 'Point'"
              :lat-lng="each_json.coordinates"
              color="orange"
              @click="openPopUp(each_json.coordinates, each_json.properties)"
            >
              <l-icon :icon-url="iconWellUrl" :icon-size="iconSize" />
            </l-marker>
            <l-polygon
              v-if="each_json.type == 'Polygon'"
              :lat-lngs="each_json.coordinates"
              color="grey"
              @click="openPopUp(each_json.coordinates[0][0], each_json.properties)"
            >
            </l-polygon>
            <l-polyline
              v-if="each_json.type == 'LineString'"
              :lat-lngs="each_json.coordinates"
              color="orange"
              @click="openPopUp(each_json.coordinates[0], each_json.properties)"
            >
            </l-polyline>
          </template>
        </template>

        <template v-if="well_data_polylines && polylineVisible">
          <l-polyline
            v-for="(each_polyline,index) in resultQueryPolylines"
            :key="index"
            :lat-lngs="each_polyline.well_coordinates"
            color="blue"
            @click="openPopUp(each_polyline.well_coordinates[0], each_polyline.parsed_data)"
          >
          </l-polyline>
        </template>

        <template v-if="well_data_markers && markersVisible">
          <l-marker
            v-for="(each_polyline, index) in resultQueryMarkers"
            :key="index"
            :lat-lng="each_polyline.well_coordinates[0]"
            color="red"
            @click="openPopUp(each_polyline.well_coordinates[0], each_polyline.parsed_data)"
          >
            <l-icon :icon-url="iconPermitMarkerImage" :icon-size="iconSize" />
          </l-marker>
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
  LControl

 } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import iconImage from "@/assets/symnum_10.png";
import iconPermitMarkerImage from "@/assets/symnum_11.png";
import iconWellUrl from "@/assets/symnum_9.png";
import FilterPanel from './components/FilterPanel';

import TilePanel from './components/TilePanel';
import PopupContent from './components/PopupContent';

import axios from 'axios';
import Qs from 'qs';

export default {
  components: {
    LMap,
    LIcon,
    LTileLayer,
    LMarker,
    LControl,
    LPolygon,
    LPolyline,
    LPopup,
    PopupContent,
    LFeatureGroup,
    FilterPanel,
    TilePanel
  },

  data() {
    return {
      zoom: 14,
      map:null,
      bounds: null,
      show: false,
      geo_json_data:{},
      well_json_data:{},
      well_data_markers:[],
      well_data_polylines:[],
      currentCenter: [32.042356500077, -95.707149188658],
      iconWidth: 12.5,
      iconHeight: 20,
      api_number:'',
      operator_name: '',
      cancelSource: null,
      parsed_data: null,
      wellDataVisible: true,
      surveyLayerVisible: true,
      markersVisible: true,
      polylineVisible: true,
      without_bounds: false,

      tiles: [
        {
          name: 'OpenStreetMap',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        },
        {
          name: 'OpenTopoMap',
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          }
        }

      ],

      currentTile: 0,

    };
  },

  computed: {
    iconUrl() {
      return iconImage;
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
      return this.tiles[this.currentTile].url
    },
    tileOptions () {
      return this.tiles[this.currentTile].options
    },
    resultQueryMarkers(){

      return this.well_data_markers.filter((item)=>{
        return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'N'
      });

    },
    resultQueryPolylines(){

      return this.well_data_polylines.filter((item)=>{
        return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'Y'
      });

    }
  },
  methods: {
    openPopUp (latLng, parsed_data) {

      this.parsed_data = parsed_data;
      this.$refs.features.leafletObject.openPopup(latLng);
    },

    centerUpdate(center) {
      this.currentCenter = center;
    },
    reFitBounds() {
      if(this.api_number != '' || this.operator_name != ''){

        //10334501
        setTimeout(() => {
          if(this.well_data_markers.length == 1 && (!this.well_data_polylines || this.well_data_polylines.length == 0)){
            // changing the center to the current found marker's cordinates, we just cannot
            //fit bound for one marker as getBounds needs atleast two diffrerent cordinates
            this.currentCenter = this.well_data_markers[0].well_coordinates[0];
            this.currentZoom = 8;

          }else{
            const new_bounds = this.$refs.featureGroup.leafletObject.getBounds();

            if(new_bounds.isValid()){
               this.$refs.map.leafletObject.fitBounds(new_bounds);

            }

          }


        }, 1000);

        setTimeout(() => {
          if(this.api_number != '' || this.markersVisible != 'false' || this.polylineVisible != 'false' || this.wellDataVisible != 'false' || this.surveyLayerVisible != 'false'){
            this.without_bounds = false;
            this.getWellData()
          }


        }, 2500);

      }
    },
    apply(api_number , show_markers, show_polylines, operator_name , show_survey_layers, show_well_data) {

      this.markersVisible = show_markers;
      this.polylineVisible = show_polylines;
      this.surveyLayerVisible = show_survey_layers;
      this.wellDataVisible = show_well_data;
      if(api_number != '' || operator_name != ''){
        this.without_bounds = true;

      }else{
        this.without_bounds = false;

      }
      this.api_number = api_number
      this.operator_name = operator_name
      this.show=false;
      if(this.api_number != '' || this.operator_name != '' || this.markersVisible != 'false' || this.polylineVisible != 'false' || this.wellDataVisible != 'false' || this.surveyLayerVisible != 'false'){
        this.getWellData()
      }

      if(this.api_number != ''){

        this.reFitBounds()

      }

    },
    cancel(close) {
      // some code...
      close()
    },

    changeTile(current_tile){

      this.currentTile = current_tile
    },

    getWellData(){
      var qs = Qs;
      var vm = this;
      this.cancelSearch();
      this.cancelSource = axios.CancelToken.source();
      var cancelSourceToken = this.cancelSource.token;
      var par = {};

      this.map = this.$refs.map.leafletObject;
      if(this.without_bounds){
        if(this.operator_name != ''){
          par['operator_name'] = this.operator_name;

        }

        if(this.api_number != ''){
          par['api_number'] = this.api_number;

        }
        par['show_markers'] = this.markersVisible;

        par['show_polylines'] = this.polylineVisible;
        par['show_well_data'] = this.wellDataVisible;
        par['show_survey_layers'] = this.surveyLayerVisible;

        par['without_bounds'] = this.without_bounds;
      }
      else{

        this.bounds_cords = this.map.getBounds();

        var bounds_cords = this.bounds_cords;

        var northWest = bounds_cords.getNorthWest(),
          northEast = bounds_cords.getNorthEast(),
          southWest = bounds_cords.getSouthWest(),
          southEast = bounds_cords.getSouthEast();


        par = {'north_west_lat' : northWest.lat ,
        'north_west_lng': northWest.lng,
        'north_east_lat': northEast.lat,

        'north_east_lng': northEast.lng,

        'south_west_lat': southWest.lat,

        'south_west_lng': southWest.lng,

        'south_east_lat': southEast.lat,

        'south_east_lng': southEast.lng,
        'show_markers' : this.markersVisible,
        'show_polylines' : this.polylineVisible,
        'show_well_data' : this.wellDataVisible,
        'show_survey_layers' : this.surveyLayerVisible,
        'api_number'  : this.api_number,
        'without_bounds' : false
        }

      }
      console.log(par);
        axios.get('https://halselloil.com/api_leaflet2.php', {
        cancelToken: cancelSourceToken,
        params: par,
        paramsSerializer: params => {

          return qs.stringify(params)

        }

      })
      .then(function (response) {
        vm.well_data_markers = null;
        vm.well_data_json = null;
        vm.well_data_polylines = null;
        vm.geo_json_data = null;
        vm.cancelSource = null;

        if(response.data.result && response.data.result == 'error'){
          alert('test');

        }else{
         console.log(response)
          if(response.data.parsed_data){
            vm.well_data_markers = response.data.parsed_data.filter((item)=>{
             return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'N'
           });
            vm.well_data_polylines = response.data.parsed_data.filter((item)=>{
             return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'Y'
          });

          }

          var well_data_json = {};
          well_data_json = response.data.well_data_json;

          vm.well_json_data = well_data_json;

          var json_data = {};
          json_data = response.data.geo_json;

          vm.geo_json_data = json_data;


        }

      })
      .catch(function (error) {
        vm.well_data = null;
        vm.well_json_data = null;

        console.log(error);
      })
      .then(function () {
        // always executed

      });
    },
    cancelSearch () {
      if (this.cancelSource) {
        this.cancelSource.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    refresh(){
        if(this.zoom >= 8){
          this.getWellData(this.bounds);
          var vm_this = this;
          this.map.on('dragend', () => {
              var vm_this_2 = vm_this;
              setTimeout(() => {
              vm_this_2.bounds = vm_this_2.map.getBounds();
                  vm_this_2.getWellData(vm_this_2.bounds);
              }, 100)

          });

          this.map.on('zoomend', () => {
              var vm_this_2 = vm_this;
              setTimeout(() => {
              vm_this_2.bounds = vm_this_2.map.getBounds();
                  vm_this_2.getWellData(vm_this_2.bounds);
              }, 100)
          });


        }else{
          this.well_data= null;
          this.geo_json_data= null;
          this.well_json_data= null;

        }


    },

  },
};
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.css";
</style>
