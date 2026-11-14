export const site = {
  name: "EazziMe Technologies Inc.",
  tagline: "Turning Your Ideas into Innovative Technology Solutions.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://eazzime.example",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@eazzime.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "431-557-1227",
  address:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS ||
    "11 Grey Heron Drive, Winnipeg, Manitoba, R3X 0R3, Canada",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
};
export const services = [
  {
    slug: "custom-software",
    title: "Custom Software Development",
    short: "Software built around your business.",
    icon: "code",
    description:
      "Purpose-built web and mobile applications that turn complex requirements into intuitive, dependable experiences.",
    benefits: [
      "Workflows shaped around your team",
      "Accessible web and mobile experiences",
      "An architecture that can grow with you",
    ],
  },
  {
    slug: "enterprise-applications",
    title: "Enterprise Application Development",
    short: "Connect people, processes, and platforms.",
    icon: "layers",
    description:
      "Bring your core operations together with enterprise applications designed for your processes, permissions, and scale.",
    benefits: [
      "Shared information across departments",
      "Clear roles and access controls",
      "Maintainable systems for long-term use",
    ],
  },
  {
    slug: "ai-automation",
    title: "AI Solutions & Intelligent Automation",
    short: "Make intelligence part of everyday work.",
    icon: "sparkles",
    description:
      "Put AI to work where it matters, from document processing and knowledge search to assisted decisions and repetitive tasks.",
    benefits: [
      "Less time spent on manual tasks",
      "Human oversight built into workflows",
      "Practical evaluation before rollout",
    ],
  },
  {
    slug: "data-engineering",
    title: "Data Engineering",
    short: "Clean, connected data. Meaningful insights.",
    icon: "database",
    description:
      "From data conversion, cleansing, mapping, and migration to data warehousing, insights, and analytics, we help make your business data accurate, consistent, and useful.",
    details:
      "Our experience covers converting data between formats, cleansing inconsistent records, mapping source data to target systems, and migrating data between platforms. We bring information together in data warehouses and turn it into practical reporting, insights, and analytics. Whether you are replacing a system or consolidating business information, we focus on data quality, validation, and making the results useful to your team.",
    benefits: [
      "Cleaner, more consistent records for everyday operations",
      "Clear data mapping and validated conversion and migration",
      "Consolidated data warehouses for reporting and analysis",
      "Practical insights to support informed business decisions",
    ],
  },
  {
    slug: "product-design",
    title: "UI/UX Design & Product Development",
    short: "Thoughtful design. Useful products.",
    icon: "pen",
    description:
      "Move from an early idea to a validated product through research, prototyping, and accessible interface design.",
    benefits: [
      "Clearer journeys for your users",
      "Test ideas before major investment",
      "A consistent, reusable design system",
    ],
  },
  {
    slug: "systems-integration",
    title: "Systems Integration & APIs",
    short: "Help your systems work together.",
    icon: "network",
    description:
      "Connect applications and data through reliable APIs and integrations that make information flow across your business.",
    benefits: [
      "Fewer disconnected tools",
      "Less duplicate data entry",
      "Observable, documented integrations",
    ],
  },
  {
    slug: "business-automation",
    title: "Business Process Automation",
    short: "Give your people time for better work.",
    icon: "workflow",
    description:
      "Simplify approvals, handoffs, and repeatable operations with automation designed around the way your team works.",
    benefits: [
      "Consistent processes and ownership",
      "Fewer repetitive administrative steps",
      "Visibility into exceptions and bottlenecks",
    ],
  },
  {
    slug: "digital-transformation",
    title: "IT Consulting & Digital Transformation",
    short: "A clear path from ambition to action.",
    icon: "compass",
    description:
      "Make informed technology decisions with a practical assessment of your systems, opportunities, and delivery priorities.",
    benefits: [
      "A roadmap tied to business priorities",
      "Technology choices with clear trade-offs",
      "A realistic approach to change",
    ],
  },
  {
    slug: "managed-support",
    title: "Application Maintenance & Managed Support",
    short: "Keep your technology moving forward.",
    icon: "shield",
    description:
      "Keep applications useful and dependable through structured maintenance, monitoring, issue resolution, and continuous improvement.",
    benefits: [
      "Planned updates and maintenance",
      "Clear incident and escalation processes",
      "Ongoing performance improvements",
    ],
  },
  {
    slug: "data-analytics",
    title: "Data Analytics & Business Intelligence",
    short: "Turn information into a clearer direction.",
    icon: "chart",
    description:
      "Bring data together in practical dashboards and reporting tools that help teams understand performance and make informed decisions.",
    benefits: [
      "A shared view of business information",
      "Reporting built around real decisions",
      "Better visibility into data quality",
    ],
  },
];
export const industries = [
  [
    "Financial Services",
    "Connected platforms for customer onboarding, reporting, and secure operations.",
    "landmark",
  ],
  [
    "Fintech",
    "Build payment experiences, digital products, and the integrations behind them.",
    "wallet",
  ],
  [
    "Retail & E-commerce",
    "Connect storefronts, inventory, orders, and customer experiences.",
    "shopping",
  ],
  [
    "Logistics",
    "Bring clarity to dispatch, shipment tracking, and operational workflows.",
    "truck",
  ],
  [
    "Real Estate",
    "Simplify property discovery, portfolio management, and tenant interactions.",
    "building",
  ],
  [
    "Hospitality",
    "Create smoother booking, guest service, and back-office experiences.",
    "hotel",
  ],
  [
    "Professional Services",
    "Keep clients, projects, knowledge, and business processes connected.",
    "briefcase",
  ],
];
export const solutions = [
  {
    slug: "rentsure",
    title: "RentSure",
    category: "Real Estate & PropTech",
    description:
      "A rental-profile and rent-score platform helping tenants present their rental history and property owners review applications in Nigeria.",
    type: "rentsure",
    projectUrl: "https://rentsureng.com",
    projectHeadline: "Clearer rental profiles. Better-informed conversations.",
    projectDetails:
      "Developed by EazziMe Technologies Inc., RentSure brings tenants, landlords, and property agents into a shared rental-information platform. Tenants organize their profile and supporting records, while property teams review rental history and rent-score information to support their assessment.",
    features: [
      "Tenant profiles with identity and supporting rental information",
      "Rent-score summaries alongside rental history and profile indicators",
      "Views for landlords and agents to review applicant information",
      "Rental records, reminders, and proof of rent in one place",
    ],
    tags: ["PropTech", "Rental profiles", "Rent scoring"],
  },
  {
    slug: "operations-workspace",
    title: "ChaufX",
    category: "Fintech App",
    description:
      "A personal-driver platform connecting customers with professional drivers for journeys in their own vehicles.",
    type: "chaufx",
    projectUrl: "https://chaufx.ca",
    projectHeadline: "Connecting customers, drivers, and everyday journeys.",
    projectDetails:
      "Developed by EazziMe Technologies Inc., ChaufX brings customer booking, driver onboarding, and trip management into a connected platform. Customers arrange a driver for their own vehicle, while dedicated customer and driver apps support each side of the journey.",
    features: [
      "Trip booking with pickup, destination, and preferred time",
      "Driver applications with document uploads and review status",
      "Customer and driver apps for managing and accepting trips",
      "Driver earnings tracking and role-based account access",
    ],
    tags: ["Mobile apps", "Online booking", "Driver platform"],
  },
  {
    slug: "intelligent-knowledge",
    title: "EazziHotech",
    category: "Hospitality",
    description:
      "A hospitality operations platform bringing bookings, guest records, and payment tracking together for hotels, shortlets, and serviced apartments.",
    type: "hotech",
    projectUrl: "https://www.eazzihotech.com",
    projectHeadline: "Connected operations. A better guest experience.",
    projectDetails:
      "Developed by EazziMe Technologies Inc., EazziHotech helps hospitality teams manage the guest journey from booking through check-out. Operators can organize multiple properties and units in one workspace, with separate tenant data and role-based access for administrators, managers, and staff.",
    features: [
      "Booking, check-in, and check-out workflows",
      "Guest profiles, identity records, and stay history",
      "Payment, outstanding balance, damage, and settlement tracking",
      "Multi-property management with role-based staff access",
      "Guest email notifications for key stages of a stay",
    ],
    tags: ["Hospitality", "Property management", "Guest operations"],
  },
  {
    slug: "connected-commerce",
    title: "EazziBulkBuy.ca",
    category: "Retail & commerce",
    description:
      "A bulk food and produce platform that helps customers shop community sales, choose quantities, and place orders online.",
    type: "commerce",
    projectUrl: "https://eazzibulkbuy.ca",
    projectHeadline: "Making bulk produce buying simpler.",
    projectDetails:
      "Built by EazziMe Technologies Inc., EazziBulkBuy connects customers with bulk food and produce sales. The platform brings active sales events, product selection, and online ordering together in one place for communities in Manitoba.",
    features: [
      "Active bulk sales with product details and quantity selection",
      "Normal sales and discounted bundle offers",
      "Checkout options for Interac e-Transfer and card payments",
      "Order confirmation and pickup instructions by email",
    ],
    tags: ["E-commerce", "Bulk ordering", "Food & produce"],
  },
];
export const steps = [
  [
    "Discover",
    "Understand your goals, your people, and the problem worth solving.",
  ],
  [
    "Define",
    "Agree on the roadmap, design the experience, and make the technical choices clear.",
  ],
  [
    "Build",
    "Deliver in focused iterations, with working software and regular feedback.",
  ],
  [
    "Evolve",
    "Launch with care, support your team, and improve as your business grows.",
  ],
];
