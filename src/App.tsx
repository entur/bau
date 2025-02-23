import React, { useState } from 'react';
import logo from './logo.png';
import { Heading3, Heading5 } from '@entur/typography';
import styles from './App.module.scss';
import { GridContainer, GridItem } from '@entur/grid';
import { TextField } from '@entur/form';
import { AutoCompleteResults } from "./results/autoCompleteResults";

function App() {

  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <GridContainer spacing='none'>
      <GridItem small={12} className={styles.appHeader}>
        <img src={logo} className={styles.appLogo} alt="Entur logo" />
        <Heading5 margin='none'>Geocoder-v2 Test</Heading5>
      </GridItem>
      <GridItem small={12} className={styles.searchContainer}>
        <Heading3 margin='none' className={styles.searchHeading}>Hvor vil du reise?</Heading3>
        <TextField size="medium" label="Søk" className={styles.search}
                   onChange={(evt) => setSearchTerm(evt.target.value)} />
      </GridItem>
      <GridItem small={12}>
        <AutoCompleteResults searchTerm={searchTerm} />
      </GridItem>
    </GridContainer>
  );
}

export default App;
