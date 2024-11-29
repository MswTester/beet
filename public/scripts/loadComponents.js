// Load components into the page
const domparser = new DOMParser();

async function loadComponent(containerId, componentPath) {
    const container = $_(containerId);
    if(container){
        const res = await fetch(componentPath)
        const data = await res.text();
        const doc = domparser.parseFromString(data, 'text/html');
        container.appendChild(doc.body.firstChild);
        document.head.innerHTML += doc.head.innerHTML;
    }
}

async function loadComponents() {
    const playlist = $_('playlist-container');
    await loadComponent('navigator-container', '/components/navigator.html');
    await loadComponent('tab-layout-container', '/components/tabLayout.html');
    if(playlist) await loadComponent('playlist-container', '/components/playlist.html');
    initNavigator();
    initTabLayout();
    if(playlist) initPlaylist();
    init();
}

addEventListener('DOMContentLoaded', loadComponents);