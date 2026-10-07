# Vercel kurulumu

GitHub deposu: https://github.com/mevcikiraz-creator/htyglobal-website

## GitHub bağlantısı

1. https://vercel.com/new adresini açın ve GitHub hesabınızla giriş yapın.
2. GitHub uygulamasına yalnızca gerekli depo erişimini verin. Liste boşsa **Adjust GitHub App Permissions** ile `htyglobal-website` deposunu ekleyin.
3. `mevcikiraz-creator/htyglobal-website` için **Import** seçin.
4. Framework: **Next.js**, Root Directory: depo kökü, Node.js: **24.x**, Install Command: `npm ci`, Build Command: `npm run build:vercel`. Depodaki `vercel.json` bu komutları tanımlar. Production Branch: `main`.
5. Aşağıdaki hizmetleri ve ortam değişkenlerini yapılandırdıktan sonra Deploy edin.

GitHub kodunuzu saklar; Vercel web uygulamasını çalıştırır. Bu belge Vercel hesabınıza giriş yapmaz veya otomatik bir canlı yayın oluşturmaz.

## Veritabanı ve ortam değişkenleri

Vercel Marketplace üzerinden Neon/Supabase gibi PostgreSQL hizmetlerinden birini bağlayın veya mevcut yönetilen PostgreSQL veritabanınızı kullanın. Sağlayıcının bağlantı/TLS ve sunucusuz kullanım önerilerini izleyin.

Vercel Project Settings → Environment Variables:

- `DATABASE_URL`: PostgreSQL sağlayıcısının bağlantı adresi. Yerel bulut ortamındaki 127.0.0.1 veritabanı Vercel'den erişilemez.
- `AUTH_SECRET`: güvenli biçimde üretilmiş, en az 32 karakterlik rastgele gizli değer.
- `SITE_URL`: Vercel projesinin gerçek HTTPS adresi veya bağladığınız alan adı. Proje adresi belirlendikten sonra güncelleyin ve yeniden deploy edin.

Değerleri sohbet, GitHub veya paylaşılan loglara yazmayın. Preview ortamı için üretimden ayrı veritabanı ve secret kullanın. `ALLOW_DEV_STORE` ayarını etkinleştirmeyin; JSON deposu Vercel'de kalıcı değildir.

### Yeni Neon veritabanını terminal kullanmadan kurmak

Neon'u bu Vercel projesine bağladıktan sonra **Environment Variables** bölümünde `DATABASE_URL` değişkeninin **Production** için bulunduğunu doğrulayın. Gizli değerini açmanız/paylaşmanız gerekmez. Sonra yalnızca **Production** kapsamına `HTY_SETUP_DATABASE=true` ekleyin ve `main` dalının son commit'ini yeniden deploy edin. Build Command için elle yapılmış bir override varsa kaldırın veya `npm run build:vercel` yapın.

Bu açıkça etkinleştirilmiş ilk kurulum, tabloları kayıtlı migrations ile oluşturur ve mevcut içeriği değiştirmeyen örnek içerik seed komutunu çalıştırır. Reset/drop çalıştırmaz. Migration bağlantısında varsa Neon'un `DATABASE_URL_UNPOOLED` adresi kullanılır; uygulama/seed normal `DATABASE_URL` kullanır. Preview deployment'ları bu kurulum adımını çalıştırmaz. Kurulum başarısızsa build durur; uygulama eksik tablolarla yayımlanmaz.

Site açıldıktan sonra `HTY_SETUP_DATABASE` değişkenini kaldırın. Bayrak kaldırıldığında sonraki build işlemleri veritabanı kurulumu çalıştırmaz. Sonraki şema güncellemelerinde release migrations işlemi ayrıca planlanmalıdır. Bu veritabanı kurulumu yönetici hesabı veya auth secret oluşturmaz; aşağıdaki yönetici kurulum adımı ayrıca etkinleştirilir.

### İlk yönetici hesabını Vercel üzerinden oluşturmak

**Production** için `ADMIN_EMAIL`, `ADMIN_PASSWORD` (en az 12 karakter, en fazla 72 UTF-8 bayt) ve `AUTH_SECRET` (en az 32 karakterlik farklı rastgele değer) değişkenlerini **Secret** türüyle ekleyin. Hesap adı e-posta biçimindedir; bu işlem e-posta göndermez. `AUTH_SECRET` uygulamanın oturumlarını imzalar; şifreyle aynı olmamalı ve kurulum sonrasında korunmalıdır.

