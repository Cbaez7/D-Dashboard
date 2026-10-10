import {
  AFFILIATE,
  type AirportService,
  type BookingZone,
  type ClientType,
  FEES,
  HOURLY_RATES,
  P2P_RULES,
  PTP_CITY_MINIMUMS,
  type ServiceType,
  type TollKey,
  TOLL_LABELS,
  type Vehicle,
  airportTollFor,
  ptpMinimum,
  walkInAirportRate,
} from "./data";

export interface FeeState {
  greeter: boolean;
  after: boolean;
  carseat: number;
  golden: number;
  bay: number;
  sanmateo: number;
  dumbarton: number;
  richmond: number;
  travelMinutes: number;
  waitMinutes: number;
}

export interface CorporateInput {
  account: string;
  rate: number;
  hours: number;
  percent: number;
  customFee: number;
}

export interface QuoteInput {
  clientType: ClientType | "";
  serviceType: ServiceType | "";
  airportService: AirportService | "";
  vehicle: Vehicle | "";
  city: string;
  zone: BookingZone | "";
  pickupCity: string;
  dropoffCity: string;
  billableHours: number;
  corporate: CorporateInput;
  fees: FeeState;
}

export interface FeeLine {
  label: string;
  amount: number;
}

export interface BreakdownStep {
  title: string;
  lines: string[];
}

export interface QuoteResult {
  ready: boolean;
  base: number | null;
  baseNote: string;
  feeLines: FeeLine[];
  feesTotal: number;
  total: number;
  minimumApplied: { entered: number; used: number } | null;
  cancellation: string | null;
  autoToll: TollKey | null;
  greeterAuto: boolean;
  steps: BreakdownStep[];
}

export const money = (n: number) => "$" + Number(n).toFixed(2);

export function cancellationFor(vehicle: Vehicle, client: ClientType): string {
  if (vehicle === "Sprinter Van") return client === "Walk-in" ? "72 hours" : "24 hours";
  return client === "Walk-in" ? "24 hours" : P2P_RULES[vehicle]?.cancel ?? "–";
}

export function sprinterGreeterAuto(
  service: string,
  vehicle: string,
): boolean {
  return /^(SFO|SJC|OAK) Meet & Greet$/.test(service) && vehicle === "Sprinter Van";
}

export const emptyFees: FeeState = {
  greeter: false,
  after: false,
  carseat: 0,
  golden: 0,
  bay: 0,
  sanmateo: 0,
  dumbarton: 0,
  richmond: 0,
  travelMinutes: 0,
  waitMinutes: 0,
};

