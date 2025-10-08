import { useState } from 'react';
import logo from './logo.png';
import { Heading3, Heading5 } from '@entur/typography';
import styles from './App.module.scss';
import { GridContainer, GridItem } from '@entur/grid';
import { TextField } from '@entur/form';
import { AutoCompleteResults } from "./results/autoCompleteResults";
import { ReverseResults } from "./results/reverseResults";

type SearchMode = 'autocomplete' | 'reverse';

function App() {

  const [searchMode, setSearchMode] = useState<SearchMode>('autocomplete');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');

  return (
    <GridContainer spacing='none'>
      <GridItem small={12} className={styles.appHeader}>
        <img src={logo} className={styles.appLogo} alt="Entur logo" />
        <Heading5 margin='none'>Geocoder-v2 Test</Heading5>
      </GridItem>
      <GridItem small={12} className={styles.searchContainer}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setSearchMode('autocomplete')}
            style={{
              padding: '0.5rem 1rem',
              background: searchMode === 'autocomplete' ? '#181C56' : '#fff',
              color: searchMode === 'autocomplete' ? '#fff' : '#181C56',
              border: '2px solid #181C56',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Autocomplete
          </button>
          <button
            onClick={() => setSearchMode('reverse')}
            style={{
              padding: '0.5rem 1rem',
              background: searchMode === 'reverse' ? '#181C56' : '#fff',
              color: searchMode === 'reverse' ? '#fff' : '#181C56',
              border: '2px solid #181C56',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reverse
          </button>
        </div>

        {searchMode === 'autocomplete' ? (
          <>
            <Heading3 margin='none' className={styles.searchHeading}>Hvor vil du reise?</Heading3>
            <TextField size="medium" label="Søk" className={styles.search}
                       onChange={(evt) => setSearchTerm(evt.target.value)} />
          </>
        ) : (
          <>
            <Heading3 margin='none' className={styles.searchHeading}>Reverse Geocoding</Heading3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <TextField
                size="medium"
                label="Latitude"
                style={{ maxWidth: '200px' }}
                placeholder="e.g. 59.9139"
                onChange={(evt) => setLat(evt.target.value)}
              />
              <TextField
                size="medium"
                label="Longitude"
                style={{ maxWidth: '200px' }}
                placeholder="e.g. 10.7522"
                onChange={(evt) => setLon(evt.target.value)}
              />
            </div>
          </>
        )}
      </GridItem>
      <GridItem small={12}>
        {searchMode === 'autocomplete' ? (
          <AutoCompleteResults searchTerm={searchTerm} />
        ) : (
          <ReverseResults lat={lat} lon={lon} />
        )}
      </GridItem>
    </GridContainer>
  );
}

export default App;
