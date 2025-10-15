import { HomeIcon, MapPinIcon } from "@entur/icons";
import styles from "./results.module.scss";
import { Category, getNSRIconForCategory } from "../nsrIcons/nsrIcons";

interface Props {
  categories: string[];
}

const homeIconCategoriesCategories = ["vegadresse", "street", "bydel"];
const mapPinIconCategories = ["poi", "GtfsStop", "GroupOfStopPlaces"];

export const ResultIcons = ({ categories }: Props) => {
  return (
    <div className={styles.iconsContainer}>
      {categories && (
        <div className={styles.icons}>
          {categories.some((r) => mapPinIconCategories.includes(r)) ? (
            <MapPinIcon className={styles.resultIcon} />
          ) : (
            categories
              .filter((element, index) => categories.indexOf(element) === index)
              .map((category, index) => (
                <div key={index}>
                  {homeIconCategoriesCategories.includes(category) ? (
                    <HomeIcon className={styles.resultIcon} />
                  ) : (
                    <img
                      alt=""
                      className={styles.resultIcon}
                      src={getNSRIconForCategory(category as Category)}
                    />
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
