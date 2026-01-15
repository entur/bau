export type FetchError = {
  status: number;
  statusText: string;
};

export interface Geometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
  bbox: [number, number, number, number];
}

export interface Feature {
  type: "Feature";
  geometry?: Geometry;
  properties: Properties;
}

export interface SearchResults {
  results: Result[];
}

export interface Result {
  type: "Feature";
  name: string;
  layer: string;
  categories: string[];
  properties: Properties;
  geometry?: Geometry; // Optional to handle missing geometry gracefully
  notExistsInOtherVersion: boolean;
}

export interface Properties {
  id: string;
  gid: string;
  layer: string;
  source: string;
  source_id: string;
  name: string;
  distance: number;
  street: string;
  accuracy: string;
  country_a: string;
  county: string;
  county_gid: string;
  locality: string;
  locality_gid: string;
  label: string;
  category: string[];
  tariff_zones: string[];
}
