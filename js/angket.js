document.addEventListener('DOMContentLoaded', async () => {
    const errorMessage = document.getElementById('survey-error');

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const number = (value, digits = 2) => new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits
    }).format(value);

    const percent = value => `${number(value, 1)}%`;
    const categories = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'];

    const tableRowsForItems = items => items.map(item => `
        <tr>
            <td>${escapeHtml(item.kode)}</td>
            <td>${number(item.rata_rata)}</td>
        </tr>
    `).join('');

    const renderGroup = (group, title, nameKey) => {
        const name = group[nameKey] || group.kode || 'Kelompok';
        const groupCode = group.kode && group.kode !== name ? ` <span>(${escapeHtml(group.kode)})</span>` : '';
        const categoryBreakdown = categories.map(category => `
            <div class="group-category">
                <strong>${escapeHtml(category)}</strong>
                <span>${number(group.kategori?.[category] || 0)} responden · ${percent(group.kategori_persen?.[category] || 0)}</span>
            </div>
        `).join('');

        return `
            <details class="group-record">
                <summary>
                    <span class="group-record-name">${escapeHtml(name)}${groupCode}</span>
                    <span class="group-record-stat">Responden<strong>${number(group.jumlah_responden, 0)}</strong></span>
                    <span class="group-record-stat">Rerata skor<strong>${number(group.rata_rata_skor)}</strong></span>
                    <span class="group-record-stat">Rerata total<strong>${number(group.rata_rata_total)}</strong></span>
                    <span class="summary-chevron" aria-hidden="true">⌄</span>
                </summary>
                <div class="group-detail-content">
                    <div class="group-category-grid">${categoryBreakdown}</div>
                    <div class="table-scroll">
                        <table class="survey-table group-item-table">
                            <thead><tr><th scope="col">Kode butir</th><th scope="col">Rata-rata skor</th></tr></thead>
                            <tbody>${group.rata_rata_per_butir.map((score, index) => `
                                <tr><td>P${String(index + 1).padStart(2, '0')}</td><td>${number(score)}</td></tr>
                            `).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </details>
        `;
    };

    const renderGroupSection = (groups, title, nameKey) => `
        <article class="group-section">
            <div class="group-section-heading">
                <h3>${escapeHtml(title)}</h3>
                <span>${groups.length} kelompok</span>
            </div>
            <div class="group-record-list">
                ${groups.map(group => renderGroup(group, title, nameKey)).join('')}
            </div>
        </article>
    `;

    try {
        const response = await fetch('data/data-perilaku-energi.json');
        if (!response.ok) {
            throw new Error(`Data tidak dapat dimuat (HTTP ${response.status}).`);
        }

        const data = await response.json();
        const { meta, ringkasan } = data;
        const respondentCount = meta.jumlah_responden;

        document.getElementById('survey-title').textContent = meta.judul;
        document.getElementById('survey-description').textContent =
            `${meta.sumber}. Data yang ditampilkan merupakan hasil agregasi dan tidak memuat identitas pribadi responden.`;
        document.getElementById('survey-hero-meta').innerHTML = `
            <span class="survey-meta-chip">${number(respondentCount, 0)} responden</span>
            <span class="survey-meta-chip">${number(meta.jumlah_butir, 0)} butir pernyataan</span>
            <span class="survey-meta-chip">Partisipasi ${percent(meta.persen_partisipasi)}</span>
            <span class="survey-meta-chip">${escapeHtml(meta.tanggal_pengisian.awal)} – ${escapeHtml(meta.tanggal_pengisian.akhir)}</span>
        `;

        document.getElementById('summary-note').textContent =
            `Rata-rata kebiasaan sering dilakukan: ${percent(ringkasan.persen_sering_rata_rata)}.`;

        document.getElementById('summary-metrics').innerHTML = [
            ['Jumlah responden', number(respondentCount, 0), `${number(meta.jumlah_siswa_terdata, 0)} siswa terdata`],
            ['Rata-rata skor', number(ringkasan.rata_rata_skor), 'Maksimum 4,00 per butir'],
            ['Rata-rata skor total', number(ringkasan.rata_rata_total), `Maksimum ${number(meta.jumlah_butir * 4, 0)} poin`],
            ['Perilaku sering dilakukan', percent(ringkasan.persen_sering_rata_rata), 'Rata-rata seluruh butir']
        ].map(([label, value, note]) => `
            <article class="summary-metric">
                <span class="summary-metric-label">${escapeHtml(label)}</span>
                <strong class="summary-metric-value">${escapeHtml(value)}</strong>
                <span class="summary-metric-note">${escapeHtml(note)}</span>
            </article>
        `).join('');

        document.getElementById('category-breakdown').innerHTML = categories.map(category => {
            const count = ringkasan.kategori[category] || 0;
            const value = ringkasan.kategori_persen[category] || 0;
            return `
                <div class="category-row">
                    <div class="category-row-heading"><strong>${escapeHtml(category)}</strong><span>${percent(value)}</span></div>
                    <div class="category-track" role="img" aria-label="${escapeHtml(category)} ${percent(value)}">
                        <div class="category-fill" style="width: ${Math.max(0, Math.min(100, value))}%"></div>
                    </div>
                    <div class="category-row-values"><span>${number(count, 0)} responden</span><span>${percent(value)}</span></div>
                </div>
            `;
        }).join('');

        document.getElementById('survey-highlights').innerHTML = [
            ['Skor tertinggi', ringkasan.sorotan.butir_tertinggi],
            ['Skor terendah', ringkasan.sorotan.butir_terendah]
        ].map(([title, items]) => `
            <div class="highlight-group">
                <h4>${escapeHtml(title)}</h4>
                ${items.map(item => `
                    <div class="highlight-item">
                        <span><b>${escapeHtml(item.kode)}</b> · ${escapeHtml(item.label)}</span>
                        <strong>${number(item.rata_rata)}</strong>
                    </div>
                `).join('')}
            </div>
        `).join('') + `
            <p class="summary-metric-note">Jurusan dengan rerata tertinggi: ${escapeHtml(ringkasan.sorotan.jurusan_tertinggi)}. Terendah: ${escapeHtml(ringkasan.sorotan.jurusan_terendah)}.</p>
        `;

        document.getElementById('item-breakdown').innerHTML = data.per_butir.map(item => `
            <details class="item-card">
                <summary>
                    <div class="item-summary">
                        <span class="item-code">${escapeHtml(item.kode)}</span>
                        <span class="item-summary-label">${escapeHtml(item.label)}</span>
                        <span class="item-average">${number(item.rata_rata)} / 4</span>
                        <span class="summary-chevron" aria-hidden="true">⌄</span>
                    </div>
                </summary>
                <div class="item-detail-content">
                    <p class="survey-question">${escapeHtml(item.pertanyaan)}</p>
                    <div class="score-response-grid">
                        ${[1, 2, 3, 4].map(score => `
                            <div class="score-response">
                                <span>Skor ${score}</span>
                                <strong>${number(item.jumlah_per_skor[score], 0)} responden</strong>
                                <span>${percent(item.persen_per_skor[score])}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="item-extra-stats">
                        <span>Sering dilakukan: <strong>${percent(item.persen_sering)}</strong></span>
                        <span>Jarang dilakukan: <strong>${percent(item.persen_jarang)}</strong></span>
                    </div>
                </div>
            </details>
        `).join('');

        const maxScoreCount = Math.max(...data.sebaran_skor_total.map(item => item.jumlah));
        document.getElementById('score-distribution').innerHTML = data.sebaran_skor_total.map(item => {
            const share = item.jumlah / respondentCount * 100;
            const barWidth = item.jumlah / maxScoreCount * 100;
            return `
                <tr>
                    <td>${number(item.skor_total, 0)}</td>
                    <td>${number(item.jumlah, 0)}</td>
                    <td>${percent(share)}</td>
                    <td><div class="score-bar-track" role="img" aria-label="${number(item.jumlah, 0)} responden"><div class="score-bar-fill" style="width: ${barWidth}%"></div></div></td>
                </tr>
            `;
        }).join('');

        document.getElementById('group-breakdowns').innerHTML = [
            renderGroupSection(data.per_jurusan, 'Jurusan', 'nama'),
            renderGroupSection(data.per_rombel, 'Rombel', 'rombel'),
            renderGroupSection(data.per_rayon, 'Rayon', 'rayon'),
            renderGroupSection(data.per_gaya_belajar, 'Gaya belajar', 'gaya_belajar')
        ].join('');

        const cleaning = meta.pembersihan;
        const ranges = Object.entries(meta.kategori_skor.rentang).map(([category, range]) =>
            `<li><strong>${escapeHtml(category)}:</strong> ${escapeHtml(range)}</li>`
        ).join('');

        document.getElementById('survey-method').innerHTML = `
            <article class="method-card">
                <h3>Skala dan kategori</h3>
                <p>${escapeHtml(meta.skala)}</p>
                <ul>${ranges}</ul>
                <p>${escapeHtml(meta.kategori_skor.aturan)}</p>
            </article>
            <article class="method-card">
                <h3>Pembersihan data</h3>
                <ul>
                    <li>Baris mentah: ${number(cleaning.baris_mentah, 0)}</li>
                    <li>Baris tidak valid dibuang: ${number(cleaning.baris_tidak_valid_dibuang, 0)}</li>
                    <li>Isian ganda dibuang: ${number(cleaning.isian_ganda_dibuang, 0)}</li>
                    <li>Kolom skor Google Form diabaikan: ${cleaning.kolom_score_google_form_diabaikan ? 'Ya' : 'Tidak'}</li>
                </ul>
                <p>${escapeHtml(cleaning.aturan_isian_ganda)}</p>
            </article>
            <article class="method-card">
                <h3>Sumber dan periode</h3>
                <p>${escapeHtml(meta.sumber)}</p>
                <p>${escapeHtml(meta.tanggal_pengisian.awal)} sampai ${escapeHtml(meta.tanggal_pengisian.akhir)}</p>
            </article>
            <article class="method-card">
                <h3>Privasi</h3>
                <p>${escapeHtml(meta.catatan_privasi)}</p>
            </article>
        `;
    } catch (error) {
        console.error('Data angket tidak dapat ditampilkan:', error);
        errorMessage.textContent = 'Data angket gagal dimuat. Jalankan situs melalui server lokal dan pastikan file JSON tersedia.';
        errorMessage.hidden = false;
    }
});