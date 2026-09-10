// Static site generator for guvenhurdametal.com.tr — run with `node generate.js`
// Produces fully self-contained HTML pages (no server-side includes) so every
// page carries its full content for search engines.
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://guvenhurdametal.com.tr';
const BRAND = 'Mersin Hurdacı';
const LEGAL = 'Güven Hurda Metal';
const PHONE_DISPLAY = '0531 450 89 91';
const PHONE_TEL = '+905314508991';
const ADDRESS = 'Turunçlu Mahallesi 205. Cadde No:19, Mersin';
const YEAR = new Date().getFullYear();

const SERVICE_ICON = {
  'demir-celik-hurdasi': 'layers',
  'aluminyum-hurdasi': 'square',
  'bakir-hurdasi': 'bolt',
  'kursun-hurdasi': 'battery',
  'beyaz-esya-hurdasi': 'washer',
  'klima-hurdasi': 'snow',
  'kombi-hurdasi': 'flame',
};

const SERVICES = [
  { id: 'demir-celik-hurdasi', name: 'Demir ve Çelik Hurdası',
    short: 'Demir aksam, çelik konstrüksiyon ve hurda metal parçaların adresinizden alımı.',
    intro: 'İnşaat artığı demirden çelik konstrüksiyon parçalarına, hurda sac levhalardan makine aksamına kadar her türlü demir ve çelik hurdasını Mersin genelinde adresinizden teslim alıyoruz.',
    items: ['İnşaat demiri ve hurda inşaat çeliği', 'Sac levha ve boru hurdaları', 'Makine ve ekipman aksamı', 'Hurda araç parçaları', 'Fabrika ve atölye hurdaları', 'Karışık demir-çelik hurdalar'] },
  { id: 'aluminyum-hurdasi', name: 'Alüminyum Hurdası',
    short: 'İçecek kutusu, profil, jant ve endüstriyel alüminyum hurdalarının değerlendirilmesi.',
    intro: 'Alüminyum profil, doğrama artığı, jant, kap-kacak ve endüstriyel üretim fireleri dahil her tür alüminyum hurdasını piyasa koşullarına uygun fiyatla, adresinizden alıyoruz.',
    items: ['Alüminyum doğrama ve profil hurdası', 'Jant ve otomotiv parçaları', 'İçecek kutusu ve ambalaj hurdası', 'Endüstriyel üretim fireleri', 'Alüminyum kap-kacak ve mutfak eşyası'] },
  { id: 'bakir-hurdasi', name: 'Bakır Hurdası',
    short: 'Elektrik kablosu, tesisat borusu ve her türlü bakır hurdasında peşin ödeme.',
    intro: 'Elektrik tesisatından çıkan kablo, sıhhi tesisat borusu, motor sargısı ve endüstriyel bakır hurdalarını güvenli tartı ile ölçüp kapıda peşin ödeme yaparak satın alıyoruz.',
    items: ['Elektrik kablosu (izoleli / izolesiz)', 'Sıhhi tesisat bakır boruları', 'Motor sargısı ve trafo bakırı', 'Endüstriyel bakır hurdaları', 'Bakır levha ve profil'] },
  { id: 'kursun-hurdasi', name: 'Kurşun Hurdası',
    short: 'Akü, balans ve inşaat kurşunu dahil kurşun hurdalarının çevreye duyarlı alımı.',
    intro: 'Kurşun akülerden, inşaat ve izolasyon uygulamalarından, endüstriyel tesislerden çıkan kurşun hurdalarını mevzuata uygun şekilde teslim alıp doğru geri dönüşüm süreçlerine yönlendiriyoruz.',
    items: ['Kurşun akü hurdası', 'İnşaat ve izolasyon kurşunu', 'Balans ve endüstriyel kurşun parçalar', 'Kurşun levha ve boru hurdası'] },
  { id: 'beyaz-esya-hurdasi', name: 'Beyaz Eşya Hurdası',
    short: 'Buzdolabı, çamaşır makinesi, bulaşık makinesi ve fırın hurdası adresten alınır.',
    intro: 'Kullanım ömrünü tamamlamış buzdolabı, çamaşır makinesi, bulaşık makinesi, fırın ve diğer beyaz eşyalarınızı evinizden veya işyerinizden alarak hurda değerini kapıda peşin ödüyoruz.',
    items: ['Buzdolabı ve derin dondurucu', 'Çamaşır makinesi ve kurutma makinesi', 'Bulaşık makinesi', 'Fırın ve ocak', 'Klima ve su ısıtıcısı gibi diğer beyaz eşyalar'] },
  { id: 'klima-hurdasi', name: 'Klima Hurdası',
    short: 'Split klima, kompresör ve bakır boru içeren klima hurdalarının sökümü ve alımı.',
    intro: 'Arızalı veya kullanılmayan split klimalarınızı, iç-dış ünitelerini ve içindeki bakır boru/kompresör aksamını yerinde söküp değerlendirerek hurda bedelini kapıda ödüyoruz.',
    items: ['Split klima iç ve dış ünite', 'Klima kompresörü', 'Bakır boru ve radyatör aksamı', 'Ticari ve endüstriyel klima sistemleri'] },
  { id: 'kombi-hurdasi', name: 'Kombi Hurdası',
    short: 'Arızalı kombi, boyler ve petek radyatör hurdalarının adresten alımı.',
    intro: 'Kullanım dışı kalmış kombi, boyler ve petek radyatörlerinizi adresinizden teslim alıp içerdiği bakır, pirinç ve çelik aksamı doğru şekilde değerlendiriyoruz.',
    items: ['Kombi cihazı hurdası', 'Boyler ve sıcak su tankı', 'Petek / panel radyatör', 'Kombi bakır eşanjör aksamı'] },
];

const DISTRICTS = [
  { id: 'akdeniz', name: 'Akdeniz' },
  { id: 'mezitli', name: 'Mezitli' },
  { id: 'toroslar', name: 'Toroslar' },
  { id: 'yenisehir', name: 'Yenişehir' },
  { id: 'tarsus', name: 'Tarsus' },
  { id: 'silifke', name: 'Silifke' },
  { id: 'erdemli', name: 'Erdemli' },
  { id: 'gulnar', name: 'Gülnar' },
  { id: 'mut', name: 'Mut' },
  { id: 'bozyazi', name: 'Bozyazı' },
  { id: 'aydincik', name: 'Aydıncık' },
  { id: 'camliyayla', name: 'Çamlıyayla' },
  { id: 'anamur', name: 'Anamur' },
];

