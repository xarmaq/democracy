# Better Dimocracy — план сайта

Одностраничный интерактивный сайт (EN) для организации Better Dimocracy: воркшопы и лекции
по всей Европе, ближайшее событие — София, Болгария. Регистрация участника и спикера —
имитация (данные никуда не отправляются).

## Технологии

- Статический сайт без сборки: `index.html` + `css/styles.css` + `js/main.js` + `js/globe.js`.
- Ванильный JS, Canvas 2D для 3D-глобуса, CSS-переменные для тем.
- Шрифты: Space Grotesk (заголовки) + Inter (текст), Google Fonts с системным фолбэком.

## Дизайн-принципы (из skills/)

Применены стандарты из `emil-design-eng` и `review-animations/STANDARDS.md`:

- Сильные кастомные кривые: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out),
  `cubic-bezier(0.77, 0, 0.175, 1)` (ease-in-out). Никакого `ease-in` на UI.
- UI-анимации < 300 мс; press-feedback `scale(0.97)` за 160 мс на всех кнопках.
- Только `transform` и `opacity` (GPU); никаких `width/height/top/left`.
- Входы никогда не из `scale(0)` — от `scale(0.95)` + opacity.
- CSS-transitions вместо keyframes для прерываемого UI (тосты, табы).
- Stagger 40–70 мс для групповых появлений.
- `prefers-reduced-motion` — движение убирается, opacity остаётся.
- Hover-эффекты за `@media (hover: hover) and (pointer: fine)`.
- Асимметричный тайминг: вход тоста 400 мс, выход 200 мс.

## Структура страницы

1. **Header** — липкий, blur-подложка после скролла; переключатель темы (dark/light,
   localStorage + prefers-color-scheme); мобильное меню.
2. **Hero** — заголовок со stagger-входом, CTA «Join as participant» / «Apply to speak»,
   3D-глобус на canvas: точечная сфера, маркеры европейских городов, дуги из Софии,
   авто-вращение + параллакс за мышью + drag с инерцией (momentum).
3. **Marquee** — бегущая строка городов (linear, loop).
4. **Stats** — счётчики-тикеры (number ticker, tabular-nums) при входе во вьюпорт.
5. **About** — миссия + три принципа (Learn / Debate / Act), scroll reveal.
6. **Sofia 2026** — спотлайт события: обратный отсчёт до 18 сентября 2026, площадка
   (John Atanasoff Forum, Sofia Tech Park), программа на 3 дня.
7. **Program** — табы Day 1 / Day 2, «карта дня» (пропорциональный таймлайн-стрип,
   клик = переход к сессии) + аккордеон-строки: диапазон времени, спикер с
   инициалами, тип-бейдж, раскрывающееся описание.
8. **Speakers** — roster-список (печатные строки: №, аватар-инициалы, имя/роль, тема,
   тайм-чип слота как в расписании) — 9 спикеров из PDF + строка «стань спикером».
   Сетка карточек убрана как анти-паттерн. About — «леджер» (нумерованные строки),
   Stats — печатная строка на линейках, слева на широких экранах — rail-навигация
   со scrollspy, шапка автоскрывается при чтении вниз.
9. **Testimonials** — отзывы с прошлых событий.
10. **Register** — сегмент-переключатель Participant / Speaker (скользящий индикатор,
    direction-aware смена панелей), две формы с мок-полями; сабмит имитируется:
    спиннер → line-drawing галочка + карточка успеха + toast. Пометка «demo».
11. **FAQ** — аккордеон.
12. **Footer** — мок-контакты, соцссылки, дисклеймер.

Сквозные элементы: тонкий scroll-progress bar сверху, scroll reveal через
IntersectionObserver, параллакс-глоу в hero, плавный якорный скролл.

## Мок-данные

- Событие: Sofia Youth Forum — 18–19 сентября 2026 (двухдневный), София, вход свободный, 120 мест.
- Дедлайны: участники до 30 авг, спикеры до 1 авг 2026.
- Статистика: 43 события, 17 стран, 2 840 участников, 120 спикеров.
- Спикеры (обновлённое расписание из PDF, июль 2026): Bjørn Berge (Council of Europe),
  Andreas Schleicher (OECD), Helmut K. Anheier (Hertie School) + Michiel van Hulten
  (Transparency International EU), Jamila Raqib (Albert Einstein Institution),
  Claire Wardle (Cornell), Ivan Krastev (Centre for Liberal Strategies, София),
  Petra Bayr (парламент Австрии), Maria Ressa (Rappler; в PDF опечатка «Maria ress»).
- Расписание Дня 1 (09:00–18:00) — по PDF: keynote Берге → сессии (Schleicher;
  Anheier + van Hulten; Raqib) → воркшоп Critical Thinking 101 (Wardle) → кейс
  Болгария (Krastev) → Youth Policy Lab 90 мин (Krastev) → Drafting the Sofia Youth
  Declaration (Bayr) → Closing reflection (Ressa). День 2 — Национальное собрание,
  министры (в PDF не менялся). В секции Program — «карта дня»: пропорциональная
  лента-таймлайн (ширина блока = минуты), клик по блоку открывает сессию.
- Контакты: hello@betterdimocracy.eu и т.п.

## Проверка

Локальный сервер → скриншоты обеих тем, прогон формы (заполнение → сабмит → успех),
проверка консоли на ошибки, reduced-motion ветки.
