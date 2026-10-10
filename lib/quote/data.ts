import accountsData from "./accounts.json";

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

export const CORPORATE: Record<string, string> = accountsData;
export const CORPORATE_ACCOUNTS = Object.keys(CORPORATE).sort();

