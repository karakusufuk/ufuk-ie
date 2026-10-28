// Words and picture order for every project page on ufuk.ie.
// Media file names refer to img/d/<slug>/.
const W169 = '16/10';
const v = (f, o = {}) => ({ v: f + '.mp4', ar: W169, ...o });
const im = (f, o = {}) => ({ i: f + '.jpg', ar: W169, ...o });
const ph = (f) => ({ i: f + '.jpg' });
const GF = (q) => `https://fonts.googleapis.com/css2?${q}&display=swap`;

const NEXT = {
  brennock: { slug: 'brennock', name: 'Brennock Haulage', sub: 'Haulage, Co. Meath', img: 'img/d/brennock/hero.jpg' },
  reilly: { slug: 'reilly', name: 'Reilly Engineering', sub: 'CNC machines, Swords', img: 'img/d/reilly/strip.jpg' },
  bawn: { slug: 'bawn', name: 'Bawn Growers', sub: 'Mushroom grower, Co. Monaghan', img: 'img/d/bawn/hero.jpg' },
  fennel: { slug: 'fennel', name: 'Fennel Dental', sub: 'Dental clinic, Dublin', img: 'img/w/fennel-1.jpg' },
  kenilworth: { slug: 'kenilworth', name: 'Kenilworth Vets', sub: 'Veterinary clinic, Dublin 6', img: 'img/w/kenilworth-1.jpg' },
  garvey: { slug: 'garvey', name: 'Garvey Lennon', sub: 'Solicitors, Dublin 2', img: 'img/w/garvey-1.jpg' },
  tierney: { slug: 'tierney', name: 'Tierney', sub: 'Logistics recruitment, Leinster', img: 'img/w/tierney-1.jpg' },
  midland: { slug: 'midland', name: 'Midland Motors', sub: 'Used car dealer, Athlone', img: 'img/w/midland-1.jpg' },
  monument: { slug: 'monument', name: 'Monument', sub: 'Estate agency, Dublin', img: 'img/w/monument-1.jpg' },
  lear: { slug: 'lear', name: 'Lear Residence', sub: 'Design-build developer, Kildare', img: 'img/w/lear-1.jpg' },
  ashgrove: { slug: 'ashgrove', name: 'Ashgrove House', sub: 'Country house hotel, Kilkenny', img: 'img/w/ashgrove-1.jpg' },
};


/* ===================================================================== KUS (case study, waiting for material)
   Not in the pages list yet: it goes live only when the real recordings are in ../site/img/d/kus/.
   To publish: move this object into `pages` right after Brennock, set NEXT chain (brennock → kus → reilly),
   add NEXT.kus, then rebuild. Every block needs a real recording; no placeholder text ever ships.
{
  slug: 'kus', title: 'KUS', name: ['KUS', 'Warehouse'],
  sum: '',                                   // one sentence: the problem and what it gains the business
  facts: { sector: 'Internal software, distribution warehouse', role: 'Research, design and build', built: '' },
  live: '', next: NEXT.reilly,
  fontLink: '',
  sections: [
    { t: 'cover', m: v('hero') },
    { h: '', blocks: [
      // { side: 'r', span: 7, m: v('profile'), b: '', p: '', pin: 6 },
    ] },
    { t: 'phones', h: 'On the phone', items: [] },
  ],
  deep: { h: 'Behind it', lede: '', rows: [] },
  closing: 'Every screen above is a recording of the live system, with company data replaced.',
},
*/

