import { useState } from 'react';
import logo from './logo.png';
import { Heading3, Heading5 } from '@entur/typography';
import styles from './App.module.scss';
import { GridContainer, GridItem } from '@entur/grid';
import { TextField } from '@entur/form';
import { AutoCompleteResults } from "./results/autoCompleteResults";
import { ReverseResults } from "./results/reverseResults";
import { ApiEnvironment } from "./apiHooks/useAutoComplete";

type SearchMode = 'autocomplete' | 'reverse';

const getDefaultEnvironment = (): ApiEnvironment => {
  const hostname = window.location.hostname;
  if (hostname === 'api.entur.io') {
    return ApiEnvironment.PROD;
  } else if (hostname === 'api.staging.entur.io') {
    return ApiEnvironment.STAGING;
  } else if (hostname === 'api.dev.entur.io') {
    return ApiEnvironment.DEV;
  }
  // Default to DEV for localhost and other domains
  return ApiEnvironment.DEV;
};

function App() {

  const [searchMode, setSearchMode] = useState<SearchMode>('autocomplete');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  const [environment, setEnvironment] = useState<ApiEnvironment>(getDefaultEnvironment());
  const isV2Overridden = !!import.meta.env.VITE_GEOCODER_V2_URL;

  return (
    <GridContainer spacing='none'>
      <GridItem small={12} className={styles.appHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} className={styles.appLogo} alt="Entur logo" />
          <Heading5 margin='none'>Geocoder-v2 Test</Heading5>
        </div>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 'bold' }}>
          Environment:
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as ApiEnvironment)}
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              border: '2px solid #181C56',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
          >
            <option value={ApiEnvironment.DEV}>Dev</option>
            <option value={ApiEnvironment.STAGING}>Staging</option>
            <option value={ApiEnvironment.PROD}>Prod</option>
          </select>
        </label>
      </GridItem>
      {isV2Overridden && (
        <GridItem small={12}>
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            margin: '0.5rem 1rem',
            color: '#856404',
            fontSize: '0.9rem'
          }}>
            ⚠️ <strong>Notice:</strong> Geocoder V2 is overridden with VITE_GEOCODER_V2_URL: {import.meta.env.VITE_GEOCODER_V2_URL}
          </div>
        </GridItem>
      )}
      <GridItem small={12} className={styles.searchContainer}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setSearchMode('autocomplete')}
            style={{
              padding: '0.5rem 1rem',
              background: searchMode === 'autocomplete' ? '#e8eaf6' : '#fff',
              color: '#181C56',
              border: searchMode === 'autocomplete' ? '2px solid #181C56' : '2px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: searchMode === 'autocomplete' ? 'bold' : 'normal',
              boxShadow: searchMode === 'autocomplete' ? 'inset 0 2px 4px rgba(24, 28, 86, 0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Autocomplete
          </button>
          <button
            onClick={() => setSearchMode('reverse')}
            style={{
              padding: '0.5rem 1rem',
              background: searchMode === 'reverse' ? '#e8eaf6' : '#fff',
              color: '#181C56',
              border: searchMode === 'reverse' ? '2px solid #181C56' : '2px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: searchMode === 'reverse' ? 'bold' : 'normal',
              boxShadow: searchMode === 'reverse' ? 'inset 0 2px 4px rgba(24, 28, 86, 0.15)' : 'none',
              transition: 'all 0.2s ease'
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
            <div style={{ display: 'flex', gap: '1rem' }}>
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
          <AutoCompleteResults searchTerm={searchTerm} environment={environment} />
        ) : (
          <ReverseResults lat={lat} lon={lon} environment={environment} />
        )}
      </GridItem>
    </GridContainer>
  );
}

export default App;
