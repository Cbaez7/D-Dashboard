export type Vehicle = "Sedan" | "SUV" | "Luxury" | "Sprinter Van";
export type ClientType = "Affiliate" | "Walk-in" | "Corporate";
export type ServiceType = "Airport" | "P2P" | "Hourly";
export type AirportService =
  | "SFO Curbside"
  | "SFO Meet & Greet"
  | "SJC Curbside"
  | "SJC Meet & Greet"
  | "OAK Curbside"
  | "OAK Meet & Greet";
export type BookingZone = "Within City" | "Outside City";
export type TollKey = "golden" | "bay" | "sanmateo" | "dumbarton" | "richmond";

export const VEHICLES: Vehicle[] = ["Sedan", "SUV", "Luxury", "Sprinter Van"];

export const HOURLY_RATES: Record<Vehicle, number> = {
  Sedan: 95,
  SUV: 116,
  Luxury: 135,
  "Sprinter Van": 165,
};

export const P2P_RULES: Record<
  Vehicle,
  Record<BookingZone, number> & { cancel: string }
> = {
  Sedan: { "Within City": 2, "Outside City": 3, cancel: "2 hours" },
  SUV: { "Within City": 2, "Outside City": 3, cancel: "2 hours" },
  Luxury: { "Within City": 2, "Outside City": 3, cancel: "2 hours" },
  "Sprinter Van": { "Within City": 3, "Outside City": 3, cancel: "24 hours" },
};

const PTP_CITY_ROWS: Record<number, string> = {
  2: "San Jose,Sausalito,Berkeley,Emeryville,Fremont,Hayward,Milpitas,Santa Clara,Atherton,Belmont,Belvedere,Burlingame,Campbell,Corte Madera,Cupertino,El Cerrito,El Sobrante,Fairfax,Hercules,Kensington,Kentfield,Larkspur,Los Altos,Los Altos Hills,Marin City,Mill Valley,Millbrae,Moraga,Mountain View,Palo Alto,Pinole,Rodeo,Ross,San Anselmo,San Bruno,San Carlos,San Francisco,San Mateo,San Quentin,South San Francisco,Sunnyvale,Tiburon,Woodside",
  2.5: "Orinda,Danville,San Ramon,Lafayette,Richmond,Alamo,Bay Point,Benicia,Blackhawk,Diablo,Martinez",
  3: "Petaluma,Walnut Creek,Pleasant Hill,Pleasanton,Dublin,Concord,Vallejo,Gilroy,San Rafael,Clayton,Loma Mar,Morgan Hill,Novato,Pescadero,Pittsburg,San Gregorio,San Martin",
  3.5: "Napa,Fairfield,Sonoma,Livermore,Suisun City,Tracy,Vacaville",
  4: "Santa Rosa,St. Helena,Santa Cruz,Yountville,Stockton,Cotati,Dixon,Hollister,Isleton,Lathrop,Manteca,Oakville,Rio Vista,Ripon,Rohnert Park,Rutherford,Sebastopol,Windsor,Winters",
  5: "Carmel-by-the-Sea,Healdsburg,Calistoga,Monterey,Modesto",
  6: "Sacramento,Atwater,Carmel Valley,Carmichael,Ceres,Citrus Heights,Clearlake,Cloverdale,Davis,Del Monte,Delhi,Dos Palos,Elk Grove,Escalon,Fair Oaks,Folsom,Galt,Gonzales,Greenfield,Gustine,Hilmar,Hughson,Kelseyville,Lakeport,Lincoln,Livingston,Lodi,Los Banos,Marina,Merced,Middletown,Newman,Oakdale,Orangevale,Pacific Grove,Patterson,Pope Valley,Rancho Cordova,Rocklin,Roseville,Salinas,Seaside,Soledad,Stevinson,Turlock,Ukiah,Waterford,West Sacramento,Winton,Woodland,Yolo",
  7: "Big Sur",
  8: "Fresno,Chowchilla,Firebaugh,Le Grand",
  10: "Reno",
};

export const PTP_CITY_MINIMUMS: Record<string, number> = Object.fromEntries(
  Object.entries(PTP_CITY_ROWS).flatMap(([hours, cities]) =>
    cities.split(",").map((city) => [city, Number(hours)] as const),
  ),
);

export const PTP_CITIES = Object.keys(PTP_CITY_MINIMUMS).sort();

