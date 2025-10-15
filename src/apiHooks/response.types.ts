export type FetchError = {
  status: number;
  statusText: string;
};

export interface SearchResults {
  results: Result[];
}

export interface Result {
  name: string;
  layer: string;
  categories: string[];
  properties: Properties;
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
