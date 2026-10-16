import type {
  AreasPage,
  BeforeAfterItem,
  BeforeAfterPage,
  ContactPage,
  Global,
  HomePage,
  LegalPage,
  NewsPage,
  Post,
  Service,
  ServicesPage,
} from "./directus";

/**
 * Mock data for collections not yet migrated to Directus.
 *
 * Each fetcher in directus.ts is either "mock" (returns data from here)
 * or "live" (fetches from Directus). Migrating a collection means replacing
 * the mock fetcher body with a Directus fetch and deleting the mock data here.
 *
 * This file is permanent infrastructure — new pages can be designed with
 * mock data first for client sign-off, then migrated to Directus once approved.
 *
 * Content sources: Tommy's flyer, his order form and his messages in the
 * Build 76 portal (18 Sep to 15 Oct 2026). Photos are placeholders until he
 * has his own (Linear B76-271), so before and after pairs are flagged as examples.
 */

export const mockGlobal: Global = {
  id: 1,
  site_name: "Power-Vac Gutter Cleaning",
  site_description:
    "Gutter vacuum cleaning from the ground across Norwich and Norfolk. No ladders, no mess, just results.",
  logo: "/images/logo.png",
  phone: "01603 339225",
  phone_mobile: "07338 083121",
  email_address: "info@powervacguttercleaning.co.uk",
  address: "Norwich, Norfolk",
  opening_hours: [
    { days: "Monday to Friday", times: "8am to 7pm" },
    { days: "Saturday", times: "9am to 2pm" },
  ],
  price_from: "£34.99",
  sticker_text: "NO LADDERS • NO MESS • JUST RESULTS •",
  promises: [
    { label: "Fully insured", icon: "ShieldCheck" },
    { label: "Eco-friendly method", icon: "Leaf" },
    { label: "Local & reliable", icon: "House" },
  ],
  // Tommy's Facebook page URL hasn't been supplied yet. Add it here and the
  // Facebook links appear across the site.
  social_media_accounts: [],
  quote_heading: "Let’s get\nyou *flowing*",
  quote_description:
    "A free, no-obligation quote. Send the form and we’ll come back to you with a price. Or just give us a ring.",
  quote_success_message:
    "We’ve got your request and we’ll be in touch with your price.",
  footer_tagline: "Cleaner gutters = a safer, longer-lasting home",
};

export const mockHomePage: HomePage = {
  id: 1,
  meta_title: "Power-Vac Gutter Cleaning | Norwich & Norfolk",
  meta_description:
    "Gutter vacuum cleaning from the ground, with a camera on the pole so you can see inside your gutters. Norwich and the whole of Norfolk, from just £34.99.",
  hero_annotation: "Live camera inspection",
  hero_heading: "See what\n*we see.*",
  hero_description:
    "We vacuum your gutters from the ground with a camera on the pole, so you can watch inside them in real time while we clean. No ladders, no mess, and before & after photos and videos as proof.",
  hero_cta_text: "Get my free quote",
  hero_cta_link: "#quote",
  hero_secondary_cta_text: "Our services",
  hero_secondary_cta_link: "/services",
  hero_image: "/images/hero.jpg",
  hero_image_alt:
    "A SkyVac vacuum pole reaching into a gutter full of leaves and moss",
  hero_camera_image: "/images/camera-feed.jpg",
  hero_camera_image_alt:
    "The live camera view inside a gutter full of leaves and moss",
  hero_camera_note: "watch it live while we clean",
  steps_heading: "How a clean\nflows",
  steps_annotation: "three steps, zero ladders",
  steps: [
    {
      title: "Ask for a quote",
      body: "Ring, message us on Facebook or use the form. Free, and no obligation.",
    },
    {
      title: "We vacuum from the ground",
      body: "A SkyVac pole reaches up to the gutter and sucks everything out. Your lawn stays clean.",
    },
    {
      title: "See the difference",
      body: "Before and after photos land with you, so you know it’s done right.",
    },
  ],
  services_heading: "Everything up\non the *roofline*",
  services_cta_text: "All services",
  before_after_heading: "Slide. *Gasp.*",
  before_after_annotation: "you get photos like these after every job",
  areas_annotation: "where you’ll find us",
  areas_heading: "Norwich\n*& the whole*\nof Norfolk",
  areas_description:
    "Based in Norwich and covering all of Norfolk and the surrounding areas. From the Broads to the coast, if it’s got gutters, we’ll come.",
  areas_cta_text: "See the towns we cover",
  news_heading: "Gutter talk",
};

