# Portofolio Jackson Lawrence: Dokumen Fondasi

*Ringkasan keputusan dan rencana dari sesi brainstorming, 9 November 2026. Direvisi di hari yang sama: bahasa situs, carousel desain, hosting project, posisi avatar, palet, navbar, dan gaya animasi. Diperbarui 10 November 2026: status avatar (jalur 3D terkendala aset), referensi situs dan alternatif tanpa model 3D (bagian 4.9), serta bagian Toolkit (bagian 4.10). Diperbarui lagi 10 November 2026: variasi animasi scroll per bab (bagian 4.11) dan gaya partikel referensi (bagian 4.12).*

## 1. Ringkasan

Jackson Lawrence adalah lulusan Computer Science (CGPA 4.00, beasiswa penuh) yang menyebut dirinya creative technologist. Ia pernah bekerja sebagai AI Engineer Intern, digital marketing consultant dengan fokus desain, dan video editor. Website portofolionya dirancang sebagai satu pengalaman scroll sinematik berbasis three.js: avatar 3D hasil foto dirinya pecah menjadi partikel dan berubah bentuk mengikuti isi tiap bab (toga, laptop, stylus, kamera) sambil berpindah sisi kiri dan kanan layar, lalu terbentuk kembali sebagai avatar di penutup. Pindah sisi hanyalah tata letak dasar: tiap bab punya gerakan scroll utama yang berbeda (bagian 4.11). Catatan 10 November 2026: jalur avatar 3D terkendala aset, sehingga gaya avatar kini terbuka. Rencana di bawah masih ditulis dengan avatar sebagai tokoh utama, dan alternatifnya ada di bagian 4.9.

Situs ini sepenuhnya statis (tanpa backend) dan seluruh teksnya berbahasa Inggris. Demo AI memakai proxy serverless tipis supaya key OpenAI tidak bocor. Semua project ditampung dalam satu file `projects.json` dan ditampilkan lewat halaman grid berfilter. Tiap project punya halaman sendiri di `/projects/<slug>`, sedangkan scroll utama hanya memuat satu project unggulan per bab (kecuali bab Design yang berupa carousel berputar).

## 2. Tujuan dan pengunjung

- **Tujuan:** membuktikan lewat websitenya sendiri bahwa Jackson menjembatani sisi engineer dan sisi desainer, bukan sekadar mendaftar isi CV.
- **Pengunjung utama:** recruiter atau hiring manager teknis, serta creative director atau klien yang mencari desain, marketing, atau video.
- **Role yang dibidik:** Software Engineering, Data/AI, Web Development, serta Digital Marketing dan Design.
- **Ukuran berhasil:** dalam 10 detik pertama pengunjung tahu siapa Jackson, apa keahliannya, dan ke mana harus klik berikutnya.

## 3. Keputusan dan batasan

| Topik | Keputusan |
| --- | --- |
| Backend | Tidak ada. Situs statis. |
| Visual inti | three.js dengan JavaScript biasa. Animasi di-scrub mengikuti scroll (bukan fade sekali ala AOS), dengan bab di-pin dan smooth scroll. |
| Avatar | Terbuka (10 November 2026). Rencana awal: 3D dari foto sendiri, diproses sekali di luar situs (bukan fitur live untuk pengunjung). Jalur 3D terkendala aset, jadi alternatif tanpa model 3D dicatat di bagian 4.9. |
| Alur pembuka | Splash screen yang halus, lalu home dengan avatar 3D. |
| Alur cerita | Rantai bab: Home, Education, Experience, Projects, Design, Video, Contact. Avatar berubah bentuk di tiap bab. |
| Konten | Mengacu ke profil LinkedIn, ditulis dalam bahasa Inggris. |
| Demo AI | Project AI ditampilkan sebagai demo (memakai OpenAI) lewat proxy serverless. |
| Halaman tambahan | Hasil desain, video, dan daftar project lengkap. |
| Perangkat | Responsif untuk desktop dan HP. |
| Bahasa situs | Inggris (satu bahasa, bukan dwibahasa). Dokumen ini tetap berbahasa Indonesia. |
| Galeri desain | Carousel berputar. Tekan atau tahan satu karya untuk membuka semua versinya, plus karya lainnya (bagian 4.6). |
| Halaman project | Tiap project punya halaman `/projects/<slug>`. Project web yang belum di-host dibawa ke situs ini, awalnya dalam satu repo (usulan, bagian 8.1). |
| Posisi avatar | Bergantian kanan dan kiri tiap bab (bagian 4.7). |
| Palet warna | Mid-tone "dusk", tidak terlalu gelap dan tidak terlalu terang. Usulan di bagian 4.8, belum final. |
| Navbar | Pill kaca melayang ala iOS 26 / Dynamic Island (bagian 4.8). |
| Toolkit | Bagian Toolkit di `/about` (anchor `#toolkit`), dengan ringkasan satu baris di bab Experience. Usulan, bagian 4.10. |
| Variasi animasi scroll | Tiap bab punya gerakan utama berbeda, bukan hanya pindah kiri-kanan. Referensi: apple.com, mbidirectmail.com, theinfinitysocks.com, fragment.im. Usulan di bagian 4.11, belum final. |
| Gaya partikel | Mengacu ke ksenpanchenko.com: partikel berupa karakter teks, dengan keadaan padat dan jarang. Cara kerja aslinya belum terverifikasi (bagian 4.12). |

## 4. Konsep kreatif: heliks

Idenya satu canvas three.js yang persisten di belakang seluruh situs. Kamera bergerak mengikuti scroll, dan satu set partikel yang sama berubah bentuk dari bab ke bab. Warna dipakai secara konsisten per kelompok bab: identitas (Home, Education, Contact), engineer (Experience, Projects), dan kreatif (Design, Video). Palet lengkap ada di 4.8. Sebagai usulan, motif heliks dua untai ungu dan koral yang saling melilit bisa dipakai sebagai garis timeline di halaman `/about`.

### 4.1 Splash screen

- Maksimal sekitar 3 detik. Progress digerakkan loading file sungguhan lewat `THREE.LoadingManager`, bukan delay palsu.
- Isi: partikel berbentuk glyph kode berkumpul membentuk siluet atau inisial, dengan counter 0 sampai 100%.
- Splash hanya memuat file titik kecil (`avatar-points.bin`). GLB avatar yang besar diunduh di belakang layar.
- Transisi ke home memakai canvas yang sama (tanpa reload): partikel morph menjadi scene hero, lalu avatar muncul dengan gerakan kecil seperti mengangguk atau melambai.
- Ada tombol skip. Pengunjung yang kembali melewati splash (simpan di `sessionStorage`). Jika `prefers-reduced-motion` aktif, cukup fade biasa.

### 4.2 Home

- Avatar solid dan ter-rig di sisi kanan layar (desktop), teks di kiri. Kepala dan mata mengikuti kursor.
- Teks ditulis sebagai HTML biasa di atas canvas (bukan digambar di three.js) untuk SEO, aksesibilitas, dan tampilan di HP.
- Isi: "Jackson Lawrence, creative technologist", sub "AI engineer × designer · CS 4.00 CGPA · full scholarship", dua tombol ("View AI lab" untuk recruiter teknis, "View design" untuk yang mencari kreatif), dan petunjuk scroll.
- Tombol "Quick mode" di dalam navbar membuka daftar ringkas tanpa animasi untuk pengunjung yang tidak sabar.

### 4.3 Rantai bab

