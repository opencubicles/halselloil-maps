<template>
  <div style="height: 100vh; width: 100vw;">
    
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
      @update:zoom="zoomUpdate"
    >

      <l-tile-layer
          :url="tileUrl"
          :options="tileOptions" >
      </l-tile-layer>
      <l-control position="topright">
        <tile-panel :tiles="tiles" >
        </tile-panel>
      </l-control>

      <l-control position="bottomright">

        <filter-panel v-model="show" @apply="apply" @cancel="cancel" />
      
        <button type="button" class="btn btn-success"  @click="show = true">Filter Wells</button>
      </l-control>

      


      <l-feature-group ref="features">

        <l-popup >
          <popup-content :parsed_data="parsed_data">   
          </popup-content>
        </l-popup>
      </l-feature-group>

      <LGeoJson v-if="geo_json_data"
        :geojson="[geo_json_data]"
      />
      <l-feature-group ref="featureGroup" @ready="fitBounds" @layeradd="reFitBounds" @layerremove="reFitBounds" v-if="well_data_markers || well_data_polylines"
        >

      
        <template v-if="well_data_polylines">
          
          <l-polyline v-for="(each_polyline,index) in resultQueryPolylines" :key="index" 
          
            :lat-lngs="each_polyline.well_coordinates"
            color="blue"

            @click="openPopUp(each_polyline.well_coordinates[0], each_polyline.parsed_data)"

          >          
          </l-polyline>
        </template>

        <template v-if="well_data_markers">
          
          <l-marker v-for="(each_polyline, index) in resultQueryMarkers"  :key="index" 
          
            :lat-lng="each_polyline.well_coordinates[0]"
            color="red"
            @click="openPopUp(each_polyline.well_coordinates[0], each_polyline.parsed_data)"
          >
            <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
            
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
  LPolyline,
  LMarker,
  LIcon,
  LPopup,
  LGeoJson,
  LFeatureGroup,
  LControl
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import FilterPanel from './components/FilterPanel';
//import {geo_json_data} from "./assets/surv001Poly.js";

import TilePanel from './components/TilePanel';
import PopupContent from './components/PopupContent';

//import { VueFinalModal, ModalsContainer } from 'vue-final-modal'
//import { vfmPlugin } from 'vue-final-modal'

import axios from 'axios';
import Qs from 'qs';

