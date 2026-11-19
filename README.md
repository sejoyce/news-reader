# News Reader

Paste a link to a news article in French or Spanish and read it with likely B2/C1 words underlined (dotted orange) and fixed expressions underlined (solid blue). Hover on desktop, or tap on mobile, for the meaning. The journalist, publication and a link to the original appear under the headline.

It runs entirely on free services and needs no API key:

- **GitHub Pages** hosts the page (`index.html`).
- **A Cloudflare Worker** (`worker/`) fetches the article page for you. Browsers cannot do this directly.
- **Your browser** extracts the headline, author and text, and picks the words using a word-frequency list.
- **Wiktionary** supplies definitions when you hover or tap.

The page picks the language from the article's own language tag, or you can choose it in the Language menu.

## Files

```
index.html               the page and the language-independent engine
config.js                picks the Worker address for production, staging or local
langs/fr.js, es.js       one language pack each (rules, word-list paths, sample article)
data/fr_words.txt        word frequency list per language, most frequent first
data/fr_expressions.json fixed expressions per language
data/en_words.txt        English words, shared, used to hide cognates
vendor/Readability.js    article extraction
worker/                  the Cloudflare Worker
.github/workflows/       publishes main at / and the staging branch at /staging/
```

## Set it up

### 1. Put the Worker online (Cloudflare, free)

1. Make a new empty folder outside your repository and put only `worker.js` in it.
2. Run: `npx wrangler deploy worker.js --name news-reader-proxy --compatibility-date 2025-01-01 --var ALLOWED_ORIGIN:https://yourname.github.io`
3. Copy the address Wrangler prints.

### 2. Put the page online (GitHub Pages)

1. Open `config.js` and set `proxyUrl` to the Worker address.
2. Upload everything except `worker/` to your repository (`index.html`, `config.js`, `langs/`, `data/`, `vendor/`).
3. In the repository settings, publish Pages from the main branch.

The footer of the page says which word lists loaded and the page version. If a word list is missing it says NOT FOUND and where it expected the file.

## Environments and testing

| Where | Address | Worker |
|---|---|---|
| Production (`main`) | `https://yourname.github.io/<repo>/` | `french-reader-proxy` |
| Staging (`staging` branch) | `https://yourname.github.io/<repo>/staging/` | `french-reader-proxy-staging` |
| Local | `http://localhost:8000` | `http://localhost:8787` |

Staging and local pages show "(staging)" or "(local)" in the title.

**One-time setup**
1. Repository Settings, Pages: set Source to "GitHub Actions". Commit `.github/workflows/pages.yml` to `main`.
2. Settings, Environments, `github-pages`: add `staging` to the allowed deployment branches.
3. Create the branch: `git checkout main && git checkout -b staging && git push -u origin staging`.
4. Deploy the staging Worker (from a clean folder holding only `worker.js`):
   `npx wrangler deploy worker.js --name french-reader-proxy-staging --compatibility-date 2025-01-01 --var ALLOWED_ORIGIN:https://yourname.github.io,http://localhost:8000,http://127.0.0.1:8000`

**Everyday flow:** work on a feature branch, merge it into `staging`, check `/staging/`, then merge `staging` into `main`.

**Local testing**
- From the project folder run `python3 -m http.server 8000` and open `http://localhost:8000`. Opening `index.html` by double-click does not work because the page loads its word lists with `fetch`.
- The sample article and Wiktionary definitions work with nothing else running.
- To load articles from links, in a second terminal inside `worker/` run `npx wrangler dev worker.js --var ALLOWED_ORIGIN:http://localhost:8000 --port 8787`.

## Add a language

1. Download that language's frequency list from [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (`content/2018/<code>/<code>_50k.txt`), keep only the first column, and save it as `data/<code>_words.txt`.
2. Copy `langs/es.js` to `langs/<code>.js` and change the settings. The parts to rewrite are:
   - `falseFriends`, `cognateCandidates`: how to spot words that look like English ones, and the look-alikes that mean something else.
   - `guessLemmas`: guesses at the base form of an inflected verb.
   - `boilerplate`, `loginWords`: paywall and login lines to remove from articles.
   - `verbForms`, `exprNeg`, `tokenMap`: how verbs and small words flex inside expressions.
   - `sample`: a short sample article, `by`: the word for "by" in bylines.
3. Write `data/<code>_expressions.json`. Each entry looks like `{"p": "~dar lugar a", "d": "to give rise to", "l": "B2"}`. A `~` before a verb matches any form of it, `{a|b}` lists alternatives.
4. Add `<script src="langs/<code>.js"></script>` to `index.html`.

Languages without spaces between words (Chinese, Japanese) and languages that capitalize every noun (German) need changes to the engine, not just a pack.

## Limits

- Paywalled sites usually return only a teaser to an anonymous fetch. The page warns when the text is short. This app does not try to get around paywalls.
- Levels are estimates from word frequency, not an official CEFR list. Some everyday words get underlined and some useful idioms are missed.
- Capitalised words are never underlined, which also skips rare words at the start of a sentence.
- Definitions come from English Wiktionary. Inflected forms resolve to their base word by following Wiktionary's "form of" lines, with the language's own Wiktionary as a fallback.
- A fixed expression is always marked, even where a literal reading fits.

## Tuning

In each language pack, `knownMax` and `b2Max` set which frequency ranks count as everyday, B2 and C1 vocabulary. Raise them to underline fewer words.

## Credits

- Word frequencies: [FrequencyWords](https://github.com/hermitdave/FrequencyWords) by Hermit Dave, from OpenSubtitles, CC BY-SA 4.0.
- Definitions: [Wiktionary](https://en.wiktionary.org), CC BY-SA.
- Article extraction: [Readability.js](https://github.com/mozilla/readability) by Mozilla, Apache 2.0 (`vendor/Readability.js`).