| Bab | Avatar dan objek (dibentuk dari partikel) | Isi utama |
| --- | --- | --- |
| Home | Avatar kasual yang solid, kepala ikut kursor | Nama, tagline, dua tombol pilihan |
| Education | Pecah jadi partikel, lalu terbentuk toga, topi, dan ijazah | Kuliah, beasiswa, medali olimpiade, MBA, asisten lab |
| Experience | Laptop, silinder database, dan amplop pesan | AI.DECE (RAG) dan Quantum Infra (RabbitMQ), plus ringkasan Toolkit satu baris |
| Projects | Jendela browser melayang | Satu project unggulan dengan demo live, plus tombol "All projects" |
| Design | Stylus dan kanvas yang jadi poster, lalu zoom masuk ke carousel karya | Carousel berputar (t-banner, poster, booth, dan lainnya) dengan viewer semua versi; kampanye marketing, brosur, UI/UX |
| Video | Kamera dan film strip yang jadi reel | Reel video editing dan sinematografi |
| Contact | Partikel berkumpul jadi avatar solid lagi | Email, LinkedIn, CV |

### 4.4 Tiga jenis transisi

- **Dissolve penuh:** avatar jadi debu lalu terbentuk lagi. Dipakai hanya dua kali (Home ke Education, Video ke Contact) sebagai momen signature, supaya tidak membosankan.
- **Rakit objek:** avatar tetap berupa partikel, objek lama melebur dan objek baru terbentuk di tangan atau sampingnya. Dipakai untuk Education ke Experience, Projects, Design, dan Video.
- **Zoom masuk:** kamera masuk ke objek (layar laptop, jendela browser, frame poster), dan objek itu berubah menjadi demo atau galeri sungguhan di atas canvas.

### 4.5 Animasi scroll

- Morph partikel: satu nilai `uProgress` yang digerakkan GSAP ScrollTrigger dengan `scrub`.
- Kamera bergerak di sepanjang kurva (`CatmullRomCurve3`) sesuai posisi scroll.
- Teks mengikuti posisi scroll (scrubbed), bukan fire-once ala AOS: masuk dengan fade, blur, dan judul kata per kata, lalu keluar. Angka penting dibuat count-up yang ikut scroll (misalnya 4.00 dan 200,000+ views).
- Bab di-pin (`pin` di ScrollTrigger), dan partikel morph ke bab berikutnya di bagian akhir tiap bab.
- Smooth scroll dengan Lenis, sekarang dianggap wajib karena menentukan rasa animasi. Referensi rasa: apple.com dan motionsites.ai.
- Scratch v2 (`portfolio-scratch-v2.html`) memakai loop custom untuk membuktikan pola ini. Proyek asli memakai GSAP ScrollTrigger dan Lenis.
- Gerakan scroll tiap bab dibuat berbeda, tidak hanya pindah sisi (bagian 4.11). Scratch 10 November 2026 (`portfolio-scratch.html`, berlabel v3 di footer) baru memakai satu gerakan utama, yaitu pindah sisi sambil morph partikel.

### 4.6 Carousel desain

Hasil desain Jackson banyak (t-banner, poster, booth, dan lainnya), jadi bab Design dan halaman `/design` memakai carousel berputar. Bagian ini mencatat keputusan Jackson dan usulan teknisnya.

- **Keputusan:** carousel berputar. Menekan atau menahan satu karya memunculkan semua versi karya itu, beserta karya lainnya.
- **Rotasi (usulan):** berputar pelan secara otomatis. Berhenti saat kursor ada di atasnya, saat disentuh atau ditahan, dan saat tab tidak aktif. Di HP bisa digeser (swipe). Jika `prefers-reduced-motion` aktif, tidak berputar otomatis dan hanya bisa digeser manual.
- **Viewer (usulan):** tekan atau tahan membuka viewer layar penuh untuk karya itu. Isinya semua versi (misalnya Final, Draft 1, Draft 2) sebagai deretan yang bisa digeser, dan di bagian bawah daftar karya lainnya supaya bisa pindah tanpa menutup viewer. Viewer juga bisa dibuka dengan keyboard (Enter) dan ditutup dengan Esc atau tombol close, jadi tidak hanya bergantung pada long-press.
- **Bentuk (usulan):** ring 3D dari elemen HTML dengan CSS 3D transform yang digerakkan GSAP, di atas canvas (bukan plane di three.js). Alasannya: gambar tetap tajam, alt text tersedia, dan tap atau tahan lebih mudah ditangani.
- **Catatan teknis long-press:** di layar sentuh, menahan gambar memunculkan menu bawaan browser (simpan gambar, dan sebagainya). Bungkus tiap karya dalam `<button>`, matikan menu itu (`-webkit-touch-callout: none` dan handler `contextmenu`), supaya tahan bisa dipakai untuk membuka viewer.
- **Performa (usulan):** carousel hanya memuat thumbnail kecil. Gambar versi penuh dimuat saat viewer dibuka (lazy load).
- **Data:** tiap karya satu entri di `projects.json` dengan tag `design` dan daftar `versions` (lihat bagian 6).
- **Halaman `/design`:** carousel yang sama di bagian atas, grid semua karya di bawahnya. Klik di grid membuka viewer yang sama.

### 4.7 Posisi avatar dan alur scroll

- Avatar berpindah sisi tiap bab: kanan di Home, Experience, Design, dan Contact; kiri di Education, Projects, dan Video. Teks selalu di sisi seberang. Pindah sisi adalah tata letak dasar, bukan satu-satunya gerakan: gerakan utama tiap bab berbeda (bagian 4.11).
- Avatar bergeser sambil morph dan menoleh ke arah teks. Objek tiap bab (toga, laptop, dan lainnya) dicerminkan ke arah tengah supaya tidak terpotong di tepi layar.
- Di HP avatar tetap di tengah atas dan teks di bagian bawah.
- Tiap bab setinggi sekitar 200vh dan di-pin kira-kira satu layar. Teks masuk dan keluar mengikuti posisi scroll.

### 4.8 Palet warna dan navbar

Palet mid-tone "dusk" (usulan). Background bergeser halus mengikuti kelompok bab:

| Kelompok bab | Background | Aksen dan partikel |
| --- | --- | --- |
| Identitas (Home, Education, Contact) | `#3a4160` | `#e6ecfa` |
| Engineer (Experience, Projects) | `#4b4078` | `#cdbfff` |
| Kreatif (Design, Video) | `#7b4b63` | `#ffc2ad` |

Warna teks `#f5f3f7`. Cek keterbacaan di layar sebenarnya sebelum difinalkan. Jika terasa terlalu gelap, naikkan kecerahan ketiga warna background.

Navbar berupa pill kaca melayang di tengah atas ala iOS 26 (Dynamic Island), memakai `backdrop-filter` blur dan saturate (sertakan `-webkit-backdrop-filter` untuk Safari). Saat ringkas, pill menampilkan "JL", nama bab aktif, dan tombol Quick mode. Saat di-hover, atau di-tap pada "JL" di HP, pill melebar dan menampilkan semua link bab.

### 4.9 Referensi situs dan alternatif tanpa model 3D

*Catatan 10 November 2026. Usulan, menunggu keputusan di bagian 11.*

Latar belakang: pembuatan avatar 3D terkendala aset. Jackson menyukai dua situs sebagai referensi. Bagian ini mencatat apa yang terbaca dari keduanya, lalu jalur alternatif yang tidak butuh model 3D.

**Aller Studio (allerstudio.com)**

- Situs studio product design di Lima, dibangun dengan Next.js (terlihat dari URL `/_next/image`).
- Yang disukai Jackson: sosok orang 3D di hero yang terurai menjadi partikel.
- Inspeksi otomatis (TinyFish) melaporkan sosok kepala dan bahu gelap di sisi kanan hero, partikel kuning dan putih yang menyebar, tanpa `<canvas>`, tanpa file `.glb`, `.gltf`, atau `.ktx2`, dan tanpa bundle bernama three atau gsap. **Laporan ini belum terverifikasi.** Beberapa isinya tidak cocok dengan halaman yang dibaca lewat fetch teks (agen tidak menemukan loading screen, padahal teks loader ada di halaman). Nama bundle Next.js biasanya berupa hash, jadi mencari nama file tidak membuktikan apa-apa, dan browser cloud bisa saja tidak menjalankan WebGL.
- Cara memastikan sendiri: buka DevTools, tab Network, filter `glb`, `gltf`, dan `ktx2`. Jika kosong, sosok itu kemungkinan besar gambar dengan lapisan partikel, bukan model 3D live.
- Aller adalah situs agensi tanpa bab pendidikan atau perubahan bentuk objek. Alur toga di bab Education adalah ide dari rencana ini sendiri, bukan dari Aller.