export const mockServicesPage: ServicesPage = {
  id: 1,
  meta_title: "Gutter cleaning services in Norwich & Norfolk",
  meta_description:
    "Gutter vacuum cleaning from £34.99, plus downpipe unblocking, fascia and soffit cleaning, roof cleaning and minor roofline repairs across Norfolk.",
  hero_annotation: "no ladders, no mess",
  hero_heading: "Everything up\non the *roofline*",
  hero_description:
    "Gutter vacuum cleaning is the main event. Add your downpipes, fascias and soffits or your roof, and we’ll take care of them while we’re there.",
  hero_image: "/images/pole-house.jpg",
  hero_image_alt:
    "A gutter vacuum pole reaching up to the gutter of a red-brick house",
  extras_heading: "Add it on",
  extras_description:
    "Add any of these to your gutter clean. Prices depend on your property, so we’ll include them in your free quote.",
  faqs_heading: "Good to know",
  faqs: [
    {
      question: "How much does gutter cleaning cost?",
      answer:
        "Gutter cleaning starts from just £34.99. The price depends on the size of your property and how much is in the gutters, so we’ll give you a free, no-obligation quote first.",
    },
    {
      question: "Do you use ladders?",
      answer:
        "No. We clean from the ground with a SkyVac gutter vacuum on a long pole, so there are no ladders against your walls or windows.",
    },
    {
      question: "Are you insured?",
      answer: "Yes, we’re fully insured.",
    },
    {
      question: "Where do you work?",
      answer:
        "We’re based in Norwich and cover the whole of Norfolk and the surrounding areas.",
    },
  ],
};

