# Hokr Team — Web projekt

## Struktura projektu

```
hokr-team/
├── index.html              # Hlavní stránka (single-page)
├── css/
│   ├── style.css           # Kompletní design system + layout
│   └── animations.css      # Keyframes, reveal, particle efekty
├── js/
│   ├── main.js             # Navbar, cursor, accordion, formulář, scroll
│   └── animations.js       # Particles canvas, parallax, tilt, glow
└── assets/
    ├── videos/             # → sem vložte hero.mp4 (cinematic security footage)
    ├── images/             # → logo, about foto, portfolio galerie
    └── icons/              # → favicon, OG image
```

## Quickstart

1. Otevřete `index.html` v prohlížeči — vše funguje offline bez build kroku.
2. Nebo nasaďte na libovolný statický hosting (Netlify, Vercel, GitHub Pages, vlastní server).

## Jak přidat hero video

V `index.html` najděte komentář `<!-- Production: swap for a real video -->` a vyměňte placeholder za:

```html
<video autoplay muted loop playsinline poster="assets/images/hero-poster.jpg">
  <source src="assets/videos/hero.mp4" type="video/mp4" />
</video>
```

Doporučení pro video:
- Rozlišení: 1920×1080 nebo 3840×2160
- Délka: 15–30 s (loop)
- Bitrate: cca 8–12 Mbps pro 1080p
- Použijte tmavé záběry z eventů / security prostředí

## Kontaktní formulář — produkce

V `js/main.js` nahraďte simulaci odesílání (`await new Promise(...)`) reálným fetch voláním:

```js
const res = await fetch('/send.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

Připravte `send.php` s PHPMailer / SMTP nebo nasměrujte na Formspree, EmailJS apod.

## Nastavení Google Maps

V sekci kontakt v `index.html` je embedovaná mapa Prahy. Pro přesnou polohu:
1. Otevřete maps.google.com, vyhledejte adresu.
2. Klikněte Sdílet → Vložit mapu → zkopírujte `src` z `<iframe>`.
3. Nahraďte stávající `src` v kódu.

## Typografie

Projekt využívá Google Fonts (načítáno ze sítě):
- **Bebas Neue** — display / headline
- **Cormorant Garamond** — serif akcenty
- **Outfit** — body text

Pro offline/produkci stáhněte fonty a hostujte lokálně.

## Barevný systém (OKLCH)

| Token          | Hodnota                       | Použití           |
|----------------|-------------------------------|-------------------|
| `--black`      | `oklch(7% 0.008 45)`          | Hlavní pozadí     |
| `--gold`       | `oklch(72% 0.12 68)`          | Brand akcent      |
| `--white`      | `oklch(96% 0.006 60)`         | Text              |
| `--grey-light` | `oklch(60% 0.008 45)`         | Sekundární text   |

## Responzivita

- Mobile-first, breakpointy: 600px / 900px / 1024px
- Na mobilech je custom cursor deaktivován
- Hamburger menu s overlay na < 900px
