import { useState } from "react";
import styles from "./CategoryFilter.module.scss";
import { Heading5 } from "@entur/typography";

interface Props {
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategories,
  onCategoriesChange,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleAll = () => {
    if (selectedCategories.length === categories.length) {
      onCategoriesChange([]); // Deselect all
    } else {
      onCategoriesChange(categories); // Select all
    }
  };

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={styles.filterPanel}>
      <div
        className={styles.filterHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Heading5 margin="none" className={styles.filterHeading}>
          Filter by Category {isExpanded ? "▼" : "▶"}
        </Heading5>
      </div>
      {isExpanded && (
        <div className={styles.filterContent}>
          <button onClick={handleToggleAll} className={styles.toggleAllButton}>
            {selectedCategories.length === categories.length
              ? "Deselect All"
              : "Select All"}
          </button>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <label key={category} className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleToggleCategory(category)}
                  className={styles.categoryCheckbox}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
