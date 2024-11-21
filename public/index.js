function $(selector){return document.querySelector(selector)};
function $_(id){return document.getElementById(id)};
function $$(selector){return document.querySelectorAll(selector)};
function $$_(selector){return Array.from(document.querySelectorAll(selector))};

const audio = document.querySelector('audio');
const sectionTemp = $_('section-template')
const songTemp = $_('song-card-template');

function createSection(title, songs = []){
    const clone = sectionTemp.content.cloneNode(true);
    const section = clone.getElementById('section-main');
    const titleElement = clone.getElementById('section-title');
    const listElement = clone.getElementById('song-list');
    titleElement.textContent = title;
    registerSongs(listElement, songs);
    $_('main').appendChild(section);
    return [section, listElement];
}

function registerSongs(listElement, songs){
    songs.forEach(song => {
        const songElement = songTemp.content.cloneNode(true);
        const mainElement = songElement.getElementById('card-main');
        const imgElement = songElement.getElementById('card-img');
        const titleElement = songElement.getElementById('card-title');
        const artistElement = songElement.getElementById('card-artist');
        const durationElement = songElement.getElementById('card-duration');
        mainElement.setAttribute('data-id', song.videoId);
        imgElement.style.backgroundImage = `url(${song.thumbnail || "https://via.placeholder.com/160"})`;
        titleElement.textContent = song.title || "Title";
        artistElement.textContent = song.author?.name || "Artist";
        durationElement.textContent = song.timestamp || "00:00";
        listElement.appendChild(songElement);
    });
}

function cleanMain(){
    $_('main').innerHTML = '';
}

async function getSongs(text) {
    const response = await fetch(`/search?q=${text}`);
    const data = await response.json();
    return data.videos;
}

async function getAudioUrl(id) {
    const response = await fetch(`/audio?id=${id}`);
    const data = await response.json();
    return data.audioUrl;
}

$_('profile-sidebar').style.animation = 'slideOutTop 0s forwards';
$_('profile-btn').addEventListener('click', e => {
    $_('profile-sidebar').classList.toggle('active');
    if ($_('profile-sidebar').classList.contains('active')) {
        $_('profile-sidebar').style.animation = 'slideInTop 0.5s forwards';
    } else {
        $_('profile-sidebar').style.animation = 'slideOutTop 0.5s forwards';
    }
})

cleanMain();
const [_sect, _list] = createSection('Popular Songs');
getSongs('kpop').then(songs => {registerSongs(_list, songs)});
