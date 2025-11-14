import { useState, useEffect } from "react";
import logo from "./logo.png";
import { Heading3, Heading5 } from "@entur/typography";
import styles from "./App.module.scss";
import { GridContainer, GridItem } from "@entur/grid";
import { TextField } from "@entur/form";
import { Dropdown } from "@entur/dropdown";
import { AutoCompleteResults } from "./results/autoCompleteResults";
import { ReverseResults } from "./results/reverseResults";
import { ApiEnvironment } from "./apiHooks/useAutoComplete";

type SearchMode = "autocomplete" | "reverse";

const getDefaultEnvironment = (): ApiEnvironment => {
  const hostname = window.location.hostname;
  if (hostname === "api.entur.io") {
    return ApiEnvironment.PROD;
  } else if (hostname === "api.staging.entur.io") {
    return ApiEnvironment.STAGING;
  } else if (hostname === "api.dev.entur.io") {
    return ApiEnvironment.DEV;
  }
  // Default to DEV for localhost and other domains
  return ApiEnvironment.DEV;
};

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = (urlParams.get("mode") as SearchMode) || "autocomplete";
  const initialSearchTerm = urlParams.get("q") || "";
  const initialLat = urlParams.get("lat") || "";
  const initialLon = urlParams.get("lon") || "";
  const initialEnv =
    (urlParams.get("env") as ApiEnvironment) || getDefaultEnvironment();

  const initialSize = urlParams.get("size") || "30";
  const initialFocusLat = urlParams.get("focus_lat") || "";
  const initialFocusLon = urlParams.get("focus_lon") || "";
  const initialLayers = urlParams.get("layers") || "";
  const initialSources = urlParams.get("sources") || "";
  const initialMultiModal = urlParams.get("multiModal") || "";
  const initialBoundaryCircleRadius = urlParams.get("boundary.circle.radius") || "";

  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [lat, setLat] = useState<string>(initialLat);
  const [lon, setLon] = useState<string>(initialLon);
  const [environment, setEnvironment] = useState<ApiEnvironment>(initialEnv);
  const [size, setSize] = useState<string>(initialSize);
  const [focusLat, setFocusLat] = useState<string>(initialFocusLat);
  const [focusLon, setFocusLon] = useState<string>(initialFocusLon);
  const [layers, setLayers] = useState<string>(initialLayers);
  const [sources, setSources] = useState<string>(initialSources);
  const [multiModal, setMultiModal] = useState<string>(initialMultiModal);
  const [boundaryCircleRadius, setBoundaryCircleRadius] = useState<string>(initialBoundaryCircleRadius);
  const isV2Overridden = !!import.meta.env.VITE_GEOCODER_V2_URL;

  const handleClearFocus = () => {
    setFocusLat("");
    setFocusLon("");
  };

  const sanitizeCoordinate = (value: string): string => {
    // Replace comma with period for decimal separator
    // Allow only numbers, decimal point, and minus sign at the start
    // Remove any non-numeric characters except . and -
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

    if (environment !== getDefaultEnvironment()) {
      params.set("env", environment);
    }

    if (searchMode === "autocomplete" && searchTerm) {
      params.set("q", searchTerm);
    } else if (searchMode === "reverse") {
      if (lat) params.set("lat", lat);
      if (lon) params.set("lon", lon);
    }

    if (size && size !== "30") {
      params.set("size", size);
    }

    if (focusLat && focusLon) {
      params.set("focus_lat", focusLat);
      params.set("focus_lon", focusLon);
    }

    if (layers) params.set("layers", layers);
    if (sources) params.set("sources", sources);
    if (multiModal) params.set("multiModal", multiModal);
    if (boundaryCircleRadius) params.set("boundary.circle.radius", boundaryCircleRadius);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [searchMode, searchTerm, lat, lon, environment, size, focusLat, focusLon, layers, sources, multiModal, boundaryCircleRadius]);

  return (
    <GridContainer spacing="none">
      <GridItem small={12} className={styles.appHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src={logo} className={styles.appLogo} alt="Entur logo" />
          <Heading5 margin="none">Geocoder-v2 Test</Heading5>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setSearchMode("autocomplete")}
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: "0.9rem",
                background: searchMode === "autocomplete" ? "#e8eaf6" : "#fff",
                color: "#181C56",
                border:
                  searchMode === "autocomplete"
                    ? "2px solid #181C56"
                    : "2px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: searchMode === "autocomplete" ? "bold" : "normal",
                boxShadow:
                  searchMode === "autocomplete"
                    ? "inset 0 2px 4px rgba(24, 28, 86, 0.15)"
                    : "none",
                transition: "all 0.2s ease",
                height: "32px",
              }}
            >
              Autocomplete
            </button>
            <button
              onClick={() => setSearchMode("reverse")}
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: "0.9rem",
                background: searchMode === "reverse" ? "#e8eaf6" : "#fff",
                color: "#181C56",
                border:
                  searchMode === "reverse"
                    ? "2px solid #181C56"
                    : "2px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: searchMode === "reverse" ? "bold" : "normal",
                boxShadow:
                  searchMode === "reverse"
                    ? "inset 0 2px 4px rgba(24, 28, 86, 0.15)"
                    : "none",
                transition: "all 0.2s ease",
                height: "32px",
              }}
            >
              Reverse
            </button>
          </div>
          <label
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Environment:
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as ApiEnvironment)}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.9rem",
                border: "2px solid #181C56",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#fff",
                height: "32px",
              }}
            >
              <option value={ApiEnvironment.DEV}>Dev</option>
              <option value={ApiEnvironment.STAGING}>Staging</option>
              <option value={ApiEnvironment.PROD}>Prod</option>
            </select>
          </label>
        </div>
      </GridItem>
      {isV2Overridden && (
        <GridItem small={12}>
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              padding: "0.75rem 1rem",
              margin: "0.5rem 1rem",
              color: "#856404",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ <strong>Notice:</strong> Geocoder V2 is overridden with
            VITE_GEOCODER_V2_URL: {import.meta.env.VITE_GEOCODER_V2_URL}
          </div>
        </GridItem>
      )}
      <GridItem small={12} className={styles.searchContainer}>
        {searchMode === "autocomplete" ? (
          <>
            <Heading3 margin="none" className={styles.searchHeading}>
              Hvor vil du reise?
            </Heading3>
            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
            >
              <TextField
                size="medium"
                label="Søk"
                style={{ width: "352px" }}
                value={searchTerm}
                onChange={(evt) => setSearchTerm(evt.target.value)}
              />
              <TextField
                size="medium"
                label="Result size"
                type="number"
                style={{ width: "120px" }}
                placeholder="30"
                value={size}
                onChange={(evt) => setSize(evt.target.value)}
              />
              <TextField
                size="medium"
                label="Focus Latitude"
                style={{ width: "150px" }}
                placeholder="Click map to set"
                value={focusLat}
                onChange={(evt) =>
                  setFocusLat(sanitizeCoordinate(evt.target.value))
                }
              />
              <TextField
                size="medium"
                label="Focus Longitude"
                style={{ width: "150px" }}
                placeholder="Click map to set"
                value={focusLon}
                onChange={(evt) =>
                  setFocusLon(sanitizeCoordinate(evt.target.value))
                }
              />
              <Dropdown
                label="Layers"
                items={[
                  { value: "", label: "" },
                  { value: "venue", label: "venue" },
                  { value: "address", label: "address" },
                ]}
                selectedItem={layers ? { value: layers, label: layers } : { value: "", label: "" }}
                onChange={item => setLayers(item?.value || "")}
                style={{ width: "150px" }}
              />
              <Dropdown
                label="Sources"
                items={[
                  { value: "", label: "" },
                  { value: "whosonfirst", label: "whosonfirst" },
                  { value: "openstreetmap", label: "openstreetmap" },
                ]}
                selectedItem={sources ? { value: sources, label: sources } : { value: "", label: "" }}
                onChange={item => setSources(item?.value || "")}
                style={{ width: "150px" }}
              />
              <Dropdown
                label="MultiModal"
                items={[
                  { value: "", label: "" },
                  { value: "all", label: "all" },
                  { value: "child", label: "child" },
                  { value: "parent", label: "parent" },
                ]}
                selectedItem={multiModal ? { value: multiModal, label: multiModal } : { value: "", label: "" }}
                onChange={item => setMultiModal(item?.value || "")}
                style={{ width: "150px" }}
              />
              {focusLat && focusLon && (
                <button
                  onClick={handleClearFocus}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    border: "2px solid #d32f2f",
                    borderRadius: "4px",
                    background: "#fff",
                    color: "#d32f2f",
                    cursor: "pointer",
                    fontWeight: "500",
                    height: "42px",
                  }}
                >
                  Clear focus
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <Heading3 margin="none" className={styles.searchHeading}>
              Reverse Geocoding
            </Heading3>
            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
            >
              <TextField
                size="medium"
                label="Latitude"
                style={{ maxWidth: "170px" }}
                placeholder="e.g. 59.9139 or click map"
                value={lat}
                onChange={(evt) => setLat(sanitizeCoordinate(evt.target.value))}
              />
              <TextField
                size="medium"
                label="Longitude"
                style={{ maxWidth: "170px" }}
                placeholder="e.g. 10.7522 or click map"
                value={lon}
                onChange={(evt) => setLon(sanitizeCoordinate(evt.target.value))}
              />
              <TextField
                size="medium"
                label="Boundary radius (km)"
                type="number"
                style={{ width: "150px" }}
                value={boundaryCircleRadius}
                onChange={evt => setBoundaryCircleRadius(evt.target.value)}
              />
              <TextField
                size="medium"
                label="Result size"
                type="number"
                style={{ width: "120px" }}
                placeholder="30"
                value={size}
                onChange={(evt) => setSize(evt.target.value)}
              />
              <Dropdown
                label="Layers"
                items={[
                  { value: "", label: "" },
                  { value: "venue", label: "venue" },
                  { value: "address", label: "address" },
                ]}
                selectedItem={layers ? { value: layers, label: layers } : { value: "", label: "" }}
                onChange={item => setLayers(item?.value || "")}
                style={{ width: "150px" }}
              />
              <Dropdown
                label="Sources"
                items={[
                  { value: "", label: "" },
                  { value: "whosonfirst", label: "whosonfirst" },
                  { value: "openstreetmap", label: "openstreetmap" },
                ]}
                selectedItem={sources ? { value: sources, label: sources } : { value: "", label: "" }}
                onChange={item => setSources(item?.value || "")}
                style={{ width: "150px" }}
              />
              <Dropdown
                label="MultiModal"
                items={[
                  { value: "", label: "" },
                  { value: "all", label: "all" },
                  { value: "child", label: "child" },
                  { value: "parent", label: "parent" },
                ]}
                selectedItem={multiModal ? { value: multiModal, label: multiModal } : { value: "", label: "" }}
                onChange={item => setMultiModal(item?.value || "")}
                style={{ width: "150px" }}
              />
            </div>
          </>
        )}
      </GridItem>
      <GridItem small={12}>
        {searchMode === "autocomplete" ? (
          <AutoCompleteResults
            searchTerm={searchTerm}
            environment={environment}
            size={parseInt(size) || 30}
            focusLat={focusLat}
            focusLon={focusLon}
            layers={layers}
            sources={sources}
            multiModal={multiModal}
            onFocusChange={(lat, lon) => {
              setFocusLat(parseFloat(lat).toFixed(5));
              setFocusLon(parseFloat(lon).toFixed(5));
            }}
          />
        ) : (
          <ReverseResults
            lat={lat}
            lon={lon}
            environment={environment}
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
        )}
      </GridItem>
    </GridContainer>
  );
}

export default App;
