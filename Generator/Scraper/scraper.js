const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require("fs");

getBlogs().then(urls => {
    const promises = [];
    for (i = 0; i < urls.length; i++) {
        if (urls[i] === '#') continue;
        promises.push(scrapeArnhemBlog(urls[i]));

        let sharingUrl = urls[i];
        sharingUrl = sharingUrl.replace("https://arnhem.luminis.eu/", "");
        sharingUrl = "https://sharing.luminis.eu/blog/" + sharingUrl;
        promises.push(scrapeSharingBlog(sharingUrl));
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
                if (text.match(new RegExp("\\b" + "the" + "\\b")) != null) {
                    enText += text;
                } else {
                    nlText += text;
                }
            }
            fs.writeFileSync('nl.txt', nlText);
            fs.writeFileSync('en.txt', enText);
        }).catch(function (err) {
            console.log(err);
        });
}

function scrapeSharingBlog(url) {
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options)
        .then(($) => {
            let text = $('.content-holder').text();
            return processText(text);
        })
        .catch((err) => {
            console.log('Failed to scrape Sharing Blog: ', url);
            return '';
        });
}

function scrapeArnhemBlog(url) {
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options)
        .then(($) => {
            $('.ssba').remove();
            $('.blog-footer').remove();
            let text = $('.entry-content').text();
            return processText(text);
        })
        .catch((err) => {
            console.log('Failed to scrape Arnhem Blog: ', url);
            return '';
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

function getBlogs() {
    const options = {
        uri: 'https://arnhem.luminis.eu/blog/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options)
        .then(($) => {
            let urls = [];
            $('.blog-more a').each(function(i, value) {
                urls.push($(value).attr('href'));
            });
            return urls;
        })
        .catch((err) => {
            console.log(err);
            return [];
        });
}