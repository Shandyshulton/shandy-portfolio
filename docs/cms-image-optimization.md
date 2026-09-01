# CMS Image Optimization — Panduan Implementasi

Dokumen ini untuk project **`shandy-portfolio-cms`** (Laravel). Tujuannya mengurangi beban gambar di production: portfolio sekarang men-download 1 gambar full-size 4× per proyek (1 galeri + 3 thumbnail), semuanya eager load.

Frontend portfolio (`shandy-portfolio`) sudah siap menerima field `thumb_url` per image — lihat `src/pages/Projects.jsx` (`normalizeCmsProject` / `ProjectShot`). Jadi tinggal sisi CMS yang mengeluarkannya.

## Apa yang perlu diubah di CMS

1. Generate varian **thumbnail** (kecil) setiap kali image di-upload.
2. Sertakan `thumb_url` di response **`GET /api/public/projects`** dan **`GET /api/public/projects/:slug`**.
3. (Opsional, paling berdampak) Konversi image ke **WebP** saat upload — screenshot 1600×1000 PNG bisa turun 70–80% ukuran.

## Setup dependency

Instal package image processing. Rekomendasi (pilih salah satu):

**Opsi A — Intervention Image v3 (paling simpel, support Laravel 10/11):**

```bash
composer require intervention/image
```

**Opsi B — Spatie Media Library (lebih lengkap, sudah handle konversi + varian):**

```bash
composer require spatie/laravel-medialibrary
```

Panduan di bawah pakai **Intervention Image** karena paling ringan dan tidak mengubah struktur tabel.

## 1. Generate thumbnail saat upload

Buat method helper untuk generate thumbnail + (opsional) WebP. Contoh di `app/Support/ImageOptimizer.php`:

```php
<?php

namespace App\Support;

use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Storage;

class ImageOptimizer
{
    public static function makeVariants(string $path): void
    {
        $disk = Storage::disk('public');
        if (!$disk->exists($path)) {
            return;
        }

        $manager = new ImageManager(['driver' => 'gd']); // atau 'imagick'
        $image = $manager->read($disk->path($path));

        // 1. Varian thumbnail 480px (cukup untuk thumbnail galeri)
        $thumb = $image->scaleDown(width: 480);
        $thumbPath = self::variantPath($path, 'thumb');
        $disk->put($thumbPath, $thumb->toWebp(quality: 70));

        // 2. (Opsional) Varian full-size terkompresi jadi WebP
        $full = $manager->read($disk->path($path));
        $full->scaleDown(width: 1600);
        $fullPath = self::variantPath($path, 'webp');
        $disk->put($fullPath, $full->toWebp(quality: 80));
    }

    private static function variantPath(string $original, string $suffix): string
    {
        $dir = dirname($original);
        $name = pathinfo($original, PATHINFO_FILENAME);
        $ext = pathinfo($original, PATHINFO_EXTENSION);

        return "{$dir}/{$name}-{$suffix}.webp";
    }
}
```

Panggil method ini di service yang menangani upload project image — contoh di `app/Services/ProjectImageService.php` (sesuaikan dengan struktur project kamu):

```php
<?php

namespace App\Services;

use App\Support\ImageOptimizer;
use Illuminate\Support\Facades\Storage;

class ProjectImageService
{
    public function storeUpload($file, int $projectId, array $meta = []): array
    {
        $path = $file->store('uploads/projects', 'public');
        ImageOptimizer::makeVariants($path);

        // Simpan record image ke DB dengan path asli + path varian
        // (misal kolom: image_url, thumb_url, webp_url)

        return [
            'image_url' => Storage::disk('public')->url($path),
            'thumb_url' => Storage::disk('public')->url(
                $this->variantPath($path, 'thumb')
            ),
            // 'webp_url' => Storage::disk('public')->url($this->variantPath($path, 'webp')),
        ];
    }
}
```

> **Catatan**: pastikan `php.ini` punya extension `gd` (atau `imagick`) aktif, dan `storage/app/public` di-symlink ke `public/storage` (`php artisan storage:link`).

## 2. Sertakan `thumb_url` di API public

Di resource/transformasi response project, tambahkan field thumbnail. Contoh `app/Http/Resources/ProjectResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            // ...field lain yang sudah ada...
            'images' => $this->images->map(fn ($image) => [
                'image_url' => $image->image_url,
                'thumb_url' => $image->thumb_url,
                'caption' => $image->caption,
                'alt_text' => $image->alt_text,
            ]),
        ];
    }
}
```

Frontend sudah otomatis membaca `thumb_url` — tidak perlu perubahan lagi di sisi React.

## 3. (Opsional tapi sangat disarankan) Konversi WebP penuh

Kalau mau hemat bandwidth maksimal tanpa ubah struktur frontend:

- Jalankan konversi WebP untuk **semua image yang sudah ada** (backfill). Buat command artisan:

```bash
php artisan make:command OptimizeExistingImages
```

```php
<?php

namespace App\Console\Commands;

use App\Support\ImageOptimizer;
use Illuminate\Console\Command;

class OptimizeExistingImages extends Command
{
    protected $signature = 'images:optimize';
    protected $description = 'Generate thumbnail + webp variants untuk semua project image';

    public function handle(): int
    {
        // Ambil semua record project_images yang belum punya thumb_url,
        // panggil ImageOptimizer::makeVariants($image->path), simpan thumb_url.
        $this->info('Done.');
        return self::SUCCESS;
    }
}
```

- Atau aktifkan kompresi di level **web server** (nginx) — langsung hemat bandwidth tanpa ubah kode, asal file sudah di-optimasi ukurannya:

```nginx
# nginx.conf di VPS CMS
location ~* \.(webp|jpg|jpeg|png)$ {
    gzip on;
    gzip_types image/svg+xml;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## Checklist verifikasi

Setelah deploy, cek di browser (DevTools → Network):

- [ ] Response `/api/public/projects` berisi `thumb_url` untuk setiap image.
- [ ] Thumbnail galeri (3 per proyek) memuat file kecil (`*-thumb.webp`, bukan full-size).
- [ ] Gambar utama full-size baru di-download saat thumbnail diklik.
- [ ] Tidak ada request image yang gagal/404.

## Referensi kode frontend

- `src/pages/Projects.jsx` — `normalizeCmsProject` memetakan `image.thumb_url` → `shot.thumbSrc`; `ProjectShot` (mode `compact`) memakai `thumbSrc` untuk thumbnail dan `src` untuk galeri utama, dengan `loading="lazy"`.
