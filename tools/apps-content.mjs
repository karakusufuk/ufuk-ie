// The data of the three app pages (Master ID, PassPath, Match ID): copy, screens and timings, as approved on the boards.
// apps.mjs turns each entry into site/<slug>.html. Words and timings here are final: change them only on the owner's say-so.
//
// A screen is { img | vid, alt, poster? }. A screen marked `awaits: true` is a screen the owner has not sent yet:
// apps.mjs includes it only when its file exists in site/img/d/<slug>/ (see docs/ADDING-APP-SCREENS.md), together with the
// tap and "go" steps that bring it in. A block whose screens all await is left out of the page. Nothing awaits at the moment.
// Steps: ['h', ms] hold · ['t', x, y] tap · ['g', n] push screen n in · ['f', n] cross-fade to screen n · ['u', n] scroll on to screen n
// (the same page scrolled further down) · ['v', rate] play the video. A block may carry its own panel colours: c: [c1, c2, c3].
// `dur` is how long the screen takes to turn towards the note on the first run, in ms.
// appstore / play: store URLs. Empty until the owner sends them; an empty URL means its button is not rendered.

export const MASTER = {
  slug: 'master-id',
  title: 'Master ID',
  h1: ['Master', 'ID'],
  c: ['#7B3FE4', '#4A1BA8', '#1F0B58'],
  sum: 'Master ID is a quiz game with real depth. Players pick the subject they know best, from a football club to physics, and prove they are its master. Every collection has its own leaderboard, and whoever leads it holds that ground on the map.',
  facts: [['Genre', 'Quiz game'], ['Role', 'Design and build'], ['Languages', 'English, Turkish, Spanish']],
  cover: {
    kind: 'bar',
    rect: [57, 733, 287, 17],
    track: '#06200F',
    fill: 'linear-gradient(90deg,#9FDA86,#DDF3C6 55%,#7CCB78)',
    screens: [{ img: 'loading.jpg', alt: 'Master ID loading screen' }],
  },
  sections: [
    {
      h: 'A library, not a quiz',
      blocks: [
        {
          id: 'b-library',
          side: 'r',
          title: 'Something for everyone who knows something',
          text: 'A quiz with fifty questions is finished in a weekend. I built a library instead: categories, collections inside them, and quizzes with three levels, each drawing on a large pool of questions. Whatever someone is into, there is a corner of it here, and it does not run out.',
          screens: [{ vid: 'library.mp4', alt: 'Scrolling the Academy library', poster: 'academy.jpg' }],
          steps: [['v', 1], ['h', 300]],
          dur: 10500,
        },
        {
          id: 'b-academy',
          side: 'l',
          title: 'Prove it',
          text: 'The Academy is the heart of the game. A player picks the field they claim to know and plays it level by level, passing each one to move on. It is fun, not a certificate, but it turns a quiz into a statement: I know this better than you.',
          screens: [
            { img: 'academy.jpg', alt: 'Academy' },
            { img: 'football.jpg', alt: 'Football Clubs collection' },
            { vid: 'quiz.mp4', alt: 'A quiz starting and the first answers', poster: 'q-fill.jpg' },
          ],
          steps: [
            ['h', 600],
            ['t', 200, 631],
            ['g', 1],
            ['h', 2200],
            ['t', 200, 746],
            ['g', 2],
            ['v', 1],
            ['h', 300],
          ],
          dur: 17000,
        },
      ],
    },
    {
      h: 'A competition in every corner',
      blocks: [
        {
          id: 'b-map',
          side: 'r',
          py: 400,
          title: 'Top the board, hold the ground',
          text: 'Every collection has its own leaderboard, so there are hundreds of small competitions instead of one that only the best ever win. Whoever is first in a collection takes its ground on the map, where every other player can see who holds it.',
          screens: [
            { img: 'map-intro.jpg', alt: 'The map is there to take' },
            { img: 'map.jpg', alt: 'Map of the ground players have taken' },
          ],
          steps: [['h', 1900], ['t', 192, 671], ['g', 1], ['h', 3200]],
          dur: 6000,
        },
        {
          id: 'b-boards',
          side: 'l',
          title: 'A champion for every subject',
          text: 'World cities, car brands, football legends: every collection has its own table, and it starts again every Monday. Someone who will never top the overall board can be number one this week for the thing they love, and that is what brings them back.',
          screens: [
            { img: 'leaderboard.jpg', alt: 'All-time leaderboard' },
            { img: 'lb-cities.jpg', alt: 'World Cities weekly leaderboard' },
            { img: 'lb-cars.jpg', alt: 'Car Brands weekly leaderboard' },
            { img: 'lb-football.jpg', alt: 'Football Legends weekly leaderboard' },
          ],
          steps: [['h', 1500], ['g', 1], ['h', 1400], ['f', 2], ['h', 1400], ['f', 3], ['h', 1600]],
          dur: 8000,
        },
        {
          id: 'b-duel',
          side: 'r',
          title: 'Head to head',
          text: 'Knowledge feels different with a name on the other side. A duel puts two players on the same random questions, and one round settles who knows more.',
          screens: [{ img: 'duel.jpg', alt: 'Random duel' }, { img: 'duel-find.jpg', alt: 'Finding a rival' }],
          steps: [['h', 1300], ['t', 200, 238], ['f', 1], ['h', 2200]],
          dur: 4500,
        },
      ],
    },
    {
      h: 'The long road',
      blocks: [
        {
          id: 'b-journey',
          side: 'l',
          title: 'A road, not a menu',
          text: 'Some players do not want to choose. The Journey takes the choice away: one fixed road through the subjects, station by station, each one building something new on the way out into space, with points that multiply the further they go.',
          screens: [
            { img: 'journey-intro.jpg', alt: 'Journey: pass the stations one by one' },
            { img: 'journey-stations.jpg', alt: 'Journey stations' },
            { img: 'journey-space.jpg', alt: 'A Journey station out in space' },
          ],
          steps: [['h', 2000], ['g', 1], ['h', 1700], ['g', 2], ['h', 2200]],
          dur: 8000,
        },
      ],
    },
    {
      h: 'Five minutes',
      blocks: [
        {
          id: 'b-quick',
          side: 'r',
          title: 'When there is no time for depth',
          text: 'Not every visit is a long one. Quick Play and the spin wheel put a player into a question in two taps, for the queue at the shop or the end of a break, and the points still count toward their lifetime score.',
          screens: [
            { img: 'quick-pick.jpg', alt: 'Quick Play' },
            { img: 'quick-q.jpg', alt: 'A Quick Play question' },
            { vid: 'wheel.mp4', alt: 'Spinning the wheel', poster: 'spin.jpg' },
            { img: 'spin-q.jpg', alt: 'A time attack question' },
          ],
          steps: [['h', 700], ['t', 200, 706], ['g', 1], ['h', 1700], ['g', 2], ['v', 1], ['g', 3], ['h', 1800]],
          dur: 14000,
        },
      ],
    },
  ],
  colours: [
    ['Deep violet', '#4A1BA8'],
    ['Electric purple', '#8C4BFF'],
    ['Gold', '#F2B53A'],
    ['Answer green', '#2FC46B'],
  ],
  closing: 'Master ID is available in English, Turkish and Spanish.',
  appstore: '',
  play: '',
  next: {
    name: 'PassPath',
    line: 'Driving licence guide, Ireland',
    href: 'passpath.html',
    img: 'img/d/passpath/card.jpg',
  },
};

