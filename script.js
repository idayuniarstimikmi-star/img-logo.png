// Tab logic
document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    const t = btn.dataset.tab
    document.querySelectorAll('section').forEach(s => s.style.display = 'none')
    document.getElementById(t).style.display = ''

    // Panggil loadMsgs() jika tab Mental Zone dibuka
    if (t === 'mental') {
        loadMsgs();
    }
}))

// Finance logic variables
const income = document.getElementById('income')
const fixed = document.getElementById('fixed')
const savePct = document.getElementById('savePct')
const calcBtn = document.getElementById('calcBudget')
const budgetResult = document.getElementById('budgetResult')
const summaryText = document.getElementById('summaryText')
const variableProgress = document.getElementById('variableProgress')
const spentRatio = document.getElementById('spentRatio')
let variableBudget = 0 
let exps = JSON.parse(localStorage.getItem('vinixExps')) || []; // Load dari local storage

function formatRp(n){return 'Rp ' + Number(n).toLocaleString('id-ID')}

function updateFinanceSummary() {
    const inc = Number(income.value)||0
    const fix = Number(fixed.value)||0
    const pct = Number(savePct.value)||0
    const save = Math.round(inc * (pct/100))
    const totalExpensed = exps.reduce((sum, e) => sum + e.amt, 0); 
    const remaining = inc - fix - save
    
    // Update Anggaran Variabel Global
    variableBudget = remaining > 0 ? remaining : 0; 

    // Menggunakan backtick (`) untuk template literal
    budgetResult.innerHTML = `<div class="muted">Saran:</div>
        <div style="margin-top:8px">Simpanan: <strong>${formatRp(save)}</strong> (${pct}%)</div>
        <div>Pengeluaran Tetap: <strong>${formatRp(fix)}</strong></div>
        <div>Anggaran Variabel tersisa: <strong>${formatRp(variableBudget)}</strong></div>`
    
    // Menggunakan backtick (`) untuk template literal
    summaryText.textContent = `Simpanan ${formatRp(save)} — Variabel ${formatRp(variableBudget)}`
    
    // --- LOGIC PROGRESS BAR FIXED START ---
    let usagePct = 0
    let displayRatioText = '';
    
    if (variableBudget > 0) {
        // Hitung persentase penggunaan dari budget yang tersedia
        usagePct = (totalExpensed / variableBudget) * 100;

        if (usagePct > 100) {
            const overAmount = totalExpensed - variableBudget;
            variableProgress.style.width = `100%`;
            variableProgress.style.backgroundColor = '#dc3545'; 
            // Menggunakan backtick (`) untuk template literal
            displayRatioText = `<strong style="color: #dc3545;">OVER BUDGET: ${formatRp(overAmount)}</strong> (${formatRp(totalExpensed)} terpakai dari ${formatRp(variableBudget)})`; 

        } else {
            const displayPct = Math.round(usagePct);
            // Menggunakan backtick (`) untuk template literal
            variableProgress.style.width = `${displayPct}%`;
            variableProgress.style.backgroundColor = 'var(--accent)'; 
            // Menggunakan backtick (`) untuk template literal
            displayRatioText = `${displayPct}% dari ${formatRp(variableBudget)}`;
        }
    } else if (totalExpensed > 0) {
         variableProgress.style.width = `100%`;
         variableProgress.style.backgroundColor = '#dc3545';
         // Menggunakan backtick (`) untuk template literal
         displayRatioText = `<strong style="color: #dc3545;">WARNING: ${formatRp(totalExpensed)} terpakai. Budget Variabel NOL.</strong>`;

    } else {
         variableProgress.style.width = `0%`;
         variableProgress.style.backgroundColor = 'var(--accent)';
         // Menggunakan backtick (`) untuk template literal
         displayRatioText = `0% dari ${formatRp(variableBudget)}`;
    }

    spentRatio.innerHTML = displayRatioText;
    // --- LOGIC PROGRESS BAR FIXED END ---

    // --- LOGIC GRAFIK DISTRIBUSI BARU START ---
    const total = inc; 
    const fixedBar = document.getElementById('fixedBar');
    const saveBar = document.getElementById('saveBar');
    const variableBar = document.getElementById('variableBar');
    
    if (total > 0) {
        const fixedPct = (fix / total) * 100;
        const savePctDisplay = (save / total) * 100;
        const variablePct = (variableBudget / total) * 100;

        // Menggunakan backtick (`) untuk template literal
        fixedBar.style.width = `${fixedPct}%`;
        fixedBar.textContent = fixedPct >= 5 ? `${Math.round(fixedPct)}%` : ''; 
        
        // Menggunakan backtick (`) untuk template literal
        saveBar.style.width = `${savePctDisplay}%`;
        saveBar.textContent = savePctDisplay >= 5 ? `${Math.round(savePctDisplay)}%` : '';

        // Menggunakan backtick (`) untuk template literal
        variableBar.style.width = `${variablePct}%`;
        variableBar.textContent = variablePct >= 5 ? `${Math.round(variablePct)}%` : '';

    } else {
        // Reset jika income 0
        fixedBar.style.width = '0%';
        saveBar.style.width = '0%';
        variableBar.style.width = '0%';
        fixedBar.textContent = '';
        saveBar.textContent = '';
        variableBar.textContent = '';
    }
    // --- LOGIC GRAFIK DISTRIBUSI BARU END ---
}

