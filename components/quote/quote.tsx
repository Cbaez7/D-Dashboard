"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { cn } from "@/lib/utils";
import {
  AIRPORT_SERVICES,
  type AirportService,
  type BookingZone,
  type ClientType,
  CORPORATE,
  CORPORATE_ACCOUNTS,
  FEES,
  HOURLY_RATES,
  P2P_RULES,
  PTP_CITY_MINIMUMS,
  ROUTE_GARAGE,
  type ServiceType,
  type TollKey,
  TOLL_LABELS,
  VEHICLES,
  type Vehicle,
  airportCities,
  airportTollFor,
} from "@/lib/quote/data";
import {
  type FeeState,
  type QuoteInput,
  cancellationFor,
  computeQuote,
  emptyFees,
  money,
  quoteToText,
  sprinterGreeterAuto,
} from "@/lib/quote/engine";
import CheckIcon from "@/public/assets/images/_common/check-square.svg";
import CopyIcon from "@/public/assets/images/_common/copy.svg";
import ExternalIcon from "@/public/assets/images/_common/arrow-up-right.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import XIcon from "@/public/assets/images/_common/x.svg";

const CLIENT_TYPES: { value: ClientType; hint: string }[] = [
  { value: "Walk-in", hint: "30% markup on transportation" },
  { value: "Affiliate", hint: "Preset network rates" },
  { value: "Corporate", hint: "Account rate sheet" },
];

const SERVICE_TYPES: { value: ServiceType; label: string; hint: string }[] = [
  { value: "Airport", label: "Airport Transfer", hint: "Direct service to or from an airport" },
  { value: "P2P", label: "Point-to-Point", hint: "Two cities — auto billable minimum" },
  { value: "Hourly", label: "Hourly / As-Directed", hint: "Multi-stop or booked hours" },
];

const TOLL_KEYS = Object.keys(TOLL_LABELS) as TollKey[];

function Section({
  step,
  title,
  done,
  children,
}: {
  step: string;
  title: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line-strong bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border text-[11px] font-semibold",
            done
              ? "border-primary bg-primary/15 text-primary"
              : "border-line-strong text-subtle",
          )}
        >
          {done ? <CheckIcon aria-hidden className="size-2.5" /> : step}
        </span>
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-line-strong bg-secondary text-soft hover:border-faint hover:text-foreground",
      )}
    >
      <span className="text-[13px] font-medium">{title}</span>
      {hint && <span className="text-[11px] text-subtle">{hint}</span>}
    </button>
  );
}