export const mockServices: Service[] = [
  {
    id: "1",
    status: "published",
    sort: 1,
    slug: "gutter-vacuum-cleaning",
    title: "Gutter vacuum cleaning",
    form_label: "Gutter clean",
    kind: "main",
    icon: "Waves",
    card_summary:
      "Vacuum cleaned from the ground. Leaves, moss, silt and debris out, water flowing again.",
    price_from: "£34.99",
    has_page: true,
    meta_title: "Gutter vacuum cleaning in Norwich & Norfolk",
    meta_description:
      "Gutters vacuum cleaned from the ground with a camera on the pole, so you can see inside them. No ladders, no mess. From just £34.99.",
    hero_annotation: "the main event",
    hero_heading: "Gutters cleared\nfrom the *ground*",
    hero_description:
      "A SkyVac pole reaches your gutters from the ground and vacuums out the leaves, moss and muck. The camera on the pole shows exactly what’s up there, before and after.",
    hero_image: "/images/pole-roofline.jpg",
    hero_image_alt:
      "A carbon gutter vacuum pole hooked into a mossy gutter on a brick house",
    body: `<h2>How we clean your gutters</h2>
<p>We use the latest gutter vacuum technology to safely and efficiently remove dirt, moss, leaves and debris, keeping your gutters flowing and your property protected.</p>
<p>The SkyVac is a powerful vacuum on a long, light pole. We stand on the ground, guide the nozzle along the gutter and the vacuum sucks everything out into the machine. Nothing gets tipped onto your lawn or your path.</p>
<h2>See inside your gutters</h2>
<p>A camera on the end of the pole shows the inside of the gutter on a screen. We can see what’s blocking it, check every run is clear, and show you too. When we’re done, you get before and after photos so you know the job’s been done properly.</p>
<h2>Why it matters</h2>
<p>Blocked gutters overflow. The water runs down your walls instead of into the drain, and over time that can mean damp, stained brickwork and rotten fascias. A clear gutter carries the rain away from your home, which is why cleaner gutters make for a safer, longer-lasting home.</p>`,
    benefits_heading: "Why vacuum,\nnot *ladders*",
    benefits: [
      {
        title: "No ladders",
        body: "Nothing leaning on your walls, windows or conservatory. We work safely from the ground.",
      },
      {
        title: "No mess",
        body: "Everything goes into the vacuum, not onto your lawn, drive or flower beds.",
      },
      {
        title: "See inside",
        body: "The camera on the pole shows what’s in your gutters while we clean.",
      },
      {
        title: "Proof it’s done",
        body: "Before and after photos after every job, so you can see the difference.",
      },
    ],
    faqs: [
      {
        question: "How much does it cost?",
        answer:
          "From just £34.99. The price depends on the size of your property and how full the gutters are. Ring us or send the form for a free, no-obligation quote.",
      },
      {
        question: "What do you take out?",
        answer:
          "Leaves, moss, silt, dirt and any other debris sitting in the gutter.",
      },
      {
        question: "How often should gutters be cleaned?",
        answer:
          "Most homes are best cleaned at least once a year. If you have trees nearby, twice a year (after the leaves fall in autumn and again in spring) keeps the water flowing.",
      },
      {
        question: "Can I see what you’ve done?",
        answer:
          "Yes. The camera shows the inside of your gutters while we clean, and you get before and after photos at the end.",
      },
    ],
  },
  {
    id: "2",
    status: "published",
    sort: 2,
    slug: "downpipe-unblocking",
    title: "Downpipe unblocking",
    form_label: "Downpipes",
    kind: "add_on",
    icon: "Droplets",
    card_summary:
      "Blocked downpipes clear, so the water in your gutters has somewhere to go.",
    price_from: null,
    has_page: true,
    meta_title: "Downpipe unblocking in Norwich & Norfolk",
    meta_description:
      "Blocked downpipe? We clear it as an add-on to your gutter clean, so rainwater drains away from your home. Free quotes across Norfolk.",
    hero_annotation: "an optional add-on",
    hero_heading: "Downpipes\n*unblocked*",
    hero_description:
      "A clean gutter only works if the water can get away. We clear blocked downpipes so the rain runs off your roof and into the drain.",
    hero_image: "/images/pole-house.jpg",
    hero_image_alt:
      "A gutter and downpipe on a red-brick house with a vacuum pole reaching up",
    body: `<h2>Signs your downpipe is blocked</h2>
<ul>
<li>Water spills over the gutter even though it looks clear.</li>
<li>You hear gurgling or dripping inside the pipe after rain.</li>
<li>Damp patches or green stains on the wall around the pipe.</li>
<li>Puddles at the foot of the pipe that take ages to drain.</li>
</ul>
<h2>Clear it while we’re there</h2>
<p>Leaves and moss wash out of the gutter and into the top of the downpipe, where they get stuck. Add downpipe unblocking to your gutter clean and we’ll clear the blockage so water drains away properly.</p>`,
    benefits_heading: null,
    benefits: null,
    faqs: [
      {
        question: "How much does it cost?",
        answer:
          "It depends on how many downpipes you have and how badly they’re blocked. We’ll include it in your free, no-obligation quote.",
      },
      {
        question: "Can I book it with a gutter clean?",
        answer:
          "Yes. Downpipe unblocking is an optional add-on to a gutter clean. Just tick it on the quote form or mention it when you ring.",
      },
    ],
  },
  {
    id: "3",
    status: "published",
    sort: 3,
    slug: "fascia-and-soffit-cleaning",
    title: "Fascia & soffit cleaning",
    form_label: "Fascia & soffits",
    kind: "add_on",
    icon: "PanelTop",
    card_summary:
      "Grimy, green fascias and soffits cleaned, so your roofline looks fresh again.",
    price_from: null,
    has_page: true,
    meta_title: "Fascia & soffit cleaning in Norwich & Norfolk",
    meta_description:
      "Fascias and soffits cleaned as an add-on to your gutter clean, so your whole roofline looks fresh. Free quotes across Norfolk.",
    hero_annotation: "an optional add-on",
    hero_heading: "Fascias & soffits,\n*fresh again*",
    hero_description:
      "The boards along your roofline pick up dirt, algae and cobwebs over time. Add fascia and soffit cleaning to your gutter clean and the whole roofline looks looked-after.",
    hero_image: "/images/hero.jpg",
    hero_image_alt: "A gutter vacuum pole working along a house roofline",
    body: `<h2>What are fascias and soffits?</h2>
<p>Fascias are the boards your gutters are fixed to, running along the edge of the roof. Soffits are the boards underneath, between the fascia and the wall. Together they make up your roofline.</p>
<h2>Why clean them?</h2>
<p>White uPVC turns grey and green over the years as dirt and algae build up. Cleaning them is one of the quickest ways to make the front of a house look smarter, and it’s the perfect finishing touch after a gutter clean.</p>`,
    benefits_heading: null,
    benefits: null,
    faqs: [
      {
        question: "How much does it cost?",
        answer:
          "It depends on the size of your property. We’ll include it in your free, no-obligation quote.",
      },
      {
        question: "Can I book it with a gutter clean?",
        answer:
          "Yes. Fascia and soffit cleaning is an optional add-on to a gutter clean. Just tick it on the quote form or mention it when you ring.",
      },
    ],
  },
  {
    id: "4",
    status: "published",
    sort: 4,
    slug: "roof-cleaning",
    title: "Roof cleaning",
    form_label: "Roof",
    kind: "add_on",
    icon: "House",
    card_summary:
      "Moss and debris cleared from your roof before it ends up back in your gutters.",
    price_from: null,
    has_page: true,
    meta_title: "Roof cleaning in Norwich & Norfolk",
    meta_description:
      "Roof cleaning as an add-on to your gutter clean. Clear the moss and debris that end up blocking your gutters. Free quotes across Norfolk.",
    hero_annotation: "an optional add-on",
    hero_heading: "Roofs cleared\nof *moss*",
    hero_description:
      "Most of what blocks a gutter starts life on the roof. Add roof cleaning to your gutter clean and tackle the moss and debris at the source.",
    hero_image: "/images/pole-house.jpg",
    hero_image_alt:
      "A tiled roof and gutter on a red-brick house with a vacuum pole reaching up",
    body: `<h2>Why moss matters</h2>
<p>Moss holds water like a sponge. As it grows it lifts tiles, lets water in, and every time it rains clumps wash down into your gutters and block them again.</p>
<h2>Roof and gutters together</h2>
<p>Roof cleaning is an optional add-on to a gutter clean. Clearing the roof first means your freshly cleaned gutters stay clear for longer.</p>`,
    benefits_heading: null,
    benefits: null,
    faqs: [
      {
        question: "How much does it cost?",
        answer:
          "It depends on the size and condition of your roof. We’ll include it in your free, no-obligation quote.",
      },
      {
        question: "Can I book it with a gutter clean?",
        answer:
          "Yes. Roof cleaning is an optional add-on to a gutter clean. Just tick it on the quote form or mention it when you ring.",
      },
    ],
  },
  {
    id: "5",
    status: "published",
    sort: 5,
    slug: "minor-roofline-repairs",
    title: "Minor roofline repairs",
    form_label: "Repairs",
    kind: "on_request",
    icon: "Wrench",
    card_summary:
      "Spotted a small problem with your gutters or roofline? Ask us and we’ll let you know if we can fix it.",
    price_from: null,
    // Listed on the Services page and in the quote form, without its own page.
    has_page: false,
    meta_title: null,
    meta_description: null,
    hero_annotation: null,
    hero_heading: null,
    hero_description: null,
    hero_image: null,
    hero_image_alt: null,
    body: null,
    benefits_heading: null,
    benefits: null,
    faqs: null,
  },
];

