const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataFile = process.env.WEBSITE_SITE_NAME 
    ? '/home/data.json' 
    : path.join(__dirname, 'data.json');

    console.log("Dosya şu yola kaydediliyor: ", dataFile);

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({}));
}

app.get('/api/comments', (req, res) => {
    const data = fs.readFileSync(dataFile, 'utf8');
    res.json(JSON.parse(data));
});

// YENİ: Hem yazıyı hem de kişiye özel ismi kaydet
app.post('/api/comments', (req, res) => {
    const { author, target, text, nickname,stats } = req.body;
    let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    if (!data[target]) {
        data[target] = {};
    }
    
    // Eski veriler string ise bozulmasın diye obje formatına çeviriyoruz
    if (typeof data[target][author] === 'string') {
        data[target][author] = { text: data[target][author], nickname: "" };
    } else if (!data[target][author]) {
        data[target][author] = { text: "", nickname: "" };
    }

    // Gelen verileri kaydet
    data[target][author].text = text;
    data[target][author].nickname = nickname;
    data[target][author].stats = stats;

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});