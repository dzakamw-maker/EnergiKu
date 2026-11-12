document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navLinks.classList.toggle('active');
        });
    }

    const header = document.querySelector('.floating-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Calculator Logic
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const watt = parseFloat(document.getElementById('calc-device-watt').value);
            const deviceName = document.getElementById('calc-device-name').value || 'alat tersebut';
            const hours = parseFloat(document.getElementById('calc-hours').value);
            const rooms = parseFloat(document.getElementById('calc-rooms').value);

            // Validations
            if (isNaN(watt) || watt <= 0) return alert("Masukkan daya (Watt) yang valid!");
            if (isNaN(hours) || hours <= 0) return alert("Masukkan jumlah jam yang valid!");
            if (isNaN(rooms) || rooms <= 0) return alert("Masukkan jumlah kelas yang valid!");

            // Constants
            const activeDays = 30; // 30 days in a month
            const tariffPerKwh = 1500; // Rp 1.500 / kWh
            const carbonPerKwh = 0.8; // 0.8 kg CO2 / kWh

            // Calculations
            const kwhPerDay = (watt * hours * rooms) / 1000;
            const kwhPerMonth = kwhPerDay * activeDays;
            
            const totalCost = kwhPerMonth * tariffPerKwh;
            const totalCarbon = kwhPerMonth * carbonPerKwh;

            // Format numbers
            const formatCurrency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalCost);
            
            // Update UI
            document.getElementById('res-kwh').innerText = kwhPerMonth.toFixed(1) + " kWh";
            document.getElementById('res-cost').innerText = formatCurrency;
            document.getElementById('res-carbon').innerText = totalCarbon.toFixed(1) + " kg CO2";
            
            // Update note text dynamically
            document.getElementById('calc-note-text').innerText = `Hanya dengan mematikan ${deviceName} saat tidak digunakan, kamu menyelamatkan Bumi (dan uang sekolah)! 🌱`;

            // Show result
            document.getElementById('calc-result').style.display = 'block';
        });
    }

        const surveyStatus = document.getElementById('survey-status');
    const surveyMeta = document.getElementById('survey-meta');

    if (surveyStatus && surveyMeta) {
        fetch('data/data-perilaku-energi.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Gagal memuat data: HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!window.Chart) {
                    throw new Error('Chart.js belum berhasil dimuat.');
                }

                if (!Array.isArray(data.per_butir) || !data.ringkasan?.kategori_persen) {
                    throw new Error('Struktur data JSON tidak sesuai.');
                }

                const kategori = data.ringkasan.kategori_persen;

                new Chart(document.getElementById('category-chart'), {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(kategori),
                        datasets: [{
                            data: Object.values(kategori),
                            backgroundColor: ['#e59325', '#6a9c78', '#7b8da6', '#bd6b6b']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                                callbacks: {
                                    label: context => `${context.label}: ${context.raw}%`
                                }
                            }
                        }
                    }
                });

                new Chart(document.getElementById('item-chart'), {
                    type: 'bar',
                    data: {
                        labels: data.per_butir.map(item => `${item.kode} — ${item.label}`),
                        datasets: [{
                            label: 'Rata-rata skor (maks. 4)',
                            data: data.per_butir.map(item => item.rata_rata),
                            backgroundColor: '#e59325'
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                min: 0,
                                max: 4,
                                title: { display: true, text: 'Skor rata-rata' }
                            }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });

                surveyMeta.textContent =
                    `Berdasarkan ${data.meta.jumlah_responden} responden, ` +
                    `pengisian ${data.meta.tanggal_pengisian.awal} sampai ` +
                    `${data.meta.tanggal_pengisian.akhir}. Sumber: ${data.meta.sumber}.`;

                surveyStatus.textContent = '';
            })
            .catch(error => {
                console.error('Grafik angket tidak dapat ditampilkan:', error);
                surveyStatus.textContent =
                    'Data grafik gagal dimuat. Pastikan website dijalankan melalui server lokal dan file JSON tersedia.';
            });
    }
});
