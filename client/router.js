const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load documentation and provide locals.
const version = require('../package.json').version;
const documentation = require('../helpers/loadDocumentation');
router.use((req, res, next) => {
    res.locals.version = version;
    res.locals.path = req.path;
    res.locals.availableDocumentation = Object.keys(documentation).sort();
    next();
});

// Serve homepage.
router.get('/', (req, res) => {
    res.render('home');
});

// Serve documentation.
router.get('/documentation', (req, res) => res.redirect('/'));
router.get('/documentation/:document', (req, res, next) => {
    let documentName = req.params.document;
    let document = documentation[documentName];
    if (document) {
        res.locals.document = document;
        res.render('documentation');
    } else next();
});
router.use('/documentation', express.static(path.join(__dirname, 'documentation')));

// Serve character sheets.
router.get('/character/:id?', (req, res, next) => {
    let characterId = req.params.id || 'blank';
    fs.readFile(path.join(__dirname, '..', 'characters', `${characterId}.json`), 'utf8', (error, contents) => {
        if (error) return next(createError(404));
        try{
            res.locals.character = JSON.parse(contents);
        }
        catch(error) {
            next(createError(error));
            return;
        }
        res.render('character-sheet');
    });
});

// Export the router.
module.exports = router;
