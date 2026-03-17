import type { Lead, Client, Job, Call } from "@/types";

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
  { id: 1, ini: "ML", client: "Maria Lopez",   addr: "123 SW 8th St",  svc: "Lawn Mowing",       worker: "Jose M.", date: "2026-03-17", time: "9:00 AM",  st: "done",     total: 65,  photos: 4 },
  { id: 2, ini: "JS", client: "John Smith",    addr: "456 Coral Way",  svc: "Hedge Trimming",    worker: "You",     date: "2026-03-17", time: "11:30 AM", st: "active",   total: 80,  photos: 1 },
  { id: 3, ini: "AR", client: "Ana Rodriguez", addr: "789 NW 5th Ave", svc: "Pool Cleaning",     worker: "Jose M.", date: "2026-03-18", time: "2:00 PM",  st: "upcoming", total: 150, photos: 0 },
  { id: 4, ini: "DC", client: "David Chen",    addr: "321 SW 12th",    svc: "Lawn Mowing",       worker: "You",     date: "2026-03-19", time: "4:00 PM",  st: "upcoming", total: 80,  photos: 0 },
  { id: 5, ini: "SW", client: "Sandra White",  addr: "900 Brickell",   svc: "Pressure Washing",  worker: "Jose M.", date: "2026-03-20", time: "10:00 AM", st: "upcoming", total: 220, photos: 0 },
  { id: 6, ini: "ML", client: "Maria Lopez",   addr: "123 SW 8th St",  svc: "Leaf Cleanup",      worker: "You",     date: "2026-03-21", time: "8:30 AM",  st: "upcoming", total: 90,  photos: 0 },
  { id: 7, ini: "AR", client: "Ana Rodriguez", addr: "789 NW 5th Ave", svc: "Lawn Mowing",       worker: "Jose M.", date: "2026-03-24", time: "9:00 AM",  st: "upcoming", total: 65,  photos: 0 },
  { id: 8, ini: "JS", client: "John Smith",    addr: "456 Coral Way",  svc: "Pool Cleaning",     worker: "You",     date: "2026-03-17", time: "3:00 PM",  st: "upcoming", total: 120, photos: 0 },
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
