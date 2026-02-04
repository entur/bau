import { Heading3 } from "@entur/typography";
import { Results } from "./results";
import { SearchResults, FetchError } from "../apiHooks/response.types";
import { V1Env, V2Env, V1_ENV_LABELS, V2_ENV_LABELS } from "../apiHooks/api";
import styles from "./results.module.scss";

interface ResultColumnProps {
  version: "v1" | "v2";
  env: V1Env | V2Env;
  searchResults: SearchResults;
  error?: FetchError;
  queryUrl: string;
  missingResults: string[];
  highlightedId: string | null;
  onResultHover: (id: string | null) => void;
  matchColors: Map<string, string>;
}

export const ResultColumn = ({
  version,
  env,
  searchResults,
  error,
  queryUrl,
  missingResults,
  highlightedId,
  onResultHover,
  matchColors,
}: ResultColumnProps) => {
  const envLabel = version === "v1"
    ? V1_ENV_LABELS[env as V1Env]
    : V2_ENV_LABELS[env as V2Env];
  const title = `Geocoder ${version} (${envLabel})`;

  return (
    <div>
      <div className={styles.resultsContainer}>
        <Heading3 className={styles.resultsHeading}>
          {title}
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
