import { BannerAlertBox } from "@entur/alert";
import { Heading3, ListItem, UnorderedList } from "@entur/typography"
import { GeocoderVersion, useAutoComplete } from "./apiHooks/useAutoComplete";

interface Props {
  searchTerm: string,
  geocoderVersion: GeocoderVersion
}

export const SearchResults = ({ searchTerm, geocoderVersion }: Props) => {

  const { searchResults, v1Error } = useAutoComplete(searchTerm, geocoderVersion);

  return (
    <>
      <Heading3>{searchTerm}</Heading3>
      {v1Error ? (
        <BannerAlertBox title="Failed to fetch results" variant="error">Try Again</BannerAlertBox>
      ) : (
        <UnorderedList> {
          searchResults?.names.map(name => (
            <ListItem>{name}</ListItem>
          ))
        }
        </UnorderedList>
      )}
    </>
  );

}