calcBtn.addEventListener('click', updateFinanceSummary)

document.getElementById('resetBudget').addEventListener('click', ()=>{
    income.value = 5000000; fixed.value=2000000; savePct.value=20; budgetResult.innerHTML=''; summaryText.textContent='Belum ada perhitungan.';
    variableBudget = 0; exps = []; 
    localStorage.removeItem('vinixExps'); // Hapus dari local storage
    renderExps(); updateFinanceSummary();
})

// Panggil saat awal dimuat untuk inisiasi
updateFinanceSummary(); 

// Expense list
const expList = document.getElementById('expList')
const expName = document.getElementById('expName')
const expAmt = document.getElementById('expAmt')
const addExp = document.getElementById('addExp')

function saveExps() {
    localStorage.setItem('vinixExps', JSON.stringify(exps));
}

function renderExps(){
    expList.innerHTML = ''
    exps.forEach((e,i)=>{
        const li = document.createElement('li')
        li.style.padding='8px'
        li.style.display='flex'
        li.style.justifyContent='space-between'
        li.className='muted'
        // Menggunakan backtick (`) untuk template literal
        li.innerHTML = `<div>${e.name}</div><div>${formatRp(e.amt)} <button style="margin-left:8px" data-i="${i}" class="btn-ghost">hapus</button></div>`
        expList.appendChild(li)
    })
    // Re-attach event listeners after rendering
    expList.querySelectorAll('button').forEach(b=>b.addEventListener('click', (ev)=>{
        const i = ev.target.dataset.i
        exps.splice(i,1); 
        saveExps(); // Simpan setelah menghapus
        renderExps(); 
        updateFinanceSummary(); 
    }))
}
addExp.addEventListener('click', ()=>{
    const name = expName.value.trim(); const amt = Number(expAmt.value)||0
    if(!name || amt<=0) return alert('Isi nama dan jumlah pengeluaran yang valid')
    exps.push({name,amt}); expName.value=''; expAmt.value=''; 
    saveExps(); // Simpan setelah menambah
    renderExps(); 
    updateFinanceSummary(); 
})
// Panggil saat awal dimuat
renderExps();

// Career planner
document.getElementById('savePlan').addEventListener('click', ()=>{
    const cur = document.getElementById('currentPos').value
    const tar = document.getElementById('targetPos').value
    const act = document.getElementById('careerActions').value
    const preview = document.getElementById('planPreview')
    // Menggunakan backtick (`) untuk template literal
    preview.innerHTML = `<div class="muted"><strong>Posisi saat ini:</strong> ${cur||'-'}<br><strong>Target:</strong> ${tar||'-'}<br><strong>Action:</strong> ${act||'-'}</div>`
})

// Fitur Notifikasi/Pengingat Sederhana (dengan nama Vinix)
document.getElementById('setReminder').addEventListener('click', ()=>{
    const targetPos = document.getElementById('targetPos').value
    const actions = document.getElementById('careerActions').value
    
    if (targetPos || actions) {
        // Menggunakan backtick (`) untuk template literal
        const message = `🔔 VINIX ASISTEN MENGINGATKAN:\n\nTarget karir Anda: ${targetPos||'Belum ditentukan'}.\nAksi: ${actions||'Belum ada action'}.\n\nLanjutkan perencanaan di Career Zone!`
        alert(message)
    } else {
         alert('VINIX ASISTEN: Silakan isi "Target Posisi" atau "Langkah / Action" di Career Planner terlebih dahulu!')
    }
})