const IMG = {
  heroBg: 'img/hero-bg.avif',
  excavator: 'img/hurda-yukleme-ekskavator.avif',
  demirCelik: 'img/demir-celik-yigin.avif',
  demirBoru: 'img/demir-boru-baglanti.avif',
  aluminyumDograma: 'img/aluminyum-dograma-hurdasi.avif',
  aluminyumSac: 'img/aluminyum-sac-hurdasi.avif',
  aluminyumProfil: 'img/aluminyum-profil-boru.avif',
  bakirBobin: 'img/bakir-bobin-hurdasi.avif',
  bakirKablo: 'img/bakir-kablo-yigin.avif',
  elektrikKablo: 'img/elektrik-kablosu-hurdasi.avif',
  kursunAku: 'img/kursun-aku-hurdasi.avif',
  beyazEsya: 'img/beyaz-esya-hurdasi.avif',
  klima: 'img/klima-hurdasi.avif',
  konteynerMotor: 'img/hurda-konteyner-motor.avif',
};

// per-service hero + secondary content image
const SERVICE_IMG = {
  'demir-celik-hurdasi': { hero: IMG.demirCelik, content: IMG.demirBoru },
  'aluminyum-hurdasi': { hero: IMG.aluminyumDograma, content: IMG.aluminyumProfil },
  'bakir-hurdasi': { hero: IMG.bakirBobin, content: IMG.bakirKablo },
  'kursun-hurdasi': { hero: IMG.kursunAku, content: null },
  'beyaz-esya-hurdasi': { hero: IMG.beyazEsya, content: null },
  'klima-hurdasi': { hero: IMG.klima, content: null },
  'kombi-hurdasi': { hero: IMG.konteynerMotor, content: IMG.elektrikKablo },
};

const NAV = [
  { href: 'index.html', label: 'Anasayfa' },
  { href: 'hakkimizda.html', label: 'Hakkımızda' },
  { href: 'hizmetlerimiz.html', label: 'Hizmetlerimiz' },
  { href: 'hizmet-bolgelerimiz.html', label: 'Hizmet Bölgelerimiz' },
  { href: 'sss.html', label: 'SSS' },
  { href: 'iletisim.html', label: 'İletişim' },
];

// ---------- icon system (inline SVG, no external icon library) ----------
const ICON_PATHS = {
  recycle: '<path d="M7 19H4.8a2 2 0 0 1-1.7-3l1.9-3.3M9.9 4.5h4.3a2 2 0 0 1 1.7 1L18 9M14.1 19.5H9.8a2 2 0 0 1-1.7-1L6 15M17.6 15l1.9 3.3a2 2 0 0 1-1.7 3h-2.3M13.5 3.2 16 7.5l-4 2.3M4.5 15.8 3 12l4.4-1.1M15.5 20.8 19.5 20l-.8-4.3"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/>',
  scale: '<path d="M12 3v18M12 3 5 8M12 3l7 5M3.5 8h3l1.7 4.6a2.4 2.4 0 0 1-2.2 3.4 2.4 2.4 0 0 1-2.2-3.4L3.5 8ZM17.5 8h3l1.7 4.6a2.4 2.4 0 0 1-2.2 3.4 2.4 2.4 0 0 1-2.2-3.4L17.5 8ZM6 21h12"/>',
  truck: '<path d="M2.5 7h11v9h-11zM13.5 10.3h3.6l3 3V16h-6.6z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/>',
  phone: '<path d="M21 16.4v2.9a2 2 0 0 1-2.2 2 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.7-5.6A18.6 18.6 0 0 1 2.2 4.7 2 2 0 0 1 4.2 2.7h2.9a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.6a2 2 0 0 1-.5 2L7.9 10.3a15 15 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 2-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 2"/>',
  check: '<path d="M20 6.5 9.5 17 4 11.5"/>',
  arrow: '<path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
  menu: '<path d="M3 6.5h18M3 12h18M3 17.5h18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 11.5h1.3v5.3"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9.3h16M9.3 4v16"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  battery: '<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 10.5v3"/><path d="M6.5 10.5v3M10.5 10.5v3"/>',
  washer: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13.5" r="4.6"/><path d="M8.5 6.2h.01M12 6.2h.01"/>',
  snow: '<path d="M12 2v20M4.5 5.5l15 13M19.5 5.5l-15 13M2 12h20"/>',
  flame: '<path d="M12 2.5c1 3-3 4.3-3 8.3a3.5 3.5 0 0 0 7 0c0-1.2-.5-2-.5-2s.6 3.2-1.5 3.2a1.7 1.7 0 0 1-1.7-1.7c0-2.6 2.7-3.5 2.7-7 0 0 3 2.7 3 6.7a5.5 5.5 0 1 1-11 0c0-4.6 4-5.7 5-9.5Z"/>',
};
function icon(name, size) {
  size = size || 20;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ''}</svg>`;
}
const STAR_PATH = 'm12 2.7 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.7l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9Z';
function starsHtml(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i <= n ? '#f0a828' : '#e3e5e7'}"><path d="${STAR_PATH}"/></svg>`;
  }
  return `<div class="stars">${s}</div>`;
}

// ---------- customer reviews (placeholder testimonials — swap for real reviews) ----------
const REVIEWS = [
  { name: 'Mehmet Y.', loc: 'Tarsus', rating: 5, text: 'Adresime gelip aynı gün hurdaları topladılar, ödemeyi de kapıda peşin aldım. Gayet pratikti.' },
  { name: 'Ayşe K.', loc: 'Mezitli', rating: 5, text: 'Tartı işlemini gözümün önünde yaptılar, hiç şüphem olmadı. Güvenilir bir ekip.' },
  { name: 'Hüseyin D.', loc: 'Toroslar', rating: 5, text: 'Eski buzdolabı ve çamaşır makinemizi aynı gün aldılar, evde yer açtık.' },
  { name: 'Fatma S.', loc: 'Akdeniz', rating: 4, text: 'Bakır kablo hurdamız için birkaç yeri aradım, en iyi teklifi burada aldım.' },
  { name: 'Kemal A.', loc: 'Erdemli', rating: 5, text: 'Klimaları söküp götürdüler, hiç uğraşmadık. Teşekkürler.' },
  { name: 'Zeynep T.', loc: 'Yenişehir', rating: 5, text: 'Telefonla arayıp randevu aldık, söylediğimiz saatte geldiler.' },
];
function reviewsGrid(limit) {
  const list = limit ? REVIEWS.slice(0, limit) : REVIEWS;
  return `<div class="review-grid">
      ${list.map(r => `<div class="review-card">
        ${starsHtml(r.rating)}
        <p>"${r.text}"</p>
        <b>${r.name}</b><span>${r.loc}</span>
      </div>`).join('\n      ')}
    </div>`;
}