**JarnKet (jarnket.com)**

- Portofolio personal yang dibangun dengan Next.js dan GSAP (tertulis di footer).
- Konsepnya tenun (loom) dari budaya Laos. Konsep itu identitas pemiliknya, jadi tidak ditiru. Yang diambil hanya polanya: judul section dengan efek khusus, loader bertema, dan section Toolkit yang dikelompokkan (bagian 4.10).
- Potretnya tampaknya foto 2D dengan background dihapus (dilihat dari nama file gambarnya), bukan model 3D. Efek khasnya tidak butuh aset 3D.

**Jalur alternatif**

| Opsi | Aset yang dibutuhkan | Yang dipertahankan | Catatan |
| --- | --- | --- | --- |
| A. Potret partikel dari foto | 1 foto potret dengan background dihapus | Dissolve, rakit objek, morph per bab | Titik diambil dari piksel foto, bukan mesh 3D. Wajah tetap mirip karena fotonya sendiri. |
| B. Heliks sebagai tokoh utama | Tidak ada (prosedural) | Morph partikel, kamera di kurva, warna per kelompok | Dua untai ungu dan koral yang saling melilit, sejalan dengan ide di bagian 4. |
| C. Foto 2.5D dengan depth map | 1 foto dan 1 depth map (bisa digenerate) | Kepala yang mengikuti kursor | Bidang foto digeser per piksel sesuai kedalaman. Murah dan terasa hidup. |
| D. Ilustrasi vektor beranimasi | Ilustrasi diri (Illustrator atau Figma) | Karakter pindah kiri-kanan, mata mengikuti kursor | Pakai Rive atau layer dengan GSAP. Tanpa risiko uncanny valley. |
| E. Karya sebagai bintang | Karya yang sudah ada (desain, reel, screenshot project) | Struktur bab dan scroll sinematik | Tanpa tokoh. Gambar dan video tampil dengan masking, clip-path, dan transisi shader antar karya. |

**Usulan:** gabungan A dan B. Heliks menjadi tulang punggung visual yang selalu ada, potret partikel dari foto muncul di Home dan Contact, dan objek tiap bab (toga, laptop, kamera) dibentuk dari bentuk sederhana. Morph partikel, `uProgress`, ScrollTrigger, dan Lenis di 4.5 tetap dipakai apa adanya. Yang berubah hanya sumber titiknya.

**Dari foto ke titik (jalur A)**

- Siapkan foto potret dengan background dihapus (PNG dengan alpha), sekitar 1024 px.
- Gambar foto ke canvas 2D di luar layar, ambil piksel yang tidak transparan, lalu sample N titik (30.000 di desktop, 10.000 di HP) dan simpan sebagai `portrait-points.bin`. Sumbu z bisa diisi dari luminance atau depth map supaya terasa berisi (opsional).
- Objek bab dibuat dengan cara yang sama: gambar bentuk sederhana (atau path SVG) ke canvas, lalu sample dengan rutin yang sama. Satu rutin untuk potret dan semua objek.
- Selebihnya sama dengan 7.3: jumlah titik sama di tiap bab dan shader mencampur (`mix`) dua susunan titik yang berurutan.

```js
function sampleCanvasPoints(canvas, n) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  const solid = []; // pasangan x, y untuk piksel yang tidak transparan
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > 128) solid.push(x, y);
  const pts = new Float32Array(n * 3);
  const count = solid.length / 2;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * count) * 2;
    pts[i * 3] = (solid[k] / w - 0.5) * 2;
    pts[i * 3 + 1] = -(solid[k + 1] / h - 0.5) * 2 * (h / w);
    pts[i * 3 + 2] = 0; // isi dari luminance atau depth map jika perlu
  }
  return pts; // simpan sekali sebagai portrait-points.bin
}
```

**Ide kecil dari referensi** (usulan, belum masuk 4.1 dan 4.2)

- Label counter loader bertema Jackson, misalnya "Embeddings, Prompts, Frames, Layers, Color grading, Runtime", menggantikan teks generik di splash (4.1).
- Badge status di Home, misalnya "Open to roles" dengan keterangan ketersediaan yang diisi sesuai kenyataan.
- Jam lokal kecil "Jakarta | --:--" di navbar atau pojok Home.
- Toggle suara hanya jika ada audio ambience yang benar-benar bagus, dan default-nya mati.

### 4.10 Toolkit

*Usulan, menunggu konfirmasi daftar di bagian 11.*

Terinspirasi section Toolkit di JarnKet (tool dikelompokkan per disiplin, dengan angka ringkasan). Di sini kelompoknya mengikuti dua sisi, engineer dan kreatif, supaya sisi jembatannya terlihat.

- **Penempatan:** bagian utama di halaman `/about` (anchor `#toolkit`), setelah pendidikan dan pengalaman lengkap dan sebelum tombol unduh CV. Di scroll utama (`/`), bab Experience memuat satu baris ringkasan (misalnya "19 tools across 5 disciplines") dengan tautan "See full toolkit" ke `/about#toolkit`. Toolkit tidak mendapat bab sendiri supaya rantai bab tetap pendek dan tidak perlu objek partikel baru.
- **Kelompok** (daftar awal dari isi dokumen ini, lengkapi sendiri):

| Kelompok | Sisi | Tool |
| --- | --- | --- |
| Languages & Frameworks | Engineer | Python, JavaScript, Laravel, React, Next.js |
| AI & Data | Engineer | LangChain, ChromaDB, Weaviate, OpenAI API, MySQL |
| Infrastructure | Engineer | Docker, RabbitMQ |
| Design | Creative | Photoshop, Lightroom, Figma, Spline 3D, Blender 3D |
| Video & Motion | Creative | Premiere Pro, After Effects |

- **Warna:** chip sisi engineer memakai aksen `#cdbfff` dan sisi kreatif memakai `#ffc2ad` (bagian 4.8), di atas background kelompok identitas `#3a4160` karena `/about` termasuk halaman identitas.
- **Data:** satu file statis `toolkit.json` (kelompok, sisi, dan daftar tool dengan `name` serta `url` opsional), konsisten dengan pola `projects.json`. Angka "N tools · M disciplines" (daftar di atas menghasilkan 19 dan 5) dihitung dari data, bukan ditulis manual, dan ikut count-up seperti di 4.5.
- **Tautan (opsional):** tiap tool bisa menaut ke situs resminya (seperti JarnKet) atau, lebih bermakna, membuka `/projects?tool=<nama>` yang memfilter project dengan tool itu. Opsi kedua butuh field `stack` di tiap entri `projects.json` (bagian 6).
- **Efek judul (usulan):** kata "Toolkit" terbentuk dari partikel yang berkumpul saat masuk viewport, memakai rutin sampling canvas yang sama dengan 4.9, jadi tanpa aset 3D. Teks aslinya tetap `<h2>` HTML (SEO dan aksesibilitas), dan efek partikel hanya lapisan dekoratif. Jika `prefers-reduced-motion` aktif atau WebGL lemah, tampilkan judul biasa.

### 4.11 Variasi animasi scroll

*Catatan 10 November 2026. Usulan, menunggu keputusan di bagian 11.*

Latar belakang: scratch pertama hanya memakai satu gerakan (avatar pindah kiri-kanan sambil morph), jadi terasa berulang. Jackson meminta animasi scroll yang beranekaragam, dengan referensi apple.com, mbidirectmail.com, theinfinitysocks.com, dan fragment.im. Bagian ini mencatat apa yang terbaca dari tiap referensi, lalu memetakannya ke bab.

