let settings = JSON.parse(localStorage.getItem('settings')) || {};

function init(){
    const darkMode = $_('dark-mode-select');
    const filter = $_('filter-only-music-select');
    darkMode.value = settings.darkMode || 'auto';
    filter.value = settings.filterOnlyMusic || 'true';

    darkMode.addEventListener('change', () => {
        settings.darkMode = darkMode.value;
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    filter.addEventListener('change', () => {
        settings.filterOnlyMusic = filter.value;
        localStorage.setItem('settings', JSON.stringify(settings));
    });
}