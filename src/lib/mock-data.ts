import type { Lead, Client, Job, Call, Property, Invoice } from "@/types";

export const LEADS: readonly Lead[] = [
  { id: 1, name: "Carlos Mendez",  phone: "(786) 555-0123", service: "Weekly lawn + edging", value: 120, status: "new",       ago: "2h ago",    es: true  },
  { id: 2, name: "Patricia Walsh", phone: "(305) 555-0456", service: "Biweekly mow",         value: 80,  status: "contacted", ago: "Yesterday", es: false },
  { id: 3, name: "Roberto Sanz",   phone: "(954) 555-0789", service: "Full yard cleanup",    value: 200, status: "quoted",    ago: "Mar 4",     es: true  },
  { id: 4, name: "Ashley Kim",     phone: "(786) 555-1234", service: "Monthly plan",         value: 150, status: "new",       ago: "3h ago",    es: false },
  { id: 5, name: "Miguel Torres",  phone: "(305) 555-5678", service: "Hedge trimming",       value: 95,  status: "contacted", ago: "Mar 3",     es: true  },
];

export const CLIENTS: readonly Client[] = [
  { id: 1, ini: "ML", name: "Maria Lopez",   phone: "(305) 555-0001", props: 3, mrr: 260, bal: 0,   tag: "VIP",     last: "Today"  },
  { id: 2, ini: "JS", name: "John Smith",    phone: "(786) 555-0002", props: 1, mrr: 120, bal: 120, tag: null,      last: "Mar 5"  },
  { id: 3, ini: "AR", name: "Ana Rodriguez", phone: "(954) 555-0003", props: 2, mrr: 180, bal: 0,   tag: "Monthly", last: "Mar 4"  },
  { id: 4, ini: "DC", name: "David Chen",    phone: "(305) 555-0004", props: 1, mrr: 80,  bal: 80,  tag: null,      last: "Mar 1"  },
  { id: 5, ini: "SW", name: "Sandra White",  phone: "(786) 555-0005", props: 4, mrr: 340, bal: 0,   tag: "VIP",     last: "Feb 28" },
];

export const JOBS: readonly Job[] = [
  { id: 1, ini: "ML", client: "Maria Lopez",   addr: "123 SW 8th St",  svc: "Lawn Mowing",       worker: "Jose M.", date: "2026-03-17", time: "9:00 AM",  st: "done",     total: 65,  photos: 4, propertyId: 1  },
  { id: 2, ini: "JS", client: "John Smith",    addr: "456 Coral Way",  svc: "Hedge Trimming",    worker: "You",     date: "2026-03-17", time: "11:30 AM", st: "active",   total: 80,  photos: 1, propertyId: 4  },
  { id: 3, ini: "AR", client: "Ana Rodriguez", addr: "789 NW 5th Ave", svc: "Pool Cleaning",     worker: "Jose M.", date: "2026-03-18", time: "2:00 PM",  st: "upcoming", total: 150, photos: 0, propertyId: 5  },
  { id: 4, ini: "DC", client: "David Chen",    addr: "321 SW 12th",    svc: "Lawn Mowing",       worker: "You",     date: "2026-03-19", time: "4:00 PM",  st: "upcoming", total: 80,  photos: 0, propertyId: 7  },
  { id: 5, ini: "SW", client: "Sandra White",  addr: "900 Brickell",   svc: "Pressure Washing",  worker: "Jose M.", date: "2026-03-20", time: "10:00 AM", st: "upcoming", total: 220, photos: 0, propertyId: 8  },
  { id: 6, ini: "ML", client: "Maria Lopez",   addr: "123 SW 8th St",  svc: "Leaf Cleanup",      worker: "You",     date: "2026-03-21", time: "8:30 AM",  st: "upcoming", total: 90,  photos: 0, propertyId: 1  },
  { id: 7, ini: "AR", client: "Ana Rodriguez", addr: "789 NW 5th Ave", svc: "Lawn Mowing",       worker: "Jose M.", date: "2026-03-24", time: "9:00 AM",  st: "upcoming", total: 65,  photos: 0, propertyId: 5  },
  { id: 8, ini: "JS", client: "John Smith",    addr: "456 Coral Way",  svc: "Pool Cleaning",     worker: "You",     date: "2026-03-17", time: "3:00 PM",  st: "upcoming", total: 120, photos: 0, propertyId: 4  },
];

export const CALLS: readonly Call[] = [
  { name: "Carlos Mendez",  num: "(786) 555-0123", dur: "4:32", out: true,  ago: "2h ago"    },
  { name: "Maria Lopez",    num: "(305) 555-0001", dur: "1:15", out: false, ago: "Yesterday" },
  { name: "Patricia Walsh", num: "(305) 555-0456", dur: "2:48", out: true,  ago: "Mar 4"     },
];