**Batas pengamatan.** mbidirectmail.com, theinfinitysocks.com, dan fragment.im dibaca lewat teks halaman, bukan dilihat bergerak, jadi cara animasi persisnya adalah dugaan sampai dicek di browser (DevTools atau rekaman layar). apple.com tidak dibaca langsung karena tidak ada halaman tertentu yang disebut. Catatan Apple berasal dari tulisan tutorial pihak ketiga, bukan dokumentasi Apple.

| Referensi | Yang terbaca | Yang bisa dipinjam |
| --- | --- | --- |
| apple.com (via tutorial) | Menurut tutorial, halaman produk seperti AirPods menggambar urutan gambar ke `<canvas>` sesuai posisi scroll. Canvas dibuat `sticky` di dalam kontainer yang tinggi, aset di-preload, scroll asli tidak dibajak, dan di layar kecil atau perangkat lambat diganti satu gambar statis. | Objek yang berputar atau membesar mengikuti scroll (turntable). Karena sudah punya titik 3D, rotasi dan zoom cukup di-scrub langsung tanpa urutan gambar. |
| mbidirectmail.com | Petunjuk "Scroll to explore", rangkaian bagian pendek dengan satu pesan masing-masing, mock UI laporan kampanye (ROAS, Response Rate, tren 12 bulan, pilihan Scale, Optimize, Pivot), empat kartu "Click/Tap to explore" yang masing-masing berisi mini-UI (alur Day 0 sampai Day 3-5, feed kampanye, jumlah leads masuk, audience scan dengan angka), angka besar (10.5+ Billion, 550,000+, 3,000+), deretan logo klien, kontrol "Pause motion", dan penutup "Where it all converges" berisi formulir. | Mini-UI yang hidup di dalam bab, kartu yang membuka isinya saat diklik atau di-tap, angka besar yang naik, dan penutup yang mengumpulkan semuanya (konvergen). |
| theinfinitysocks.com | Loader dengan persen dan tombol SKIP, hero berupa poster lalu video, label telemetri kecil di hero (TRK·01, koordinat X dan Y), empat teknologi tampil satu per satu dengan penghitung 01/04 sampai 04/04, bagian branding tim dengan foto lapangan kosong dan potongan kaki (dua lapisan terpisah), teks nama pemain yang dijahit menjadi dua huruf inisial, testimoni video dengan overlay ala kamera (Rec 00:00:00, Cam 01, 9:16, 60fps), penutup "Get ready." dengan dua kantong sock, dan kontrol "Pause motion". | Panel yang di-pin dengan penghitung langkah, lapisan gambar yang ditumpuk, teks yang berubah bentuk, dan overlay HUD kamera dengan timecode. |
| fragment.im | Teks "Loading Page", judul hero tiga frasa, tiga statistik, tiga layanan (Brand Identity, Websites, Product Design) masing-masing dengan deskripsi dan daftar tag, empat proyek di "Recent Work" dengan tombol "See Project", CTA penutup, dan pilihan bahasa EN/PL. Dugaan: situs dibangun dengan Framer (tertulis di meta generator), dan tiap blok muncul 3 sampai 4 kali di teks karena varian layout per ukuran layar. Statistik "Years in design" terbaca 150 padahal bio menulis 15 tahun, kemungkinan artefak counter saat dibaca, jadi angka itu tidak dipakai. | Pola tiga item dengan deskripsi dan tag per item (bisa dibuat sebagai tab atau stack), kartu karya dengan aksi "See Project", dan statistik yang naik. |

**Katalog gerakan** (usulan)

| Gerakan | Cara kerja | Cocok untuk | Asal ide |
| --- | --- | --- | --- |
| Turntable scrub | Titik objek berputar dan membesar mengikuti scroll. | Education (toga) | Apple |
| Pin dengan langkah | Satu panel di-pin, isinya berganti per langkah dengan penghitung (misalnya 01 / 02). | Experience | theinfinitysocks.com |
| Mini-UI hidup | Widget kecil bergerak mengikuti scroll: pesan mengalir ke antrean, kueri diketik lalu hasil muncul. | Experience | mbidirectmail.com |
| Zoom masuk dengan clip-path | Jendela browser membesar sampai memenuhi layar lalu menjadi demo (sama dengan "zoom masuk" di 4.4). | Projects | Rencana sendiri (4.4) |
| Wipe versi | Masker `clip-path` menyapu dari Draft ke Final, mengikuti scroll, di atas carousel (4.6). | Design | theinfinitysocks.com (lapisan gambar) |
| Horizontal pin | Filmstrip bergeser menyamping selagi halaman di-pin, dengan overlay timecode "REC" yang berjalan. | Video | theinfinitysocks.com (overlay kamera) |
| Teks berubah bentuk | Nama lengkap menyusut menjadi inisial "JL". | Contact | theinfinitysocks.com (inisial) |
| Konvergen | Partikel dari bab-bab sebelumnya berkumpul menjadi avatar atau inisial beserta ajakan kontak. | Contact | mbidirectmail.com |
| Parallax berlapis | Partikel jauh, teks, dan objek bergeser dengan kecepatan berbeda, secara tipis. | Semua bab | Umum, tanpa referensi khusus |
| Klik atau tap | Partikel pecah dan kembali di titik sentuh (4.12). | Home | ksenpanchenko.com |
| Marquee kata | Baris kata kunci atau nama tool yang berjalan. | Toolkit, penutup | ksenpanchenko.com, mbidirectmail.com |
| Kartu buka-tutup | Kartu yang membuka isinya saat diklik atau di-tap. | Projects, Toolkit | mbidirectmail.com |

**Pemetaan ke bab** (usulan)

| Bab | Gerakan utama | Pendukung | Posisi avatar (4.7) |
| --- | --- | --- | --- |
| Home | Klik atau tap | Judul masuk kata per kata, kepala atau potret mengikuti kursor | Kanan |
| Education | Turntable scrub | Count-up 4.00 dan 200+ | Kiri |
| Experience | Pin dengan langkah | Mini-UI hidup | Kanan |
| Projects | Zoom masuk dengan clip-path | Kartu buka-tutup untuk "All projects" (opsional) | Kiri |
| Design | Wipe versi | Ring carousel (4.6) | Kanan |
| Video | Horizontal pin | Overlay timecode | Kiri |
| Contact | Konvergen | Teks berubah menjadi inisial | Kanan |
| Toolkit (`/about`) | Marquee kata | Chip terbentuk dari partikel (4.10) | Tidak ada |

**Aturan**

- Dua bab berurutan tidak memakai gerakan utama yang sama. Tiap bab hanya punya satu momen signature, sisanya pendukung kecil supaya tidak ramai.
- Pindah sisi (4.7) tetap menjadi tata letak dasar. Di bab zoom masuk dan horizontal pin, avatar boleh keluar frame sementara (partikel meluruh ke tepi).
- Scroll asli tidak dibajak. Lenis hanya menghaluskan, dan GSAP ScrollTrigger yang menggerakkan scrub (konsisten dengan 4.5).
- Toggle "Motion" atau "Pause motion" di footer. Tiga referensi (mbidirectmail.com, theinfinitysocks.com, ksenpanchenko.com) memilikinya. Nilai awal mengikuti `prefers-reduced-motion`.
- Fallback HP dan perangkat lambat: kurangi lapisan parallax, turunkan jumlah titik, dan ganti turntable dengan satu pose statis (menurut tutorial, Apple memakai gambar statis di layar kecil).
- Preload aset tiap bab sebelum bab itu masuk viewport.

### 4.12 Gaya partikel: referensi ksenpanchenko.com

*Catatan 10 November 2026. Usulan. Cara kerja aslinya belum terverifikasi.*

Jackson ingin partikelnya mengikuti ksenpanchenko.com. Situs itu dibaca lewat teks halaman, jadi gerakannya tidak terlihat. Yang terbaca:

- Partikel tampil sebagai karakter teks, bukan titik bulat. Tiga kartu layanan (Product & UX, Web & Systems, Social & Content) masing-masing memuat dua blok karakter di grid yang sama (sekitar 19 baris, lebar 22 sampai 26 karakter, dihitung dari teks yang terbaca). Satu blok padat, dengan karakter seperti ▓ ▒ # % + = / : yang membentuk siluet. Satu blok jarang, dengan karakter kecil seperti : + . · - yang tersebar.
- Hero bertuliskan "Click anywhere" dan "Tap anywhere" dengan judul "Design that clicks". Ada teks "Loading", dan footer memuat toggle "Dark theme", "Motion", dan "Sound".
- **Dugaan, belum terverifikasi:** dua blok karakter adalah dua keadaan (terkumpul dan tersebar) yang dicampur atau ditukar saat scroll, hover, atau klik. Efek yang dipicu klik di hero tidak terbaca dari teks.
- Cara memastikan sendiri: buka DevTools dan, di tab Elements, cari blok teks berisi karakter (kemungkinan `<pre>` atau banyak `<span>`) dan elemen `<canvas>`. Lalu rekam di tab Performance sambil scroll dan klik untuk melihat apa yang berubah tiap frame. Alternatifnya, kirim rekaman layar.

**Rancangan untuk situs ini** (usulan)

- **Glyph di canvas utama:** ganti titik bulat dengan karakter dari atlas, yaitu satu tekstur kecil berisi 8 karakter yang digambar sekali lewat canvas 2D. Tiap titik memilih satu karakter. Morph partikel, `uProgress`, dan kamera tidak berubah, hanya fragment shader yang berganti. Sketsa, belum diuji:

```glsl
// vertex: tambahkan varying, indeks karakter tetap per titik
varying float vGlyph;
// di main(): vGlyph = min(7.0, floor(aR * 8.0));

// fragment: atlas 8 karakter berurutan dalam satu baris
uniform sampler2D uAtlas;
uniform vec3 uC;
varying float vGlyph;
void main() {
  vec2 uv = vec2((vGlyph + gl_PointCoord.x) / 8.0, gl_PointCoord.y); // balik y jika karakter terbalik
  float a = texture2D(uAtlas, uv).a;
  if (a < 0.1) discard;
  gl_FragColor = vec4(uC, a);
}
```