export const PASSPATH = {
  slug: 'passpath',
  title: 'PassPath',
  h1: ['Pass', 'Path'],
  c: ['#C04BD6', '#6A26B0', '#26104C'],
  sum: 'PassPath takes someone new to Irish roads from zero to the N plate. It works out their own route to a full licence, teaches the rules with animations in their own language, and shows them where and with whom to prepare.',
  facts: [
    ['Sector', 'Driver education'],
    ['Role', 'Research, design and build'],
    ['Built for', 'Ireland and eight more countries'],
  ],
  cover: {
    kind: 'video',
    rest: 1800,
    screens: [{ vid: 'speedo.mp4', alt: 'From L to N on the speedometer', poster: 'road-start.jpg' }],
  },
  sections: [
    {
      h: 'A guide, not a question bank',
      blocks: [
        {
          id: 'b-onboard',
          side: 'r',
          title: 'The whole road from the first minute',
          text: 'Most theory apps open on question one. PassPath opens on the whole road: the permit, the eye test, the lessons and the test, so a learner knows what lies ahead before they answer anything, in the language they choose.',
          screens: [{ vid: 'onboard.mp4', alt: 'Welcome screens in many languages', poster: 'enter.jpg' }],
          steps: [['v', 1], ['h', 300]],
          dur: 18500,
        },
        {
          id: 'b-path',
          side: 'l',
          title: 'Your road, not everyone’s',
          text: 'The rules are different for an Irish learner, for someone with a licence from abroad and for someone who has never driven. I ask a few plain questions first, what they will drive, where their licence is from and how long they have held it, and the app builds their own path from the answers.',
          screens: [
            { img: 'drive.jpg', alt: 'What will you drive?' },
            { img: 'country.jpg', alt: 'Which country is your licence from?' },
            { img: 'road.jpg', alt: 'Your road as a foreign licence holder starts here' },
            {
              img: 'exchange.jpg',
              alt: 'Their own path from a foreign licence to an Irish one, in their own language',
            },
            { img: 'exchange-2.jpg', alt: 'The rest of the path to the Irish licence' },
          ],
          steps: [
            ['h', 700],
            ['t', 355, 304],
            ['h', 250],
            ['g', 1],
            ['h', 1500],
            ['t', 67, 455],
            ['h', 250],
            ['g', 2],
            ['h', 1600],
            ['t', 201, 735],
            ['g', 3],
            ['h', 2000],
            ['u', 4],
            ['h', 2200],
          ],
          dur: 12500,
        },
        {
          id: 'b-journey',
          side: 'r',
          py: 505,
          title: 'Always the next step',
          text: 'Each step on the path shows what it costs, what it needs and when it was done, and the next one is always waiting. Nobody has to search a forum to find out what comes after the permit.',
          screens: [{ img: 'journey.jpg', alt: 'Journey: theory test, permit, learner period, lessons' }],
          steps: [['h', 5000]],
          dur: 5000,
        },
      ],
    },
    {
      h: 'Don’t memorise. Learn it and pass first time.',
      blocks: [
        {
          id: 'b-learn',
          side: 'l',
          title: 'Don’t memorise. Learn it and pass first time.',
          text: 'Memorised answers fade the week after the test. Each rule in PassPath is a short animated scene, a car pulling in, a pelican crossing, a driver too close behind, so learners understand why the answer is right and take it onto the road.',
          screens: [
            { img: 'prepare.jpg', alt: 'Prepare' },
            { vid: 'anim.mp4', alt: 'A car checks, signals and pulls in to the left', poster: 'anim-0.jpg' },
            {
              vid: 'hazard.mp4',
              alt: 'At a pelican crossing the car waits while a pedestrian crosses',
              poster: 'hazard-0.jpg',
            },
            { img: 'risk.jpg', alt: 'Managing risk question' },
          ],
          steps: [
            ['h', 800],
            ['t', 201, 429],
            ['g', 1],
            ['v', 1],
            ['h', 400],
            ['g', 2],
            ['v', 1],
            ['h', 300],
            ['g', 3],
            ['h', 2000],
          ],
          dur: 20000,
        },
        {
          id: 'b-practise',
          side: 'r',
          title: 'Practice that finds the gaps',
          text: 'Mock tests run like the real one, with the real timing and pass mark. Weak topics come back until they are learned, and a home screen widget asks a question a few times a day, so revision happens in the queue, not only at the desk.',
          screens: [
            { img: 'practise.jpg', alt: 'How do you want to practise?' },
            { img: 'signals.jpg', alt: 'Hand signals and Garda signals' },
          ],
          steps: [['h', 2200], ['g', 1], ['h', 2000]],
          dur: 4800,
        },
      ],
    },
    {
      h: 'Where and with whom',
      blocks: [
        {
          id: 'b-map',
          side: 'l',
          py: 664,
          title: 'Choose the centre with the data',
          text: 'Pass rates are not the same from one test centre to the next. I put every theory and driving test centre in Ireland on one map with its pass rate, and one tap finds an approved instructor nearby.',
          screens: [
            { img: 'ireland.jpg', alt: 'Ireland map of test centres' },
            { img: 'centres.jpg', alt: 'Driving test centres' },
            { img: 'dublin.jpg', alt: 'Mulhuddart test centre with its pass rate' },
          ],
          steps: [['h', 1000], ['f', 1], ['h', 900], ['t', 333, 518], ['f', 2], ['h', 2600]],
          dur: 6000,
        },
      ],
    },
    {
      h: 'In their own language',
      blocks: [
        {
          id: 'b-lang',
          side: 'r',
          title: 'Learn in the language you think in',
          text: 'Ireland’s new drivers come from everywhere. Questions and their explanations can be switched into the learner’s own language, so the rule is understood first and the English wording learned on top of it.',
          screens: [{ img: 'lang.jpg', alt: 'Language picker' }],
          steps: [['h', 4500]],
          dur: 4500,
        },
      ],
    },
    {
      h: 'More roads',
      blocks: [
        {
          id: 'b-more',
          side: 'l',
          c: ['#E2802E', '#A4461B', '#3A1608'],
          title: 'The same system, a taxi licence',
          text: 'Taxi Pass is the same system, built for Ireland’s SPSV taxi licence. A driver picks taxi, hackney or limousine and the county they will work in, and gets their own seven steps from the entry test to the roof sign, with the fee and the waiting time on each. The same system also runs for eight more countries.',
          screens: [
            { img: 'taxi-1.jpg', alt: 'Taxi Pass: what will you drive?' },
            { img: 'taxi-2.jpg', alt: 'Which county will you work in?' },
            { img: 'taxi-3.jpg', alt: 'Have you held a full driving licence for 12 months?' },
            { img: 'taxi-4.jpg', alt: 'Your road to the SPSV licence starts here' },
            { img: 'taxi-5.jpg', alt: 'Set up your profile' },
            { img: 'taxi-6.jpg', alt: 'Profile with a photo of the car' },
            { img: 'taxi-7.jpg', alt: 'You’re all set' },
            { img: 'taxi-8.jpg', alt: 'Journey from the entry test to the SPSV licence' },
            { img: 'taxi-9.jpg', alt: 'Tax clearance, licence fee and the Garda application' },
            { img: 'taxi-10.jpg', alt: 'Licence cards and getting on the road' },
          ],
          steps: [
            ['h', 800],
            ['t', 354, 334],
            ['h', 250],
            ['g', 1],
            ['h', 900],
            ['t', 147, 391],
            ['h', 250],
            ['g', 2],
            ['h', 900],
            ['t', 355, 508],
            ['h', 250],
            ['g', 3],
            ['h', 1300],
            ['t', 201, 626],
            ['g', 4],
            ['h', 800],
            ['t', 252, 358],
            ['f', 5],
            ['h', 900],
            ['t', 201, 797],
            ['g', 6],
            ['h', 1300],
            ['t', 201, 797],
            ['g', 7],
            ['h', 1800],
            ['u', 8],
            ['h', 1300],
            ['u', 9],
            ['h', 1800],
          ],
          dur: 20000,
        },
      ],
    },
  ],
  colours: [['Violet', '#6A26B0'], ['Magenta', '#D34BD9'], ['Night', '#141225'], ['Road white', '#F4F2F7']],
  closing: 'PassPath is built for learners in Ireland, in their own language.',
  appstore: '',
  play: '',
  next: { name: 'Match ID', line: 'Word game', href: 'match-id.html', img: 'img/d/match-id/card.jpg' },
};

