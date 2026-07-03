/* ============================================================
   Tech Med — Blog & health-news content
   ------------------------------------------------------------
   HOW TO ADD OR UPDATE A POST
   1. Copy one { ... } block below.
   2. Change the text. Keep the commas between blocks.
   3. To use a real photo, put the file in  images/  and set
        image: "images/my-photo.jpg"
      Then the coloured placeholder is ignored automatically.
   4. Save + commit. The newest post should go at the TOP.

   Fields:
     id       unique short string
     tag      little category label (e.g. "Nutrition")
     title    headline
     date     "Mon DD, YYYY"
     summary  one-line teaser (shown on cards)
     body     the full article (shown after "Read more")
     image    optional "images/xxx.jpg"  — leave "" to use a colour tile
     hue      tile colour: mint | coral | sky | plum | gold
     icon     an emoji shown on the tile
     featured true for the single big post at the top of Home
   ============================================================ */

const BLOGS = [
  {
    id: "sleep-immunity",
    tag: "Daily Finding",
    title: "Why 7 hours of sleep does more for immunity than any supplement",
    date: "Jul 01, 2026",
    summary: "New reviews keep pointing to the same free medicine: consistent sleep.",
    image: "",
    hue: "plum",
    icon: "😴",
    featured: true,
    body:
`Researchers reviewing years of immune-system data keep returning to one unglamorous conclusion: sleep is one of the strongest levers most people have, and it costs nothing.

During deep sleep the body produces and redistributes infection-fighting cells and clears metabolic waste from the brain. Cut sleep short for even a few nights and measurable markers of inflammation rise while vaccine responses weaken.

What actually helps, in order of impact:
• A consistent wake-up time — even on weekends — anchors your whole rhythm.
• Morning daylight within an hour of waking.
• A cool, dark room and a screen curfew 45 minutes before bed.
• Caffeine before early afternoon only.

You don't need a perfect eight hours. Aim for a regular window and protect it like an appointment.`
  },
  {
    id: "walking-snacks",
    tag: "Movement",
    title: "\"Exercise snacks\": tiny bursts of movement add up",
    date: "Jun 29, 2026",
    summary: "Two-minute walks after meals blunt blood-sugar spikes.",
    image: "",
    hue: "mint",
    icon: "🚶",
    body:
`You don't have to block out an hour at the gym to get real benefit. Short, frequent bouts — nicknamed "exercise snacks" — are turning out to matter more than we thought.

A two-to-five minute walk after eating helps muscles pull glucose out of the bloodstream, which softens the post-meal spike linked to fatigue and long-term metabolic strain. Standing up and moving once an hour also counters the stiffness and circulation dips of long sitting.

Easy ways to stack them: walk while a call is on audio, take stairs as a deliberate set, or do ten squats every time the kettle boils. Consistency beats intensity here.`
  },
  {
    id: "hydration-myth",
    tag: "Nutrition",
    title: "The 8-glasses rule is a myth — here's the honest version",
    date: "Jun 27, 2026",
    summary: "Your needs vary with heat, size, and activity. Thirst is a decent guide.",
    image: "",
    hue: "sky",
    icon: "💧",
    body:
`The famous "eight glasses a day" number was never based on strong evidence. Real fluid needs swing with body size, temperature, altitude, and how much you move — and a lot of water arrives through food and other drinks.

A more useful approach: drink to thirst, and check the colour of your urine. Pale straw is the target; dark amber usually means top up. People who are older, pregnant, unwell, or exercising in heat need to be more deliberate, since thirst signals lag behind actual need.

Bottom line: you probably don't need to force litres, but you shouldn't ignore genuine thirst either.`
  },
  {
    id: "screen-eyes",
    tag: "Eye Health",
    title: "The 20-20-20 rule for screen-tired eyes",
    date: "Jun 24, 2026",
    summary: "Every 20 minutes, look 20 feet away for 20 seconds.",
    image: "",
    hue: "gold",
    icon: "👀",
    body:
`Long hours on screens rarely damage the eyes permanently, but they do cause real strain: dryness, blurred focus, and headaches. The culprit is mostly reduced blinking and locked-in focus at one distance.

The 20-20-20 rule is the simplest fix that works: every 20 minutes, look at something roughly 20 feet away for about 20 seconds. This relaxes the focusing muscle and gives your blink rate a chance to recover.

Pair it with slightly larger text, a screen at arm's length just below eye level, and lubricating drops if you run dry. If blur or pain persists, that's worth a check with an optometrist.`
  },
  {
    id: "gut-fibre",
    tag: "Nutrition",
    title: "Feeding your gut: the case for 30 plants a week",
    date: "Jun 21, 2026",
    summary: "Diversity of plants, not any single superfood, feeds a healthy microbiome.",
    image: "",
    hue: "mint",
    icon: "🥗",
    body:
`Gut research has shifted away from hunting for one magic food toward a simpler idea: variety. People who eat a wider range of plants tend to have more diverse gut bacteria, which is linked to steadier digestion, mood, and immune function.

A practical target that keeps showing up is around 30 different plant types a week. That sounds like a lot until you count herbs, spices, nuts, seeds, beans, and whole grains — a handful of mixed seeds alone can add several.

You don't need to overhaul your diet. Swap in a new vegetable, add beans to a dish you already make, and treat the spice rack as free points.`
  },
  {
    id: "breath-stress",
    tag: "Mental Health",
    title: "One slow exhale can down-shift your stress response",
    date: "Jun 18, 2026",
    summary: "Longer exhales gently activate the body's calming nervous system.",
    image: "",
    hue: "coral",
    icon: "🌬️",
    body:
`When stress spikes, breathing offers a rare direct dial on the nervous system. The trick is the exhale: making your out-breath longer than your in-breath nudges the parasympathetic ("rest and digest") side into action, slowing heart rate within a minute or two.

A simple pattern to try: breathe in for a count of four, out for a count of six, for about two minutes. No app required. It's useful before a hard conversation, in a waiting room, or when you can't fall asleep.

This isn't a replacement for treating ongoing anxiety, but it's a reliable, always-available reset.`
  }
];

if (typeof module !== "undefined") module.exports = BLOGS;
