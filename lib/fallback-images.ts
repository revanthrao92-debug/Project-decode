import type { Region } from "./feeds";
import type { StoryImage } from "./rss";

/**
 * Bundled, openly licensed pictures in `public/fallback/`. They are the last
 * tier of the image lookup, so a card always has a picture even when the
 * internet search finds nothing or is unreachable. Credit and licence are
 * shown on the card like any other illustrative image.
 */
type Entry = Omit<StoryImage, "illustrative" | "url"> & { file: string };

const PD = "https://creativecommons.org/publicdomain/mark/1.0/";
const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";
const commons = (name: string) => `https://commons.wikimedia.org/wiki/File:${name}`;

const FILES: Record<string, Entry> = {
  "world-1": {
    file: "world-1.jpg",
    alt: "Earth from space, western hemisphere",
    credit: "NASA / Reto Stöckli",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("Blue_Marble_Western_Hemisphere.jpg"),
  },
  "world-2": {
    file: "world-2.jpg",
    alt: "The Blue Marble, Earth seen from Apollo 17",
    credit: "NASA / Apollo 17",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("The_Blue_Marble,_AS17-148-22727.jpg"),
  },
  "geopolitics-1": {
    file: "geopolitics-1.jpg",
    alt: "World map",
    credit: "Aloha CL",
    licence: "CC0",
    licenceUrl: CC0,
    pageUrl: commons("Blank-map-world-iceless-Greenland.png"),
  },
  "geopolitics-2": {
    file: "geopolitics-2.jpg",
    alt: "Aerial view of a container port",
    credit: "James R. Tourtellotte / U.S. CBP",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("Aerial_photograph_of_the_Port_of_Miami_Container_Port.jpg"),
  },
  "finance-1": {
    file: "finance-1.jpg",
    alt: "Traders on the New York Stock Exchange floor",
    credit: "Thomas J. O'Halloran / Library of Congress",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg"),
  },
  "tech-1": {
    file: "tech-1.jpg",
    alt: "Close-up of a circuit board",
    credit: "DiscoA340",
    licence: "CC0",
    licenceUrl: CC0,
    pageUrl: commons("Close-up_of_a_VHS_Player_Circuit_Board.jpg"),
  },
  "tech-2": {
    file: "tech-2.jpg",
    alt: "Close-up of a circuit board",
    credit: "DiscoA340",
    licence: "CC0",
    licenceUrl: CC0,
    pageUrl: commons("Close-up_of_a_VHS_Player_Circuit_Board_2.jpg"),
  },
  "science-1": {
    file: "science-1.jpg",
    alt: "Barred spiral galaxy NGC 1300",
    credit: "NASA, ESA and the Hubble Heritage Team",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("Hubble2005-01-barred-spiral-galaxy-NGC1300.jpg"),
  },
  "science-2": {
    file: "science-2.jpg",
    alt: "Messier 83 spiral galaxy",
    credit: "NASA, ESA and the Hubble Heritage Team",
    licence: "Public domain",
    licenceUrl: PD,
    pageUrl: commons("Messier83_-_Heic1403a.jpg"),
  },
  "india-1": {
    file: "india-1.jpg",
    alt: "Parliament Building, New Delhi",
    credit: "Ministry of Parliamentary Affairs, Government of India",
    licence: "GODL-India",
    licenceUrl: "https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf",
    pageUrl: commons("Glimpses_of_the_new_Parliament_Building,_in_New_Delhi_(2).jpg"),
  },
};

const BY_SECTION: Record<string, string[]> = {
  World: ["world-1", "world-2"],
  Geopolitics: ["geopolitics-1", "geopolitics-2"],
  Finance: ["finance-1", "geopolitics-2"],
  "Tech & AI": ["tech-1", "tech-2"],
  Science: ["science-1", "science-2"],
  Culture: ["world-2", "world-1"],
};

/** First unused picture for this section, preferring India's for Indian news. */
export function fallbackFor(
  section: string,
  region: Region,
  used: Set<string>,
): StoryImage {
  const keys = [
    ...(region === "india" && ["World", "Geopolitics"].includes(section)
      ? ["india-1"]
      : []),
    ...(BY_SECTION[section] ?? BY_SECTION.World),
    ...BY_SECTION.World,
  ];
  const key = keys.find((k) => !used.has(`/fallback/${FILES[k].file}`)) ?? keys[0];
  const { file, ...entry } = FILES[key];
  return { ...entry, url: `/fallback/${file}`, illustrative: true };
}
