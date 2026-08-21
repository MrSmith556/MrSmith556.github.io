# Cybersecurity Skills Framework — Progress Tracker

A static GitHub Pages site that tracks your progress through a scoped slice of the
[OpenSSF / Linux Foundation Global Cybersecurity Skills Framework](https://cybersecurityframework.io/):

- **IT Project Management** — 14 skills
- **CyberSecurity Operations** — 18 skills
- **Security Administrator** — 18 skills

50 skills total, each tagged Foundational, Intermediate, or Advanced.

## Files

- `index.html` — page structure
- `styles.css` — visual design
- `app.js` — loads `data.json` and renders the filterable table + progress ring
- `data.json` — **the only file you need to edit to update your progress.**

## Updating your progress

Open `data.json`. Each skill looks like this:

```json
{
  "id": "B28",
  "tier": "basic",
  "description": "Develop soft skills for presenting updates to senior leaders...",
  "status": "not-started",
  "note": ""
}
```

Change `"status"` to one of:

- `"not-started"`
- `"in-progress"`
- `"complete"`

Optionally fill in `"note"` with a short note (a date, a course name, a link) — it
shows under the skill description on the site.

Commit and push; GitHub Pages redeploys automatically within a minute or two.

## Note on skill IDs

Skill IDs (`B1`, `I10`, `A15`, etc.) come from a shared skill bank in the source
framework and are reused across job families — so `B7` in IT Project Management and
`B7` in CyberSecurity Operations happen to be the same underlying skill, and an ID
can appear under a different tier than its prefix suggests (e.g. `B3` is listed
under IT Project Management's *Intermediate* tier in the source data). This is
expected and matches the official framework.

## Deploying on GitHub Pages

1. Create (or reuse) a repo, e.g. `ssf-progress`.
2. Copy these files into the repo root (`index.html`, `styles.css`, `app.js`,
   `data.json`, this `README.md`).
3. Commit and push to the `main` branch.
4. In the repo, go to **Settings → Pages**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL like `https://<username>.github.io/<repo-name>/` within a
   couple of minutes.

## Adding or removing families/skills later

Each entry in `data.json` is a job family object with a `family` name and a `skills`
array. To add another family or skill back in, copy the shape of an existing entry —
`id`, `tier`, `description`, `status`, `note`.
