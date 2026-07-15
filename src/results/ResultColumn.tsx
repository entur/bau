import { Heading3 } from "@entur/typography";
import { Results } from "./results";
import { SearchResults, FetchError } from "../apiHooks/response.types";
import { Env, ENV_LABELS, ENV_OPTIONS } from "../apiHooks/api";
import styles from "./results.module.scss";

interface ResultColumnProps {
  // Which side this column is; not shown, only the select's accessible name.
  side: string;
  env: Env;
  onEnvChange: (env: Env) => void;
  searchResults: SearchResults;
  error?: FetchError;
  queryUrl: string;
  missingResults: string[];
  highlightedId: string | null;
  onResultHover: (id: string | null) => void;
  matchColors: Map<string, string>;
}

export const ResultColumn = ({
  side,
  env,
  onEnvChange,
  searchResults,
  error,
  queryUrl,
  missingResults,
  highlightedId,
  onResultHover,
  matchColors,
}: ResultColumnProps) => {
  const isOff = env === Env.OFF;

  return (
    <div>
      <div className={styles.resultsContainer}>
        <Heading3 className={styles.resultsHeading}>
          <select
            className={styles.columnEnvSelect}
            aria-label={`${side} environment`}
            value={env}
            onChange={(evt) => onEnvChange(evt.target.value as Env)}
          >
            {ENV_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {ENV_LABELS[option]}
              </option>
            ))}
          </select>
          {/* queryUrl can hold a stale URL after a side is switched to off, so guard on isOff too. */}
          {!isOff && queryUrl && (
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
        {!isOff && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
