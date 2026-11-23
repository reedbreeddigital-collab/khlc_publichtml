export type EnquiryPathwayId =
  | "schools"
  | "parents"
  | "partners"
  | "instructors";

export const khlcContact = {
  brandName: "Kingshouse Learning Centre",
  shortName: "KHLC",
  tagline: "Building Tomorrow's Innovators Through Technology Education",
  brochureTagline: "Empowering Schools, Inspiring Future Innovators.",
  closingMotto: "Together, let's prepare every child to thrive in a digital world.",
  address: "2, Raji Rasaki Road, Amuwo-Odofin, Lagos",
  cityRegion: "Amuwo-Odofin, Lagos, Nigeria",
  website: "www.kingshouselearning.com",
  brochureUrl: "/Kingshouse-School-Partnership-Brochure.pdf",
  phones: [
    { display: "0913 938 6220", raw: "09139386220", href: "tel:+2349139386220" },
    { display: "0913 938 6175", raw: "09139386175", href: "tel:+2349139386175" },
  ],
  whatsappNumber: "2349139386220",
  whatsappUrl: (message?: string) =>
    `https://wa.me/2349139386220?text=${encodeURIComponent(
      message ||
        "Hello Kingshouse Learning Centre, I would like to learn more about your technology education and school partnership programs."
    )}`,
  email: "info@kingshouselearning.com",
  emailHref: "mailto:info@kingshouselearning.com",
};

export const navLinks = [
  { label: "About Us", href: "/#about" },
  { label: "For Schools", href: "/#for-schools" },
  { label: "Our Programs", href: "/#programs" },
  { label: "Evolve 8.0", href: "/evolve" },
  { label: "Projects & Impact", href: "/#projects" },
  { label: "Resources", href: "/#resources" },
  { label: "Contact Us", href: "/#contact" },
];

export const impactStats = [
  {
    value: "300+",
    label: "Partner Schools",
    detail: "Nursery, primary & secondary schools powered across Lagos & beyond",
  },
  {
    value: "50,000+",
    label: "Learners Reached",
    detail: "Students trained in Digital Literacy, Coding, Robotics & AI",
  },
  {
    value: "65+",
    label: "Certified Instructors",
    detail: "Qualified technology educators deployed & supervised",
  },
  {
    value: "Evolve 8.0",
    label: "ICT Competition",
    detail: "National online test + Coding, AI & Robotics project track",
  },
];

export const approachSteps = [
  {
    step: "01",
    title: "Learn",
    detail: "Age-appropriate digital, coding, robotics & AI concepts.",
  },
  {
    step: "02",
    title: "Practice",
    detail: "Guided hands-on lab sessions, exercises & real-world challenges.",
  },
  {
    step: "03",
    title: "Build",
    detail: "Students design working websites, games, apps & robotics prototypes.",
  },
  {
    step: "04",
    title: "Present",
    detail: "Showcase projects at school demo days, exhibitions & Evolve ICT.",
  },
];

export const partnershipModel = {
  khlcProvides: [
    "Professional ICT, Coding, Robotics and AI Instructors",
    "Curriculum and Lesson Plans",
    "Practical Learning Resources",
    "Student Assessments",
    "Project-Based Learning Activities",
    "End-of-Term Reports",
    "Instructor Supervision and Quality Assurance",
    "Teacher Support and Capacity Building",
  ],
  schoolProvides: [
    "A conducive learning environment",
    "Computer laboratory or ICT-enabled classroom",
    "Student enrollment for the program",
    "Timetable integration and administrative support",
  ],
};

export const expectedOutcomes = {
  studentsWill: [
    "Develop computational thinking and creativity.",
    "Build confidence in technology and innovation.",
    "Design digital projects, games, websites and simple applications.",
    "Acquire future-ready skills relevant to higher education and emerging careers.",
    "Strengthen collaboration, communication and problem-solving abilities.",
  ],
  schoolsWill: [
    "Enhance their academic profile.",
    "Increase parent satisfaction and learner engagement.",
    "Differentiate themselves with a premium technology program.",
    "Position themselves as future-ready institutions.",
  ],
};

