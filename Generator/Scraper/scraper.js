const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require("fs");

getSharingBlogs().then(urls => {
    const promises = [];
    for (i = 0; i < urls.length; i++) {
        promises.push(scrapeBlog(urls[i], i));
    }
    processUrls(promises);
}).catch(err => {
    console.log(err);
});

function processUrls(promises) {
    Promise.all(promises)
        .then(function (values) {
            var nlText= '';
            var enText = '';
            for (i = 0; i < values.length; i++) {
                const text = values[i];
                // Geen zin om tekst bestanden zelf in te delen, als 'de' en 'het' in de tekst staan is het vast wel Nederlands.
                if (text.match(new RegExp("\\b" + "de" + "\\b")) != null && text.match(new RegExp("\\b" + "het" + "\\b")) != null) {
                    nlText += text;
                } else {
                    enText += text;
                }
            }
            fs.writeFileSync('nl.txt', nlText);
            fs.writeFileSync('en.txt', enText);
        }).catch(function (err) {
            console.log(err);
        });
}

async function scrapeBlog(url, index) {
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    // Pfff, rate limiting.
    await wait(index*1000);

    return request(options)
        .then(($) => {
            let text = $('.content-holder').text();
            return processText(text);
        })
        .catch((err) => {
            console.log('Failed to scrape Sharing Blog: ', err);
            return '';
        });
}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function processText(text) {
    text = text.replace(/(^[ \t]*\n)/gm, "");
    text = text.replace(/[\n\r\s\t]+/g, ' ');
    text = text.replace(/\.(\s+)/g, "\n");
    text = text.replace(/\?(\s+)/g, "\n");
    text = text.trim();
    return text;
}

function getSharingBlogs() {
    const options = {
        uri: 'https://sharing.luminis.eu/wp-json/wp/v2/content?per_page=500',
        method: 'GET',
        json: true
    };

    return request(options)
        .then(response => {
            const urls = [];
            for (i = 0; i < response.length; i++) {
                urls.push(response[i].link);
            }
            console.log(urls);
            return urls;
        })
        .catch((err) => {
            console.log(err);
            return [];
        });
}