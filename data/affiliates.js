// =============================================================================
// AFFILIATE CONFIG — update this block only when you get approved.
// Every link on the site is built from these base URLs.
// =============================================================================
const CFG = {
  // Udemy Affiliates (via Impact) — approved base URL looks like:
  // https://click.linksynergy.com/deeplink?id=YOUR_ID&mid=39197&murl=https%3A%2F%2Fwww.udemy.com%2Fcourses%2Fsearch%2F%3Fq%3D
  udemy: 'https://www.udemy.com/courses/search/?q=',

  // Coursera Affiliates (via Impact) — approved base URL looks like:
  // https://click.linksynergy.com/deeplink?id=YOUR_ID&mid=40328&murl=https%3A%2F%2Fwww.coursera.org%2Fsearch%3Fquery%3D
  coursera: 'https://www.coursera.org/search?query=',

  // Jumia Affiliates (Nigeria) — approved base URL looks like:
  // https://c.jumia.io/?a=YOUR_ID&p=link&E=ecs&W=https%3A%2F%2Fwww.jumia.com.ng%2Fcatalog%2F%3Fq%3D
  jumia: 'https://www.jumia.com.ng/catalog/?q=',

  // Selar (Nigerian digital products) — approved base URL looks like:
  // https://selar.co/YOUR_REF?q=
  selar: 'https://selar.co/search?q=',

  // Amazon Associates — approved base URL looks like:
  // https://www.amazon.com/s?tag=YOUR_TAG&k=
  amazon: 'https://www.amazon.com/s?k=',
};

// URL helpers — call with a search term, returns a full affiliate link
const ud = q => CFG.udemy    + encodeURIComponent(q);
const co = q => CFG.coursera + encodeURIComponent(q);
const ju = q => CFG.jumia    + encodeURIComponent(q);
const se = q => CFG.selar    + encodeURIComponent(q);
const am = q => CFG.amazon   + encodeURIComponent(q);

// =============================================================================

export const AFF_DISCLOSURE = 'For grown-ups: some links here are affiliate links. If you buy through them we may earn a small commission, at no extra cost to you. Picks are chosen to fit what was just played.';

