# seo.md — SEO-вимоги

> Knowledge-файл для Devin AI. Обов'язкові SEO-елементи для лендінгу Florence Agency.

## Ніша та ключові фрази

TikTok Live агенція, набір і навчання стрімерів, заробіток на прямих ефірах в TikTok. Мова контенту — українська (`lang="uk"`), природні ключові фрази без переспаму: "TikTok Live агенція", "стати стрімером TikTok", "заробіток на прямих ефірах", "навчання стрімерів".

## `<head>` — обов'язкові теги

```html
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Florence Agency — офіційна TikTok Live агенція | Стань стрімером</title>
  <meta name="description" content="Florence Agency — TikTok Live агенція, яка тренує та продюсує нових стрімерів. Персональний менеджер, навчальна програма, дохід від $2000/міс. Почни безкоштовно.">
  <link rel="canonical" href="https://florenceagency.com/">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0A0A0F">

  <meta property="og:title" content="Florence Agency — офіційна TikTok Live агенція">
  <meta property="og:description" content="Тренуємо та продюсуємо нових стрімерів у TikTok Live. Персональний менеджер, навчання, дохід від $2000/міс.">
  <meta property="og:image" content="https://florenceagency.com/assets/img/og-image.jpg">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://florenceagency.com/">
  <meta property="og:locale" content="uk_UA">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Florence Agency — офіційна TikTok Live агенція">
  <meta name="twitter:description" content="Тренуємо та продюсуємо нових стрімерів у TikTok Live.">
  <meta name="twitter:image" content="https://florenceagency.com/assets/img/og-image.jpg">

  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
</head>
```

`og:image` має бути окремим файлом 1200×630px, стилізованим під темну тему бренду (не скріншот сторінки як є) — покласти заглушку-коментар `<!-- TODO: замінити на реальний OG-банер -->`, якщо файл ще не готовий.

## Ієрархія заголовків

- Один `<h1>` — на головному слогані hero-секції ("Florence Agency" + слоган про TikTok Live).
- `<h2>` — заголовок кожної секції ("Як це працює", "Наші кейси", "Заробляй з нами", "Чому саме ми", "Наша команда", "Мінімальні вимоги", "Форма заявки", "Контакти").
- `<h3>` — підзаголовки всередині секцій (назва кожного кейсу, ім'я кожного члена команди).
- Не пропускати рівні (немає `<h3>` без батьківського `<h2>` в тій самій секції).

## JSON-LD (structured data)

Два блоки: `Organization` і `Service`.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Florence Agency",
  "url": "https://florenceagency.com",
  "logo": "https://florenceagency.com/assets/img/logo.png",
  "foundingDate": "2022",
  "sameAs": []
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "TikTok Live streamer training and management",
  "provider": { "@type": "Organization", "name": "Florence Agency" },
  "areaServed": "Worldwide",
  "description": "Навчання та продюсування нових стрімерів TikTok Live: персональний менеджер, навчальна програма, програма розвитку аудиторії."
}
```

## robots.txt

```
User-agent: *
Allow: /
Sitemap: https://florenceagency.com/sitemap.xml
```

## sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://florenceagency.com/</loc>
    <lastmod>2026-07-26</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## Технічні деталі

- Всі зображення — `alt`-текст, що описує зміст (не порожній, не keyword-stuffed).
- `loading="lazy"` на зображеннях нижче першого екрана; hero-зображення/canvas — без lazy (критичний контент).
- Внутрішня перелінковка: навігаційні якорі (`#about`, `#cases`, `#team` тощо) вважаються внутрішніми посиланнями — переконатись, що всі пункти навігації ведуть на реальні `id` секцій.
- `hreflang` — не потрібен (сайт одномовний, EN-перемикач у навігації — плейсхолдер без окремої версії).
