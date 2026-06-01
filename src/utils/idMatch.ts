/**
 * Canonicalize a place id so the same entity matches across geocoder v2 and v3, whose
 * id schemes diverge for OSM POIs, matrikkel addresses and stedsnavn places:
 *
 *   OSM:TopographicPlace:N (v2)  / OSM:PointOfInterest:N (v3)        -> osm:N
 *   bare numeric (v2)            / KVE:PostalAddress:N, KVE:PlaceName:N (v3) -> num:N
 *   NSR:StopPlace:N, NSR:GroupOfStopPlaces:N, KVE:TopographicPlace:* -> unchanged (same both)
 *
 * v2 already exposes both addresses and stedsnavn as bare numerics, so collapsing the v3
 * KVE: forms to `num:N` matches the ambiguity that already exists on the v2 wire.
 */
export const normalizePlaceId = (id: string): string => {
  const osm = id.match(/^OSM:(?:TopographicPlace|PointOfInterest):(.+)$/);
  if (osm) return `osm:${osm[1]}`;

  const kve = id.match(/^KVE:(?:PostalAddress|PlaceName):(.+)$/);
  if (kve) return `num:${kve[1]}`;

  if (/^\d+$/.test(id)) return `num:${id}`;

  return id;
};

/** Whether two place ids refer to the same entity, across v2/v3 id schemes. */
export const idsMatch = (a: string, b: string): boolean =>
  normalizePlaceId(a) === normalizePlaceId(b);
