/**
 * EnergiKu - Fase 3: Aksi & Rekomendasi JavaScript (js/aksi.js)
 * Mengelola interaktivitas Tantangan 7 Hari & Ikrar Komitmen Siswa via LocalStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    initChallengeTracker();
    initPledgeGenerator();
});

/* ==========================================================================
   1. TANTANGAN 7 HARI HEMAT ENERGI (LOCALSTORAGE TRACKER)
   ========================================================================== */
function initChallengeTracker() {
    const STORAGE_KEY = 'energiku_challenge_status_v1';
    const checkboxes = document.querySelectorAll('.challenge-checkbox');
    const progressFill = document.getElementById('challenge-progress-fill');
    const progressText = document.getElementById('challenge-progress-text');
    const progressPercent = document.getElementById('challenge-progress-percent');
    const congratsBox = document.getElementById('challenge-congrats');
    const resetBtn = document.getElementById('btn-reset-challenge');

    if (!checkboxes.length) return;

    // Baca data tersimpan dari LocalStorage
    let savedState = {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            savedState = JSON.parse(raw);
        }
    } catch (e) {
        console.warn('Gagal membaca LocalStorage untuk tantangan:', e);
    }

    // Terapkan state awal ke checkbox & class item
    checkboxes.forEach((cb) => {
        const day = cb.getAttribute('data-day');
        const isChecked = Boolean(savedState[day]);
        cb.checked = isChecked;

        const parentItem = cb.closest('.challenge-item');
        if (parentItem) {
            parentItem.classList.toggle('completed', isChecked);
        }

        // Listener klik pada checkbox
        cb.addEventListener('change', () => {
            savedState[day] = cb.checked;
            if (parentItem) {
                parentItem.classList.toggle('completed', cb.checked);
            }
            saveStateAndUpdateUI();
        });

        // Klik pada seluruh baris item memicu checkbox (kecuali jika klik tepat pada input)
        if (parentItem) {
            parentItem.addEventListener('click', (e) => {
                if (e.target !== cb && e.target.tagName !== 'LABEL') {
                    cb.checked = !cb.checked;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }
    });

    // Simpan ke LocalStorage dan refresh progress bar
    function saveStateAndUpdateUI() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
        } catch (e) {
            console.warn('Gagal menyimpan LocalStorage:', e);
        }

        const total = checkboxes.length;
        const checkedCount = Object.values(savedState).filter(Boolean).length;
        const percentage = Math.round((checkedCount / total) * 100);

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.innerText = `${checkedCount} dari ${total} Misi Selesai`;
        }
        if (progressPercent) {
            progressPercent.innerText = `${percentage}%`;
        }

        if (congratsBox) {
            if (checkedCount === total && total > 0) {
                congratsBox.classList.add('show');
            } else {
                congratsBox.classList.remove('show');
            }
        }
    }

    // Reset Tantangan
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Apakah kamu yakin ingin mereset progres Tantangan 7 Hari?')) {
                savedState = {};
                localStorage.removeItem(STORAGE_KEY);
                checkboxes.forEach((cb) => {
                    cb.checked = false;
                    const parent = cb.closest('.challenge-item');
                    if (parent) parent.classList.remove('completed');
                });
                saveStateAndUpdateUI();
            }
        });
    }

    // Kalkulasi awal saat halaman dimuat
    saveStateAndUpdateUI();
}

/* ==========================================================================
   2. IKRAR KOMITMEN SISWA (PLEDGE GENERATOR & BADGE)
   ========================================================================== */
function initPledgeGenerator() {
    const STORAGE_KEY = 'energiku_user_pledge_v1';
    const form = document.getElementById('pledge-form');
    const cardView = document.getElementById('pledge-card-view');

    if (!form || !cardView) return;

    // Load komitmen yang sudah ada
    let savedPledge = null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            savedPledge = JSON.parse(raw);
        }
    } catch (e) {
        console.warn('Gagal membaca LocalStorage ikrar:', e);
    }

    if (savedPledge) {
        renderPledgeCard(savedPledge);
    } else {
        renderEmptyPledgeState();
    }

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('pledge-name');
        const classInput = document.getElementById('pledge-class');
        const checkedPromises = Array.from(document.querySelectorAll('.pledge-promise-cb:checked'))
            .map(cb => cb.value);

        const name = (nameInput?.value || '').trim();
        const className = (classInput?.value || '').trim();

        if (!name) {
            alert('Silakan masukkan nama lengkapmu!');
            nameInput?.focus();
            return;
        }

        if (!className) {
            alert('Silakan pilih kelas / jurusanmu!');
            classInput?.focus();
            return;
        }

        if (checkedPromises.length === 0) {
            alert('Pilih minimal 1 butir komitmen aksi yang ingin kamu jalankan!');
            return;
        }

        // Generate serial ID unik & tanggal
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const serial = `EK-XI-${randomCode}`;
        const today = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const newPledge = {
            name,
            className,
            promises: checkedPromises,
            serial,
            date: today
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPledge));
        } catch (err) {
            console.warn('Gagal menyimpan komitmen:', err);
        }

        renderPledgeCard(newPledge);

        // Feedback scroll halus ke kartu ikrar
        cardView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Render Kartu Komitmen
    function renderPledgeCard(data) {
        const promisesHtml = data.promises.map(p => `<li>${escapeHtml(p)}</li>`).join('');

        cardView.innerHTML = `
            <div class="pledge-card fade-in">
                <span class="pledge-card-badge-seal">Agen Resmi</span>
                <div class="pledge-card-header">
                    <div class="pledge-card-logo"><i data-lucide="leaf" style="width: 18px; height: 18px; vertical-align: -3px; margin-right: 4px; color: #4ade80;"></i> EnergiKu</div>
                    <div class="pledge-card-serial">ID: ${escapeHtml(data.serial)}</div>
                </div>

                <div class="pledge-card-student">
                    <p class="pledge-card-student-label">Ikrar Komitmen Siswa</p>
                    <div class="pledge-card-name">${escapeHtml(data.name)}</div>
                    <div class="pledge-card-class">${escapeHtml(data.className)}</div>
                </div>

                <div class="pledge-card-promises">
                    <h5>Aksi yang Dikomitmenkan:</h5>
                    <ul>
                        ${promisesHtml}
                    </ul>
                </div>

                <div class="pledge-card-footer">
                    <span>Terdaftar: ${escapeHtml(data.date)}</span>
                    <button id="btn-edit-pledge" class="btn-reset-challenge" style="color: #cbd0c4; border-color: rgba(255,255,255,0.2); display: inline-flex; align-items: center; gap: 4px;">
                        <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i> Ganti Komitmen
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) {
            lucide.createIcons();
        }

        // Pasang event listener untuk ganti komitmen
        const editBtn = document.getElementById('btn-edit-pledge');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (confirm('Ingin memperbarui ikrar komitmenmu?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    renderEmptyPledgeState();
                    form.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // Render Status Kosong Saat Belum Ikrar
    function renderEmptyPledgeState() {
        cardView.innerHTML = `
            <div class="pledge-card" style="border-style: dashed; background: rgba(20, 23, 19, 0.6);">
                <div class="pledge-card-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e59325" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">Kartu Komitmen Belum Terbit</h4>
                    <p style="font-size: 0.88rem; color: #a4a79d; max-width: 280px; margin: 0 auto;">
                        Isi form di samping untuk mengikrarkan komitmen hemat energimu dan dapatkan lencana digital resmi Agen EnergiKu!
                    </p>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
