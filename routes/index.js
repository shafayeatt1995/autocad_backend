const express = require("express");
const { generateDxf, previewDxf } = require("../controllers/generate");
const router = express.Router();

router.post("/generate-dxf", generateDxf);
router.post("/preview-dxf", previewDxf);

module.exports = router;
