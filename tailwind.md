# tailwind.md — Конвенції верстки

> Knowledge-файл для Devin AI. Правила використання Tailwind CSS (через CDN) для цього проєкту, узгоджені з `design.md`.

## Підключення

Tailwind підключається виключно через CDN у `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'bg-base': '#0A0A0F',
          'bg-surface': '#14141C',
          'bg-surface-raised': '#1C1C26',
          'accent-live': '#F5306B',
          'accent-tech': '#22D3C7',
          'accent-gold': '#E8B34F',
          'text-primary': '#F5F5F7',
          'text-muted': '#9A9AA8',
          'border-subtle': '#26262F',
        },
        fontFamily: {
          display: ['"Bricolage Grotesque"', 'sans-serif'],
          body: ['"General Sans"', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'monospace'],
        },
      }
    }
  }
</script>
```

Кольори і шрифти беруться **виключно** з таблиці токенів у `design.md` — не вигадувати нові hex-значення на льоту, не використовувати дефолтні Tailwind-кольори (`bg-blue-500`, `text-purple-600` тощо) ніде в проєкті.

## Спейсинг

Використовувати лише крок 4px (стандартна Tailwind-шкала: `p-4`=16px, `p-6`=24px, `p-8`=32px, `p-12`=48px, `p-16`=64px, `p-24`=96px, `p-32`=128px). Вертикальний ритм між секціями — `py-24` на мобільному, `py-32` на десктопі. Не змішувати довільні `px-[17px]` без причини.

## Breakpoints

Стандартні Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Мобайл-фьорст підхід — базові класи для мобільного, модифікатори для розширення на десктопі. Максимальна ширина контенту — `max-w-[1200px] mx-auto px-6 md:px-8`.

## Уникати конфліктів специфічності

Критично: не створювати CSS-класи, що перекривають одне одного через змішування селекторів на основі типу (`.section`) і на основі елемента/utility (наприклад, inline `class` з дублюючим padding). Якщо потрібен кастомний CSS поза Tailwind (для анімацій з `animations.md`), виносити його в окремий `<style>`-блок з чіткими, унікальними класами (`.hero-sphere-canvas`, `.marquee-track`), не перевизначати Tailwind utility-класи напряму.

## Структура компонентів у розмітці

- Кожна секція — окремий `<section>` з унікальним `id` для якірної навігації (`#about`, `#cases`, `#team`, `#requirements`, `#form`, `#contacts`).
- Картки (кейси, команда, переваги) верстати через послідовні `<article>` або `<div>` з однаковим базовим набором класів + варіативними модифікаторами, а не копіювати весь набір класів у кожен інстанс окремо — для читабельності коду.
- Кнопки — один базовий клас-патерн (`inline-flex items-center justify-center rounded-full px-6 py-3 font-medium transition-all`) + модифікатор кольору (`bg-accent-live text-white hover:bg-accent-live/90` для primary, `border border-border-subtle text-text-primary hover:border-accent-tech` для secondary).

## Темна тема за замовчуванням

Проєкт **не використовує** Tailwind `dark:` префікс — темна тема єдина й базова, всі кольори одразу прописані під темний фон. Не додавати світлу альтернативну тему.

## Форми

Інпути: `bg-bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-tech focus:ring-1 focus:ring-accent-tech transition-colors`. Обов'язково видимий стан фокусу — не прибирати outline без заміни на помітну альтернативу (деталі в `accessibility-performance.md`).

## Alpine.js — де використовувати

- Мобільне меню (toggle `x-data="{ open: false }"`).
- Стан кнопки форми (loading/success/error) — керувати через `x-data` в `form.js`, синхронізовано з fetch-запитом.
- Marquee pause-on-hover, акордеони у вимогах (якщо знадобляться) — через `x-show`/`x-transition`.
- Не використовувати Alpine для складної логіки анімацій з `animations.md` (canvas, scroll-reveal) — це чистий vanilla JS/IntersectionObserver, Alpine лишається тільки для UI-стану.
