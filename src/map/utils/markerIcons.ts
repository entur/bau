import L from "leaflet";

/**
 * Creates a custom circular marker icon with specified color.
 */
export const createCustomIcon = (
  color: "green" | "red" | "blue" | "purple" | "orange",
): L.DivIcon => {
  const colorMap = {
    green: "#00c853",
    red: "#d32f2f",
    blue: "#1976d2",
    purple: "#9c27b0",
    orange: "#ff9800",
  };

  // Special styling for focus marker (purple)
  if (color === "purple") {
    return L.divIcon({
      className: "custom-marker focus-marker",
      html: `
        <div style="
          background-color: ${colorMap[color]};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 2px ${colorMap[color]}, 0 4px 8px rgba(0,0,0,0.4);
          animation: pulse 2s ease-in-out infinite;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">⊕</div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  // Special styling for reverse search marker (orange)
  if (color === "orange") {
    return L.divIcon({
      className: "custom-marker reverse-marker",
      html: `
        <div style="
          background-color: ${colorMap[color]};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 2px ${colorMap[color]}, 0 4px 8px rgba(0,0,0,0.4);
          animation: pulse 2s ease-in-out infinite;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">📍</div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  // Regular markers
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
