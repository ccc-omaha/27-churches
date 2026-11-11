# 27 Churches by 2027

Live site: https://27.cccomaha.org (Netlify site `ccc-27-churches`).

## Editing content
Staff edit through **Pages CMS** at https://app.pagescms.org.
Sign in with GitHub, open `cccomaha/27-churches`, then **27 Churches page**.

- **Add a church plant:** add an item to *Church plants*. It fills the next open card.
  The count, progress bar and year filters update on their own.
- **Photos:** upload in the Photo field. Portrait shots work best.
- **Italics in the intro:** wrap words in `*asterisks*`.

Saving commits to GitHub. Netlify republishes in about a minute.

## Files
- `content/site.json` — all editable text and the church list
- `images/` — photos
- `index.html` — layout and styles
- `app.js` — renders the content (no build step)
