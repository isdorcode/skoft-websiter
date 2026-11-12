import { useEffect, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { categories, environments, products, type Product } from '@/data/catalogue';

const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя.'),
  organization: z.string().optional(),
  phone: z.string().optional().refine(
    (value) => !value || /^[+()0-9 -]{6,}$/.test(value),
    'Проверьте формат телефона.',
  ),
  email: z.string().trim().optional().refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Проверьте формат электронной почты.',
  ),
  product: z.string().optional(),
  quantity: z.string().optional().refine(
    (value) => !value || /^[1-9]\d*$/.test(value),
    'Укажите целое количество от 1.',
  ),
  comment: z.string().optional(),
}).refine(
  (values) => Boolean(values.phone?.trim() || values.email?.trim()),
  { path: ['phone'], message: 'Укажите телефон или электронную почту для связи.' },
);

type InquiryValues = z.infer<typeof inquirySchema>;

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content = description;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = title;
    if (ogDescription) ogDescription.content = description;
  }, [title, description]);
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const nav = [
    { label: 'Главная', href: '/' },
    { label: 'Продукция', href: '/catalog' },
    { label: 'Решения', href: '/#solutions', anchor: true },
    { label: 'О компании', href: '/#about', anchor: true },
    { label: 'Контакты', href: '/#contact', anchor: true },
  ];
  return (
    <header className="site-header">
      <div className="page-wrap header-inner">
        <Link href="/" className="brand" aria-label="СКОФТ — главная" data-testid="link-brand">
          <span className="brand-mark">с.</span><span className="brand-name">СКОФТ</span>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {nav.map((item) => item.anchor ? (
            <a key={item.label} href={item.href} className="nav-link" data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</a>
          ) : (
            <Link key={item.label} href={item.href} className="nav-link" aria-current={location === item.href ? 'page' : undefined} data-testid={`link-nav-${item.label.toLowerCase()}`}>{item.label}</Link>
          ))}
        </nav>
        <a className="header-cta" href="/#contact" data-testid="link-header-inquiry">Обсудить задачу <ArrowUpRight size={14} /></a>
        <button className="menu-toggle" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {menuOpen && <nav className="mobile-nav" aria-label="Мобильная навигация">
        {nav.map((item) => item.anchor ? <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`mobile-link-${item.label}`}>{item.label}<ArrowUpRight size={15} /></a> : <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`mobile-link-${item.label}`}>{item.label}<ArrowUpRight size={15} /></Link>)}
        <a href="/#contact" className="mobile-inquiry" onClick={() => setMenuOpen(false)} data-testid="mobile-link-inquiry">Запросить предложение <ArrowRight size={16} /></a>
      </nav>}
    </header>
  );
}

function Footer() {
  return <footer className="site-footer">
    <div className="page-wrap footer-top">
      <div><Link href="/" className="brand footer-brand" data-testid="link-footer-brand"><span className="brand-mark">с.</span><span className="brand-name">СКОФТ</span></Link><p className="footer-note">Решения для учебной мебели.<br />Комфорт, который можно обсудить.</p></div>
      <div className="footer-column"><span className="footer-label">Навигация</span><Link href="/catalog" data-testid="link-footer-catalog">Продукция</Link><a href="/#solutions" data-testid="link-footer-solutions">Решения</a><a href="/#about" data-testid="link-footer-about">О компании</a></div>
      <div className="footer-column"><span className="footer-label">Категории</span>{categories.map((category) => { const product = products.find((item) => item.category === category); return <Link href={product ? `/products/${product.slug}` : '/catalog'} key={category} data-testid={`link-footer-category-${categories.indexOf(category as typeof categories[number])}`}>{category}</Link>; })}</div>
      <div className="footer-column"><span className="footer-label">Связаться</span><a href="/#contact">Форма запроса</a><span className="footer-placeholder">Телефон — уточняется</span><span className="footer-placeholder">Электронная почта — уточняется</span></div>
      <div className="footer-column"><span className="footer-label">Мессенджеры</span><span className="footer-placeholder">WhatsApp — ссылка уточняется</span><span className="footer-placeholder">Telegram — ссылка уточняется</span><span className="footer-placeholder">Социальные сети — уточняется</span></div>
    </div>
    <div className="page-wrap footer-bottom"><span>© СКОФТ</span><Link href="/privacy" data-testid="link-privacy">Политика конфиденциальности · шаблон</Link><span>Контактные данные уточняются</span></div>
  </footer>;
}