export const mockBeforeAfterPage: BeforeAfterPage = {
  id: 1,
  meta_title: "Before & after gutter cleaning photos",
  meta_description:
    "See the difference a gutter vacuum clean makes. Every Power-Vac job ends with before and after photos.",
  hero_annotation: "see the difference",
  hero_heading: "Before\n& *after*",
  hero_description:
    "Every job ends with before and after photos, so you can see exactly what came out of your gutters. Drag the slider to compare.",
  gallery_heading: "Slide. *Gasp.*",
  gallery_note:
    "These are example photos. Photos from our own jobs are coming soon.",
  camera_heading: "The camera\nsees it *first*",
  camera_description:
    "The camera on the pole shows the inside of your gutters on a screen as we clean. We can see what’s blocking them, check every run is clear, and show you too.",
  camera_image: "/images/camera-feed-2.jpg",
  camera_image_alt: "The camera view inside a gutter during a clean",
};

export const mockBeforeAfterItems: BeforeAfterItem[] = [
  {
    id: "1",
    status: "published",
    sort: 1,
    title: "Moss and leaves cleared from a clay-tiled roofline",
    location: null,
    service: "Gutter vacuum cleaning",
    before_image: "/images/before.jpg",
    before_image_alt:
      "Example: a gutter blocked with moss and leaves, before cleaning",
    after_image: "/images/after.jpg",
    after_image_alt: "Example: the same gutter, clear after cleaning",
    is_example: true,
  },
  {
    id: "2",
    status: "published",
    sort: 2,
    title: "A gutter packed with leaves, flowing again",
    location: null,
    service: "Gutter vacuum cleaning",
    before_image: "/images/before-2.jpg",
    before_image_alt:
      "Example: a gutter overflowing with leaves and moss, before cleaning",
    after_image: "/images/after-2.jpg",
    after_image_alt: "Example: the same gutter, clear after cleaning",
    is_example: true,
  },
];