export default {
  components: {
    LMap,
    LPopup,
    LIcon,
    LMarker,
    LPolyline,
    LTileLayer,
    FilterPanel,
    LGeoJson,
    TilePanel,
    LFeatureGroup,
    PopupContent,
    LControl

  },

  data() {
    return {
      zoom: 10,
      map:null,
      bounds: null,
      show: false,
      geo_json_data:{},
      well_data_markers:[],
      well_data_polylines:[],
      show_layers: false,
      currentCenter: [32.042356500077, -95.707149188658],
      iconWidth: 12.5,
      iconHeight: 20,
      api_number:'',
      operator_name: '',
      cancelSource: null,
      parsed_data: null,
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
        },
        {
          name: 'Stamen Design Toner',
          url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
          options: {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20
          }
        },
        {
          name: 'ArcGIS World Topo Map',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          options: {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          }
        }
      ],
      
      currentTile: 0,
      
    };
  },
 
  computed: {
    iconUrl() {
      return `https://halselloil.s3.us-east-2.amazonaws.com/map_img/symnum_10.png`;
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
          
    },
  
  },
  methods: {

    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    openPopUp (latLng, parsed_data) {
      
      this.parsed_data = parsed_data;
      this.$refs.features.leafletObject.openPopup(latLng);
    },
    apply(api_number , show_markers, show_polylines, operator_name) {
      this.show_markers = show_markers;
      this.show_polylines = show_polylines;
      if(api_number != '' || operator_name != ''){
        this.without_bounds = true;
      
      }else{
        this.without_bounds = false;
        
      }
      this.api_number = api_number
      this.operator_name = operator_name
      if(this.api_number != '' || this.operator_name != '' || this.show_markers != 'false' || this.show_polylines != 'false'){
        this.getWellData()
        
      }
      this.show = false
    },
    cancel(close) {
      // some code...
      close()
    },
    fitBounds() {
    
      setTimeout(() => {
        if(this.well_data_markers.length == 1 &&  this.well_data_polylines.length == 0){
          // changing the center to the current found marker's cordinates, we just cannot 
          //fit bound for one marker as getBounds needs atleast two diffrerent cordinates
          this.currentCenter = this.well_data_markers[0].well_coordinates[0];
        }else{
          const new_bounds = this.$refs.featureGroup.leafletObject.getBounds();
        
          if(new_bounds.isValid()){
             this.$refs.map.leafletObject.fitBounds(new_bounds);
          
          }

        }
        
        
      }, 1000);
    },
    reFitBounds() {
      console.log(this.api_number);
      if(this.api_number != '' || this.operator_name != ''){
        
        //10334501
        setTimeout(() => {
          if(this.well_data_markers.length == 1 &&  this.well_data_polylines.length == 0){
            // changing the center to the current found marker's cordinates, we just cannot 
            //fit bound for one marker as getBounds needs atleast two diffrerent cordinates
            this.currentCenter = this.well_data_markers[0].well_coordinates[0];
            this.currentZoom = 8;
          
          }else{
            const new_bounds = this.$refs.featureGroup.leafletObject.getBounds();
            console.log(new_bounds);
            if(new_bounds.isValid()){
               this.$refs.map.leafletObject.fitBounds(new_bounds);
            
            }

          }
          
          
        }, 1000);
      }
    },
    getWellData(){
      var qs = Qs;
      var vm = this;
      this.cancelSearch();
      this.cancelSource = axios.CancelToken.source();
      var cancelSourceToken = this.cancelSource.token;
      var par = {};

      this.map = this.$refs.map.leafletObject;
      this.bounds_cords = this.map.getBounds();

      var bounds_cords = this.bounds_cords;
      if(this.without_bounds){
        if(this.operator_name != ''){
          par['operator_name'] = this.operator_name;

        }
        
        if(this.api_number != ''){
          par['api_number'] = this.api_number;
          
        }
        par['show_markers'] = this.show_markers;
           
        par['show_polylines'] = this.show_polylines;

        par['without_bounds'] = this.without_bounds;
      }
      else{
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
        'show_markers' : this.show_markers,
        'show_polylines' : this.show_polylines,
        
        'without_bounds' : false 
        }

      }
        axios.get('https://dev-halselloil.opencubicles.com/leaflet-vue/api.php', {
        cancelToken: cancelSourceToken,
        params: par,
        paramsSerializer: params => {
         
          return qs.stringify(params)
        
        }

      })
      .then(function (response) {
        vm.well_data_markers = null;
        vm.geo_json_data = null;
        vm.well_data_polylines = null;
        vm.show_layers = false;
        vm.cancelSource = null;
        if(response.data.result && response.data.result == 'error'){

          vm.show_layers = false;
          
        }else{
          vm.well_data_markers = response.data.parsed_data.filter((item)=>{
            return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'N'
          });
  
          vm.well_data_polylines = response.data.parsed_data.filter((item)=>{
            return item.parsed_data['DA-HORIZONTAL-WELL-FLAG']  == 'Y'
          });


          var json_data = {};
          json_data.type = 'FeatureCollection';
          json_data.features = response.data.geo_json;

          vm.geo_json_data = json_data;
        
          vm.show_layers = true;
          
        }
        
      })
      .catch(function (error) {
        vm.well_data = null;
        vm.show_layers = false;
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
    filterWells(search){
      this.api_number = search
      this.getWellData()
    },
    changeTile(current_tile){

      this.currentTile = current_tile
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
              }, 1000)
              
          });

          this.map.on('zoomend', () => {
              var vm_this_2 = vm_this;
              setTimeout(() => {
              vm_this_2.bounds = vm_this_2.map.getBounds();
                  vm_this_2.getWellData(vm_this_2.bounds);
              }, 1000)
          });
      

        }else{
          this.show_layers = false;
          this.well_data= null;
          
        }
        
 
    },

  },
};
</script>


<style>

@import'~bootstrap/dist/css/bootstrap.css'
</style>