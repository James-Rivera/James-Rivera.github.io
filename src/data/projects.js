export const projects = [
  {
    slug: 'flowpress', number: '01', title: 'FlowPress', kind: 'featured',
    label: 'Print workflow', year: '2025—26', status: 'Running in real operations',
    summary: 'A QR-first upload and print workflow built for the pace and constraints of a neighborhood computer shop.',
    context: 'Customers used to move files through chat threads, USB drives and counter conversations. The handoff was slow, hard to track and easy to misunderstand during busy hours.',
    contribution: 'I mapped the counter workflow, designed the upload path, built the customer and staff interfaces, deployed the service and revised the queue after watching staff use it.',
    outcome: 'FlowPress is used at CJNET and continues to evolve around the habits of the people running the shop—not an imagined ideal process.',
    stack: ['React', 'TypeScript', 'Supabase', 'Docker', 'Nginx'], accent: '#356dff',
    repoUrl: 'https://github.com/James-Rivera/flowpress-v2'
  },
  {
    slug: 'konektado', number: '02', title: 'Konektado', kind: 'featured',
    label: 'Community marketplace', year: '2026', status: 'Thesis · active development',
    summary: 'A barangay-oriented mobile platform matching residents with nearby workers through roles, location and verification signals.',
    context: 'Finding trusted local help is still driven by word of mouth. That works until the right person sits outside your immediate network or the work needs clearer accountability.',
    contribution: 'I own the product direction, interaction design and application architecture, translating community trust patterns into practical mobile flows.',
    outcome: 'The thesis build is in active development, with verification, matching and service discovery treated as one connected system.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL'], accent: '#ef5d9b',
    repoUrl: 'https://github.com/James-Rivera/konektado'
  },
  {
    slug: 'cjnet', number: '03', title: 'CJNET', kind: 'featured',
    label: 'Internal systems', year: '2021—', status: 'Operational tools · experiments',
    summary: 'A growing set of cashier, printing, expense and reporting tools shaped inside the family business they support.',
    context: 'CJNET combines internet access, printing, document assistance and walk-in services. Generic tools rarely match that mix of fast, small and highly varied transactions.',
    contribution: 'I work at the counter, maintain the network and build the internal tools. That short distance between observation and implementation is the main advantage.',
    outcome: 'The system is a living operations lab: every useful feature begins with a repeated problem and earns its place through daily use.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'MikroTik'], accent: '#f38b36',
    repoUrl: 'https://github.com/James-Rivera/cjnet-POS'
  },
  {
    slug: 'homelab', number: '04', title: 'Homelab', kind: 'featured',
    label: 'Infrastructure', year: '2024—', status: 'Self-hosted infrastructure',
    summary: 'The Linux, Docker, reverse-proxy and networking environment where deployment became part of how I design products.',
    context: 'Building software is only half the work. The system still needs a home, a route, observability and a recovery path when something breaks.',
    contribution: 'I operate the hardware and software stack: containerized services, routing, certificates, storage, backups and remote access.',
    outcome: 'The lab supports real services and gives every project an environment where infrastructure decisions can be tested directly.',
    stack: ['Linux', 'Docker', 'Nginx', 'Cloudflare', 'Networking'], accent: '#21a56f',
    repoUrl: 'https://github.com/James-Rivera/avera-homelab-docs'
  },
  {
    slug: 'solesource', number: '05', title: 'SoleSource', kind: 'featured',
    label: 'Commerce platform', year: '2025', status: 'Full-stack product build',
    summary: 'A premium sneaker storefront with product discovery, vouchers, transactional flows and operational integrations.',
    context: 'The project explored the complete shape of an online storefront rather than stopping at a visual catalog.',
    contribution: 'I designed and implemented the customer experience, commerce flows, PHP/MySQL backend and supporting voucher and messaging integrations.',
    outcome: 'SoleSource became a practical exercise in joining brand expression, transaction design and backend behavior into one coherent product.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'REST API', 'SMS'], accent: '#d7f74a',
    image: '/images/solesource-thumbnail.png', imageAlt: 'SoleSource storefront preview',
    liveUrl: 'https://solesource.jamescarlo.me/', repoUrl: 'https://github.com/James-Rivera/solesource'
  },
  {
    slug: 'league-champion-explorer', number: 'S1', title: 'League Champion Explorer', kind: 'school',
    label: 'API dashboard', year: 'School project', status: 'Live Riot API integration',
    summary: 'An interactive champion browser built around live game data, filtering and readable comparison states.',
    context: 'The assignment was an opportunity to work with a real external API and turn a large data set into a focused browsing experience.',
    contribution: 'I built the data integration, champion browsing UI, search and responsive presentation.',
    outcome: 'The project demonstrates API consumption, stateful interface design and clear information hierarchy.',
    stack: ['JavaScript', 'REST API', 'HTML', 'CSS'], accent: '#b58af2',
    liveUrl: 'https://james-rivera.github.io/league-champion-api-dashboard/', repoUrl: 'https://github.com/James-Rivera/league-champion-api-dashboard'
  },
  {
    slug: 'art2cart', number: 'S2', title: 'Art2Cart', kind: 'school',
    label: 'Digital marketplace', year: 'School project', status: 'Marketplace case study',
    summary: 'A digital marketplace concept connecting creators with buyers through discovery, product and administration flows.',
    context: 'The project asked how an art marketplace could support both expressive discovery and the practical work of catalog and order management.',
    contribution: 'I shaped the product flows, storefront interface and administration experience, then documented the system as a case study.',
    outcome: 'Art2Cart became the most complete case study from my school work and remains evidence of end-to-end thinking.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'Product Design'], accent: '#ff706c',
    image: '/images/markeplace.png', imageAlt: 'Art2Cart marketplace interface', liveUrl: 'http://art2cart.shop/'
  },
  {
    slug: 'japan-tours', number: 'S3', title: 'Japan Tours', kind: 'school',
    label: 'Travel concept', year: 'School project', status: 'Responsive landing page',
    summary: 'A responsive tourism landing page exploring destination storytelling, visual rhythm and mobile composition.',
    context: 'The project focused on translating a travel concept into a clear, responsive marketing experience.',
    contribution: 'I created the visual direction, page structure and responsive implementation.',
    outcome: 'It records an earlier stage of my frontend practice and an interest in strong editorial presentation.',
    stack: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'], accent: '#f89abd',
    liveUrl: 'https://james-rivera.github.io/tokyo-tourism-landing-page/', repoUrl: 'https://github.com/James-Rivera/tokyo-tourism-landing-page'
  },
  {
    slug: 'ps5-landing-page', number: 'S4', title: 'PS5 Landing Page', kind: 'school',
    label: 'Interface study', year: 'School project', status: 'Reimagined product page',
    summary: 'A product landing-page study centered on hierarchy, motion and a focused hardware presentation.',
    context: 'The exercise strengthened layout, visual hierarchy and responsive interaction skills through a familiar product.',
    contribution: 'I reinterpreted the product presentation and implemented the responsive interface.',
    outcome: 'The page remains a useful snapshot of my early interface and motion work.',
    stack: ['HTML', 'CSS', 'JavaScript', 'Motion'], accent: '#68bdf0',
    liveUrl: 'https://james-rivera.github.io/ps5-page/'
  }
];

export const featuredProjects = projects.filter((project) => project.kind === 'featured');
export const schoolProjects = projects.filter((project) => project.kind === 'school');
export const getProject = (slug) => projects.find((project) => project.slug === slug);
