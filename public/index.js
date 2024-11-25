const offline_mode = false;

function $(selector){return document.querySelector(selector)};
function $_(id){return document.getElementById(id)};
function $$(selector){return document.querySelectorAll(selector)};
function $$_(selector){return Array.from(document.querySelectorAll(selector))};

let user = localStorage.getItem('user') || null;

const audio = document.querySelector('audio');
const sectionTemp = $_('section-template')
const songTemp = $_('song-card-template');
const queueTemp = $_('song-template');

let audioQueue = []; // audio queue (Song[])
let currentAudio = -1; // -1: not playing, 0~: playing index
let isPlaying = false; // is audio playing
let isMuted = false; // is audio muted
let isLooped = false; // is audio looped
let isShuffled = false; // is audio shuffled
let volume = 0.5; // audio volume
let currentTime = 0; // audio current time (seconds)
let duration = 0; // audio duration (seconds)

audio.addEventListener('loadedmetadata', e => {
    duration = audio.duration;
    updateAudioLoaded();
});
audio.addEventListener('error', e => {
    console.error(e);
    nextAudio();
});
audio.addEventListener('pause', e => {
    isPlaying = false;
    updateAudioButtons();
    updateListStates();
});
audio.addEventListener('play', e => {
    isPlaying = true;
    updateAudioButtons();
    updateListStates();
});
audio.addEventListener('ended', e => nextAudio());
audio.addEventListener('timeupdate', e => {
    currentTime = audio.currentTime;
    updateAudioProgress();
});

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
            if(audioQueue.findIndex(s => s.videoId == song.videoId) == -1){
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
                    audioQueue.splice(currentAudio + 1, 0, songData);
                    currentAudio++;
                    playAudio();
                    updateList();
                });
            } else if(currentAudio == audioQueue.findIndex(s => s.videoId == song.videoId)){
                if(isPlaying){
                    pauseAudio();
                } else {
                    resumeAudio();
                }
                updateList();
            } else {
                currentAudio = audioQueue.findIndex(s => s.videoId == song.videoId);
                playAudio();
                updateList();
            }
        })
        plusElement.addEventListener('click', e => {
            if(audioQueue.findIndex(s => s.videoId == song.videoId) == -1){
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
                    audioQueue.push(songData);
                    updateList();
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

function createListCard(songData){
    const clone = queueTemp.content.cloneNode(true);
    const mainElement = clone.getElementById('song-main');
    const imgElement = clone.getElementById('song-img');
    const titleElement = clone.getElementById('song-title');
    const artistElement = clone.getElementById('song-artist');
    const durationElement = clone.getElementById('song-duration');
    const playElement = clone.getElementById('song-play');
    const removeElement = clone.getElementById('song-remove');
    const downloadElement = clone.getElementById('song-download');
    playElement.addEventListener('click', e => {
        if(currentAudio == audioQueue.findIndex(s => s.videoId == songData.videoId)){
            if(isPlaying){
                pauseAudio();
            } else {
                resumeAudio();
            }
        } else {
            currentAudio = audioQueue.findIndex(s => s.videoId == songData.videoId);
            playAudio();
        }
    })
    removeElement.addEventListener('click', e => {
        if(currentAudio == audioQueue.findIndex(s => s.videoId == songData.videoId)){
            resetAudio();
        }
        audioQueue = audioQueue.filter(s => s.videoId != songData.videoId);
        updateList();
    })
    downloadElement.addEventListener('click', e => {
        downloadElement.innerHTML = `<i class="fa fa-spinner"></i>`;
        downloadAudio(songData.videoId, songData.title).then(() => {
            downloadElement.innerHTML = `<i class="fa fa-download"></i>`;
        });
    })
    mainElement.setAttribute('data-id', songData.videoId);
    imgElement.style.backgroundImage = `url(${songData.thumbnail || "https://via.placeholder.com/160"})`;
    titleElement.textContent = parseTitle(songData.title) || "Title";
    artistElement.textContent = songData.artist || "Artist";
    durationElement.textContent = parseTime(songData.seconds) || "00:00";
    return clone;
}

function updateList(){
    const list = $_('playlist');
    list.innerHTML = '';
    audioQueue.forEach(songData => {
        list.appendChild(createListCard(songData));
    });
    updateListStates();
}

function updateListStates(){
    if(currentAudio == -1) return;
    $$_(".song").forEach((song, i) => {
        const activated = song.getAttribute('data-id') == audioQueue[currentAudio].videoId;
        song.classList.toggle('active', activated);
        song.querySelector('#song-play').innerHTML = activated ? (isPlaying ? `<i class="fa fa-pause"></i>` : `<i class="fa fa-play"></i>`) : `<i class="fa fa-play"></i>`;
    });
}

function playAudio(){
    if(currentAudio == -1) return;
    if(currentAudio >= audioQueue.length) currentAudio = audioQueue.length - 1;
    const song = audioQueue[currentAudio];
    if(!song) return;
    audio.src = song.url;
    audio.play();
    updateAudioElement();
}

function resetAudio(){
    currentAudio = -1;
    audio.pause();
    audio.src = '';
    updateAudioElement();
    updateList();
}

function resumeAudio(){
    audio.play();
}

function pauseAudio(){
    audio.pause();
}

function nextAudio(buttoned = false){
    if(currentAudio == -1) return;
    if(!buttoned && isShuffled){
        currentAudio = Math.floor(Math.random() * audioQueue.length);
    } else {
        if((isLooped && currentAudio == audioQueue.length - 1) || buttoned){
            currentAudio = (currentAudio + 1) % audioQueue.length;
        } else if(currentAudio < audioQueue.length - 1){
            currentAudio++;
        } else {
            pauseAudio();
            return;
        }
    }
    playAudio();
    updateList();
}

function prevAudio(buttoned = false){
    if(currentAudio == -1) return;
    if(!buttoned && isShuffled){
        currentAudio = Math.floor(Math.random() * audioQueue.length);
    } else {
        currentAudio = (currentAudio - 1 + audioQueue.length) % audioQueue.length;
    }
    playAudio();
    updateList();
}

function updateAudioElement(){
    if(currentAudio == -1) return;
    const currentSongData = audioQueue[currentAudio];
    $_('player-title').textContent = parseTitle(currentSongData.title) || "Title";
    $_('player-artist').textContent = currentSongData.artist || "Artist";
    $_('player-img').style.backgroundImage = `url(${currentSongData.thumbnail || "https://via.placeholder.com/160"})`;
    updateAudioButtons();
}

function updateAudioButtons(){
    $_('player-loop').classList.toggle('active', isLooped);
    $_('player-shuffle').classList.toggle('active', isShuffled);
    $_('player-play').innerHTML = isPlaying ? `<i class="fa fa-pause"></i>` : `<i class="fa fa-play"></i>`;
}

function updateAudioLoaded(){
    $_('player-duration').textContent = parseTime(duration);
    updateAudioButtons();
}

function updateAudioProgress(){
    $_('player-progress-bar-fill').style.width = `${(currentTime / duration) * 100}%`;
    $_('player-current-time').textContent = parseTime(currentTime);
}

function parseTime(seconds){
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function parseTitle(title) {
    let quoteMatch = title.match(/['"‘’“”](.*?)['"‘’“”]/);
    if (quoteMatch) return quoteMatch[1].trim();
    
    let dashMatch = title.match(/^(.*?)-\s*(.*?)\s*(?:\(|$)/);
    if (dashMatch) return dashMatch[2].trim();
    
    let parenMatch = title.match(/^(.*?)\s*\(.*?\)/);
    if (parenMatch) return parenMatch[1].trim();
    
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

async function downloadAudio(id, title) {
    const downloadUrl = `/download?id=${id}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${parseTitle(title) || "Title"}.mp3`; // 기본 파일 이름 설정
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function search(query){
    if(query.trim() == '') return;
    cleanMain();
    const [sect, list] = createSection('Search Results')
    getSongs(query || 'music').then(songs => {registerSongs(list, songs)})
}

function updateVolume(){
    audio.volume = volume;
    $_('player-volume-bar-fill').style.height = `${volume * 100}%`;
    $_('player-volume-icon').className = `fa fa-volume-${volume == 0 ? 'off' : volume < 0.5 ? 'down' : 'up'}`;
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

$_('player-volume-controller').style.animation = 'slideOutBottom 0s forwards';
$_('player-volume').addEventListener('mouseenter', e => {
    $_('player-volume-controller').style.animation = 'slideInBottom 0.2s forwards'
})
$_('player-volume-controller').addEventListener('mouseenter', e => {
    $_('player-volume-controller').style.animation = 'slideInBottom 0s forwards'
})
$_('player-volume').addEventListener('mouseleave', e => {
    $_('player-volume-controller').style.animation = 'slideOutBottom 0.2s forwards'
})
$_('player-volume-controller').addEventListener('mouseleave', e => {
    $_('player-volume-controller').style.animation = 'slideOutBottom 0.2s forwards'
})

$_('tab-background').style.animation = 'tabBgOut 0s forwards';
$_('tab-layout-main').style.animation = 'tabOut 0s forwards';
$_('menu-btn').addEventListener('click', e => {
    $_('tab-background').style.animation = 'tabBgIn 0.2s forwards';
    $_('tab-layout-main').style.animation = 'tabIn 0.2s forwards';
})
$_('tab-background').addEventListener('mousedown', e => {
    if(e.target === e.currentTarget){
        $_('tab-background').style.animation = 'tabBgOut 0.2s forwards';
        $_('tab-layout-main').style.animation = 'tabOut 0.2s forwards';
    }
})

updateVolume();

$_('player-volume-bar').addEventListener('mousedown', e => {
    const rect = $_('player-volume-bar').getBoundingClientRect();
    volume = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
    updateVolume();
})
$_('player-volume-bar').addEventListener('mousemove', e => {
    if(e.buttons == 1){
        const rect = $_('player-volume-bar').getBoundingClientRect();
        volume = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
        updateVolume();
    }
})
$_('player-volume').addEventListener('click', e => {
    volume = volume == 0 ? 0.5 : 0;
    updateVolume();
})

$_('player-progress-bar').addEventListener('mousedown', e => {
    const rect = $_('player-progress-bar').getBoundingClientRect();
    const progress = (e.clientX - rect.left) / rect.width;
    audio.currentTime = progress * duration;
});
$_('player-progress-bar').addEventListener('mousemove', e => {
    if(e.buttons == 1){
        const rect = $_('player-progress-bar').getBoundingClientRect();
        const progress = (e.clientX - rect.left) / rect.width;
        audio.currentTime = progress * duration;
    }
});

$_('player-play').addEventListener('click', e => {
    if(isPlaying){
        pauseAudio();
    } else {
        resumeAudio();
    }
})

$_('player-next').addEventListener('click', e => nextAudio(true));
$_('player-prev').addEventListener('click', e => prevAudio(true));
$_('player-loop').addEventListener('click', e => {
    isLooped = !isLooped;
    updateAudioButtons();
})
$_('player-shuffle').addEventListener('click', e => {
    isShuffled = !isShuffled;
    updateAudioButtons();
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

function getHome(){
    cleanMain();
    
    const [_sect, _list] = createSection('Recently');
    getSongs('recently music').then(songs => {registerSongs(_list, songs)});
    
    const [_sect2, _list2] = createSection('KPOP');
    getSongs('kpop music').then(songs => {registerSongs(_list2, songs)});
    
    const [_sect3, _list3] = createSection('Popular');
    getSongs('songs').then(songs => {registerSongs(_list3, songs)});
}
getHome();

$_('search-inp').addEventListener('keydown', e => e.code === 'Enter' ? search($_('search-inp').value) : null)
$_('search-btn').addEventListener('click', e => search($_('search-inp').value))

$_('tab-home').addEventListener('click', e => {
    $_('tab-background').style.animation = 'tabBgOut 0.2s forwards';
    $_('tab-layout-main').style.animation = 'tabOut 0.2s forwards';
    getHome();
})
