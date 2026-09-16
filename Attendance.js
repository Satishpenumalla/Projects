<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Simple Attendance</title>
    <style>
        :root{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.4}
        body{max-width:900px;margin:32px auto;padding:16px}
        header{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
        input,button,select{padding:8px;border:1px solid #cfcfcf;border-radius:6px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
        tr:hover{background:#fafafa}
        .controls{display:flex;gap:8px;flex-wrap:wrap}
        .small{font-size:0.9rem;padding:6px}
        .right{margin-left:auto}
        .empty{color:#888;margin-top:12px}
    </style>
</head>
<body>
    <header>
        <h1>Attendance</h1>
        <div class="controls">
            <label>Date <input id="date" type="date"></label>
            <label>
                Name
                <input id="nameInput" placeholder="Add student name" />
            </label>
            <button id="addBtn">Add</button>
            <button id="clearBtn" class="small">Clear list</button>
            <button id="saveBtn" class="small">Save</button>
            <button id="exportBtn" class="small">Export CSV</button>
            <input id="importFile" type="file" accept=".csv" style="display:none" />
            <button id="importBtn" class="small">Import CSV</button>
        </div>
    </header>

    <main>
        <table id="table" aria-live="polite">
            <thead>
                <tr><th>Name</th><th>Status</th><th class="right">Actions</th></tr>
            </thead>
            <tbody id="tbody"></tbody>
        </table>
        <div id="empty" class="empty">No students yet. Add names above.</div>
    </main>

    <script>
        // Simple client-side attendance app. Data persisted in localStorage per date.
        const dateInput = document.getElementById('date');
        const nameInput = document.getElementById('nameInput');
        const addBtn = document.getElementById('addBtn');
        const tbody = document.getElementById('tbody');
        const empty = document.getElementById('empty');
        const saveBtn = document.getElementById('saveBtn');
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');

        // Default date = today
        function todayISO(){ return new Date().toISOString().slice(0,10); }
        dateInput.value = todayISO();

        function storageKey(date){ return 'attendance:' + date; }

        function loadForDate(date){
            tbody.innerHTML = '';
            const raw = localStorage.getItem(storageKey(date));
            const list = raw ? JSON.parse(raw) : [];
            if (!list.length){ empty.style.display = 'block'; return; }
            empty.style.display = 'none';
            list.forEach((item, idx) => appendRow(item.name, item.status, idx));
        }

        function saveForDate(date){
            const rows = Array.from(tbody.rows);
            const data = rows.map(r => {
                return { name: r.dataset.name, status: r.querySelector('select').value };
            });
            localStorage.setItem(storageKey(date), JSON.stringify(data));
            alert('Saved for ' + date);
        }

        function appendRow(name, status = 'Present', index = undefined){
            empty.style.display = 'none';
            const tr = document.createElement('tr');
            tr.dataset.name = name;
            const nameTd = document.createElement('td');
            nameTd.textContent = name;
            const statusTd = document.createElement('td');
            const sel = document.createElement('select');
            ['Present','Absent','Late'].forEach(s => {
                const o = document.createElement('option'); o.value = s; o.textContent = s;
                if (s === status) o.selected = true;
                sel.appendChild(o);
            });
            statusTd.appendChild(sel);
            const actionsTd = document.createElement('td');
            actionsTd.style.textAlign = 'right';
            const del = document.createElement('button');
            del.textContent = 'Remove';
            del.className = 'small';
            del.onclick = () => { tr.remove(); if (!tbody.rows.length) empty.style.display='block'; };
            actionsTd.appendChild(del);
            tr.appendChild(nameTd); tr.appendChild(statusTd); tr.appendChild(actionsTd);
            tbody.appendChild(tr);
        }

        addBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) { nameInput.focus(); return; }
            appendRow(name);
            nameInput.value = '';
            nameInput.focus();
        });

        nameInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') addBtn.click();
        });

        dateInput.addEventListener('change', () => loadForDate(dateInput.value));
        saveBtn.addEventListener('click', () => saveForDate(dateInput.value));
        clearBtn.addEventListener('click', () => {
            if (!confirm('Clear all students for this date?')) return;
            tbody.innerHTML = '';
            localStorage.removeItem(storageKey(dateInput.value));
            empty.style.display = 'block';
        });

        exportBtn.addEventListener('click', () => {
            const date = dateInput.value;
            const rows = Array.from(tbody.rows);
            if (!rows.length){ alert('No data to export'); return; }
            const csv = ['Name,Status,Date']
                .concat(rows.map(r => `"${r.dataset.name.replace(/"/g,'""')}","${r.querySelector('select').value}","${date}"`))
                .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-${date}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });

        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                const lines = text.split(/\r?\n/).filter(Boolean);
                // Accept CSV with header Name,Status,... or simple name per line
                const rows = lines.map((line, i) => {
                    if (i === 0 && /name/i.test(line.split(',')[0])) return null;
                    const parts = line.split(',').map(s => s.replace(/^"|"$/g,'').trim());
                    return parts.length ? parts : null;
                }).filter(Boolean);
                if (!rows.length) { alert('No valid rows'); return; }
                tbody.innerHTML = '';
                rows.forEach(r => {
                    const name = r[0] || ('Student ' + (Math.random()*1000|0));
                    const status = (r[1] || 'Present');
                    appendRow(name, status);
                });
                importFile.value = '';
            };
            reader.readAsText(f);
        });

        // Mark dataset names for rows created from saved data
        function normalizeDataset(){
            Array.from(tbody.rows).forEach(r => {
                if (!r.dataset.name) r.dataset.name = r.cells[0].textContent;
            });
        }

        // Initialize from storage
        loadForDate(dateInput.value);

        // Ensure dataset.name exists when rows added via DOM methods
        const observer = new MutationObserver(() => normalizeDataset());
        observer.observe(tbody, { childList: true, subtree: false });

        // Auto-save when navigating away
        window.addEventListener('beforeunload', () => {
            try { saveForDate(dateInput.value); } catch(e) {}
        });
    </script>
</body>
</html>