export const ciscoAffiliation = {
  eyebrow: "GLOBAL ECOSYSTEM CREDIBILITY",
  title: "Our Cisco Networking Academy Affiliation",
  overview:
    "Kingshouse Learning Centre is a Cisco Networking Academy organization, giving KHLC and our partner schools access to Cisco Networking Academy's globally recognized skills-to-jobs technology education ecosystem.",
  domains: [
    "Networking",
    "Cybersecurity",
    "Artificial Intelligence",
    "Programming",
    "Data Science",
    "Digital Literacy",
  ],
  schoolBenefits: [
    "Industry-aligned technology curriculum",
    "Practical and interactive learning experiences",
    "Technology-focused learning resources",
    "Enrolled students receive Cisco-endorsed certifications, opening doors to global opportunities",
  ],
};

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
      "Turnkey technology education partnerships for Nursery, Primary, and Secondary schools—without the burden of curriculum design, hiring, or managing programs alone.",
    highlights: [
      "Integrated into timetables, clubs or holiday programs",
      "Deployed ICT, Coding, Robotics & AI instructors",
      "Cisco Networking Academy ecosystem & termly QA",
    ],
    ctaLabel: "Request School Proposal",
    accent: "#3b00b3",
  },
  {
    id: "parents",
    badge: "Nursery – SS3",
    title: "Parents & Learners",
    description:
      "Hands-on after-school clubs, weekend academies, and holiday tech bootcamps where children move from screen consumers to creators, innovators, and problem-solvers.",
    highlights: [
      "Scratch, Python, HTML/CSS, Arduino & Raspberry Pi",
      "Portfolio projects, exhibitions & Evolve 8.0 prep",
      "Safe, structured mentorship for young learners",
    ],
    ctaLabel: "Enquire for Your Child",
    accent: "#0099cc",
  },
  {
    id: "parents",
    badge: "Career & Digital Skills",
    title: "Individuals",
    description:
      "Practical, instructor-led training tracks aligned with global industry standards—equipping young adults and professionals with career-ready digital skills.",
    highlights: [
      "Networking, Cybersecurity & Digital Literacy",
      "Web development, Python & Applied AI",
      "Cisco-endorsed certification pathways",
    ],
    ctaLabel: "Explore Skill Tracks",
    accent: "#10b981",
  },
  {
    id: "partners",
    badge: "CSR & Institutions",
    title: "Institutional Partners",
    description:
      "Collaborate with Kingshouse to sponsor competitions like Evolve 8.0, equip school ICT & robotics labs, and scale youth digital inclusion initiatives.",
    highlights: [
      "Evolve 8.0 ICT Competition sponsorship",
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
    id: "digital-literacy",
    tag: "01 · Digital Literacy",
    audience: "Nursery, Primary & Secondary",
    delivery: "Timetable & Lab Sessions",
    title: "Digital Literacy & ICT Education",
    description:
      "Building strong foundational technology skills that students can use confidently in school and everyday life—covering computer fundamentals, Microsoft Office, and internet research.",
    outcomes: [
      "Computer fundamentals & Microsoft Office",
      "Internet research & information literacy",
    ],
    image: "/images/hero-laptop-focus.webp",
    filterGroup: "For Schools",
    pathway: "schools",
  },
  {
    id: "coding-programming",
    tag: "02 · Coding & Programming",
    audience: "Primary & Secondary",
    delivery: "Timetable, Clubs & Bootcamps",
    title: "Coding & Programming",
    description:
      "Introducing students to computational thinking and programming through age-appropriate, practical learning—building games, websites, and real applications.",
    outcomes: [
      "Scratch block-based & HTML, CSS, Java",
      "Python fundamentals for appropriate ages",
    ],
    image: "/images/hero-mentorship.webp",
    filterGroup: "Coding & STEM",
    pathway: "parents",
  },
  {
    id: "robotics-stem",
    tag: "03 · Robotics (STEM)",
    audience: "Primary, Secondary & Clubs",
    delivery: "Hands-On Lab Kits",
    title: "Robotics (STEM) & Electronics",
    description:
      "A hands-on program combining technology, engineering, creativity, and problem-solving through real sensors, circuits, and physical STEM prototypes.",
    outcomes: [
      "Sensors, basic electronics & STEM projects",
      "mBlock, PictoBlox, Arduino & Raspberry Pi",
    ],
    image: "/images/program-robotics.webp",
    filterGroup: "Coding & STEM",
    pathway: "schools",
  },
  {
    id: "artificial-intelligence",
    tag: "04 · Future-Ready AI",
    audience: "Upper Primary, Secondary & Youth",
    delivery: "Guided Practical Labs",
    title: "Artificial Intelligence (AI) & Data",
    description:
      "Age-appropriate AI literacy and Cisco-aligned data concepts—teaching responsible AI usage, smart problem-solving, and guided classroom AI project builds.",
    outcomes: [
      "Responsible AI fluency & data thinking",
      "Cisco Networking Academy aligned track",
    ],
    image: "/images/program-ai.webp",
    filterGroup: "Coding & STEM",
    pathway: "schools",
  },
  {
    id: "teacher-training",
    tag: "05 · Educator Capacity",
    audience: "Internal ICT & STEM Teams",
    delivery: "Workshops & Termly Support",
    title: "Teacher Support & Capacity Building",
    description:
      "Strengthening the capacity of your school's internal ICT and STEM faculty with modern teaching tools, lesson planning support, and practical EdTech workshops.",
    outcomes: [
      "Internal ICT & STEM team upskilling",
      "Ongoing pedagogical & assessment coaching",
    ],
    image: "/images/program-teachers.webp",
    filterGroup: "Educator Training",
    pathway: "schools",
  },
  {
    id: "school-tech-programs",
    tag: "06 · Turnkey B2B Solution",
    audience: "Nursery, Primary & Secondary Schools",
    delivery: "Full-Term Managed Partnership",
    title: "School Technology Partnerships",
    description:
      "Flexible delivery integrated into your school timetable, clubs, extracurriculars, holiday programs, or dedicated tech periods—with full instructor supervision, QA, and end-of-term reports.",
    outcomes: [
      "Instructors, lesson plans & end-of-term reports",
      "Zero recruitment or curriculum burden",
    ],
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
    title: "Evolve 8.0 ICT Competition",
    summary:
      "Our annual inter-school technology programme combining a Free National Online Test with a Coding, AI & Robotics Project Track—culminating in live finals in Lagos.",
    metric: "₦500K / ₦200K / ₦100K Prizes",
    image: "/images/evolve-award.webp",
  },
  {
    id: "school-engagements",
    badge: "On-Campus Delivery",
    title: "Partner School ICT Engagements",
    summary:
      "Weekly structured classroom instruction, practical lab assessments, and dedicated STEM clubs delivered seamlessly across Nursery, Primary, and Secondary schools.",
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
      "End-of-term exhibitions and certification ceremonies where learners present working websites, games, robotics prototypes, and AI projects live to parents and school directors.",
    metric: "Learn → Practice → Build → Present",
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
      "Beyond teaching our students coding, robotics, and practical computing, Kingshouse strengthened our internal ICT faculty with modern digital tools and assessments. Their supervision and end-of-term reporting make collaboration effortless.",
    image: "/images/testimonial-educator.webp",
  },
  {
    id: 3,
    stakeholder: "Parent",
    name: "Mrs. Blessing Nwosu",
    role: "Parent of Evolve ICT Finalist",
    organization: "Amuwo-Odofin, Lagos",
    quote:
      "Before joining Kingshouse's technology program, my children only used devices for cartoons and games. Watching my daughter confidently present her coding project on stage at the Evolve ICT Competition gave our entire family immense pride.",
    image: "/images/testimonial-parent.webp",
  },
  {
    id: 4,
    stakeholder: "Student Learner",
    name: "Tobi & Evolve Finalists",
    role: "Junior Innovators & Competition Winners",
    organization: "Evolve ICT Competition",
    quote:
      "Our Kingshouse instructors make Scratch, Python, and Arduino robotics so practical and fun. Preparing for Evolve ICT taught us teamwork, fast problem-solving on laptops, and how to turn our ideas into working projects.",
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
    date: "Evolve 8.0 Spotlight",
    readTime: "4 min read",
    title: "Inside the Evolve ICT Competition: Raising Lagos's Next Young Innovators",
    excerpt:
      "How partner schools, educators, and corporate sponsors come together to celebrate practical digital competence, coding excellence, and student innovation.",
    image: "/images/evolve-award.webp",
    highlights: [
      "Free National Online Test plus Coding, AI & Robotics Project Track",
      "₦500,000, ₦200,000 & ₦100,000 prizes at live finals in Lagos",
      "Strong collaboration between school leadership, parents, and industry partners",
    ],
    body: [
      "The Evolve ICT Competition was created by Kingshouse Learning Centre to move technology education beyond rote classroom theory into real-world demonstration.",
      "Now expanded into Evolve 8.0, schools participate in a Free National Online General Test alongside a 5-pupil Coding, AI, or Robotics Project Track tackling real UN SDG challenges.",
      "Schools interested in preparing their pupils for Evolve 8.0 can register directly on our /evolve page or partner with Kingshouse for year-round curriculum delivery.",
    ],
  },
  {
    id: 2,
    category: "For School Leaders",
    date: "Partnership Guide",
    readTime: "5 min read",
    title: "How Schools Can Integrate Coding, Robotics & AI Without Recruiting Overhead",
    excerpt:
      "A practical roadmap for proprietors and principals looking to upgrade outdated computer classes into a structured, parent-attracting STEM & Cisco-aligned program.",
    image: "/images/article-curriculum.webp",
    highlights: [
      "KHLC provides instructors, lesson plans, assessments, QA & end-of-term reports",
      "Flexible delivery across school timetables, clubs, and holiday programs",
      "Cisco Networking Academy affiliation bringing globally endorsed student certifications",
    ],
    body: [
      "Technology is no longer an optional addition to education. Today's parents evaluate schools on how effectively they prepare children for an increasingly technology-driven world.",
      "Yet many schools face recurring hurdles: high ICT teacher turnover, outdated textbook-only syllabi, and underutilized computer labs. Kingshouse solves this through a managed School Technology Partnership.",
      "From Nursery through Secondary level, our Learn → Practice → Build → Present framework gives schools a premium technology edge without the burden of building or managing the program alone.",
    ],
  },
  {
    id: 3,
    category: "Educator Insights",
    date: "Teacher Development",
    readTime: "4 min read",
    title: "Empowering Teachers for the Digital Classroom: Practical EdTech Shifts",
    excerpt:
      "Technology amplifies great teaching when educators feel supported. Discover how structured capacity building strengthens your internal ICT and STEM teams.",
    image: "/images/article-teachers.webp",
    highlights: [
      "Strengthening internal school ICT & STEM teams through guided coaching",
      "Transitioning smoothly from theory-heavy classes to project-based learning",
      "Building faculty confidence through hands-on workshops and practical resources",
    ],
    body: [
      "Sustainable EdTech transformation inside any school begins with empowering its teachers. Hardware and software alone never transform outcomes without confident educators leading the room.",
      "Kingshouse's Teacher Support & Capacity Building workshops focus on immediately usable skills—interactive digital delivery, project supervision, and structured student assessments.",
      "Download our School Partnership Brochure or book a consultation to design a custom capacity-building plan for your faculty.",
    ],
  },
];
