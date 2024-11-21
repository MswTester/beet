const express = require('express');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const path = require('path')

const app = express();
const port = 3000;

// html
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'))})
app.get('/song', (req, res) => {res.sendFile(path.join(__dirname, 'song.html'))})
app.get('/profile', (req, res) => {res.sendFile(path.join(__dirname, 'profile.html'))})

// public
app.use('/', express.static(path.join(__dirname, 'public')))

function filterOnlyAudio(videos){
    return videos
    .filter(v => v)
    .filter(v => !v.title.match(/(instrumental|karaoke|live|acoustic)/i))
    .filter(v => v.title.match(/\b(official|lyric|audio|mv|music video|m\/v|song|official video|feat\.)\b/i))
    .filter(v => v.seconds < 1000 && v.seconds > 30)
    .sort((a, b) => b.views - a.views);
}

// 오디오 Search API
app.get('/search', async (req, res) => {
    const query = req.query.q; // 검색어
    if (!query) return res.status(400).json({ error: 'Query is required' });
    try{
        const result = yts({
            query: query,
            category: 'music',
            pages: 2,
        });
        const vids = filterOnlyAudio((await result).videos);
        res.json({ videos: vids });
    } catch (error) {
        console.error('Error fetching audio URL:', error);
        res.status(500).json({ error: 'Failed to fetch audio URL' });
    }
});

// 오디오 URL API
app.get('/audio', async (req, res) => {
    const videoId = req.query.id; // 비디오 ID
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

    try {
        const info = await ytdl.getInfo(videoId);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        res.json({ audioUrl: format.url }); // 오디오 스트림 URL 반환
    } catch (error) {
        console.error('Error fetching audio URL:', error);
        res.status(500).json({ error: 'Failed to fetch audio URL' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
