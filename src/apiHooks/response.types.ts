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

export interface Properties {
  id: string;
  gid: string;
  layer: string;
  source: string;
  source_id: string;
  name: string;
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
