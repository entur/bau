# Geocoder-v2 Test

A React application for testing and comparing the results from Entur's Geocoder-v1 and Geocoder-v2 APIs. The app provides both autocomplete search and reverse geocoding interfaces for finding places and transport locations in Norway.

## Features

- **Autocomplete**: Search for places by text input
- **Reverse Geocoding**: Find places by latitude/longitude coordinates
- Side-by-side comparison of v1 and v2 results
- Highlights differences between API versions

## Tech Stack

- React 18
- TypeScript
- Vite
- Sass
- Entur Design System components

## Development

```bash
npm install
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Using a Local Geocoder API

To point v2 to a local geocoder instance instead of the dev environment (v1 will still use dev.entur.io):

1. Create a `.env.local` file in the project root
2. Add: `VITE_GEOCODER_V2_URL=http://localhost:8080/v1`
3. Restart the dev server

The app will now query `http://localhost:8080/v1/autocomplete` for v2, while v1 continues to use `https://api.dev.entur.io/geocoder/v1/autocomplete`.

## Build

```bash
npm run build
```

Outputs to the `build` folder.
