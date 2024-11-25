const offline_mode = false;

let user = localStorage.getItem('user') || null;

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
        mainElement.addEventListener('click', e => {console.log(song)});
        const imgElement = songElement.getElementById('card-img');
        const titleElement = songElement.getElementById('card-title');
        const artistElement = songElement.getElementById('card-artist');
        const durationElement = songElement.getElementById('card-duration');
        const playElement = songElement.getElementById('card-play');
        const plusElement = songElement.getElementById('card-plus');
        const downloadElement = songElement.getElementById('card-download');
        playElement.addEventListener('click', e => {
            if(!isInPlaylist(song.videoId)){
                playElement.innerHTML = `<i class="fa fa-spinner"></i>`;
                getAudioUrl(song.videoId).then(url => {
                    playElement.innerHTML = `<i class="fa fa-play"></i>`;
                    const songData = {
                        videoId: song.videoId,
                        title: parseTitle(song.title) || "Title",
                        artist: song.author?.name || "Artist",
                        thumbnail: song.thumbnail,
                        seconds: song.seconds,
                        url: url
                    }
                    console.log(songData);
                    playSong(songData);
                });
            } else {
                playInPlaylist(song.videoId);
            }
        })
        plusElement.addEventListener('click', e => {
            if(!isInPlaylist(song.videoId)){
                plusElement.innerHTML = `<i class="fa fa-spinner"></i>`;
                getAudioUrl(song.videoId).then(url => {
                    plusElement.innerHTML = `<i class="fa fa-plus"></i>`;
                    const songData = {
                        videoId: song.videoId,
                        title: parseTitle(song.title) || "Title",
                        artist: song.author?.name || "Artist",
                        thumbnail: song.thumbnail,
                        seconds: song.seconds,
                        url: url
                    }
                    addSong(songData);
                });
            }
        })
        downloadElement.addEventListener('click', e => {
            downloadElement.innerHTML = `<i class="fa fa-spinner"></i>`;
            downloadAudio(song.videoId, song.title).then(() => {
                downloadElement.innerHTML = `<i class="fa fa-download"></i>`;
            });
        })
        mainElement.setAttribute('data-id', song.videoId);
        imgElement.style.backgroundImage = `url(${song.thumbnail || "https://via.placeholder.com/160"})`;
        titleElement.textContent = parseTitle(song.title) || "Title";
        artistElement.textContent = song.author?.name || "Artist";
        durationElement.textContent = song.timestamp || "00:00";
        listElement.appendChild(songElement);
    });
}

function cleanMain(){
    $_('main').innerHTML = '';
}

function search(query){
    if(query.trim() == '') return;
    cleanMain();
    const [sect, list] = createSection('Search Results')
    getSongs(query || 'music').then(songs => {registerSongs(list, songs)})
}

function getHome(){
    cleanMain();
    
    const [_sect, _list] = createSection('Recently');
    getSongs('recently music').then(songs => {registerSongs(_list, songs)});
    
    const [_sect2, _list2] = createSection('KPOP');
    getSongs('kpop music').then(songs => {registerSongs(_list2, songs)});
    
    const [_sect3, _list3] = createSection('Popular');
    getSongs('songs').then(songs => {registerSongs(_list3, songs)});
}

function init(){
    const query = new URLSearchParams(window.location.search).get('q');
    if(query) search(query);
    else getHome();
}