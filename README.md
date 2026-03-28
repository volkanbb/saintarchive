# Saint Archive - E-Commerce & Yupoo Scraper Platform

Saint Archive, Yupoo üzerinden ürün çekme, katalog yönetimi ve modern bir mağaza arayüzü sunan kapsamlı bir E-ticaret platformudur. Proje, yüksek performanslı bir .NET backend ve modern bir Angular frontend üzerine inşa edilmiştir.

---

## 🚀 Teknoloji Yığını (Tech Stack)

### **Frontend**
*   **Framework:** Angular 19 (Standalone Components)
*   **Styling:** Tailwind CSS 3.4 (Modern, dark-theme UI)
*   **Icons:** Heroicons
*   **State & Logic:** RXJS, Angular Signals, Interceptors
*   **Drag & Drop:** Angular CDK

### **Backend**
*   **Runtime:** .NET 8.0 SDK
*   **Database:** PostgreSQL 16
*   **Architecture:** Clean Architecture (N-Layered)
*   **ORM:** Entity Framework Core (Code First)
*   **Seri Üretim Scraper:** Playwright (Headless Chromium)
*   **Security:** JWT Authentication & Role-based Authorization (Admin/User)
*   **Proxy:** Özel Image Proxy & Disk-based Caching (Yupoo resimlerini hızlandırmak için)

### **DevOps & Infrastructure**
*   **Containerization:** Docker & Docker Compose
*   **Reverse Proxy:** Built-in HttpClient Factory & Proxy Middleware
*   **Logging:** Serilog (Console & File)

---

## 📂 Dosyalama Yapısı (Project Structure)

### **Backend (Clean Architecture)**
```
backend/
├── ECommerce.API/             # Controller'lar, Middleware ve Program yapılandırması
├── ECommerce.Application/      # DTO'lar, Interfaceler ve İş mantığı tanımları
├── ECommerce.Domain/           # Entity'ler ve Temel modeller
├── ECommerce.Infrastructure/   # Dış servisler (Yupoo Scraper, JWT Provider vb.)
├── ECommerce.Persistence/      # Veritabanı Context'i, Migration'lar ve DB Katmanı
└── Dockerfile                  # .NET Build & Runtime tanımları
```

### **Frontend (Angular)**
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/               # Servisler, Guard'lar, Interceptor'lar ve Modeller
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Paneli (Ürün/Kategori yönetimi, Import)
│   │   │   └── user/           # Mağaza Arayüzü (Home, Product, Cart, Contact)
│   │   ├── shared/             # Ortak kullanılan küçük bileşenler
│   │   └── app.routes.ts       # Uygulama yönlendirme tanımları
│   └── index.html              # Giriş HTML dosyası
└── tailwind.config.js          # Stil yapılandırması
```

---

## ✨ Öne Çıkan Özellikler

1.  **Gelişmiş Yupoo Scraper:** Tek bir kategori URL'si üzerinden 3000+ albümü otomatik olarak tarar, görselleri ve başlıkları temizleyerek içeri aktarma (import) havuzuna hazırlar.
2.  **Admin Onay Sistemi:** Çekilen ürünler "Preview" aşamasında incelenir, fiyatlandırılır ve kategori atandıktan sonra mağazada yayına alınır.
3.  **Performans Odaklı Resim Proxy'si:** Yupoo resimlerini hızlı yüklemek için sunucu tarafında disk tabanlı önbellekleme (Disk Caching) yapar.
4.  **WhatsApp Entegrasyonu:** Müşteriler sepete ekledikleri ürünleri tek bir tıkla WhatsApp üzerinden detaylı bir liste olarak mağaza sahibine gönderebilir.
5.  **Modern Dark Arayüz:** Sokak modası (streetwear) estetiğine uygun, altın detaylı premium karanlık tema.

---

## 🛠 Kurulum ve Çalıştırma

Proje tamamen Dockerize edilmiştir, bu nedenle yerel makinenizde sadece **Docker** yüklü olması yeterlidir.

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/volkanbb/saintarchive.git
cd SaintArchiveProje
```

### 2. Docker Compose ile Başlatın
```bash
docker-compose up --build
```

### 3. Uygulamaya Erişin
*   **Storefront (Müşteri):** `http://localhost:4200`
*   **Admin Panel:** `http://localhost:4200/admin`
*   **Swagger API Docs:** `http://localhost:8080/swagger`

> [!IMPORTANT]
> **Varsayılan Admin Bilgileri:**
> *   **Email:** `admin@admin.com`
> *   **Şifre:** `obDs9gP4F9@`

---

## 🛡 Güvenlik ve Optimizasyon

*   **Scraper Verimliliği:** Playwright motoru singleton olarak yönetilir; böylece her işlemde sıfırdan tarayıcı açılmaz, kaynak tüketimi minumumda tutulur.
*   **API Güvenliği:** Tüm admin endpointleri JWT Bearer Token ile korunmaktadır.
*   **Database:** PostgreSQL verileri Docker volume'leri sayesinde konteyner silinse dahi korunur (`postgres_data_v3`).

---

## 📞 İletişim

Bu proje **Saint Archive** ekibi için geliştirilmiştir. Teknik sorularınız için geliştirici ekiple iletişime geçebilirsiniz.
