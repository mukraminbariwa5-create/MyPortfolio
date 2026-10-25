# MUKRAMIN.DEV — Portfolio

Personal portfolio of **Mukramin B. Ansao**, web developer (BSIT Cum Laude 2026).
Plain HTML, CSS and JavaScript, with GSAP for animation. No build step.

## Folder layout

```
index.html            page structure
css/style.css         all styling (colors are variables at the top)
js/data.js            ALL editable content: projects, skills, toolkit, journey, contact
js/main.js            renders data.js + animations
assets/img/           photos and project screenshots (WebP)
assets/video/         short live-preview clips of each project (MP4)
assets/Mukramin_Ansao_CV.pdf   the "Download CV" file
```

## Updating content

Open `js/data.js`:

- **New project:** copy one object in `projects`, change the text, and put its screenshots in `assets/img/`. Use `layout: 'desktop'` for browser screenshots or `layout: 'app'` for three tall app screens. Set `github: ''` to show "Repo coming soon".
- **New tool:** add its name to `toolkit`.
- **New experience:** add an entry to `journey` (newest first).
- **New certificate:** save the certificate image as `assets/img/cert_NAME.webp` (plus a smaller `cert_NAME-sm.webp`), then copy one object in `certifications` (newest first) and set `verify` to its official Credly / Coursera / issuer link.
- **Availability and languages:** edit `availability` and `languages`. They appear in About, the "Why work with me" box and Contact.
- **Why work with me:** edit the three points in `why`. Keep each one backed by something on the page and link to it.
- **Hero project count:** change `stats.projects`.
- **New CV:** replace `assets/Mukramin_Ansao_CV.pdf` (keep the same file name).

## Live preview clips (screenshots that move)

Each project can have a short silent clip that plays inside its screenshot frame,
automatically while the project is on screen (desktop and phones).
A **LIVE PREVIEW** badge appears on the frame (it also plays / pauses the clip when clicked).
Visitors with reduced motion or data saver turned on only get the clip when they tap the badge.

The clips are already set up in `js/data.js` (`preview: 'assets/video/NAME.mp4'`).
**Until a file exists, nothing shows**, so you can add them one at a time:

| File | What to record (6–10 s, one smooth action) |
|---|---|
| `assets/video/teachwise.mp4` | Student opens a class and rates a teacher, or teacher dashboard → full report |
| `assets/video/padala.mp4` | Pick a folder → "only 2 files changed" → transfer with Dala flying the package |
| `assets/video/booktrack.mp4` | Member searches a book → borrows it → it shows in "My loans" |
| `assets/video/servease.mp4` | Customer picks a service → selects a pro → books it |

**Recording tips**

- Use a clean browser window: 100% zoom, no bookmarks bar, demo data that looks real.
- TeachWise, BookTrack, Servease: make the page area about **1280 × 768** (the frame is wide, and the clip is trimmed from the bottom if it is taller).
- Padala: record a tall phone-shaped view, about **400 × 610** (Chrome DevTools → device toolbar → Responsive).
- Start on the same screen as the project's first screenshot and end near where you started, so the loop and the fade-in look smooth.
- Move the mouse slowly and pause half a second after each click. No sound is needed (it is removed anyway).
- Windows: Snipping Tool (`Win + Shift + S` → Record) or Xbox Game Bar (`Win + G`) both work; OBS gives the most control.

**Shrink each clip before adding it** (aim for under 1.5 MB) with [HandBrake](https://handbrake.fr) or ffmpeg:

```
ffmpeg -i raw.mp4 -t 10 -vf "scale=1280:-2,fps=30" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart teachwise.mp4
```

For Padala use `scale=600:-2`. Keep the file names exactly as in the table.
To show a clip in a different Padala phone window, change `previewShot` (0, 1 or 2) in `js/data.js`.

## Animation libraries

GSAP 3.12.5, ScrollTrigger and Lenis 1.1.13 are bundled in `js/vendor/`, so the site does not depend on outside servers.
If a file there is ever missing, the page falls back to the online CDN automatically.

## Keyboard shortcuts and terminal

- `1`–`8` jump to each section, `?` shows the shortcuts list.
- `~` (or the TERMINAL button in the footer) opens the terminal. Try `help`, `hack`, `matrix`, `resume`, `sound on`.

## Link preview image

`assets/img/og.jpg` (1200 × 630) is the picture shown when the site link is shared on LinkedIn, Facebook or Messenger.
After changing it, paste the site link into https://www.linkedin.com/post-inspector/ to refresh LinkedIn's copy.

## Interface sounds

Soft interface sounds are **always on**. Browsers only allow a page to make sound after the visitor's
first click, tap or key press (hovering and scrolling don't count), so the sounds start from that first
interaction, and hover sounds work after it. The sounds are generated in the browser, so there are no audio files. To change how they sound, edit the `SOUNDS` list near the top of `js/main.js`.

## Contact form

By default the form opens the visitor's email app with the message filled in.
To receive messages directly in Gmail instead:

1. Create a free account at formspree.io and make a new form with mukraminansao@gmail.com.
2. Copy its endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `contact.formEndpoint` in `js/data.js`.

## Publishing (Netlify, connected to GitHub)

The live site is **https://mukraminbariwaansao.netlify.app/**. Netlify rebuilds it automatically
whenever the site's GitHub repository changes, usually within a minute.

To publish a change, update the files in the GitHub repository (commit and push, or upload them on github.com).

**Never upload the `_backups` folder.** It holds local undo copies only. The `.gitignore` file keeps it out
automatically when you use Git or GitHub Desktop; if you upload on github.com, just don't select it.

After publishing a new link preview image (`assets/img/og.jpg`), paste the site link into
https://www.linkedin.com/post-inspector/ so LinkedIn shows the new picture.

## Run locally

Open the folder in VS Code and use the Live Server extension, or run:

```
python -m http.server 8000
```

then visit http://localhost:8000.
