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
    listElement.innerHTML = '<p>Searching . . .</p>'
    if(songs.length != 0) registerSongs(listElement, songs);
    $_('main').appendChild(section);
    return [section, listElement];
}

function registerSongs(listElement, songs){
    listElement.innerHTML = songs.length == 0 ? '<p>No results found</p>' : '';
    songs.forEach(song => {
        const songElement = songTemp.content.cloneNode(true);
        const mainElement = songElement.getElementById('card-main');
        const imgElement = songElement.getElementById('card-img');
        const titleElement = songElement.getElementById('card-title');
        const artistElement = songElement.getElementById('card-artist');
        const durationElement = songElement.getElementById('card-duration');
        mainElement.setAttribute('data-id', song.videoId);
        mainElement.addEventListener('click', async e => {
            alert(song.description);
            console.log(song);
        });
        imgElement.style.backgroundImage = `url(${song.thumbnail || "https://via.placeholder.com/160"})`;
        titleElement.textContent = parseTitle(song.title) || "Title";
        artistElement.textContent = song.author?.name || "Artist";
        durationElement.textContent = song.timestamp || "00:00";
        listElement.appendChild(songElement);
    });
}

function parseTitle(title) {
    // 1. 따옴표(`'`, `‘`, `’`) 안의 곡명을 우선 추출
    let quoteMatch = title.match(/['"‘’“”](.*?)['"‘’“”]/);
    if (quoteMatch) return quoteMatch[1].trim();

    // 2. "Artist - Title" 패턴 처리
    let dashMatch = title.match(/^(.*?)-\s*(.*?)\s*(?:\(|$)/);
    if (dashMatch) return dashMatch[2].trim();

    // 3. 괄호 이후의 수식어 및 기타 텍스트 제거
    let parenMatch = title.match(/^(.*?)\s*\(.*?\)/);
    if (parenMatch) return parenMatch[1].trim();

    // 4. 기본적으로 제목 전체 반환 (추가 처리가 필요 없을 경우)
    return title.trim();
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

function search(query){
    if(query.trim() == '') return;
    cleanMain();
    const [sect, list] = createSection('Search Results')
    getSongs(query || 'music').then(songs => {registerSongs(list, songs)})
}

$_('profile-sidebar').style.animation = 'slideOutTop 0s forwards';
$_('profile-btn').addEventListener('click', e => {
    $_('profile-sidebar').classList.toggle('active');
    if ($_('profile-sidebar').classList.contains('active')) {
        $_('profile-sidebar').style.animation = 'slideInTop 0.2s forwards';
    } else {
        $_('profile-sidebar').style.animation = 'slideOutTop 0.2s forwards';
    }
})
document.addEventListener('mousedown', e => {
    if(!(
        e.target.id == 'profile-btn' ||
        e.target.id == 'profile-sidebar' ||
        e.target.classList.contains('profile-item') ||
        e.target.classList.contains('profile-icon') ||
        e.target.classList.contains('profile-item-icon') ||
        e.target.classList.contains('profile-item-text')
    )){
        $_('profile-sidebar').classList.remove('active');
        $_('profile-sidebar').style.animation = 'slideOutTop 0.2s forwards';
    }
})

cleanMain();

const [_sect, _list] = createSection('Recently');
getSongs('recently music').then(songs => {registerSongs(_list, songs)});

const [_sect2, _list2] = createSection('KPOP');
getSongs('kpop music').then(songs => {registerSongs(_list2, songs)});

const [_sect3, _list3] = createSection('Popular');
getSongs('popular music').then(songs => {registerSongs(_list3, songs)});

$_('search-inp').addEventListener('keydown', e => e.code === 'Enter' ? search($_('search-inp').value) : null)
$_('search-btn').addEventListener('click', e => search($_('search-inp').value))