export default function Quote() {
  const [clientType, setClientType] = useState<ClientType | "">("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [airportService, setAirportService] = useState<AirportService | "">("");
  const [vehicle, setVehicle] = useState<Vehicle | "">("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState<BookingZone | "">("");
  const [pickupCity, setPickupCity] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [billableHours, setBillableHours] = useState(0);
  const [corporate, setCorporate] = useState({
    account: "",
    rate: 0,
    hours: 1,
    percent: 0,
    customFee: 0,
  });
  const [fees, setFees] = useState<FeeState>(emptyFees);
  const [route, setRoute] = useState({ pickup: "", stops: [] as string[], dropoff: "", garageToPU: true, doToGarage: true });
  const [copied, setCopied] = useState(false);
  const autoTollRef = useRef<TollKey | null>(null);
  const greeterWasAuto = useRef(false);

  const input: QuoteInput = {
    clientType,
    serviceType,
    airportService,
    vehicle,
    city,
    zone,
    pickupCity,
    dropoffCity,
    billableHours,
    corporate,
    fees,
  };
  const result = computeQuote(input);
  const cities = useMemo(
    () => (airportService ? airportCities(airportService) : []),
    [airportService],
  );

  const applyAutoToll = (service: string, nextCity: string) => {
    const next = nextCity ? airportTollFor(service, nextCity) : null;
    if (next === autoTollRef.current) return;
    setFees((f) => ({
      ...f,
      ...(autoTollRef.current ? { [autoTollRef.current]: 0 } : {}),
      ...(next ? { [next]: 1 } : {}),
    }));
    autoTollRef.current = next;
  };

  const selectAirportService = (s: AirportService) => {
    setAirportService(s);
    setCity("");
    applyAutoToll(s, "");
  };

  const selectCity = (c: string) => {
    setCity(c);
    applyAutoToll(airportService, c);
  };

  const selectVehicle = (v: Vehicle) => {
    setVehicle(v);
    const auto = sprinterGreeterAuto(airportService, v);
    if (auto && !greeterWasAuto.current) {
      setFees((f) => ({ ...f, greeter: true }));
      greeterWasAuto.current = true;
    } else if (!auto && greeterWasAuto.current) {
      setFees((f) => ({ ...f, greeter: false }));
      greeterWasAuto.current = false;
    }
    if (zone && serviceType === "Hourly") {
      const min = P2P_RULES[v][zone];
      setBillableHours((h) => Math.max(h, min) || min);
    }
  };

  const selectZone = (z: BookingZone) => {
    setZone(z);
    if (vehicle) setBillableHours(P2P_RULES[vehicle][z]);
  };

  const selectPtpCity = (which: "pickup" | "dropoff", value: string) => {
    const p = which === "pickup" ? value : pickupCity;
    const d = which === "dropoff" ? value : dropoffCity;
    if (which === "pickup") setPickupCity(value);
    else setDropoffCity(value);
    const pm = PTP_CITY_MINIMUMS[p];
    const dm = PTP_CITY_MINIMUMS[d];
    if (pm != null && dm != null) setBillableHours(Math.max(pm, dm));
  };

  const setToll = (key: TollKey, qty: number) => {
    if (key === result.autoToll && qty === 0) autoTollRef.current = null;
    setFees((f) => ({ ...f, [key]: qty }));
  };

  const reset = () => {
    setClientType("");
    setServiceType("");
    setAirportService("");
    setVehicle("");
    setCity("");
    setZone("");
    setPickupCity("");
    setDropoffCity("");
    setBillableHours(0);
    setCorporate({ account: "", rate: 0, hours: 1, percent: 0, customFee: 0 });
    setFees(emptyFees);
    setRoute({ pickup: "", stops: [], dropoff: "", garageToPU: true, doToGarage: true });
    autoTollRef.current = null;
    greeterWasAuto.current = false;
  };

  const copy = async () => {
    await navigator.clipboard.writeText(quoteToText(input, result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const timed = serviceType === "P2P" || serviceType === "Hourly";
  const minHours =
    timed && vehicle
      ? serviceType === "P2P"
        ? Math.max(PTP_CITY_MINIMUMS[pickupCity] ?? 0, PTP_CITY_MINIMUMS[dropoffCity] ?? 0)
        : zone
          ? P2P_RULES[vehicle][zone]
          : 0
      : 0;

  const openRoute = () => {
    if (!route.pickup || !route.dropoff) return;
    const outside = zone === "Outside City";
    const waypoints: string[] = [];
    let origin = route.pickup;
    let destination = route.dropoff;
    if (outside && route.garageToPU) {
      origin = ROUTE_GARAGE;
      waypoints.push(route.pickup);
    }
    waypoints.push(...route.stops.filter(Boolean));
    if (outside && route.doToGarage) {
      waypoints.push(route.dropoff);
      destination = ROUTE_GARAGE;
    }
    const params = new URLSearchParams({ api: "1", origin, destination, travelmode: "driving" });
    if (waypoints.length) params.set("waypoints", waypoints.join("|"));
    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-subtle">
          {clientType && <span className="text-soft">{clientType}</span>}
          {serviceType && <span>• {SERVICE_TYPES.find((s) => s.value === serviceType)?.label}</span>}
          {vehicle && <span>• {vehicle}</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <PlusIcon aria-hidden className="size-3" />
          New quote
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-h-0 overflow-y-auto p-4">
          <div className="flex max-w-2xl flex-col gap-3">
            <Section step="1" title="Client Type" done={!!clientType}>
              <div className="grid grid-cols-3 gap-2">
                {CLIENT_TYPES.map((c) => (
                  <ChoiceCard
                    key={c.value}
                    active={clientType === c.value}
                    onClick={() => {
                      setClientType(c.value);
                      setServiceType("");
                      setAirportService("");
                      setCity("");
                      setVehicle("");
                      setZone("");
                      setPickupCity("");
                      setDropoffCity("");
                      setBillableHours(0);
                    }}
                    title={c.value}
                    hint={c.hint}
                  />
                ))}
              </div>
            </Section>

            {clientType === "Corporate" && (
              <>
                <Section step="2" title="Corporate Account" done={!!corporate.account}>
                  <Field label="Account" htmlFor="q-corp">
                    <Select
                      value={corporate.account}
                      onValueChange={(v) => setCorporate((c) => ({ ...c, account: v }))}
                    >
                      <SelectTrigger id="q-corp">
                        <SelectValue placeholder="Select corporate client" />
                      </SelectTrigger>
                      <SelectContent>
                        {CORPORATE_ACCOUNTS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {corporate.account && (
                    <pre className="mt-3 rounded-lg border border-line-strong bg-secondary p-3 font-sans text-[12px] leading-relaxed whitespace-pre-wrap text-soft">
                      {CORPORATE[corporate.account]}
                    </pre>
                  )}
                </Section>
                <Section step="3" title="Corporate Rate">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Base rate ($)" htmlFor="q-crate">
                      <Input
                        id="q-crate"
                        type="number"
                        min={0}
                        step={0.01}
                        value={corporate.rate || ""}
                        onChange={(e) => setCorporate((c) => ({ ...c, rate: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                    <Field label="Hours" htmlFor="q-chours" hint="Leave at 1 for a flat rate">
                      <Input
                        id="q-chours"
                        type="number"
                        min={0}
                        step={0.25}
                        value={corporate.hours || ""}
                        onChange={(e) => setCorporate((c) => ({ ...c, hours: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                    <Field label="Percentage (%)" htmlFor="q-cpct" hint="Check account notes — default may be 30%">
                      <Input
                        id="q-cpct"
                        type="number"
                        min={0}
                        step={0.01}
                        value={corporate.percent || ""}
                        onChange={(e) => setCorporate((c) => ({ ...c, percent: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                    <Field label="Custom fee ($)" htmlFor="q-cfee">
                      <Input
                        id="q-cfee"
                        type="number"
                        min={0}
                        step={0.01}
                        value={corporate.customFee || ""}
                        onChange={(e) => setCorporate((c) => ({ ...c, customFee: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                  </div>
                </Section>
              </>
            )}

            {(clientType === "Affiliate" || clientType === "Walk-in") && (
              <Section step="2" title="Service Type" done={!!serviceType}>
                <div className="grid grid-cols-3 gap-2">
                  {SERVICE_TYPES.map((s) => (
                    <ChoiceCard
                      key={s.value}
                      active={serviceType === s.value}
                      onClick={() => {
                        setServiceType(s.value);
                        setAirportService("");
                        setCity("");
                        setZone("");
                        setPickupCity("");
                        setDropoffCity("");
                        setBillableHours(0);
                      }}
                      title={s.label}
                      hint={s.hint}
                    />
                  ))}
                </div>
              </Section>
            )}

            {serviceType === "Airport" && (
              <Section step="3" title="Trip Details" done={!!(airportService && vehicle && city)}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Airport service" htmlFor="q-svc">
                    <Select value={airportService} onValueChange={(v) => selectAirportService(v as AirportService)}>
                      <SelectTrigger id="q-svc">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {AIRPORT_SERVICES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Vehicle" htmlFor="q-veh">
                    <Select value={vehicle} onValueChange={(v) => selectVehicle(v as Vehicle)}>
                      <SelectTrigger id="q-veh">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Destination city" htmlFor="q-city" className="col-span-2">
                    <Select value={city} onValueChange={selectCity} disabled={!airportService}>
                      <SelectTrigger id="q-city">
                        <SelectValue placeholder={airportService ? "Select city" : "Select service first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                {result.autoToll && (
                  <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-[12px] text-primary">
                    Auto-added {TOLL_LABELS[result.autoToll]} toll for {city}.
                  </p>
                )}
              </Section>
            )}

            {timed && (
              <Section step="3" title="Vehicle" done={!!vehicle}>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLES.map((v) => (
                    <ChoiceCard
                      key={v}
                      active={vehicle === v}
                      onClick={() => selectVehicle(v)}
                      title={v}
                      hint={`${money(HOURLY_RATES[v])}/hr`}
                    />
                  ))}
                </div>
              </Section>
            )}

            {timed && vehicle && serviceType === "P2P" && (
              <Section step="4" title="City Pair" done={!!(pickupCity && dropoffCity)}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pickup city" htmlFor="q-pu">
                    <Select value={pickupCity} onValueChange={(v) => selectPtpCity("pickup", v)}>
                      <SelectTrigger id="q-pu">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PTP_CITY_MINIMUMS).sort().map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Drop-off city" htmlFor="q-do">
                    <Select value={dropoffCity} onValueChange={(v) => selectPtpCity("dropoff", v)}>
                      <SelectTrigger id="q-do">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PTP_CITY_MINIMUMS).sort().map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                {pickupCity && dropoffCity && (
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-line-strong bg-secondary p-3 text-[12px]">
                    <div>
                      <span className="block text-subtle">Pickup minimum</span>
                      <b className="text-soft">{pickupCity} — {PTP_CITY_MINIMUMS[pickupCity]}h</b>
                    </div>
                    <div>
                      <span className="block text-subtle">Drop-off minimum</span>
                      <b className="text-soft">{dropoffCity} — {PTP_CITY_MINIMUMS[dropoffCity]}h</b>
                    </div>
                    <div>
                      <span className="block text-subtle">Billable hours</span>
                      <b className="text-primary">{minHours}h</b>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {timed && vehicle && serviceType === "Hourly" && (
              <Section step="4" title="Booking Zone" done={!!zone}>
                <div className="grid grid-cols-2 gap-2">
                  {(["Within City", "Outside City"] as BookingZone[]).map((z) => (
                    <ChoiceCard
                      key={z}
                      active={zone === z}
                      onClick={() => selectZone(z)}
                      title={z}
                      hint={z === "Outside City" ? "Garage-to-garage applies" : "Pickup → drop-off"}
                    />
                  ))}
                </div>
                {zone === "Outside City" && (
                  <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-warning">
                    Account for garage-to-garage time and include it in the billable hours.
                  </p>
                )}
              </Section>
            )}

            {timed && vehicle && (serviceType === "Hourly" ? zone : pickupCity && dropoffCity) && (
              <Section step="5" title={serviceType === "Hourly" ? "Route & Billable Hours" : "Billable Hours"}>
                {serviceType === "Hourly" && (
                  <div className="mb-3 flex flex-col gap-2 rounded-lg border border-line-strong bg-secondary p-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Pickup address"
                        value={route.pickup}
                        onChange={(e) => setRoute((r) => ({ ...r, pickup: e.target.value }))}
                      />
                      <Input
                        placeholder="Drop-off address"
                        value={route.dropoff}
                        onChange={(e) => setRoute((r) => ({ ...r, dropoff: e.target.value }))}
                      />
                    </div>
                    {route.stops.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder={`Stop ${i + 1}`}
                          value={s}
                          onChange={(e) =>
                            setRoute((r) => ({
                              ...r,
                              stops: r.stops.map((x, j) => (j === i ? e.target.value : x)),
                            }))
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove stop"
                          onClick={() => setRoute((r) => ({ ...r, stops: r.stops.filter((_, j) => j !== i) }))}
                        >
                          <XIcon aria-hidden className="size-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoute((r) => ({ ...r, stops: [...r.stops, ""] }))}
                      >
                        <PlusIcon aria-hidden className="size-3" /> Add stop
                      </Button>
                      {zone === "Outside City" && (
                        <>
                          <label className="flex items-center gap-1.5 text-[12px] text-soft">
                            <Checkbox
                              checked={route.garageToPU}
                              onCheckedChange={(c) => setRoute((r) => ({ ...r, garageToPU: !!c }))}
                            />
                            Garage → pickup
                          </label>
                          <label className="flex items-center gap-1.5 text-[12px] text-soft">
                            <Checkbox
                              checked={route.doToGarage}
                              onCheckedChange={(c) => setRoute((r) => ({ ...r, doToGarage: !!c }))}
                            />
                            Drop-off → garage
                          </label>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={openRoute} className="ml-auto">
                        <ExternalIcon aria-hidden className="size-3" /> Open in Google Maps
                      </Button>
                    </div>
                  </div>
                )}
                <Field
                  label={serviceType === "Hourly" ? "Booked service hours" : "Calculated drive time (hours)"}
                  htmlFor="q-hours"
                  hint={minHours ? `Minimum booking: ${minHours}h — ${vehicle} • cancel ${cancellationFor(vehicle, clientType as ClientType)}` : undefined}
                >
                  <Input
                    id="q-hours"
                    type="number"
                    min={0}
                    step={0.25}
                    value={billableHours || ""}
                    onChange={(e) => setBillableHours(Number(e.target.value) || 0)}
                  />
                </Field>
                {result.minimumApplied && (
                  <p className="mt-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-warning">
                    {result.minimumApplied.entered}h entered is below the {result.minimumApplied.used}h minimum — pricing uses {result.minimumApplied.used}h.
                  </p>
                )}
              </Section>
            )}

            {(result.base != null || (clientType === "Corporate" && corporate.account)) && (
              <Section
                step={clientType === "Corporate" ? "4" : serviceType === "Airport" ? "4" : "6"}
                title="Fees & Extras"
              >
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-[13px]",
                        fees.greeter || result.greeterAuto
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-line-strong bg-secondary text-soft",
                      )}
                    >
                      <span>
                        Airport Greeter <span className="block text-[11px] text-subtle">$125{result.greeterAuto ? " • auto for Sprinter M&G" : ""}</span>
                      </span>
                      <Checkbox
                        checked={fees.greeter || result.greeterAuto}
                        onCheckedChange={(c) => {
                          greeterWasAuto.current = false;
                          setFees((f) => ({ ...f, greeter: !!c }));
                        }}
                      />
                    </label>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-[13px]",
                        fees.after
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-line-strong bg-secondary text-soft",
                      )}
                    >
                      <span>
                        After Hours <span className="block text-[11px] text-subtle">$30 • 12–6 AM</span>
                      </span>
                      <Checkbox
                        checked={fees.after}
                        onCheckedChange={(c) => setFees((f) => ({ ...f, after: !!c }))}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Car seats" htmlFor="q-carseat" hint="$35 each">
                      <Input
                        id="q-carseat"
                        type="number"
                        min={0}
                        value={fees.carseat || ""}
                        onChange={(e) => setFees((f) => ({ ...f, carseat: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                    <Field label="Travel time (min)" htmlFor="q-travel" hint="Trip cost ÷ 60 × min">
                      <Input
                        id="q-travel"
                        type="number"
                        min={0}
                        value={fees.travelMinutes || ""}
                        onChange={(e) => setFees((f) => ({ ...f, travelMinutes: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                    <Field label="Wait time (min)" htmlFor="q-wait" hint="Vehicle rate ÷ 60 × min">
                      <Input
                        id="q-wait"
                        type="number"
                        min={0}
                        value={fees.waitMinutes || ""}
                        onChange={(e) => setFees((f) => ({ ...f, waitMinutes: Number(e.target.value) || 0 }))}
                      />
                    </Field>
                  </div>
                  <div className="mt-1">
                    <span className="mb-2 block text-[11px] font-semibold tracking-wide text-subtle uppercase">
                      Bridge tolls
                    </span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {TOLL_KEYS.map((key) => (
                        <div key={key} className="flex flex-col gap-1">
                          <label htmlFor={`q-${key}`} className="text-[11px] text-subtle">
                            {TOLL_LABELS[key]}
                            <span className="block">${FEES[key]} each</span>
                          </label>
                          <Input
                            id={`q-${key}`}
                            type="number"
                            min={0}
                            value={fees[key] || ""}
                            onChange={(e) => setToll(key, Number(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col border-l border-line-strong bg-card/50">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <span className="text-[11px] font-semibold tracking-wide text-subtle uppercase">Current quote</span>
              <div className="mt-1 text-[28px] font-semibold text-foreground tabular-nums">
                {result.ready ? money(result.total) : "$0.00"}
              </div>
              {result.baseNote && <p className="mt-1 text-[12px] text-subtle">{result.baseNote}</p>}
            </div>

            {result.base != null && (
              <div className="mt-3 rounded-xl border border-line-strong bg-card p-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-subtle">Base rate</span>
                  <b className="text-foreground tabular-nums">{money(result.base)}</b>
                </div>
                {result.feeLines.map((l) => (
                  <div key={l.label} className="mt-1.5 flex justify-between text-[13px]">
                    <span className="text-subtle">{l.label}</span>
                    <span className="text-soft tabular-nums">{money(l.amount)}</span>
                  </div>
                ))}
                {corporate.account && (
                  <div className="mt-1.5 flex justify-between text-[13px]">
                    <span className="text-subtle">Corporate base</span>
                    <span className="text-soft tabular-nums">
                      {money(corporate.rate * corporate.hours + corporate.rate * corporate.hours * (corporate.percent / 100) + corporate.customFee)}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-line-strong pt-2 text-[13px]">
                  <span className="font-medium text-foreground">Total</span>
                  <b className="text-success tabular-nums">{money(result.total)}</b>
                </div>
              </div>
            )}

            {result.steps.length > 0 && (
              <div className="mt-3 rounded-xl border border-line-strong bg-card p-3">
                <h4 className="mb-2 text-[12px] font-semibold text-foreground">Rate breakdown</h4>
                {result.steps.map((s, i) => (
                  <div key={i} className="mb-2.5 last:mb-0">
                    <p className="text-[11px] font-semibold text-primary">
                      Step {i + 1} — {s.title}
                    </p>
                    {s.lines.map((l, j) => (
                      <p key={j} className="mt-0.5 pl-2 font-mono text-[11px] text-subtle">
                        {l}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-line-strong p-3">
            <Button variant="primary" className="w-full" onClick={copy} disabled={!result.ready}>
              <CopyIcon aria-hidden className="size-3" />
              {copied ? "Copied" : "Copy quote"}
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