function head(title, description, slug, jsonLd, heroImage) {
  const canonical = `${DOMAIN}/${slug}`;
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="tr_TR">
${heroImage ? `<link rel="preload" as="image" href="${heroImage}" fetchpriority="high">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}`;
}

function header(activeHref) {
  const links = NAV.map(n => `<a href="${n.href}"${n.href === activeHref ? ' class="active"' : ''}>${n.label}</a>`).join('\n      ');
  return `<header>
  <div class="nav">
    <a href="index.html" class="brand"><img src="img/logo.avif" alt="${BRAND} - ${LEGAL}" class="brand-logo"></a>
    <nav class="nav-links" id="navLinks">
      ${links}
    </nav>
    <a href="tel:${PHONE_TEL}" class="nav-call">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
    <button class="nav-toggle" id="navToggle" aria-label="Menüyü Aç/Kapat">${icon('menu', 20)}</button>
  </div>
</header>`;
}

function footer() {
  const svcLinks = SERVICES.map(s => `<a href="${s.id}.html">${s.name}</a>`).join('\n        ');
  const distLinks = DISTRICTS.slice(0, 7).map(d => `<a href="${d.id}-hurdaci.html">${d.name} Hurdacı</a>`).join('\n        ');
  return `<footer>
  <div class="container">
    <div class="foot-grid">
      <div>
        <h4>${BRAND}</h4>
        <p>${LEGAL} güvencesiyle Mersin genelinde demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alımı yapıyoruz. Adresinizden teslim alır, kapıda peşin ödeme yaparız.</p>
        <p>${ADDRESS}</p>
        <p><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></p>
      </div>
      <div>
        <h4>Hizmetlerimiz</h4>
        <div class="foot-links">
        ${svcLinks}
        </div>
      </div>
      <div>
        <h4>Hizmet Bölgelerimiz</h4>
        <div class="foot-links">
        ${distLinks}
        <a href="hizmet-bolgelerimiz.html">Tüm Bölgeler</a>
        </div>
      </div>
      <div>
        <h4>Kurumsal</h4>
        <div class="foot-links">
          <a href="hakkimizda.html">Hakkımızda</a>
          <a href="sss.html">Sıkça Sorulan Sorular</a>
          <a href="iletisim.html">İletişim</a>
          <a href="gizlilik-politikasi.html">Gizlilik ve Çerez Politikası</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${YEAR} ${BRAND} — ${LEGAL}. Tüm hakları saklıdır.</span>
      <a href="gizlilik-politikasi.html">Gizlilik ve Çerez Politikası</a>
    </div>
  </div>
</footer>`;
}

function callBar() {
  return `<div class="call-bar">
  <div class="cb-info"><span class="ic">${icon('phone', 20)}</span><span><small>Hemen Teklif Alın</small><b>${PHONE_DISPLAY}</b></span></div>
  <a href="tel:${PHONE_TEL}" class="btn btn-primary">Hemen Ara</a>
</div>`;
}

function cookieBanner() {
  return `<div class="cookie-banner" id="cookieBanner">
  <p>Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Detaylar için <a href="gizlilik-politikasi.html" style="color:var(--accent);font-weight:700">Gizlilik ve Çerez Politikası</a>'nı inceleyebilirsiniz.</p>
  <div class="cb-acts">
    <button class="cb-accept" id="cbAccept">Kabul Et</button>
    <button class="cb-reject" id="cbReject">Reddet</button>
  </div>
</div>`;
}

function breadcrumb(items) {
  const inner = items.map((it, i) => {
    const sep = i > 0 ? ' / ' : '';
    return it.href ? `${sep}<a href="${it.href}">${it.label}</a>` : `${sep}${it.label}`;
  }).join('');
  return `<div class="breadcrumb">${inner}</div>`;
}

// Shared hero block used for both the homepage hero and every inner-page intro.
// compact=true -> smaller, off-white "page-hero" style with breadcrumb instead of a tag pill.
function heroBlock(opts) {
  const { compact, breadcrumbItems, tag, title, desc, primaryCta, secondaryCta, feats, image, imageAlt } = opts;
  const top = breadcrumbItems
    ? breadcrumb(breadcrumbItems)
    : (tag ? `<span class="tag-pill"><span class="ic">${icon('recycle', 14)}</span>${tag}</span>` : '');
  const acts = (primaryCta || secondaryCta) ? `<div class="hero-acts">${primaryCta || ''}${secondaryCta || ''}</div>` : '';
  const featsHtml = feats
    ? `<div class="hero-feats">${feats.map(f => `<div><span class="ic">${icon(f[0], 17)}</span>${f[1]}</div>`).join('')}</div>`
    : '';
  const textCol = `<div>${top}<h1>${title}</h1><p>${desc}</p>${acts}${featsHtml}</div>`;
  const photoCol = image ? `<div class="hero-photo${compact ? ' compact' : ''}"><img src="${image}" alt="${imageAlt || ''}" fetchpriority="high"></div>` : '';
  const gridClass = image ? 'hero-grid' : 'hero-grid single';
  return `<section class="hero-sec${compact ? ' compact' : ''}"><div class="container"><div class="${gridClass}">${textCol}${photoCol}</div></div></section>`;
}

function page({ slug, title, description, activeHref, bodyHtml, jsonLd, heroImage }) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
${head(title, description, slug, jsonLd, heroImage)}
</head>
<body>
${header(activeHref)}
${bodyHtml}
${footer()}
${callBar()}
${cookieBanner()}
<script src="js/main.js" defer></script>
</body>
</html>
`;
}

function writePage(slug, opts) {
  const html = page({ slug, ...opts });
  fs.writeFileSync(path.join(__dirname, slug), html, 'utf8');
  console.log('wrote', slug);
}

// ---------- shared blocks ----------

function svcCard(s) {
  return `<div class="svc-card">
        <div class="svc-photo"><img src="${SERVICE_IMG[s.id].hero}" alt="${s.name}" loading="lazy"></div>
        <div class="svc-body">
          <div class="ic">${icon(SERVICE_ICON[s.id], 18)}</div>
          <h3>${s.name}</h3>
          <p>${s.short}</p>
          <a href="${s.id}.html">Detaylı Bilgi ${icon('arrow', 14)}</a>
        </div>
      </div>`;
}
function svcGrid(limit) {
  const list = limit ? SERVICES.slice(0, limit) : SERVICES;
  return `<div class="svc-grid">
      ${list.map(svcCard).join('\n      ')}
    </div>`;
}

function districtGrid(exclude) {
  const list = DISTRICTS.filter(d => d.id !== exclude);
  return `<div class="district-grid">
      ${list.map(d => `<a class="district-card" href="${d.id}-hurdaci.html"><b>${d.name} Hurdacı</b><span class="ic">${icon('arrow', 16)}</span></a>`).join('\n      ')}
    </div>`;
}

function whyGrid() {
  const items = [
    ['pin', 'Adresinizden Teslim Alırız', 'Hurdalarınızı taşımanıza gerek yok, ekibimiz adresinize gelir.'],
    ['cash', 'Kapıda Peşin Ödeme', 'Tartım tamamlanır tamamlanmaz ödemenizi elden ve peşin olarak alırsınız.'],
    ['scale', 'Hassas ve Güvenli Tartı', 'Kalibreli hassas tartılarla şeffaf ve doğru ölçüm yapıyoruz.'],
    ['clock', '7 Gün Hizmet', 'Haftanın her günü hurdanız için bizi arayabilirsiniz.'],
    ['truck', 'Hızlı Organizasyon', 'Talebinizi aldıktan sonra en kısa sürede adresinize ulaşıyoruz.'],
    ['recycle', 'Çevreye Duyarlı Geri Dönüşüm', 'Topladığımız hurdaları usulüne uygun geri dönüşüm sürecine kazandırıyoruz.'],
  ];
  return `<div class="why-grid">
      ${items.map(i => `<div class="why-item"><span class="ic">${icon(i[0], 20)}</span><div><h3>${i[1]}</h3><p>${i[2]}</p></div></div>`).join('\n      ')}
    </div>`;
}

function steps() {
  const s = [
    ['Bizi Arayın', `${PHONE_DISPLAY} numaralı hattımızdan bize ulaşın, hurda türünüzü ve adresinizi iletin.`],
    ['Adresinize Gelelim', 'Ekibimiz belirlediğiniz gün ve saatte adresinize gelir, hurdanızı hassas tartıyla ölçer.'],
    ['Kapıda Peşin Ödeme Alın', 'Tartım sonucuna göre belirlenen bedeli hiç beklemeden, kapıda ve peşin olarak alırsınız.'],
  ];
  return `<div class="steps">
      ${s.map((st, i) => `<div class="step"><div class="num">${i + 1}</div><h3>${st[0]}</h3><p>${st[1]}</p></div>`).join('\n      ')}
    </div>`;
}

// ---------- LOCAL BUSINESS JSON-LD ----------
const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RecyclingCenter',
  name: `${BRAND} - ${LEGAL}`,
  telephone: PHONE_TEL,
  url: DOMAIN,
  image: `${DOMAIN}/img/favicon.svg`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Turunçlu Mahallesi 205. Cadde No:19',
    addressLocality: 'Mersin',
    addressCountry: 'TR',
  },
  areaServed: DISTRICTS.map(d => d.name).concat(['Mersin']),
};

// ============ INDEX ============
writePage('index.html', {
  title: `${BRAND} | Demir, Çelik, Bakır, Beyaz Eşya, Klima ve Kombi Hurdası Alımı`,
  description: `Mersin genelinde demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alıyoruz. Adresinizden teslim alır, kapıda peşin ödeme yaparız. ${PHONE_DISPLAY}`,
  activeHref: 'index.html',
  jsonLd: businessJsonLd,
  heroImage: IMG.heroBg,
  bodyHtml: `
${heroBlock({
    tag: "Mersin'in Güvenilir Hurdacısı",
    title: `${BRAND} <span style="color:var(--accent)">| ${LEGAL}</span>`,
    desc: "Demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdanızı Mersin'in her ilçesinde adresinizden teslim alıyor, tartım sonrası bedelini kapıda peşin ödüyoruz. Adresinize geldiğimiz için Mersin'de en yakın hurdacıyı aramanıza gerek yok.",
    primaryCta: `<a href="tel:${PHONE_TEL}" class="btn btn-primary">${icon('phone', 16)} Hemen Ara: ${PHONE_DISPLAY}</a>`,
    secondaryCta: `<a href="hizmetlerimiz.html" class="btn btn-outline">Hizmetlerimizi İnceleyin</a>`,
    feats: [['pin', 'Adresinizden Teslim Alırız'], ['cash', 'Kapıda Peşin Ödeme'], ['scale', 'Hassas ve Güvenli Tartı'], ['clock', '7 Gün Hizmet']],
    image: IMG.heroBg,
    imageAlt: `${BRAND} hurda sahası`,
  })}

<div class="ticker"><div class="ticker-track">
  <span><b>Adresinizden Teslim Alırız</b></span><span><b>Kapıda Peşin Ödeme</b></span><span><b>Hassas Tartı</b></span><span><b>Mersin'in Tüm İlçelerinde Hizmet</b></span>
  <span><b>Adresinizden Teslim Alırız</b></span><span><b>Kapıda Peşin Ödeme</b></span><span><b>Hassas Tartı</b></span><span><b>Mersin'in Tüm İlçelerinde Hizmet</b></span>
</div></div>

<section class="sec" id="hizmetler"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Hizmetlerimiz</span>
    <h2 class="sec-title">Hangi Hurdaları Alıyoruz?</h2>
    <p class="sec-sub">Demir ve çelikten beyaz eşyaya, klimadan kombiye kadar geniş bir yelpazede hurda alımı yapıyoruz.</p>
  </div>
  ${svcGrid()}
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Neden Biz?</span>
    <h2 class="sec-title">Neden ${BRAND}'ı Tercih Etmelisiniz?</h2>
  </div>
  ${whyGrid()}
</div></section>

<section class="sec"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Müşteri Yorumları</span>
    <h2 class="sec-title">Bizimle Çalışan Müşterilerimiz Ne Diyor?</h2>
    <p class="sec-sub">Mersin'in farklı ilçelerinden müşterilerimizin deneyimleri.</p>
  </div>
  ${reviewsGrid(3)}
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Süreç</span>
    <h2 class="sec-title">Nasıl Çalışıyoruz?</h2>
    <p class="sec-sub">Üç adımda hurdanızı değere dönüştürüyoruz.</p>
  </div>
  ${steps()}
</div></section>

<section class="sec"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Hizmet Bölgelerimiz</span>
    <h2 class="sec-title">Mersin'in Her İlçesinde Hurdacı Hizmeti</h2>
    <p class="sec-sub">Akdeniz'den Anamur'a, Mersin'in tüm ilçelerinde adresten hurda alımı yapıyoruz.</p>
  </div>
  ${districtGrid()}
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Hurdanızı Değerlendirmeye Hazır mısınız?</h2>
    <p>Bizi arayın, adresinize gelelim, hassas tartı ile ölçüp bedelini kapıda peşin ödeyelim.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="iletisim.html" class="btn btn-outline-invert">İletişime Geçin</a>
    </div>
  </div>
</section></div>
`,
});

// ============ HAKKIMIZDA ============
writePage('hakkimizda.html', {
  title: `Hakkımızda | ${BRAND}`,
  description: `${LEGAL} olarak Mersin genelinde güvenilir, hızlı ve çevreye duyarlı hurda alım hizmeti sunuyoruz. Adresinizden teslim alır, kapıda peşin ödeme yaparız.`,
  activeHref: 'hakkimizda.html',
  heroImage: IMG.excavator,
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Hakkımızda' }],
    title: 'Hakkımızda',
    desc: `${LEGAL} güvencesiyle Mersin'de hurda toplama, geri dönüşüm ve değerlendirme hizmeti veriyoruz.`,
    image: IMG.excavator,
    imageAlt: `${BRAND} hurda toplama çalışması`,
  })}

