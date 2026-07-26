# animations.md — Специфікація анімацій (v2 — топ-рівень стек)

> Knowledge-файл для Devin AI. Оновлена версія: додає GSAP + ScrollTrigger + Lenis та WebGL-шейдерний фон поверх базових принципів. Ціль лишається та сама — рух, що відчувається як продукт, а не як декор — але тепер з ширшим набором прийомів, розподілених по секціях так, щоб кожна відчувалась по-різному, а не повторювала один і той самий ефект.

## Правило №1: prefers-reduced-motion (не змінюється, тепер критичніше)

Стек став важчим (WebGL + GSAP + Lenis), тому перевірка **обов'язкова на рівні ініціалізації**, а не тільки на CSS-transition:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // не ініціалізувати Lenis — залишити нативний скрол
  // не реєструвати ScrollTrigger-анімації з рухом/парал ксом — showAll елементи одразу в кінцевому стані
  // не запускати WebGL-рендер-луп — показати статичний градієнтний PNG/CSS-градієнт замість шейдера
  // growth-тікер — одразу кінцеве значення, без інкременту
}
```

## Стек і підключення (CDN, без build-степу)

```html
<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Lenis smooth scroll -->
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.25/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.3.25/dist/lenis.min.js"></script>
```

Ініціалізація (один блок, в кінці `<body>` або в `form.js`-сусідньому файлі `motion.js`):

```js
gsap.registerPlugin(ScrollTrigger);

let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Пауза rAF-луперів (Lenis, WebGL, GSAP ticker), коли вкладка неактивна
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lenis?.stop();
    gsap.ticker.sleep?.();
  } else {
    lenis?.start();
    gsap.ticker.wake?.();
  }
});
```

## 1. Фон: анімований WebGL-шейдерний градієнтний мош

Замінює попередню ідею "частинкової сфери" як основний фоновий рух (сфера-орбіта лишається опційним елементом усередині growth-тікера/hero-графіки, але не на весь фон).

Реалізація: fullscreen `<canvas>` з сирим WebGL2 (без Three.js — зайва вага поверх GSAP+Lenis), один fullscreen-триangle, fragment shader з simplex/Perlin noise, що генерує "живий" градієнтний мош із кольорів `--accent-live`, `--accent-tech`, на фоні `--bg-base`. Fixed або `position: absolute` позаду hero-секції (і, з низькою opacity ~0.15–0.25, може продовжуватись тонким шаром за всією сторінкою для відчуття єдиного "живого" фону).

Скелет фрагмент-шейдера (адаптувати кольори з `design.md`):

```glsl
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// ... simplex noise function (стандартна GLSL-реалізація) ...

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float n = snoise(vec3(uv * 2.5, u_time * 0.05));
  float mouseInfluence = smoothstep(0.4, 0.0, distance(uv, u_mouse)) * 0.15;
  vec3 colA = vec3(0.043, 0.043, 0.059);      // --bg-base
  vec3 colB = vec3(0.961, 0.188, 0.420);      // --accent-live
  vec3 colC = vec3(0.133, 0.827, 0.780);      // --accent-tech
  vec3 color = mix(colA, mix(colB, colC, uv.y), n * 0.5 + 0.5 + mouseInfluence);
  gl_FragColor = vec4(color, 1.0);
}
```

Вимоги:
- `u_time` оновлюється через `requestAnimationFrame`, швидкість руху повільна (медитативна, не епілептична) — шум еволюціонує за ~15-20 секунд на повний цикл.
- `u_mouse` — легка реакція на курсор (параллакс-зсув моша), тільки на десктопі (`matchMedia('(hover: hover)')`).
- Рендер-луп ставиться на паузу через `IntersectionObserver`, якщо canvas виїхав з viewport, і через `visibilitychange`.
- Fallback без WebGL-підтримки (перевірити `canvas.getContext('webgl2')`): статичний CSS `background: radial-gradient(...)` з тими самими кольорами.
- На мобільних (< 768px) — знизити роздільність рендера (рендерити в менший offscreen canvas і масштабувати через CSS) для продуктивності.

## 2. Parallax-шари (ScrollTrigger scrub)

Застосувати вибірково — не на кожному елементі, а там, де це підсилює композицію:
- Hero: заголовок рухається повільніше за фон-шейдер (`yPercent: -15` зі `scrub: true`), growth-тікер — трохи швидше за заголовок (глибина).
- Секція "Наші кейси": фонові декоративні форми (кола/лінії з design-мови) рухаються з іншою швидкістю, ніж картки.

```js
gsap.to('.hero-title', {
  yPercent: -15,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});