export const mockAreasPage: AreasPage = {
  id: 1,
  meta_title: "Areas we cover: Norwich & the whole of Norfolk",
  meta_description:
    "Power-Vac is based in Norwich and covers the whole of Norfolk, including Wymondham, Dereham, Aylsham, Thetford, Taverham, Sprowston and more.",
  hero_annotation: "where you’ll find us",
  hero_heading: "Gutters cleared\nacross *Norfolk*",
  hero_description:
    "Based in Norwich and covering the whole of Norfolk and the surrounding areas. These are the towns and villages we visit most.",
  city: "Norwich",
  towns_heading: "Main towns",
  // Tommy's list, 24 Sep 2026
  towns: [
    "Wymondham",
    "Attleborough",
    "Thetford",
    "Hethersett",
    "Dereham",
    "Watton",
    "Aylsham",
    "Swaffham",
    "Reepham",
    "Loddon",
    "Long Stratton",
  ],
  villages_heading: "Villages & residential areas",
  villages: [
    "Poringland",
    "Hingham",
    "Taverham",
    "Horsford",
    "Brundall",
    "Wroxham",
    "Acle",
    "Blofield",
    "Mulbarton",
    "Drayton",
    "Costessey",
    "Hellesdon",
    "Old Catton",
    "Sprowston",
    "Cringleford",
    "Framingham Earl",
    "Great Ellingham",
  ],
  coverage_heading: "Not on\nthe *list?*",
  coverage_description:
    "We cover the whole of Norfolk and the surrounding areas. Give us a ring or send the form and we’ll let you know.",
};

