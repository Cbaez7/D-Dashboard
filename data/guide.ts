export type SopPage = {
  id: string;
  title: string;
  slug: string;
  category: string;
  body: string;
  version: number;
  requiresAck: boolean;
  updatedAt: string;
};

export const SOP_PAGES: SopPage[] = [
  {
    id: "sop-greet",
    title: "Greeting & call intake",
    slug: "greeting-call-intake",
    category: "Phone",
    version: 3,
    requiresAck: true,
    updatedAt: "2026-10-01T09:00:00Z",
    body: [
      "Answer within three rings: \"Thank you for calling BNG Worldwide Chauffeur Services, this is {name}. How may I help you?\"",
      "",
      "Capture before quoting:",
      "• Caller name and callback number",
      "• Pickup address, date, and time (confirm timezone)",
      "• Drop-off address or hourly duration",
      "• Passenger count and luggage",
      "• Flight number for airport pickups",
      "",
      "Never quote before confirming the service date and pickup window. If the caller is a VIP or corporate account, check the customer notes panel before responding.",
    ].join("\n"),
  },
  {
    id: "sop-airport",
    title: "Airport pickup procedure",
    slug: "airport-pickup",
    category: "Trips",
    version: 5,
    requiresAck: true,
    updatedAt: "2026-09-28T15:30:00Z",
    body: [
      "Track the inbound flight from booking until wheels-down. Note tail or flight number on the reservation.",
      "",
      "30 minutes before scheduled landing:",
      "• Verify the assigned driver is staged",
      "• Text the passenger the driver's name, vehicle, and mobile number",
      "",
      "After landing, drivers wait at the designated livery stand — not curbside. For international arrivals, build in 45–60 minutes of customs buffer before flagging a no-show.",
      "",
      "No-show protocol: attempt the passenger twice, then the booking contact, then escalate to the shift lead before releasing the driver.",
    ].join("\n"),
  },
  {
    id: "sop-vehicle-qc",
    title: "Vehicle quality check",
    slug: "vehicle-quality-check",
    category: "Fleet",
    version: 2,
    requiresAck: true,
    updatedAt: "2026-09-20T11:00:00Z",
    body: [
      "Each shift, confirm every dispatched vehicle passed its daily check before assignment.",
      "",
      "Exterior: wash within 24h, no visible damage, plates clean.",
      "Interior: leather wiped, no odors, water bottles stocked, chargers working.",
      "Log issues as a fleet note against the vehicle and tag the vehicle Out of Service if it fails.",
    ].join("\n"),
  },
  {
    id: "sop-handoff",
    title: "Shift handoff",
    slug: "shift-handoff",
    category: "Operations",
    version: 4,
    requiresAck: true,
    updatedAt: "2026-10-05T08:15:00Z",
    body: [
      "Fifteen minutes before shift end, post a handoff summary in #dispatch:",
      "",
      "• Active trips still in flight and their ETA",
      "• Pending quotes awaiting customer reply",
      "• Open tickets or tasks you could not close",
      "• Anything the incoming dispatcher must watch (delays, VIP notes, vehicle issues)",
      "",
      "Do not check out until the incoming dispatcher replies to the handoff message or is confirmed on shift.",
    ].join("\n"),
  },
  {
    id: "sop-vip",
    title: "VIP & corporate accounts",
    slug: "vip-corporate-accounts",
    category: "Customers",
    version: 1,
    requiresAck: false,
    updatedAt: "2026-09-15T17:45:00Z",
    body: [
      "Accounts flagged VIP get white-glove handling:",
      "",
      "• Confirm every booking by phone, not email",
      "• Assign senior drivers only",
      "• 15-minute early driver arrival standard",
      "• Notify the account owner in chat of any disruption immediately",
      "",
      "Check customer notes on every interaction — preferences (temperature, route, silence) are recorded there.",
    ].join("\n"),
  },
];
