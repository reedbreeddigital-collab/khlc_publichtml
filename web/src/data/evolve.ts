export type EvolvePath = "Coding" | "AI" | "Robotics";
export type EvolveCategory = "Primary" | "Secondary";

export interface SdgTheme {
  number: number;
  sdg: string;
  title: string;
  problem: string;
  challenge: string;
}

export const evolveMeta = {
  edition: "Evolve 8.0",
  motto: "Compete. Build. Solve.",
  host: "Kingshouse Learning Centre",
  venue: "Skill Up Academy, Lagos",
  prizes: [
    { place: "1st Place", amount: "₦500,000", note: "Grand Innovation Prize" },
    { place: "2nd Place", amount: "₦200,000", note: "Runner-Up Prize" },
    { place: "3rd Place", amount: "₦100,000", note: "Third Place Prize" },
  ],
};

export const phase1Details = {
  fee: "Free for all schools",
  maxScore: "1,000 points",
  passMark: "700 (70%)",
  quotaPerLevel: "Up to 3 pupils per level per school",
  tieBreaker: "Faster completion time ranks higher",
  testWindow: "21 – 28 November 2026",
  levels: [
    {
      id: "junior",
      name: "Junior",
      classes: "Primary 4 – 6",
      description: "Foundational ICT, digital literacy & logical problem solving.",
    },
    {
      id: "intermediate",
      name: "Intermediate",
      classes: "JSS 1 – 3",
      description: "Core computing concepts, computational thinking & applied ICT.",
    },
    {
      id: "senior",
      name: "Senior",
      classes: "SS 1 – 3",
      description: "Advanced ICT, algorithmic reasoning & digital systems.",
    },
  ],
};

export const sdgThemes: SdgTheme[] = [
  {
    number: 1,
    sdg: "SDG 4",
    title: "Education",
    problem:
      "Many pupils struggle to learn because classes are crowded, learning materials are limited, and teachers cannot give every child personal attention.",
    challenge:
      "Build a solution that helps pupils learn better or helps teachers teach better.",
  },
  {
    number: 2,
    sdg: "SDG 11",
    title: "Traffic Control & Safe Roads",
    problem:
      "Heavy traffic and poor road discipline waste time, cause accidents, and put pupils and workers at risk every day.",
    challenge:
      "Build a solution that reduces congestion or makes roads safer for everyone.",
  },
  {
    number: 3,
    sdg: "SDG 3",
    title: "Health",
    problem:
      "Many people cannot easily get health information or early care, and clinics are often crowded and far away.",
    challenge:
      "Build a solution that helps people stay healthy, spot health problems early, or get care faster.",
  },
  {
    number: 4,
    sdg: "SDG 2",
    title: "Farming & Food",
    problem:
      "Farmers grow food but often struggle to reach buyers directly, lose produce after harvest, and earn too little while consumers pay high prices.",
    challenge:
      "Build a solution that connects farmers to customers, or helps farmers grow more and waste less.",
  },
  {
    number: 5,
    sdg: "SDG 1",
    title: "Zero Poverty",
    problem:
      "Many families, small traders, and young people lack steady income, money skills, and access to opportunities.",
    challenge:
      "Build a solution that helps people earn, save, manage money, or find opportunities.",
  },
];

export const projectRules = [
  "Teachers guide, pupils build — teachers may ask questions, give feedback, supervise safety, and share resources, but must not write the code, build the model, or record the video.",
  "Original work only — the idea, build, and 3-minute video must be the team's own. Any tutorial, library, or open-source code used must be credited.",
  "Primary teams (ages/grades P1–P6) may use block-based coding (e.g. Scratch or PictoBlox) and robotics kits (e.g. Arduino-based kits).",
  "Secondary teams (JSS1–SS3) may use block-based or text-based coding, microcontrollers, sensors, and AI tools or platforms.",
  "No ready-made products — kits and components are allowed, but finished purchased or downloaded products may not be entered.",
  "All 5 pupils on the school team must actively contribute to the build and appear in the final video.",
  "Safety first — all hardware must be safe and teachers must supervise electronics work at all times.",
];

