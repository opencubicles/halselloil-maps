<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT
} from "@vue-leaflet/vue-leaflet/src/utils";
import { setup as vectorLayerSetup } from "@vue-leaflet/vue-leaflet/src/functions/layerGroup";
import L from "leaflet";
import "leaflet.vectorgrid";
export default {
  props: {
    options: Object,
    layer: String
  },
  setup(props, context) {
    // const params = new URLSearchParams(props.properties).toString();
//props.layer 
    const tileServerURL =
      "https://tileserver.opencubicles.com/tiles/public."+ props.layer  +"/{z}/{x}/{y}.pbf"

    const leafletRef = ref({});
    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");
    const { methods } = vectorLayerSetup(props, leafletRef, context);
    onMounted(async () => {
      const { DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      const passed_layer = props.layer
      const vectorStyles = {};
      vectorStyles["public."+passed_layer] = props.options
      console.log(vectorStyles);
      leafletRef.value = L.vectorGrid.protobuf(tileServerURL, {
        interactive: true,
        vectorTileLayerStyles: vectorStyles
      });

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef };
  },
  render() {
    return null;
  }
};
</script>
