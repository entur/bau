import { useState, useEffect } from "react";
import logo from "./logo.png";
import { Heading3, Heading5 } from "@entur/typography";
import styles from "./App.module.scss";
import { GridContainer, GridItem } from "@entur/grid";
import { TextField, Checkbox } from "@entur/form";
import { Dropdown } from "@entur/dropdown";
import { AutoCompleteResults } from "./results/autoCompleteResults";
import { ReverseResults } from "./results/reverseResults";
import { PlaceResults } from "./results/placeResults";
import { V1Env, V2Env, V1_ENV_LABELS, V2_ENV_LABELS } from "./apiHooks/api";

type SearchMode = "autocomplete" | "reverse" | "place";

const DEFAULT_V1_ENV = V1Env.DEV;
const DEFAULT_V2_ENV = V2Env.DEV;

const V1_ENV_OPTIONS = [
  V1Env.OFF,
  V1Env.DEV,
  V1Env.STAGING,
  V1Env.PROD,
];

const V2_ENV_OPTIONS = [
  V2Env.OFF,
  V2Env.LOCAL,
  V2Env.DEV,
  V2Env.DEV_SE,
  V2Env.STAGING,
  V2Env.PROD,
];

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = (urlParams.get("mode") as SearchMode) || "autocomplete";
  const initialSearchTerm = urlParams.get("text") || "";
  const initialLat = urlParams.get("point.lat") || "";
  const initialLon = urlParams.get("point.lon") || "";
  const initialIds = urlParams.get("ids") || "";
  const initialV1Env = (urlParams.get("v1") as V1Env) || DEFAULT_V1_ENV;
  const initialV2Env = (urlParams.get("v2") as V2Env) || DEFAULT_V2_ENV;

  const initialSize = urlParams.get("size") || "30";
  const initialFocusLat = urlParams.get("focus.point.lat") || "";
  const initialFocusLon = urlParams.get("focus.point.lon") || "";
  const initialFocusScale = urlParams.get("focus.scale") || "";
  const initialFocusWeight = urlParams.get("focus.weight") || "";
  const initialLayers = urlParams.get("layers") || "";
  const initialSources = urlParams.get("sources") || "";
  const initialMultiModal = urlParams.get("multiModal") || "";
  const initialBoundaryCircleRadius = urlParams.get("boundary.circle.radius") || "";
  const initialBoundaryCountry = urlParams.get("boundary.country") || "";
  const initialBoundaryCountyIds = urlParams.get("boundary.county_ids") || "";

  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [lat, setLat] = useState<string>(initialLat);
  const [lon, setLon] = useState<string>(initialLon);
  const [ids, setIds] = useState<string>(initialIds);
  const [v1Env, setV1Env] = useState<V1Env>(initialV1Env);
  const [v2Env, setV2Env] = useState<V2Env>(initialV2Env);
  const [size, setSize] = useState<string>(initialSize);
  const [focusLat, setFocusLat] = useState<string>(initialFocusLat);
  const [focusLon, setFocusLon] = useState<string>(initialFocusLon);
  const [focusScale, setFocusScale] = useState<string>(initialFocusScale);
  const [focusWeight, setFocusWeight] = useState<string>(initialFocusWeight);
  const [layers, setLayers] = useState<string>(initialLayers);
  const [sources, setSources] = useState<string>(initialSources);
  const [multiModal, setMultiModal] = useState<string>(initialMultiModal);
  const [boundaryCircleRadius, setBoundaryCircleRadius] = useState<string>(initialBoundaryCircleRadius);
  const [boundaryCountry, setBoundaryCountry] = useState<string>(initialBoundaryCountry);
  const [boundaryCountyIds, setBoundaryCountyIds] = useState<string>(initialBoundaryCountyIds);

  const handleClearFocus = () => {
    setFocusLat("");
    setFocusLon("");
  };

  const toggleLayer = (layer: string) => {
    const currentLayers = layers ? layers.split(",") : [];
    if (currentLayers.includes(layer)) {
      setLayers(currentLayers.filter((l) => l !== layer).join(","));
    } else {
      setLayers([...currentLayers, layer].join(","));
    }
  };

  const toggleSource = (source: string) => {
    const currentSources = sources ? sources.split(",") : [];
    if (currentSources.includes(source)) {
      setSources(currentSources.filter((s) => s !== source).join(","));
    } else {
      setSources([...currentSources, source].join(","));
    }
  };

  const sanitizeCoordinate = (value: string): string => {
    return value
      .replace(/,/g, ".")
      .replace(/[^\d.-]/g, "")
      .replace(/(?!^)-/g, "")
      .replace(/(\..*)\./g, "$1");
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchMode !== "autocomplete") {
      params.set("mode", searchMode);
    }

    if (v1Env !== DEFAULT_V1_ENV) {
      params.set("v1", v1Env);
    }
    if (v2Env !== DEFAULT_V2_ENV) {
      params.set("v2", v2Env);
    }

    if (searchMode === "autocomplete" && searchTerm) {
      params.set("text", searchTerm);
    } else if (searchMode === "reverse") {
      if (lat) params.set("point.lat", lat);
      if (lon) params.set("point.lon", lon);
    } else if (searchMode === "place") {
      if (ids) params.set("ids", ids);
    }

    if (size && size !== "30") {
      params.set("size", size);
    }

    if (focusLat && focusLon) {
      params.set("focus.point.lat", focusLat);
      params.set("focus.point.lon", focusLon);
    }

    if (focusScale) params.set("focus.scale", focusScale);
    if (focusWeight) params.set("focus.weight", focusWeight);

    if (layers) params.set("layers", layers);
    if (sources) params.set("sources", sources);
    if (multiModal) params.set("multiModal", multiModal);
    if (boundaryCircleRadius) params.set("boundary.circle.radius", boundaryCircleRadius);
    if (boundaryCountry) params.set("boundary.country", boundaryCountry);
    if (boundaryCountyIds) params.set("boundary.county_ids", boundaryCountyIds);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [searchMode, searchTerm, lat, lon, ids, v1Env, v2Env, size, focusLat, focusLon, focusScale, focusWeight, layers, sources, multiModal, boundaryCircleRadius, boundaryCountry, boundaryCountyIds]);

  useEffect(() => {
    document.title = "Geocoder Test";
  }, []);

  return (
    <GridContainer spacing="none">
      <GridItem small={12} className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <img src={logo} className={styles.appLogo} alt="Entur logo" />
          <Heading5 margin="none">Geocoder Test</Heading5>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.modeButtons}>
            <button
              onClick={() => setSearchMode("autocomplete")}
              className={`${styles.modeButton} ${searchMode === "autocomplete" ? styles.active : ""}`}
            >
              Autocomplete
            </button>
            <button
              onClick={() => setSearchMode("reverse")}
              className={`${styles.modeButton} ${searchMode === "reverse" ? styles.active : ""}`}
            >
              Reverse
            </button>
            <button
              onClick={() => setSearchMode("place")}
              className={`${styles.modeButton} ${searchMode === "place" ? styles.active : ""}`}
            >
              Place
            </button>
          </div>
          <label className={styles.envSelector}>
            V1:
            <select
              value={v1Env}
              onChange={(e) => setV1Env(e.target.value as V1Env)}
            >
              {V1_ENV_OPTIONS.map((env) => (
                <option key={env} value={env}>{V1_ENV_LABELS[env]}</option>
              ))}
            </select>
          </label>
          <label className={styles.envSelector}>
            V2:
            <select
              value={v2Env}
              onChange={(e) => setV2Env(e.target.value as V2Env)}
            >
              {V2_ENV_OPTIONS.map((env) => (
                <option key={env} value={env}>{V2_ENV_LABELS[env]}</option>
              ))}
            </select>
          </label>
        </div>
      </GridItem>
      <GridItem small={12} className={styles.searchContainer}>
        {searchMode === "autocomplete" ? (
          <>
            <Heading3 margin="none" className={styles.searchHeading}>
              Hvor vil du reise?
            </Heading3>
            <div className={styles.searchForm}>
              <TextField
                size="medium"
                label="søk"
                className={styles.inputLarge}
                value={searchTerm}
                onChange={(evt) => setSearchTerm(evt.target.value)}
              />
              <TextField
                size="medium"
                label="size"
                type="number"
                className={styles.inputSmall}
                placeholder="30"
                value={size}
                onChange={(evt) => setSize(evt.target.value)}
              />
              <TextField
                size="medium"
                label="lat"
                className={styles.inputMedium}
                placeholder="Click map"
                value={focusLat}
                onChange={(evt) =>
                  setFocusLat(sanitizeCoordinate(evt.target.value))
                }
              />
              <TextField
                size="medium"
                label="lon"
                className={styles.inputMedium}
                placeholder="Click map"
                value={focusLon}
                onChange={(evt) =>
                  setFocusLon(sanitizeCoordinate(evt.target.value))
                }
              />
              <TextField
                size="medium"
                label="scale"
                type="number"
                className={styles.inputSmall}
                placeholder="e.g. 1"
                value={focusScale}
                onChange={(evt) => setFocusScale(evt.target.value)}
              />
              <TextField
                size="medium"
                label="weight"
                type="number"
                className={styles.inputSmall}
                placeholder="e.g. 1"
                value={focusWeight}
                onChange={(evt) => setFocusWeight(evt.target.value)}
              />
              <Dropdown
                label="multimodal"
                items={[
                  { value: "", label: "" },
                  { value: "all", label: "all" },
                  { value: "child", label: "child" },
                  { value: "parent", label: "parent" },
                ]}
                selectedItem={multiModal ? { value: multiModal, label: multiModal } : { value: "", label: "" }}
                onChange={item => setMultiModal(item?.value || "")}
                className={`${styles.inputSmall} ${styles.dropdownMedium}`}
              />
              <TextField
                size="medium"
                label="country"
                className={styles.inputMedium}
                placeholder="e.g. NOR"
                value={boundaryCountry}
                onChange={(evt) => setBoundaryCountry(evt.target.value)}
              />
              <TextField
                size="medium"
                label="boundary county_ids"
                className={styles.inputXLarge}
                placeholder="e.g. KVE:TopographicPlace:18"
                value={boundaryCountyIds}
                onChange={(evt) => setBoundaryCountyIds(evt.target.value)}
              />
              {focusLat && focusLon && (
                <button
                  onClick={handleClearFocus}
                  className={styles.clearFocusButton}
                >
                  Clear focus
                </button>
              )}
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Layers:</span>
                <Checkbox
                  checked={layers.split(",").includes("venue")}
                  onChange={() => toggleLayer("venue")}
                  className={styles.checkboxWhite}
                >
                  venue
                </Checkbox>
                <Checkbox
                  checked={layers.split(",").includes("address")}
                  onChange={() => toggleLayer("address")}
                  className={styles.checkboxWhite}
                >
                  address
                </Checkbox>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Sources:</span>
                <Checkbox
                  checked={sources.split(",").includes("whosonfirst")}
                  onChange={() => toggleSource("whosonfirst")}
                  className={styles.checkboxWhite}
                >
                  whosonfirst
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("openstreetmap")}
                  onChange={() => toggleSource("openstreetmap")}
                  className={styles.checkboxWhite}
                >
                  openstreetmap
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("openaddresses")}
                  onChange={() => toggleSource("openaddresses")}
                  className={styles.checkboxWhite}
                >
                  openaddresses
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("geonames")}
                  onChange={() => toggleSource("geonames")}
                  className={styles.checkboxWhite}
                >
                  geonames
                </Checkbox>
              </div>
            </div>
          </>
        ) : searchMode === "reverse" ? (
          <>
            <Heading3 margin="none" className={styles.searchHeading}>
              Reverse Geocoding
            </Heading3>
            <div className={styles.searchForm}>
              <TextField
                size="medium"
                label="lat"
                className={styles.inputLarge}
                placeholder="e.g. 59.9139 or click map"
                value={lat}
                onChange={(evt) => setLat(sanitizeCoordinate(evt.target.value))}
              />
              <TextField
                size="medium"
                label="lon"
                className={styles.inputLarge}
                placeholder="e.g. 10.7522 or click map"
                value={lon}
                onChange={(evt) => setLon(sanitizeCoordinate(evt.target.value))}
              />
              <TextField
                size="medium"
                label="radius (km)"
                type="number"
                className={styles.inputMedium}
                value={boundaryCircleRadius}
                onChange={evt => setBoundaryCircleRadius(evt.target.value)}
              />
              <TextField
                size="medium"
                label="size"
                type="number"
                className={styles.inputSmall}
                placeholder="30"
                value={size}
                onChange={(evt) => setSize(evt.target.value)}
              />
              <Dropdown
                label="multimodal"
                items={[
                  { value: "", label: "" },
                  { value: "all", label: "all" },
                  { value: "child", label: "child" },
                  { value: "parent", label: "parent" },
                ]}
                selectedItem={multiModal ? { value: multiModal, label: multiModal } : { value: "", label: "" }}
                onChange={item => setMultiModal(item?.value || "")}
                className={`${styles.inputSmall} ${styles.dropdownMedium}`}
              />
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Layers:</span>
                <Checkbox
                  checked={layers.split(",").includes("venue")}
                  onChange={() => toggleLayer("venue")}
                  className={styles.checkboxWhite}
                >
                  venue
                </Checkbox>
                <Checkbox
                  checked={layers.split(",").includes("address")}
                  onChange={() => toggleLayer("address")}
                  className={styles.checkboxWhite}
                >
                  address
                </Checkbox>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Sources:</span>
                <Checkbox
                  checked={sources.split(",").includes("whosonfirst")}
                  onChange={() => toggleSource("whosonfirst")}
                  className={styles.checkboxWhite}
                >
                  whosonfirst
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("openstreetmap")}
                  onChange={() => toggleSource("openstreetmap")}
                  className={styles.checkboxWhite}
                >
                  openstreetmap
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("openaddresses")}
                  onChange={() => toggleSource("openaddresses")}
                  className={styles.checkboxWhite}
                >
                  openaddresses
                </Checkbox>
                <Checkbox
                  checked={sources.split(",").includes("geonames")}
                  onChange={() => toggleSource("geonames")}
                  className={styles.checkboxWhite}
                >
                  geonames
                </Checkbox>
              </div>
            </div>
          </>
        ) : (
          <>
            <Heading3 margin="none" className={styles.searchHeading}>
              Place Lookup
            </Heading3>
            <div className={styles.searchForm}>
              <TextField
                size="medium"
                label="ids"
                className={styles.inputXLarge}
                placeholder="e.g. NSR:StopPlace:337,NSR:StopPlace:123"
                value={ids}
                onChange={(evt) => setIds(evt.target.value)}
              />
            </div>
          </>
        )}
      </GridItem>
      <GridItem small={12}>
        {searchMode === "autocomplete" ? (
          <AutoCompleteResults
            searchTerm={searchTerm}
            v1Env={v1Env}
            v2Env={v2Env}
            size={parseInt(size) || 30}
            focusLat={focusLat}
            focusLon={focusLon}
            focusScale={focusScale}
            focusWeight={focusWeight}
            layers={layers}
            sources={sources}
            multiModal={multiModal}
            boundaryCountry={boundaryCountry}
            boundaryCountyIds={boundaryCountyIds}
            onFocusChange={(lat, lon) => {
              setFocusLat(parseFloat(lat).toFixed(5));
              setFocusLon(parseFloat(lon).toFixed(5));
            }}
          />
        ) : searchMode === "reverse" ? (
          <ReverseResults
            lat={lat}
            lon={lon}
            v1Env={v1Env}
            v2Env={v2Env}
            size={parseInt(size) || 30}
            layers={layers}
            sources={sources}
            multiModal={multiModal}
            boundaryCircleRadius={boundaryCircleRadius}
            onPointChange={(newLat, newLon) => {
              setLat(parseFloat(newLat).toFixed(5));
              setLon(parseFloat(newLon).toFixed(5));
            }}
          />
        ) : (
          <PlaceResults
            ids={ids}
            v1Env={v1Env}
            v2Env={v2Env}
          />
        )}
      </GridItem>
    </GridContainer>
  );
}

export default App;
