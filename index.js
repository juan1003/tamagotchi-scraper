const express = require("express");
const logger = require("morgan")('common');
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(logger);

async function scrapeTamagortchiPage(){
    const response = await axios.get("https://tamagotchi.com/meet-the-characters/");
    const html = response.data;
    const $ = cheerio.load(html);
    const tamagotchiList = $(".character").children();
    const babies = tamagotchiList.toArray();
    const ids = [];
    babies.forEach(baby => ids.push(baby.attribs.id));
    const filteredIds = ids.filter(id => id !== undefined);
    const scrapedTamas = []
    filteredIds.forEach(id => {
        const tamagotchiImg = $(`#${id}`).children('img');
        const tamagotchiName = $(`#${id}`).children('h4');
        const tamagotchiDesc = $(`#${id}`).children('p');
        scrapedTamas.push({id: id, img: tamagotchiImg.attr('src'), name: tamagotchiName.text(), desc: tamagotchiDesc.html(), likes: tamagotchiDesc.last().text()});
    });
    return scrapedTamas;
}

app.get('/', function(req, res) {
    res.sendFile(path.join('/index.html'));
});

app.get('/tamas', async function(req, res) {
    const tamas = await scrapeTamagortchiPage();
    res.json(tamas);
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
