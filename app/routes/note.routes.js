module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');

    //Create a new Note
    app.post('/notes', notes.create);

    // Retrive all notes
    app.get('/notes', notes.findAll);

    // Retrive a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with note id
    app.put('/notes/:noteId', notes.update);

    //Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);

}