export function ptpMinimum(pickup: string, dropoff: string): number | null {
  const p = PTP_CITY_MINIMUMS[pickup];
  const d = PTP_CITY_MINIMUMS[dropoff];
  return p != null && d != null ? Math.max(p, d) : null;
}

export type AffiliateRates = Partial<Record<Vehicle, number>>;
export type AffiliateTable = Record<string, Record<string, AffiliateRates>>;

const SFO_ROWS: Record<string, string[]> = {
  "SFO Curbside": [
    "130.5|150.5|190.5|SF,South SF,San Bruno,Burlingame,Millbrae,San Mateo,Belmont,San Carlos,Redwood City",
    "150.5|171.5|190.5|Woodside,Atherton,Menlo Park,Palo Alto",
    "185.5|205.5|237.5|Mountain View,Sausalito,Belvedere,Marin City,Mill Valley,Tiburon",
    "190.5|213.5|237.5|Half Moon Bay",
    "195.5|216.5|237.5|Los Altos,Los Altos Hills,Sunnyvale,Cupertino,Santa Clara,Campbell,San Jose,Fremont,Berkeley,Oakland,El Cerrito,Emeryville,Kensington,Milpitas,Orinda,Richmond",
    "195.5|226.5|237.5|San Rafael,Corte Madera,Fairfax,Kentfield,Larkspur,Novato,Ross,San Anselmo,San Quentin",
    "290.5|352.5|373.5|Vallejo,Benicia,Hercules,Rodeo",
    "336.5|400.5|452.5|Napa,Santa Rosa,Cotati,Rohnert Park,Sebastopol",
    "352.5|415.5|462.5|Fairfield,Suisun City",
    "400.5|436.5|468.5|Yountville,Oakville,Rutherford",
    "505.5|541.5|573.5|Monterey,Carmel-by-the-Sea,Del Monte,Marina,Pacific Grove,Seaside",
    "715.5|777.5|925.5|Big Sur",
    "290.5|353.5|410.5|Morgan Hill",
  ],
  "SFO Meet & Greet": [
    "145|165|205|SF,South SF,San Bruno,Burlingame,Millbrae,San Mateo,Belmont,San Carlos,Redwood City",
    "165|186|205|Woodside,Atherton,Menlo Park,Palo Alto",
    "200|220|252|Mountain View,Sausalito,Belvedere,Marin City,Mill Valley,Tiburon",
    "205|228|252|Half Moon Bay",
    "210|231|252|Los Altos,Los Altos Hills,Sunnyvale,Cupertino,Santa Clara,Campbell,San Jose,Fremont,Berkeley,Oakland,El Cerrito,Emeryville,Kensington,Milpitas,Orinda,Richmond",
    "210|241|252|San Rafael,Corte Madera,Fairfax,Kentfield,Larkspur,Novato,Ross,San Anselmo,San Quentin",
    "305|367|388|Vallejo,Benicia,Hercules,Rodeo",
    "355|415|467|Napa,Santa Rosa,Cotati,Rohnert Park,Sebastopol",
    "367|430|477|Fairfield,Suisun City",
    "415|451|483|Yountville,Oakville,Rutherford",
    "520|556|588|Monterey,Carmel-by-the-Sea,Del Monte,Marina,Pacific Grove,Seaside",
    "730|792|940|Big Sur",
    "305|368|425|Morgan Hill",
  ],
};

