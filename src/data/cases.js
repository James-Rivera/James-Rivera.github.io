const detailedCases = {
  flowpress: {
    eyebrow: 'Case study',
    summary: "A QR upload path for a computer shop's printing queue—built, deployed, and then reshaped by what people actually did with it.",
    facts: [['Role','Solo build'],['Years','2025—2026'],['Status','Running in real operations'],['Stack','Next.js · PHP · MySQL · Docker']],
    sections: [
      { title: 'The problem', lead: 'Printing in a computer shop is a queue of people handing over flash drives, then waiting while someone opens each file on the one machine wired to the printer.', items: [['Constraint','The shop’s internet is unreliable, so the critical file path could not depend entirely on the cloud.'],['Users','Walk-in customers on their own phones, and one staff member watching a queue during a rush. Neither installs anything.']] },
      { title: 'How the architecture changed', lead: 'The first version put the upload page on the public internet and the backend in my homelab. Connectivity and adoption problems pushed the file path back inside the shop.', kind: 'pipeline', versions: [
        { title: 'V1 — deployed', status: 'Public route', nodes: [['Upload','Public page · any network'],['Route','Cloudflare Tunnel'],['Backend','Homelab · Docker'],['Sync','Files land on the shop PC']], copy: 'This worked and handled more than 100 uploads, but every print depended on the shop connection, the tunnel and a server outside the building.' },
        { title: 'V2 — in progress', status: 'Shop-local route', nodes: [['Connect','MikroTik hotspot · captive portal'],['Upload','On-site upload server · LAN'],['Queue','Job state on the shop machine'],['Print','Staff releases the job']], copy: 'The new default keeps the critical path on-site. The public route remains available as a fallback instead of becoming another dependency.' }
      ]},
      { title: 'Screens', kind: 'screens', screens: [['Customer upload','Mobile'],['Live job queue','Staff view'],['Admin dashboard','Desktop'],['Deployment','Docker · shop server']] },
      { title: 'What happened when people used it', lead: 'Building it was the easy half. Changing how people already did the task was the actual problem, and I only partly solved it.', items: [['100+ uploads','Files passed through the workflow during early use.'],['Staff went around it','They preferred opening the shared folder directly over the admin queue I built.'],['Messenger stayed','Some customers kept sending files the way they always had.'],['Fallbacks stayed','Every alternative path had to remain available.']] },
      { title: 'Where it stands', items: [['Working now','The upload page, file handoff and print path run at the shop.'],['Tested, not adopted','The captive-portal upload path and the custom admin queue were tested, but staff chose not to use them.'],['Still planned','A shop-local default path, clearer job states and better monitoring.'],['Limitations','The workflow still has to coexist with Messenger, USB drives and manual file handling.'],['What I would do differently','Watch staff work for a week before designing the queue.']] }
    ]
  },
  konektado: {
    eyebrow: 'Case study',
    summary: 'A barangay-oriented mobile platform connecting residents with local workers using service categories, location, user roles and verification signals.',
    facts: [['Context','Undergraduate thesis'],['Year','2026'],['Status','Active development'],['Stack','React Native · Expo · Supabase']],
    sections: [
      { title: 'The problem', lead: 'Finding someone nearby who can actually do the work often means scrolling a barangay Facebook group and hoping a comment thread is still accurate.', items: [['Users','Residents seeking a specific service and local workers offering one.'],['Environment','Community scale rather than city scale. Trust comes from proximity and someone local vouching.']] },
      { title: 'How matching works today', lead: 'Matching is structured, not conversational. A request resolves against a service taxonomy, offered services, active roles and location.', items: [['Service taxonomy','Requests and provider offers resolve to shared categories.'],['Roles','One account can be a client, provider or both.'],['Location','Matching is scoped to the community an account belongs to.'],['Verification','Residency, skill proof and provider trust indicators make a listing credible.']] },
      { title: 'Planned exploration', lead: 'Natural-language matching is a direction, not a feature.', body: 'Embeddings, semantic retrieval and assisted intake are ideas to explore after the structured layer is solid. The thesis does not depend on them.' },
      { title: 'Screens', kind: 'screens', screens: [['Request flow','Mobile'],['Provider profile','Mobile'],['Match results','Mobile']] },
      { title: 'Where it stands', items: [['In development','Undergraduate thesis, active build through 2026.'],['Not deployed','No public release or real user base yet.'],['Structured matching','Categories, roles, location and verification form the implemented path.'],['Open question','Whether barangay-scale verification creates enough trust to leave the group chat.']] }
    ]
  },
  cjnet: {
    eyebrow: 'Environment',
    summary: 'Our family printing and computer-services shop—and the environment where I find, test and break the workflows my software has to survive.',
    facts: [['Context','Family business'],['Years','2021—present'],['Status','Internal tools · workflow experiments'],['Scope','Networking · print workflow · support']],
    sections: [
      { title: 'What this is', lead: 'Not a job title. A counter, a printer, a queue of people and a shop network I am responsible for keeping alive.', items: [['What I do there','Technical support, network and equipment configuration, print workflow changes and internal tools.'],['Why it matters','Every assumption gets tested by someone impatient, on a bad connection, with a file that will not open.']] },
      { title: 'What I have built and tried here', items: [['FlowPress','The upload-and-print path—the one system that graduated into daily use.'],['Shop network','Router, hotspot and local-network configuration.'],['Workflow changes','Small process fixes that never became software because they did not need to.'],['Failed experiments','Interfaces staff bypassed and flows customers ignored in favour of Messenger.']] },
      { title: 'What it taught me', lead: 'Software has to work for busy staff, impatient customers, unreliable connectivity, physical equipment and habits that already exist.', items: [['Habits beat interfaces','Shipping the feature was the easy half. Changing the task was the real work.'],['Fallbacks are permanent','Every path needs the old way still available.'],['Observation over specs','The requirements I trust came from standing at the counter.']] }
    ]
  },
  homelab: {
    eyebrow: 'Environment',
    summary: 'A self-hosted infrastructure environment. Not a product—the place where I learn deployment, networking and monitoring by having to operate them.',
    facts: [['Context','Self-hosted'],['Years','2024—present'],['Status','Running environment'],['Stack','Linux · Docker · Nginx · Cloudflare']],
    sections: [
      { title: 'Why run one', lead: 'Deployment stops being a final step once you are the person who has to fix it at 11pm.', items: [['What it is','Hardware at home running Linux and containerised services behind a reverse proxy.'],['What it is for','Hosting things I use and giving projects somewhere real to run before they become anyone else’s problem.']] },
      { title: 'What it runs', items: [['Containers','Docker and Compose as the default unit of deployment.'],['Reverse proxy','Nginx in front of internal services, with TLS at the edge.'],['Remote access','Cloudflare routing instead of exposing the network directly.'],['Self-hosted services','Internal tools and experiments run here before or alongside public deployment.'],['Monitoring','Enough visibility to know what broke—currently the weakest part.']] },
      { title: 'What it taught me', lead: 'Most of what I know about backups, DNS, certificates and failure modes came from breaking this and having to bring it back.', body: 'The first FlowPress version was hosted here. Operating it showed me why the critical path eventually needed to move on-site.' }
    ]
  },
  solesource: {
    eyebrow: 'Case study',
    facts: [['Context','Commerce platform'],['Year','2025'],['Status','Full-stack build'],['Stack','PHP · MySQL · JavaScript · REST API']],
    sections: [
      { title: 'The brief', lead: 'Build a premium sneaker storefront that behaves like a complete commerce product rather than a static catalog.', items: [['Customer path','Discovery, product detail, vouchers and checkout.'],['Operations','Inventory, orders and administration tied to the storefront.']] },
      { title: 'What I built', lead: 'I designed and implemented the customer experience, transactional flows and PHP/MySQL backend.', items: [['Integrations','Voucher and messaging integrations support the transaction lifecycle.'],['Design system','The interface maintains a focused premium identity across product and checkout states.']] },
      { title: 'What it proved', lead: 'SoleSource joined brand expression, transaction design and backend behavior into one coherent product.' }
    ]
  }
};

export function getCaseDetail(project) {
  if (detailedCases[project.slug]) return detailedCases[project.slug];
  return {
    eyebrow: project.kind === 'school' ? 'School project' : 'Case study',
    summary: project.summary,
    facts: [['Context',project.label],['Period',project.year],['Status',project.status],['Stack',project.stack.join(' · ')]],
    sections: [
      { title: 'The context', lead: project.context },
      { title: 'What I worked on', lead: project.contribution },
      { title: 'What it demonstrates', lead: project.outcome }
    ]
  };
}
