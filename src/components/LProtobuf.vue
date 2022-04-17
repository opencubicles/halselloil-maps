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
    properties: Object,
    options: Object,
    layer: String
  },
  setup(props, context) {
    // const params = new URLSearchParams(props.properties).toString();

    const tileServerURL =
      "https://d2xhgfg6pp43w3.cloudfront.net/{z}/{x}/{y}?layer=" + props.layer;

    const leafletRef = ref({});
    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");
    const { methods } = vectorLayerSetup(props, leafletRef, context);
    onMounted(async () => {
      console.log("mounted");
      const { DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const vectorStyles = props.options;
      console.log(vectorStyles);
      leafletRef.value = L.vectorGrid.protobuf(tileServerURL, {
        interactive: true,
        vectorTileLayerStyles: {
          geojsonLayer: vectorStyles,
          sliced: {
            radius: 0.1
          }
        }
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