<section class="sec"><div class="container">
  <div class="about-wrap">
    <div class="about-photo"><img src="${IMG.excavator}" alt="${BRAND} hurda toplama ve yükleme çalışması" loading="lazy"></div>
    <div>
      <span class="sec-tag">${BRAND}</span>
      <h2 class="sec-title" style="margin-bottom:16px">Güvenilir ve Şeffaf Hurda Alımı</h2>
      <p style="color:var(--ink-soft)">${LEGAL} olarak Mersin ve tüm ilçelerinde demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alımı yapıyoruz. Amacımız; hurda sahiplerine adil bir fiyat sunarken, topladığımız malzemeleri doğru geri dönüşüm süreçlerine kazandırarak çevreye katkı sağlamaktır.</p>
      <p style="color:var(--ink-soft)">Hizmetimizin temelinde şeffaflık var: hurdanızı adresinizden teslim alıyor, hassas tartılarla önünüzde ölçüyor ve bedelini kapıda peşin olarak ödüyoruz.</p>
      <div class="accept-list">
        <span>Demir &amp; Çelik</span><span>Alüminyum</span><span>Bakır</span><span>Kurşun</span>
        <span>Beyaz Eşya</span><span>Klima</span><span>Kombi</span><span>Kablo</span>
      </div>
    </div>
  </div>
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="split">
    <div>
      <span class="sec-tag">İlkelerimiz</span>
      <h2 class="sec-title" style="margin-bottom:16px">Nasıl Çalışırız?</h2>
      <p style="color:var(--ink-soft)">Kargo, bekleme ya da farklı bir yere taşıma derdiniz olmadan, hurdanızın değerini olduğu yerde alırsınız.</p>
    </div>
    <div class="panel">
      <h3>İlkelerimiz</h3>
      <ul>
        <li>Adresinizden teslim alma, ek ücret yok</li>
        <li>Kapıda peşin ödeme</li>
        <li>Hassas ve şeffaf tartı</li>
        <li>7 gün hizmet</li>
        <li>Çevreye duyarlı geri dönüşüm</li>
        <li>Mersin'in tüm ilçelerinde hizmet</li>
      </ul>
    </div>
  </div>