function Image({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <img src={src} alt={alt} width="1200" height="800" loading={eager ? 'eager' : 'lazy'} className={className} />;
}

function QuoteForm({ selected, onSelected }: { selected: string; onSelected: (slug: string) => void }) {
  const [notice, setNotice] = useState('');
  const form = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: '', organization: '', phone: '', email: '', product: selected, quantity: '', comment: '' },
  });
  const { setValue } = form;
  useEffect(() => {
    setValue('product', selected);
  }, [selected, setValue]);
  function submit() {
    setNotice('Форма заполнена, но заявка НЕ отправлена: способ получения заявок не подключён. Данные никуда не переданы и не сохранены.');
  }
  return <section id="contact" className="contact-section section-pad">
    <div className="page-wrap contact-grid">
      <div className="contact-intro">
        <span className="eyebrow">Связаться с нами</span>
        <h2 className="display">Расскажите,<br />что нужно вашему<br /><em>пространству.</em></h2>
        <p>Укажите тип учреждения, мебель и ориентировочное количество. Мы пока не получаем заявки через сайт — форма только проверяет заполнение и показывает статус.</p>
        <div className="contact-clarifier"><span className="clarifier-dot" />Телефон, почта и мессенджеры — уточняются</div>
      </div>
      <Form {...form}>
      <form className="inquiry-form" onSubmit={form.handleSubmit(submit)} noValidate data-testid="form-inquiry">
        <div className="form-row">
          <label>Имя <input {...form.register('name')} autoComplete="name" required placeholder="Как к вам обращаться" data-testid="input-name" />{form.formState.errors.name && <span className="field-error" role="alert">{form.formState.errors.name.message}</span>}</label>
          <label>Название организации <input {...form.register('organization')} autoComplete="organization" placeholder="Школа, вуз, центр…" data-testid="input-organization" /></label>
        </div>
        <div className="form-row">
          <label>Телефон <input {...form.register('phone')} type="tel" autoComplete="tel" placeholder="Номер телефона" data-testid="input-phone" />{form.formState.errors.phone && <span className="field-error" role="alert">{form.formState.errors.phone.message}</span>}</label>
          <label>Электронная почта <input {...form.register('email')} type="email" autoComplete="email" placeholder="name@example.ru" data-testid="input-email" />{form.formState.errors.email && <span className="field-error" role="alert">{form.formState.errors.email.message}</span>}</label>
        </div>
        <div className="form-row">
          <label>Интересующий продукт
            <select {...form.register('product', { onChange: (event) => onSelected(event.target.value) })} data-testid="select-product">
              <option value="">Выберите продукт</option>
              {products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
            </select>
          </label>
          <label>Количество изделий <input {...form.register('quantity')} type="number" inputMode="numeric" min="1" step="1" placeholder="Уточняется" data-testid="input-quantity" />{form.formState.errors.quantity && <span className="field-error" role="alert">{form.formState.errors.quantity.message}</span>}</label>
        </div>
        <label>Комментарий <textarea {...form.register('comment')} rows={4} placeholder="Тип мебели, задача, пожелания…" data-testid="input-comment" /></label>
        {form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0 && <p className="form-error" role="alert" data-testid="status-form-error">Проверьте данные формы и укажите телефон или электронную почту.</p>}
        {notice && <p className="form-notice" role="status" data-testid="status-form-not-sent"><Check size={17} />{notice}</p>}
        <button type="submit" className="button-primary form-submit" data-testid="button-submit-inquiry">Отправить заявку <ArrowRight size={16} /></button>
        <p className="form-legal">Сайт не передаёт и не сохраняет заявку. Не вводите чувствительные данные.</p>
      </form>
      </Form>
    </div>
  </section>;
}

