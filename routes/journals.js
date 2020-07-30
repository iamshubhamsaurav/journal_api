const express = require('express');

const journalController = require('../controllers/journals');

const router = express.Router();

router
  .route('/')
  .get(journalController.getJournals)
  .post(journalController.createJournal);
router
  .route('/:id')
  .get(journalController.getJournal)
  .put(journalController.updateJournal)
  .delete(journalController.deleteJournal);

module.exports = router;
