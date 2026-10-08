export type MailThread = {
  id: string;
  from: string;
  fromAddress: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  linkedTrip: string | null;
};

export const MAIL_THREADS: MailThread[] = [
  {
    id: "mail-1",
    from: "Nadine Ellison",
    fromAddress: "n.ellison@example.com",
    subject: "RE: Tonight's pickup — timing change",
    preview:
      "Thanks Chris — please move the pickup to 22:15. We'll need the same driver for the return.",
    body: "Hi Chris,\n\nPlease move tonight's pickup to 22:15 — dinner is running long. We'd like the same driver for the return leg if possible.\n\nThanks,\nNadine",
    receivedAt: "2026-10-08T12:48:00Z",
    unread: true,
    linkedTrip: "#4471",
  },
  {
    id: "mail-2",
    from: "JetNet Aviation",
    fromAddress: "ops@jetnet.example",
    subject: "FBO arrival confirmation — tail N847GX",
    preview:
      "Confirmed arrival slot 19:40 local at Signature LAX. Passenger transfer coordination attached.",
    body: "Confirmed arrival slot 19:40 local at Signature LAX.\n\nTail N847GX — two passengers, four bags. Chauffeur staging instructions attached.\n\n— JetNet Operations",
    receivedAt: "2026-10-08T10:15:00Z",
    unread: false,
    linkedTrip: null,
  },
  {
    id: "mail-3",
    from: "Corporate Travel — Meridian",
    fromAddress: "travel@meridian.example",
    subject: "October invoice query",
    preview:
      "Could you resend the September 28 invoice? Our AP team can't locate the original.",
    body: "Hi dispatch,\n\nCould you resend the September 28 invoice for account MER-104? Our AP team can't locate the original.\n\nAppreciate it,\nMeridian Travel Desk",
    receivedAt: "2026-10-07T16:30:00Z",
    unread: false,
    linkedTrip: null,
  },
];
