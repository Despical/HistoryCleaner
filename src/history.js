const $ = (s) => document.querySelector(s);
const list = $('#list');
const CHUNK = 300;
const BATCH = 50;

let items = [];
let selected = new Set();
let rendered = 0;
let lastIdx = -1;
let lastDay = '';
let curCard = null;
let cancelled = false;
let menuUrl = null;
let wipeAsked = false;
let bookmarked = new Set();

const nf = (n) => n.toLocaleString(locale());
const dayKey = (t) => new Date(t).toDateString();
const fmtTime = (ts) => new Date(ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return ''; } };
const favicon = (u) => `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(u)}&size=16`;

function dayLabel(ts) {
    const d = new Date(ts);
    const full = d.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const diff = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
    return diff === 0 ? `${t('today')} - ${full}` : diff === 1 ? `${t('yesterday')} - ${full}` : full;
}

async function loadBookmarks() {
    const urls = new Set();
    const walk = (nodes) => nodes.forEach((n) => { if (n.url) urls.add(n.url); if (n.children) walk(n.children); });

    try { walk(await chrome.bookmarks.getTree()); } catch { }

    bookmarked = urls;
}

async function removeBookmark(url) {
    const nodes = await chrome.bookmarks.search({ url });
    await Promise.all(nodes.map((n) => chrome.bookmarks.remove(n.id).catch(() => {})));

    bookmarked.delete(url);
}

async function load() {
    const text = $('#q').value.trim();
    [items] = await Promise.all([
        chrome.history.search({ text, startTime: 0, maxResults: 1000000 }),
        loadBookmarks(),
    ]);

    selected.clear();

    resetList();
    updateBar();
}

function resetList() {
    list.textContent = '';
    rendered = 0; lastIdx = -1; lastDay = ''; curCard = null;

    renderMore();
    $('#empty').hidden = items.length > 0;
}

function renderMore() {
    const end = Math.min(rendered + CHUNK, items.length);
    const frag = document.createDocumentFragment();
    for (let i = rendered; i < end; i++) {
        const it = items[i];
        const key = dayKey(it.lastVisitTime);

        if (key !== lastDay) {
            lastDay = key;
            curCard = document.createElement('section');
            curCard.className = 'card';
            const h = document.createElement('div');
            h.className = 'dayhead'; h.textContent = dayLabel(it.lastVisitTime);
            curCard.appendChild(h);
            frag.appendChild(curCard);
        }

        const row = document.createElement('div');
        row.className = 'row' + (selected.has(it.url) ? ' sel' : '');
        row.dataset.i = i;

        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = selected.has(it.url);

        const time = document.createElement('span');
        time.className = 'time'; time.textContent = fmtTime(it.lastVisitTime);

        const fav = document.createElement('img');
        fav.className = 'fav'; fav.src = favicon(it.url); fav.loading = 'lazy';

        const a = document.createElement('a');
        a.className = 'title'; a.href = it.url; a.textContent = it.title || it.url;

        const host = document.createElement('span');
        host.className = 'host'; host.textContent = hostOf(it.url);

        const more = document.createElement('button');
        more.className = 'more'; more.type = 'button'; more.title = t('more');
        more.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';

        row.append(cb, time, fav, a, host);

        if (bookmarked.has(it.url)) {
            const star = document.createElement('button');
            star.className = 'star'; star.type = 'button'; star.title = t('removeBookmark');
            star.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
            row.appendChild(star);
        }

        row.appendChild(more);
        curCard.appendChild(row);
    }
    list.appendChild(frag);
    rendered = end;
}

function setRow(row, on) {
    row.classList.toggle('sel', on);
    row.querySelector('input').checked = on;
}

list.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const row = e.target.closest('.row');

    if (!row) return;
    const i = +row.dataset.i;

    const star = e.target.closest('.star');

    if (star) {
        e.stopPropagation();

        const url = items[i].url;

        removeBookmark(url).then(() => {
            list.querySelectorAll('.row').forEach((r) => {
                if (items[+r.dataset.i]?.url === url) r.querySelector('.star')?.remove();
            });
        });
        return;
    }

    const more = e.target.closest('.more');

    if (more) {
        e.stopPropagation();

        menuUrl = items[i].url;

        const r = more.getBoundingClientRect();
        const m = $('#menu');

        m.hidden = false;
        m.style.top = Math.min(r.bottom, innerHeight - 60) + 'px';
        m.style.left = Math.max(8, r.right - m.offsetWidth) + 'px';
        return;
    }

    const on = e.target.tagName === 'INPUT' ? e.target.checked : !selected.has(items[i].url);
    const range = e.shiftKey && lastIdx >= 0;
    const from = range ? Math.min(lastIdx, i) : i;
    const to = range ? Math.max(lastIdx, i) : i;

    for (let k = from; k <= to; k++) on ? selected.add(items[k].url) : selected.delete(items[k].url);
    list.querySelectorAll('.row').forEach((r) => {
        const k = +r.dataset.i;

        if (k >= from && k <= to) setRow(r, on);
    });

    lastIdx = i;
    updateBar();
});

