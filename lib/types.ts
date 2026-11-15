export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

export type CountryProps = {
  name: string;
  official: string;
  iso: string;
  continent: Continent;
  lat: number;
  lng: number;
};

export type CountryFeature = {
  type: "Feature";
  id: string;
  properties: CountryProps;
  geometry: unknown;
};

export type GeoCollection = {
  type: "FeatureCollection";
  features: CountryFeature[];
};

export type Place = {
  name: string;
  iso: string;
  kind: "country" | "city";
  lat: number;
  lng: number;
  continent: Continent;
  country?: string;
};

export type Selection = {
  /** what we ask the news desk for */
  query: string;
  /** headline shown in the panel */
  label: string;
  continent: Continent;
  lat: number;
  lng: number;
  iso?: string;
};

export type DecodeFormat =
  | "Explainer"
  | "Deep dive"
  | "Timeline"
  | "By the numbers"
  | "Glossary";

export type DecodeCard = {
  slug: string;
  title: string;
  dek: string;
  section: string;
  format: DecodeFormat;
  minutes: number;
};