const SJC_ROWS: Record<string, string[]> = {
  "SJC Curbside": [
    "123.5|144.5|165.5|San Jose,Santa Clara,Sunnyvale,Milpitas",
    "140.5|156.5|187.5|Los Altos,Los Altos Hills,Cupertino,Mountain View,Campbell,Fremont",
    "173.5|182.5|220.5|Woodside,Atherton,Menlo Park,Palo Alto",
    "183.5|193.5|220.5|Morgan Hill,Gilroy,San Martin",
    "193.5|208.5|240.5|San Mateo,Belmont,San Carlos,Redwood City",
    "203.5|233.5|256.5|Half Moon Bay",
    "220.5|250.5|278.5|SF,South SF,San Bruno,Burlingame,Millbrae,Sausalito",
    "258.5|278.5|298.5|San Rafael,Corte Madera,Fairfax,Kentfield,Larkspur,Marin City,Mill Valley,Novato,Ross,San Anselmo,San Quentin",
    "313.5|340.5|368.5|Vallejo,Benicia,Hercules,Rodeo",
    "378.5|438.5|468.5|Monterey,Carmel-by-the-Sea,Del Monte,Marina,Pacific Grove,Seaside",
    "383.5|408.5|458.5|Napa,Fairfield,Suisun City",
    "408.5|448.5|488.5|Yountville,Santa Rosa,Cotati,Oakville,Rohnert Park,Rutherford,Sebastopol",
    "588.5|643.5|713.5|Big Sur",
  ],
  "SJC Meet & Greet": [
    "153|168|190|Mountain View",
    "160|176|205|Los Altos,Los Altos Hills,Sunnyvale,Cupertino,Santa Clara,Campbell,San Jose,Fremont,Milpitas",
    "193|202|237|Woodside,Atherton,Menlo Park,Palo Alto",
    "203|213|237|Morgan Hill,Gilroy,San Martin",
    "213|228|257|San Mateo,Belmont,San Carlos,Redwood City",
    "223|253|273|Half Moon Bay",
    "240|270|295|SF,South SF,San Bruno,Burlingame,Millbrae,Sausalito",
    "278|298|315|San Rafael,Corte Madera,Fairfax,Kentfield,Larkspur,Marin City,Mill Valley,Novato,Ross,San Anselmo,San Quentin",
    "333|360|385|Vallejo,Benicia,Hercules,Rodeo",
    "398|458|485|Monterey,Carmel-by-the-Sea,Del Monte,Marina,Pacific Grove,Seaside",
    "403|428|475|Napa,Fairfield,Suisun City",
    "428|468|505|Yountville,Santa Rosa,Cotati,Oakville,Rohnert Park,Rutherford,Sebastopol",
    "608|663|730|Big Sur",
  ],
};

const OAK_ROWS: Record<string, string[]> = {
  "OAK Curbside": [
    "190|232|270|495|Atherton,Belmont,Berkeley,Burlingame,Campbell,Cupertino,Fremont,Half Moon Bay,Los Altos,Los Altos Hills,Menlo Park,Millbrae,Mountain View,Oakland,Palo Alto,Redwood City,San Bruno,San Carlos,San Francisco,San Jose,San Mateo,Santa Clara,South San Francisco,Sunnyvale,Woodside",
    "237.5|290|337.5|495|San Rafael,Sausalito,Vallejo",
    "285|348|405|577.5|Fairfield,Gilroy,Morgan Hill",
    "332.5|406|472.5|660|Napa,Sonoma",
    "380|464|540|742.5|Yountville,Santa Rosa",
    "570|696|810|1072.5|Monterey,Sacramento",
    "760|928|1080|1402.5|Fresno",
    "855|1044|1215|1650|Big Sur",
  ],
  "OAK Meet & Greet": [
    "210|252|290|495|Atherton,Belmont,Berkeley,Burlingame,Campbell,Cupertino,Fremont,Half Moon Bay,Los Altos,Los Altos Hills,Menlo Park,Millbrae,Mountain View,Oakland,Palo Alto,Redwood City,San Bruno,San Carlos,San Francisco,San Jose,San Mateo,Santa Clara,South San Francisco,Sunnyvale,Woodside",
    "257.5|310|357.5|495|San Rafael,Sausalito,Vallejo",
    "305|368|425|577.5|Fairfield,Gilroy,Morgan Hill",
    "352.5|426|492.5|660|Napa,Sonoma",
    "400|484|560|742.5|Yountville,Santa Rosa",
    "590|716|830|1072.5|Monterey,Sacramento",
    "780|948|1100|1402.5|Fresno",
    "875|1064|1235|1650|Big Sur",
  ],
};

const SPRINTER_BANDS: Record<"SFO" | "SJC", number[]> = {
  SFO: [
    500.5, 500.5, 500.5, 500.5, 500.5, 583, 583, 665.5, 665.5, 748, 995.5,
    1325.5, 500.5,
  ],
  SJC: [
    498.5, 498.5, 498.5, 498.5, 498.5, 498.5, 498.5, 746, 746, 828.5, 828.5,
    911, 1158.5,
  ],
};