// Resume generator (simple template)
const resumePreview = document.getElementById('resumePreview')
let lastResumeText = ''
document.getElementById('genResume').addEventListener('click', ()=>{
    const name = document.getElementById('fullName').value || 'Nama Kamu'
    const profile = document.getElementById('profile').value || 'Ringkasan singkat tentang kamu.'
    const xp = document.getElementById('xp').value || 'Pengalaman / proyek singkat.'
    // Menggunakan backtick (`) untuk template literal
    const txt = `Nama: ${name}\n\nProfil:\n${profile}\n\nPengalaman:\n${xp}\n\nSkills:\n- Bahasa Pemrograman\n- Tools & Framework\n\nPortofolio: cantumkan link atau screenshot proyek.`
    resumePreview.textContent = txt.replace(/\n/g,'\n')
    lastResumeText = txt
})
document.getElementById('downloadResume').addEventListener('click', ()=>{
    if(!lastResumeText) return alert('Buat resume terlebih dahulu')
    const blob = new Blob([lastResumeText],{type:'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='resume.txt'; a.click(); URL.revokeObjectURL(url)
})

// Skill Growth Path (Link and Match + Data Industri)
document.getElementById('showPath').addEventListener('click', ()=>{
    const s = document.getElementById('skillSelect').value
    const area = document.getElementById('pathArea')
    const paths = {
        web:{
            path:`1. HTML & CSS → 2. JavaScript dasar → 3. Framework (React/Vue) → 4. Proyek portofolio → 5. System Design & Testing`,
            data:`Kebutuhan Pasar: Tumbuh Cepat (+18%) di sektor startup & e-commerce. Prospek: Frontend/Backend Developer. Skill Paling Dicari: React/Next.js.`
        },
        data:{
            path:`1. Statistik dasar → 2. Python & Pandas → 3. Machine Learning dasar → 4. Project Kaggle → 5. Deploy Model`,
            data:`Kebutuhan Pasar: Sangat Tinggi (+25%) di bidang Finance dan Retail untuk analisis prediktif. Prospek: Data Analyst/Scientist. Skill Paling Dicari: SQL, Python, Tableau.`
        },
        uiux:{
            path:`1. Dasar desain visual → 2. Figma & prototyping → 3. User research → 4. Usability testing → 5. Case study portofolio`,
            data:`Kebutuhan Pasar: Stabil (+10%), dicari perusahaan yang fokus pada peningkatan user experience produk digital. Prospek: UI/UX Designer/Researcher. Skill Paling Dicari: Figma, User Research.`
        }
    }
    
    const selected = paths[s]
    // Menggunakan backtick (`) untuk template literal
    area.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">Jalur Perkembangan:</div>
        <div class="muted">${selected.path}</div>
        <div class="skill-data" style="margin-top: 10px;">
            <div style="font-weight: 600;">Data Industri Terkait:</div>
            ${selected.data}
        </div>
    `
})

// Image Preview for Portofolio
document.getElementById('projImg').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const preview = document.getElementById('imgPreview');
    preview.innerHTML = ''; 

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

// Mental Zone (Community Support) Logic
const cmName = document.getElementById('cmName');
const cmMsg = document.getElementById('cmMsg');
const postMsgBtn = document.getElementById('postMsg');
const msgList = document.getElementById('msgList');
const clearMsgsBtn = document.getElementById('clearMsgs');
const replyingToDiv = document.getElementById('replyingTo');
const replyingTextSpan = document.getElementById('replyingText');
const cancelReplyBtn = document.getElementById('cancelReply');

let messages = JSON.parse(localStorage.getItem('vinixMsgs')) || [];
let replyingToId = null;

function saveMsgs() {
    localStorage.setItem('vinixMsgs', JSON.stringify(messages));
}

function loadMsgs() {
    msgList.innerHTML = '';
    // Membalik urutan array agar yang terbaru di atas
    messages.slice().reverse().forEach(msg => { 
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg';
        msgDiv.dataset.id = msg.id;
        
        // Reply Indicator
        let replyIndicator = '';
        if (msg.replyTo) {
            const originalMsg = messages.find(m => m.id === msg.replyTo);
            const originalText = originalMsg ? originalMsg.msg.substring(0, 50) + (originalMsg.msg.length > 50 ? '...' : '') : 'Pesan asli dihapus';
            // Menggunakan backtick (`) untuk template literal
            replyIndicator = `<div class="msg-reply-indicator">Membalas: ${originalText}</div>`; 
        }

        // Reactions Display
        let reactionsDisplay = '';
        if (Object.keys(msg.reactions).length > 0) {
            reactionsDisplay = '<div class="reactions-display">';
            for (const [reaction, count] of Object.entries(msg.reactions)) {
                // Menggunakan backtick (`) untuk template literal
                reactionsDisplay += `<span class="reaction-count" data-reaction="${reaction}" data-msg-id="${msg.id}">${reaction} ${count}</span>`; 
            }
            reactionsDisplay += '</div>';
        }

        // Menggunakan backtick (`) untuk template literal
        msgDiv.innerHTML = `
            ${replyIndicator}
            <div style="font-weight: 600;">${msg.name} ${msg.mood}</div>
            <div style="margin-top: 4px;">${msg.msg}</div>
            <div class="muted" style="margin-top: 8px; display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
                <button class="reaction-trigger-btn" data-id="${msg.id}">⭐</button>
                <button class="btn-ghost reply-btn" data-id="${msg.id}">Balas</button>
                <button class="btn-delete" data-id="${msg.id}">Hapus</button>
            </div>
            ${reactionsDisplay}
        `;
        msgList.appendChild(msgDiv);
    });
    
    attachEventListeners();
}

