const express = require('express');
const path = require('path');
const router = express.Router();

// Load documentation.
const documentation = require('../documentation');

// Serve homepage.
router.get('/', (req, res) => {
    res.render('home');
});

// Serve documentation.
router.get('/documentation/:document', (req, res, next) => {
    let documentName = req.params.document;
    let document = documentation[documentName];
    if (document) {
        res.locals.documentationHtml = document;
        res.render('documentation', {filename: documentName, cache: true});
    } else next();
});
router.use('/documentation', express.static(path.join(__dirname, 'documentation')));

// Export the router.
module.exports = router;
