import styles from "./MapStatistics.module.scss";

interface Props {
  matchedCount: number;
  v1OnlyCount: number;
  v2OnlyCount: number;
  totalV1: number;
  totalV2: number;
}

export const MapStatistics = ({
  matchedCount,
  v1OnlyCount,
  v2OnlyCount,
  totalV1,
  totalV2,
}: Props) => {
  return (
    <div className={styles.statsPanel}>
      <h4 className={styles.statsHeading}>Result Distribution</h4>
      <div className={styles.statRow}>
        <span className={styles.statIcon}>🟢</span>
        <span>Matched: {matchedCount}</span>
      </div>
      <div className={styles.statRow}>
        <span className={styles.statIcon}>🔴</span>
        <span>V1 only: {v1OnlyCount}</span>
      </div>
      <div className={styles.statRow}>
        <span className={styles.statIcon}>🔵</span>
        <span>V2 only: {v2OnlyCount}</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.statRow}>
        <span>Total V1: {totalV1}</span>
      </div>
      <div className={styles.statRow}>
        <span>Total V2: {totalV2}</span>
      </div>
    </div>
  );
};
