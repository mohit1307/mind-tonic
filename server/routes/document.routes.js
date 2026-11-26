const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { uploadDocumentSchema } = require('../validators/document.validator');

router.use(authenticate);

router.post(
  '/upload',
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentController.upload
);
router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.post('/:id/ocr', documentController.reprocessOCR);
router.delete('/:id', documentController.delete);

module.exports = router;
