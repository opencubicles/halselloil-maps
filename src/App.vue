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
              <img style="width: 20px" src="./assets/symnum_10.png" /> Survey
              layer Abspt
              <img style="width: 20px" v-show="showSurveyAbsptLoader" src="./assets/loader.png" />

            </li>
            <li class="list-group-item">Black Line: Survey layer LineString
            <img style="width: 20px" v-show="showSurveyLDataLoader" src="./assets/loader.png" />

            </li>
            <li class="list-group-item">Red Block: Survey Block layer <img style="width: 20px" v-show="showSurveyPDataLoader" src="./assets/loader.png" /></li>

            <li class="list-group-item">
              <img style="width: 20px" src="./assets/symnum_9.png" /> Well layer
              Point
              <img style="width: 20px" v-show="showWellPointsDataLoader" src="./assets/loader.png" />

            </li>
            <li class="list-group-item">Purple Line: Well layer LineString
            <img style="width: 20px" v-show="showWellLinesDataLoader" src="./assets/loader.png" />

            </li>

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
        <template v-if="survey_abspt_points && show_survey_abspt">
          
              <l-marker v-for="(each_surveypoint,index) in survey_abspt_points" :key="index"
                
                :lat-lng="each_surveypoint._source.geometry.coordinates"

                @click="openPopUp(each_surveypoint._source.geometry.coordinates, 
                each_surveypoint._source.properties)"
              >
                <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
              </l-marker>
        </template>
        <template v-if="well_points_data && show_well_points_data">
          
              <l-marker v-for="(each_wellpoint,index) in well_points_data" :key="index"
                
                :lat-lng="each_wellpoint._source.geometry.coordinates"

                @click="openPopUp(each_wellpoint._source.geometry.coordinates, 
                each_wellpoint._source.properties)"
              >
                <l-icon :icon-url="iconWellUrl" :icon-size="iconSize" />
              </l-marker>
        </template>

        <template v-if="well_lines_data && show_well_lines_data">
          
            <l-polyline

              v-for="(each_wellline,index) in well_lines_data" :key="index"
              :lat-lngs="each_wellline._source.geometry.coordinates"
              color="purple"
              @click="openPopUp(each_wellline._source.geometry.coordinates[0], each_wellline._source.properties)"
            >
            </l-polyline>
              
        </template>
        
        <template v-if="survey_p_data && show_survey_p_data">
          
            <l-polygon
              v-for="(each_survey_p_data,index) in survey_p_data" :key="index"
              :lat-lngs="each_survey_p_data._source.geometry.coordinates"
              color="red"
              @click="openPopUp(each_survey_p_data._source.geometry.coordinates[0][0], each_survey_p_data._source.properties)"
            >
            </l-polygon>
              
        </template>
        <template v-if="survey_l_data && show_survey_l_data">
          
            <l-polyline

              v-for="(each_survey_l_data,index) in survey_l_data" :key="index"
              :lat-lngs="each_survey_l_data._source.geometry.coordinates"
              color="black"
              @click="openPopUp(each_survey_l_data._source.geometry.coordinates[0], each_survey_l_data._source.properties)"
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
    LPolygon,
    LPolyline,  
    LControl,
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
      show_survey_abspt: true,
      show_survey_p_data: true,
      show_survey_l_data: true,

      show_well_points_data: true,
      show_well_lines_data: true,
      
      survey_abspt_points: {},
      survey_p_data: {},
      survey_l_data: {},
      well_points_data: {},
      well_lines_data: {},
      currentCenter: [30.099098, -103.660126],
      iconWidth: 12.5,
      iconHeight: 20,
      api_number:'',
      operator_name: '',
      cancelSourceSurveyAbspt: null,
      showSurveyAbsptLoader: false,

      cancelSourceSurveyPData: null,
      showSurveyPDataLoader: false,

      cancelSourceSurveyLData: null,
      showSurveyLDataLoader: false,

      cancelSourceWellPointsData: null,
      showWellPointsDataLoader: false,

      cancelSourceWellLinesLData: null,
      showWellLinesDataLoader: false,
      
      
      
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
    
  },
  methods: {
    openPopUp (latLng, parsed_data) {

      this.parsed_data = parsed_data;
      this.$refs.features.leafletObject.openPopup(latLng);
    },

    centerUpdate(center) {
      this.currentCenter = center;
    },
    

    cancel(close) {
      // some code...
      close()
    },

    changeTile(current_tile){

      this.currentTile = current_tile
    },
    
      
    refresh(){

        if(this.zoom >= 8){
          this.callDesiredAPIs();
          
          var vm_this = this;
          
          this.map.on('dragend', () => {
              
              setTimeout(() => {
                vm_this.callDesiredAPIs();

              }, 100)

          });

          this.map.on('zoomend', () => {
            
              setTimeout(() => {
                vm_this.callDesiredAPIs();

              }, 100)
          });

        }


    },
    cancelSearchSurveyAbspt () {
      if (this.cancelSurveySource) {
        this.cancelSurveySource.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    cancelSearchSurveyPData () {
      if (this.cancelSurveySourcePData) {
        this.cancelSurveySourcePData.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    cancelSearchSurveyLData () {
      if (this.cancelSurveySourceLData) {
        this.cancelSurveySourceLData.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    cancelSearchWellLinesData () {
      if (this.cancelSourceWellLines) {
        this.cancelSourceWellLines.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    cancelSearchWellPointsData () {
      if (this.cancelSurveySourceLData) {
        this.cancelSourceWellPoints.cancel('Start new search, stop active search');
        console.log('cancel request done');
      }
    },

    callDesiredAPIs(){
      this.map = this.$refs.map.leafletObject;
      this.bounds_cords = this.map.getBounds();
      var bounds_cords = this.bounds_cords;

      var northWest = bounds_cords.getNorthWest(),
          southEast = bounds_cords.getSouthEast();

      var qs = Qs;
      var vm = this;
      var par = {'north_west_lat' : northWest.lat ,
        'north_west_lng': northWest.lng,
        'south_east_lat': southEast.lat,
        'south_east_lng': southEast.lng,
        'api_number'  : this.api_number
      }
      this.survey_abspt_points=null;
      this.survey_p_data=null;
      this.survey_l_data=null;
      this.well_points_data=null;
      this.well_lines_data=null;
      
      if(this.show_survey_abspt){
        par['show_survey_abspt'] = this.show_survey_abspt;
        this.cancelSearchSurveyAbspt();
        this.cancelSourceSurveyAbspt = axios.CancelToken.source();

        var cancelSourceTokenSurveyAbspt = this.cancelSourceSurveyAbspt.token;
      
        this.showSurveyAbsptLoader = true;
        axios.get("https://dev-halselloil.opencubicles.com/search_data/test_search2.php", {
        cancelToken: cancelSourceTokenSurveyAbspt,
        params: par,
        paramsSerializer: params => {

          return qs.stringify(params)

        }

        })
        .then(function (response) {
        
        vm.well_data_json = null;
        vm.geo_json_data = null;
        vm.cancelSourceSurveyAbspt = null;

        if(response.data.result && response.data.result == 'error'){
          console.log('error')

        }else{
          
          var json_data = {};
          json_data = response.data.survey_abspt_points;
          vm.survey_abspt_points = json_data;


        }

        })
        .catch(function (error) {
          vm.well_data = null;
          vm.well_json_data = null;

          console.log(error);
        })
        .then(function () {
          // always executed
          vm.showSurveyAbsptLoader= false;

        });
      }

      if(this.show_survey_p_data){
      par = {'north_west_lat' : northWest.lat ,
        'north_west_lng': northWest.lng,
        'south_east_lat': southEast.lat,
        'south_east_lng': southEast.lng,
        'api_number'  : this.api_number
        }
        par['show_survey_p_data'] = this.show_survey_p_data;
        this.cancelSearchSurveyPData();
        this.cancelSourceSurveyPData = axios.CancelToken.source();

        var cancelSourceTokenSurveyPData = this.cancelSourceSurveyPData.token;
      
        this.showSurveyPDataLoader = true;
        axios.get("https://dev-halselloil.opencubicles.com/search_data/test_search2.php", {
        cancelToken: cancelSourceTokenSurveyPData,
        params: par,
        paramsSerializer: params => {

          return qs.stringify(params)

        }

        })
        .then(function (response) {
        
        vm.cancelSourceSurveyPData = null;

        if(response.data.result && response.data.result == 'error'){
          console.log('error')

        }else{
          
          var json_data = {};
          json_data = response.data.survey_p_data;
          console.log(response.data.survey_p_data);

          vm.survey_p_data = json_data;


        }

      })
      .catch(function (error) {
        

        console.log(error);
      })
      .then(function () {
        // always executed
        vm.showSurveyPDataLoader = false;

      });
      }

      if(this.show_survey_l_data){
        par = {'north_west_lat' : northWest.lat ,
          'north_west_lng': northWest.lng,
          'south_east_lat': southEast.lat,
          'south_east_lng': southEast.lng,
          'api_number'  : this.api_number
          }
          par['show_survey_l_data'] = this.show_survey_l_data;
          this.cancelSearchSurveyLData();
          this.cancelSourceSurveyLData = axios.CancelToken.source();

          var cancelSourceTokenSurveyLData = this.cancelSourceSurveyLData.token;
        
          this.showSurveyLDataLoader = true;
          axios.get("https://dev-halselloil.opencubicles.com/search_data/test_search2.php", {
          cancelToken: cancelSourceTokenSurveyLData,
          params: par,
          paramsSerializer: params => {

            return qs.stringify(params)

          }

          })
          .then(function (response) {
          
          vm.cancelSourceSurveyLData = null;

          if(response.data.result && response.data.result == 'error'){
            console.log('error')

          }else{
            
            var json_data = {};
            json_data = response.data.survey_l_data;
            console.log(response.data.survey_l_data);
          
            vm.survey_l_data = json_data;


          }

        })
        .catch(function (error) {
          

          console.log(error);
        })
        .then(function () {
          // always executed
          vm.showSurveyLDataLoader = false;

        });
      }

      if(this.show_well_lines_data){
        par = {'north_west_lat' : northWest.lat ,
          'north_west_lng': northWest.lng,
          'south_east_lat': southEast.lat,
          'south_east_lng': southEast.lng,
          'api_number'  : this.api_number
          }
          par['show_well_lines_data'] = this.show_well_lines_data;
          this.cancelSearchWellLinesData();
          this.cancelSourceWellLinesData = axios.CancelToken.source();

          var cancelSourceTokenWellLinesData = this.cancelSourceWellLinesData.token;
        
          this.showWellLinesDataLoader = true;
          axios.get("https://dev-halselloil.opencubicles.com/search_data/test_search2.php", {
          cancelToken: cancelSourceTokenWellLinesData,
          params: par,
          paramsSerializer: params => {

            return qs.stringify(params)

          }

          })
          .then(function (response) {
          
          vm.cancelSourceWellPointsData = null;

          if(response.data.result && response.data.result == 'error'){
            console.log('error')

          }else{
            
            var json_data = {};
            json_data = response.data.well_lines_data;
            console.log(response.data.well_lines_data);
          
            vm.well_lines_data = json_data;


          }

        })
        .catch(function (error) {
          

          console.log(error);
        })
        .then(function () {
          // always executed
          vm.showWellLinesDataLoader = false;

        });
      }

      if(this.show_well_points_data){
        par = {'north_west_lat' : northWest.lat ,
          'north_west_lng': northWest.lng,
          'south_east_lat': southEast.lat,
          'south_east_lng': southEast.lng,
          'api_number'  : this.api_number
          }
          par['show_well_points_data'] = this.show_well_points_data;
          this.cancelSearchWellPointsData();
          this.cancelSourceWellPointsData = axios.CancelToken.source();

          var cancelSourceTokenWellPointsData = this.cancelSourceWellPointsData.token;
        
          this.showWellPointsDataLoader = true;
          axios.get("https://dev-halselloil.opencubicles.com/search_data/test_search2.php", {
          cancelToken: cancelSourceTokenWellPointsData,
          params: par,
          paramsSerializer: params => {

            return qs.stringify(params)

          }

          })
          .then(function (response) {
          
          vm.cancelSourceWellPointsData = null;

          if(response.data.result && response.data.result == 'error'){
            console.log('error')

          }else{
            
            var json_data = {};
            json_data = response.data.well_points_data;
            console.log(response.data.well_points_data);
          
            vm.well_points_data = json_data;


          }

        })
        .catch(function (error) {
          

          console.log(error);
        })
        .then(function () {
          // always executed
          vm.showWellPointsDataLoader = false;

        });
      }
    }

  },
};
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.css";
</style>
