import {
  GeocoderVersion,
  usePlace,
  ApiEnvironment,
} from "../apiHooks/usePlace";
import { useEffect, useState } from "react";
import { Results } from "./results";
import { Heading3 } from "@entur/typography";
import styles from "./results.module.scss";
import { getMatchColor } from "../utils/colorHash";
import { MapContainerWrapper } from "../map/MapContainerWrapper";

interface Props {
  ids: string;
  environment: ApiEnvironment;
}

export const PlaceResults = ({ ids, environment }: Props) => {
  const resultsV1 = usePlace({
    ids,
    environment,
    version: GeocoderVersion.V1,
  });
  const resultsV2 = usePlace({
    ids,
    environment,
    version: GeocoderVersion.V2,
  });

  const [missingResultIdInV1, setMissingResultIdsInV1] = useState<string[]>([]);
  const [missingResultIdInV2, setMissingResultIdsInV2] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const matchColorsV1 = new Map<string, string>();
  const matchColorsV2 = new Map<string, string>();

  resultsV1.features.forEach((result) => {
    matchColorsV1.set(
      result.properties.id,
      getMatchColor(
        result.properties.id,
        resultsV2.features,
        missingResultIdInV1.includes(result.properties.id),
      ),
    );
  });

  resultsV2.features.forEach((result) => {
    matchColorsV2.set(
      result.properties.id,
      getMatchColor(
        result.properties.id,
        resultsV1.features,
        missingResultIdInV2.includes(result.properties.id),
      ),
    );
  });

  useEffect(() => {
    setMissingResultIdsInV1(
      resultsV1.features
        .map((result1) => result1.properties.id)
        .filter(
          (id1) =>
            !resultsV2.features.some((result2) =>
              result2.properties.id.includes(id1),
            ),
        ),
    );
    setMissingResultIdsInV2(
      resultsV2.features
        .map((result2) => result2.properties.id)
        .filter(
          (id2) =>
            !resultsV1.features.some((result1) =>
              result1.properties.id.includes(id2),
            ),
        ),
    );
  }, [resultsV1.features, resultsV2.features]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr",
          gap: "1rem",
          alignItems: "start",
        }}
        className={styles.resultsLayout}
      >
        <div>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V1}
              {resultsV1.queryUrl && (
                <a
                  href={`${resultsV1.queryUrl}&debug=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "normal",
                    textDecoration: "none",
                    color: "#0b91ef",
                  }}
                >
                  [debug]
                </a>
              )}
            </Heading3>
            <Results
              features={resultsV1.features}
              loading={resultsV1.loading}
              error={resultsV1.error}
              missingResults={missingResultIdInV1}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV1}
              onFocusChange={() => {}}
            />
          </div>
        </div>

        <div>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V2}
              {resultsV2.queryUrl && (
                <a
                  href={`${resultsV2.queryUrl}&debug=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "normal",
                    textDecoration: "none",
                    color: "#0b91ef",
                  }}
                >
                  [debug]
                </a>
              )}
            </Heading3>
            <Results
              features={resultsV2.features}
              loading={resultsV2.loading}
              error={resultsV2.error}
              missingResults={missingResultIdInV2}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV2}
              onFocusChange={() => {}}
            />
          </div>
        </div>

        <div>
          <MapContainerWrapper
            v1Results={resultsV1.features}
            v2Results={resultsV2.features}
          />
        </div>
      </div>
    </>
  );
};
