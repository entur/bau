import { useState, useEffect, type ReactNode } from "react";
import logo from "./logo.png";
import { Heading5 } from "@entur/typography";
import styles from "./App.module.scss";
import { GridContainer, GridItem } from "@entur/grid";
import { TextField, Checkbox } from "@entur/form";
import { AutoCompleteResults } from "./results/autoCompleteResults";
import { ReverseResults } from "./results/reverseResults";
import { PlaceResults } from "./results/placeResults";
import { Env, ENV_LABELS, V3Params, isV3Env } from "./apiHooks/api";

type SearchMode = "autocomplete" | "reverse" | "place";
const SEARCH_MODES: SearchMode[] = ["autocomplete", "reverse", "place"];

const DEFAULT_LEFT_ENV = Env.DEV;
const DEFAULT_RIGHT_ENV = Env.DEV;

const ENV_OPTIONS = [
  Env.OFF,
  Env.LOCAL,
  Env.DEV,
  Env.DEV_SE,
  Env.STAGING,
  Env.PROD,
  Env.V3_DEV,
  Env.V3_TST,
  Env.V3_PRD,
  Env.V3_LOCAL,
];
const ENV_VALUES = Object.values(Env);

const V2_LAYERS = ["venue", "address"];
const V2_SOURCES = ["whosonfirst", "openstreetmap", "openaddresses", "geonames"];
const V3_LAYERS = [
  "address",
  "street",
  "stopPlace",
  "groupOfStopPlaces",
  "poi",
  "place",
];
const V3_SOURCES = [
  "openstreetmap",
  "kartverket-matrikkelenadresse",
  "kartverket-stedsnavn",
  "nsr",
  "custom-poi",
];

const MULTIMODAL_OPTIONS = ["", "all", "child", "parent"];

/** Coerce a raw query-param value to one of the allowed values, falling back when invalid. */
const coerce = <T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T => (value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback);

const splitCsv = (csv: string): string[] => (csv ? csv.split(",") : []);

const Multimodal = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className={styles.selectField}>
    <span className={styles.selectLabel}>multimodal</span>
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {MULTIMODAL_OPTIONS.map((opt) => (
        <option key={opt || "_empty"} value={opt}>
          {opt || "–"}
        </option>
      ))}
    </select>
  </label>
);

const CheckboxGroup = ({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string;
  onToggle: (item: string) => void;
}) => {
  const active = splitCsv(selected);
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterLabel}>{label}</span>
      {items.map((item) => (
        <Checkbox
          key={item}
          checked={active.includes(item)}
          onChange={() => onToggle(item)}
          className={styles.checkboxWhite}
        >
          {item}
        </Checkbox>
      ))}
    </div>
  );
};

const LayersAndSources = ({
  layers,
  sources,
  selectedLayers,
  selectedSources,
  onToggleLayer,
  onToggleSource,
}: {
  layers: string[];
  sources: string[];
  selectedLayers: string;
  selectedSources: string;
  onToggleLayer: (item: string) => void;
  onToggleSource: (item: string) => void;
}) => (
  <div className={styles.filterRow}>
    <CheckboxGroup
      label="Layers:"
      items={layers}
      selected={selectedLayers}
      onToggle={onToggleLayer}
    />
    <CheckboxGroup
      label="Sources:"
      items={sources}
      selected={selectedSources}
      onToggle={onToggleSource}
    />
  </div>
);

/** Wraps a version-specific block, showing a "v2"/"v3" label to its left only when both versions are visible. */
const FormSection = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div className={styles.formSection}>
    {label && <div className={styles.sectionLabel}>{label}</div>}
    <div className={styles.formSectionBody}>{children}</div>
  </div>
);

interface FilterConfig {
  layers: string[];
  sources: string[];
  selectedLayers: string;
  selectedSources: string;
  onToggleLayer: (item: string) => void;
  onToggleSource: (item: string) => void;
}

