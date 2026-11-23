export type LeadStage =
  | "new"
  | "contacted"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSegment =
  | "School Partnership"
  | "Evolve 8.0"
  | "Parent / Learner"
  | "Institutional / CSR"
  | "Instructor";

export type LeadPriority = "High" | "Medium" | "Low";

export interface LeadActivity {
  id: string;
  type: "Call" | "WhatsApp" | "Campus Visit" | "Proposal" | "Note";
  summary: string;
  author: string;
  timestamp: string;
}

export interface CrmLead {
  id: string;
  organization: string;
  contactName: string;
  contactRole: string;
  segment: LeadSegment;
  stage: LeadStage;
  priority: LeadPriority;
  phone: string;
  email: string;
  location: string;
  programInterest: string;
  studentCount?: number;
  estimatedValueNgn: number;
  assignedTo: string;
  nextFollowUp: string;
  createdAt: string;
  notes: string;
  activities: LeadActivity[];
}

export const CRM_STAGES: {
  id: LeadStage;
  label: string;
  shortLabel: string;
  dotColor: string;
  badgeClass: string;
}[] = [
  {
    id: "new",
    label: "New Lead",
    shortLabel: "New",
    dotColor: "bg-[#38e0ff]",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "contacted",
    label: "Contacted",
    shortLabel: "Contacted",
    dotColor: "bg-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "proposal",
    label: "Proposal Sent",
    shortLabel: "Proposal",
    dotColor: "bg-[#3b00b3]",
    badgeClass: "bg-purple-50 text-[#3b00b3] border-purple-200",
  },
  {
    id: "negotiation",
    label: "Negotiation",
    shortLabel: "Negotiation",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "won",
    label: "Partner Won",
    shortLabel: "Won",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "lost",
    label: "Closed Lost",
    shortLabel: "Lost",
    dotColor: "bg-gray-400",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
  },
];

export const CRM_SEGMENTS: LeadSegment[] = [
  "School Partnership",
  "Evolve 8.0",
  "Parent / Learner",
  "Institutional / CSR",
  "Instructor",
];