Yalnızca **Production** kapsamına `HTY_SETUP_ADMIN=true` (**Config**) ekleyip son commit'i yeniden deploy edin. Bu işlem mevcut hesabın şifresini, rolünü veya etkinliğini değiştirmez. Aynı etkin yönetici aynı şifreyle zaten varsa yeniden hesap açmaz; farklı bir yönetici varsa panel üzerinden kullanıcı eklemenizi ister. Eksik/geçersiz bootstrap bilgileri build'i durdurur. Preview deployment'ları hesap oluşturmaz. Tablolar henüz yoksa veritabanı bootstrap adımı da etkin olmalıdır.

`/admin/login` üzerinden giriş yaptıktan sonra `HTY_SETUP_ADMIN`, `ADMIN_EMAIL` ve `ADMIN_PASSWORD` değişkenlerini kaldırın; varsa `HTY_SETUP_DATABASE` bayrağını da kaldırın. **AUTH_SECRET ve DATABASE_URL kalmalıdır.** Sonraki deployment hesabı etkilemez. Şifreyi panelde değiştirdikten sonra bootstrap yeniden etkinleştirilirse eski şifreyle hesap sıfırlanmaz.

### Terminal üzerinden alternatif kurulum

Güvenli, üretim veritabanına erişebilen bir terminalde bağlantı bilgilerini ortam değişkenleriyle yükleyip sırayla çalıştırın:

```bash
npm ci
npm run db:generate
npm run db:migrate
# Yalnızca boş bir veritabanında örnek içerik isteniyorsa:
npm run seed
# Güvenli ADMIN_EMAIL ve ADMIN_PASSWORD sağlandıktan sonra:
npm run admin:create
```

Yönetici oluşturma bilgileri yalnızca bu komut için gereklidir; bunları genel uygulama ortamında tutmayın. Migration/seed yalnızca Production için `HTY_SETUP_DATABASE=true` etkinleştirildiğinde build sırasında çalışır. İlk yönetici hesabı yalnızca ayrıca `HTY_SETUP_ADMIN=true` ile etkinleştirildiğinde oluşturulur.

## Kalıcı dosyalar ve Vercel sınırları

Mevcut dosya adaptörü yerel disk kullanır. **Bu adaptör Vercel'in sunucusuz ortamında kalıcı dosya yükleme için uygun değildir.** Yerel upload klasörünü `/tmp` yapmak kalıcılığı çözmez. CMS görsel yüklemeleri ve RFQ eklerini canlı kullanıma açmadan önce `src/lib/storage.ts` arayüzünü özel S3/R2 veya uygun Blob depolamasına bağlamak gerekir; bu bağlantı henüz uygulanmadı.

Vercel Function istek/yanıt boyutu sınırları uygulamadaki 10 MB dosya limitinden daha düşük olabilir. Canlı upload entegrasyonu, doğrudan depolamaya yükleme veya bu sınırlarla uyumlu dosya limitleri içermeli; özel teklif eklerinin erişim kontrolü korunmalıdır. Yalnızca depolama token'ı eklemek mevcut adaptörü değiştirmez.

Veritabanı, secret ve site adresi ile halka açık sayfalar ve dosyasız CMS/form işlemleri denenebilir. Yükleme özelliklerini tümüyle çalışır kabul etmeyin.

## Yayın sonrası kontrol

- Ana sayfa, ürün/proje detayları ve Türkçe sayfalar açılıyor.
- Yetkisiz `/admin` erişimi giriş sayfasına yönleniyor.
- Yönetici girişi ve oluşturulan içerik kaydı çalışıyor.
- İletişim/teklif kayıtları veritabanında kalıyor.
- SITE_URL gerçek adresle eşleşiyor; sitemap ve canonical URL'ler doğru.
- Kalıcı depolama entegrasyonundan sonra dosyalar yeni deployment'ta da erişilebilir; özel ekler yetkisiz kişiye açılmıyor.

`main` dalına sonraki push işlemleri Vercel Git entegrasyonu etkinse yeni deployment başlatır. Yayın URL'si Vercel projesindeki deployment sonucundan alınır; bir adresi tahmin etmeyin.