function HomePage({ selected, onSelected, setLocation }: { selected: string; onSelected: (slug: string) => void; setLocation: (path: string) => void }) {
  usePageMeta('СКОФТ — решения для учебной мебели', 'Съёмные мягкие накладки и решения для школьных стульев, образовательных учреждений и учебных пространств. Конфигурации и условия обсуждаются индивидуально.');
  const featured = products[0];
  return <>
    <main>
      <section className="hero-section">
        <div className="page-wrap hero-layout">
          <div className="hero-copy">
            <div className="eyebrow hero-reveal">СКОФТ · решения для учебной мебели</div>
            <h1 className="display hero-reveal delay-1">Комфорт,<br />который меняет<br /><em>пространство.</em></h1>
            <p className="hero-lede hero-reveal delay-2">Современные решения для школьной мебели. Создаём комфортные, практичные и эстетичные пространства для обучения.</p>
            <div className="hero-actions hero-reveal delay-3"><Link href="/catalog" className="button-primary" data-testid="button-hero-catalog">Смотреть продукцию <ArrowRight size={16} /></Link><a href="#contact" className="text-link" data-testid="link-hero-solutions">Получить консультацию <ArrowUpRight size={15} /></a></div>
          </div>
          <div className="hero-visual">
            <Image src={featured.image} alt={featured.imageAlt} className="hero-image" eager />
            <div className="hero-image-meta"><span>Концепт СКОФТ Comfort</span><span>01 / 05</span></div>
            <span className="hero-side-label">Образовательная мебель · концепт-визуализация</span>
          </div>
          <div className="hero-index"><span>01</span><i />05</div>
        </div>
        <a className="scroll-cue" href="#featured"><span>Прокрутить</span><ChevronDown size={14} /></a>
      </section>

      <section className="featured-section section-pad" id="featured">
        <div className="page-wrap featured-grid">
          <div className="featured-photo-wrap">
            <Image src={featured.image} alt={featured.imageAlt} className="featured-photo" />
            <span className="photo-caption">Иллюстративная визуализация. Не является фотографией готового изделия.</span>
          </div>
          <div className="featured-content">
            <span className="eyebrow">Знакомьтесь · 01</span>
            <h2 className="display">СКОФТ<br /><em>Comfort</em></h2>
            <p className="featured-name">Комплект мягких накладок для школьного стула</p>
            <p className="body-copy">Съёмная мягкая накладка на сиденье и спинку. Регулируемые ремни помогают закрепить комплект; детали совместимости уточняются под конкретный стул.</p>
            <ul className="feature-list">{featured.features.map((feature) => <li key={feature}><span className="feature-check"><Check size={13} /></span>{feature}</li>)}</ul>
            <div className="featured-actions"><Link href={`/products/${featured.slug}`} className="button-outline" data-testid="link-featured-details">Подробнее <ArrowUpRight size={15} /></Link><button className="text-link" onClick={() => goToInquiry(featured.slug, onSelected, setLocation)} data-testid="button-quote-featured">Запросить предложение <ArrowRight size={15} /></button></div>
            <p className="visual-note">Модель, материалы, размеры и доступные цвета требуют подтверждения.</p>
          </div>
        </div>
      </section>

      <section className="solutions-section section-pad" id="solutions">
        <div className="page-wrap">
          <div className="section-heading"><div><span className="eyebrow">Для разных форматов обучения</span><h2 className="display">Комфорт для каждого<br /><em>образовательного пространства.</em></h2></div><p>Подход к конфигурации начинается с места, где используется мебель, и самой мебели.</p></div>
          <div className="environment-grid">{environments.map((environment, index) => <article className={`environment-card env-${index + 1}`} key={environment.title} data-testid={`card-environment-${index + 1}`}><div className="environment-image"><Image src={environment.image} alt={environment.alt} /><span className="environment-count">0{index + 1}</span></div><div className="environment-copy"><h3>{environment.title}</h3><p>{environment.text}</p></div></article>)}</div>
          <p className="visual-note environment-disclaimer">Изображения пространств — иллюстративные визуализации, не фотографии реальных клиентов или объектов.</p>
        </div>
      </section>

      <section className="about-section section-pad" id="about">
        <div className="page-wrap about-grid"><figure className="about-photo"><Image src="/images/classroom.jpg" alt="Иллюстративная визуализация учебного пространства" /><figcaption>Образовательное пространство · иллюстративная визуализация</figcaption></figure><div className="about-copy"><span className="eyebrow">О подходе</span><h2 className="display">Мы создаём<br /><em>комфорт для обучения.</em></h2><p>Наша задача — помочь образовательным учреждениям улучшить привычную мебель с помощью практичных, современных и настраиваемых решений. Начинаем со съёмных мягких накладок на сиденье и спинку; характеристики и совместимость конкретной конфигурации требуют подтверждения.</p><a href="#contact" className="text-link" data-testid="link-about-contact">Обсудить вашу задачу <ArrowRight size={15} /></a></div></div>
      </section>

      <section className="custom-section">
        <div className="page-wrap custom-grid"><div className="custom-photo"><Image src="/images/fastening-detail.jpg" alt="Концепт регулируемого крепления накладки к стулу" /><span className="photo-caption">Иллюстративная визуализация детали крепления</span></div><div className="custom-copy"><span className="eyebrow">Под вашу задачу</span><h2 className="display">Индивидуальные<br /><em>решения.</em></h2><p>Можно обсудить дизайн, размеры, цвета, варианты обивки и крепления. Доступность и параметры каждого решения необходимо подтвердить перед предложением.</p><ol><li><span>01</span>Опишите учреждение и задачу</li><li><span>02</span>Расскажите о мебели и нужной конфигурации</li><li><span>03</span>Согласуем детали до предложения</li></ol><button className="button-primary" onClick={() => goToInquiry('', onSelected, setLocation)} data-testid="button-custom-inquiry">Обсудить индивидуальный проект <ArrowRight size={16} /></button></div></div>
      </section>

      <section className="benefits-section section-pad"><div className="page-wrap"><div className="section-heading benefits-heading"><div><span className="eyebrow">Что важно в решении</span><h2 className="display">Практично.<br /><em>Без лишнего.</em></h2></div><p>Четыре ориентира для обсуждения решения с учреждением.</p></div><div className="benefit-list">
       {[['01', 'Современный дизайн', 'Разрабатываем внешний вид с учётом учебного пространства и конкретной задачи.'], ['02', 'Практичные решения', 'Съёмные накладки и регулируемые ремни предусмотрены в концепции СКОФТ Comfort.'], ['03', 'Индивидуальный подход', 'Конфигурацию, цвета, размеры, обивку и крепление можно обсудить; параметры требуют подтверждения.'], ['04', 'Для образовательных учреждений', 'Решения ориентированы на школы, университеты, детские сады и учебные центры.']].map(([n, title, copy]) => <article className="benefit-row" key={n} data-testid={`card-benefit-${n}`}><span className="benefit-number">{n}</span><h3>{title}</h3><p>{copy}</p><ArrowUpRight size={18} className="benefit-arrow" /></article>)}
      </div></div></section>
      <QuoteForm selected={selected} onSelected={onSelected} />
    </main>
  </>;
}

