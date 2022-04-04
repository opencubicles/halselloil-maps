<template>
    <div class="map-side-menu">
        <ul class="map-feature-menu">
            <li class="menu-list map-widget" tooltip-title="Home">
                <i class="menu-list-icons home-icon"></i>
            </li>
            <li
                class="menu-list map-widget"
                tooltip-title="Data Filters"
                @click="
                    toggleModal();
                    showDataFilterModal = true;
                "
            >
                <i class="menu-list-icons settings-slider-icon"></i>
            </li>
            <li
                class="menu-list map-widget"
                tooltip-title="Layers"
                @click="
                    toggleModal();
                    showLayerModal = true;
                "
            >
                <i class="menu-list-icons layers-icon"></i>
            </li>
            <li class="menu-list map-widget" tooltip-title="Exports">
                <i class="menu-list-icons upload-icon"></i>
            </li>
            <li class="menu-list map-widget" tooltip-title="Snapshots">
                <i class="menu-list-icons camera-icon"></i>
            </li>
            <li class="menu-list map-widget" tooltip-title="Tools">
                <i class="menu-list-icons tools-icon"></i>
            </li>
        </ul>
    </div>
    <transition name="fade" appear>
        <div
            class=""
            v-if="showDataFilterModal"
            @click="showDataFilterModal = false"
        ></div>
    </transition>

    <transition name="slide" appear>
        <div class="data-filter-modal" v-if="showDataFilterModal">
            <div class="pop-header pointer-off">
                <div class="header-items-left">
                    <label class="pop-header-label">
                        <h4>Data Filters</h4>
                    </label>
                </div>
                <div class="header-items-right">
                    <button
                        class="btn btn-md2 btn-primary data-filter-header-btn pointer-on"
                        id="filter-oil-data"
                        @click="showDataFilterModal = false"
                    >
                        Apply
                    </button>
                </div>
            </div>
            <div class="data-filters-aoi">
                <details>
                    <summary class="pointer-off">
                        <div class="items-left">
                            <h6>Permits</h6>
                        </div>
                        <div class="items-right">
                            <div class="form-check form-switch switch-position">
                                <input
                                    class="form-check-input switch-visible js-well-layer"
                                    type="checkbox"
                                    id="flexSwitchCheckCheckedWell"
                                    onClick="javascript:void(0)"
                                    value="2"
                                />
                            </div>
                            <i
                                class="expand-icons arrow-expand-icon pointer-on"
                                onClick="javascript:void(0)"
                            ></i>
                        </div>
                    </summary>
                    <div class="filter-contents">
                        <div class="GridLex-gap-center gridlex-override">
                            <div class="GridLex-grid-noGutter-equalHeight">
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Country"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="OFS Region"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="State/Province"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="County/Parish"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Approved Date"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Operator Alias"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Lease Name"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="API num 10"
                                            id=""
                                            name="api_number"
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Permit Number"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="File Date"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Amended Date"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="District"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Well Number"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Well Status"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Field"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Formation"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Permit Status"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Drill Type"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Permit Type"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Permit Depth"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Operator"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Section"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Block"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Township"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Range"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Survey"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Survey 2"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Abstract"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
            <div class="data-filters-production">
                <details>
                    <summary class="pointer-off">
                        <div class="items-left">
                            <h6>Production</h6>
                        </div>
                        <div class="items-right">
                            <div class="form-check form-switch switch-position">
                                <input
                                    class="form-check-input switch-visible js-well-layer"
                                    type="checkbox"
                                    id="flexSwitchCheckChecked"
                                    onClick="javascript:void(0)"
                                    value="4,5,6"
                                />
                            </div>
                            <i
                                class="expand-icons arrow-expand-icon pointer-on"
                                onClick="javascript:void(0)"
                            ></i>
                        </div>
                    </summary>
                    <div class="filter-contents">
                        <div class="GridLex-gap-center gridlex-override">
                            <div class="GridLex-grid-noGutter-equalHeight">
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="Country"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="OFS Region"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="State/Province"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                                <div class="GridLex-col-6_sm-6_xs-12">
                                    <div class="data-filter-item">
                                        <input
                                            class="search"
                                            placeholder="County/Parish"
                                            id=""
                                            name=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </transition>

    <transition name="fade" appear>
        <div
            class=""
            v-if="showLayerModal"
            @click="showLayerModal = false"
        ></div>
    </transition>

    <transition name="slide" appear>
        <div class="data-filter-modal" v-if="showLayerModal">
            <div class="pop-header">
                <div class="header-items-left">
                    <label class="pop-header-label">
                        <h4>Layers</h4>
                    </label>
                </div>
                <div class="header-items-right">
                    <button
                        class="btn btn-md2 btn-primary data-filter-header-btn pointer-on"
                        id="filter-oil-data"
                        @click="showLayerModal = false"
                    >
                        Apply
                    </button>
                </div>
            </div>
            <div class="data-filter-basemap">
                <details>
                    <summary class="pointer-off">
                        <div class="items-left">
                            <h6>Base Map</h6>
                        </div>
                        <div class="items-right">
                            <!--<div class="form-check form-switch switch-position">
                                              <input class="form-check-input switch-visible" type="checkbox" id="flexSwitchCheckDefault" >
                                            </div>-->
                            <i
                                class="expand-icons arrow-expand-icon pointer-on"
                                onClick="javascript:void(0)"
                            ></i>
                        </div>
                    </summary>
                    <div class="filter-contents">
                        <div class="row">
                            <select
                                class="base-map-select"
                                v-on:change="changeTile(rowId, $event)"
                            >
                                <option value="0">Street</option>
                                <option value="1">Topo</option>
                            </select>
                        </div>
                    </div>
                </details>
            </div>
            <div class="data-filter-survey">
                <details>
                    <summary class="pointer-off">
                        <div class="items-left">
                            <h6>Surveys</h6>
                        </div>
                        <div class="items-right">
                            <div class="form-check form-switch switch-position">
                                <input
                                    class="form-check-input switch-visible"
                                    type="checkbox"
                                    id="flexSwitchCheckCheckedSurvey"
                                    value="surv"
                                />
                            </div>
                            <i
                                class="expand-icons arrow-expand-icon pointer-on"
                                onClick="javascript:void(0)"
                            ></i>
                        </div>
                    </summary>
                    <div class="filter-contents">
                        <div class="row">
                            <div class="items-left">
                                <label
                                    class="survey-label"
                                    style="font-weight:300 !important;"
                                    >PLS State</label
                                >
                            </div>
                            <div class="items-right">
                                <div
                                    class="form-check form-switch switch-position"
                                >
                                    <input
                                        class="form-check-input switch-visible js-survey-item"
                                        type="checkbox"
                                        value="pls_state"
                                        id="flexSwitchPlsState"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="items-left">
                                <label
                                    class="survey-label"
                                    style="font-weight:300 !important;"
                                    >PLS Township/Block</label
                                >
                            </div>
                            <div class="items-right">
                                <div
                                    class="form-check form-switch switch-position"
                                >
                                    <input
                                        class="form-check-input switch-visible js-survey-item"
                                        type="checkbox"
                                        value="pls_township"
                                        id="flexSwitchTownship"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="items-left">
                                <label
                                    class="survey-label"
                                    style="font-weight:300 !important;"
                                    >PLS Section/Abstract</label
                                >
                            </div>
                            <div class="items-right">
                                <div
                                    class="form-check form-switch switch-position"
                                >
                                    <input
                                        class="form-check-input switch-visible js-survey-item"
                                        type="checkbox"
                                        value="pls_abstract"
                                        id="flexSwitchAbstract"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="items-left">
                                <label
                                    class="survey-label"
                                    style="font-weight:300 !important;"
                                    >PLS Intersected</label
                                >
                            </div>
                            <div class="items-right">
                                <div
                                    class="form-check form-switch switch-position"
                                >
                                    <input
                                        class="form-check-input switch-visible js-survey-item"
                                        type="checkbox"
                                        value="pls_intersected"
                                        id="flexSwitchIntersected"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="items-left">
                                <label
                                    class="survey-label"
                                    style="font-weight:300 !important;"
                                    >TX Surveys</label
                                >
                            </div>
                            <div class="items-right">
                                <div
                                    class="form-check form-switch switch-position"
                                >
                                    <input
                                        class="form-check-input switch-visible js-survey-item"
                                        type="checkbox"
                                        value="tx_surveys"
                                        id="flexSwitchCheckCheckedTexasSurvey"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            showDataFilterModal: false,
            showLayerModal: false,
        };
    },

    name: "DataFilterPanel",
    methods: {
        changeTile() {
            this.$emit("change-tile", event.target.value);
        },
        toggleModal() {
            this.showLayerModal = false;
            this.showDataFilterModal = false;
        },
    },
    inheritAttrs: false,
};
</script>