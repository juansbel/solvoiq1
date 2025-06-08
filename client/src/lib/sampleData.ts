// Commission rates in Colombian Pesos (COP)
export const COP_PER_TEAM_MEMBER = 500000; // 500,000 COP per team member
export const COP_PERFORMANCE_BONUS = 200000; // 200,000 COP per performance achievement
export const COP_NEW_POSITION_BONUS = 300000; // 300,000 COP per new position filled

// Sample team members data
export const SAMPLE_TEAM_MEMBERS = [
  {
    id: 1,
    teamMemberId: "TM001",
    name: "Ana García",
    position: "Senior Recruiter",
    email: "ana.garcia@company.com",
    location: "Bogotá, Colombia",
    skills: ["Technical Recruiting", "Leadership", "Data Analysis"],
    incapacidades: [],
    oneOnOneSessions: [
      {
        id: 1,
        date: "2024-01-15",
        discussionPoints: [
          "Review of Q4 performance metrics",
          "Discussion of career development goals",
          "Feedback on team collaboration"
        ],
        actionItems: [
          "Complete advanced recruiting certification",
          "Mentor new team member",
          "Implement new candidate tracking system"
        ]
      }
    ]
  },
  {
    id: 2,
    teamMemberId: "TM002",
    name: "Carlos Rodríguez",
    position: "HR Specialist",
    email: "carlos.rodriguez@company.com",
    location: "Medellín, Colombia",
    skills: ["Employee Relations", "Compliance", "Training"],
    incapacidades: [
      {
        id: 1,
        reason: "Medical leave",
        startDate: "2024-01-20",
        endDate: "2024-01-25"
      }
    ],
    oneOnOneSessions: [
      {
        id: 2,
        date: "2024-01-10",
        discussionPoints: [
          "Process improvement initiatives",
          "Training program effectiveness",
          "Work-life balance discussion"
        ],
        actionItems: [
          "Design new onboarding process",
          "Schedule training workshops",
          "Review current workload distribution"
        ]
      }
    ]
  }
];

// Sample clients data with KPIs
export const SAMPLE_CLIENTS = [
  {
    id: 1,
    name: "María Fernández",
    company: "Tech Innovations Ltd",
    email: "maria@techinnovations.com",
    phone: "+57 300 123 4567",
    kpis: [
      {
        id: 1,
        name: "Monthly Revenue Target",
        target: 50000000, // 50M COP
        actual: 45000000, // 45M COP
        met: false
      },
      {
        id: 2,
        name: "New Client Acquisitions",
        target: 10,
        actual: 12,
        met: true
      },
      {
        id: 3,
        name: "Customer Satisfaction Score",
        target: 90,
        actual: 92,
        met: true
      }
    ]
  },
  {
    id: 2,
    name: "Roberto Silva",
    company: "Global Solutions Corp",
    email: "roberto@globalsolutions.com",
    phone: "+57 301 987 6543",
    kpis: [
      {
        id: 4,
        name: "Project Completion Rate",
        target: 95,
        actual: 98,
        met: true
      },
      {
        id: 5,
        name: "Team Productivity Index",
        target: 85,
        actual: 82,
        met: false
      },
      {
        id: 6,
        name: "Cost Reduction Target",
        target: 15,
        actual: 18,
        met: true
      }
    ]
  },
  {
    id: 3,
    name: "Laura Moreno",
    company: "Digital Marketing Pro",
    email: "laura@digitalmarketing.com",
    phone: "+57 302 555 7890",
    kpis: [
      {
        id: 7,
        name: "Campaign ROI",
        target: 300,
        actual: 350,
        met: true
      },
      {
        id: 8,
        name: "Lead Generation",
        target: 500,
        actual: 475,
        met: false
      },
      {
        id: 9,
        name: "Brand Awareness Score",
        target: 70,
        actual: 75,
        met: true
      }
    ]
  }
];