</div></section>

<section class="sec"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Neden Biz?</span>
    <h2 class="sec-title">Bizi Farklı Kılan Nedir?</h2>
  </div>
  ${whyGrid()}
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Hurdanız İçin Bizi Arayın</h2>
    <p>7 gün boyunca ulaşabilir, aynı gün içinde adresinize gelmemizi talep edebilirsiniz.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="hizmetlerimiz.html" class="btn btn-outline-invert">Hizmetlerimiz</a>
    </div>
  </div>
</section></div>
`,
});

// ============ HIZMETLERIMIZ (overview) ============
writePage('hizmetlerimiz.html', {
  title: `Hizmetlerimiz | Hurda Alım Kalemleri | ${BRAND}`,
  description: `Demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alım hizmetlerimizi inceleyin. Adresinizden teslim alır, kapıda peşin ödeme yaparız.`,
  activeHref: 'hizmetlerimiz.html',
  heroImage: IMG.demirCelik,
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Hizmetlerimiz' }],
    title: 'Hizmetlerimiz',
    desc: 'Mersin genelinde geniş bir yelpazede hurda alımı yapıyoruz. Detaylar için ilgili hizmet kartına göz atın.',
    image: IMG.demirCelik,
    imageAlt: 'Hurda yığını',
  })}

<section class="sec"><div class="container">
  ${svcGrid()}
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Süreç</span>
    <h2 class="sec-title">Hangi Hizmeti Seçerseniz Seçin Süreç Aynı</h2>
  </div>
  ${steps()}
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Hangi Hurdanız Olursa Olsun Bizi Arayın</h2>
    <p>Listede göremediğiniz bir hurda türü için de bize ulaşabilirsiniz.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="iletisim.html" class="btn btn-outline-invert">İletişime Geçin</a>
    </div>
  </div>
</section></div>
`,
});

// ============ SERVICE PAGES ============
SERVICES.forEach((s) => {
  const others = SERVICES.filter(x => x.id !== s.id).slice(0, 3);
  writePage(`${s.id}.html`, {
    title: `${s.name} Alımı Mersin | ${BRAND}`,
    description: `Mersin'de ${s.name.toLowerCase()} alımı yapıyoruz. Adresinizden teslim alır, hassas tartı sonrası kapıda peşin ödeme yaparız. ${PHONE_DISPLAY}`,
    activeHref: 'hizmetlerimiz.html',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: s.name,
      provider: { '@type': 'RecyclingCenter', name: `${BRAND} - ${LEGAL}`, telephone: PHONE_TEL },
      areaServed: 'Mersin',
      url: `${DOMAIN}/${s.id}.html`,
    },
    heroImage: SERVICE_IMG[s.id].hero,
    bodyHtml: `
${heroBlock({
      compact: true,
      breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Hizmetlerimiz', href: 'hizmetlerimiz.html' }, { label: s.name }],
      title: `${s.name} Alımı Mersin`,
      desc: s.intro,
      image: SERVICE_IMG[s.id].hero,
      imageAlt: s.name,
    })}

<section class="sec"><div class="container">
  <div class="split">
    <div>
      <span class="sec-tag">Kapsam</span>
      <h2 class="sec-title" style="margin-bottom:16px">Hangi ${s.name.split(' ')[0]} Malzemelerini Alıyoruz?</h2>
      ${SERVICE_IMG[s.id].content ? `<div class="about-photo" style="margin-bottom:20px"><img src="${SERVICE_IMG[s.id].content}" alt="${s.name}" loading="lazy"></div>` : ''}
      <div class="accept-list">
        ${s.items.map(i => `<span>${i}</span>`).join('\n        ')}
      </div>
      <div class="note-box"><span class="ic">${icon('info', 18)}</span><span>Hurda fiyatları güncel piyasa koşullarına göre değişiklik gösterebilir. Güncel fiyat teklifi için bizi ${PHONE_DISPLAY} numarasından arayabilirsiniz.</span></div>
    </div>
    <div class="panel">
      <h3>Neden Bize Satmalısınız?</h3>
      <ul>
        <li>Adresinizden teslim alıyoruz, taşıma derdi yok</li>
        <li>Hassas tartı ile şeffaf ölçüm</li>
        <li>Tartım sonrası kapıda peşin ödeme</li>
        <li>Mersin'in tüm ilçelerinde hizmet</li>
        <li>Çevreye duyarlı geri dönüşüm süreci</li>
      </ul>
    </div>
  </div>
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Süreç</span>
    <h2 class="sec-title">Nasıl Çalışıyoruz?</h2>
  </div>
  ${steps()}
</div></section>

<section class="sec"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Diğer Hizmetlerimiz</span>
    <h2 class="sec-title">İlginizi Çekebilecek Diğer Hurda Alım Hizmetlerimiz</h2>
  </div>
  <div class="svc-grid">
    ${others.map(svcCard).join('\n    ')}
  </div>
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>${s.name} İçin Hemen Teklif Alın</h2>
    <p>Bizi arayın, adresinize gelelim, hassas tartı ile ölçüp bedelini kapıda peşin ödeyelim.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="hizmet-bolgelerimiz.html" class="btn btn-outline-invert">Hizmet Bölgelerimiz</a>
    </div>
  </div>
</section></div>
`,
  });
});