export const RECS = {
  // ---- Kids — parent-facing (Jumia for physical, Udemy for courses) ----
  math:   [{e:'🧮',t:'Maths for Kids',          b:'Playful number challenges.',              u:ju('maths kids educational')},
           {e:'🔢',t:'Primary School Maths',     b:'Number sense for early learners.',        u:ud('math for kids')}],
  words:  [{e:'📕',t:'Reading & Vocabulary',     b:'Grow vocabulary the fun way.',            u:ju('english reading kids')},
           {e:'🔤',t:'English for Children',     b:'Word and sentence skills.',               u:ud('reading english kids')}],
  logic:  [{e:'🧩',t:'Logic Puzzles for Kids',  b:'Patterns and deduction, age-graded.',    u:ju('logic puzzle kids')},
           {e:'🤖',t:'Coding for Kids',          b:'Sequences and loops, off-screen.',        u:ud('coding kids beginner')}],
  science:[{e:'🔬',t:'Science Experiments',     b:'Safe "why does it happen" learning.',     u:ju('science kit kids')},
           {e:'🌍',t:'Nature & Science',         b:'Feeds endless curiosity.',                u:ud('science kids experiments')}],

  // ---- Adults — by profession (Udemy + Coursera) ----
  dev:       [{e:'💻',t:'Algorithms & Problem Solving', b:'Turn reasoning into real coding skill.',  u:ud('algorithms data structures')},
              {e:'📘',t:'Clean Code & Interview Prep',  b:'Sharpen the edge-case instinct.',         u:ud('clean code interview preparation')}],
  doctor:    [{e:'🩺',t:'Clinical Reasoning',          b:'Diagnostic thinking and probability.',    u:ud('clinical reasoning diagnosis')},
              {e:'📋',t:'Medical Statistics',           b:'Evidence-based medicine, simplified.',    u:co('medical statistics evidence')}],
  lawyer:    [{e:'⚖️',t:'Legal Reasoning',             b:'Conditional logic, formalised.',          u:ud('legal reasoning law')},
              {e:'📜',t:'Contract & Tort Law',          b:'Core legal principles and argument.',     u:co('law contract tort')}],
  designer:  [{e:'🎨',t:'UX & UI Design Fundamentals', b:'Hierarchy, layout and user clarity.',    u:ud('ux ui design fundamentals')},
              {e:'🖥️',t:'Design Thinking',             b:'User research to working prototype.',     u:co('design thinking')}],
  engineer:  [{e:'⚙️',t:'Systems Thinking',            b:'Trade-offs, reliability, failure modes.', u:ud('systems thinking engineering')},
              {e:'🔧',t:'Engineering Fundamentals',    b:'Core mechanics and analysis.',            u:co('engineering fundamentals')}],
  teacher:   [{e:'📚',t:'Instructional Design',        b:'Explaining hard ideas simply.',           u:ud('instructional design teaching')},
              {e:'🏫',t:'Learning Sciences',           b:'How people actually learn.',              u:co('learning science education')}],
  nclex:     [{e:'🏥',t:'NCLEX-RN Exam Prep',b:'Practice questions and clinical reasoning for NCLEX.',u:ud('NCLEX RN exam prep')},
              {e:'📋',t:'Pharmacology for Nurses',b:'Drug calculations and medication safety.',u:ud('pharmacology nurses NCLEX')}],
  nurse:     [{e:'💊',t:'Clinical Nursing Skills',     b:'Triage, dosage and patient safety.',     u:ud('nursing clinical skills')},
              {e:'🏥',t:'Patient Assessment',           b:'Systematic head-to-toe approach.',       u:co('nursing patient assessment')}],
  founder:   [{e:'🚀',t:'Startup & Entrepreneurship',  b:'Decisions under uncertainty.',           u:ud('startup entrepreneurship lean')},
              {e:'📈',t:'Business Strategy',            b:'From idea to scalable model.',            u:co('business strategy entrepreneurship')}],
  accountant:[{e:'📊',t:'Accounting & Finance',        b:'Statements, margins and audit logic.',   u:ud('accounting financial analysis')},
              {e:'💹',t:'Financial Reporting',          b:'IFRS, ratios and interpretation.',       u:co('financial accounting reporting')}],
  scientist: [{e:'🔬',t:'Research Methods',            b:'Hypotheses, controls and evidence.',     u:ud('research methods statistics')},
              {e:'📉',t:'Data Science & Statistics',   b:'From p-values to Bayesian thinking.',    u:co('data science statistics')}],
  pilot:     [{e:'✈️',t:'Aviation Ground School',      b:'Procedures and decision-making.',        u:ud('aviation pilot ground school')},
              {e:'🛫',t:'Meteorology for Pilots',       b:'Weather and flight safety basics.',      u:ud('meteorology aviation weather')}],
  chef:      [{e:'🍳',t:'Culinary Techniques',         b:'Ratios, timing and sequencing.',         u:ud('culinary cooking techniques fundamentals')},
              {e:'🍽️',t:'Food Science',                b:'The chemistry behind great cooking.',    u:ud('food science cooking chemistry')}],
  journalist:[{e:'📰',t:'Journalism & Fact-checking',  b:'Sourcing, bias and verification.',       u:ud('journalism media literacy writing')},
              {e:'✍️',t:'Investigative Writing',        b:'Story structure and source protection.', u:co('journalism writing reporting')}],
  architect: [{e:'📐',t:'Architecture & Design',       b:'Space, constraints and structure.',      u:ud('architecture design thinking')},
              {e:'🏛️',t:'Structural Fundamentals',     b:'Loads, materials and building systems.', u:co('architecture structural design')}],
  detective: [{e:'🕵️',t:'Critical Thinking',          b:'Inference, evidence and deduction.',     u:ud('critical thinking logic')},
              {e:'🔍',t:'Forensic Science Basics',     b:'Evidence analysis and chain of custody.',u:co('forensic science criminology')}],

  // ---- By reasoning strength (Mind Map) ----
  Logic:   [{e:'🧠',t:'Logic & Critical Thinking',   b:'Pure deduction workouts.',                u:ud('logic critical thinking')}],
  Pattern: [{e:'🔷',t:'Pattern Recognition & IQ',    b:'Sequences and visual patterns.',          u:ud('pattern recognition iq')}],
  Numbers: [{e:'➗',t:'Mental Maths & Arithmetic',   b:'Faster, sharper number sense.',           u:ud('mental math arithmetic')}],
  Verbal:  [{e:'🔠',t:'Vocabulary & Verbal Reasoning',b:'Word reasoning and analogies.',          u:ud('verbal reasoning vocabulary')}],
  Spatial: [{e:'📐',t:'Spatial Reasoning',           b:'Shapes, symmetry and rotation.',          u:ud('spatial reasoning geometry')}],
  Lateral: [{e:'💡',t:'Lateral Thinking & Creativity',b:'The sideways-thinking workout.',         u:ud('lateral thinking creativity')}],
};
