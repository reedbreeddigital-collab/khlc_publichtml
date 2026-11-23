export type EnquiryPathwayId =
  | "schools"
  | "parents"
  | "partners"
  | "instructors";

export const khlcContact = {
  brandName: "Kingshouse Learning Centre",
  shortName: "KHLC",
  tagline: "Building Tomorrow's Innovators Through Technology Education",
  address: "2 Raji Rasaki Street, Amuwo Odofin, Lagos",
  cityRegion: "Amuwo Odofin, Lagos, Nigeria",
  phones: [
    { display: "0811 891 9576", raw: "08118919576", href: "tel:+2348118919576" },
    { display: "0913 938 6219", raw: "09139386219", href: "tel:+2349139386219" },
  ],
  whatsappNumber: "2348118919576",
  whatsappUrl: (message?: string) =>
    `https://wa.me/2348118919576?text=${encodeURIComponent(
      message ||
        "Hello Kingshouse Learning Centre, I would like to learn more about your technology education and school partnership programs."
    )}`,
  email: "info@kinghouselearning.com",
  emailHref: "mailto:info@kinghouselearning.com",
};

export const navLinks = [
  { label: "About Us", href: "#about" },
  { label: "For Schools", href: "#for-schools" },
  { label: "Our Programs", href: "#programs" },
  { label: "Projects & Impact", href: "#projects" },
  { label: "Resources", href: "#resources" },
  { label: "Contact Us", href: "#contact" },
];

export const impactStats = [
  {
    value: "300+",
    label: "Partner Schools",
    detail: "Primary & secondary schools powered across Lagos & beyond",
  },
  {
    value: "50,000+",
    label: "Learners Reached",
    detail: "Students trained in ICT, Coding, Robotics & AI",
  },
  {
    value: "65+",
    label: "Certified Instructors",
    detail: "Vetted technology educators deployed & mentored",
  },
  {
    value: "Evolve 2.0",
    label: "ICT Competition",
    detail: "Flagship inter-school innovation & digital showcase",
  },
];

export interface AudienceSegment {
  id: EnquiryPathwayId;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  accent: string;
}

export const audienceSegments: AudienceSegment[] = [
  {
    id: "schools",
    badge: "B2B Partnership",
    title: "For Schools",
    description:
      "Turnkey ICT, Coding, Robotics, and AI integration with vetted instructors, structured termly curricula, assessments, and inter-school competition readiness.",
    highlights: [
      "Deployed certified ICT & STEM instructors",
      "Age-graded practical termly syllabus",
      "Termly CBT assessments & progress reports",
    ],
    ctaLabel: "Request School Proposal",
    accent: "#3b00b3",
  },
  {
    id: "parents",
    badge: "K–12 Learners",
    title: "Parents & Learners",
    description:
      "Hands-on after-school clubs, weekend academies, and holiday tech bootcamps where children move from passive screen consumers to confident builders.",
    highlights: [
      "Coding, robotics kits & AI literacy projects",
      "Portfolio showcase & demo days for parents",
      "Safe, structured mentorship for ages 6–17",
    ],
    ctaLabel: "Enquire for Your Child",
    accent: "#0099cc",
  },
  {
    id: "parents",
    badge: "Career & Digital Skills",
    title: "Individuals",
    description:
      "Practical, instructor-led training tracks designed for young adults, educators, and professionals building in-demand digital productivity and software skills.",
    highlights: [
      "Web development, Python & data literacy",
      "Applied AI & digital workplace tools",
      "Project-based certification & mentorship",
    ],
    ctaLabel: "Explore Skill Tracks",
    accent: "#10b981",
  },
  {
    id: "partners",
    badge: "CSR & Institutions",
    title: "Institutional Partners",
    description:
      "Collaborate with Kingshouse to sponsor competitions like Evolve ICT, equip school tech labs, and scale youth digital inclusion initiatives.",
    highlights: [
      "Evolve ICT Competition sponsorship",
      "Community STEM & school lab initiatives",
      "Transparent impact reporting & visibility",
    ],
    ctaLabel: "Discuss Collaboration",
    accent: "#e11d74",
  },
];

export interface ProgramItem {
  id: string;
  tag: string;
  audience: string;
  delivery: string;
  title: string;
  description: string;
  outcomes: string[];
  image: string;
  filterGroup: "For Schools" | "Coding & STEM" | "Educator Training";
  pathway: EnquiryPathwayId;
}

