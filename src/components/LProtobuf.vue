<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "@vue-leaflet/vue-leaflet/src/utils";
import {
  props,
  setup as vectorLayerSetup,
} from "@vue-leaflet/vue-leaflet/src/functions/layerGroup";
import L from "leaflet";
import "leaflet.vectorgrid";

export default {
  props: {
    url: String,
    options: Object,
  },
  setup(props, context) {
    const leafletRef = ref({});
    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");
    const { options, methods } = vectorLayerSetup(props, leafletRef, context);
    onMounted(async () => {
      const { DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      leafletRef.value = L.vectorGrid.protobuf(
        "https://tileserver.opencubicles.com/{z}/{x}/{y}.pbf",
        {
          interactive: true,
          vectorTileLayerStyles: {
            geojsonLayer: {
              weight: 0,
              fillColor: "#000",
              fillOpacity: 0.5,
              fill: true,
            },
          },
        }
      );

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef };
  },
  render() {
    return null;
  },
};
</script>
