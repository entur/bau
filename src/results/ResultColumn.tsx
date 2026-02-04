import { Heading3 } from "@entur/typography";
import { Results } from "./results";
import { SearchResults, FetchError } from "../apiHooks/response.types";
import { GeocoderVersion } from "../apiHooks/api";
import styles from "./results.module.scss";

interface ResultColumnProps {
  version: GeocoderVersion;
  searchResults: SearchResults;
  error?: FetchError;
  queryUrl: string;
  missingResults: string[];
  highlightedId: string | null;
  onResultHover: (id: string | null) => void;
  matchColors: Map<string, string>;
  hideVersion?: boolean;
}

export const ResultColumn = ({
  version,
  searchResults,
  error,
  queryUrl,
  missingResults,
  highlightedId,
  onResultHover,
  matchColors,
  hideVersion = false,
}: ResultColumnProps) => {
  return (
    <div>
      <div className={styles.resultsContainer}>
        <Heading3 className={styles.resultsHeading}>
          {hideVersion ? "Geocoder" : `Geocoder - ${version}`}
          {queryUrl && (
            <a
              href={`${queryUrl}&debug=true`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.debugLink}
            >
              [debug]
            </a>
          )}
        </Heading3>
        {error && (
          <div className={styles.errorBanner}>
            <strong>Error:</strong> {error.statusText}
            {error.status > 0 && ` (HTTP ${error.status})`}
            <div className={styles.errorSubtext}>Showing empty result</div>
          </div>
        )}
        <Results
          searchResults={searchResults}
          missingResults={missingResults}
          highlightedId={highlightedId}
          onResultHover={onResultHover}
          matchColors={matchColors}
        />
      </div>
    </div>
  );
};
