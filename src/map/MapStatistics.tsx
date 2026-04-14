import styles from "./MapStatistics.module.scss";

interface Props {
  matchedCount: number;
  leftOnlyCount: number;
  rightOnlyCount: number;
  totalLeft: number;
  totalRight: number;
  visibleCount: number;
}

export const MapStatistics = ({
  matchedCount,
  leftOnlyCount,
  rightOnlyCount,
  totalLeft,
  totalRight,
  visibleCount,
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
        <span>Left only: {leftOnlyCount}</span>
      </div>
      <div className={styles.statRow}>
        <span className={styles.statIcon}>🔵</span>
        <span>Right only: {rightOnlyCount}</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.statRow}>
        <span>Total left: {totalLeft}</span>
      </div>
      <div className={styles.statRow}>
        <span>Total right: {totalRight}</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.statRow}>
        <span>Visible on map: {visibleCount}</span>
      </div>
    </div>
  );
};