export const mockNewsPage: NewsPage = {
  id: 1,
  meta_title: "Gutter talk: news & advice",
  meta_description:
    "Gutter cleaning advice for Norfolk homes, plus news from Power-Vac Gutter Cleaning.",
  hero_annotation: "news & advice",
  hero_heading: "Gutter *talk*",
  hero_description:
    "Advice on looking after your gutters and roofline, and the latest from Power-Vac.",
};

// Draft articles for Tommy to read and approve before launch.
export const mockPosts: Post[] = [
  {
    id: "1",
    status: "published",
    slug: "how-often-should-norfolk-homes-clear-their-gutters",
    title: "How often should Norfolk homes clear their gutters?",
    topic: "Seasonal",
    date_published: "2026-10-14",
    excerpt:
      "Once a year suits most homes. Live near trees? Autumn and spring keeps the water flowing.",
    image: "/images/before-2.jpg",
    image_alt: "A gutter full of autumn leaves and moss",
    body: `<p>For most homes, once a year is enough to keep gutters flowing. The best time is late autumn, after the leaves have come down and before the winter rain sets in.</p>
<h2>When once a year isn’t enough</h2>
<p>If your house is near trees, leaves, seeds and twigs fill the gutters much faster. Twice a year works better: once in late autumn and again in spring, when the blossom and seeds have dropped.</p>
<h2>Moss makes a difference</h2>
<p>Norfolk’s damp winters are perfect for moss. On older tiled roofs it grows quickly and washes down into the gutters in clumps. If you can see moss on your roof, your gutters are probably filling up too.</p>
<h2>Signs it’s time for a clean</h2>
<ul>
<li>Water spilling over the edge of the gutter when it rains.</li>
<li>Plants or grass growing out of the gutter.</li>
<li>Gutters sagging or pulling away from the fascia.</li>
<li>Damp patches or stains on the walls below.</li>
</ul>
<p>Not sure? Ask us for a quote. With the camera on our pole we can see inside your gutters from the ground.</p>`,
    meta_title: "How often should you clean your gutters?",
    meta_description:
      "Once a year suits most Norfolk homes. Here’s when twice a year makes more sense, and the signs your gutters need clearing.",
  },
  {
    id: "2",
    status: "published",
    slug: "five-signs-your-downpipe-is-blocked",
    title: "Five signs your downpipe is blocked",
    topic: "Advice",
    date_published: "2026-10-07",
    excerpt:
      "Overflowing gutters aren’t always the gutter’s fault. Here’s how to tell when it’s the downpipe.",
    image: "/images/pole-house.jpg",
    image_alt: "A downpipe running down the wall of a red-brick house",
    body: `<p>A clear gutter can still overflow if the water has nowhere to go. When leaves and moss wash into the top of the downpipe, they can jam it completely. Here are five signs to look out for.</p>
<h2>1. The gutter overflows near the downpipe</h2>
<p>If water spills over the edge right by the outlet, the pipe below is often the problem.</p>
<h2>2. Gurgling or dripping inside the pipe</h2>
<p>A pipe that drains slowly makes noise long after the rain has stopped.</p>
<h2>3. Damp or green stains on the wall</h2>
<p>Water leaking from joints in a blocked pipe runs down the brickwork and leaves a mark.</p>
<h2>4. Puddles at the bottom</h2>
<p>If very little comes out of the bottom of the pipe during heavy rain, something is stopping it on the way down.</p>
<h2>5. Plants growing at the top</h2>
<p>Seedlings sprouting from the gutter outlet mean there’s soil and debris sitting in it.</p>
<p>Downpipe unblocking is an optional add-on to any gutter clean. Tick it on the quote form and we’ll take a look.</p>`,
    meta_title: "Five signs your downpipe is blocked",
    meta_description:
      "Overflowing gutters aren’t always the gutter’s fault. Five signs your downpipe is blocked, and what to do about it.",
  },
  {
    id: "3",
    status: "published",
    slug: "why-we-vacuum-from-the-ground-not-a-ladder",
    title: "Why we vacuum from the ground, not a ladder",
    topic: "Behind the scenes",
    date_published: "2026-09-30",
    excerpt:
      "No ladders against your walls, no mess on your lawn, and a camera that shows you the result.",
    image: "/images/pole-roofline.jpg",
    image_alt: "A gutter vacuum pole reaching a gutter from the ground",
    body: `<p>Gutters used to mean a ladder, a bucket and a trowel. We do it differently, with a SkyVac gutter vacuum on a long pole, working from the ground.</p>
<h2>Safer</h2>
<p>There’s no ladder leaning on your walls, windows or conservatory roof, and nobody balancing at the top of one.</p>
<h2>Cleaner</h2>
<p>The vacuum sucks the leaves, moss and silt straight into the machine. Nothing gets scooped out and dropped onto your lawn, path or flower beds.</p>
<h2>You can see it</h2>
<p>There’s a camera on the end of the pole, so we can see inside the gutter as we clean. It means we don’t miss a section, and you can see the result for yourself. Every job ends with before and after photos.</p>
<p>No ladders, no mess, just results.</p>`,
    meta_title: "Why we clean gutters from the ground",
    meta_description:
      "No ladders, no mess and a camera that shows you the result. Why Power-Vac vacuums gutters from the ground.",
  },
];

