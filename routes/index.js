const express = require("express");
const { generateDxf } = require("../controllers/generate");
const router = express.Router();

router.post("/generate-dxf", generateDxf);

module.exports = router;