export const programs: ProgramItem[] = [
  {
    id: "ict-education",
    tag: "Core Curriculum",
    audience: "Primary & Secondary Schools",
    delivery: "On-Campus Termly",
    title: "ICT Education & Digital Literacy",
    description:
      "A structured, exam-aligned ICT curriculum equipping pupils with practical computing fundamentals, productivity suites, digital citizenship, and CBT readiness.",
    outcomes: ["Structured termly lesson plans", "Hands-on computer lab sessions"],
    image: "/images/hero-laptop-focus.webp",
    filterGroup: "For Schools",
    pathway: "schools",
  },
  {
    id: "coding",
    tag: "Software Building",
    audience: "Ages 7–18 & Beginners",
    delivery: "School Clubs & Bootcamps",
    title: "Coding & Software Development",
    description:
      "Step-by-step computational thinking and programming pathways—from Scratch and interactive animations to Python, HTML/CSS, JavaScript, and web apps.",
    outcomes: ["Real student-built web & app projects", "Logic & problem-solving mastery"],
    image: "/images/hero-mentorship.webp",
    filterGroup: "Coding & STEM",
    pathway: "parents",
  },
  {
    id: "robotics",
    tag: "Hands-On Engineering",
    audience: "Primary, Secondary & Tech Clubs",
    delivery: "Lab Kits & Workshops",
    title: "Robotics & Embedded Systems",
    description:
      "Practical electronics, microcontrollers, sensors, and autonomous robot building that turn science and mathematics into exciting real-world engineering.",
    outcomes: ["Physical prototype builds every term", "Teamwork & design thinking"],
    image: "/images/program-robotics.webp",
    filterGroup: "Coding & STEM",
    pathway: "schools",
  },
  {
    id: "artificial-intelligence",
    tag: "Future-Ready Track",
    audience: "Upper Primary, Secondary & Youth",
    delivery: "Guided Practical Labs",
    title: "Artificial Intelligence (AI) Literacy",
    description:
      "Age-appropriate foundations in how AI works, ethical technology use, smart prompting, data patterns, and building mini AI-powered classroom projects.",
    outcomes: ["Responsible & creative AI fluency", "Applied machine learning demos"],
    image: "/images/program-ai.webp",
    filterGroup: "Coding & STEM",
    pathway: "schools",
  },
  {
    id: "teacher-training",
    tag: "Educator Upskilling",
    audience: "School Teachers & HODs",
    delivery: "Workshops & Termly Coaching",
    title: "Teacher Training & Capacity Building",
    description:
      "Targeted professional development empowering classroom teachers to integrate digital tools, interactive presentations, AI teaching assistants, and CBT assessments.",
    outcomes: ["Practical digital classroom mastery", "Ongoing instructor coaching"],
    image: "/images/program-teachers.webp",
    filterGroup: "Educator Training",
    pathway: "schools",
  },
  {
    id: "school-tech-programs",
    tag: "Turnkey B2B Solution",
    audience: "Proprietors & School Boards",
    delivery: "Full-Term Partnership",
    title: "School Technology Programs",
    description:
      "Complete end-to-end management of your school's ICT & STEM department: instructor recruitment and supervision, syllabus delivery, lab advisory, and event representation.",
    outcomes: ["Zero teacher turnover disruption", "Boosted parent trust & enrollment"],
    image: "/images/program-schools.webp",
    filterGroup: "For Schools",
    pathway: "schools",
  },
];

export interface ProjectEventItem {
  id: string;
  badge: string;
  title: string;
  summary: string;
  metric: string;
  image: string;
}

export const projectsAndEvents: ProjectEventItem[] = [
  {
    id: "evolve-ict",
    badge: "Flagship Competition",
    title: "Evolve ICT Competition",
    summary:
      "Our annual inter-school technology challenge bringing together young innovators from partner schools to compete in live ICT, coding, and problem-solving tasks for scholarships and cash prizes.",
    metric: "₦200K+ Grand Prizes & Scholarships",
    image: "/images/evolve-award.webp",
  },
  {
    id: "school-engagements",
    badge: "On-Campus Delivery",
    title: "Partner School ICT Engagements",
    summary:
      "Weekly structured classroom instruction, practical lab assessments, and dedicated STEM clubs delivered seamlessly across primary and secondary schools in Lagos.",
    metric: "Weekly Termly Lab Sessions",
    image: "/images/project-school-delegation.webp",
  },
  {
    id: "teacher-development",
    badge: "Educator Clinics",
    title: "Teacher Development Workshops",
    summary:
      "Interactive faculty workshops equipping school educators with digital lesson planning, EdTech classroom workflows, and modern student assessment techniques.",
    metric: "Hands-On Faculty Upskilling",
    image: "/images/program-teachers.webp",
  },
  {
    id: "tech-exhibitions",
    badge: "Student Showcases",
    title: "Technology Exhibitions & Demo Days",
    summary:
      "End-of-term exhibitions and certification ceremonies where learners present working websites, robotics prototypes, and tech projects live to parents and school directors.",
    metric: "Certified Project Showcases",
    image: "/images/about-certificate.webp",
  },
];

export interface TestimonialItem {
  id: number;
  stakeholder: "School Proprietor" | "Partner Teacher" | "Parent" | "Student Learner";
  name: string;
  role: string;
  organization: string;
  quote: string;
  image: string;
}