export const KANBAN_COLUMNS = [
  { id: "new",       label: "New"       },
  { id: "contacted", label: "Contacted" },
  { id: "quoted",    label: "Quoted"    },
  { id: "won",       label: "Won"       },
  { id: "lost",      label: "Lost"      },
] as const;

// ── Properties ──────────────────────────────────────────────────

export const PROPERTIES: readonly Property[] = [
  // Maria Lopez (id: 1) — 3 properties
  { id: 1,  clientId: 1, address: "123 SW 8th St, Miami, FL 33130",     nickname: "Main Home",     services: ["Lawn Mowing", "Leaf Cleanup", "Hedge Trimming"],  monthlyRate: 12000, isActive: true  },
  { id: 2,  clientId: 1, address: "450 NW 3rd Ave, Miami, FL 33128",    nickname: "Rental #1",     services: ["Lawn Mowing"],                                    monthlyRate: 6500,  isActive: true  },
  { id: 3,  clientId: 1, address: "811 Flagler St, Miami, FL 33130",    nickname: "Rental #2",     services: ["Lawn Mowing", "Pressure Washing"],                monthlyRate: 7500,  isActive: true  },

  // John Smith (id: 2) — 1 property
  { id: 4,  clientId: 2, address: "456 Coral Way, Miami, FL 33145",     nickname: "Home",          services: ["Hedge Trimming", "Pool Cleaning"],                monthlyRate: 12000, isActive: true  },

  // Ana Rodriguez (id: 3) — 2 properties
  { id: 5,  clientId: 3, address: "789 NW 5th Ave, Miami, FL 33136",   nickname: "Primary Home",  services: ["Pool Cleaning", "Lawn Mowing"],                   monthlyRate: 10500, isActive: true  },
  { id: 6,  clientId: 3, address: "2200 Biscayne Blvd, Miami, FL 33137", nickname: "Condo",       services: ["Lawn Mowing"],                                    monthlyRate: 7500,  isActive: true  },

  // David Chen (id: 4) — 1 property
  { id: 7,  clientId: 4, address: "321 SW 12th St, Miami, FL 33130",   nickname: "Home",          services: ["Lawn Mowing"],                                    monthlyRate: 8000,  isActive: true  },

  // Sandra White (id: 5) — 4 properties
  { id: 8,  clientId: 5, address: "900 Brickell Ave, Miami, FL 33131",  nickname: "Brickell Home", services: ["Pressure Washing", "Lawn Mowing", "Pool Cleaning"], monthlyRate: 15000, isActive: true  },
  { id: 9,  clientId: 5, address: "1500 Ocean Dr, Miami Beach, FL 33139", nickname: "Beach House", services: ["Lawn Mowing", "Hedge Trimming"],                  monthlyRate: 9500,  isActive: true  },
  { id: 10, clientId: 5, address: "3300 Coral Gables Dr, Coral Gables, FL 33134", nickname: "Gables Rental", services: ["Lawn Mowing"],                          monthlyRate: 6000,  isActive: true  },
  { id: 11, clientId: 5, address: "720 NE 79th St, Miami, FL 33138",   nickname: "Investment #1", services: ["Lawn Mowing", "Pressure Washing"],                monthlyRate: 3500,  isActive: false },
];

// ── Invoices ────────────────────────────────────────────────────

