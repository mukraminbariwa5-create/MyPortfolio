/* ==========================================================
   PORTFOLIO CONTENT — edit this file to update the site.
   Add a project, a tool or a timeline entry here and the
   page builds it in the right style automatically.
   ========================================================== */

window.PORTFOLIO = {

  /* ---------- Contact ---------- */
  contact: {
    email: 'mukraminansao@gmail.com',
    linkedin: 'https://www.linkedin.com/in/mukramin-a-001833333',
    github: 'https://github.com/mukraminbariwa5-create',
    facebook: 'https://www.facebook.com/mukramin.bariwa',
    location: 'Pasig City, Metro Manila',
    // Paste a Formspree endpoint here (e.g. 'https://formspree.io/f/abcdwxyz')
    // to receive form messages by email. Left empty, the form opens the
    // visitor's email app with the message filled in.
    formEndpoint: 'https://formspree.io/f/xljgvrer'
  },

  /* ---------- Hero stat bar ---------- */
  stats: {
    projects: 4
  },

  /* Shown in the footer as "Last updated". Change it whenever you update the site. */
  updated: 'October 2026',

  /* ---------- Now: what I'm working on (About section + terminal) ---------- */
  now: [
    'Preparing TeachWise for release on Google Play',
    'Building new web and app projects with Laravel, React Native and Claude Code',
    'Adding live demos to my projects',
    'Practicing SOC investigations and CTF challenges',
    'Applying for web and app developer roles'
  ],

  /* ---------- What I Do ---------- */
  skills: [
    { icon: 'front', title: 'Front-End & Mobile', text: 'Responsive interfaces that look right on phones and desktops, plus Android and web apps from one React Native codebase.', tags: ['HTML', 'CSS', 'JavaScript', 'React Native'] },
    { icon: 'back', title: 'Back-End & Databases', text: 'Server logic, user logins and data handling — built security-minded, backed by my networking and cybersecurity training.', tags: ['PHP', 'Laravel', 'MySQL', 'Node.js'] },
    { icon: 'system', title: 'Full Systems', text: 'Admin panels, dashboards and multi-user systems with real roles and data, like TeachWise, BookTrack and Servease.', tags: ['Laravel', 'PHP', 'MySQL', 'REST APIs'] },
    { icon: 'ai', title: 'AI-Driven Development', text: 'I build with AI coding tools like Claude Code. I plan the system and its data, direct the AI, then review, test and fix every change before it ships.', tags: ['Claude Code', 'Code review', 'Automated tests'] }
  ],

  security: {
    title: 'Security-minded development',
    text: 'My networking major and cybersecurity training shape how I build: school-by-school data separation in TeachWise, role-based access in Servease and BookTrack, and on-device encryption in Padala.',
    points: ['3 security certificates: Google, Cisco, LetsDefend', 'SOC labs: Splunk, Wireshark, Nmap', 'CTF training & Capture the King', 'Privacy by design: TeachWise is Data Privacy Act (RA 10173) ready']
  },

  /* Toolkit shown in the Skills section, grouped. */
  /* items = used in my own projects (solid chips); familiar = know the basics / from training (outlined chips) */
  toolkitGroups: [
    { name: 'Front-end & mobile', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React Native', 'Expo', 'Chart.js'], familiar: ['Tailwind CSS', 'Bootstrap', 'jQuery', 'GSAP'] },
    { name: 'Back-end & data', items: ['PHP', 'Laravel', 'MySQL', 'Node.js', 'REST APIs'], familiar: ['phpMyAdmin'] },
    { name: 'AI tools & workflow', items: ['Claude Code', 'Claude', 'Git', 'GitHub', 'VS Code', 'XAMPP'], familiar: ['Postman', 'Figma'] },
    { name: 'Security (training & labs)', items: [], familiar: ['Linux', 'Wireshark', 'Nmap', 'Splunk', 'Kali Linux', 'Burp Suite', 'Metasploit'] }
  ],

  toolkit: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React Native', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'PHP', 'Laravel', 'MySQL', 'Node.js', 'XAMPP', 'Chart.js', 'GSAP', 'Git', 'GitHub', 'Postman', 'Figma', 'Claude Code', 'Linux', 'Wireshark', 'Nmap', 'Splunk', 'Burp Suite', 'Metasploit'],

  /* ---------- Projects ----------
     layout: 'desktop' = browser-style gallery, 'app' = three phone/app windows.
     github: '' shows "Repo coming soon".
     live: the live demo address (shows a "Live demo" button); liveNote: one short line under it,
     e.g. demo sign-in details or "first visit may take a minute to wake up".
     preview: a short silent clip (6–10 s, .mp4) that plays inside the screenshot
     frame on hover (desktop) or when scrolled into view (phones). If the file is
     not in assets/video/ yet, nothing shows, so it is safe to leave set.
     For 'app' layouts, previewShot picks which phone window plays it (0, 1 or 2). */
  projects: [
    {
      name: 'TeachWise', kind: 'Android + web app · 5 user roles · multi-school', layout: 'desktop', path: 'teachwise', status: 'Preparing for Google Play', featured: true,
      facts: [['5', 'user roles'], ['72', 'API tests'], ['2', 'languages · EN / FIL'], ['1', 'codebase · Android + web']],
      desc: 'An anonymous teacher-evaluation app for schools, guided by Professor Wise, a friendly cartoon professor. Students rate their teachers in about three minutes per class, teachers get clear results, and admins run the whole process from one dashboard. One app serves many schools, with each school\'s data kept strictly separate.',
      features: [
        'Students join with a school code or link and rate each class step by step, with drafts that survive going offline',
        'Teachers see their overall rating, trends, strongest areas and anonymous comments, with a printable report',
        'Admins manage departments, classes, evaluation periods and questions in English and Filipino',
        'Privacy built in: answers stay anonymous, results hide below a minimum response count, Data Privacy Act ready'
      ],
      tags: ['Laravel', 'React Native', 'Expo', 'MySQL', 'TypeScript'],
      github: 'https://github.com/mukraminbariwa5-create/TeachWise',
      live: 'https://teachwise-demo.onrender.com', liveNote: 'One-click demo accounts on the sign-in screen. Free hosting: the first visit can take about a minute to wake up.',
      preview: 'assets/video/teachwise.mp4',
      learned: 'Building one app for many schools taught me multi-tenant design: every record carries a school ID and is filtered on every request, so one school can never see another\'s data. It also pushed me from PHP pages to a REST API with a React Native app on Android and the web from a single codebase.',
      shots: [
        { src: 'assets/img/tw_student.webp', label: 'Student home' },
        { src: 'assets/img/tw_teacher.webp', label: 'Teacher dashboard' },
        { src: 'assets/img/tw_admin.webp', label: 'Admin dashboard' },
        { src: 'assets/img/tw_mobile.webp', label: 'Professor Wise on a phone', tall: true }
      ]
    },
    {
      name: 'Servease', kind: 'Web system · 3 user roles', layout: 'desktop', path: 'servease', status: 'In development',
      facts: [['3', 'user roles'], ['3', 'dashboards']],
      desc: 'A home-services marketplace that connects customers with ID-verified local pros for plumbing, aircon, cleaning and more.',
      features: [
        'Customers book pros, post jobs, chat and leave reviews after the job',
        'Pros send quotes and manage bookings and earnings',
        'Admin dashboard to verify pros and track bookings, payments and ratings'
      ],
      tags: ['PHP', 'MySQL', 'JavaScript', 'Responsive'],
      github: 'https://github.com/mukraminbariwa5-create/Servease',
      preview: 'assets/video/servease.mp4',
      learned: 'Designing role-based access so customers, pros and admins each see only their own data and actions, and keeping three different dashboards consistent in one system.',
      shots: [
        { src: 'assets/img/sv_home.webp', label: 'Customer home' },
        { src: 'assets/img/sv_admin.webp', label: 'Admin dashboard' },
        { src: 'assets/img/sv_login.webp', label: 'Sign in' },
        { src: 'assets/img/sv_mobile.webp', label: 'Mobile view', tall: true }
      ]
    },
    {
      name: 'BookTrack', kind: 'Web system · 2 user roles', layout: 'desktop', path: 'booktrack',
      facts: [['2', 'user roles'], ['1 month', 'first version, built solo']],
      desc: 'A library management system where members browse and borrow books, and librarians run the whole circulation. It started as my solo capstone project and was rebuilt into a full product.',
      features: [
        'Members discover books, borrow in one tap and track due dates',
        'Librarian overview with loans, overdue follow-ups and monthly charts',
        'Full catalogue and member management with search and filters'
      ],
      tags: ['PHP', 'MySQL', 'JavaScript', 'XAMPP'],
      github: 'https://github.com/mukraminbariwa5-create/Booktrack',
      preview: 'assets/video/booktrack.mp4',
      learned: 'Rebuilding my own capstone taught me to refactor older code, plan a cleaner relational database, and design for two very different users: members and librarians.',
      shots: [
        { src: 'assets/img/bt_discover.webp', label: 'Member · Discover' },
        { src: 'assets/img/bt_overview.webp', label: 'Librarian overview' },
        { src: 'assets/img/bt_books.webp', label: 'Books catalogue' },
        { src: 'assets/img/bt_login.webp', label: 'Sign in' }
      ]
    },
    {
      name: 'Padala', kind: 'App · End-to-end encrypted', layout: 'app', status: 'In development',
      facts: [['44', 'automated tests'], ['0', 'dependencies'], ['AES-256', 'encryption on the device']],
      desc: 'An installable app for delivering finished project folders to your team — locked so only your team can open them.',
      features: [
        "Files and messages are encrypted on the device before they're sent",
        'Updates send only the changed files, so it works even on a weak signal',
        'One-time team invite links that expire after 7 days',
        'Dala, a built-in assistant that guides new users step by step'
      ],
      tags: ['Node.js', 'JavaScript', 'Encryption', 'Installable app'],
      github: 'https://github.com/mukraminbariwa5-create/Padala',
      preview: 'assets/video/padala.mp4', previewShot: 1,
      learned: 'Encrypting files on the device before upload, and sending only the files that changed, which taught me how sync tools save bandwidth on slow connections.',
      shots: [
        { src: 'assets/img/pd_onboard.webp', label: 'Onboarding' },
        { src: 'assets/img/pd_home.webp', label: 'Home' },
        { src: 'assets/img/pd_signup.webp', label: 'Sign up' }
      ]
    }
  ],

  /* ---------- Journey ---------- */
  education: {
    degree: 'BS Information Technology',
    major: 'Major in Networking',
    school: 'Mindanao State University – Sulu',
    years: '2022 — 2026',
    honor: 'Cum Laude',
    honorNote: 'Graduated July 2026',
    awards: ['Outstanding Student Awardee 2026', 'Access to Higher and Modern Education (AHME) Scholar 2022–2026']
  },
  /* ---------- Certifications (newest first) ----------
     img = full image, thumb = small preview; verify = official link that proves it */
  certifications: [
    { title: 'Google Cybersecurity Professional Certificate', issuer: 'Google · Coursera', date: 'Jul 2025',
      note: 'Nine courses with hands-on labs: networks and network security, Linux, SQL, Python automation, SIEM tools and intrusion detection.',
      tags: ['Linux', 'SQL', 'Python', 'SIEM', 'IDS'],
      img: 'assets/img/cert_google.webp', thumb: 'assets/img/cert_google-sm.webp',
      verify: 'https://coursera.org/verify/professional-cert/FTYCAM1EGDSR' },
    { title: 'SIEM Engineer Career Path', issuer: 'LetsDefend', date: 'Jun 2025',
      note: 'Completed career path on setting up and working with SIEM: collecting logs, analyzing events and building detections.',
      tags: ['SIEM', 'Log analysis', 'Detection'],
      img: 'assets/img/cert_letsdefend.webp', thumb: 'assets/img/cert_letsdefend-sm.webp',
      verify: 'https://app.letsdefend.io/certificate/show/2c7f903d-806d-4717-a8aa-8cfa657c39a3' },
    { title: 'Cyber Threat Management', issuer: 'Cisco Networking Academy', date: 'Jun 2025',
      note: 'Cisco course on managing threats in an organization: governance and compliance, network security testing, threat intelligence, risk and incident response.',
      tags: ['Threat intelligence', 'Risk', 'Incident response'],
      img: 'assets/img/cert_cisco.webp', thumb: 'assets/img/cert_cisco-sm.webp',
      verify: 'https://www.credly.com/badges/5b52ef59-ad80-4972-8e35-d336f263796e' }
  ],

  /* ---------- Availability + languages (About facts, hero, contact) ---------- */
  availability: 'Can start immediately · on-site, hybrid or remote',
  languages: 'English · Tagalog',

  /* ---------- Why work with me: each point links to its proof ---------- */
  why: [
    { title: 'I ship complete systems', text: 'Four projects covering the full stack: the database, the API, the admin dashboards and the screens people use. TeachWise alone has 5 user roles, 72 API tests and runs on Android and the web.', link: '#projects', linkText: 'See the projects' },
    { title: 'Security is built in, not added later', text: 'A networking major and three security certificates shape how I code: school-by-school data separation in TeachWise, role checks in every system and on-device encryption in Padala.', link: '#certifications', linkText: 'See the certificates' },
    { title: 'I build with AI and own the result', text: 'I use AI coding tools like Claude Code to move fast, but I plan each system, review and test every change, and can explain how it works. 116 automated tests across TeachWise and Padala back that up.', link: 'https://github.com/mukraminbariwa5-create', linkText: 'See my GitHub' }
  ],
  journey: [
    { when: 'Now', kind: 'Projects', title: 'Building projects with AI-driven development', org: 'Personal projects · ongoing', text: 'Four projects so far: TeachWise and BookTrack are complete, and Servease and Padala are in development, each one planned, built with Claude Code, tested and published on GitHub.', live: true },
    { when: 'Feb – May 2026', kind: 'OJT', title: 'On-the-Job Trainee', org: 'Department of Information and Communications Technology (DICT) · Jolo, Sulu', text: 'Hands-on work across deployment, networking and development:',
      bullets: [
        'Facilitated the rollout of a DICT free internet connectivity program to partner schools, coordinating on-site deployment and orienting students and staff',
        'Assisted with networking tasks during field deployments',
        'Assisted senior developers with their website development work',
        'Completed gamified, self-paced coding training on Walnut Education',
        'Trained in Capture the Flag (CTF) cybersecurity challenges'
      ] },
    { when: 'Dec 2025', kind: 'Capstone', title: 'Library System Capstone → BookTrack', org: 'Mindanao State University – Sulu', text: 'Built solo in one month (LibraSys): MySQL database, inventory, borrowing and returns with due dates, and reports. Later rebuilt into BookTrack.' },
    { when: 'Nov 2025', kind: 'Competition', title: 'Capture the King CTF', org: '11th Infantry (Alakdan) Division, Philippine Army · with DICT Sulu', text: 'Team cybersecurity competition held November 15–16, 2025.' },
    { when: 'May 2025', kind: 'Personal project', title: 'TeachWise', org: 'Personal project · independent developer', text: 'Anonymous teacher-evaluation system for schools, later rebuilt into a multi-school Android and web app (see Projects).' },
    { when: 'Ongoing', kind: 'Cybersecurity', title: 'SOC Labs', org: 'TryHackMe · LetsDefend · SecurityBlue.team', text: 'Splunk log analysis, phishing and brute-force investigations, and incident reports.' }
  ]
};