export const initialCrmLeads: CrmLead[] = [
  {
    id: "lead_1001",
    organization: "Gracefield Royal Academy",
    contactName: "Mrs. Adeola Ogunleye",
    contactRole: "Proprietress",
    segment: "School Partnership",
    stage: "proposal",
    priority: "High",
    phone: "08034561120",
    email: "director@gracefieldroyal.edu.ng",
    location: "Festac / Amuwo Odofin, Lagos",
    programInterest: "Full School Technology Program (ICT + Coding + Robotics)",
    studentCount: 420,
    estimatedValueNgn: 1850000,
    assignedTo: "BD Team · Lagos West",
    nextFollowUp: "2026-11-26",
    createdAt: "2026-11-18",
    notes:
      "Wants 2 deployed KHLC instructors for Primary 1–6 and JSS1–3 starting next term. Requested robotics kit quotation.",
    activities: [
      {
        id: "act_1",
        type: "Proposal",
        summary: "Sent termly ICT + Robotics partnership proposal (₦1.85M/term).",
        author: "KHLC Admin",
        timestamp: "2026-11-21 11:30",
      },
      {
        id: "act_2",
        type: "Campus Visit",
        summary: "Inspected 30-seat computer lab; lab is ready for Coding & CBT.",
        author: "KHLC Admin",
        timestamp: "2026-11-19 10:15",
      },
    ],
  },
  {
    id: "lead_1002",
    organization: "Pinnacle Crest College",
    contactName: "Mr. Babatunde Balogun",
    contactRole: "Principal",
    segment: "Evolve 8.0",
    stage: "contacted",
    priority: "High",
    phone: "08092347781",
    email: "principal@pinnaclecrest.sch.ng",
    location: "Surulere, Lagos",
    programInterest: "Evolve 8.0 (Online Test + Robotics Project Track)",
    studentCount: 280,
    estimatedValueNgn: 950000,
    assignedTo: "Evolve Desk",
    nextFollowUp: "2026-11-25",
    createdAt: "2026-11-20",
    notes:
      "Registering 9 pupils for Phase 1 Online Test and a Secondary Robotics team targeting SDG 11 Traffic Control. Strong upsell candidate for full-term school tech program.",
    activities: [
      {
        id: "act_3",
        type: "WhatsApp",
        summary: "Shared Evolve 8.0 Project Track Guidelines & SDG themes PDF.",
        author: "Evolve Coordinator",
        timestamp: "2026-11-22 14:10",
      },
    ],
  },
  {
    id: "lead_1003",
    organization: "Bright Horizon International School",
    contactName: "Dr. Chinwe Eze",
    contactRole: "Head of School",
    segment: "School Partnership",
    stage: "negotiation",
    priority: "High",
    phone: "08127765430",
    email: "headofschool@brighthorizon.edu.ng",
    location: "Lekki Phase 1, Lagos",
    programInterest: "AI Literacy, Coding & Teacher Capacity Building",
    studentCount: 650,
    estimatedValueNgn: 2900000,
    assignedTo: "Senior Partnerships",
    nextFollowUp: "2026-11-24",
    createdAt: "2026-11-10",
    notes:
      "Board approved AI & Coding rollout. Reviewing final SLA terms and instructor deployment schedule for January resumption.",
    activities: [
      {
        id: "act_4",
        type: "Call",
        summary: "Finalized teacher training workshop dates for 45 staff members.",
        author: "KHLC Director",
        timestamp: "2026-11-22 16:40",
      },
    ],
  },
  {
    id: "lead_1004",
    organization: "Ogun Future Tech Foundation",
    contactName: "Engr. Segun Adeyemi",
    contactRole: "Programs Manager",
    segment: "Institutional / CSR",
    stage: "new",
    priority: "Medium",
    phone: "08056129904",
    email: "programs@ogunfuturetech.org",
    location: "Abeokuta / Ota, Ogun",
    programInterest: "Evolve 8.0 Sponsorship & 10-School STEM Grant",
    studentCount: 1500,
    estimatedValueNgn: 4500000,
    assignedTo: "Senior Partnerships",
    nextFollowUp: "2026-11-27",
    createdAt: "2026-11-22",
    notes:
      "Interested in sponsoring Evolve 8.0 prizes and co-funding robotics starter kits for 10 schools in Ogun State.",
    activities: [
      {
        id: "act_5",
        type: "Note",
        summary: "Inbound CSR enquiry received from website partner pathway.",
        author: "System",
        timestamp: "2026-11-22 09:20",
      },
    ],
  },
  {
    id: "lead_1005",
    organization: "St. Catherine Model Schools",
    contactName: "Mrs. Ngozi Okafor",
    contactRole: "ICT Coordinator",
    segment: "School Partnership",
    stage: "won",
    priority: "Medium",
    phone: "09084451290",
    email: "ict@stcatherinemodel.edu.ng",
    location: "Amuwo Odofin, Lagos",
    programInterest: "Turnkey ICT Education & Coding Club",
    studentCount: 380,
    estimatedValueNgn: 1450000,
    assignedTo: "BD Team · Lagos West",
    nextFollowUp: "2026-12-05",
    createdAt: "2026-11-02",
    notes:
      "Signed 3-term partnership agreement. Two Kingshouse instructors deployed; onboarding pupils for Evolve 8.0.",
    activities: [
      {
        id: "act_6",
        type: "Note",
        summary: "MoU signed and initial term invoice settled.",
        author: "KHLC Admin",
        timestamp: "2026-11-15 13:00",
      },
    ],
  },
  {
    id: "lead_1006",
    organization: "Mrs. Blessing Nwosu (Parent)",
    contactName: "Mrs. Blessing Nwosu",
    contactRole: "Parent (2 Children — P5 & JSS2)",
    segment: "Parent / Learner",
    stage: "new",
    priority: "Low",
    phone: "08163320918",
    email: "blessing.nwosu@gmail.com",
    location: "Amuwo Odofin, Lagos",
    programInterest: "Weekend Coding & Robotics Bootcamp",
    studentCount: 2,
    estimatedValueNgn: 180000,
    assignedTo: "Learner Admissions",
    nextFollowUp: "2026-11-25",
    createdAt: "2026-11-23",
    notes:
      "Enquired about Saturday coding & robotics classes at 2 Raji Rasaki Street centre.",
    activities: [],
  },
];

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function normalizeNigeriaWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}
