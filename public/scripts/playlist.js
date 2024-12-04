const audio = new Audio();
document.body.appendChild(audio);
audio.crossOrigin = 'anonymous';
audio.preload = 'metadata';
audio.autoplay = false;
audio.loop = false;
audio.controls = false;
audio.style.display = 'none';

let _audioQueue = []; // audio queue (Song[])
let _currentAudio = -1; // -1: not playing, 0~: playing index
let _isPlaying = false; // is audio playing
let _isLooped = false; // is audio looped
let _volume = 0.5; // audio volume (0~1)
let _isShuffled = false; // is audio shuffled
let _currentTime = 0; // audio current time (seconds)
let _duration = 0; // audio duration (seconds)

audio.addEventListener('loadedmetadata', e => {
    _duration = audio.duration;
    updateAudioLoaded();
});
audio.addEventListener('error', e => {
    console.error(e);
    nextAudio();
});
audio.addEventListener('pause', e => {
    _isPlaying = false;
    updateAudioButtons();
    updateListStates();
});
audio.addEventListener('play', e => {
    _isPlaying = true;
    updateAudioButtons();
    updateListStates();
});
audio.addEventListener('ended', e => nextAudio());
audio.addEventListener('timeupdate', e => {
    _currentTime = audio.currentTime;
    updateAudioProgress();
});