export const proposalSections = [
  {
    section: "1. Team details (not counted)",
    primaryMax: "—",
    secondaryMax: "—",
    guide: "School, category, path, theme, five pupils' names and classes, supervising teacher",
  },
  {
    section: "2. The problem",
    primaryMax: "60",
    secondaryMax: "100",
    guide: "What problem will you solve, who is affected, and which SDG does it link to?",
  },
  {
    section: "3. Our solution",
    primaryMax: "90",
    secondaryMax: "150",
    guide: "What will you build and how will it help?",
  },
  {
    section: "4. How it works",
    primaryMax: "60",
    secondaryMax: "100",
    guide: "Main tools, parts, software, or AI methods you will use",
  },
  {
    section: "5. Expected impact",
    primaryMax: "30",
    secondaryMax: "50",
    guide: "Who benefits and how will you know it works?",
  },
  {
    section: "6. Plan and milestones",
    primaryMax: "60",
    secondaryMax: "100",
    guide: "3 or 4 milestones with the pupil responsible for each",
  },
];

export const videoStructure = [
  { time: "0:00 – 0:20", content: "Introduce your team, school, path, and SDG theme" },
  { time: "0:20 – 0:50", content: "State the problem clearly and why it matters" },
  { time: "0:50 – 2:00", content: "Show your project working (live demo)" },
  { time: "2:00 – 2:30", content: "Explain how you built it and what your team learned" },
  { time: "2:30 – 3:00", content: "Share the expected impact and what you would improve next" },
];

export const judgingCriteria = [
  { criterion: "Technical skill & working solution", marks: 25, detail: "The project works reliably and fits the chosen path" },
  { criterion: "Understanding of the problem & SDG link", marks: 15, detail: "A real, clearly explained problem tied to the theme" },
  { criterion: "Creativity & originality", marks: 15, detail: "A fresh idea and genuinely the team's own work" },
  { criterion: "Impact & usefulness", marks: 15, detail: "Clear beneficiaries and practical real-world value" },
  { criterion: "Teamwork & pupil ownership", marks: 10, detail: "All five pupils contributed, with teachers guiding only" },
  { criterion: "Planning & progress", marks: 10, detail: "Clear proposal and milestones followed through build" },
  { criterion: "Video presentation", marks: 10, detail: "Clear, within 3 minutes, showing the finished work" },
];

export const evolveTimeline = [
  { date: "22 Oct 2026", title: "Registration Opens", detail: "Schools, instructors, and pupils register for Phase 1 & Project Track." },
  { date: "14 Nov 2026", title: "Registration Closes", detail: "Pupil counts per level and school confirmed; finalist quotas set." },
  { date: "14 – 20 Nov 2026", title: "Test Preparation", detail: "Test links, supervision guides sent, and school test days confirmed." },
  { date: "21 – 28 Nov 2026", title: "National Online Test Window", detail: "One-week national sitting across Junior, Intermediate, and Senior levels." },
  { date: "28 Nov – 2 Dec 2026", title: "Scoring & National Rankings", detail: "Scores out of 1,000 released (700 pass mark) with national rankings." },
  { date: "Early Dec 2026", title: "Project Proposal Deadline", detail: "Schools submit their 5-pupil team proposal (Coding, AI, or Robotics)." },
  { date: "Mid-Jan 2027", title: "Instructor Proposal Feedback", detail: "Kingshouse instructors send actionable feedback to every participating school." },
  { date: "Jan – Feb 2027", title: "Team Build Period", detail: "Teams of 5 design, build, test, and document their working projects." },
  { date: "Late Feb 2027", title: "3-Minute Project Video Deadline", detail: "Final demo videos (max 3 mins) submitted showcasing finished work." },
  { date: "March 2027", title: "Video Judging & Finalists", detail: "Judges score entries out of 100 marks and select top teams for live finals." },
  { date: "2027 Finals", title: "Live Grand Finals in Lagos", detail: "Live finals for Test & Project finalists at Skill Up Academy, Lagos (250+ laptops)." },
];