- **Dua keadaan:** padat dan jarang, lewat satu uniform `uDensity`. Nilai tinggi memilih karakter padat (▓ # %) dan memperbesar titik, nilai rendah memilih karakter kecil (. : ·). Usulan: potret atau avatar di Home dan Contact serta objek tiap bab dibuat padat, sedangkan sisa titik di latar dibuat jarang.
- **Blok dekoratif kecil (DOM):** untuk ikon bab atau judul Toolkit, buat string karakter dari canvas sekali lalu tampilkan di `<pre aria-hidden="true">`. Teks aslinya tetap HTML biasa. Rutinnya:

```js
const RAMP = ' .:+=/#%▓'; // dari kosong ke padat
function canvasToAscii(canvas, cols, rows) {
  const ctx = canvas.getContext('2d');
  const cw = Math.max(1, Math.floor(canvas.width / cols));
  const ch = Math.max(1, Math.floor(canvas.height / rows));
  let out = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = ctx.getImageData(c * cw, r * ch, cw, ch).data;
      let a = 0;
      for (let i = 3; i < d.length; i += 4) a += d[i]; // alpha = seberapa penuh sel itu
      const v = a / ((d.length / 4) * 255);
      out += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
    }
    out += '\n';
  }
  return out; // diproses sekali, simpan hasilnya
}
```

- **Klik atau tap:** titik dalam radius tertentu dari titik sentuh pecah lalu kembali (gerakan "Klik atau tap" di 4.11).
- **Beban:** karakter harus cukup besar agar terbaca, jadi jumlah titiknya biasanya jauh lebih sedikit dari 30.000 di 7.3. Titik awal usulan: 6.000 di desktop dan 2.500 di HP (belum diuji, naikkan jika masih lancar).
- **Fallback:** jika WebGL lemah atau Motion dimatikan, tampilkan blok karakter statis.

## 5. Isi konten per bab

Sumber utama: profil LinkedIn Jackson. Prinsipnya: tiap bab satu headline dan 2 sampai 3 bukti, bukan menyalin CV.

Situs berbahasa Inggris, jadi poin di bawah ini hanya catatan konten dalam bahasa Indonesia, bukan teks final. Ketentuan penulisan teks situs:

- Semua teks yang tampil ditulis dalam bahasa Inggris: judul bab, tombol, microcopy, alt text gambar, dan meta tag (title, description, Open Graph). Set `<html lang="en">`.
- Format angka gaya Inggris: titik untuk desimal dan koma untuk ribuan (misalnya 93.71 sampai 98.85 dari 100, dan 200,000+ views).
- File CV yang bisa diunduh juga versi bahasa Inggris.
- Karena hanya satu bahasa, tidak perlu sistem multi-bahasa (i18n).

**Education**

- Universitas Multimedia Nusantara, Computer Science, Agustus 2022 sampai Agustus 2026. CGPA 4.00 di seluruh 8 semester dengan beasiswa penuh berbasis prestasi.
- MBA (Project Management) di GBS Malta, Oktober 2026 sampai Oktober 2027.
- Skripsi: NLP multibahasa, deteksi span ujaran kebencian pada teks campuran Indonesia-Inggris (multi-task learning dengan BLOOM-560M).
- Asisten lab untuk 4 mata kuliah (Algoritma dan Struktur Data, Pengantar Teknologi Multimedia, Sistem Basis Data, OOP), total 200+ mahasiswa, skor kepuasan 93,71 sampai 98,85 dari 100.
- Medali olimpiade matematika internasional 2017 sampai 2019 (HKIMO, TIMO, SEAMO, AIMO).
- Sertifikasi: IT Specialist (Artificial Intelligence), Huawei HCIA-AI V3.5, Python Intermediate, Competitive Programming. Juga program pertukaran pelajar Korea Selatan (2019) dan TOEIC 890.

**Experience**

- AI Engineer Intern, AI.DECE, Februari 2025 sampai Februari 2026: LLM, RAG, LangChain, ChromaDB, Weaviate, Next.js, Docker untuk pemrosesan dokumen, semantic search, laporan otomatis, dan visualisasi data.
- R&D Intern, PT Quantum Infra Solusindo, Februari sampai April 2025: message queue asinkron dengan RabbitMQ dan dashboard monitoring real-time dengan Next.js untuk sistem berorientasi rumah sakit.
- Web Developer UMN ECO 2024 dan Infinite UMN 2024 (React dan Laravel), PIC PPIF 2024, serta MC, PIC, dan marketing untuk Campus Visit 2023.
- Satu baris ringkasan Toolkit (jumlah tool dan disiplin) dengan tautan ke `/about#toolkit` (bagian 4.10).

**Projects**

- Satu project unggulan dengan demo live. Sisanya di halaman `/projects`, dan tiap project punya halaman `/projects/<slug>` (bagian 6.1).
- Kandidat dari data yang sudah ada: EcoFoods (aplikasi Android untuk food waste), klasifikasi penyakit daun pisang dengan CNN, skripsi NLP, WastyeCycle (UI/UX Figma), Gayale Corner (website UMKM), dan Ascents (website dengan Pokemon API, animasi, dan responsif).

**Design**

- Digital Marketing Consultant, Bangsar Heights Pavilion Sdn Bhd (Malaysia, remote), November 2024 sampai Februari 2026: brosur, banner, flyer, desain booth dan Instagram, iklan Instagram dan Facebook, serta branding visual. Kampanye menembus 200,000+ views dan dipakai tim sales.
- Alat: Photoshop, Lightroom, Figma, Spline 3D, Blender 3D.
- Tampilan: carousel berputar berisi karya terpilih (t-banner, poster, booth, dan lainnya). Tiap karya menyimpan beberapa versi yang dibuka lewat viewer (bagian 4.6).

**Video**

- Reel video editing, sinematografi, dan fotografi. Alat: Premiere Pro dan After Effects.
- Detail pekerjaan video editor (untuk siapa, jenis video) belum ditentukan. Lihat bagian 11.

**Contact**

- Email dan LinkedIn, plus tombol unduh CV. Nomor HP tidak ditampilkan di web publik karena mudah di-scrape dan jadi sasaran spam.

## 6. Menampung banyak project

- Tiap bab menampilkan satu project unggulan, kecuali Design yang menampilkan carousel beberapa karya terpilih. Semua project lain ada di `/projects` dengan filter tag (AI, Web, Mobile, Design, Video).
- Seluruh data diambil dari satu `projects.json`. Menambah project berarti menambah satu entri. Filter berjalan di browser, jadi tetap tanpa backend.
- Satu project boleh punya beberapa tag, sehingga muncul di beberapa filter.
- Thumbnail dikompres dan di-lazy load. Video panjang memakai embed YouTube atau Vimeo, bukan disimpan di repo.

Contoh skema satu entri (nilai contoh ditulis dalam bahasa Inggris karena tampil di situs):

```json
{
  "slug": "example-project",
  "title": "Project name",
  "tags": ["ai", "web"],
  "year": 2025,
  "role": "Jackson's role",
  "summary": "One or two sentences.",
  "stack": ["React", "Laravel"],
  "thumb": "/img/example-project.webp",
  "links": { "demo": "", "repo": "", "video": "" },
  "demoMode": "embedded",
  "versions": [],
  "featuredIn": "projects"
}
```

Field tambahan:

- `stack`: daftar tool yang dipakai project, dengan nama yang sama seperti di `toolkit.json`. Dipakai halaman detail project dan, secara opsional, filter `/projects?tool=<nama>` dari bagian Toolkit (4.10).
- `demoMode`: cara demo disajikan. `embedded` = hasil build disajikan di `/projects/<slug>/demo/`. `external` = di-host terpisah, URL-nya di `links.demo`. `recorded` = screencast atau video di `links.video`. `none` = tanpa demo.
- `versions`: dipakai karya desain, berisi daftar `{ "label": "Final", "src": "/img/design/example-final.webp" }`. Kosong untuk project biasa.
- `featuredIn`: bab tempat entri tampil sebagai unggulan. Di bab Design, semua entri dengan `featuredIn: "design"` masuk carousel.

### 6.1 Halaman tiap project

- `/projects/<slug>`: halaman detail yang dirender router portofolio. Isinya ringkasan, peran, stack, screenshot atau video, tombol Live demo (jika ada), dan tombol Source code (link repo GitHub).
- Perlu dibedakan **kode sumber** (untuk dibaca) dan **hasil build** (untuk dijalankan). Usulan: kode sumber tetap di repo GitHub masing-masing dan halaman project menautkannya, boleh ditambah kutipan kode pendek di halaman. Seluruh source tidak disalin ke repo portofolio, supaya repo tidak gendut dan salinannya tidak cepat basi.
- Hasil build (khusus `demoMode: embedded`) disajikan sebagai folder statis di `/projects/<slug>/demo/`. Cara menyajikan dan batas hosting ada di bagian 8.1.

## 7. Avatar 3D: dari foto sampai web

*Berlaku jika jalur avatar 3D dipakai. Jika tidak, lihat bagian 4.9 untuk jalur foto ke partikel tanpa model 3D.*

### 7.1 Pilihan tool

- **Jalur A, avatar dari selfie (cepat dan sudah ter-rig):** Avaturn dan MetaPerson Creator (Avatar SDK). Keduanya mengekspor GLB dari satu selfie depan. Avaturn juga menyertakan rig humanoid dan blendshape ARKit. Selfie yang baik: jelas, pencahayaan bagus, ekspresi netral, tanpa kacamata dan topi.
- **Jalur B, generator image-to-3D:** Meshy 6, Tripo, Hunyuan3D, dan Rodin. Gayanya lebih bebas (cocok untuk versi stylized) dan bisa menerima beberapa foto (Rodin sampai 5, Meshy dan Tripo sampai 4). Hasilnya biasanya mesh polos yang perlu dirapikan dan di-rig di Blender. Versi open-source (Hunyuan3D-2.1, TRELLIS.2) bisa dijalankan lokal tetapi butuh GPU besar.
- **Jangan pakai Ready Player Me.** Platformnya sudah tutup sejak 31 Januari 2026.
- **Urutan disarankan:** coba jalur A dulu karena ada jatah gratis dan cuma butuh beberapa menit. Jika vibe-nya kurang cocok, pakai jalur B untuk versi stylized. Wajah adalah bagian tersulit, jadi hasil tidak akan 100% mirip. Gaya stylized lebih aman dari efek uncanny valley.

### 7.2 Format akhir dan optimasi

- Format akhir: satu file `.glb` (glTF binary) yang memuat mesh, tekstur, rig, dan animasi, langsung dibaca `GLTFLoader` di three.js.
- Target: sekitar 3 sampai 5 MB, di bawah kurang lebih 50 ribu segitiga, tekstur 1024 sampai 2048 px.
- Perintah optimasi:

```bash
npx @gltf-transform/cli optimize avatar.glb avatar.min.glb --compress meshopt --texture-compress webp
```

- Pakai `meshopt`, bukan Draco, jika avatar punya blendshape wajah, karena lebih ramah ke morph target. Loader butuh `MeshoptDecoder`.

### 7.3 Dari avatar ke partikel

- Titik-titik diambil dari permukaan avatar, sekitar 30.000 titik (kurang lebih 360 KB sebagai `Float32Array`), disimpan sebagai `avatar-points.bin`. Splash cukup memuat file kecil ini. Di HP, turunkan menjadi sekitar 10.000 titik.
- Objek di tiap bab tidak perlu model sendiri. Bentuknya dibuat dari primitif (kerucut jadi toga, kotak pipih jadi topi dan laptop, silinder jadi database, lingkaran plus kotak jadi kamera), lalu di-sample jadi titik. Hasilnya nol file tambahan, gaya konsisten, dan tidak ada masalah baju yang menembus mesh hasil AI.
- Jumlah titik dibuat sama di tiap bab (misalnya 30.000), dibagi sekitar 60% untuk badan dan 40% untuk objek. Shader mencampur (`mix`) dua susunan titik yang berurutan.
- Jika avatar terdiri dari beberapa mesh (kepala, badan, baju), sample dari semuanya atau gabungkan dulu di Blender.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load('/avatar.min.glb', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('isMesh', true);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const N = 30000, pts = new Float32Array(N * 3), p = new THREE.Vector3();
  for (let i = 0; i < N; i++) { sampler.sample(p); pts.set([p.x, p.y, p.z], i * 3); }
  // pts = posisi target avatar; simpan sekali jadi avatar-points.bin
});
```

### 7.4 Privasi dan lisensi

- Foto wajah dikirim ke pihak ketiga. Baca ketentuan penyimpanan data (apakah dipakai untuk training) dan pakai foto yang memang nyaman dibagikan.
- Cek lisensi tiap tool sebelum avatar dipajang. Jatah gratis dan syarat komersial berbeda-beda (misalnya tier gratis Tripo untuk penggunaan non-komersial).
- Tidak membuat fitur "pengunjung upload foto, jadi 3D live": biayanya per generate, rawan disalahgunakan, dan menimbulkan masalah privasi. Alternatif opsional tanpa backend: efek depth-parallax 2.5D dari foto, atau webcam dengan MediaPipe untuk menggerakkan avatar (butuh avatar dengan blendshape).

## 8. Arsitektur teknis

- **Stack:** Vite, JavaScript biasa, three.js, GSAP ScrollTrigger, dan Lenis (opsional). Hosting statis gratis (misalnya Cloudflare Pages), dengan proxy serverless di platform yang sama. Hosting project web dibahas di bagian 8.1.
- **Routing:** router kecil berbasis History API supaya canvas tetap hidup saat pindah halaman. Di hosting statis, set fallback ke `index.html` agar link langsung seperti `/ai-lab` tidak 404.
- **Demo AI dan key OpenAI:** key yang ditaruh di JavaScript browser bisa dicuri siapa pun lewat DevTools (tab Network) sehingga tagihan bisa jebol. Pilihan:
  1. Proxy serverless tipis (rekomendasi): sekitar 30 baris, key di environment variable, rate limit per IP, dan batas budget bulanan di dashboard OpenAI. Situs tetap statis.
  2. Bring your own key: pengunjung mengisi key sendiri. Aman, tetapi menambah friksi.
  3. Demo rekaman atau cached untuk project yang berat.
- **Alur request:** Browser (three.js dan JS biasa) memanggil Proxy serverless (key aman di sini), lalu Proxy memanggil OpenAI API. Hosting statis hanya menyajikan file.
- **Project RAG** (ChromaDB, Weaviate, LangChain) tidak bisa berjalan di browser. Tampilkan sebagai screencast, diagram arsitektur, dan satu demo ringan yang live, misalnya chatbot "tanya portofolio Jackson": embedding dihitung di awal dan disimpan sebagai JSON, pencarian jalan di browser, dan LLM dipanggil lewat proxy.
- **Project magang:** pastikan boleh dipamerkan (NDA atau IP perusahaan). Jika ragu, bangun ulang versi mini buatan sendiri.
- **Performa dan aksesibilitas:** fallback untuk HP dan WebGL lemah (partikel 10.000, pixel ratio diturunkan, atau gambar statis), hormati `prefers-reduced-motion`, lazy load aset, jaga ukuran file, dan tampilkan teks sebagai HTML.

### 8.1 Hosting project web dan beban situs

*Usulan, menunggu konfirmasi di bagian 11.*

Latar belakang: project web Jackson belum di-host di mana pun, dan rencananya tiap project punya halaman sendiri di `/projects/<slug>`. Yang perlu disajikan situs hanya hasil build, bukan seluruh kode sumber. Jackson berencana menulis ulang project yang butuh backend ke JavaScript sisi klien, sehingga hampir semuanya bisa berjalan sebagai file statis. Usulan: mulai dengan satu repo portofolio, dan pindahkan project yang besar atau sering berubah ke hosting terpisah (`external`).

**Pendekatan campuran menurut jenis project**

| Jenis project | Cara menyajikan | `demoMode` |
| --- | --- | --- |
| Front-end statis (HTML/JS, build React atau Vite, memanggil API publik) | Hasil build ikut portofolio di `/projects/<slug>/demo/`. Jika build-nya besar atau routing-nya rumit, hosting terpisah di Cloudflare Pages. | `embedded` atau `external` |
| Butuh server atau database (Laravel/PHP, Next.js dengan fitur server, FastAPI, ChromaDB, Weaviate) | Tidak bisa berjalan di hosting statis apa adanya. Rencana Jackson: ditulis ulang ke JavaScript sisi klien sehingga bisa `embedded`. Pemanggilan API berbayar (misalnya OpenAI) tetap lewat proxy serverless. Jika tidak jadi ditulis ulang: screencast, screenshot, diagram arsitektur, dan link repo. | `embedded` (setelah ditulis ulang) atau `recorded` |
| Model ML (misalnya klasifikasi daun pisang dengan CNN) | Jika modelnya kecil, coba konversi agar jalan di browser (TensorFlow.js atau ONNX Runtime Web). Satu file model maksimal 25 MiB di Cloudflare Pages. Jika tidak muat, pakai video demo. | `embedded` atau `recorded` |
| Aplikasi Android (EcoFoods), desain Figma (WastyeCycle) | Video demo dan screenshot. Untuk Figma, embed prototype atau pakai gambar. | `recorded` atau `none` |
| Skripsi NLP (BLOOM-560M) dan project magang | Ringkasan metode, hasil, dan link paper. Model sebesar BLOOM-560M berukuran ratusan MB sampai beberapa GB tergantung presisi, jauh di atas batas 25 MiB per file. Project magang hanya jika izin NDA jelas (bagian 8, Project magang). | `recorded` atau `none` |

**Batas hosting gratis (per 9 November 2026)**

| Layanan | Batas gratis yang relevan | Catatan |
| --- | --- | --- |
| Cloudflare Pages | Request aset statis tidak dibatasi. 500 build per bulan (1 build sekaligus, timeout 20 menit), 20.000 file per situs, 25 MiB per file, 100 proyek per akun. Pages Functions memakai kuota Workers gratis: 100.000 request per hari. | Paling longgar untuk situs ini dan demo statis. |
| GitHub Pages | Situs terpublikasi maksimal 1 GB. Soft limit bandwidth 100 GB per bulan dan soft limit 10 build per jam (tidak berlaku untuk workflow GitHub Actions kustom). | Tanpa kode server. Tidak boleh dipakai sebagai hosting gratis untuk bisnis online, e-commerce, atau SaaS. |
| Netlify | 300 credit per bulan pada paket berbasis credit (sejak September 2025). Bandwidth, build, dan fungsi memakai credit yang sama. | Satu kuota gabungan, perlu dipantau. Cek rincian di halaman harga. |
| Vercel Hobby | 100 GB Fast Data Transfer, 1 juta edge request, dan 1 juta invocation fungsi per bulan. | Hanya untuk penggunaan pribadi non-komersial. Cocok untuk Next.js. |
| Render (web service gratis) | Service tidur setelah 15 menit tanpa trafik dan butuh sekitar satu menit untuk bangun. | Untuk backend kecil. Kunjungan pertama terasa lambat. |
| Hugging Face Spaces | Static Space gratis. Menurut dokumentasi resmi, Space yang berjalan di server (Gradio atau Docker) memerlukan plan berbayar. | Hanya cocok jika demo bisa dibuat statis (jalan di browser). |

Untuk situs ini Cloudflare Pages paling cocok: trafik demo statis tidak dibatasi, jadi yang perlu dijaga hanya jumlah file, ukuran file, dan jumlah build.

**Apakah situs jadi berat?**

- **Bagi pengunjung: tidak**, selama demo hanya diunduh saat dibuka. File di `/projects/<slug>/demo/` tidak ikut dimuat halaman utama. Pastikan bundle utama tidak meng-import apa pun dari folder demo.
- **Beban terbesar ada di canvas three.js, bukan di project.** Buka demo sebagai halaman terpisah (navigasi biasa, bukan routing SPA) supaya canvas tidak ikut berjalan. Jika demo ditampilkan lewat iframe di dalam situs, hentikan loop render (`renderer.setAnimationLoop(null)`) selama iframe terbuka.
- **Beban deploy:** batas yang relevan di Cloudflare Pages adalah 20.000 file dan 25 MiB per file, bukan trafik. Hitung file sebelum deploy dengan `find dist -type f | wc -l`. Yang cepat membengkak adalah `node_modules` yang ikut tersalin atau ratusan gambar yang belum dikompres.
- **Jumlah build:** tiap `git push` memicu satu build, dan batasnya 500 per bulan (kira-kira 16 per hari jika dirata-rata). Cukup untuk ritme kerja normal, tetapi hindari push berulang untuk perubahan kecil.
- **Satu repo untuk semua demo** berarti satu perubahan kecil ikut membuild ulang semuanya. Jika build mulai lambat, pindahkan project besar ke hosting terpisah (`external`).
- Video tetap lewat YouTube atau Vimeo, bukan di repo (bagian 6).

**Catatan teknis untuk demo di sub-folder**

- Build tiap demo dengan base path `/projects/<slug>/demo/` (di Vite: opsi `base`).
- Fallback SPA di Cloudflare Pages mengarahkan semua path tanpa file ke root (`/`), jadi deep link di dalam demo (misalnya `/projects/<slug>/demo/about`) akan jatuh ke halaman portofolio. Cara paling aman: hash routing di demo (`#/about`). Alternatifnya aturan `_redirects` dengan status 200, tetapi Cloudflare selalu menjalankan `_redirects` sebelum mencocokkan file, jadi aturan seperti `/projects/<slug>/demo/*` juga menelan permintaan file aset. Jika dipakai, uji dulu setelah deploy.
- Link ke demo memakai tautan biasa dengan navigasi penuh, bukan lewat router portofolio.
- Hapus `node_modules`, `.git`, dan `.env` dari folder demo. Periksa juga bundle JavaScript dari API key yang tidak boleh publik, karena isi build bisa dibaca siapa saja.

