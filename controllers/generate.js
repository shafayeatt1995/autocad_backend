const Drawing = require("dxf-writer");

const controller = {
  async generateDxf(req, res) {
    try {
      const groupedPoints = req.body;
      const d = new Drawing();

      Object.entries(groupedPoints).forEach(([groupName, pointsArray], i) => {
        if (!pointsArray.length) return;
        const color = pointsArray[0].layerColor || 7;

        d.addLayer(groupName, color, "CONTINUOUS");
        d.setActiveLayer(groupName);

        pointsArray.forEach((pt, i) => {
          d.drawPoint(pt.x, pt.y, pt.z);
          d.drawText(pt.x, pt.y, 0.5, 0, pt.name);

          if (groupName === "NEW_LAYER" || groupName === "PP") {
            d.drawCircle(pt.x, pt.y, 0.2);
          } else {
            const nextPt = pointsArray[(i + 1) % pointsArray.length];
            d.drawLine(pt.x, pt.y, nextPt.x, nextPt.y);
          }
        });
      });

      const dxfString = d.toDxfString();

      res.setHeader("Content-Disposition", "attachment; filename=output.dxf");
      res.setHeader("Content-Type", "application/dxf");
      res.send(dxfString);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "DXF generation failed" });
    }
  },
};

module.exports = controller;