// ============ HIZMET BOLGELERIMIZ (overview) ============
writePage('hizmet-bolgelerimiz.html', {
  title: `Hizmet Bölgelerimiz | Mersin'in Tüm İlçelerinde Hurdacı | ${BRAND}`,
  description: `${BRAND}, Akdeniz, Mezitli, Toroslar, Yenişehir, Tarsus, Silifke, Erdemli, Gülnar, Mut, Bozyazı, Aydıncık, Çamlıyayla ve Anamur'da hurda alım hizmeti verir.`,
  activeHref: 'hizmet-bolgelerimiz.html',
  heroImage: IMG.excavator,
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Hizmet Bölgelerimiz' }],
    title: 'Hizmet Bölgelerimiz',
    desc: "Mersin'in merkez ve kırsal tüm ilçelerinde adresinizden hurda alımı yapıyoruz. Bölgenizi seçerek detaylı bilgi alabilirsiniz.",
    image: IMG.excavator,
    imageAlt: 'Hurda toplama ekibi',
  })}

<section class="sec"><div class="container">
  ${districtGrid()}
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Bulunduğunuz İlçede Hizmet Almak İçin</h2>
    <p>Hangi ilçede olursanız olun, bizi arayarak aynı gün içinde randevu talep edebilirsiniz.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="iletisim.html" class="btn btn-outline-invert">İletişime Geçin</a>
    </div>
  </div>
</section></div>
`,
});

// ============ DISTRICT PAGES ============
DISTRICTS.forEach((d) => {
  const nearby = DISTRICTS.filter(x => x.id !== d.id).slice(0, 6);
  writePage(`${d.id}-hurdaci.html`, {
    title: `${d.name} Hurdacı | Adresten Hurda Alımı | ${BRAND}`,
    description: `${d.name} bölgesinde demir, çelik, bakır, alüminyum, beyaz eşya, klima ve kombi hurdası alıyoruz. Adresinizden teslim alır, kapıda peşin ödeme yaparız. ${PHONE_DISPLAY}`,
    activeHref: 'hizmet-bolgelerimiz.html',
    heroImage: IMG.excavator,
    bodyHtml: `
${heroBlock({
      compact: true,
      breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Hizmet Bölgelerimiz', href: 'hizmet-bolgelerimiz.html' }, { label: `${d.name} Hurdacı` }],
      title: `${d.name} Hurdacı`,
      desc: `${BRAND}, Mersin ${d.name} bölgesinde ve çevresinde demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alım hizmeti veriyor. Adresinize gelir, hassas tartı ile ölçüp bedelini kapıda peşin öderiz.`,
      image: IMG.excavator,
      imageAlt: `${d.name} hurda alımı`,
    })}

<section class="sec"><div class="container">
  <div class="split">
    <div>
      <span class="sec-tag">${d.name}</span>
      <h2 class="sec-title" style="margin-bottom:16px">${d.name}'de Hangi Hurdaları Alıyoruz?</h2>
      <p style="color:var(--ink-soft)">${d.name} ilçesindeki ev, işyeri, atölye ve inşaat alanlarından çıkan hurda malzemeleri değerlendiriyoruz. Talebinizi ilettikten sonra ekibimiz kısa sürede adresinize ulaşır.</p>
      <div class="accept-list">
        ${SERVICES.map(s => `<span>${s.name}</span>`).join('\n        ')}
      </div>
    </div>
    <div class="panel">
      <h3>${d.name} İçin Neden Bizi Tercih Etmelisiniz?</h3>
      <ul>
        <li>Adresinizden teslim alıyoruz</li>
        <li>Kapıda peşin ödeme</li>
        <li>Hassas ve şeffaf tartı</li>
        <li>7 gün hizmet</li>
      </ul>
    </div>
  </div>
</div></section>

<section class="sec" style="background:var(--bg-alt)"><div class="container">
  <div class="sec-head center">
    <span class="sec-tag">Çevre İlçeler</span>
    <h2 class="sec-title">Diğer Hizmet Bölgelerimiz</h2>
  </div>
  <div class="district-grid">
    ${nearby.map(n => `<a class="district-card" href="${n.id}-hurdaci.html"><b>${n.name} Hurdacı</b><span class="ic">${icon('arrow', 16)}</span></a>`).join('\n    ')}
  </div>
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>${d.name}'de Hurdanızı Değerlendirin</h2>
    <p>Bizi arayın, ${d.name} içindeki adresinize gelelim, bedelini kapıda peşin ödeyelim.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="hizmetlerimiz.html" class="btn btn-outline-invert">Hizmetlerimiz</a>
    </div>
  </div>