function expandRows(
  rows: Record<string, string[]>,
  vehicles: Vehicle[],
): AffiliateTable {
  const table: AffiliateTable = {};
  for (const [service, list] of Object.entries(rows)) {
    table[service] = {};
    list.forEach((row) => {
      const parts = row.split("|");
      const cities = parts[parts.length - 1].split(",");
      cities.forEach((city) => {
        table[service][city] = Object.fromEntries(
          vehicles.map((v, i) => [v, Number(parts[i])]),
        );
      });
    });
  }
  return table;
}

function applySprinterBands(
  table: AffiliateTable,
  rows: Record<string, string[]>,
  bands: number[],
) {
  for (const [service, list] of Object.entries(rows)) {
    list.forEach((row, index) => {
      const cities = row.split("|").at(-1)!.split(",");
      cities.forEach((city) => {
        if (table[service]?.[city])
          table[service][city]["Sprinter Van"] = bands[index];
      });
    });
  }
}

export const AFFILIATE: AffiliateTable = {
  ...expandRows(SFO_ROWS, ["Sedan", "SUV", "Luxury"]),
  ...expandRows(SJC_ROWS, ["Sedan", "SUV", "Luxury"]),
};
applySprinterBands(AFFILIATE, SFO_ROWS, SPRINTER_BANDS.SFO);
applySprinterBands(AFFILIATE, SJC_ROWS, SPRINTER_BANDS.SJC);
Object.assign(AFFILIATE, expandRows(OAK_ROWS, ["Sedan", "SUV", "Luxury", "Sprinter Van"]));

export const AIRPORT_SERVICES = Object.keys(AFFILIATE) as AirportService[];

export const airportCities = (service: string): string[] =>
  Object.keys(AFFILIATE[service] ?? {}).sort();

export const AIRPORT_SERVICE_FEES: Record<AirportService, number> = {
  "SFO Curbside": 5.5,
  "SFO Meet & Greet": 20,
  "SJC Curbside": 3.5,
  "SJC Meet & Greet": 20,
  "OAK Curbside": 0,
  "OAK Meet & Greet": 20,
};

export function walkInAirportRate(
  affiliateRate: number,
  service: AirportService,
  vehicle: Vehicle,
): number {
  let airportFee = AIRPORT_SERVICE_FEES[service] ?? 0;
  if (vehicle === "Sprinter Van" && / Meet & Greet$/.test(service)) {
    const airport = service.split(" ")[0];
    airportFee = airport === "SFO" ? 5.5 : airport === "SJC" ? 3.5 : 0;
  }
  return Math.round(((affiliateRate - airportFee) * 1.3 + airportFee) * 100) / 100;
}

export const AIRPORT_TOLLS: Record<string, Partial<Record<TollKey, string>>> = {
  SFO: {
    bay: "Alamo,American Canyon,Antioch,Auburn,Bay Point,Benicia,Berkeley,Canyon,Carmichael,Citrus Heights,Clayton,Clearlake,Davis,Dixon,El Cerrito,El Sobrante,Elk Grove,Fairfield,Fair Oaks,Folsom,Hercules,Isleton,Kensington,Lincoln,Martinez,Modesto,Moraga,Napa,Newman,Oakland,Oakley,Oakville,Orangevale,Orinda,Pinole,Pittsburg,Pope Valley,Rancho Cordova,Rio Vista,Rodeo,Rocklin,Roseville,Rutherford,Sacramento,San Quentin,St. Helena,Suisun City,Vacaville,Vallejo,West Sacramento,Winters,Yolo,Yountville",
    golden:
      "Belvedere,Bodega Bay,Cloverdale,Corte Madera,Cotati,Fairfax,Healdsburg,Kelseyville,Kentfield,Lakeport,Larkspur,Marin City,Middletown,Mill Valley,Novato,Rohnert Park,Ross,San Anselmo,San Rafael,Santa Rosa,Sausalito,Sebastopol,Tiburon,Ukiah,Willits,Windsor",
    sanmateo:
      "Angels Camp,Blackhawk,Brentwood,Ceres,Chowchilla,Copperopolis,Delhi,Diablo,Dos Palos,Dublin,Escalon,Firebaugh,Fremont,Fresno,Galt,Gustine,Hilmar,Hughson,Jackson,Jamestown,Lathrop,Le Grand,Livermore,Livingston,Lodi,Manteca,Merced,Oakdale,Patterson,Pleasanton,Ripon,San Ramon,Stevinson,Stockton,Tracy,Turlock,Waterford,Winton,Woodland",
  },
  SJC: {
    golden: "Belvedere,Corte Madera,Marin City,Mill Valley,Sausalito,Tiburon",
    richmond:
      "Bodega Bay,Cloverdale,Cotati,Fairfax,Healdsburg,Kentfield,Larkspur,Novato,Rohnert Park,Ross,San Anselmo,San Quentin,San Rafael,Santa Rosa,Sebastopol,Ukiah,Willits,Windsor",
  },
  OAK: {
    bay: "San Francisco,South San Francisco",
    sanmateo:
      "Belmont,Burlingame,Half Moon Bay,La Honda,Loma Mar,Millbrae,Pescadero,San Bruno,San Carlos,San Gregorio,San Mateo,Woodside",
    dumbarton:
      "Atherton,Los Altos,Los Altos Hills,Menlo Park,Mountain View,Palo Alto,Redwood City,Sunnyvale",
    richmond:
      "Belvedere,Bodega Bay,Cloverdale,Corte Madera,Cotati,Fairfax,Healdsburg,Kentfield,Larkspur,Marin City,Mill Valley,Novato,Rohnert Park,Ross,San Anselmo,San Quentin,San Rafael,Santa Rosa,Sausalito,Sebastopol,Sonoma,Tiburon,Ukiah,Willits,Windsor",
  },
};

