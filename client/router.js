const express = require('express');
const path = require('path');
const router = express.Router();

// Load documentation and provide locals.
const documentation = require('../documentation');
router.use((req, res, next) => {
    res.locals.availableDocumentation = Object.keys(documentation);
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
        res.locals.documentationHtml = document;
        res.render('documentation');
    } else next();
});
router.use('/documentation', express.static(path.join(__dirname, 'documentation')));

// Export the router.
module.exports = router;