</section></div>
`,
  });
});

// ============ SSS ============
const FAQ = [
  ['Mersin\'de en yakın hurdacı hangisi?', `${BRAND}, Mersin'in tüm ilçelerinde adresinize gelerek hizmet verir; yani "en yakın hurdacı" aramanıza gerek kalmaz, siz hangi ilçede olursanız olun ekibimiz size gelir.`],
  ['Hurdacı telefon numaranız nedir?', `Bize ${PHONE_DISPLAY} numaralı hattımızdan 7 gün ulaşabilir, hurda türünüzü ve adresinizi iletebilirsiniz.`],
  ['Hangi hurda türlerini alıyorsunuz?', 'Demir, çelik, alüminyum, bakır, kurşun hurdalarının yanı sıra buzdolabı, çamaşır makinesi gibi beyaz eşyaları, klima ve kombi hurdalarını da satın alıyoruz.'],
  ['Adresimden alım yapıyor musunuz?', 'Evet, hurdanızı taşımanıza gerek kalmadan belirttiğiniz adrese gelip teslim alıyoruz.'],
  ['Ödemeyi ne zaman yapıyorsunuz?', 'Tartım işlemi tamamlanır tamamlanmaz bedelini kapıda ve peşin olarak ödüyoruz.'],
  ['Tartı nasıl yapılıyor, güvenilir mi?', 'Kalibreli hassas tartılarla, sizin gözünüzün önünde ölçüm yapıyoruz. Süreç tamamen şeffaftır.'],
  ['Hangi bölgelerde hizmet veriyorsunuz?', 'Mersin\'in Akdeniz, Mezitli, Toroslar, Yenişehir, Tarsus, Silifke, Erdemli, Gülnar, Mut, Bozyazı, Aydıncık, Çamlıyayla ve Anamur dahil tüm ilçelerinde hizmet veriyoruz.'],
  ['Minimum hurda miktarı var mı?', 'Genellikle miktar sınırı aramıyoruz; yoğunluğa göre planlama yapabilmemiz için önceden bizi aramanızı öneririz.'],
  ['Randevu almam gerekiyor mu?', 'Bizi telefonla arayıp adresinizi ve hurda türünü iletmeniz yeterli, size en uygun zamanı birlikte belirliyoruz.'],
  ['Fiyatlar sabit mi, yoksa güncel piyasaya göre mi belirleniyor?', 'Hurda fiyatları güncel piyasa koşullarına göre değişiklik gösterir. Güncel fiyat bilgisi için bizi arayabilirsiniz.'],
];
writePage('sss.html', {
  title: `Sıkça Sorulan Sorular | ${BRAND}`,
  description: `Hurda alımı, adresten teslim, kapıda ödeme ve hizmet bölgelerimizle ilgili en çok sorulan sorular ve cevapları.`,
  activeHref: 'sss.html',
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'SSS' }],
    title: 'Sıkça Sorulan Sorular',
    desc: 'Hurda alım sürecimizle ilgili merak edilenleri sizin için derledik.',
  })}

<section class="sec"><div class="container">
  <div class="faq">
    ${FAQ.map(([q, a]) => `<details class="faq-item"><summary>${q}<span class="ic">${icon('plus', 18)}</span></summary><p>${a}</p></details>`).join('\n    ')}
  </div>
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Sorunuzun Cevabını Bulamadınız mı?</h2>
    <p>Bizi arayın, size yardımcı olmaktan memnuniyet duyarız.</p>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="iletisim.html" class="btn btn-outline-invert">İletişime Geçin</a>
    </div>
  </div>
</section></div>
`,
});

// ============ ILETISIM ============
const mapQuery = encodeURIComponent(ADDRESS);
writePage('iletisim.html', {
  title: `İletişim | ${BRAND}`,
  description: `${BRAND} ile iletişime geçin: ${PHONE_DISPLAY}. Adres: ${ADDRESS}. 7 gün hurda alım talebiniz için bizi arayabilirsiniz.`,
  activeHref: 'iletisim.html',
  jsonLd: businessJsonLd,
  heroImage: null,
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'İletişim' }],
    title: 'İletişim',
    desc: 'Hurdanız için bize ulaşın, adresinize gelip hassas tartı sonrası kapıda peşin ödeme yapalım.',
  })}

<section class="sec"><div class="container">
  <div class="split">
    <div>
      <span class="sec-tag">Bize Ulaşın</span>
      <h2 class="sec-title" style="margin-bottom:16px">İletişim Bilgilerimiz</h2>
      <div class="panel" style="margin-bottom:16px">
        <h3>Hurdacı Telefon Numarası</h3>
        <p style="margin:0 0 14px"><a href="tel:${PHONE_TEL}" style="font-weight:800;font-size:1.2rem;color:var(--accent)">${PHONE_DISPLAY}</a></p>
        <h3>Adres</h3>
        <p style="margin:0 0 14px;color:var(--ink-soft)">${ADDRESS}</p>
        <h3>Çalışma Saatleri</h3>
        <p style="margin:0;color:var(--ink-soft)">7 gün hizmetinizdeyiz. Uygun randevu saati için bizi arayabilirsiniz.</p>
      </div>
      <div class="note-box"><span class="ic">${icon('info', 18)}</span><span>Hurdanızın tür ve yaklaşık miktarını telefonda belirtirseniz, size daha hızlı bir randevu saati verebiliriz.</span></div>
    </div>
    <div>
      <iframe title="${BRAND} konum haritası" src="https://www.google.com/maps?q=${mapQuery}&output=embed" width="100%" height="380" style="border:1px solid var(--line);border-radius:var(--radius)" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</div></section>

<div class="cta-wrap"><section class="cta">
  <div class="container">
    <h2>Hemen Arayın, Hurdanızı Değere Dönüştürelim</h2>
    <div class="cta-acts">
      <a href="tel:${PHONE_TEL}" class="btn btn-white">${icon('phone', 16)} ${PHONE_DISPLAY}</a>
      <a href="hizmet-bolgelerimiz.html" class="btn btn-outline-invert">Hizmet Bölgelerimiz</a>
    </div>
  </div>
</section></div>
`,
});

