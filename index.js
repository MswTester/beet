const express = require('express');
const { MongoClient } = require('mongodb');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const path = require('path')

const app = express();
const port = 3000;
const uri = process.env.MONGODB_URI || "mongodb+srv://realtime:EhcTmV54vQFH0AXq@cluster0.qo3ekyu.mongodb.net/";

// MongoDB 연결
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect().then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection failed:', err);
});

// User API
app.get('/login', (req, res) => {
    const { name, pass } = req.query;
    const collection = client.db('beet').collection('users');
    collection.findOne({ name, pass }).then(user => {
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }).catch(err => {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    });
});

app.get('/register', (req, res) => {
    const { name, pass } = req.query;
    const collection = client.db('beet').collection('users');
    collection.findOne({ name }).then(user => {
        if (user) {
            res.status(409).json({ error: 'User already exists' });
        } else {
            const _new = {
                id: new Date().getTime().toString(16),
                name,
                pass,
                playlists: [], // { name: string, songs: string[] }
                following: [], // user ids
            }
            collection.insertOne(_new).then(result => {
                res.json({ result, user: _new });
            }).catch(err => {
                console.error('Error registering user:', err);
                res.status(500).json({ error: 'Failed to register user' });
            });
        }
    }).catch(err => {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    });
});

// html 라우팅
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'))})
app.get('/song', (req, res) => {res.sendFile(path.join(__dirname, 'song.html'))})
app.get('/profile', (req, res) => {res.sendFile(path.join(__dirname, 'profile.html'))})
app.get('/test', (req, res) => {res.sendFile(path.join(__dirname, 'test.html'))})

// public 설정
app.use('/public', express.static(path.join(__dirname, 'public')))

