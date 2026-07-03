# Tech Med — Health Companion

A calm, phone-first health website with three sections, switched from the bottom toolbar:

- **Home** — a featured daily read, a swipeable (left ↔ right) rail of health stories, quick health facts, and a rotating tip of the day. All posts live in one easy-to-edit file.
- **Chat** — a healthcare chatbot that answers questions about symptoms, habits, medicines, and wellbeing. It always shows a "not a doctor" note and steers serious issues toward real care.
- **Health** — a gentle mind + body tracker: two score rings, metric tiles, a 7-day trend chart, and a 20-second daily check-in. Everything stays on the user's device.

Built with plain HTML, CSS, and JavaScript — no build step, so it runs straight from GitHub Pages.

---

## Project structure

```
techmed/
├── index.html          ← the whole app (three views + bottom nav)
├── css/styles.css      ← the "clinical calm" design system
├── data/blogs.js       ← ✏️ edit this to add or update blog posts
├── js/
│   ├── blogs.js        ← renders posts + the read-more view
│   ├── chatbot.js      ← the health chat + Anthropic API call
│   ├── health.js       ← the tracking dashboard
│   └── app.js          ← navigation + startup
├── images/
│   ├── logo.svg        ← the header logo (swap for your own)
│   ├── logo.jpg        ← a logo crop from your upload
│   ├── reference-1.jpg ← your uploaded design references
│   └── reference-2.jpg
└── README.md
```

---

## Run it locally

Just open `index.html` in a browser — that's it.
(For the chat's live AI to work, browsers need the page served over http, so either open it directly or run a tiny local server: `python3 -m http.server` then visit `http://localhost:8000`.)

---

## Customise

**Add a blog post:** open `data/blogs.js`, copy one `{ ... }` block, edit the text, and put the newest post at the top. To use a real photo, drop it in `images/` and set `image: "images/your-photo.jpg"`.

**Change the logo:** in `index.html` find the line with `images/logo.svg` and point it at your own file, e.g. `images/logo.jpg`.

**Turn on the AI chat:** open the app → **Chat** → tap **⚙︎ Connect the AI**, paste your Anthropic API key (from console.anthropic.com), and **Save**. The key is stored only in your browser.
> ⚠️ For a private/personal site this is fine. For a public site, don't ship a key in the page — route the request through a small backend of your own so the key stays secret.

---

## Put it on GitHub

You'll do this once. Commands are for the terminal, run from inside the `techmed` folder.

### 1. Install Git (skip if you already have it)
Check with `git --version`. If missing, install from https://git-scm.com.

### 2. Create the repository on GitHub
Go to https://github.com/new → name it e.g. `techmed` → leave it empty (no README) → **Create repository**. Copy the URL it shows you (looks like `https://github.com/YOURNAME/techmed.git`).

### 3. Turn your folder into a repo and push
```bash
cd techmed

git init
git add .
git commit -m "Initial commit: Tech Med health companion"

git branch -M main
git remote add origin https://github.com/YOURNAME/techmed.git
git push -u origin main
```
If Git asks who you are the first time:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 4. Make it a live website (GitHub Pages, free)
On GitHub: your repo → **Settings** → **Pages** → under *Source* pick **Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**.
Wait a minute, then your site is live at:
```
https://YOURNAME.github.io/techmed/
```

### 5. Later updates
Every time you change something:
```bash
git add .
git commit -m "Update blog posts"
git push
```
The live site refreshes automatically.

---

## A note on safety

Tech Med is a wellbeing companion, not a medical device, and it does not diagnose. It encourages people to see a professional for anything persistent, severe, or worrying, and to use emergency services in a crisis.
