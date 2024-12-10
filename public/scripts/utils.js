function $(selector){return document.querySelector(selector)};
function $_(id){return document.getElementById(id)};
function $$(selector){return document.querySelectorAll(selector)};
function $$_(selector){return Array.from(document.querySelectorAll(selector))};
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
async function getSongs(text) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const filter = settings.filterOnlyMusic || 'true';
    const response = await fetch(`/search?q=${text}&filter=${filter}`);
    const data = await response.json();
    return data.videos;
}
async function getAudioUrl(id) {
    const response = await fetch(`/audio?id=${id}`);
    const data = await response.json();
    return data.audioUrl;
}
async function getAudioBlob(videoId) {
    const response = await fetch(`/file?id=${videoId}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
}
async function getVideoBlob(videoId) {
    const response = await fetch(`/filevid?id=${videoId}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
}
async function downloadAudio(id, title) {
    const downloadUrl = `/file?id=${id}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${parseTitle(title) || "Title"}.mp3`; // 기본 파일 이름 설정
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
async function downloadVideo(id, title) {
    const dUrl = `/filevid?id=${id}`;
    const a = document.createElement('a');
    a.href = dUrl;
    a.download = `${parseTitle(title) || "Title"}.mp4`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
async function login(name, pass) {
    const res = await fetch(`/login?name=${name}&pass=${pass}`)
    const json = res.json();
    return json;
}
async function register(name, pass) {
    const res = await fetch(`/register?name=${name}&pass=${pass}`)
    const json = res.json();
    return json;
}
async function getUser(id){
    const res = await fetch(`/getUser?id=${id}`)
    const json = await res.json()
    return json.user;
}