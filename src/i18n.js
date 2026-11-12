const LANGS = { en: 'English', tr: 'Türkçe' };
const LOCALES = { en: 'en-US', tr: 'tr-TR' };

const STRINGS = {
    en: {
        title: 'History',
        search: 'Search history',
        navHistory: 'History',
        navClear: 'Clear browsing data',
        navWipe: 'Delete all history',
        empty: 'No entries found.',
        selected: '{n} selected',
        selectAll: 'Select all ({n})',
        deselectAll: 'Deselect all',
        del: 'Delete',
        clearSel: 'Clear selection',
        confirmTitle: 'Remove from history?',
        confirmText: '{n} selected items will be removed from your history.',
        confirmAllText: 'Your entire history will be deleted, along with address bar suggestions.',
        cancel: 'Cancel',
        deleting: 'Deleting…',
        stop: 'Stop',
        today: 'Today',
        yesterday: 'Yesterday',
        more: 'More actions',
        remove: 'Remove from history',
        removeBookmark: 'Remove bookmark',
        language: 'Language',
        auto: 'Automatic',
    },
    tr: {
        title: 'Geçmiş',
        search: 'Geçmişte ara',
        navHistory: 'Geçmiş',
        navClear: 'Gezinme verilerini temizle',
        navWipe: 'Tüm geçmişi sil',
        empty: 'Kayıt bulunamadı.',
        selected: '{n} seçildi',
        selectAll: 'Tümünü seç ({n})',
        deselectAll: 'Seçimi kaldır',
        del: 'Sil',
        clearSel: 'Seçimi temizle',
        confirmTitle: 'Geçmişten kaldırılsın mı?',
        confirmText: 'Seçili {n} öğe geçmişinden kaldırılacak.',
        confirmAllText: 'Tüm geçmiş, adres çubuğu önerileriyle birlikte tamamen silinecek.',
        cancel: 'İptal',
        deleting: 'Siliniyor…',
        stop: 'Durdur',
        today: 'Bugün',
        yesterday: 'Dün',
        more: 'Diğer işlemler',
        remove: 'Geçmişten kaldır',
        removeBookmark: 'Yer işaretini kaldır',
        language: 'Dil',
        auto: 'Otomatik',
    },
};

function getPref() {
    try { return localStorage.getItem('lang') || 'auto'; } catch { return 'auto'; }
}

function setPref(v) {
    try { localStorage.setItem('lang', v); } catch { }
}

function currentLang() {
    const pref = getPref();
    if (pref !== 'auto' && STRINGS[pref]) return pref;
    const ui = (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase();
    return STRINGS[ui] ? ui : 'en';
}

function t(key, vars = {}) {
    const s = STRINGS[currentLang()][key] ?? STRINGS.en[key] ?? key;
    return s.replace(/\{(\w+)}/g, (_, k) => (k in vars ? vars[k] : ''));
}

const locale = () => LOCALES[currentLang()];

function applyStatic() {
    document.documentElement.lang = currentLang();
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        const [attr, key] = el.dataset.i18nAttr.split(':');
        el.setAttribute(attr, t(key));
    });
}
