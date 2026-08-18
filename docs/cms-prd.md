# PRD: Portfolio CMS

## 1. Overview

Portfolio CMS adalah sistem admin untuk mengelola konten website portfolio Shandy Shulton Shihab tanpa perlu edit source code React setiap kali ada perubahan project, gambar, pengalaman, pendidikan, sertifikasi, atau informasi kontak.

CMS ini direkomendasikan dibuat sebagai project terpisah dari frontend portfolio saat ini.

Rekomendasi struktur:

```txt
C:\laragon\www\
  shandy-portfolio\       # Public frontend React/Vite
  shandy-portfolio-cms\   # CMS admin + backend API
```

Alasan:

- Security lebih baik karena database credential dan auth token tidak masuk ke frontend.
- Deployment lebih fleksibel: frontend bisa tetap di Vercel, CMS/API bisa di VPS.
- Maintenance lebih rapi karena public website dan admin dashboard punya tanggung jawab berbeda.
- CMS bisa expose public API yang dikonsumsi portfolio.

Alternatif yang masih aman adalah monorepo:

```txt
shandy-portfolio-system\
  apps\
    web\
    cms\
  packages\
    shared\
```

Namun untuk kondisi project saat ini, separate project lebih sederhana.

## 2. Goals

- Admin dapat menambah, mengubah, menghapus, dan mengurutkan project.
- Admin dapat upload banyak gambar untuk satu project.
- Website portfolio dapat menampilkan data project dari CMS/API.
- Admin dapat mengelola konten bilingual Indonesia dan English.
- CMS memiliki login admin yang aman.
- API publik hanya mengekspos data yang dibutuhkan website.

## 3. Non-Goals

- Tidak membuat multi-user role kompleks pada fase awal.
- Tidak membuat page builder bebas.
- Tidak membuat analytics dashboard advanced.
- Tidak mengganti desain utama portfolio secara penuh.

## 4. Users

Primary user:

- Shandy sebagai pemilik portfolio dan admin CMS.

Secondary user:

- Visitor website portfolio yang melihat data dari CMS.

## 5. Core Features

### 5.1 Authentication

Admin harus login sebelum masuk dashboard.

Requirement:

- Login menggunakan email dan password.
- Password disimpan dengan hashing.
- Session menggunakan JWT atau secure cookie.
- Logout tersedia.
- Route admin terlindungi.

### 5.2 Project Management

Admin dapat mengelola project portfolio.

Fields:

- Title ID
- Title EN
- Slug
- Type ID
- Type EN
- Role ID
- Role EN
- Date ID
- Date EN
- Status ID
- Status EN
- Summary ID
- Summary EN
- Description ID
- Description EN
- Tech stack
- GitHub URL
- Live demo URL
- Accent color
- Sort order
- Visibility: draft/published

Actions:

- Create project
- Edit project
- Delete project
- Publish/unpublish project
- Reorder project

### 5.3 Project Image Gallery

Setiap project bisa punya banyak gambar.

Fields:

- Image file
- Alt text ID
- Alt text EN
- Label ID
- Label EN
- Sort order

Rules:

- Satu project boleh punya 0 atau lebih gambar.
- Gambar pertama menjadi default preview.
- Admin bisa reorder gambar.
- Admin bisa delete gambar.
- Format awal: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Rekomendasi ukuran screenshot: 1600x1000 atau rasio 16:10.

### 5.4 Highlights

Setiap project bisa punya beberapa highlight fitur.

Fields:

- Highlight ID
- Highlight EN
- Sort order

### 5.5 Education, Experience, Certification

CMS fase berikutnya bisa mengelola:

- Education
- Experience
- Certification
- Skills
- Contact info

Untuk MVP, fokus utama adalah Project CMS.

## 6. Public API Requirements

Portfolio frontend membutuhkan API publik untuk membaca konten published.

Endpoints MVP:

```txt
GET /api/public/projects
GET /api/public/projects/:slug
```

Response `GET /api/public/projects`:

