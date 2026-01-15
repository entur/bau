import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Result } from "../apiHooks/response.types";
import L, { LatLngExpression } from "leaflet";
import { useEffect, useMemo, useState } from "react";

// Fix for default icon issue with Webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  v1Results?: (Feature | Result)[];
  v2Results?: (Feature | Result)[];
  reversePoint?: { lat: number; lon: number };
  focusPoint?: { lat: number; lon: number };
  onReversePointChange?: (lat: number, lon: number) => void;
  onFocusPointChange?: (lat: number, lon: number) => void;
}

export const MapContainerWrapper = ({
  v1Results = [],
  v2Results = [],
  reversePoint,
  focusPoint,
  onReversePointChange,
  onFocusPointChange,
}: Props) => {
  const [currentReversePoint, setCurrentReversePoint] = useState(reversePoint);
  const [currentFocusPoint, setCurrentFocusPoint] = useState(focusPoint);

  useEffect(() => {
    setCurrentReversePoint(reversePoint);
  }, [reversePoint]);

  useEffect(() => {
    setCurrentFocusPoint(focusPoint);
  }, [focusPoint]);

  const allPoints = useMemo(() => {
    const points: LatLngExpression[] = [];
    v1Results.forEach((r) => {
      if (r.geometry?.coordinates) {
        points.push([r.geometry.coordinates[1], r.geometry.coordinates[0]]);
      }
    });
    v2Results.forEach((r) => {
      if (r.geometry?.coordinates) {
        points.push([r.geometry.coordinates[1], r.geometry.coordinates[0]]);
      }
    });
    if (currentReversePoint) {
      points.push([currentReversePoint.lat, currentReversePoint.lon]);
    }
    if (currentFocusPoint) {
      points.push([currentFocusPoint.lat, currentFocusPoint.lon]);
    }
    return points;
  }, [v1Results, v2Results, currentReversePoint, currentFocusPoint]);

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (allPoints.length > 0) {
        map.fitBounds(allPoints as L.LatLngBoundsExpression);
      }
    }, [map]);
    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        if (onReversePointChange) {
          setCurrentReversePoint({ lat: e.latlng.lat, lon: e.latlng.lng });
          onReversePointChange(e.latlng.lat, e.latlng.lng);
        }
        if (onFocusPointChange) {
          setCurrentFocusPoint({ lat: e.latlng.lat, lon: e.latlng.lng });
          onFocusPointChange(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[59.9139, 10.7522]}
      zoom={13}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapUpdater />
      <MapClickHandler />
      {v1Results.map(
        (result, index) =>
          result.geometry && (
            <CircleMarker
              key={`v1-${index}`}
              center={[
                result.geometry.coordinates[1],
                result.geometry.coordinates[0],
              ]}
              radius={5}
              color="blue"
            >
              <Popup>
                V1: {result.properties.name} <br /> {result.properties.label}
              </Popup>
            </CircleMarker>
          ),
      )}
      {v2Results.map(
        (result, index) =>
          result.geometry && (
            <CircleMarker
              key={`v2-${index}`}
              center={[
                result.geometry.coordinates[1],
                result.geometry.coordinates[0],
              ]}
              radius={5}
              color="red"
            >
              <Popup>
                V2: {result.properties.name} <br /> {result.properties.label}
              </Popup>
            </CircleMarker>
          ),
      )}
      {currentReversePoint && (
        <Marker
          position={[currentReversePoint.lat, currentReversePoint.lon]}
          icon={
            new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }
        >
          <Popup>Reverse Geocoding Point</Popup>
        </Marker>
      )}
      {currentFocusPoint && (
        <Marker
          position={[currentFocusPoint.lat, currentFocusPoint.lon]}
          icon={
            new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }
        >
          <Popup>Focus Point</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};