/** One version's form block: its inputs (children) + the Layers/Sources filters, optionally labelled. */
const VersionSection = ({
  label,
  filters,
  hint,
  children,
}: {
  label?: string;
  filters: FilterConfig;
  hint?: ReactNode;
  children?: ReactNode;
}) => (
  <FormSection label={label}>
    {children && <div className={styles.searchForm}>{children}</div>}
    <LayersAndSources {...filters} />
    {hint && <div className={styles.formHint}>{hint}</div>}
  </FormSection>
);

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = coerce(urlParams.get("mode"), SEARCH_MODES, "autocomplete");
  const initialSearchTerm = urlParams.get("text") || "";
  const initialLat = urlParams.get("point.lat") || "";
  const initialLon = urlParams.get("point.lon") || "";
  const initialIds = urlParams.get("ids") || "";
  const sharedEnv = urlParams.get("env");
  const initialLeftEnv = coerce(urlParams.get("left") ?? sharedEnv, ENV_VALUES, DEFAULT_LEFT_ENV);
  const initialRightEnv = coerce(urlParams.get("right") ?? sharedEnv, ENV_VALUES, DEFAULT_RIGHT_ENV);

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
  const initialV3: V3Params = {
    radius: urlParams.get("v3.radius") || "",
    weight: urlParams.get("v3.weight") || "",
    layers: urlParams.get("v3.layers") || "",
    sources: urlParams.get("v3.sources") || "",
    countries: urlParams.get("v3.countries") || "",
    counties: urlParams.get("v3.counties") || "",
  };

  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [lat, setLat] = useState<string>(initialLat);
  const [lon, setLon] = useState<string>(initialLon);
  const [ids, setIds] = useState<string>(initialIds);
  const [leftEnv, setLeftEnv] = useState<Env>(initialLeftEnv);
  const [rightEnv, setRightEnv] = useState<Env>(initialRightEnv);
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
  const [v3, setV3] = useState<V3Params>(initialV3);

  const setV3Field = (key: keyof V3Params, value: string) =>
    setV3((prev) => ({ ...prev, [key]: value }));

  // The old (v2) form shows whenever an active side speaks v2; the v3 form whenever one speaks v3.
  // With both selected, both forms show and the shared inputs drive both.
  const showV2Form =
    (leftEnv !== Env.OFF && !isV3Env(leftEnv)) ||
    (rightEnv !== Env.OFF && !isV3Env(rightEnv));
  const showV3Form = isV3Env(leftEnv) || isV3Env(rightEnv);
  const showBothForms = showV2Form && showV3Form;

  const handleClearFocus = () => {
    setFocusLat("");
    setFocusLon("");
  };

  const toggleCsvValue = (
    csv: string,
    item: string,
    setter: (value: string) => void,
  ) => {
    const current = splitCsv(csv);
    setter(
      current.includes(item)
        ? current.filter((x) => x !== item).join(",")
        : [...current, item].join(","),
    );
  };

  const toggleLayer = (layer: string) => toggleCsvValue(layers, layer, setLayers);
  const toggleSource = (source: string) =>
    toggleCsvValue(sources, source, setSources);
  const toggleV3Layer = (layer: string) =>
    toggleCsvValue(v3.layers, layer, (val) => setV3Field("layers", val));
  const toggleV3Source = (source: string) =>
    toggleCsvValue(v3.sources, source, (val) => setV3Field("sources", val));

  const v2Filters: FilterConfig = {
    layers: V2_LAYERS,
    sources: V2_SOURCES,
    selectedLayers: layers,
    selectedSources: sources,
    onToggleLayer: toggleLayer,
    onToggleSource: toggleSource,
  };
  const v3Filters: FilterConfig = {
    layers: V3_LAYERS,
    sources: V3_SOURCES,
    selectedLayers: v3.layers,
    selectedSources: v3.sources,
    onToggleLayer: toggleV3Layer,
    onToggleSource: toggleV3Source,
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

    if (leftEnv !== DEFAULT_LEFT_ENV) {
      params.set("left", leftEnv);
    }
    if (rightEnv !== DEFAULT_RIGHT_ENV) {
      params.set("right", rightEnv);
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

    if (v3.radius) params.set("v3.radius", v3.radius);
    if (v3.weight) params.set("v3.weight", v3.weight);
    if (v3.layers) params.set("v3.layers", v3.layers);
    if (v3.sources) params.set("v3.sources", v3.sources);
    if (v3.countries) params.set("v3.countries", v3.countries);
    if (v3.counties) params.set("v3.counties", v3.counties);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [searchMode, searchTerm, lat, lon, ids, leftEnv, rightEnv, size, focusLat, focusLon, focusScale, focusWeight, layers, sources, multiModal, boundaryCircleRadius, boundaryCountry, boundaryCountyIds, v3]);

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
            Left:
            <select
              value={leftEnv}
              onChange={(e) => setLeftEnv(e.target.value as Env)}
            >
              {ENV_OPTIONS.map((env) => (
                <option key={env} value={env}>
                  {ENV_LABELS[env]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.envSelector}>
            Right:
            <select
              value={rightEnv}
              onChange={(e) => setRightEnv(e.target.value as Env)}
            >
              {ENV_OPTIONS.map((env) => (
                <option key={env} value={env}>
                  {ENV_LABELS[env]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </GridItem>
      <GridItem small={12} className={styles.searchContainer}>
        {searchMode === "autocomplete" ? (
          <>
            <div
              className={`${styles.searchForm} ${showBothForms ? styles.indented : ""}`}
            >
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
              <Multimodal value={multiModal} onChange={setMultiModal} />
              <TextField
                size="medium"
                label="focus lat"
                className={styles.inputMedium}
                placeholder="Click map"
                value={focusLat}
                onChange={(evt) =>
                  setFocusLat(sanitizeCoordinate(evt.target.value))
                }
              />
              <TextField
                size="medium"
                label="focus lon"
                className={styles.inputMedium}
                placeholder="Click map"
                value={focusLon}
                onChange={(evt) =>
                  setFocusLon(sanitizeCoordinate(evt.target.value))
                }
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

            {showV2Form && (
              <VersionSection
                label={showBothForms ? "v2" : undefined}
                filters={v2Filters}
              >
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
              </VersionSection>
            )}

            {showV3Form && (
              <VersionSection
                label={showBothForms ? "v3" : undefined}
                filters={v3Filters}
              >
                <TextField
                  size="medium"
                  label="radius (km)"
                  type="number"
                  className={styles.inputSmall}
                  placeholder="default 50"
                  value={v3.radius}
                  onChange={(evt) => setV3Field("radius", evt.target.value)}
                />
                <TextField
                  size="medium"
                  label="weight (0-1)"
                  type="number"
                  className={styles.inputSmall}
                  placeholder="default 0.5"
                  value={v3.weight}
                  step={0.1}
                  onChange={(evt) => setV3Field("weight", evt.target.value)}
                />
                <TextField
                  size="medium"
                  label="countries"
                  className={styles.inputMedium}
                  placeholder="e.g. no"
                  value={v3.countries}
                  onChange={(evt) => setV3Field("countries", evt.target.value)}
                />
                <TextField
                  size="medium"
                  label="counties"
                  className={styles.inputXLarge}
                  placeholder="e.g. KVE:TopographicPlace:18"
                  value={v3.counties}
                  onChange={(evt) => setV3Field("counties", evt.target.value)}
                />
              </VersionSection>
            )}
          </>
        ) : searchMode === "reverse" ? (
          <>
            <div
              className={`${styles.searchForm} ${showBothForms ? styles.indented : ""}`}
            >
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
                onChange={(evt) => setBoundaryCircleRadius(evt.target.value)}
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
              <Multimodal value={multiModal} onChange={setMultiModal} />
            </div>

            {showV2Form && (
              <VersionSection
                label={showBothForms ? "v2" : undefined}
                filters={v2Filters}
              />
            )}

            {showV3Form && (
              <VersionSection
                label={showBothForms ? "v3" : undefined}
                filters={v3Filters}
                hint={
                  <>
                    v3 reverse hides addresses unless you enable the{" "}
                    <code>address</code> layer or the{" "}
                    <code>kartverket-matrikkelenadresse</code> source.
                  </>
                }
              >
                <TextField
                  size="medium"
                  label="countries"
                  className={styles.inputMedium}
                  placeholder="e.g. NOR"
                  value={v3.countries}
                  onChange={(evt) => setV3Field("countries", evt.target.value)}
                />
                <TextField
                  size="medium"
                  label="counties"
                  className={styles.inputXLarge}
                  placeholder="e.g. KVE:TopographicPlace:18"
                  value={v3.counties}
                  onChange={(evt) => setV3Field("counties", evt.target.value)}
                />
              </VersionSection>
            )}
          </>
        ) : (
          <>
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
            {showBothForms && (
              <div className={styles.formHint}>
                v2 and v3 use different id formats for OSM POIs, addresses and
                place names (e.g. <code>OSM:TopographicPlace:N</code> vs{" "}
                <code>OSM:PointOfInterest:N</code>).
              </div>
            )}
          </>
        )}
      </GridItem>
      <GridItem small={12}>
        {searchMode === "autocomplete" ? (
          <AutoCompleteResults
            searchTerm={searchTerm}
            leftEnv={leftEnv}
            rightEnv={rightEnv}
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
            v3={v3}
            onFocusChange={(lat, lon) => {
              setFocusLat(parseFloat(lat).toFixed(5));
              setFocusLon(parseFloat(lon).toFixed(5));
            }}
          />
        ) : searchMode === "reverse" ? (
          <ReverseResults
            lat={lat}
            lon={lon}
            leftEnv={leftEnv}
            rightEnv={rightEnv}
            size={parseInt(size) || 30}
            layers={layers}
            sources={sources}
            multiModal={multiModal}
            boundaryCircleRadius={boundaryCircleRadius}
            v3={v3}
            onPointChange={(newLat, newLon) => {
              setLat(parseFloat(newLat).toFixed(5));
              setLon(parseFloat(newLon).toFixed(5));
            }}
          />
        ) : (
          <PlaceResults ids={ids} leftEnv={leftEnv} rightEnv={rightEnv} />
        )}
      </GridItem>
    </GridContainer>
  );
}

export default App;