export const testimonials: TestimonialItem[] = [
  {
    id: 1,
    stakeholder: "School Proprietor",
    name: "Mrs. Adeola Ogunleye",
    role: "Proprietress & School Director",
    organization: "Partner Primary & Secondary School, Lagos",
    quote:
      "Partnering with Kingshouse Learning Centre completely elevated our ICT department. Their instructors arrive prepared with a structured curriculum, our pupils build real digital projects every term, and parents now cite our tech program as a key reason they enroll with us.",
    image: "/images/testimonial-proprietor.webp",
  },
  {
    id: 2,
    stakeholder: "Partner Teacher",
    name: "Mr. Chukwudi Okafor",
    role: "Head of Academics & ICT Coordinator",
    organization: "Evolve ICT Partner School",
    quote:
      "Beyond teaching our students coding and practical computing, Kingshouse trained our faculty on digital classroom tools and CBT readiness. Their structured supervision and termly assessments make collaboration effortless for school leadership.",
    image: "/images/testimonial-educator.webp",
  },
  {
    id: 3,
    stakeholder: "Parent",
    name: "Mrs. Blessing Nwosu",
    role: "Parent of Evolve ICT Finalist",
    organization: "Amuwo Odofin, Lagos",
    quote:
      "Before joining Kingshouse's technology program, my children only used devices for cartoons and games. Watching my daughter confidently present her coding project on stage at the Evolve ICT Competition gave our entire family immense pride.",
    image: "/images/testimonial-parent.webp",
  },
  {
    id: 4,
    stakeholder: "Student Learner",
    name: "Tobi & Evolve Finalists",
    role: "Junior Innovators & Competition Winners",
    organization: "Evolve 2.0 ICT Competition",
    quote:
      "Our Kingshouse instructors make coding and robotics so practical and fun. Preparing for Evolve ICT taught us teamwork, fast problem-solving on laptops, and how to turn our ideas into working projects.",
    image: "/images/hero-student-joy.webp",
  },
];

export interface ResourceArticle {
  id: number;
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  image: string;
  highlights: string[];
  body: string[];
}

export const resourceArticles: ResourceArticle[] = [
  {
    id: 1,
    category: "Event Recap",
    date: "Evolve 2.0 Highlights",
    readTime: "4 min read",
    title: "Inside the Evolve ICT Competition: Raising Lagos's Next Young Innovators",
    excerpt:
      "How dozens of partner schools, educators, and corporate sponsors came together to celebrate practical digital competence, coding excellence, and student innovation.",
    image: "/images/evolve-award.webp",
    highlights: [
      "Live laptop-based ICT & problem-solving challenges across participating schools",
      "Cash prizes, scholarships, and official certificates awarded to top young innovators",
      "Strong collaboration between school leadership, parents, and industry partners",
    ],
    body: [
      "The Evolve ICT Competition was created by Kingshouse Learning Centre to move technology education beyond rote classroom theory into real-world demonstration.",
      "Across intense live rounds, primary and secondary students tackled practical computing, logical thinking, and digital creation tasks under real-time mentorship—proving what Nigerian learners achieve when given structured guidance.",
      "Schools interested in preparing their pupils for the next edition of Evolve ICT can partner with Kingshouse for year-round curriculum delivery and competition coaching.",
    ],
  },
  {
    id: 2,
    category: "For School Leaders",
    date: "Curriculum Guide",
    readTime: "5 min read",
    title: "How Schools Can Integrate Coding, Robotics & AI Without Recruiting Overhead",
    excerpt:
      "A practical roadmap for proprietors and principals looking to upgrade outdated computer classes into a structured, parent-attracting STEM & EdTech program.",
    image: "/images/article-curriculum.webp",
    highlights: [
      "Why ad-hoc computer teachers struggle to maintain modern Coding & Robotics standards",
      "How turnkey school partnerships deliver vetted instructors and termly quality audits",
      "Aligning ICT, Coding, Robotics, and AI literacy across Primary 1 to SS3",
    ],
    body: [
      "Today's parents evaluate schools not only on traditional exam scores, but on how effectively they prepare children for an AI-driven global economy.",
      "Yet many schools face recurring hurdles: high ICT teacher turnover, outdated textbook-only syllabi, and underutilized computer labs. Kingshouse solves this through a managed School Technology Program.",
      "From onboarding certified instructors to running termly assessments and parent-facing demo days, our model gives schools an immediate competitive advantage with predictable termly planning.",
    ],
  },
  {
    id: 3,
    category: "Educator Insights",
    date: "Teacher Development",
    readTime: "4 min read",
    title: "Empowering Teachers for the Digital Classroom: 4 Practical EdTech Shifts",
    excerpt:
      "Technology amplifies great teaching when educators feel supported. Discover how structured capacity building boosts classroom engagement and assessment speed.",
    image: "/images/article-teachers.webp",
    highlights: [
      "Transitioning smoothly from paper-heavy grading to structured CBT assessments",
      "Using interactive digital slides and visual demos to deepen student retention",
      "Building faculty confidence through hands-on peer workshops rather than theory",
    ],
    body: [
      "Sustainable EdTech transformation inside any school begins with empowering its teachers. Hardware and software alone never transform outcomes without confident educators leading the room.",
      "Kingshouse's Teacher Training workshops focus on immediately usable skills—interactive lesson delivery, digital assessment preparation, and responsible AI tools that save teachers hours every week.",
      "Book a bespoke half-day or termly Teacher Development Clinic at your school campus with our training facilitators.",
    ],
  },
];
