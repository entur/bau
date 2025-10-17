import styles from "./MapControls.module.scss";

interface Props {
  showMatched: boolean;
  showV1Only: boolean;
  showV2Only: boolean;
  onToggleMatched: (show: boolean) => void;
  onToggleV1Only: (show: boolean) => void;
  onToggleV2Only: (show: boolean) => void;
}

export const MapControls = ({
  showMatched,
  showV1Only,
  showV2Only,
  onToggleMatched,
  onToggleV1Only,
  onToggleV2Only,
}: Props) => {
  return (
    <div className={styles.controlsPanel}>
      <h4 className={styles.controlsHeading}>Layer Controls</h4>
      <label className={styles.controlLabel}>
        <input
          type="checkbox"
          checked={showMatched}
          onChange={(e) => onToggleMatched(e.target.checked)}
          className={styles.controlCheckbox}
        />
        <span className={styles.controlIcon}>🟢</span>
        <span>Matched (both versions)</span>
      </label>
      <label className={styles.controlLabel}>
        <input
          type="checkbox"
          checked={showV1Only}
          onChange={(e) => onToggleV1Only(e.target.checked)}
          className={styles.controlCheckbox}
        />
        <span className={styles.controlIcon}>🔴</span>
        <span>V1 only</span>
      </label>
      <label className={styles.controlLabel}>
        <input
          type="checkbox"
          checked={showV2Only}
          onChange={(e) => onToggleV2Only(e.target.checked)}
          className={styles.controlCheckbox}
        />
        <span className={styles.controlIcon}>🔵</span>
        <span>V2 only</span>
      </label>
    </div>
  );
};
