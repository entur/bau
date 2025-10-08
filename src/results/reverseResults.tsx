import { GeocoderVersion } from "../apiHooks/useAutoComplete";
import { useReverse } from "../apiHooks/useReverse";
import { useEffect, useState } from "react";
import { GridContainer, GridItem } from "@entur/grid";
import { Results } from "./results";
import { Heading3 } from "@entur/typography";
import styles from "./results.module.scss";

interface Props {
  lat: string;
  lon: string;
}

export const ReverseResults = ({ lat, lon }: Props) => {

  const resultsV1 = useReverse(lat, lon, GeocoderVersion.V1);
  const resultsV2 = useReverse(lat, lon, GeocoderVersion.V2);

  const [missingResultIdInV1, setMissingResultIdsInV1] = useState<string[]>([]);
  const [missingResultIdInV2, setMissingResultIdsInV2] = useState<string[]>([]);

  useEffect(() => {
    setMissingResultIdsInV1(
      resultsV1.searchResults.results
               .map(result1 => result1.properties.id)
               .filter(id1 => !resultsV2.searchResults.results.some(result2 => result2.properties.id.includes(id1)))
    );
    setMissingResultIdsInV2(
      resultsV2.searchResults.results
               .map(result2 => result2.properties.id)
               .filter(id2 => !resultsV1.searchResults.results.some(result1 => result1.properties.id.includes(id2)))
    );
  }, [resultsV1.searchResults.results, resultsV2.searchResults.results]);

  return (
    <GridContainer spacing='none'>
      <GridItem small={4}>
        <div className={styles.resultsContainer}>
          <Heading3 className={styles.resultsHeading}>Geocoder - {GeocoderVersion.V1}</Heading3>
          <Results searchResults={resultsV1.searchResults} missingResults={missingResultIdInV1} />
        </div>
      </GridItem>
      <GridItem small={4}>
        <div className={styles.resultsContainer}>
          <Heading3 className={styles.resultsHeading}>Geocoder - {GeocoderVersion.V2}</Heading3>
          <Results searchResults={resultsV2.searchResults} missingResults={missingResultIdInV2} />
        </div>
      </GridItem>
    </GridContainer>
  );
}

