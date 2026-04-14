import styles from "./MapControls.module.scss";

interface Props {
  showMatched: boolean;
  showLeftOnly: boolean;
  showRightOnly: boolean;
  onToggleMatched: (show: boolean) => void;
  onToggleLeftOnly: (show: boolean) => void;
  onToggleRightOnly: (show: boolean) => void;
}

export const MapControls = ({
  showMatched,
  showLeftOnly,
  showRightOnly,
  onToggleMatched,
  onToggleLeftOnly,
  onToggleRightOnly,
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
        <span>Matched (both)</span>
      </label>
      <label className={styles.controlLabel}>
        <input
          type="checkbox"
          checked={showLeftOnly}
          onChange={(e) => onToggleLeftOnly(e.target.checked)}
          className={styles.controlCheckbox}
        />
        <span className={styles.controlIcon}>🔴</span>
        <span>Left only</span>
      </label>
      <label className={styles.controlLabel}>
        <input
          type="checkbox"
          checked={showRightOnly}
          onChange={(e) => onToggleRightOnly(e.target.checked)}
          className={styles.controlCheckbox}
        />
        <span className={styles.controlIcon}>🔵</span>
        <span>Right only</span>
      </label>
    </div>
  );
};
