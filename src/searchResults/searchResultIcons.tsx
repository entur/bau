import { HomeIcon, MapPinIcon } from '@entur/icons'
import styles from "./searchResults.module.scss";
import { Category, getNSRIconForCategory } from "../nsrIcons/nsrIcons";

interface Props {
  categories: string[]
}

const homeIconCategoriesCategories = ['vegadresse', 'street', 'bydel'];
const mapPinIconCategories = ['poi', 'GtfsStop', 'GroupOfStopPlaces'];

export const SearchResultIcons = ({ categories }: Props) => {

  return (
    <div className={styles.iconsContainer}>
      {categories &&
       <div className={styles.icons}>
         {
           (categories.some(r => mapPinIconCategories.includes(r))) ?
             <MapPinIcon className={styles.searchResultIcon} />
             : categories
               .filter((element, index) => categories.indexOf(element) === index)
               .map(category => (
                 <>
                   {homeIconCategoriesCategories.includes(category) ?
                     <HomeIcon className={styles.searchResultIcon} />
                     :
                     <img alt="" className={styles.searchResultIcon} src={getNSRIconForCategory(category as Category)} />
                   }
                 </>
               ))
         }
       </div>
      }
    </div>
  );
}