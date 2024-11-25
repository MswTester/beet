// Load components into the page
const domparser = new DOMParser();

async function loadComponent(containerId, componentPath) {
    const res = await fetch(componentPath)
    const data = await res.text();
    const doc = domparser.parseFromString(data, 'text/html');
    document.getElementById(containerId).appendChild(doc.body.firstChild);
    document.head.innerHTML += doc.head.innerHTML;
}

async function loadComponents() {
    await loadComponent('navigator-container', '/components/navigator.html');
    await loadComponent('tab-layout-container', '/components/tabLayout.html');
    await loadComponent('playlist-container', '/components/playlist.html');
    initNavigator();
    initTabLayout();
    initPlaylist();
    init();
}

addEventListener('DOMContentLoaded', loadComponents);