export function computeQuote(input: QuoteInput): QuoteResult {
  const isWalkIn = input.clientType === "Walk-in";
  const isAff = input.clientType === "Affiliate" || isWalkIn;
  const isCorp = input.clientType === "Corporate";
  const steps: BreakdownStep[] = [];

  let base: number | null = null;
  let baseNote = "";
  let hoursUsed = input.billableHours;
  let minimumApplied: QuoteResult["minimumApplied"] = null;
  let cancellation: string | null = null;

  if (isAff && input.serviceType === "Airport") {
    const { airportService: s, vehicle: v, city: c } = input;
    const preset =
      s && v && c ? AFFILIATE[s]?.[c]?.[v] : undefined;
    if (preset != null && s && v) {
      if (isWalkIn) {
        base = walkInAirportRate(preset, s, v);
        baseNote =
          "Affiliate transportation rate + 30% Walk-in markup; airport fee is not marked up.";
        const markup = preset * 0.3;
        steps.push(
          {
            title: "Find Preset Airport Rate",
            lines: [`${s} • ${c} • ${v}`, `Affiliate preset rate = ${money(preset)}`],
          },
          {
            title: "Apply Walk-in Markup",
            lines: [
              `${money(preset)} × 30% = ${money(markup)}`,
              `${money(preset)} + ${money(markup)} = ${money(base)}`,
            ],
          },
        );
      } else {
        base = preset;
        baseNote = "Preset Affiliate airport rate; airport charge is already included.";
        steps.push({
          title: "Find Preset Airport Rate",
          lines: [`${s} • ${c} • ${v}`, `Preset Affiliate rate = ${money(base)}`],
        });
      }
      steps.push({
        title: "Airport Fee",
        lines: [
          "The applicable airport charge is already included in the preset airport rate.",
          "Additional airport fee = $0.00",
        ],
      });
    }
  }

  if (isAff && (input.serviceType === "P2P" || input.serviceType === "Hourly")) {
    const t = input.serviceType;
    const v = input.vehicle;
    const h = input.billableHours;
    const cityMinimum = t === "P2P" ? ptpMinimum(input.pickupCity, input.dropoffCity) : null;
    const resolved = v && (t === "P2P" ? cityMinimum != null : input.zone);
    if (v && resolved) {
      const minHours = t === "P2P" ? cityMinimum! : P2P_RULES[v][input.zone as BookingZone];
      cancellation = cancellationFor(v, input.clientType as ClientType);
      hoursUsed = h > 0 && h < minHours ? minHours : h;
      if (h > 0 && h < minHours) minimumApplied = { entered: h, used: minHours };
      if (h > 0) {
        const hourly = HOURLY_RATES[v];
        const raw = hoursUsed * hourly;
        base = isWalkIn ? Math.round(raw * 1.3 * 100) / 100 : raw;
        baseNote =
          (t === "P2P" ? "Point-to-Point" : "Hourly / As-Directed") +
          `: ${hoursUsed} ${t === "Hourly" ? "booking" : "billable"} hr × ${money(hourly)}/hr` +
          (hoursUsed !== h ? " (minimum applied)" : "") +
          (isWalkIn ? " + 30% Walk-in markup." : ".");
        steps.push({
          title: `Apply ${t === "P2P" ? "Point-to-Point" : "Hourly"} Rules`,
          lines: [
            `${t === "Hourly" ? "Entered Booked Service Hours" : "Entered Calculated Drive Time"}: ${h}`,
            t === "P2P"
              ? `City pair: ${input.pickupCity} → ${input.dropoffCity}`
              : `Booking Zone: ${input.zone}`,
            `Minimum Booking: ${minHours} hours`,
            `Minimum Price: ${money(minHours * hourly)}`,
            `Cancellation Policy: ${cancellation}`,
            h < minHours
              ? `${h} hours is below the ${minHours}-hour minimum – Billable Hours Used = ${minHours}`
              : `Billable Hours Used = ${h}`,
          ],
        });
        steps.push({
          title: "Calculate Base Rate",
          lines: [
            `${t === "P2P" ? "Point-to-Point" : "Hourly / As-Directed"} • ${v} • ${hoursUsed} hours used`,
            `${hoursUsed} hours × ${money(hourly)}/hr = ${money(raw)}`,
          ],
        });
        if (isWalkIn) {
          const markup = raw * 0.3;
          steps.push({
            title: "Apply Walk-in Markup",
            lines: [
              `${money(raw)} × 30% = ${money(markup)}`,
              `${money(raw)} + ${money(markup)} = ${money(raw + markup)}`,
            ],
          });
        }
      }
    }
  }

  const { corporate } = input;
  const corpSubtotal = corporate.rate * corporate.hours;
  const corpPercentAmount = corpSubtotal * (corporate.percent / 100);
  const corporateBase = isCorp ? corpSubtotal + corpPercentAmount + corporate.customFee : 0;
  if (isCorp && corporate.account) {
    steps.push({
      title: "Calculate Corporate Base",
      lines: [
        `Corporate Account: ${corporate.account}`,
        `${money(corporate.rate)} × ${corporate.hours} hours = ${money(corpSubtotal)}`,
        ...(corporate.percent > 0
          ? [
              `${money(corpSubtotal)} × ${corporate.percent}% = ${money(corpPercentAmount)}`,
              `${money(corpSubtotal)} + ${money(corpPercentAmount)} = ${money(corpSubtotal + corpPercentAmount)}`,
            ]
          : []),
        ...(corporate.customFee > 0
          ? [
              `${money(corpSubtotal + corpPercentAmount)} + ${money(corporate.customFee)} = ${money(corporateBase)}`,
            ]
          : []),
      ],
    });
  }

  const f = input.fees;
  const autoToll =
    isAff && input.serviceType === "Airport" && input.airportService && input.city
      ? airportTollFor(input.airportService, input.city)
      : null;

  const greeterAuto = sprinterGreeterAuto(input.airportService, input.vehicle);
  const greeterAmount = f.greeter || greeterAuto ? FEES.greeter : 0;
  const tollQty = (key: TollKey) => (autoToll === key ? Math.max(f[key], 1) : f[key]);

  const feeLines: FeeLine[] = [];
  const push = (label: string, amount: number) => {
    if (amount > 0) feeLines.push({ label, amount });
  };
  push("Airport Greeter", greeterAmount);
  push("After Hours", f.after ? FEES.after : 0);
  push("Car Seats", f.carseat * FEES.carseat);
  const preTravelSum =
    (isAff ? base ?? 0 : 0) +
    corporateBase +
    greeterAmount +
    (f.after ? FEES.after : 0) +
    f.carseat * FEES.carseat +
    tollQty("golden") * FEES.golden +
    tollQty("bay") * FEES.bay +
    tollQty("sanmateo") * FEES.sanmateo +
    tollQty("dumbarton") * FEES.dumbarton +
    tollQty("richmond") * FEES.richmond;
  const travel = preTravelSum > 0 && f.travelMinutes > 0 ? (preTravelSum / 60) * f.travelMinutes : 0;
  const selectedVehicle = input.vehicle;
  const waitHourly =
    !isCorp && selectedVehicle
      ? (HOURLY_RATES[selectedVehicle] ?? 0) * (isWalkIn ? 1.3 : 1)
      : 0;
  const wait = waitHourly > 0 && f.waitMinutes > 0 ? (waitHourly / 60) * f.waitMinutes : 0;

  (Object.keys(TOLL_LABELS) as TollKey[]).forEach((key) =>
    push(TOLL_LABELS[key] + (autoToll === key ? " (auto)" : ""), tollQty(key) * FEES[key]),
  );
  push(`Travel Time (${f.travelMinutes} min)`, travel);
  push(`Wait Time (${f.waitMinutes} min)`, wait);

  const feesTotal = feeLines.reduce((sum, l) => sum + l.amount, 0);
  const total = (isAff ? base ?? 0 : 0) + corporateBase + feesTotal;

  const running0 = (isAff ? base ?? 0 : 0) + corporateBase;
  if (isCorp || (isAff && base != null)) {
    let running = running0;
    const lines: string[] = feeLines.flatMap((l) => {
      const out = [
        `${l.label} = ${money(l.amount)}`,
        `${money(running)} + ${money(l.amount)} = ${money(running + l.amount)}`,
      ];
      running += l.amount;
      return out;
    });
    if (!lines.length) lines.push(`${money(running)} + $0.00 = ${money(running)}`);
    steps.push({ title: "Add Fees & Extras", lines });
  }

  return {
    ready: isCorp ? Boolean(corporate.account) && corporateBase > 0 : base != null,
    base,
    baseNote,
    feeLines,
    feesTotal,
    total,
    minimumApplied,
    cancellation,
    autoToll,
    greeterAuto,
    steps,
  };
}

