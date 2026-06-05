import { describe, it, expect } from "vitest";
import { parseGeocoderResponse, parseV3Response } from "./api";

const v3Feature = {
  properties: {
    id: "NSR:StopPlace:1",
    names: { default: "Oslo S", display: "Oslo S, Oslo" },
    layer: "venue",
    source: "nsr",
    stopPlaceTypes: ["railStation"],
    categories: ["onstreetBus"],
  },
  geometry: { type: "Point" as const, coordinates: [10.75, 59.91] as [number, number] },
};

describe("parseV3Response", () => {
  it("flattens names.default to Result.name and keeps properties raw", () => {
    const [r] = parseV3Response({ features: [v3Feature] });
    expect(r.name).toBe("Oslo S");
    expect(r.layer).toBe("venue");
    expect(r.categories).toEqual(["railStation", "onstreetBus"]);
    // Raw v3 properties pass through untouched; no synthetic v2-shaped keys.
    expect(r.properties).toBe(v3Feature.properties);
    expect(r.properties).not.toHaveProperty("name");
    expect(r.properties).not.toHaveProperty("label");
    expect(r.properties).not.toHaveProperty("category");
  });

  it("uses names.display when useLabel is true", () => {
    const [r] = parseV3Response({ features: [v3Feature] }, true);
    expect(r.name).toBe("Oslo S, Oslo");
  });

  it("falls back to empty name when names is missing", () => {
    const [r] = parseV3Response({
      features: [{ ...v3Feature, properties: { ...v3Feature.properties, names: undefined } }],
    });
    expect(r.name).toBe("");
  });
});

describe("parseGeocoderResponse", () => {
  it("prefers label over name only when useLabel is true", () => {
    const data = {
      features: [{ properties: { id: "x", name: "Foo", label: "Foo, Bar", layer: "address", category: ["a"] } }],
    };
    expect(parseGeocoderResponse(data, true)[0].name).toBe("Foo, Bar");
    expect(parseGeocoderResponse(data, false)[0].name).toBe("Foo");
  });
});
