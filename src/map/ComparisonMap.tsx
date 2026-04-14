import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, MapRef, NavigationControl } from "react-map-gl/maplibre";
import { LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Result } from "../apiHooks/response.types";
import { MarkerColor, colorMap } from "./utils/markerIcons";
import styles from "./ComparisonMap.module.scss";

interface Props {
  leftResults: Result[];
  rightResults: Result[];
  showMatched: boolean;
  showLeftOnly: boolean;
  showRightOnly: boolean;
  selectedCategories: string[];
  center?: [number, number];
  zoom?: number;
  focusPoint?: { lat: number; lon: number };
  onMapClick?: (lat: number, lon: number) => void;
  reversePoint?: { lat: number; lon: number };
}

interface MarkerEntry {
  result: Result;
  color: MarkerColor;
  status: string;
}

const CircleMarker = ({
  color,
  pulsing,
  symbol,
}: {
  color: MarkerColor;
  pulsing?: boolean;
  symbol?: string;
}) => {
  const hex = colorMap[color];
  const size = pulsing ? 24 : 12;
  const border = pulsing ? 4 : 2;

  return (
    <div
      className={pulsing ? styles.pulsingMarker : undefined}
      style={{
        backgroundColor: hex,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${border}px solid white`,
        boxShadow: pulsing
          ? `0 0 0 2px ${hex}, 0 4px 8px rgba(0,0,0,0.4)`
          : "0 2px 4px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {symbol && (
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          {symbol}
        </span>
      )}
    </div>
  );
};

export const ComparisonMap = ({
  leftResults,
  rightResults,
  showMatched,
  showLeftOnly,
  showRightOnly,
  selectedCategories,
  center = [59.9139, 10.7522], // Oslo default [lat, lon]
  zoom = 12,
  focusPoint,
  onMapClick,
  reversePoint,
}: Props) => {
  const mapRef = useRef<MapRef>(null);
  const prevMarkersCountRef = useRef<number>(-1);
  const prevFocusRef = useRef<{ lat: number; lon: number } | undefined>(
    undefined,
  );
  const [popupInfo, setPopupInfo] = useState<{
    lng: number;
    lat: number;
    content: { name: string; layer: string; categories: string[]; status: string; color: MarkerColor };
  } | null>(null);

  // Calculate matched and unique results
  const { matchedResults, leftOnlyResults, rightOnlyResults } = useMemo(() => {
    const matched: Result[] = [];
    const leftOnly: Result[] = [];
    const rightOnly: Result[] = [];

    leftResults.forEach((r1) => {
      const hasMatch = rightResults.some(
        (r2) => r2.properties.id === r1.properties.id,
      );
      if (hasMatch) {
        matched.push(r1);
      } else {
        leftOnly.push(r1);
      }
    });

    rightResults.forEach((r2) => {
      const hasMatch = leftResults.some(
        (r1) => r1.properties.id === r2.properties.id,
      );
      if (!hasMatch) {
        rightOnly.push(r2);
      }
    });

    return {
      matchedResults: matched,
      leftOnlyResults: leftOnly,
      rightOnlyResults: rightOnly,
    };
  }, [leftResults, rightResults]);

  // Filter results to show based on layer toggles
  const markersToShow = useMemo(() => {
    const markers: MarkerEntry[] = [];

    const categoryFilter = (result: Result) => {
      if (selectedCategories.length === 0) return true;
      return result.categories.some((cat) => selectedCategories.includes(cat));
    };

    if (showMatched) {
      matchedResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "green",
            status: "Exists in both",
          });
        }
      });
    }

    if (showLeftOnly) {
      leftOnlyResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "red",
            status: "Only in left",
          });
        }
      });
    }

    if (showRightOnly) {
      rightOnlyResults.forEach((result) => {
        if (result.geometry && categoryFilter(result)) {
          markers.push({
            result,
            color: "blue",
            status: "Only in right",
          });
        }
      });
    }

    return markers;
  }, [
    matchedResults,
    leftOnlyResults,
    rightOnlyResults,
    showMatched,
    showLeftOnly,
    showRightOnly,
    selectedCategories,
  ]);

  // Auto-fit bounds when markers change (but not when focusPoint is set)
  useEffect(() => {
    if (focusPoint) return;
    const map = mapRef.current;
    if (!map) return;

    const markersCount = markersToShow.length;
    if (prevMarkersCountRef.current === markersCount) return;
    prevMarkersCountRef.current = markersCount;

    const coords = markersToShow
      .filter((m) => m.result.geometry)
      .map((m) => m.result.geometry!.coordinates);

    if (coords.length === 0) return;

    const bounds = new LngLatBounds(
      [coords[0][0], coords[0][1]],
      [coords[0][0], coords[0][1]],
    );
    coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));

    map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  }, [markersToShow, focusPoint]);

  // Pan to focusPoint when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusPoint) return;

    if (
      prevFocusRef.current &&
      prevFocusRef.current.lat === focusPoint.lat &&
      prevFocusRef.current.lon === focusPoint.lon
    )
      return;

    map.panTo([focusPoint.lon, focusPoint.lat]);
    prevFocusRef.current = focusPoint;
  }, [focusPoint]);

  const handleClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    },
    [onMapClick],
  );

  return (
    <div className={styles.mapWrapper}>
      <Map
        ref={mapRef}
        onLoad={(e) => {
          const el = e.target.getContainer().querySelector(
            ".maplibregl-compact-show",
          );
          el?.classList.remove("maplibregl-compact-show");
        }}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        }}
        onClick={handleClick}
      >
        <NavigationControl position="top-left" showCompass={false} />
        {/* Focus point marker */}
        {focusPoint && (
          <Marker
            longitude={focusPoint.lon}
            latitude={focusPoint.lat}
            anchor="center"
          >
            <CircleMarker color="purple" pulsing symbol="⊕" />
          </Marker>
        )}

        {/* Reverse search point marker */}
        {reversePoint && (
          <Marker
            longitude={reversePoint.lon}
            latitude={reversePoint.lat}
            anchor="center"
          >
            <CircleMarker color="orange" pulsing symbol="📍" />
          </Marker>
        )}

        {/* Result markers */}
        {markersToShow.map((marker, index) => (
          <Marker
            key={`${marker.result.properties.id}-${index}`}
            longitude={marker.result.geometry!.coordinates[0]}
            latitude={marker.result.geometry!.coordinates[1]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo({
                lng: marker.result.geometry!.coordinates[0],
                lat: marker.result.geometry!.coordinates[1],
                content: {
                  name: marker.result.name,
                  layer: marker.result.layer,
                  categories: marker.result.categories,
                  status: marker.status,
                  color: marker.color,
                },
              });
            }}
          >
            <CircleMarker color={marker.color} />
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            <div className={styles.popup}>
              <strong>{popupInfo.content.name}</strong>
              <div className={styles.popupDetail}>
                Layer: {popupInfo.content.layer}
              </div>
              {popupInfo.content.categories.length > 0 && (
                <div className={styles.popupDetail}>
                  Categories: {popupInfo.content.categories.join(", ")}
                </div>
              )}
              <div
                className={styles.popupStatus}
                style={{ color: colorMap[popupInfo.content.color] }}
              >
                {popupInfo.content.status}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