export const pages = [
/* ===================================================================== BRENNOCK */
{
  slug: 'brennock', title: 'Brennock Haulage', name: ['Brennock', 'Haulage'],
  sum: 'A ten-truck haulier that won work by phone. The new site lets a buyer see the trucks, check the paperwork for their load and ask for a price in two minutes.',
  facts: { sector: 'Road haulage, Co. Meath', role: 'Research, design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://brennock.ufuk.ie', next: NEXT.reilly,
  fontLink: GF('family=Archivo:wdth,wght@125,800&family=Instrument+Sans:wght@400;600'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'The homepage', blocks: [
      { side: 'r', span: 5, m: v('moving', { ar: '1/1' }), b: 'What are you moving?', p: 'A buyer landing on a haulier’s site has one question: do they carry my kind of load? I started the quote with the goods themselves, seven cards from chilled food to car parts, so buyers find their own cargo in the first second and know the firm already moves it.', pin: 6 },
      { side: 'l', span: 7, m: v('closing', { dark: true }), b: 'Loaded today, delivered by morning.', p: 'I closed the page with the shift from day to night to show what a haulier really sells: a service that keeps running for the customer around the clock. Goods loaded in the afternoon are on their dock before the first shift.', pin: 6 },
    ] },
    { h: 'Winning the load', blocks: [
      { side: 'r', span: 8, m: v('sectors'), b: 'The paperwork, per load', p: 'Buyers of chilled food or building materials always ask the same thing first: are you certified for this? I gave every sector its own page with what is carried, how, and under which certificates, so the phone call starts at the price instead of the paperwork.', pin: 6 },
      { side: 'l', span: 7, m: v('quote'), b: 'A quote without a phone call', p: 'Most buyers phone a haulier because the contact form is one empty box. I laid the whole quote out on one page with every step visible from the start, so they can see it takes two minutes, and the planner gets a request he can price instead of a voicemail.', pin: 6 },
      { side: 'r', span: 7, m: v('about'), b: 'A yard you can drive to.', p: 'I built the About page around the firm’s own yard to show its real scale and capacity, because a buyer handing over a load wants to know the trucks exist before they pick up the phone.', pin: 6 },
      { side: 'l', span: 7, m: v('careers'), b: 'Hiring is half the job', p: 'A haulier grows only as fast as it finds drivers, so I kept the careers page to a short list a driver can read in the cab: the route, the hours and the pay, and one tap to apply.', pin: 9 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Archivo Expanded', role: 'headlines', css: "'Archivo',sans-serif;font-stretch:125%", w: 800, sample: 'Freight that keeps its word.', ws: 800 },
      { name: 'Instrument Sans', role: 'text', css: "'Instrument Sans',sans-serif", w: 600, sample: 'Ten trucks, one yard in Ashbourne and a simple promise.' },
    ], colours: [
      { name: 'Cream page', hex: '#F1EEE6', edge: true }, { name: 'Military smoke', hex: '#2A332E' },
      { name: 'Road amber', hex: '#D9A23A' }, { name: 'Sage', hex: '#8F9B92' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Sectors' }, { m: ph('m3'), cap: 'Get a quote' }] },
  ],
  deep: {
    h: 'Behind it',
    lede: 'For agencies and anyone who wants the reasoning: what the business needed, what its competitors do, what I left out and what sits under the pages.',
    rows: [
      { h: 'The problem', ps: [
        'A small haulier lives on repeat customers and phone calls. When a new buyer looks them up, they find a logo, a phone number and a stock photo of a truck that is not theirs. Nothing says what they carry, whether they hold the right certificates, or what happens after a call.',
        'The site had to do the first conversation for them: show real trucks, answer the paperwork questions per load, and turn interest into a written quote request.' ] },
      { h: 'What others do, what I did', vs: [
        { o: 'Most Irish haulier sites list “general haulage, warehousing, logistics” in six identical boxes.', me: 'I gave each of the seven loads its own page: what is carried, how, and the certificates behind it.' },
        { o: 'Fleet pages list axle counts and engine sizes.', me: 'I showed the real yard and the real trucks, because the person booking a load wants to know the trucks exist, not their torque.' },
        { o: 'Stock photos of trucks that belong to someone else.', me: 'Every truck on the site carries the firm’s own logo.' },
        { o: 'A contact form with one empty text box, so most buyers phone instead.', me: 'I built a quote that starts from the goods and asks only what a planner needs to price the job.' } ] },
      { h: 'What I left out', li: [
        { t: 'A customer login and live tracking in the first release. They only earn their place once regular customers are using the site.' },
        { t: 'A separate services page and a fleet page. Sectors carry the services, and About carries the fleet.' },
        { t: 'Any statistic strip. “20 years, 500 clients” proves nothing and every competitor has one.' },
        { t: 'A full-screen map on Contact. It swallowed the scroll on laptops.' } ] },
      { h: 'How it is built', ps: [ 'Plain HTML, CSS and JavaScript, no framework, on GitHub Pages. Each page is light enough to open on a phone in a yard. The hero is one 1200 by 1200 photograph; the truck’s three positions are cut-outs placed on it, so the image never reloads.' ],
        li: [ { b: 'Scroll steps.', t: 'Wheel, keys and touch are read as gestures. One gesture plays one step; the momentum after it is absorbed.' },
              { b: 'Quote form.', t: 'Seven cargo cards, frequency, route, amount, date and contact on one page, sent as one structured message the planner can price.' },
              { b: 'Concept site.', t: 'Every form ends in a note that this is a portfolio piece, and no data is stored.' } ] },
      { h: 'Next phase', ps: [ 'A driver and delivery tracking portal for regular customers, designed as the next phase.' ] },
    ] },
  closing: 'Every screen above is a recording of the live site, not a mock-up.',
},

/* ===================================================================== REILLY */
{
  slug: 'reilly', title: 'Reilly Engineering', name: ['Reilly', 'Engineering'],
  sum: 'A CNC machine dealer selling €100,000 decisions. The site starts from the part a buyer needs to make and stays with the machine for its whole working life.',
  facts: { sector: 'CNC machine distributor, Swords', role: 'Research, design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://reilly.ufuk.ie', next: NEXT.bawn,
  fontLink: GF('family=IBM+Plex+Sans+Condensed:wght@600&family=IBM+Plex+Sans:wght@400&family=IBM+Plex+Mono:wght@400'),
  sections: [
    { t: 'cover', m: v('strip') },
    { h: 'Choosing a machine', blocks: [
      { side: 'r', span: 7, m: v('toggle'), b: 'By machine, or by part', p: 'A toolmaker who has to produce a hip stem doesn’t know which machine he needs; he knows the part. I added a switch that turns the machine strip into a strip of parts, each linked to the machines that make it, so he reaches the right machine without learning the catalogue.', pin: 6 },
      { side: 'l', span: 8, m: v('machine'), b: 'Buyers and owners on one page', p: 'A buyer weighing a €300,000 machine and an engineer who already runs one need different things from the same page. I put both behind one switch, specs and options for one, service, spares and upgrades for the other, so the dealer keeps selling to the customer long after the sale.', pin: 6 },
      { side: 'r', span: 7, m: v('parts'), b: 'A phone number, not a form', p: 'Engineers won’t upload a confidential drawing to a dealer they’ve never met. So I ended every part family with a phone number instead of a form: the conversation moves to the showroom, where the sale is actually made.', pin: 6 },
    ] },
    { h: 'After the sale', blocks: [
      { side: 'l', span: 8, m: v('checker'), b: 'Twenty years after the sale', p: 'A dealer earns most from a machine after it’s sold: used machines, spares, service and software. Competitors bury these in a footer menu. I gave them a full row on the homepage, so a buyer sees twenty years of support before he signs.', pin: 6 },
      { side: 'r', span: 7, m: v('service'), b: 'Spares for your machine only', p: 'An owner ordering a spare part is afraid of getting the wrong one. I let him pick his machine first, so the list shows only parts that fit, with stock and delivery time on every line. Fewer wrong orders for the dealer, and fewer calls to check.', pin: 6 },
    ] },
    { h: 'Why trust them', blocks: [
      { side: 'l', span: 7, m: v('since'), b: 'Since 1998', p: 'A €100,000 machine is bought from a person, not a logo. I led the page with the founder’s face and the year he started, because a buyer wants to know someone will still answer the phone in ten years.', pin: 6 },
      { side: 'r', span: 8, m: v('implant', { dark: true }), b: 'Precision you can put in a patient', p: 'Every machine dealer writes “high precision”. I showed it instead: a dental implant assembling at real tolerances. Medical work is the strongest proof of accuracy a dealer has, and here the buyer sees it rather than reads it.', pin: 6 },
      { side: 'l', span: 7, m: v('phone'), b: 'Call us, bring the part', p: 'For this buyer the next step is a conversation in the showroom with the part on the table. I set the phone number as large as a headline, so that step is impossible to miss.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'IBM Plex Sans Condensed', role: 'headlines', css: "'IBM Plex Sans Condensed',sans-serif", w: 600, sample: 'Precision you can put in a patient.', ws: 600 },
      { name: 'IBM Plex Mono', role: 'figures and specs', css: "'IBM Plex Mono',monospace", w: 400, sample: '5 axes · 650 × 520 × 475 mm · ±2 µm' },
    ], colours: [
      { name: 'Steel', hex: '#ECEEF0', edge: true }, { name: 'Graphite', hex: '#1B2024' },
      { name: 'RE blue', hex: '#1863B0' }, { name: 'Machine grey', hex: '#C9CFD3' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'A machine' }, { m: ph('m3'), cap: 'Parts' }] },
  ],
  deep: {
    h: 'Behind it',
    lede: 'How a machine dealer’s site was turned around: from a catalogue of machines to a guide that starts from the work.',
    rows: [
      { h: 'The problem', ps: [
        'A CNC distributor sells six machines that each cost as much as a house, to engineers who will run them for twenty years. Their sites read like brochures from the manufacturer: a photo, a spec table, a contact form.',
        'The real sale is long and technical, and most of the money comes after it: service, spare parts, upgrades and trade-ins. The site had to help a buyer narrow down the machine, and then keep being useful to the people already running one.' ] },
      { h: 'What others do, what I did', vs: [
        { o: 'Machines grouped by brand, which means nothing to a buyer who knows the part, not the model.', me: 'I added a switch that turns the machine strip into a strip of parts, each linked to the machines that make it.' },
        { o: '“Aerospace, Medical, Automotive” pages that repeat the same machines with new photos.', me: 'I made sectors into tags on machines and parts, and gave the medical work one scene that shows the precision instead of claiming it.' },
        { o: 'Demo forms that ask for drawings up front.', me: 'I ended the pages on a phone number and a line about signing an NDA, because toolmakers do not send drawings to a dealer they have never met.' },
        { o: 'The site stops at the sale.', me: 'I gave every machine page a second view for owners, with service plans, spare parts and upgrades, where most of a dealer’s money is made.' } ] },
      { h: 'What I left out', li: [
        { t: 'A sector menu. Sectors appear as tags on machines and parts, and the medical work has its own scene.' },
        { t: 'Any upload or quote form. The demo section is a phone number, an address and a line about signing an NDA.' },
        { t: 'Underlines, small eyebrow labels and step numbers. They added noise to pages that are already dense with figures.' } ] },
      { h: 'How it is built', ps: [ 'Plain HTML, CSS and JavaScript on GitHub Pages: six machine pages, six part families, used machines, service, about and contact, all generated from one data file so a spec only lives in one place.' ],
        li: [ { b: 'Machine strip.', t: 'The centre machine is a dead zone; the sides start a slow drift that speeds up near the edge, and it settles on the nearest machine when the pointer comes back.' },
              { b: 'Implant scene.', t: 'An SVG drawing pinned for the length of the section. The thread band is a masked copy of the implant body shifted by the thread pitch, so it looks like it turns.' },
              { b: 'Same data, two views.', t: 'The switch on each machine page swaps between two sets of the same record without reloading or moving the page.' } ] },
    ] },
  closing: 'Every screen above is a recording of the live site, not a mock-up.',
},

/* ===================================================================== BAWN */
{
  slug: 'bawn', title: 'Bawn Growers', name: ['Bawn', 'Growers'],
  sum: 'A mushroom grower selling by the pallet. Buyers order back from the day the mushrooms must be on the shelf, and the farm shows them every step until then.',
  facts: { sector: 'Fresh produce grower, Co. Monaghan', role: 'Research, design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://bawn.ufuk.ie', next: NEXT.fennel,
  fontLink: GF('family=Outfit:wght@600;700&family=Figtree:wght@400;500'),
  sections: [
    { t: 'cover', m: v('hero', { dark: true }) },
    { h: 'The range', blocks: [
      { side: 'l', span: 8, m: v('range'), b: 'Seven mushrooms, one standard', p: 'A supermarket buyer judges a supplier on consistency. I shot all seven mushrooms on the same surface in the same light, so the range reads as one standard and the buyer compares the products, not the photography.', pin: 6 },
      { side: 'r', span: 7, m: v('xp'), b: 'Pack size, one control', p: 'On the product page the real decision is the pack size. I turned it into one clear control instead of a dropdown and used the particles that build the logo there, so the brand moves in the one place the buyer actually acts.', pin: 6 },
      { side: 'l', span: 7, m: v('planner'), b: 'Start from the shelf day', p: 'A buyer thinks in shelf days; the farm thinks in harvests. I let the buyer pick the day the mushrooms must be on the shelf and showed the schedule the farm works back from, so both sides plan from the same date.', pin: 6 },
    ] },
    { h: 'The customer panel', lede: 'A depot buyer logs in to one screen that answers the questions they would otherwise phone about.', blocks: [
      { side: 'r', span: 8, m: v('cutoff'), b: 'The cutoff, always in sight', p: 'In fresh produce a missed order cutoff means an empty shelf. I put a bar under the header that fills towards two o’clock and says how much time is left, so no buyer misses Wednesday’s shelf by accident.', pin: 6 },
      { side: 'l', span: 8, m: v('plan'), b: 'Bank holidays, handled', p: 'Before every bank holiday the farm’s phone rings with the same question: will my order still arrive? I made the panel count back from the shelf day through cutoff, harvest, packing and dispatch, moving the chain around closed days and saying why. The question is answered before anyone calls.', pin: 6 },
      { side: 'r', span: 7, m: v('order'), b: 'A promise, not a stock level', p: 'Harvests change week to week, so a fixed stock figure would be a lie. I built ordering on the quantity promised to each customer, and the line turns red as soon as an order goes past it, before the farm has to ring and say no.', pin: 6 },
      { side: 'l', span: 7, m: v('dc'), b: 'Shelf life in the depot', p: 'A depot buyer needs to know which batch to sell first. I gave every batch in their depot a shelf-life bar and its batch code, so stock is rotated without asking and any case can be traced back to its grow room.', pin: 6 },
      { side: 'r', span: 7, m: v('trace'), b: 'Where every order is', p: '“Where is my order?” is the call every supplier gets. I showed four steps from picked to delivered on each order, so a buyer who can see the truck has left doesn’t need to phone.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Outfit', role: 'headlines and the logo', css: "'Outfit',sans-serif", w: 700, sample: 'Grown in the dark. On your shelf on time.', ws: 600 },
      { name: 'Figtree', role: 'text', css: "'Figtree',sans-serif", w: 500, sample: 'Order by Monday 14:00 to make this shelf date.' },
    ], colours: [
      { name: 'Deep navy', hex: '#0F1F3D' }, { name: 'Mushroom beige', hex: '#E8DCC4' },
      { name: 'Limestone', hex: '#EBE7E0', edge: true }, { name: 'Cutoff amber', hex: '#F2C27A' },
    ] },
    // phones removed until the Bawn mobile layout is redone: { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Products' }, { m: ph('m3'), cap: 'Customer panel' }] },
  ],
  deep: {
    h: 'Behind it',
    lede: 'Why a mushroom farm’s site is mostly a customer panel, and how the schedule underneath it works.',
    rows: [
      { h: 'The problem', ps: [
        'A large grower sells to supermarket depots, wholesalers and processors, never to the public. Its buyers do not need to be told that mushrooms are fresh; they need to know whether an order placed today will be on the shelf on Thursday, and what happens over a bank holiday.',
        'Today that is answered by phone and email. The site had to answer it on screen, and make the farm look like the most reliable supplier in the category.' ] },
      { h: 'What others do, what I did', vs: [
        { o: 'Quality brochures: sustainability, hygiene and a family photo. Every grower says the same.', me: 'I made the site mostly a customer panel that answers the questions buyers now ask by phone.' },
        { o: 'Recipe pages written for consumers who will never order.', me: 'I wrote every page for depot buyers, wholesalers and processors, and left the public out.' },
        { o: 'Order forms with a fixed “max stock” figure.', me: 'I built ordering on a quantity promised to each customer, because in a grow room stock is never fixed.' } ] },
      { h: 'What I left out', li: [
        { t: 'Dynamic pricing. Prices are fixed by contract; instead the panel says how full next week already is.' },
        { t: 'Sliced products and packs over 2.5 kg. Mushrooms crush, so the range stops there.' },
        { t: 'Particle effects anywhere but the pack-size bar. On banners and page changes they felt like a 2000s show site.' },
        { t: 'Water droplets on the product photos. They suggest a short shelf life; freshness is shown by the cold chain instead.' } ] },
      { h: 'How it is built', ps: [ 'Plain HTML, CSS and JavaScript. The panel runs on a fixed demo clock, so every visitor sees the same Monday morning, the same cutoff and the same orders.' ],
        flow: [ ['Order cutoff · Mon 14:00', 100], ['Harvest · Tue 05:00', 84], ['Packed · Tue 13:30', 66], ['Dispatched · Tue 22:00', 48], ['At your DC · Wed 04:30', 30], ['On shelf · Thu 08:00', 8] ],
        li: [ { b: 'Backward schedule.', t: 'The shelf day sets the depot slot the day before; a Sunday or bank holiday moves it back, and every earlier step follows from fixed handling times.' },
              { b: 'Promised quantities.', t: 'Each order line compares cases against the week’s promise and recalculates the totals and pallet count as you type.' },
              { b: 'Batch codes.', t: 'Every case carries a code that leads to its room, pick time, packing line, truck and temperature log.' } ] },
    ] },
  closing: 'Every screen above is a recording of the live site, not a mock-up.',
},

/* ===================================================================== FENNEL */
{
  slug: 'fennel', title: 'Fennel Dental', name: ['Fennel', 'Dental'],
  sum: 'A dental clinic that answers a nervous patient’s questions before they sit in the chair: what will happen, how long it takes and what it costs.',
  facts: { sector: 'Dental clinic, Dublin', role: 'Design and build', built: 'Astro, TypeScript, Claude Code' },
  live: 'https://fennel.ufuk.ie', next: NEXT.kenilworth,
  fontLink: GF('family=Geist+Mono:wght@400'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'Before the chair', blocks: [
      { side: 'l', span: 8, m: v('treat'), b: 'Know the treatment before the chair', p: 'Many people put off the dentist because they don’t know what will happen in the chair. I showed each treatment on a single tooth, with its length, visits, how it feels and the fee, so a nervous patient books already knowing what to expect.', pin: 6 },
      { side: 'r', span: 5, m: im('today', { ar: null }), b: 'Today’s free slots', p: 'Someone with toothache wants to know one thing: can I be seen today? I put today’s free appointments and the earliest time right under the headline, so the answer is the first thing they read.', pin: 6 },
      { side: 'l', span: 7, m: v('brings'), b: 'Start from the problem', p: 'Patients arrive with a problem, not a treatment name. I opened the booking with “What brings you in?”: two answers lead to one consultation with its length and fee, so nobody has to guess what to book.', pin: 6 },
    ] },
    { h: 'Choosing a person', blocks: [
      { side: 'r', span: 7, m: v('team'), b: 'Choose a person', p: 'People choose a dentist, not a clinic. I listed the team with each dentist’s next free slot on the same line, so choosing a person and booking an appointment become one decision.', pin: 6 },
      { side: 'l', span: 7, m: v('aoife'), b: 'A page per dentist', p: 'For a nervous patient, how a dentist works matters more than the list of treatments. I gave every dentist a page that says exactly that, with her next free slots beside it.', pin: 6 },
      { side: 'r', span: 7, m: v('book'), b: 'Book in under a minute', p: 'Every extra step in a booking form loses a patient to the clinic down the road. I cut it to treatment, dentist, day and time, with no account and no text code.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Bricolage Grotesque', role: 'headlines', css: "'Bricolage Grotesque',sans-serif", w: 600, sample: 'Know the plan before the chair.', ws: 600 },
      { name: 'Geist Mono', role: 'times and prices', css: "'Geist Mono',monospace", w: 400, sample: 'Today · 3 free · 14:30 earliest' },
    ], colours: [
      { name: 'Clinic white', hex: '#F3F4F2', edge: true }, { name: 'Ink', hex: '#0F1A24' },
      { name: 'Cobalt', hex: '#1F48C9' }, { name: 'Slate', hex: '#586470' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Treatments' }, { m: ph('m3'), cap: 'Booking' }] },
  ],
},

/* ===================================================================== KENILWORTH */
{
  slug: 'kenilworth', title: 'Kenilworth Vets', name: ['Kenilworth', 'Vets'],
  sum: 'A neighbourhood vet that feels like the practice itself: small, warm and quick to reach when something is wrong.',
  facts: { sector: 'Veterinary clinic, Dublin 6', role: 'Design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://kenilworth.ufuk.ie', next: NEXT.garvey,
  fontLink: GF('family=Source+Serif+4:opsz,wght@8..60,600&family=Hanken+Grotesk:wght@400;600'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'The first visit', blocks: [
      { side: 'l', span: 8, m: v('brings'), b: 'Start from the worry', p: 'Owners don’t come to a vet’s site looking for a service name. They come because the dog is limping or the cat stopped eating. So I opened the site with “What brings you in?”: the owner picks the worry, and it leads to the right appointment the first time.', pin: 6 },
      { side: 'r', span: 7, m: v('register'), b: 'Register in two minutes', p: 'Changing vet is the hardest moment to win a client. I made registering a short panel that opens from any page, including the old vet’s name so records can be requested, so a new owner signs up in two minutes without hunting for a form.', pin: 6 },
      { side: 'l', span: 7, m: v('emergency'), b: 'The emergency tab', p: 'In an emergency an owner can’t read a menu. I kept one tab on the edge of every page; opened, the rest of the site steps back and only the number and what to do while you wait remain.', pin: 6 },
    ] },
    { h: 'Owners who come back', blocks: [
      { side: 'r', span: 8, m: v('mypet'), b: 'My Pet', p: 'A practice lives on owners coming back for boosters and check-ups. I gave each pet a record with its vaccine timeline, weight and reminders, so owners see the next visit coming and book it on time.', pin: 6 },
      { side: 'l', span: 7, m: v('board'), b: 'The Noticeboard', p: 'A local vet is chosen on trust, and star ratings don’t build it. I replaced them with a noticeboard of birthdays, recoveries and goodbyes, so a new owner sees a practice that remembers its animals.', pin: 6 },
      { side: 'r', span: 7, m: v('trust'), b: 'People we trust', p: 'Owners ask their vet about walkers, groomers and boarding anyway. I grouped trusted local people by moments in an owner’s life, so the practice becomes the first place they ask, even when nothing is wrong.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Source Serif 4', role: 'headlines', css: "'Source Serif 4',serif", w: 600, sample: 'Your local vet, just off Kenilworth Square.', ws: 600 },
      { name: 'Hanken Grotesk', role: 'text', css: "'Hanken Grotesk',sans-serif", w: 600, sample: 'Two vets, two nurses and Gráinne on the desk.' },
    ], colours: [
      { name: 'Cream', hex: '#F6F1E7', edge: true }, { name: 'Navy', hex: '#1F3550' },
      { name: 'Mustard', hex: '#EBC15F' }, { name: 'Terracotta', hex: '#B9563A' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'My Pet' }, { m: ph('m3'), cap: 'Emergency' }] },
  ],
},

/* ===================================================================== GARVEY */
{
  slug: 'garvey', title: 'Garvey Lennon', name: ['Garvey', 'Lennon'],
  sum: 'A law firm site that starts with the client’s story instead of the firm’s credentials, and ends with the name of the solicitor who will handle it.',
  facts: { sector: 'Solicitors, Dublin 2', role: 'Design and build', built: 'Astro, TypeScript, Claude Code' },
  live: 'https://garveylennon.ufuk.ie', next: NEXT.tierney,
  fontLink: '',
  sections: [
    { t: 'cover', m: v('start') },
    { h: 'From a story to a person', blocks: [
      { side: 'l', span: 8, m: v('services'), b: 'Every area, with its solicitors', p: 'People hire a solicitor, not a firm. I put the names of the people who handle each area of law in the very first menu, so a client knows who they will talk to before they call.', pin: 6 },
      { side: 'r', span: 7, m: v('team'), b: 'The people you’ll sit down with', p: 'Someone with a family matter chooses the person before the price. I gave every solicitor a row with the law they handle and the languages they speak, with their photo appearing as you reach them, so the choice feels personal from the first screen.', pin: 6 },
      { side: 'l', span: 7, m: v('area'), b: 'What the first meeting costs', p: 'The question people are most embarrassed to ask a solicitor on the phone is what the first meeting costs. I answered it on every area page, along with what happens at that meeting and who handles it.', pin: 6 },
      { side: 'r', span: 6, m: v('lang'), b: 'English, Polish, Portuguese', p: 'Some of Dublin’s clients find it hard to explain a legal problem in English. So I put the languages each solicitor speaks next to their name and translated the whole flow into Polish and Portuguese. The firm reaches clients its competitors can’t, at the very first step.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Geist', role: 'headlines and text', css: "'Geist',sans-serif", w: 600, sample: 'Tell us what happened.', ws: 600 },
    ], colours: [
      { name: 'Paper', hex: '#F5F6F7', edge: true }, { name: 'Slate', hex: '#444F5A' },
      { name: 'Deep slate', hex: '#2F373F' }, { name: 'Ink', hex: '#151B21' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Family law' }, { m: ph('m3'), cap: 'About' }] },
  ],
},

/* ===================================================================== TIERNEY */
{
  slug: 'tierney', title: 'Tierney', name: ['Tierney', 'Recruitment'],
  sum: 'A recruitment agency for drivers, forklift operators and warehouse staff. Jobs read like shifts, not adverts, and a new driver can see the road to a licence.',
  facts: { sector: 'Logistics recruitment, Leinster', role: 'Design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://tierney.ufuk.ie', next: NEXT.midland,
  fontLink: GF('family=Rubik:wght@500;700'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'Finding a shift', blocks: [
      { side: 'l', span: 8, m: v('sectors'), b: 'Three doors', p: 'Most candidates already know which kind of work is theirs. I opened the site with three doors, haulage, warehouse and factory, each with its count of open jobs, so they go straight to their own list.', pin: 6 },
      { side: 'r', span: 7, m: v('jobs'), b: 'Jobs read like shifts', p: 'Every row says where, which shift and the hourly rate. Those are the three things a worker decides on, so I took them out of the advert text and into the row.', pin: 6 },
      { side: 'l', span: 7, m: v('strip'), b: 'Two roads', p: 'Licence holders and people who want to become drivers are different candidates. I split the page into two clear paths, so the agency can grow its own drivers instead of competing for the same few.', pin: 6 },
    ] },
    { h: 'Becoming a driver', blocks: [
      { side: 'r', span: 8, m: v('driver'), b: 'What’s left, how long, how much', p: 'Someone who wants to drive a truck doesn’t know where to start or what it costs. I let them tick what they already have and see the steps, time and cost left to a licence, so a vague idea becomes a plan, and the agency gets a candidate who knows what he is signing up for.', pin: 6 },
      { side: 'l', span: 7, m: v('candidate'), b: 'Your application', p: 'Candidates ring the office to ask where their application stands. I gave them a page with each application’s stage and the documents still missing, so the consultants spend their time placing people instead of answering calls.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Rubik', role: 'headlines and text', css: "'Rubik',sans-serif", w: 700, sample: 'Steady hours. Real work.', ws: 500 },
    ], colours: [
      { name: 'Navy', hex: '#13234A' }, { name: 'Reflector', hex: '#DCFF1C' },
      { name: 'Paper', hex: '#F3F5F8', edge: true }, { name: 'White', hex: '#FFFFFF', edge: true },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Jobs' }, { m: ph('m3'), cap: 'Become a driver' }] },
  ],
},

/* ===================================================================== MIDLAND */
{
  slug: 'midland', title: 'Midland Motors', name: ['Midland', 'Motors'],
  sum: 'A family car dealer that sells on proof. Every car comes with its full history and the workshop’s own inspection.',
  facts: { sector: 'Used car dealer, Athlone', role: 'Design and build', built: 'Astro, TypeScript, Claude Code' },
  live: 'https://midland.ufuk.ie', next: NEXT.monument,
  fontLink: GF('family=Archivo:wdth,wght@125,800&family=IBM+Plex+Sans:wght@400'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'Finding the car', blocks: [
      { side: 'l', span: 8, m: v('filters'), b: 'The filters Irish buyers use', p: 'Irish buyers ask the same questions on every forecourt: one owner, service history, kilometres, gearbox. I built the filters from those questions, and the button counts matches as you choose, so no search ever ends in “no results”.', pin: 6 },
      { side: 'r', span: 7, m: v('rows'), b: 'Every angle from the list', p: 'Buyers open listing after listing just to see the other side of a car. I let them turn each car through its angles by moving across the photo in the list, so they compare more cars in less time and open only the ones they mean.', pin: 6 },
    ] },
    { h: 'Proof', blocks: [
      { side: 'l', span: 7, m: v('passport', { dark: true }), b: 'A passport for every car', p: 'Used car buyers fear what they can’t see. I gave every car a passport, from first registration through owners, NCT and services to the workshop’s inspection, so the dealer sells on proof instead of promises.', pin: 6 },
      { side: 'r', span: 8, m: v('inspect', { dark: true }), b: 'What our workshop found', p: 'Every dealer says their cars are checked. I showed this dealer’s workshop findings part by part, what was checked and what was replaced, so the workshop, normally a cost, becomes the reason to buy here.', pin: 6 },
      { side: 'l', span: 7, m: v('history'), b: 'The full record', p: 'Buyers usually have to request a car’s history and wait for it. I put the whole record on one dated line on the car’s page, so there is nothing to ask for.', pin: 6 },
      { side: 'r', span: 7, m: v('monthly'), b: 'The monthly price, honestly', p: 'Most buyers think in monthly payments but don’t trust them. I made deposit and term change the figure instantly, with the full cost written underneath, so the buyer sees the total and trusts the monthly.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Archivo Expanded', role: 'headlines', css: "'Archivo',sans-serif;font-stretch:125%", w: 800, sample: 'Know where it’s been.', ws: 800 },
      { name: 'IBM Plex Sans', role: 'text', css: "'IBM Plex Sans',sans-serif", w: 400, sample: '2022 · 26,700 km · Diesel · Automatic' },
    ], colours: [
      { name: 'Bone', hex: '#F3F1ED', edge: true }, { name: 'Stage', hex: '#24272B' },
      { name: 'Wine', hex: '#8C2B3C' }, { name: 'Ink', hex: '#1C1E21' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Stock' }, { m: ph('m3'), cap: 'A car' }] },
  ],
},

/* ===================================================================== MONUMENT */
{
  slug: 'monument', title: 'Monument', name: ['Monument', 'Dublin'],
  sum: 'An independent estate agency built around Dublin’s neighbourhoods and the homes on its books.',
  facts: { sector: 'Estate agency, Dublin', role: 'Design and build', built: 'Astro, TypeScript, Claude Code' },
  live: 'https://monument.ufuk.ie', next: NEXT.lear,
  fontLink: GF('family=Libre+Caslon+Display&family=Hanken+Grotesk:wght@400'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'Finding the right home', blocks: [
      { side: 'r', span: 8, m: v('list'), b: 'A calm list', p: 'Buyers scan prices first and photographs second. I kept the list to address, area, price and status on one line, with the house appearing only on hover, so a buyer can compare a dozen homes in seconds.', pin: 6 },
      { side: 'l', span: 4, m: v('areas', { dark: true }), b: 'Six neighbourhoods', p: 'People buy a neighbourhood before they buy a house, and this agency only works where it knows the streets. I made the six areas a way into the listings, so the firm’s local knowledge is the first thing a buyer uses.', pin: 6 },
    ] },
    { h: 'Ready to view', blocks: [
      { side: 'r', span: 8, m: v('plan'), b: 'Floor by floor', p: 'A buyer who already understands the layout arrives at a viewing ready to decide. I drew a plan for every house, floor by floor and measured room by room, so viewings turn into offers sooner.', pin: 6 },
      { side: 'l', span: 7, m: im('viewing'), b: 'Book a viewing beside the photos', p: 'The moment a buyer likes a house is the moment to book a viewing. I put the booking right beside the photographs instead of at the bottom of the page.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Libre Caslon Display', role: 'headlines', css: "'Libre Caslon Display',serif", w: 400, sample: 'Find your place in Dublin.', ws: 400 },
      { name: 'Hanken Grotesk', role: 'text', css: "'Hanken Grotesk',sans-serif", w: 400, sample: '9 Herbert Park · Ballsbridge · €2,950,000' },
    ], colours: [
      { name: 'White', hex: '#FFFFFF', edge: true }, { name: 'Black', hex: '#0E0E0E' },
      { name: 'Monument pink', hex: '#C9146C' }, { name: 'Stone', hex: '#F3F4F5', edge: true },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Properties' }, { m: ph('m3'), cap: 'A home' }] },
  ],
},

/* ===================================================================== LEAR */
{
  slug: 'lear', title: 'Lear Residence', name: ['Lear', 'Residence'],
  sum: 'A developer selling one estate of three house types, presented as architecture rather than listings.',
  facts: { sector: 'Design-build developer, Kildare', role: 'Design and build', built: 'Astro, TypeScript, Claude Code' },
  live: 'https://lear.ufuk.ie', next: NEXT.ashgrove,
  fontLink: GF('family=Gloock&family=Instrument+Sans:wght@400'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'Three homes', blocks: [
      { side: 'l', span: 8, m: v('three'), b: 'Three homes. One landscape.', p: 'The developer designs and builds with one hand, so I showed the three house types as drawings first and photographs second: the drawing is the promise, the photograph is proof it was kept.', pin: 6 },
      { side: 'r', span: 7, m: v('homes', { dark: true }), b: 'What you see is what was drawn', p: 'Buyers of a new estate worry that the finished house won’t match the brochure. I made every house fade from its photograph into the drawing it was built from, so they see that what was designed is exactly what was built.', pin: 6 },
      { side: 'l', span: 7, m: v('house'), b: 'Inside the house', p: 'Someone buying a home that isn’t built yet needs to understand the space, not just admire it. I set photograph, drawing and cutaway side by side as they read, so the layout makes sense before the show home visit.', pin: 6 },
    ] },
    { h: 'The place and the firm', blocks: [
      { side: 'r', span: 8, m: v('rings'), b: 'Everything is close', p: 'Commuters don’t buy kilometres, they buy minutes. Instead of the usual list of distances, I drew rings of travel time around the estate, five minutes to Kildare Village and thirty to Dublin by train, so a buyer sees at once how their week would work from here.', pin: 6 },
      { side: 'r', span: 7, m: v('arch'), b: 'One firm from drawing to keys', p: 'Buyers fear the gaps between architect, builder and seller. I gave each step of the firm’s process a small drawing of its own, to show that one hand from first sketch to keys means fewer surprises.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Gloock', role: 'headlines', css: "'Gloock',serif", w: 400, sample: 'Homes designed and built by one hand.', ws: 400 },
      { name: 'Instrument Sans', role: 'text', css: "'Instrument Sans',sans-serif", w: 400, sample: 'Phase 1 · 7 homes remaining' },
    ], colours: [
      { name: 'Bottle green', hex: '#0E2A20' }, { name: 'Cream', hex: '#EFEBE2', edge: true },
      { name: 'Moss', hex: '#7A9F45' }, { name: 'Brick', hex: '#A9705C' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'The Court' }, { m: ph('m3'), cap: 'Show home' }] },
  ],
},

/* ===================================================================== ASHGROVE */
{
  slug: 'ashgrove', title: 'Ashgrove House', name: ['Ashgrove', 'House'],
  sum: 'A Georgian country house selling themed weekends: spa by day, live music by night.',
  facts: { sector: 'Country house hotel, Kilkenny', role: 'Design and build', built: 'HTML, CSS, JavaScript, Claude Code' },
  live: 'https://ashgrove.ufuk.ie', next: NEXT.brennock,
  fontLink: GF('family=Anton&family=Manrope:wght@400;600'),
  sections: [
    { t: 'cover', m: v('hero') },
    { h: 'The weekend', blocks: [
      { side: 'l', span: 7, m: v('weekend'), b: 'One weekend, hour by hour', p: 'The hotel sells weekends, not rooms. I laid out a whole weekend as a timeline with a photograph for each hour, so a guest can picture Friday night before booking it.', pin: 6 },
      { side: 'r', span: 8, m: im('weekends'), b: 'Two themes, one price', p: 'Couples comparing hotels get lost in add-ons and room rates. I showed every weekend as one package with both nights, what is included and how many rooms are left, so there is nothing left to compare.', pin: 6 },
    ] },
    { h: 'The house', blocks: [
      { side: 'l', span: 8, m: v('plan'), b: 'Book from the house plan', p: 'Most small hotels sell a room type from a list. I let guests choose the actual room on the plan of the house, seeing where it sits and how quiet or lively it is, the way you pick a seat at a concert. At Ashgrove the house is the reason to come, so the plan sells it.', pin: 6 },
      { side: 'r', span: 7, m: v('spa'), b: 'The Orangery spa', p: 'Spa treatments are usually booked at the front desk on arrival, if at all. I put them beside the rooms with times and prices, so the spa is booked together with the stay.', pin: 6 },
    ] },
    { t: 'kit', h: 'Type and colour', fonts: [
      { name: 'Anton', role: 'headlines', css: "'Anton',sans-serif", w: 400, sample: 'SPA BY DAY. SEISIÚN BY NIGHT.', ws: 400 },
      { name: 'Manrope', role: 'text', css: "'Manrope',sans-serif", w: 600, sample: 'Friday 21:00 · Latin night in the Coach House' },
    ], colours: [
      { name: 'Rose', hex: '#D99D97' }, { name: 'Ink', hex: '#1B1C1E' },
      { name: 'Soft white', hex: '#F5F5F3', edge: true }, { name: 'Latin violet', hex: '#6A3D98' },
    ] },
    { t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Weekends' }, { m: ph('m3'), cap: 'Rooms' }] },
  ],
},
];