```

## 3. Pinned/sticky секції

Застосувати в **одному** місці, де це виправдано контентом — секція "Наші кейси" (3 картки Karina/Valentine/Kristina): секція пінюється на висоту 3 в'юпортів, картки горизонтально проявляються/змінюють одна одну під час скролу (`pin: true` + горизонтальний `xPercent` timeline). Не пінити більше однієї секції — це важкий, "дорогий" ефект, і кілька поспіль створюють втому.

```js
ScrollTrigger.create({
  trigger: '.cases-section',
  start: 'top top',
  end: '+=200%',
  pin: true,
  scrub: 1,
  onUpdate: (self) => {
    gsap.to('.cases-track', { xPercent: -66 * self.progress, ease: 'none', duration: 0 });
  }
});
```

## 4. Стагеровані слайди зліва/справа

Секції "Чому саме ми", "Мінімальні вимоги", "Наша команда" — елементи списку/картки заїжджають з чергуванням напрямку (парні — зліва, непарні — справа), stagger 100-120ms:

```js
gsap.from('.why-us-item', {
  x: (i) => (i % 2 === 0 ? -60 : 60),
  opacity: 0,
  duration: 0.7,
  stagger: 0.12,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.why-us-section', start: 'top 75%' }
});
```

## 5. Магнітні кнопки й cursor-follow

- CTA-кнопки (hero, "Заробляй з нами", "Стати стрімером"): при наведенні кнопка злегка "тягнеться" за курсором у межах ~12px (magnetic effect), повертається у вихідну позицію через `power3.out` при відведенні курсора. Тільки на пристроях з `hover: hover` (не на тач-екранах).

```js
document.querySelectorAll('.magnetic-btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power3.out' });
  });
  btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }));
});
```

- Курсор-компаньйон (невеликий кастомний cursor-dot кольору `accent-tech`, що плавно слідує за реальним курсором з невеликою затримкою) — опційно, тільки на десктопі, вимикається на тач-пристроях і при `prefers-reduced-motion`.

## 6. Growth-тікер і mosaic-reveal — без змін

Лишаються як описано раніше: growth-тікер інкрементується при вході у viewport (тепер триггериться через `ScrollTrigger` замість голого `IntersectionObserver`, для консистентності коду), mosaic-reveal — один раз, hero → перша секція.

## 7. Розподіл ефектів по секціях (щоб не повторюватись)

| Секція | Основний ефект |
|---|---|
| Hero | WebGL shader-фон + parallax заголовка + growth-тікер |
| Як це працює | mosaic-reveal (вхід у секцію), далі стагер-fade карток переваг |
| Наші кейси | pinned horizontal-reveal |
| Заробляй з нами | parallax фонових форм + magnetic CTA |
| Чому саме ми | стагеровані слайди зліва/справа |
| Наша команда | стагер fade+scale карток (без слайдів, щоб не повторювати "чому саме ми") |
| Мінімальні вимоги | стагер fade знизу (просто, стримано — це текстовий блок вимог) |
| Форма заявки | fokус-glow + shake на помилці (див. попередню версію) |

## Продуктивність — оновлені обмеження

- WebGL-рендер + GSAP + Lenis одночасно — тестувати на throttled "Mid-tier mobile" в DevTools, ціль 60fps на десктопі, мінімум 30fps на середньому мобільному (з автознижкою роздільності шейдера на мобільних).
- Не більше **однієї** pinned-секції на сторінці.
- Всі `ScrollTrigger`-інстанси створювати один раз при `DOMContentLoaded`, викликати `ScrollTrigger.refresh()` після завантаження шрифтів/зображень (щоб уникнути неправильних позицій тригерів через layout shift).
- `will-change: transform` — тільки на елементах з активним GSAP-твіном, знімати через `onComplete`.