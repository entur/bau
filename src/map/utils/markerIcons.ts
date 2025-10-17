import L from "leaflet";

/**
 * Creates a custom circular marker icon with specified color.
 */
export const createCustomIcon = (
  color: "green" | "red" | "blue",
): L.DivIcon => {
  const colorMap = {
    green: "#00c853",
    red: "#d32f2f",
    blue: "#1976d2",
  };

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${colorMap[color]};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

/**
 * Fix Leaflet default marker icon paths (common webpack/vite issue).
 * Call this once at app initialization.
 */
export const fixLeafletIconPaths = (): void => {
  // This prevents Leaflet from looking for marker images in wrong paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
      "leaflet/dist/images/marker-icon-2x.png",
      import.meta.url,
    ).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
      .href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
      .href,
  });
};