```json
[
  {
    "id": 1,
    "slug": "easysaving",
    "title": {
      "id": "EasySaving",
      "en": "EasySaving"
    },
    "type": {
      "id": "Pelacak Keuangan",
      "en": "Finance Tracker"
    },
    "role": {
      "id": "Front-End Developer",
      "en": "Front-End Developer"
    },
    "date": {
      "id": "Oktober 2025",
      "en": "October 2025"
    },
    "status": {
      "id": "Live di VPS",
      "en": "Live on VPS"
    },
    "summary": {
      "id": "Antarmuka pencatat tabungan...",
      "en": "Savings tracker interface..."
    },
    "description": {
      "id": "Aplikasi web untuk membantu pengguna...",
      "en": "A web app that helps users..."
    },
    "stack": ["React.js", "Vite", "Tailwind CSS", "JavaScript"],
    "githubUrl": null,
    "liveUrl": "https://easysaving.asia/",
    "accentColor": "#2a7cc8",
    "images": [
      {
        "url": "https://cms-domain.com/uploads/easysaving-dashboard.webp",
        "label": {
          "id": "Dashboard",
          "en": "Dashboard"
        },
        "alt": {
          "id": "Screenshot dashboard EasySaving",
          "en": "EasySaving dashboard screenshot"
        }
      }
    ]
  }
]
```

## 7. Admin UI Pages

MVP pages:

- Login
- Dashboard overview
- Project list
- Create project
- Edit project
- Project image manager

Project list should show:

- Thumbnail
- Title
- Status
- Stack preview
- Last updated
- Published/draft state
- Edit button

Project editor should include:

- Language sections for ID and EN content
- Tech stack input
- Link fields
- Color picker
- Image gallery manager
- Save draft
- Publish

## 8. Database Draft

Suggested tables:

```txt
admins
projects
project_translations
project_images
project_image_translations
project_highlights
project_highlight_translations
```

Simpler MVP option:

```txt
admins
projects
project_images
```

In the simpler option, bilingual text can be stored as JSON columns:

```txt
title_json
type_json
role_json
date_json
status_json
summary_json
description_json
highlights_json
```

## 9. Recommended Tech Stack

Recommended for this portfolio:

- Backend/API: Laravel or Node.js Express/Fastify
- Database: MySQL
- Admin frontend: React + Vite
- File storage MVP: local VPS storage
- File storage future: S3-compatible storage
- Deployment: VPS

If using Laravel:

- Laravel handles auth, validation, migrations, and file upload cleanly.
- Good fit because Shandy already has Laravel/MySQL experience.

If using Node.js:

- Easier shared JavaScript stack with React.
- Needs more manual setup for auth and uploads.

Recommendation: Laravel + MySQL for backend CMS, React/Vite for admin UI if a custom dashboard is desired.

## 10. Integration With Current Portfolio

Current portfolio can be migrated in phases.

Phase 1:

- Keep current static project data as fallback.
- Build CMS/API separately.
- Test API manually.

Phase 2:

- Add env to portfolio:

```env
VITE_CMS_API_URL=https://api.your-domain.com
```

- Fetch projects from:

```txt
GET {VITE_CMS_API_URL}/api/public/projects
```

Phase 3:

- Replace static `projects` array in `src/pages/Projects.jsx`.
- Keep local fallback if API fails.
- Deploy portfolio and CMS separately.

## 11. Success Metrics

- Admin can add a new project without editing React code.
- Admin can upload at least 3 screenshots per project.
- Published project appears on portfolio.
- Language switch still works for CMS-loaded content.
- API response loads in under 500ms for project list on normal network.

## 12. MVP Scope

MVP should include:

- Admin login
- CRUD projects
- Bilingual project content
- Multiple images per project
- Publish/draft
- Public project API
- Portfolio integration

MVP should not include:

- Multi-admin roles
- Complex media library
- Page builder
- Comments
- Analytics

## 13. Open Questions

- CMS akan dibuat dengan Laravel atau Node.js?
- Domain API akan pakai subdomain apa? Contoh: `cms.shandy...` atau `api.shandy...`
- Gambar akan disimpan di VPS local storage dulu atau langsung S3-compatible storage?
- Apakah konten selain Projects juga ingin masuk MVP?
- Apakah CMS perlu fitur preview sebelum publish?
