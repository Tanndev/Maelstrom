/*
 * Copyright (c) 2018 James Tanner
 */
const fs = require('fs');
const Marked = require('marked');
const path = require('path');
const Toc = require('markdown-toc');

const DOCUMENTATION_EXTENSION = '.md';
const DOCUMENTATION_DIRECTORY = path.join(__dirname, '../documentation');

const documentation = {};

fs.readdir(DOCUMENTATION_DIRECTORY, "utf8", (error, files) => {
    if (error) console.error(error);
    else files.sort().forEach(file => {
        if (path.extname(file) !== DOCUMENTATION_EXTENSION) return;
        let filename = path.basename(file, DOCUMENTATION_EXTENSION);
        documentation[filename] = new Documentation(path.join(DOCUMENTATION_DIRECTORY, file));
    })
});

class Documentation {
    constructor(filepath) {
        this.filepath = filepath;
        this.reload()
            .then(() => this.loaded = true)
            .catch(error => console.log(error));
    }

    reload() {
        return new Promise((resolve, reject) => {
            this.loaded = false;
            fs.readFile(this.filepath, 'utf8', (error, documentContents) => {
                if (error) reject(error);
                else try {
                    // noinspection JSUnusedGlobalSymbols
                    let toc = Toc(documentContents, {
                        maxdepth: 4,
                        slugify: (header) => header.toLowerCase().replace(/[^\w]+/g, '-')
                    });
                    this.contentMd = documentContents;
                    this.contentHtml = Marked(documentContents);
                    this.tocJson = toc.json;
                    this.tocHtml = Marked(toc.content);
                }
                catch (error){
                    reject(error);
                    return;
                }
                resolve();
            })
        });
    }
}

module.exports = documentation;