function goToInquiry(slug: string, onSelected: (slug: string) => void, setLocation: (path: string) => void) {
  onSelected(slug);
  setLocation('/');
  window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

function CataloguePage({ onSelected }: { onSelected: (slug: string) => void }) {
  usePageMeta('Каталог продукции — СКОФТ', 'Каталог решений и категорий СКОФТ для учебной мебели. Характеристики, материалы, размеры и условия уточняются при запросе.');
  const [active, setActive] = useState<string>('Все категории');
  const filtered = active === 'Все категории' ? products : products.filter((product) => product.category === active);
  return <main className="inner-page">
    <section className="catalog-hero page-wrap"><div className="breadcrumbs"><Link href="/" data-testid="link-breadcrumb-home">Главная</Link><span>/</span><span>Продукция</span></div><span className="eyebrow">Каталог · решения для учебной мебели</span><h1 className="display">Продукция<br /><em>СКОФТ.</em></h1><p>Выберите направление, чтобы посмотреть, что можно обсудить. Детали моделей и параметры обозначены как уточняемые.</p></section>
    <section className="catalog-content page-wrap"><div className="filter-row" role="group" aria-label="Фильтр по категории">{['Все категории', ...categories].map((category) => <button type="button" className={`filter-chip ${active === category ? 'selected' : ''}`} key={category} aria-pressed={active === category} onClick={() => setActive(category)} data-testid={`filter-${category === 'Все категории' ? 'all' : categories.indexOf(category as typeof categories[number])}`}>{category}</button>)}</div><div className="catalog-result-count" aria-live="polite" data-testid="text-catalog-count">{filtered.length} {filtered.length === 1 ? 'направление' : 'направлений'} · детали уточняются</div>
       {filtered.length ? <div className="catalog-grid">{filtered.map((product, index) => <ProductCard product={product} index={index} key={product.slug} onQuote={(slug) => onSelected(slug)} />)}</div> : <div className="empty-state"><span className="eyebrow">Пока нет позиций</span><h2 className="display">Раздел формируется.</h2><p>Выберите другую категорию или задайте вопрос по индивидуальному решению.</p><button className="button-outline" onClick={() => setActive('Все категории')} data-testid="button-reset-filters">Показать все категории</button></div>}
    </section>
    <section className="catalog-note"><div className="page-wrap"><span className="eyebrow">Важная информация</span><p>Изображения являются иллюстративными визуализациями. Они не подтверждают внешний вид готового изделия, фактические цвета или реальные места использования. Материалы, размеры, совместимость, цены и сроки — уточняются.</p></div></section>
    <section className="catalog-cta page-wrap"><h2 className="display">Нужна другая<br /><em>конфигурация?</em></h2><a className="button-primary" href="/#contact">Описать задачу <ArrowRight size={16} /></a></section>
  </main>;
}

function ProductCard({ product, index, onQuote }: { product: Product; index: number; onQuote: (slug: string) => void }) {
  return <article className="product-card" data-testid={`card-product-${product.slug}`}><Link href={`/products/${product.slug}`} className="product-card-image" data-testid={`link-product-${product.slug}`}><Image src={product.image} alt={product.imageAlt} /><span className="card-index">0{index + 1}</span><span className="card-open"><ArrowUpRight size={18} /></span></Link><div className="product-card-body"><span className="product-category">{product.category}</span><Link href={`/products/${product.slug}`} className="product-title-link" data-testid={`link-product-title-${product.slug}`}>{product.name}</Link><p>{product.description}</p><div className="product-card-options"><span className="card-detail-label">Детали</span><span>{product.features.slice(0, 2).join(' · ') || 'Уточняются'}</span><span className="card-detail-label">Цвета</span><span className="card-swatches" aria-label="Иллюстративные варианты, доступность уточняется">{product.colors.map((color, i) => <i className={`swatch swatch-${i + 1}`} key={color} title={color} />)}</span><small>Цвета приведены как образцы и не подтверждены.</small></div><div className="product-card-foot"><button className="text-link" onClick={() => onQuote(product.slug)} data-testid={`button-quote-${product.slug}`}>Запросить предложение <ArrowRight size={14} /></button><Link href={`/products/${product.slug}`} className="detail-link" aria-label={`Подробнее: ${product.name}`} data-testid={`link-product-more-${product.slug}`}><ArrowUpRight size={17} /></Link></div></div></article>;
}

function ProductPage({ onSelected, setLocation }: { onSelected: (slug: string) => void; setLocation: (path: string) => void }) {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((item) => item.slug === slug);
  usePageMeta(product ? `${product.name} — СКОФТ` : 'Продукт не найден — СКОФТ', product?.description ?? 'Страница продукта СКОФТ.');
  if (!product) return <NotFoundPage />;
  const isFeatured = product.slug === 'skoft-comfort';
  return <main className="inner-page product-page"><section className="page-wrap product-detail"><div className="breadcrumbs"><Link href="/catalog" data-testid="link-product-breadcrumb">Продукция</Link><span>/</span><span>{product.category}</span></div><div className="product-detail-grid"><div className={`product-detail-visual ${isFeatured ? 'product-gallery' : ''}`}><figure className="gallery-main"><Image src={product.image} alt={product.imageAlt} /><figcaption>Иллюстративная визуализация — внешний вид готового изделия не подтверждён.</figcaption></figure>{isFeatured && <figure className="gallery-detail"><Image src="/images/fastening-detail.jpg" alt="Концептуальный вид крепления накладки с регулируемыми ремнями" /><figcaption>Деталь крепления · концепт-визуализация</figcaption></figure>}</div><div className="product-detail-copy"><span className="eyebrow">{product.category}</span><h1 className="display">{product.name}</h1><p className="product-description">{product.description}</p><div className="detail-block"><h2>Элементы концепции</h2><ul className="feature-list">{product.features.map((feature) => <li key={feature}><span className="feature-check"><Check size={13} /></span>{feature}</li>)}</ul></div><div className="detail-block pending-block"><h2>Параметры уточняются</h2><ul>{product.detailsPending.map((detail) => <li key={detail}>{detail}</li>)}</ul></div><div className="color-placeholder"><span>Цветовые варианты</span><div>{product.colors.map((color, i) => <span className={`swatch swatch-${i + 1}`} key={color} aria-hidden="true" />)}</div><small>Иллюстративные образцы. Доступность цветов не подтверждена.</small></div><button className="button-primary product-quote" onClick={() => goToInquiry(product.slug, onSelected, setLocation)} data-testid={`button-quote-detail-${product.slug}`}>Запросить предложение <ArrowRight size={16} /></button></div></div><Link href="/catalog" className="back-link" data-testid="link-back-catalog"><ArrowLeft size={15} />К каталогу</Link></section></main>;
}

function PrivacyPage() {
  usePageMeta('Политика конфиденциальности — проект шаблона | СКОФТ', 'Черновик-шаблон политики конфиденциальности СКОФТ. Не является утверждённым юридическим документом.');
  return <main className="inner-page privacy-page"><section className="page-wrap privacy-content"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Политика конфиденциальности</span></div><span className="eyebrow">Документ · черновик</span><h1 className="display">Политика<br /><em>конфиденциальности.</em></h1><div className="draft-alert"><strong>Черновик-шаблон — не утверждённый юридический документ.</strong><span>Перед публикацией его необходимо проверить и заполнить с учётом фактических реквизитов и процессов.</span></div><p>На сайте отображается форма для предварительного заполнения запроса. В текущей версии сайта форма не подключена к сервису доставки и данные не отправляются и не сохраняются.</p><h2>Какие данные запрашивает форма</h2><p>Форма содержит поля «Имя», «Название организации», «Телефон», «Электронная почта», «Интересующий продукт», «Количество изделий» и «Комментарий». Не вводите в поле комментария чувствительные сведения.</p><h2>Обработка данных</h2><p>В этой демонстрационной версии передача и хранение отправленных форм не реализованы. До подключения сервиса и утверждения документов не следует считать эту страницу заявлением о фактическом операторе персональных данных, целях обработки или сроках хранения.</p><h2>Данные, которые необходимо добавить</h2><ul><li>Оператор и его юридические реквизиты — уточняются.</li><li>Контакты для обращений по вопросам данных — уточняются.</li><li>Цели, основания, сроки и порядок обработки — требуют юридического согласования.</li><li>Сведения о подключённых сервисах и мерах защиты — уточняются до запуска передачи данных.</li></ul><a href="/" className="back-link"><ArrowLeft size={15} />На главную</a></section></main>;
}

function NotFoundPage() {
  usePageMeta('Страница не найдена — СКОФТ', 'Страница не найдена. Вернитесь в каталог решений для учебной мебели СКОФТ.');
  return <main className="not-found page-wrap"><span className="eyebrow">404 · страница не найдена</span><h1 className="display">Похоже,<br /><em>здесь пусто.</em></h1><p>Возможно, страница переехала или адрес указан неверно.</p><Link href="/" className="button-primary">На главную <ArrowRight size={16} /></Link></main>;
}

function RouterContent() {
  const [selected, setSelected] = useState('');
  const [, setLocation] = useLocation();
  return <div className="site-shell"><Header /><Switch>
    <Route path="/" component={() => <HomePage selected={selected} onSelected={setSelected} setLocation={setLocation} />} />
    <Route path="/catalog" component={() => <CataloguePage onSelected={(slug) => { setSelected(slug); goToInquiry(slug, setSelected, setLocation); }} />} />
    <Route path="/products/:slug" component={() => <ProductPage onSelected={setSelected} setLocation={setLocation} />} />
    <Route path="/privacy" component={PrivacyPage} />
    <Route component={NotFoundPage} />
  </Switch><Footer /></div>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RouterContent /></WouterRouter>;
}

export default App;