document.addEventListener('click', () => { $('#menu').hidden = true; });
$('#menuDel').addEventListener('click', () => { if (menuUrl) deleteUrls([menuUrl]); });

window.addEventListener('scroll', () => {
    if (rendered < items.length && innerHeight + scrollY > document.body.scrollHeight - 600) renderMore();
});

function updateBar() {
    const n = selected.size;
    $('#searchMode').hidden = n > 0;
    $('#selMode').hidden = n === 0;
    $('#selCount').textContent = t('selected', { n: nf(n) });
    $('#selAll').textContent = n === items.length ? t('deselectAll') : t('selectAll', { n: nf(items.length) });
}

$('#selClose').addEventListener('click', () => {
    selected.clear();

    list.querySelectorAll('.row').forEach((r) => setRow(r, false));
    updateBar();
});

$('#selAll').addEventListener('click', () => {
    const all = selected.size !== items.length;
    selected.clear();

    if (all) items.forEach((it) => selected.add(it.url));

    list.querySelectorAll('.row').forEach((r) => setRow(r, all));
    updateBar();
});

document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'a') return;
    if (document.activeElement === $('#q') || document.querySelector('dialog[open]')) return;

    e.preventDefault();

    items.forEach((it) => selected.add(it.url));
    list.querySelectorAll('.row').forEach((r) => setRow(r, true));

    updateBar();
});

function askDelete() {
    if (!selected.size) return;
    wipeAsked = false;
    $('#confirmText').textContent = isEverything([...selected])
        ? t('confirmAllText')
        : t('confirmText', { n: nf(selected.size) });
    $('#confirmDlg').showModal();
}

$('#selDel').addEventListener('click', askDelete);

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Delete' || document.activeElement === $('#q') || document.querySelector('dialog[open]')) return;
    if (!selected.size) return;
    e.preventDefault();

    askDelete();
});

$('#confirmNo').addEventListener('click', () => $('#confirmDlg').close());
$('#confirmYes').addEventListener('click', () => {
    $('#confirmDlg').close();

    if (wipeAsked) wipeAll();
    else deleteUrls([...selected]);
});

// Works even when the list is empty: leftovers the list cannot show still get cleared.
$('#wipeAll').addEventListener('click', (e) => {
    e.preventDefault();

    wipeAsked = true;
    $('#confirmText').textContent = t('confirmAllText');
    $('#confirmDlg').showModal();
});

const isEverything = (urls) => urls.length > 0 && urls.length === items.length && !$('#q').value.trim();

// deleteUrl only removes the listed history rows; the address bar's learned
// shortcuts and predictions survive it, so a full wipe clears them together.
async function wipeAll() {
    await chrome.browsingData.remove({ since: 0 }, { history: true });
    await chrome.history.deleteAll();

    await load();
}

async function deleteUrls(urls) {
    if (!urls.length) return;
    if (isEverything(urls)) return wipeAll();
    cancelled = false;
    const showProgress = urls.length > BATCH;
    if (showProgress) {
        $('#fill').style.width = '0';
        $('#ptext').textContent = `0 / ${nf(urls.length)}`;
        $('#progDlg').showModal();
    }

    let done = 0;
    for (let i = 0; i < urls.length && !cancelled; i += BATCH) {
        const part = urls.slice(i, i + BATCH);
        await Promise.all(part.map((u) => chrome.history.deleteUrl({ url: u }).catch(() => {})));

        done += part.length;

        if (showProgress) {
            $('#fill').style.width = (done / urls.length * 100) + '%';
            $('#ptext').textContent = `${nf(done)} / ${nf(urls.length)}`;
        }

        await new Promise((r) => setTimeout(r, 0));
    }

    if (showProgress) $('#progDlg').close();

    const gone = new Set(urls.slice(0, done));
    items = items.filter((it) => !gone.has(it.url));

    gone.forEach((u) => selected.delete(u));

    resetList();
    updateBar();
}

$('#cancel').addEventListener('click', () => { cancelled = true; });

$('#clearData').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://settings/clearBrowserData' });
});

let timer;
$('#q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(load, 250);
});

function buildLangSelect() {
    const sel = $('#lang');
    sel.textContent = '';

    const opts = [['auto', t('auto')], ...Object.entries(LANGS)];

    for (const [value, label] of opts) {
        const o = document.createElement('option');
        o.value = value; o.textContent = label;
        sel.appendChild(o);
    }

    sel.value = getPref();
}

$('#lang').addEventListener('change', (e) => {
    setPref(e.target.value);
    applyStatic();
    buildLangSelect();
    resetList();
    updateBar();
});

applyStatic();
buildLangSelect();
load();
