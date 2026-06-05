export type FetchError = {
  status: number;
  statusText: string;
};

export interface Geometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface SearchResults {
  results: Result[];
}

export interface Result {
  name: string;
  layer: string;
  categories: string[];
  properties: Properties;
  geometry?: Geometry; // Optional to handle missing geometry gracefully
  notExistsInOtherVersion: boolean;
}

// `id` is the only field guaranteed across both v2 and v3; the rest are v2-shaped fields
// that v3 may not populate (v3 carries extra structured fields instead - see parseV3Response).
export interface Properties {
  id: string;
  gid?: string;
  layer?: string;
  source?: string;
  source_id?: string;
  name?: string;
  distance?: number;
  street?: string;
  accuracy?: string;
  country_a?: string;
  county?: string;
  county_gid?: string;
  locality?: string;
  locality_gid?: string;
  label?: string;
  category?: string[];
  tariff_zones?: string[];
  // v3-only structured fields, carried through raw from parseV3Response.
  names?: { default: string; display: string; label?: string };
  address?: Record<string, unknown>;
  categories?: string[];
  stopPlaceTypes?: string[];
  transportModes?: { mode: string; subMode?: string }[];
  fareZones?: string[];
}