// ============ GIZLILIK POLITIKASI ============
writePage('gizlilik-politikasi.html', {
  title: `Gizlilik ve Çerez Politikası | ${BRAND}`,
  description: `${BRAND} gizlilik ve çerez politikası: kişisel verilerin işlenmesi ve çerez kullanımı hakkında bilgilendirme.`,
  activeHref: '',
  bodyHtml: `
${heroBlock({
    compact: true,
    breadcrumbItems: [{ label: 'Anasayfa', href: 'index.html' }, { label: 'Gizlilik ve Çerez Politikası' }],
    title: 'Gizlilik ve Çerez Politikası',
    desc: `Bu sayfa, ${LEGAL} tarafından işletilen ${BRAND} internet sitesinin kişisel veri ve çerez kullanım esaslarını açıklar.`,
  })}

<section class="sec"><div class="container" style="max-width:800px">
  <h2 class="sec-title" style="font-size:1.4rem;margin-bottom:14px">Veri Sorumlusu</h2>
  <p style="color:var(--ink-soft)">Bu internet sitesi ${LEGAL} tarafından işletilmektedir. İletişim bilgilerimize <a href="iletisim.html" style="color:var(--accent);font-weight:700">İletişim</a> sayfamızdan ulaşabilirsiniz.</p>

  <h2 class="sec-title" style="font-size:1.4rem;margin:26px 0 14px">Toplanan Veriler</h2>
  <p style="color:var(--ink-soft)">Sitemiz üzerinden bizimle telefon yoluyla iletişime geçtiğinizde paylaştığınız ad, telefon numarası ve adres gibi bilgiler yalnızca hurda alım talebinizi karşılamak amacıyla kullanılır ve üçüncü kişilerle paylaşılmaz.</p>

  <h2 class="sec-title" style="font-size:1.4rem;margin:26px 0 14px">Çerez Kullanımı</h2>
  <p style="color:var(--ink-soft)">Sitemizde, ziyaretçi deneyimini iyileştirmek amacıyla sınırlı sayıda çerez kullanılmaktadır. Çerez tercihlerinizi sayfanın altında yer alan bildirimden yönetebilirsiniz.</p>

  <h2 class="sec-title" style="font-size:1.4rem;margin:26px 0 14px">Haklarınız</h2>
  <p style="color:var(--ink-soft)">6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınızı kullanmak için ${PHONE_DISPLAY} numaralı telefondan bizimle iletişime geçebilirsiniz.</p>

  <h2 class="sec-title" style="font-size:1.4rem;margin:26px 0 14px">Güncellemeler</h2>
  <p style="color:var(--ink-soft)">Bu politika, gerekli görüldüğünde güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır.</p>
</div></section>
`,
});

// ============ ROBOTS + SITEMAP ============
const allSlugs = ['index.html', 'hakkimizda.html', 'hizmetlerimiz.html', 'hizmet-bolgelerimiz.html', 'sss.html', 'iletisim.html', 'gizlilik-politikasi.html']
  .concat(SERVICES.map(s => `${s.id}.html`))
  .concat(DISTRICTS.map(d => `${d.id}-hurdaci.html`));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSlugs.map(s => `  <url><loc>${DOMAIN}/${s === 'index.html' ? '' : s}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log('wrote sitemap.xml');

const robots = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robots, 'utf8');
console.log('wrote robots.txt');

// ============ LLMS.TXT (AI crawler / agent discovery file) ============
const llmsDocs = [
  ['Anasayfa', 'index.html', 'Hizmetler, hakkımızda, hizmet bölgeleri ve iletişim bilgilerine buradan ulaşılabilir.'],
  ['Hizmetlerimiz', 'hizmetlerimiz.html', 'Demir-çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alım hizmetlerinin tamamı.'],
  ...SERVICES.map(s => [s.name, `${s.id}.html`, s.short]),
  ['Hizmet Bölgelerimiz', 'hizmet-bolgelerimiz.html', "Mersin'in tüm ilçelerinde (Akdeniz, Mezitli, Toroslar, Yenişehir, Tarsus, Silifke, Erdemli, Gülnar, Mut, Bozyazı, Aydıncık, Çamlıyayla, Anamur) verilen hizmet."],
  ['Hakkımızda', 'hakkimizda.html', `${LEGAL} hakkında bilgi.`],
  ['İletişim', 'iletisim.html', 'Telefon, adres ve harita bilgileri.'],
  ['Sıkça Sorulan Sorular', 'sss.html', 'Hurda alım süreciyle ilgili en çok sorulan sorular ve cevapları.'],
  ['Site Haritası', 'sitemap.xml', 'XML sitemap.'],
];
const llms = `# ${BRAND}

> ${LEGAL} güvencesiyle Mersin ve tüm ilçelerinde (Akdeniz, Mezitli, Toroslar, Yenişehir, Tarsus, Silifke, Erdemli, Gülnar, Mut, Bozyazı, Aydıncık, Çamlıyayla, Anamur) demir, çelik, alüminyum, bakır, kurşun, beyaz eşya, klima ve kombi hurdası alan, adresinden teslim alıp kapıda peşin ödeme yapan hurdacı.

Telefon: ${PHONE_DISPLAY}. Adres: ${ADDRESS}. Çalışma saatleri: 7 gün. Hizmet alanı: Mersin ili ve tüm ilçeleri.

## Docs

${llmsDocs.map(([label, slug, desc]) => `- [${label}](${DOMAIN}/${slug === 'index.html' ? '' : slug}): ${desc}`).join('\n')}

## Optional

- [Gizlilik ve Çerez Politikası](${DOMAIN}/gizlilik-politikasi.html): Toplanan veriler, çerez kullanımı ve KVKK bilgilendirmesi.
`;
fs.writeFileSync(path.join(__dirname, 'llms.txt'), llms, 'utf8');
console.log('wrote llms.txt');

// ============ ADS.TXT ============
const adsTxt = `# ads.txt — ${BRAND} (${DOMAIN.replace('https://', '')})
#
# Bu dosya, IAB Tech Lab "Authorized Digital Sellers" standardidir ve
# sitede yer alacak reklamlarin (or. Google AdSense) yetkili saticilarini beyan eder.
# https://iabtechlab.com/ads-txt/
#
# ONEMLI: Google AdSense / Google Ad Manager hesabi actiginizda, hesabinizin
# "Site" bolumunde size ozel "pub-XXXXXXXXXXXXXXXX" yayinci kimligini goreceksiniz.
# Asagidaki satirdaki XXXXXXXXXXXXXXXX kismini kendi yayinci kimliginizle
# degistirip yorum isaretini (#) kaldirdiginizda dosya aktif hale gelir.
#
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
#
# Google Ads (arama/reklam kampanyasi) calistirmak icin ads.txt ZORUNLU degildir;
# bu dosya yalnizca sitede AdSense/Ad Manager reklami YAYINLAMAK isterseniz gereklidir.
# Google Ads kampanyalarinda uyumluluk icin asil onemli olan; site genelinde net
# isletme kimligi, adres/telefon bilgisi (bkz. iletisim.html) ve Gizlilik Politikasi
# (bkz. gizlilik-politikasi.html) sayfalarinin bulunmasidir - bu site bunlari icerir.
`;
fs.writeFileSync(path.join(__dirname, 'ads.txt'), adsTxt, 'utf8');
console.log('wrote ads.txt');

console.log(`\nToplam ${allSlugs.length} HTML sayfası üretildi.`);