export const mockContactPage: ContactPage = {
  id: 1,
  meta_title: "Get a free gutter cleaning quote",
  meta_description:
    "Ring 01603 339225 or send the form for a free, no-obligation gutter cleaning quote anywhere in Norwich and Norfolk.",
  hero_annotation: "free, no-obligation quotes",
  hero_heading: "Get a\n*quote*",
  hero_description:
    "Ring, email or send the form. Tell us a little about your property and we’ll come back to you with a price.",
  hours_heading: "Opening hours",
  area_heading: "Where we work",
  area_description:
    "Based in Norwich and covering the whole of Norfolk and the surrounding areas.",
};

export const mockLegalPages: LegalPage[] = [
  {
    id: "1",
    status: "published",
    slug: "privacy",
    title: "Privacy",
    meta_description:
      "How Power-Vac Gutter Cleaning uses the details you send us.",
    last_updated: "2026-10-16",
    body: `<p>Power-Vac Gutter Cleaning is run by Tommy Sewell, a sole trader based in Norwich. This page explains what we do with the details you give us.</p>
<h2>What we collect</h2>
<p>When you ask for a quote using the form on this site, we collect your name, phone number, email address, postcode, the services you’re interested in and anything else you tell us. If you ring or email us, we keep the details you give us then.</p>
<h2>How we use it</h2>
<p>We use your details to reply to you, give you a quote, arrange and carry out the work, and send any invoices. We don’t sell your details or pass them to anyone for marketing.</p>
<h2>Where it’s kept</h2>
<p>Quote requests are stored securely in the system that runs this website, which is looked after by our web developer, Build 76. They only access it to keep the site running.</p>
<h2>How long we keep it</h2>
<p>We keep your details for as long as we need them to deal with your enquiry and any work that follows, and for as long as the law requires us to keep business and tax records.</p>
<h2>Your rights</h2>
<p>You can ask to see the details we hold about you, ask us to correct them or ask us to delete them. Email us at info@powervacguttercleaning.co.uk.</p>
<p>If you’re unhappy with how we’ve handled your details, you can complain to the Information Commissioner’s Office at ico.org.uk.</p>`,
  },
  {
    id: "2",
    status: "published",
    slug: "cookies",
    title: "Cookies",
    meta_description: "How Power-Vac Gutter Cleaning uses cookies.",
    last_updated: "2026-10-16",
    body: `<p>Cookies are small files a website saves on your device.</p>
<h2>Cookies on this site</h2>
<p>This site doesn’t use cookies to track you or to show you adverts. We don’t use analytics or advertising cookies.</p>
<p>If that changes, we’ll update this page and ask for your permission first.</p>
<h2>Controlling cookies</h2>
<p>You can block or delete cookies in your browser’s settings at any time.</p>`,
  },
];