export const INVOICES: readonly Invoice[] = [
  // Job 1 (Maria Lopez, done) — paid
  {
    id: 1, clientId: 1, propertyId: 1, jobId: 1,
    date: "2026-03-17", dueDate: "2026-03-31",
    items: [
      { description: "Lawn Mowing — 123 SW 8th St", quantity: 1, unitPrice: 6500, total: 6500 },
    ],
    subtotal: 6500, tax: 455, total: 6955,
    status: "paid", paidDate: "2026-03-17", paymentMethod: "Zelle",
  },

  // Maria Lopez — March monthly service (Rental #1)
  {
    id: 2, clientId: 1, propertyId: 2, jobId: null,
    date: "2026-03-01", dueDate: "2026-03-15",
    items: [
      { description: "Monthly Lawn Mowing — 450 NW 3rd Ave", quantity: 4, unitPrice: 1625, total: 6500 },
    ],
    subtotal: 6500, tax: 455, total: 6955,
    status: "paid", paidDate: "2026-03-10", paymentMethod: "Credit Card",
  },

  // Maria Lopez — Leaf Cleanup (upcoming job 6)
  {
    id: 3, clientId: 1, propertyId: 1, jobId: 6,
    date: "2026-03-21", dueDate: "2026-04-04",
    items: [
      { description: "Leaf Cleanup — 123 SW 8th St", quantity: 1, unitPrice: 9000, total: 9000 },
    ],
    subtotal: 9000, tax: 630, total: 9630,
    status: "unpaid", paidDate: null, paymentMethod: null,
  },

  // John Smith — Hedge Trimming (job 2, active)
  {
    id: 4, clientId: 2, propertyId: 4, jobId: 2,
    date: "2026-03-17", dueDate: "2026-03-31",
    items: [
      { description: "Hedge Trimming — 456 Coral Way", quantity: 1, unitPrice: 8000, total: 8000 },
    ],
    subtotal: 8000, tax: 560, total: 8560,
    status: "unpaid", paidDate: null, paymentMethod: null,
  },

  // John Smith — overdue from February
  {
    id: 5, clientId: 2, propertyId: 4, jobId: null,
    date: "2026-02-15", dueDate: "2026-03-01",
    items: [
      { description: "Pool Cleaning — 456 Coral Way", quantity: 1, unitPrice: 12000, total: 12000 },
    ],
    subtotal: 12000, tax: 840, total: 12840,
    status: "overdue", paidDate: null, paymentMethod: null,
  },

  // Ana Rodriguez — Pool Cleaning (job 3, upcoming)
  {
    id: 6, clientId: 3, propertyId: 5, jobId: 3,
    date: "2026-03-18", dueDate: "2026-04-01",
    items: [
      { description: "Pool Cleaning — 789 NW 5th Ave", quantity: 1, unitPrice: 15000, total: 15000 },
    ],
    subtotal: 15000, tax: 1050, total: 16050,
    status: "unpaid", paidDate: null, paymentMethod: null,
  },

  // Ana Rodriguez — February service (paid)
  {
    id: 7, clientId: 3, propertyId: 5, jobId: null,
    date: "2026-02-01", dueDate: "2026-02-15",
    items: [
      { description: "Monthly Lawn Mowing — 789 NW 5th Ave", quantity: 4, unitPrice: 1625, total: 6500 },
      { description: "Pool Cleaning — 789 NW 5th Ave", quantity: 2, unitPrice: 7500, total: 15000 },
    ],
    subtotal: 21500, tax: 1505, total: 23005,
    status: "paid", paidDate: "2026-02-12", paymentMethod: "Check",
  },

  // David Chen — Lawn Mowing (job 4, upcoming)
  {
    id: 8, clientId: 4, propertyId: 7, jobId: 4,
    date: "2026-03-19", dueDate: "2026-04-02",
    items: [
      { description: "Lawn Mowing — 321 SW 12th St", quantity: 1, unitPrice: 8000, total: 8000 },
    ],
    subtotal: 8000, tax: 560, total: 8560,
    status: "unpaid", paidDate: null, paymentMethod: null,
  },

  // David Chen — overdue from February
  {
    id: 9, clientId: 4, propertyId: 7, jobId: null,
    date: "2026-02-10", dueDate: "2026-02-24",
    items: [
      { description: "Monthly Lawn Mowing — 321 SW 12th St", quantity: 4, unitPrice: 2000, total: 8000 },
    ],
    subtotal: 8000, tax: 560, total: 8560,
    status: "overdue", paidDate: null, paymentMethod: null,
  },

  // Sandra White — Pressure Washing (job 5, upcoming)
  {
    id: 10, clientId: 5, propertyId: 8, jobId: 5,
    date: "2026-03-20", dueDate: "2026-04-03",
    items: [
      { description: "Pressure Washing — 900 Brickell Ave (driveway + patio)", quantity: 1, unitPrice: 22000, total: 22000 },
    ],
    subtotal: 22000, tax: 1540, total: 23540,
    status: "unpaid", paidDate: null, paymentMethod: null,
  },

  // Sandra White — February paid
  {
    id: 11, clientId: 5, propertyId: 8, jobId: null,
    date: "2026-02-01", dueDate: "2026-02-15",
    items: [
      { description: "Monthly Lawn Mowing — 900 Brickell Ave", quantity: 4, unitPrice: 1625, total: 6500 },
      { description: "Pool Cleaning — 900 Brickell Ave", quantity: 2, unitPrice: 7500, total: 15000 },
    ],
    subtotal: 21500, tax: 1505, total: 23005,
    status: "paid", paidDate: "2026-02-14", paymentMethod: "Zelle",
  },

  // Sandra White — March partial payment (Beach House)
  {
    id: 12, clientId: 5, propertyId: 9, jobId: null,
    date: "2026-03-01", dueDate: "2026-03-15",
    items: [
      { description: "Monthly Lawn Mowing — 1500 Ocean Dr", quantity: 4, unitPrice: 1625, total: 6500 },
      { description: "Hedge Trimming — 1500 Ocean Dr", quantity: 1, unitPrice: 3000, total: 3000 },
    ],
    subtotal: 9500, tax: 665, total: 10165,
    status: "partial", paidDate: null, paymentMethod: "Credit Card",
  },
];