function createListCard(songData){
    const clone = $_('song-template').content.cloneNode(true);
    const mainElement = clone.getElementById('song-main');
    const imgElement = clone.getElementById('song-img');
    const titleElement = clone.getElementById('song-title');
    const artistElement = clone.getElementById('song-artist');
    const durationElement = clone.getElementById('song-duration');
    const playElement = clone.getElementById('song-play');
    const removeElement = clone.getElementById('song-remove');
    const downloadElement = clone.getElementById('song-download');
    const videoElement = clone.getElementById('song-video')
    playElement.addEventListener('click', e => {
        if(_currentAudio == _audioQueue.findIndex(s => s.videoId == songData.videoId)){
            if(_isPlaying){
                pauseAudio();
            } else {
                resumeAudio();
            }
        } else {
            _currentAudio = _audioQueue.findIndex(s => s.videoId == songData.videoId);
            playAudio();
        }
    })
    removeElement.addEventListener('click', e => {
        const idx = _audioQueue.findIndex(s => s.videoId == songData.videoId)
        if(_currentAudio == idx){
            resetAudio();
        } else if (_currentAudio > idx){
            _currentAudio --
        }
        _audioQueue = _audioQueue.filter(s => s.videoId != songData.videoId);
        updateList();
    })
    downloadElement.addEventListener('click', e => {
        downloadElement.innerHTML = `<i class="fa fa-spinner"></i>`;
        downloadAudio(songData.videoId, songData.title).then(() => {
            downloadElement.innerHTML = `<i class="fa fa-download"></i>`;
        });
    })
    videoElement.addEventListener('click', e => {
        videoElement.innerHTML = `<i class="fa fa-spinner"></i>`;
        downloadVideo(songData.videoId, songData.title).then(() => {
            videoElement.innerHTML = `<i class="fa fa-film"></i>`;
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
    const list = $_('playlist-panel');
    list.innerHTML = '';
    _audioQueue.forEach(songData => {
        list.appendChild(createListCard(songData));
    });
    updateListStates();
}

function updateListStates(){
    if(_currentAudio == -1) return;
    $$_(".song").forEach((song, i) => {
        const activated = song.getAttribute('data-id') == _audioQueue[_currentAudio].videoId;
        song.classList.toggle('active', activated);
        song.querySelector('#song-play').innerHTML = activated ? (_isPlaying ? `<i class="fa fa-pause"></i>` : `<i class="fa fa-play"></i>`) : `<i class="fa fa-play"></i>`;
    });
}

function playAudio(){
    if(_currentAudio == -1) return;
    if(_currentAudio >= _audioQueue.length) _currentAudio = _audioQueue.length - 1;
    const song = _audioQueue[_currentAudio];
    if(!song) return;
    audio.src = song.url;
    audio.play();
    updateAudioElement();
}

function resetAudio(){
    _currentAudio = -1;
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
    if(_currentAudio == -1) return;
    if(!buttoned && _isShuffled){
        let cur = Math.floor(Math.random() * _audioQueue.length);
        while(cur == _currentAudio){
            cur = Math.floor(Math.random() * _audioQueue.length);
        }
        _currentAudio = cur
    } else {
        if((_isLooped && _currentAudio == _audioQueue.length - 1) || buttoned){
            _currentAudio = (_currentAudio + 1) % _audioQueue.length;
        } else if(_currentAudio < _audioQueue.length - 1){
            _currentAudio++;
        } else {
            pauseAudio();
            return;
        }
    }
    playAudio();
    updateList();
}

function prevAudio(buttoned = false){
    if(_currentAudio == -1) return;
    if(!buttoned && _isShuffled){
        _currentAudio = Math.floor(Math.random() * _audioQueue.length);
    } else {
        _currentAudio = (_currentAudio - 1 + _audioQueue.length) % _audioQueue.length;
    }
    playAudio();
    updateList();
}

function updateAudioElement(){
    if(_currentAudio == -1) return;
    const currentSongData = _audioQueue[_currentAudio];
    $_('player-title').textContent = parseTitle(currentSongData.title) || "Title";
    $_('player-artist').textContent = currentSongData.artist || "Artist";
    $_('player-img').style.backgroundImage = `url(${currentSongData.thumbnail || "https://via.placeholder.com/160"})`;
    updateAudioButtons();
}

function updateAudioButtons(){
    $_('player-loop').classList.toggle('active', _isLooped);
    $_('player-shuffle').classList.toggle('active', _isShuffled);
    $_('player-play').innerHTML = _isPlaying ? `<i class="fa fa-pause"></i>` : `<i class="fa fa-play"></i>`;
}

function updateAudioLoaded(){
    $_('player-duration').textContent = parseTime(_duration);
    updateAudioButtons();
}

function updateAudioProgress(){
    $_('player-progress-bar-fill').style.width = `${(_currentTime / _duration) * 100}%`;
    $_('player-current-time').textContent = parseTime(_currentTime);
}

function playSong(songData){
    _audioQueue.splice(_currentAudio + 1, 0, songData);
    _currentAudio++;
    playAudio();
    updateList();
}

function playInPlaylist(videoId){
    if(isCurrent(videoId)){
        if(_isPlaying){
            pauseAudio();
        } else {
            resumeAudio();
        }
        updateList();
    } else {
        _currentAudio = _audioQueue.findIndex(s => s.videoId == videoId);
        playAudio();
        updateList();
    }
}

function addSong(songData){
    _audioQueue.push(songData);
    updateList();
}

function isInPlaylist(videoId){
    return _audioQueue.findIndex(s => s.videoId == videoId) != -1
}

function isCurrent(videoId){
    return _currentAudio == _audioQueue.findIndex(s => s.videoId == videoId)
}

function updateVolume(){
    audio.volume = _volume;
    $_('player-volume-bar-fill').style.height = `${_volume * 100}%`;
    $_('player-volume-icon').className = `fa fa-volume-${_volume == 0 ? 'off' : _volume < 0.5 ? 'down' : 'up'}`;
}

function initPlaylist(){
    updateVolume();
    
    $_('player-volume-bar').addEventListener('mousedown', e => {
        const rect = $_('player-volume-bar').getBoundingClientRect();
        _volume = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
        updateVolume();
    })
    $_('player-volume-bar').addEventListener('mousemove', e => {
        if(e.buttons == 1){
            const rect = $_('player-volume-bar').getBoundingClientRect();
            _volume = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
            updateVolume();
        }
    })
    $_('player-volume').addEventListener('click', e => {
        _volume = _volume == 0 ? 0.5 : 0;
        updateVolume();
    })
    
    $_('player-progress-bar').addEventListener('mousedown', e => {
        if(_currentAudio != -1){
            const rect = $_('player-progress-bar').getBoundingClientRect();
            const progress = (e.clientX - rect.left) / rect.width;
            audio.currentTime = progress * _duration;
        }
    });
    $_('player-progress-bar').addEventListener('mousemove', e => {
        if(e.buttons == 1 && _currentAudio != -1){
            const rect = $_('player-progress-bar').getBoundingClientRect();
            const progress = (e.clientX - rect.left) / rect.width;
            audio.currentTime = progress * _duration;
        }
    });
    
    $_('player-play').addEventListener('click', e => {
        if(_currentAudio != -1){
            if(_isPlaying){
                pauseAudio();
            } else {
                resumeAudio();
            }
        }
    })
    
    $_('player-next').addEventListener('click', e => _currentAudio != -1 ? nextAudio(true) : null);
    $_('player-prev').addEventListener('click', e => _currentAudio != -1 ? prevAudio(true) : null);
    $_('player-loop').addEventListener('click', e => {
        _isLooped = !_isLooped;
        updateAudioButtons();
    })
    $_('player-shuffle').addEventListener('click', e => {
        _isShuffled = !_isShuffled;
        updateAudioButtons();
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
}