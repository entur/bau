import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { Result } from "../apiHooks/response.types";
import { createCustomIcon, fixLeafletIconPaths } from "./utils/markerIcons";
import styles from "./ComparisonMap.module.scss";

interface Props {
  v1Results: Result[];
  v2Results: Result[];
  showMatched: boolean;
  showV1Only: boolean;
  showV2Only: boolean;
  selectedCategories: string[];
  center?: [number, number];
  zoom?: number;
  focusPoint?: { lat: number; lon: number };
  onMapClick?: (lat: number, lon: number) => void;
}

export const ComparisonMap = ({
  v1Results,
  v2Results,
  showMatched,
  showV1Only,
  showV2Only,
  selectedCategories,
  center = [59.9139, 10.7522], // Oslo default
  zoom = 12,
  focusPoint,
  onMapClick,
}: Props) => {
  // Fix Leaflet icon paths on mount
  useEffect(() => {
    fixLeafletIconPaths();
  }, []);

  // Calculate matched and unique results
  const { matchedResults, v1OnlyResults, v2OnlyResults } = useMemo(() => {
    const matched: Result[] = [];
    const v1Only: Result[] = [];
    const v2Only: Result[] = [];

    // Find matched results (using v1 as base)
    v1Results.forEach((r1) => {
      const hasMatch = v2Results.some(
        (r2) => r2.properties.id === r1.properties.id,
      );
      if (hasMatch) {
        matched.push(r1);
      } else {
        v1Only.push(r1);
      }
    });

    // Find v2-only results
    v2Results.forEach((r2) => {
      const hasMatch = v1Results.some(
        (r1) => r1.properties.id === r2.properties.id,
      );
      if (!hasMatch) {
        v2Only.push(r2);
      }
    });

    return {
      matchedResults: matched,
      v1OnlyResults: v1Only,
      v2OnlyResults: v2Only,
    };
  }, [v1Results, v2Results]);

  // Filter results to show based on layer toggles
  const markersToShow = useMemo(() => {
    const markers: Array<{
      result: Result;
      color: "green" | "red" | "blue";
      status: string;
    }> = [];

    const categoryFilter = (result: Result) => {
      if (selectedCategories.length === 0) return true; // No filter
      return result.categories.some((cat) => selectedCategories.includes(cat));
    };

    if (showMatched) {
      matchedResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "green",
            status: "Exists in both versions",
          });
        }
      });
    }

    if (showV1Only) {
      v1OnlyResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "red",
            status: "Only in v1 (missing from v2)",
          });
        }
      });
    }

    if (showV2Only) {
      v2OnlyResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "blue",
            status: "Only in v2 (new result)",
          });
        }
      });
    }

    return markers;
  }, [
    matchedResults,
    v1OnlyResults,
    v2OnlyResults,
    showMatched,
    showV1Only,
    showV2Only,
    selectedCategories,
  ]);

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={center} zoom={zoom} className={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler />

        {/* Focus point marker */}
        {focusPoint && (
          <Marker
            position={[focusPoint.lat, focusPoint.lon]}
            icon={createCustomIcon("purple")}
          >
            <Popup>
              <div className={styles.popup}>
                <strong>Focus Point</strong>
                <div className={styles.popupDetail}>
                  Lat: {focusPoint.lat.toFixed(4)}
                </div>
                <div className={styles.popupDetail}>
                  Lon: {focusPoint.lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {markersToShow.map((marker, index) => (
          <Marker
            key={`${marker.result.properties.id}-${index}`}
            position={[
              marker.result.geometry!.coordinates[1], // latitude
              marker.result.geometry!.coordinates[0], // longitude
            ]}
            icon={createCustomIcon(marker.color)}
          >
            <Popup>
              <div className={styles.popup}>
                <strong>{marker.result.name}</strong>
                <div className={styles.popupDetail}>
                  Layer: {marker.result.layer}
                </div>
                {marker.result.categories.length > 0 && (
                  <div className={styles.popupDetail}>
                    Categories: {marker.result.categories.join(", ")}
                  </div>
                )}
                <div
                  className={styles.popupStatus}
                  style={{
                    color:
                      marker.color === "green"
                        ? "#00c853"
                        : marker.color === "red"
                          ? "#d32f2f"
                          : "#1976d2",
                  }}
                >
                  {marker.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
