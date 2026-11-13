# EnergiKu

Website edukasi dan kampanye tentang perilaku hemat energi untuk siswa, dengan fokus pada penghematan listrik, kesadaran lingkungan, dan dampak pemborosan energi di lingkungan sekolah.

## Deskripsi

EnergiKu adalah proyek landing page statis yang dirancang untuk menyampaikan pesan penting bahwa penggunaan energi harus dibiasakan sejak dini. Situs ini menampilkan:

- edukasi tentang pemborosan listrik dan dampaknya terhadap lingkungan
- ringkasan hasil angket perilaku hemat energi
- grafik data responden menggunakan Chart.js
- kalkulator estimasi pemborosan energi, biaya listrik, dan emisi karbon
- halaman tentang program dan tim pengembang

## Fitur utama

### 1. Beranda edukasi

Halaman utama menampilkan pesan kampanye, fakta-fakta penting, visual statistik, dan ajakan untuk bertindak secara nyata.

### 2. Data angket perilaku hemat energi

Proyek ini menggunakan data agregat dari kuesioner siswa dalam format JSON untuk menampilkan:

- kategori perilaku responden
- rata-rata skor per pernyataan
- distribusi skor total
- rincian butir pertanyaan dan kelompok data

### 3. Kalkulator pemborosan energi

Pengguna dapat menghitung:

- konsumsi listrik per bulan
- biaya yang terbuang
- emisi karbon yang dihasilkan

berdasarkan daya perangkat, lama pemakaian, dan jumlah ruang kelas.

### 4. Halaman informasi dan tim

Terdapat halaman yang menjelaskan tujuan kampanye serta profil tim pengembang proyek.

## Teknologi yang digunakan

- HTML5
- CSS3
- JavaScript
- Chart.js
- JSON untuk data angket

## Struktur proyek

```text
EnergiKu/
├── index.html
├── angket.html
├── kalkulator.html
├── tentang.html
├── developer.html
├── assets/
├── css/
├── data/
│   └── data-perilaku-energi.json
├── js/
│   ├── script.js
│   └── angket.js
└── README.md
```

## Cara menjalankan

Karena proyek ini berupa website statis, Anda bisa menjalankannya dengan salah satu cara berikut:

### Opsi 1: buka langsung di browser

Buka file `index.html` secara langsung di browser Anda.

### Opsi 2: jalankan server lokal

Pada folder proyek, jalankan:

```bash
python -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

## Data angket

File data yang digunakan untuk grafik dan detail angket berada di:

- `data/data-perilaku-energi.json`

Data ini berisi ringkasan hasil perilaku hemat energi responden, termasuk kategori, rata-rata skor, dan distribusi total skor.

## Catatan

Proyek ini dibuat untuk kebutuhan pembelajaran dan kampanye lingkungan di sekolah, terutama untuk menunjukkan bahwa penghematan energi tidak hanya soal teknologi, tetapi juga tentang kesadaran dan kebiasaan.

## Lisensi

Proyek ini dibuat untuk kebutuhan pembelajaran dan pengembangan website edukasi internal. Silakan sesuaikan lisensi jika akan dipublikasikan secara umum.