// CORS 설정
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Cookie 설정
const cookies = [{"domain":".youtube.com","expirationDate":1766804871.736335,"hostOnly":false,"httpOnly":false,"name":"PREF","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"f4=4000000&f6=40000000&tz=Asia.Seoul&f7=100&f5=20000","index":0,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.45826,"hostOnly":false,"httpOnly":false,"name":"SID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"g.a000qAgnxuAhEacF0amk4unKAzjjJIjelqymuDjKT31prE6CX51uDstyeMEU0Uj1d7qofhde5wACgYKAQwSARESFQHGX2MidSFdJysnyBFvb5z7mFIh9RoVAUF8yKpDdDMGx3Ec_Wt5bki775gr0076","index":1,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458497,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"g.a000qAgnxuAhEacF0amk4unKAzjjJIjelqymuDjKT31prE6CX51u95vPmIJEkfoLJIFh8BHOwQACgYKAbsSARESFQHGX2MiRBIgLaW9KzLm-GzuiRL1yhoVAUF8yKo89EaevPFyfm1R0NbuYY2g0076","index":2,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458528,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"g.a000qAgnxuAhEacF0amk4unKAzjjJIjelqymuDjKT31prE6CX51uwpC-2je3sRZWt8ZyW7vhQQACgYKAbASARESFQHGX2MiB-mUxk7rjZOGwPjvx1jdNRoVAUF8yKqqlQgLxX8J9xhpdj4tINqp0076","index":3,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458552,"hostOnly":false,"httpOnly":true,"name":"HSID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"AHOl4kA9bPs8wM-OJ","index":4,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.45858,"hostOnly":false,"httpOnly":true,"name":"SSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AzbR3IOpF4pQT98tn","index":5,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458607,"hostOnly":false,"httpOnly":false,"name":"APISID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"M0LhY2t_zwJvMod8/ARS1902nSkcec0S_q","index":6,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458634,"hostOnly":false,"httpOnly":false,"name":"SAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"aT9l5fJ_rUPkWaws/AaZZorWMRlFz5DKb8","index":7,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458667,"hostOnly":false,"httpOnly":false,"name":"__Secure-1PAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"aT9l5fJ_rUPkWaws/AaZZorWMRlFz5DKb8","index":8,"isSearch":false},{"domain":".youtube.com","expirationDate":1765936728.458695,"hostOnly":false,"httpOnly":false,"name":"__Secure-3PAPISID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"aT9l5fJ_rUPkWaws/AaZZorWMRlFz5DKb8","index":9,"isSearch":false},{"domain":".youtube.com","expirationDate":1766198307.151997,"hostOnly":false,"httpOnly":true,"name":"LOGIN_INFO","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AFmmF2swRQIhAK_SDo9XzihyzoFvY_CiHvQOMqn6UT-owk9Memd9WS6wAiADw3cU8k3Db28YLWEDQhmevRYZwcxFBND3BLTPSJwaIQ:QUQ3MjNmeTZSTWhhVlNwNFdVdGVWLUd2Y2s4MjVpal9oLXpsMS1BOU9WY3BIcmlwRkJrUzVzdTNRQ05mU3BXQ0ViQVZqdm9IbjVuMy1JbTFCU1hyanBYTHBuTVpXQl9ZelU4a2ZKOHNNZ1ZTV2h6SWotRHV0aVV4SUV5SVFycUFlbmFVa1lndU5FOGhKSXU3WXpEUDhGZjIwRjc3djFpcU9B","index":10,"isSearch":false},{"domain":".youtube.com","expirationDate":1763780565.189859,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDTS","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"sidts-CjEBQT4rX3w48GYeO3mcqKpJgXCL3KRFzR-QR3txysoF_V9LAgsl6MsFMumAgULZ0sOnEAA","index":11,"isSearch":false},{"domain":".youtube.com","expirationDate":1763780565.189951,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDTS","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"sidts-CjEBQT4rX3w48GYeO3mcqKpJgXCL3KRFzR-QR3txysoF_V9LAgsl6MsFMumAgULZ0sOnEAA","index":12,"isSearch":false},{"domain":".youtube.com","expirationDate":1732244876,"hostOnly":false,"httpOnly":false,"name":"ST-hcbf8d","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"session_logininfo=AFmmF2swRQIhAK_SDo9XzihyzoFvY_CiHvQOMqn6UT-owk9Memd9WS6wAiADw3cU8k3Db28YLWEDQhmevRYZwcxFBND3BLTPSJwaIQ%3AQUQ3MjNmeTZSTWhhVlNwNFdVdGVWLUd2Y2s4MjVpal9oLXpsMS1BOU9WY3BIcmlwRkJrUzVzdTNRQ05mU3BXQ0ViQVZqdm9IbjVuMy1JbTFCU1hyanBYTHBuTVpXQl9ZelU4a2ZKOHNNZ1ZTV2h6SWotRHV0aVV4SUV5SVFycUFlbmFVa1lndU5FOGhKSXU3WXpEUDhGZjIwRjc3djFpcU9B","index":13,"isSearch":false},{"domain":".youtube.com","expirationDate":1732244876,"hostOnly":false,"httpOnly":false,"name":"ST-tladcw","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"session_logininfo=AFmmF2swRQIhAK_SDo9XzihyzoFvY_CiHvQOMqn6UT-owk9Memd9WS6wAiADw3cU8k3Db28YLWEDQhmevRYZwcxFBND3BLTPSJwaIQ%3AQUQ3MjNmeTZSTWhhVlNwNFdVdGVWLUd2Y2s4MjVpal9oLXpsMS1BOU9WY3BIcmlwRkJrUzVzdTNRQ05mU3BXQ0ViQVZqdm9IbjVuMy1JbTFCU1hyanBYTHBuTVpXQl9ZelU4a2ZKOHNNZ1ZTV2h6SWotRHV0aVV4SUV5SVFycUFlbmFVa1lndU5FOGhKSXU3WXpEUDhGZjIwRjc3djFpcU9B","index":14,"isSearch":false},{"domain":".youtube.com","expirationDate":1732244877,"hostOnly":false,"httpOnly":false,"name":"ST-xuwub9","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"session_logininfo=AFmmF2swRQIhAK_SDo9XzihyzoFvY_CiHvQOMqn6UT-owk9Memd9WS6wAiADw3cU8k3Db28YLWEDQhmevRYZwcxFBND3BLTPSJwaIQ%3AQUQ3MjNmeTZSTWhhVlNwNFdVdGVWLUd2Y2s4MjVpal9oLXpsMS1BOU9WY3BIcmlwRkJrUzVzdTNRQ05mU3BXQ0ViQVZqdm9IbjVuMy1JbTFCU1hyanBYTHBuTVpXQl9ZelU4a2ZKOHNNZ1ZTV2h6SWotRHV0aVV4SUV5SVFycUFlbmFVa1lndU5FOGhKSXU3WXpEUDhGZjIwRjc3djFpcU9B","index":15,"isSearch":false},{"domain":".youtube.com","expirationDate":1763780874.404128,"hostOnly":false,"httpOnly":false,"name":"SIDCC","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"AKEyXzWhq-7v4_F7kYs9s98Usv5mGhqibyiLW7tXcrKiiI80ZMX6OO5ZLSNrgKLLBRsHZflcDbI","index":16,"isSearch":false},{"domain":".youtube.com","expirationDate":1763780874.404235,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDCC","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AKEyXzVjZ00CQqq2hdAoiyX6WZgOrGVj7jgkXUwZAJfVxyxVSAssY2a2dezXLnFXPRm5kcF5PA","index":17,"isSearch":false},{"domain":".youtube.com","expirationDate":1763780874.404363,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDCC","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AKEyXzXyOa2FMmbP0NYtD3B7zAyFvkwIyQ7DOb9XVn2RVjWFnPJ4bhfJ8Yl8Ybwqsb-VMcQwB1o","index":18,"isSearch":false}]
const agent = ytdl.createAgent(cookies);

// 비디오 필터링
function filterOnlyAudio(videos){
    return videos
    .filter(v => v)
    // 노래방, 라이브, 비트온리 필터
    .filter(v => !v.title.match(/(instrumental|karaoke|live|acoustic)/i))
    // 쇼츠 필터
    .filter(v => v.description)
    .filter(v => !v.image.match(/.+\_2\.jpg$/i))
    // 뮤직 키워드 필터
    .filter(v => v.title.match(/(official|lyric|audio|mv|music video|m\/v|song|official video|feat\.|music|song|remix)/gi)
    || v.description.match(/(official|lyric|audio|mv|music video|m\/v|song|official video|feat\.|music|song|remix|soundcloud|bandcamp)/gi)
    )
    // 영상 길이 필터
    .filter(v => v.seconds < 1000 && v.seconds > 30)
    // 조회수 내림차순 정렬
    .sort((a, b) => b.views - a.views);
};

// 오디오 Search API
app.get('/search', async (req, res) => {
    const query = req.query.q; // 검색어
    if (!query) return res.status(400).json({ error: 'Query is required' });
    try{
        const result = yts({
            query: query,
            category: 'music',
            pages: 3,
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
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });
    try {
        const info = await ytdl.getInfo(videoId, {agent});
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const audioUrl = format.url;
        res.json({ audioUrl });
    } catch (error) {
        console.error('Error fetching audio URL:', error);
        res.status(500).json({ error: 'Failed to fetch audio URL' });
    }
});

app.get('/download', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });
    try {
        res.setHeader('Content-Disposition', `attachment`);
        res.setHeader('Content-Type', 'audio/mpeg');
        // const info = await ytdl.getInfo(videoId, {agent});
        // ytdl.downloadFromInfo(info, {quality:"highestaudio"}).pipe(res);
        ytdl(videoId, { quality: 'highestaudio' }).pipe(res);
    } catch (error) {
        console.error('Error downloading audio:', error);
        res.status(500).json({ error: 'Failed to download audio' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;