export function airportTollFor(
  service: string,
  city: string,
): TollKey | null {
  const airport = service.split(" ")[0];
  const tolls = AIRPORT_TOLLS[airport] ?? {};
  const hit = Object.entries(tolls).find(([, cities]) =>
    cities!.split(",").includes(city),
  );
  return (hit?.[0] as TollKey) ?? null;
}

export const FEES = {
  greeter: 125,
  after: 30,
  carseat: 35,
  golden: 8.75,
  bay: 7,
  sanmateo: 7,
  dumbarton: 7,
  richmond: 7,
} as const;

export const TOLL_LABELS: Record<TollKey, string> = {
  golden: "Golden Gate Bridge",
  bay: "Oakland Bay Bridge",
  sanmateo: "San Mateo Bridge",
  dumbarton: "Dumbarton Bridge",
  richmond: "Richmond Bridge",
};

export const ROUTE_GARAGE = "1660 S Amphlett Blvd, San Mateo, CA 94402";

export const CORPORATE: Record<string, string> = {
  Asana:
    "SONALEE — NON-PRIVATE\nRate: $130/hr\nMinimum: 2 hours\nGratuity: 20%\nSTC: 5%\nAdmin Fee: 5%\nAll Sonalee airport pickups are Curbside.\n\nPrivate Sonalee trips: check Sonalee Parekh — Private.",
  "Coley Andrews":
    "SUV: $130/hr\nSedan: $125/hr\nMinimum: 2 hours\nGratuity: 20%\nSTC: 5%\nAirport Fee: Curbside $5.50 / Meet & Greet $20",
  "Daniel Herling":
    "Petaluma → SFO (Curbside): $255.50\nPetaluma → SFO (Meet & Greet): $270\nPetaluma → San Francisco: $250\nDo not add tolls.",
  "Danielle Udolf":
    "Home → SFO: $160 + 20% gratuity\nSFO → Home: $160 + 20% gratuity\nJose's rate: $140\nHome: 1214 Sharon Park Dr, Menlo Park, CA 94025",
  "Deb Richardson":
    "SFO → Sausalito: $165 flat + 20% gratuity + $5.50 airport fee\nSausalito → SFO: $165 flat + 20% gratuity + $8 toll + $5.50 airport fee",
  "Eric Reynolds / Stacey Grier":
    "SFO → Oakland: 2 hours × $85 + 20% gratuity + $5.50 airport fee\nSFO → Orinda: 2 hours × $85 + 20% gratuity + $5.50 airport fee\nOakland → SFO: 2 hours × $85 + 20% gratuity + $5.50 airport fee\nOrinda → SFO: 2 hours × $85 + 20% gratuity + $5.50 airport fee\nOakland → Oakland: 2 hours × $85 + 20% gratuity\nCurbside pickup for Eric Reynolds.\nCurbside for Stacey G.",
  "Esalen Institute":
    "SFO/SF → Esalen Institute\nSedan: $820\nSUV: $885\n\nSJC → Esalen Institute\nSedan: $675\nSUV: $735\n\nMRY → Esalen Institute\nSedan: $580\nSUV: $630\n\nJovana Clarke / Nora Teter Special:\nSFO: Sedan $695 / SUV $750\nSJC & MRY: Sedan $595 / SUV $650\n\nContact Max Gaenslen for SJC routes.",
  "ETB Tours":
    "Hourly:\nSedan: $85/hr\nSUV: $105/hr\nSprinter: $145/hr\n\nSFO → SF:\nSedan $125 / SUV $145 / Sprinter $425\n\nSF → SF:\nSedan $99 / SUV $125 / Sprinter $425\n\nSF → SFO:\nSedan $99 / SUV $125 / Sprinter $425\n\nAdd 6% gas surcharge.\nNO airport fees.\nAny other trips: use Affiliate rate + 10% gratuity.\nInternational flights: 45 minutes after flight lands.",
  Fortis:
    "Remove gratuity from their bill.\nTo Airport: add $5.50 airport fee.\nFrom Airport: add $20 airport fee.\n\nHourly Rates:\nSedan / SUV / Luxury: $125/hr\nSprinter: $180/hr\n\nMinimums:\nIf not listed: 2-hour minimum.\nSprinter: 4-hour minimum.\nONLY MOE YOUSRI: $135/hr, minimum 3 hours.\n\nSFO ROUTES — BILLABLE HOURS:\nSan Francisco: 2\nPalo Alto: 2\nSan Jose: 2.5\nMenlo Park: 2\nWoodside: 2\nSan Mateo: 2\nCupertino: 2.25\nLos Gatos: 3\nSausalito: 3\nTiburon: 3\nOakland: 3\nNapa: 5\n\nSJC ROUTES — BILLABLE HOURS:\nSan Francisco: 3\nSan Jose: 2\nSunnyvale: 2\nMenlo Park: 2\nWoodside: 2\nSan Mateo: 2.25\nCupertino: 2\nLos Gatos: 2\nMountain View: 2\nMonterey: 4\nSanta Cruz: 3\nNapa: 6\n\nApply a 10% discount on trips of 5+ hours for the same principal/team on multiple consecutive days. Does not apply for events.",
  "Jonathan Howe":
    "SF → SF\nFlat Rate: $100\nGratuity: 20%\nGas Surcharge: $6\nTotal: $126",
  "Kevin Jacobson":
    "Oakland ↔ House (Danville): $180 flat + 20% gratuity\nSFO → House: $200 flat + 20% gratuity + $5.50 airport fee\nHouse → SFO: $200 flat + 20% gratuity + $5.50 airport fee + $7 toll",
  "Kevin Moss": "SFO → San Carlos: $110\nSan Carlos → SFO: $110",
  "King Tut":
    "Sedan: $90/hr\nSUV: $100/hr\nLuxury Sedan: $125/hr\nLuxury SUV: $125/hr",
  "Lorna Bridge":
    "Hourly Rate: $155/hr\nGratuity: 20%\nSTC: 5%\nAdmin Fee: 5%",
  "Luc Bellet":
    "SFO → San Francisco: 2 × $90\nSan Francisco → SFO: 2 × $90\nGratuity: 20%\nSTC: 10%\nAirport Fee: $5.50\nCurbside",
  Luke: "SFO → Woodside: $169\nWoodside → SFO: $169",
  "Michael Kives":
    "Sedan: $120/hr\nSUV: $130/hr\nMinimum: 2 hours\nGratuity: 20%\nSTC: 5%\nAdmin Fee: 5%",
  "Nayaki Nayyar":
    "From Airport: $168.50 flat\nGratuity: 20%\nSTC: 5%\nNayaki's House: 2510 Bentley Ridge Dr, San Jose, CA 95138\n\nTo Airport rate is not supplied in the spreadsheet.",
  "Pamela Poppert":
    "Palo Alto ↔ Portola Valley:\nHourly: $155/hr (2-hour minimum)\nFlat: $150\n\nPalo Alto → SFO: $177 + Curbside $5.50\nSFO → Palo Alto: $180 + Meet & Greet $20\n\nGratuity: 20%\nSTC: 5%\nAdmin Fee: 5%\nContact: (805) 455-3496",
  Paragonix:
    "Flat Base Rate: $300\nAdd: $0.70 per trip mile\nCalculate distance GTG (Garage-to-Garage), then add it.",
  "Rich Puccio":
    "ONLY SPECIAL PRICE:\nSan Jose → Santa Clara\nSedan: $115",
  "Ring Central":
    "Gratuity: 20%\nSTC: 5%\nFrom Airport: $20 airport fee\nTo Airport: $5 parking fee\nHourly: $135\n\nSPECIAL RATES:\nSonalee & Tarek House → SFO: $289.50 + 20% gratuity + 5% STC + $5.50\nRC → SFO: $180 + 20% gratuity + 5% STC + $5.50\nSF → Los Gatos: $295.50 + 20% gratuity + 5% STC\nSF → SFO: $195.50 + 20% gratuity + 5% STC + $5.50\nRC → SF: $215 + 20% gratuity + 5% STC + $5.50\nSFO → Vlad's: $198.60 + 20% gratuity + 5% STC + $5.50\nSFO → John: $225 + 20% gratuity + 5% STC + $5.50\nVlad's → SF: $189.50 + 20% gratuity + 5% STC + $5.50\nVlad Home → OAK: $258.73 + 20% gratuity + 5% STC",
  "Securiti.Ai — Rehan Jalil":
    "All vehicles: $125/hr\nMinimum: 2 hours\nGratuity: 20%\nSTC: 5%\nAirport Fee: Per pickup option\n\nSend confirmations to n.dominguez@veeam.com",
  Securonix:
    "Gratuity: 20%\nSTC: 6%\nFrom Airport: $20 airport fee\nTo Airport: $5 parking fee\n\nFLAT RATES:\nSan Francisco: $168.50\nDallas: $165.50\nNew York: $175.50\nLas Vegas: $160.50\nKansas: $140\nSan Jose → SJC: $265.50\nSan Jose → SFO: $275\n\nSan Jose → SF: Hourly rate\n\nHourly:\nSedan: $105/hr\nSUV: $125/hr\nPlus 20% gratuity + 6% STC",
  "Sonalee Parekh — Private":
    "PRIVATE TRIPS:\n2 hours × $130/hr\n20% standard gratuity\n15% discount\n5% STC\n5% Admin Fee\n\nPrivate trips are from her house to airport and vice versa.\nHome: 135 Wilder Ave, Los Gatos, CA 95030\n\nContacts:\nSonalee.hall@gmail.com\nmichelle.chester@sentinelone.com\n\nDriver instruction:\nDrivers must contact Sonalee directly, not her assistant.\nPhone: 408-623-5776\n\nNon-private: check Asana.",
  "Terri Machado":
    "SFO ↔ San Jose Special:\nSedan: $275\nSUV: $300\n\nHourly:\nSedan: $120/hr\nSUV: $130/hr\n\nMinimum: 2 hours\nGratuity: 20%\nSTC: 5%\nAdmin Fee: 5%\nAirport Fee: Curbside $5.50 / Meet & Greet $20",
  "Todd Speece":
    "Home → SFO: $230\nSFO → Home: $230\nTodd's Home: 574 Summit Ave, Mill Valley, CA 94941\n\nFRAGRANCE-FREE VEHICLE REQUIRED:\nNo cologne or strong fragrance. Vehicle must be scent-free due to an autoimmune condition.",
  Transmedics: "Sedan: $90/hr\nSUV: $110/hr\nMinimum: 2 hours",
  "UPC Lerone Lang":
    "SFO → Kentfield: $210\nKentfield → SFO: $195.50\nDo not add toll fees.",
  "Veeam & NetJets":
    "Gratuity: 20%\nSTC: 5%\nFrom Airport / Meet & Greet: $20\nTo Airport / Curbside: $5.50\n\nHourly:\nSedan: $125/hr — 2-hour minimum\nSUV: $130/hr — 2-hour minimum\nVan: $155/hr — 3-hour minimum\n\nSan Francisco — Niraj + Dustin only:\nAll-in rate: 2 hours × $170. Curbside for Niraj.\n\nSeattle:\nAny transfer: 2-hour minimum.\n\nAtlanta / Alpharetta, GA:\nSedan: $185.50\nSUV: $212.50 — Veeam CEO / Anand only; 2 hours + 20% gratuity + 5% STC.\n\nANAND — KBFI ↔ Clyde Hill:\nSedan: $155 flat. Farm out to Seattle Black Limo (Sedan $99.12). Our rate: $193.75.\n\nKayla — Los Gatos → SJC: $177.",
};

export const CORPORATE_ACCOUNTS = Object.keys(CORPORATE).sort();
