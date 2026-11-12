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
                const kategoriCounts = data.ringkasan.kategori || {};
                const categoryColors = ['#e59325', '#6a9c78', '#7b8da6', '#bd6b6b'];
                const categoryEntries = Object.entries(kategori);

                const formatDecimal = (value, digits = 2) => new Intl.NumberFormat('id-ID', {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits
                }).format(value);

                const formatDateId = isoDate => {
                    const parsed = new Date(`${isoDate}T00:00:00`);
                    if (Number.isNaN(parsed.getTime())) return isoDate;
                    return new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }).format(parsed);
                };

                const hexToRgba = (hex, alpha) => {
                    const clean = hex.replace('#', '');
                    const r = parseInt(clean.slice(0, 2), 16);
                    const g = parseInt(clean.slice(2, 4), 16);
                    const b = parseInt(clean.slice(4, 6), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                const doughnutCenter = document.getElementById('doughnut-center');
                const updateDoughnutCenter = activeIndex => {
                    if (!doughnutCenter) return;
                    const countEl = document.createElement('strong');
                    const labelEl = document.createElement('span');

                    if (activeIndex === null) {
                        countEl.textContent = new Intl.NumberFormat('id-ID').format(data.meta.jumlah_responden);
                        labelEl.textContent = 'responden';
                    } else {
                        const [name] = categoryEntries[activeIndex];
                        const count = kategoriCounts[name] ?? 0;
                        countEl.textContent = new Intl.NumberFormat('id-ID').format(count);
                        labelEl.textContent = name;
                    }

                    doughnutCenter.replaceChildren(countEl, labelEl);
                };
                updateDoughnutCenter(null);

                const categoryLegend = document.getElementById('category-legend');
                const legendButtons = categoryEntries.map(([name, pct], index) => {
                    const color = categoryColors[index] || '#888';
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'survey-legend-item';
                    item.style.setProperty('--legend-accent', color);
                    item.setAttribute('aria-pressed', 'false');

                    const labelWrap = document.createElement('span');
                    labelWrap.className = 'survey-legend-label';

                    const dot = document.createElement('span');
                    dot.className = 'survey-legend-dot';
                    dot.style.backgroundColor = color;

                    const text = document.createElement('span');
                    text.textContent = name;

                    const value = document.createElement('span');
                    value.className = 'survey-legend-value';
                    value.textContent = `${formatDecimal(pct, 1)}%`;

                    labelWrap.append(dot, text);
                    item.append(labelWrap, value);
                    return item;
                });

                if (categoryLegend) {
                    categoryLegend.replaceChildren(...legendButtons);
                }

                const darkTooltip = callbacks => ({
                    backgroundColor: '#141414',
                    borderColor: '#3a3a3a',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#e0e0e0',
                    callbacks
                });

                let selectedCategoryIndex = null;
                let hoveredCategoryIndex = null;

                const categoryChart = new Chart(document.getElementById('category-chart'), {
                    type: 'doughnut',
                    data: {
                        labels: categoryEntries.map(([name]) => name),
                        datasets: [{
                            data: categoryEntries.map(([, pct]) => pct),
                            backgroundColor: [...categoryColors],
                            borderColor: '#222',
                            borderWidth: 2,
                            offset: categoryEntries.map(() => 0),
                            hoverOffset: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '68%',
                        layout: {
                            padding: 22
                        },
                        onClick: (_event, elements) => {
                            if (elements.length > 0) {
                                const clickedIndex = elements[0].index;
                                selectedCategoryIndex = selectedCategoryIndex === clickedIndex ? null : clickedIndex;
                            } else {
                                selectedCategoryIndex = null;
                            }
                            syncCategoryHighlight();
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: darkTooltip({
                                label: context => {
                                    const name = context.label;
                                    const count = kategoriCounts[name];
                                    const pctText = `${formatDecimal(context.raw, 1)}%`;
                                    return count !== undefined
                                        ? `${name}: ${pctText} (${count} responden)`
                                        : `${name}: ${pctText}`;
                                }
                            })
                        }
                    }
                });

                const syncCategoryHighlight = () => {
                    const activeIndex = hoveredCategoryIndex !== null ? hoveredCategoryIndex : selectedCategoryIndex;
                    const dataset = categoryChart.data.datasets[0];

                    dataset.offset = categoryEntries.map((_, i) => (i === activeIndex ? 14 : 0));
                    dataset.backgroundColor = categoryColors.map((hex, i) =>
                        activeIndex === null || i === activeIndex ? hex : hexToRgba(hex, 0.25)
                    );

                    legendButtons.forEach((btn, i) => {
                        const isSelected = i === selectedCategoryIndex;
                        const isHighlighted = i === activeIndex;
                        btn.classList.toggle('is-active', isHighlighted);
                        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
                    });

                    updateDoughnutCenter(activeIndex);
                    categoryChart.setActiveElements(activeIndex === null ? [] : [{ datasetIndex: 0, index: activeIndex }]);
                    categoryChart.update();
                };

                legendButtons.forEach((btn, index) => {
                    btn.addEventListener('click', event => {
                        event.stopPropagation();
                        selectedCategoryIndex = selectedCategoryIndex === index ? null : index;
                        syncCategoryHighlight();
                    });

                    [
                        ['mouseenter', index],
                        ['mouseleave', null],
                        ['focus', index],
                        ['blur', null]
                    ].forEach(([eventName, targetIndex]) => {
                        btn.addEventListener(eventName, () => {
                            hoveredCategoryIndex = targetIndex;
                            syncCategoryHighlight();
                        });
                    });
                });

                const doughnutCard = document.querySelector('.survey-chart-card--doughnut');
                if (doughnutCard) {
                    doughnutCard.addEventListener('click', event => {
                        if (selectedCategoryIndex === null) return;
                        if (event.target.closest('.survey-legend-item, #category-chart')) return;
                        selectedCategoryIndex = null;
                        syncCategoryHighlight();
                    });
                }

                const wrapChartLabel = (text, maxLength = 28) => {
                    const words = String(text).split(' ');
                    const lines = [];
                    let currentLine = '';

                    for (const word of words) {
                        const candidate = currentLine ? `${currentLine} ${word}` : word;
                        if (candidate.length > maxLength && currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = candidate;
                        }
                    }

                    if (currentLine) {
                        lines.push(currentLine);
                    }

                    return lines;
                };

                const barValueLabels = {
                    id: 'barValueLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        const dataset = chart.data.datasets[0];
                        const meta = chart.getDatasetMeta(0);

                        ctx.save();
                        ctx.font = '600 12px Inter, sans-serif';
                        ctx.fillStyle = '#ececec';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';

                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            ctx.fillText(formatDecimal(value, 2), bar.x + 8, bar.y);
                        });
                        ctx.restore();
                    }
                };

                new Chart(document.getElementById('item-chart'), {
                    type: 'bar',
                    data: {
                        labels: data.per_butir.map(item => wrapChartLabel(item.label)),
                        datasets: [{
                            label: 'Rata-rata skor (maks. 4)',
                            data: data.per_butir.map(item => item.rata_rata),
                            backgroundColor: '#e59325',
                            hoverBackgroundColor: '#f1a43c',
                            borderRadius: 6,
                            borderSkipped: 'left',
                            barPercentage: 0.68,
                            categoryPercentage: 0.84
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: { right: 32 }
                        },
                        scales: {
                            y: {
                                border: { display: false },
                                grid: { display: false },
                                ticks: {
                                    autoSkip: false,
                                    crossAlign: 'near',
                                    padding: 10,
                                    color: '#d8d8d8',
                                    font: {
                                        family: 'Inter, sans-serif',
                                        size: 12,
                                        weight: '500'
                                    }
                                }
                            },
                            x: {
                                min: 0,
                                max: 4,
                                border: { display: false },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.08)'
                                },
                                ticks: {
                                    stepSize: 1,
                                    color: '#9a9a9a',
                                    font: {
                                        family: 'Inter, sans-serif',
                                        size: 11
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Skor rata-rata (skala 1–4)',
                                    color: '#9a9a9a',
                                    padding: { top: 8 },
                                    font: {
                                        family: 'Inter, sans-serif',
                                        size: 12
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: darkTooltip({
                                title: items => {
                                    const item = data.per_butir[items[0]?.dataIndex];
                                    return item ? `${item.kode} — ${item.label}` : '';
                                },
                                label: context => `Rata-rata skor: ${formatDecimal(context.raw, 2)} / 4`
                            })
                        }
                    },
                    plugins: [barValueLabels]
                });

                surveyMeta.textContent =
                    `Berdasarkan ${new Intl.NumberFormat('id-ID').format(data.meta.jumlah_responden)} responden siswa kelas XI · ` +
                    `Periode ${formatDateId(data.meta.tanggal_pengisian.awal)} – ` +
                    `${formatDateId(data.meta.tanggal_pengisian.akhir)} · ` +
                    `Sumber: Kuesioner Perilaku Hemat Energi.`;

                surveyStatus.textContent = '';
            })
            .catch(error => {
                console.error('Grafik angket tidak dapat ditampilkan:', error);
                surveyStatus.textContent =
                    'Data grafik gagal dimuat. Pastikan website dijalankan melalui server lokal dan file JSON tersedia.';
            });
    }
});