function attachEventListeners() {
    // Reply button listener
    msgList.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            replyingToId = e.target.dataset.id;
            const originalMsg = messages.find(m => m.id === replyingToId);
            if (originalMsg) {
                replyingTextSpan.textContent = originalMsg.msg.substring(0, 50) + (originalMsg.msg.length > 50 ? '...' : '');
                replyingToDiv.style.display = 'flex';
                cmMsg.focus(); // Fokus ke kolom pesan
            }
        });
    });

    // Delete button listener
    msgList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idToDelete = e.target.dataset.id;
            // Hapus pesan yang dihapus dan semua balasan yang merujuknya
            messages = messages.filter(m => m.id !== idToDelete && m.replyTo !== idToDelete); 
            saveMsgs();
            loadMsgs();
            if (replyingToId === idToDelete) {
                cancelReplyBtn.click();
            }
        });
    });
    
    // Reaction count listener (for toggling reaction)
    msgList.querySelectorAll('.reaction-count').forEach(span => {
        span.addEventListener('click', (e) => {
            const msgId = e.target.dataset.msgId;
            const reaction = e.target.dataset.reaction;
            toggleReaction(msgId, reaction);
        });
    });
    
    // Reaction trigger button - use a default reaction on click
    msgList.querySelectorAll('.reaction-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const msgId = e.target.dataset.id;
            toggleReaction(msgId, '⭐'); // Default reaction
        });
    });
}

function toggleReaction(msgId, reaction) {
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
        // Cek apakah reaksi sudah ada
        if (msg.reactions[reaction]) {
            msg.reactions[reaction]++;
        } else {
            msg.reactions[reaction] = 1;
        }
        
        saveMsgs();
        loadMsgs(); // Reload untuk memperbarui tampilan
    }
}

// Cancel Reply
cancelReplyBtn.addEventListener('click', () => {
    replyingToId = null;
    replyingTextSpan.textContent = '';
    replyingToDiv.style.display = 'none';
});

// Post Message
postMsgBtn.addEventListener('click', () => {
    const name = cmName.value.trim() || 'Anonim';
    const msgText = cmMsg.value.trim();
    const mood = document.getElementById('cmMood') ? document.getElementById('cmMood').value : '😊'; 

    if (!msgText) {
        return alert('Pesan tidak boleh kosong!');
    }

    const newMsg = {
        id: Date.now().toString(),
        name: name,
        msg: msgText,
        mood: mood,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        replyTo: replyingToId,
        reactions: {}
    };

    messages.push(newMsg);
    saveMsgs();

    cmMsg.value = '';
    cancelReplyBtn.click(); // Reset mode balas
    loadMsgs();
});

// Clear Messages
clearMsgsBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus semua pesan komunitas? Tindakan ini tidak bisa dibatalkan.')) {
        messages = [];
        saveMsgs();
        loadMsgs();
        cancelReplyBtn.click();
    }
});

// Panggil loadMsgs() jika tab Mental Zone dibuka (ini sudah ada di Tab Logic)
// Memanggil updateFinanceSummary() dan renderExps() saat load
updateFinanceSummary(); 
renderExps();