export const clientCode = (ct: string) =>
  ({ Affiliate: "A", "Walk-in": "WI", Corporate: "C" })[ct] ?? "";

export function quoteToText(input: QuoteInput, result: QuoteResult): string {
  const lines: string[] = [`CT:${clientCode(input.clientType)}`];
  const add = (label: string, value: string | number | undefined) => {
    if (value === undefined || value === null || String(value).trim() === "" || value === "$0.00") return;
    lines.push(`${label}: ${value}`);
  };
  if (input.clientType === "Corporate") {
    add("Corporate Client", input.corporate.account);
    add("Base Rate", input.corporate.rate && input.corporate.hours ? money(input.corporate.rate * input.corporate.hours) : "");
    if (input.corporate.percent && input.corporate.rate && input.corporate.hours)
      add("Corporate Percentage", money(input.corporate.rate * input.corporate.hours * (input.corporate.percent / 100)));
    if (input.corporate.customFee) add("Custom Fee", money(input.corporate.customFee));
  } else {
    add("Service Type", input.serviceType === "P2P" ? "Point-to-Point" : input.serviceType);
    add("Vehicle", input.vehicle);
    if (result.cancellation) add("Cancellation Policy", result.cancellation);
    if (input.serviceType === "Airport") {
      add("Airport", input.airportService.split(" ")[0]);
      add("Airport Service", input.airportService.replace(/^\w+ /, ""));
      add("Destination", input.city);
    } else if (input.serviceType === "P2P") {
      add("Pickup", input.pickupCity);
      add("Destination", input.dropoffCity);
      add("Billable Hours", `${Math.max(PTP_CITY_MINIMUMS[input.pickupCity] ?? 0, PTP_CITY_MINIMUMS[input.dropoffCity] ?? 0)} hours`);
    } else {
      add("Billable Hours", input.billableHours ? `${input.billableHours} hours` : "");
    }
    if (result.base != null) add("Base Rate", money(result.base));
  }
  result.feeLines.forEach((l) => add(l.label.replace(" (auto)", ""), money(l.amount)));
  add("Total", money(result.total));
  return lines.join("\n");
}
