import { BannerAlertBox } from "@entur/alert";
import styles from "./searchResults.module.scss";
import { ExpandableText } from "@entur/expand";
import {
  Heading3,
  SubParagraph,
  PreformattedText,
} from "@entur/typography"
import {
  GeocoderVersion,
  useAutoComplete
} from "../apiHooks/useAutoComplete";
import { SearchResultIcons } from "./searchResultIcons";

interface Props {
  searchTerm: string,
  geocoderVersion: GeocoderVersion
}

export const SearchResults = ({ searchTerm, geocoderVersion }: Props) => {

  const { searchResults, v1Error } = useAutoComplete(searchTerm, geocoderVersion);

  return (
    <div className={styles.searchResultsContainer}>
      <Heading3 className={styles.searchResultsHeading}>Geocoder - {geocoderVersion}</Heading3>
      {v1Error ? (
        <BannerAlertBox title="Failed to fetch results" variant="error">Try Again</BannerAlertBox>
      ) : (
        <div> {
          searchResults?.results.map(result => (
            <div className={styles.searchResultContainer}>
              <SearchResultIcons categories={result.categories} />
              <div className={styles.searchResult}>
                <ExpandableText title={result.name}>
                  <div className={styles.searchResultDetail}>
                    <SubParagraph margin='none'>Layer: {result.layer}</SubParagraph>
                    {result.categories &&
                     <SubParagraph margin='none'>Categories: {JSON.stringify(result.categories)}</SubParagraph>
                    }
                  </div>
                  <PreformattedText>{JSON.stringify(result.properties, null, 4)}</PreformattedText>
                </ExpandableText>
              </div>
            </div>
          ))
        }
        </div>
      )}
    </div>
  );
}