## 9. Struktur halaman

| Route | Isi |
| --- | --- |
| `/` | Cerita scroll utama: splash, Home, lalu teaser tiap bab |
| `/ai-lab` | Demo project AI dan penjelasan arsitekturnya |
| `/projects` | Semua project dengan filter tag |
| `/projects/<slug>` | Halaman detail satu project (ringkasan, peran, stack, demo, link kode) |
| `/projects/<slug>/demo/` | Demo statis hasil build, disajikan sebagai file statis di luar router portofolio |
| `/design` | Carousel berputar dan grid semua karya desain, dengan viewer semua versi per karya |
| `/video` | Reel dan video |
| `/about` | Pendidikan, pengalaman lengkap, Toolkit (`#toolkit`), timeline, unduh CV |
| `/contact` | Email, LinkedIn, penutup dengan avatar |

Nama route dapat disesuaikan.

## 10. Rencana pengerjaan bertahap

1. **Persiapan konten dan aset:** tentukan jalur avatar (bagian 4.9) dan siapkan asetnya (generate avatar untuk jalur 3D, atau foto potret untuk jalur foto ke partikel), kumpulkan daftar project beserta tag, kumpulkan hasil desain dan video, putuskan hal-hal di bagian 11.
2. **Kerangka:** setup Vite dan three.js, canvas persisten, splash dengan `LoadingManager`, router, avatar solid di Home dengan kepala yang mengikuti kursor.
3. **Partikel dan morph:** sampling avatar, shader morph, objek primitif per bab, integrasi ScrollTrigger (pin dan scrub), Lenis, posisi avatar kiri-kanan, kamera, gerakan scroll per bab (4.11), serta glyph karakter jika dipilih (4.12).
4. **Bab dan halaman dalam:** isi tiap bab, `/projects` dan `/projects/<slug>` dengan `projects.json`, demo statis di `/projects/<slug>/demo/`, `/design` (carousel dan viewer versi), `/video`, `/about` (termasuk Toolkit dan `toolkit.json`), `/contact`.
5. **Demo AI:** proxy serverless, rate limit, budget cap, demo "tanya portofolio", dan screencast untuk project RAG.
6. **Poles:** performa di HP, Quick mode, reduced motion, SEO dan meta share, lalu deploy.