export const MATCH = {
  slug: 'match-id',
  title: 'Match ID',
  h1: ['Match', 'ID'],
  c: ['#2E4677', '#18264D', '#0A1128'],
  sum: 'Match ID is a word-pairing game that keeps changing its rule: the same words, words that belong together, opposites, a player and their club, and tiles you have to wash, unlock or beat the clock to reach, across 150 levels.',
  facts: [['Genre', 'Word game'], ['Role', 'Design and build'], ['Levels', '150']],
  cover: {
    kind: 'bar',
    rect: [106, 298, 190, 13],
    track: '#0B1430',
    fill: 'linear-gradient(90deg,#1E8AE6,#7FD8FF)',
    screens: [{ img: 'loading.jpg', alt: 'Match ID loading screen' }],
  },
  sections: [
    {
      h: 'One rule that keeps moving',
      blocks: [
        {
          id: 'b-rules',
          side: 'r',
          title: 'Same game, a new way to think',
          text: 'Matching two identical words is easy. Then the rule changes: a country and its dish, an opposite, a word that starts where the last one ended. Players never settle into one habit, which keeps a short game interesting for 150 levels.',
          screens: [
            { img: 'same.jpg', alt: 'Matching the same words' },
            { img: 'swiss.jpg', alt: 'Two belong together: Switzerland and fondue' },
            { img: 'india.jpg', alt: 'Two belong together: India and curry' },
            { img: 'wrong.jpg', alt: 'A wrong pair costs points' },
          ],
          steps: [['h', 1400], ['g', 1], ['h', 1400], ['f', 2], ['h', 1300], ['g', 3], ['h', 1400]],
          dur: 7500,
        },
      ],
    },
    {
      h: 'Another world for a duel',
      blocks: [
        {
          id: 'b-snow',
          side: 'l',
          c: ['#9CC9F2', '#3E6FB4', '#0E2350'],
          big: true,
          title: 'A new world for a duel',
          text: 'Choosing to play a stranger takes the player somewhere new: the night scene melts into snow before the duel begins. I made the switch a moment of its own, so a game against another person feels like an event, not just the next level.',
          screens: [
            {
              vid: 'snow.mp4',
              alt: 'Tapping Play turns the night scene into a snowy one for a duel',
              poster: 'snow-0.jpg',
            },
          ],
          steps: [['h', 300], ['t', 201, 326], ['v', 1], ['h', 900]],
          dur: 7800,
        },
      ],
    },
    {
      h: 'Tiles that fight back',
      blocks: [
        {
          id: 'b-mud',
          side: 'r',
          py: 462,
          title: 'Wash it before you play it',
          text: 'Some tiles hide behind mud, a lock, a bomb or a timer. Mud comes off with a bucket of water won in earlier rounds, so the tools a player saves are worth something later, and every level asks for a little plan.',
          screens: [
            { img: 'same.jpg', alt: 'A tile covered in mud' },
            { img: 'bucket.jpg', alt: 'Washing the tile with a bucket of water' },
            { img: 'washed.jpg', alt: 'The tile washed clean' },
          ],
          steps: [['h', 1300], ['f', 1], ['h', 1700], ['f', 2], ['h', 1900]],
          dur: 6000,
        },
      ],
    },
    {
      h: 'Better with someone',
      blocks: [
        {
          id: 'b-duel',
          side: 'l',
          title: 'A rival on the same board',
          text: 'Players can take on a random opponent or invite a friend by nickname, both on the same board at once, with chat they can switch on or off. Practice rivals with their own levels and badges fill the gap when nobody is online.',
          screens: [
            { img: 'duel.jpg', alt: 'A duel on one board' },
            { img: 'duel2.jpg', alt: 'The duel later in the round' },
            { img: 'rival.jpg', alt: 'Practice rival with level and badges' },
          ],
          steps: [['h', 1600], ['f', 1], ['h', 1500], ['g', 2], ['h', 2000]],
          dur: 6500,
        },
        {
          id: 'b-done',
          side: 'r',
          py: 636,
          title: 'A reason to play one more',
          text: 'Every level ends on a clear score: pairs, time and the running total. Watching a short ad doubles it, so the game earns its keep without putting a wall in front of anyone who would rather not watch.',
          screens: [{ img: 'done.jpg', alt: 'Level complete with score and double-score button' }],
          steps: [['h', 4500]],
          dur: 4500,
        },
      ],
    },
  ],
  colours: [
    ['Night navy', '#18264D'],
    ['Ice blue', '#7FD8FF'],
    ['Lantern gold', '#F2B33D'],
    ['Match green', '#3BD47A'],
  ],
  closing: 'Match ID runs on iPhone and Android.',
  appstore: '',
  play: '',
  next: {
    name: 'Reilly Engineering',
    line: 'CNC machines, Swords',
    href: 'reilly.html',
    img: 'img/d/reilly/strip.jpg',
    w: 1440,
    h: 900,
  },
};

export const APPS = [MASTER, PASSPATH, MATCH];
