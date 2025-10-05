const express = require("express");
const { generateDxf, previewDxf } = require("../controllers/generate");
const { generateDxf2, previewDxf2 } = require("../controllers/generate_bkp");
const router = express.Router();

router.post("/generate-dxf", generateDxf);
router.post("/preview-dxf", previewDxf);

router.post("/generate-dxf2", generateDxf2);
router.post("/preview-dxf2", previewDxf2);

module.exports = router;