## 11. Keputusan terbuka dan hal yang perlu dirapikan

1. **Gaya avatar:** terbuka (10 November 2026). Pilihan: 3D stylized, 3D realistis, atau tanpa model 3D (potret partikel dari foto, heliks, dan seterusnya, lihat bagian 4.9). Jalur 3D terkendala aset, tetapi kendala persisnya belum dijelaskan (hasil kurang mirip, tidak ada model ter-rig, atau jatah tool habis), padahal itu menentukan jalur yang cocok.
2. **Video editor:** untuk siapa dan jenis video apa (konten sosmed, event, corporate)? Ini menentukan isi bab Video (belum dijawab).
3. **Project unggulan** yang dipilih untuk tiap bab.
4. **Bahasa situs:** sudah diputuskan, Inggris (bukan dwibahasa).
5. **Data LinkedIn yang perlu dirapikan:** level bahasa Mandarin berbeda antara LinkedIn (limited working) dan catatan lain (fluent), pilih satu. Entri HKIMO Final Round 2018 tertulis "Thailand International" dan "Bangkok" padahal lokasinya Hong Kong, kemungkinan salah copy-paste.
6. **Izin menampilkan project magang** (NDA atau IP perusahaan).
7. **Domain dan hosting final.**
8. **Lisensi tool 3D** untuk penggunaan di portofolio.
9. **Pendekatan hosting project:** usulan mulai dari satu repo portofolio dengan opsi `external` untuk project besar (bagian 8.1), belum dikonfirmasi. Perlu dicek tiap project masuk kategori mana (statis, ML, mobile).
10. **Carousel desain:** daftar karya yang masuk (t-banner, poster, booth, dan lainnya) beserta versi tiap karya, dan konfirmasi perilaku tekan versus tahan (usulan: keduanya membuka viewer yang sama).
11. **Palet warna final:** usulan dusk mid-tone di bagian 4.8, menunggu keputusan Jackson setelah melihat scratch v2.
12. **Toolkit:** konfirmasi daftar tool per kelompok (bagian 4.10), apakah tiap tool menaut ke situs resminya atau memfilter `/projects`, dan apakah field `stack` ditambahkan ke `projects.json`.
13. **Cara kerja efek di Aller Studio:** laporan inspeksi otomatis belum terverifikasi (bagian 4.9). Cek lewat DevTools jika ingin memastikan sosoknya model 3D atau gambar.
14. **Pemetaan gerakan per bab** (bagian 4.11): konfirmasi atau ubah tabelnya, termasuk apakah avatar boleh keluar frame di bab zoom masuk dan horizontal pin.
15. **Efek partikel ksenpanchenko.com:** cara kerjanya belum terverifikasi (bagian 4.12). Cek lewat DevTools atau kirim rekaman layar, lalu putuskan memakai glyph karakter atau tetap titik bulat.
16. **Toggle Motion di footer** (bagian 4.11) dan toggle suara (bagian 4.9, nilai awal mati): konfirmasi apakah keduanya dipakai.

## 12. Langkah berikutnya

1. Pilih jalur avatar (bagian 4.9). Jalur 3D: ambil foto lalu coba Avaturn atau MetaPerson. Jalur foto ke partikel: siapkan foto potret dengan background dihapus.
2. Susun daftar semua project dengan tag, tahun, thumbnail, dan cara demo (`demoMode`) sebagai isi awal `projects.json`.
3. Jawab pertanyaan terbuka di bagian 11, terutama gaya avatar dan detail pekerjaan video.
4. Kumpulkan karya desain beserta semua versinya, lalu beri label tiap versi (misalnya Final dan Draft).
5. Kembangkan starter dari `portfolio-scratch-v2.html`: ganti loop custom dengan GSAP ScrollTrigger dan Lenis, tambah router, dan ganti bentuk placeholder (kepala dan bahu dari bola) dengan avatar asli atau titik dari potret.
6. Susun `toolkit.json` (bagian 4.10) dan, jika filter per tool dipakai, tambahkan field `stack` di `projects.json`.
7. Cek efek partikel di ksenpanchenko.com lewat DevTools (bagian 4.12), atau kirim rekaman layar beserta referensi lain yang disukai.
8. Buat scratch berikutnya dengan gerakan berbeda per bab sesuai tabel 4.11. Scratch 10 November 2026 (`portfolio-scratch.html`, berlabel v3) baru memakai satu gerakan utama dan titik bulat.

*Catatan: informasi tool 3D (nama model, jatah gratis, lisensi) per 9 November 2026 dan dapat berubah. Cek ulang sebelum dipakai.*

*Catatan: batas hosting gratis (Cloudflare Pages, GitHub Pages, Netlify, Vercel, Render, Hugging Face) per 9 November 2026 dan dapat berubah. Cek ulang di halaman resmi masing-masing sebelum memutuskan.*

*Catatan: pengamatan situs referensi (Aller Studio dan JarnKet) per 10 November 2026. Hasil inspeksi otomatis Aller belum terverifikasi, dan isi situs dapat berubah.*

*Catatan: pengamatan referensi animasi dan partikel (apple.com lewat tutorial pihak ketiga, mbidirectmail.com, theinfinitysocks.com, fragment.im, ksenpanchenko.com) per 10 November 2026, dibaca lewat teks halaman dan bukan dari gerakan yang terlihat. Bagian yang berupa dugaan ditandai di 4.11 dan 4.12, dan isi situs dapat berubah.*
