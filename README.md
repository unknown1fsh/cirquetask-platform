<p align="center">
  <img src="https://img.icons8.com/fluency/96/lightning-bolt.png" alt="CirqueTask Logo" width="80"/>
</p>

<h1 align="center">CirqueTask</h1>
<h3 align="center">Gerçek Zamanlı İşbirlikçi Proje Yönetim Platformu</h3>
<h3 align="center">Real-Time Collaborative Project Management Platform</h3>

<p align="center">
  <a href="https://github.com/unknown1fsh/cirquetask-platform"><img src="https://img.shields.io/badge/Repo-cirquetask--platform-24292f?style=for-the-badge&logo=github" alt="Repository"></a>
  <a href="#"><img src="https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 17"></a>
  <a href="#"><img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot 3.2"></a>
  <a href="#"><img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17"></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/WebSocket-STOMP-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <strong>Angular 17 + Spring Boot 3.2 + PostgreSQL + WebSocket</strong> ile inşa edilmiş,<br/>
  kurumsal seviyede full-stack proje yönetim platformu.
</p>

---

**README available in:** [Türkçe](#-türkçe) | [English](#-english)

---

## 🇹🇷 Türkçe

### Bu Proje Nedir?

**CirqueTask**, ekiplerin projelerini uçtan uca yönetebileceği bir platformdur. Jira, Trello ve Asana benzeri araçların temel özelliklerini tek uygulamada bir araya getirir. Angular 17, Java 17 ve Spring Boot 3.2 ile modern web teknolojilerinin profesyonel düzeyde kullanımını örnekler.

### Özellikler

- **Kullanıcı ve güvenlik:** E-posta/şifre kayıt ve giriş, JWT (Access + Refresh token), BCrypt ile şifre hashleme.
- **Proje yönetimi:** Sınırsız proje; renk, ikon ve prefix (örn. VTX); üye daveti; OWNER / ADMIN / MEMBER / VIEWER rolleri.
- **Kanban board:** Özelleştirilebilir kolonlar, sürükle-bırak, WebSocket ile anlık senkronizasyon.
- **Görev (task) yönetimi:** Benzersiz anahtar (VTX-1, VTX-2…), tipler (Task, Bug, Feature, Improvement, Epic), öncelik, atamalar, etiketler, story points, son tarih, alt görevler, yorumlar.
- **Gerçek zamanlı işbirliği:** STOMP/WebSocket ile board güncellemeleri ve anlık bildirimler.
- **Bildirimler:** Görev atama, yorum, üye ekleme vb. için 7 bildirim tipi; okundu/okunmadı, WebSocket push.
- **Dashboard ve analitik:** Özet istatistikler, durum/öncelik dağılımı (grafikler), aktivite akışı, yaklaşan son tarihler.
- **Sprint, raporlar, Gantt, takvim:** Sprint yönetimi, metrikler, Gantt görünümü, takvim entegrasyonu.
- **Özel alanlar ve iş akışları:** Özelleştirilebilir alanlar, tetikleyici tabanlı kurallar.
- **Zaman kaydı ve bağımlılıklar:** Görevlere süre loglama, görev bağımlılıkları.
- **Aktivite / denetim:** Kim, ne zaman, ne yaptı; eski/yeni değer karşılaştırması.
- **Tema ve responsive:** Dark/Light mode, Angular Material, masaüstü/tablet/mobil uyum.

### Teknoloji Mimarisi

```
+------------------+     HTTP / WebSocket     +------------------+
|   Angular 17     | <----------------------> | Spring Boot 3.2  |
|   (Port 4200)    |                          |   (Port 8080)    |
| Material, CDK,   |                          | Security, JWT,   |
| Chart.js, STOMP  |                          | WebSocket, JPA,  |
+------------------+                          | Flyway, Swagger  |
                                              +--------+---------+
                                                       | JDBC
                                              +--------+---------+
                                              |   PostgreSQL     |
                                              |   (Port 5432)    |
                                              +------------------+
```

- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT (jjwt), Spring Data JPA, Spring WebSocket, Flyway, MapStruct, Lombok, SpringDoc OpenAPI, HikariCP, PostgreSQL.
- **Frontend:** Angular 17, Angular Material, CDK (Drag & Drop), Chart.js / ng2-charts, RxJS, STOMP.js, SockJS, SCSS.

### Proje Yapısı

- **backend/** — Spring Boot (com.cirquetask): controller (Auth, Project, Board, Task, Comment, Notification, Dashboard, User, Sprint, Label, Attachment, Audit, Search, Report, Gantt, Calendar, CustomField, Workflow, TimeLog, TaskDependency, BulkOperation, SprintMetrics), service, repository, entity, dto, mapper, config, security, websocket, exception.
- **frontend/** — Angular 17 SPA: core (auth, guards, interceptors, services), layout, features (auth, dashboard, projects, board, analytics, team, notifications, settings).
- **docker-compose.yml** — PostgreSQL 16, backend, frontend (Nginx).

### Kurulum ve Çalıştırma (Türkçe)

**Ön koşullar:** Java 17+, Maven 3.9+, Node.js 18+, npm 9+, PostgreSQL (veya Docker).

1. **Klonlama**
   ```bash
   git clone https://github.com/unknown1fsh/cirquetask-platform.git
   cd cirquetask-platform
   ```

2. **Veritabanı:** PostgreSQL’de `cirquetask_db` veritabanı oluşturun veya Docker ile `docker-compose up -d` ile postgres servisini başlatın. Flyway ilk çalışmada şemayı uygular.

3. **Backend**
   ```bash
   cd backend
   mvn clean install -DskipTests
   mvn spring-boot:run
   ```
   İsteğe bağlı: `DB_PASSWORD` ortam değişkeni ile şifre override edilebilir (varsayılan application.yml’de tanımlı).

4. **Frontend** (yeni terminal)
   ```bash
   cd frontend
   npm install
   npx ng serve
   ```

5. Tarayıcı: **http://localhost:4200** — Giriş sayfası; yeni hesap oluşturup kullanabilirsiniz.

**Docker ile hepsini başlatmak:**
```bash
docker-compose up -d
```
- Frontend: http://localhost:4200 (Nginx port 80 → 4200)
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432 (kullanıcı/şifre: postgres)

### Railway ile Deploy

Proje tek servis olarak Railway'da yayınlanabilir (Frontend + Backend tek container).

1. **Railway projesi oluştur:** [railway.app](https://railway.app) → New Project
2. **PostgreSQL ekle:** Add Service → Database → PostgreSQL
3. **GitHub repo bağla:** Add Service → GitHub Repo → Bu repoyu seç
4. **Postgres'i servise bağla:** App servisi → Variables → Add Reference → Postgres (PGHOST, PGPORT, vb. otomatik eklenir)
5. **Ortam değişkenleri:** Service → Variables bölümünde ekleyin:
   - `APP_URL` = `https://your-app.up.railway.app` (servise domain ekledikten sonra)
   - `JWT_SECRET` = güçlü base64 secret (production zorunlu)
6. **Domain ekle:** Service → Settings → Generate Domain
7. **Deploy:** GitHub push veya `railway up` ile otomatik deploy

Detaylı env listesi için `.env.example` dosyasına bakın.

**Yerel Railway benzeri test:**
```bash
docker compose -f docker-compose.railway.yml up -d
```
- Uygulama: http://localhost

---

## 🇬🇧 English

### What Is This Project?

**CirqueTask** is a real-time collaborative project management platform. It combines core features of tools like Jira, Trello, and Asana in a single application, built with Angular 17, Java 17, and Spring Boot 3.2 to demonstrate professional use of modern web technologies.

### Features

- **User management & security:** Email/password registration and login, JWT (Access + Refresh tokens), BCrypt password hashing.
- **Project management:** Unlimited projects; color, icon, and key prefix (e.g. VTX); member invites; OWNER / ADMIN / MEMBER / VIEWER roles.
- **Kanban board:** Customizable columns, drag-and-drop, real-time sync via WebSocket.
- **Task management:** Unique keys (VTX-1, VTX-2…), types (Task, Bug, Feature, Improvement, Epic), priority, assignees, labels, story points, due dates, subtasks, comments.
- **Real-time collaboration:** STOMP/WebSocket for board updates and instant notifications.
- **Notifications:** Seven notification types (task assigned, comment, member added, etc.); read/unread state, WebSocket push.
- **Dashboard & analytics:** Summary stats, status/priority distribution (charts), activity feed, upcoming deadlines.
- **Sprints, reports, Gantt, calendar:** Sprint management, metrics, Gantt view, calendar integration.
- **Custom fields & workflows:** Custom field definitions and trigger-based workflow rules.
- **Time logging & dependencies:** Time logs on tasks, task dependencies.
- **Activity / audit trail:** Who did what and when; old vs new value comparison.
- **Theming & responsive:** Dark/Light mode, Angular Material, desktop/tablet/mobile.

### Technology Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, Spring WebSocket, Flyway, MapStruct, Lombok, SpringDoc OpenAPI, HikariCP, **PostgreSQL**.
- **Frontend:** Angular 17, Angular Material, CDK (Drag & Drop), Chart.js / ng2-charts, RxJS, STOMP.js, SockJS, SCSS.

### Project Structure

- **backend/** — Spring Boot (com.cirquetask): REST controllers (Auth, Project, Board, Task, Comment, Notification, Dashboard, User, Sprint, Label, Attachment, Audit, Search, Report, Gantt, Calendar, CustomField, Workflow, TimeLog, TaskDependency, BulkOperation, SprintMetrics), services, repositories, entities, DTOs, mappers, config, security, websocket, exception handling.
- **frontend/** — Angular 17 SPA: core (auth, guards, interceptors, services), layout, feature modules (auth, dashboard, projects, board, analytics, team, notifications, settings).
- **docker-compose.yml** — PostgreSQL 16, backend, frontend (Nginx).

### Installation and Running (English)

**Prerequisites:** Java 17+, Maven 3.9+, Node.js 18+, npm 9+, PostgreSQL (or Docker).

1. **Clone**
   ```bash
   git clone https://github.com/unknown1fsh/cirquetask-platform.git
   cd cirquetask-platform
   ```

2. **Database:** Create a PostgreSQL database `cirquetask_db`, or start the stack with `docker-compose up -d` so the postgres service runs. Flyway applies the schema on first backend startup.

3. **Backend**
   ```bash
   cd backend
   mvn clean install -DskipTests
   mvn spring-boot:run
   ```
   Optional: override DB password via `DB_PASSWORD` environment variable (default is in application.yml).

4. **Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npx ng serve
   ```

5. Browser: **http://localhost:4200** — Login page; you can create a new account and use the app.

**Run everything with Docker:**
```bash
docker-compose up -d
```
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432 (user/password: postgres)

### Deploy with Railway

The project can be deployed as a single service on Railway (Frontend + Backend in one container).

1. **Create Railway project:** [railway.app](https://railway.app) → New Project
2. **Add PostgreSQL:** Add Service → Database → PostgreSQL
3. **Connect GitHub repo:** Add Service → GitHub Repo → Select this repo
4. **Link Postgres to app:** App service → Variables → Add Reference → Postgres (PGHOST, PGPORT, etc. are added automatically)
5. **Environment variables:** In Service → Variables, add:
   - `APP_URL` = `https://your-app.up.railway.app` (after adding a domain to the service)
   - `JWT_SECRET` = strong base64 secret (required for production)
6. **Add domain:** Service → Settings → Generate Domain
7. **Deploy:** Automatic on GitHub push, or run `railway up`

See `.env.example` for the full list of environment variables.

**Local Railway-style test:**
```bash
docker compose -f docker-compose.railway.yml up -d
```
- App: http://localhost

---

## API Documentation

Full API documentation is available via **Swagger UI** when the backend is running:

- **Swagger UI:** http://localhost:8080/swagger-ui.html  
- **OpenAPI JSON:** http://localhost:8080/api-docs  

Main endpoint groups: Auth, Projects, Boards, Tasks, Comments, Notifications, Dashboard, Users, Sprints, Labels, Attachments, Audit, Search, Reports, Gantt, Calendar, Custom Fields, Workflows, Time Logs, Task Dependencies, Bulk Operations, Sprint Metrics. WebSocket endpoint: `/ws` (SockJS + STOMP).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>CirqueTask</strong> — Angular 17 + Spring Boot 3.2 + PostgreSQL + WebSocket
</p>
<p align="center">
  <a href="https://github.com/unknown1fsh/cirquetask-platform">github.com/unknown1fsh/cirquetask-platform</a>
</p>
