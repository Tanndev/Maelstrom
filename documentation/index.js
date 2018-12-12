/*
 * Copyright (c) 2018 James Tanner
 */
const fs = require('fs');
const Marked = require('marked');
const path = require('path');
const Toc = require('markdown-toc');

const DOCUMENTATION_EXTENSION = '.md';
const documentation = {};

fs.readdir(__dirname, "utf8", (error, files) => {
    if (error) console.error(error);
    else files.forEach(file => {
        if (path.extname(file) !== DOCUMENTATION_EXTENSION) return;
        fs.readFile(path.join(__dirname, file), 'utf8', (error, documentContents) => {
            if (error) console.error(error);
            else {
                // noinspection JSUnusedGlobalSymbols
                let toc = Toc(documentContents, {
                    maxdepth: 5,
                    slugify: (header) => header.toLowerCase().replace(/[^\w]+/g, '-')
                });
                // noinspection JSUnresolvedVariable
                documentation[path.basename(file, DOCUMENTATION_EXTENSION)] = {
                    contentMd: documentContents,
                    contentHtml: Marked(documentContents),
                    tocJson: toc.json,
                    tocHtml: Marked(toc.content),
                };
            }
        })
    })
});

module.exports = documentation;
