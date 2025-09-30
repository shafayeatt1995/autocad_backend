const Drawing = require("dxf-writer");

function checkPoint(pointsArray) {
  if (Array.isArray(pointsArray) && pointsArray.length === 3) {
    const [a, b, c] = pointsArray;

    const d = {
      ...a,
      x: a.x + c.x - b.x,
      y: a.y + c.y - b.y,
      z: a.z || 0,
      sn: 0,
    };

    return [...pointsArray, d];
  }
  return pointsArray;
}

function gettextCreation(point) {
  if (point.layerCode === "B") {
    return "STD";
  } else if (point.layerCode === "MB") {
    return "MOSQUE";
  } else if (point.layerCode === "BW") {
    return "B.WALL";
  } else if (point.layerCode === "S") {
    return "SHOP";
  } else if (point.layerCode === "SS") {
    return "SHOPS";
  } else if (point.layerCode === "SP") {
    return "SEMI PUCCA";
  } else if (point.layerCode === "TS") {
    return "TIN SHED";
  }

  return point.layerName;
}

const controller = {
  async generateDxf(req, res) {
    try {
      const groupedPoints = req.body;
      const d = new Drawing();

      const layers = new Set();
      function ensureLayer(name, color = 7, type = "CONTINUOUS") {
        if (!layers.has(name)) {
          d.addLayer(name, color, type);
          layers.add(name);
        }
      }

      ensureLayer("CODE", 2, "CONTINUOUS");
      ensureLayer("RL", 3, "CONTINUOUS");

      Object.entries(groupedPoints).forEach(([groupName, pointsArray], i) => {
        if (!pointsArray.length) return;
        const { layerCode, layerName, layerColor = 7, floor } = pointsArray[0];
        ensureLayer(layerName, layerColor, "CONTINUOUS");

        const processedPoints = checkPoint(pointsArray);

        processedPoints.forEach((pt, i) => {
          d.setActiveLayer("CODE");
          d.drawText(pt.x, pt.y, 0.14, 0, `${pt.name}_${pt.sn}`);
          d.setActiveLayer("RL");
          d.drawText(pt.x, pt.y, 0.4, 0, pt.z);
          d.setActiveLayer(layerName);
          d.drawPoint(pt.x, pt.y, pt.z);
        });

        const allHaveId = processedPoints.every((pt) => pt.id);
        if (allHaveId && processedPoints.length > 1) {
          const polylineVertices = processedPoints.map((pt) => [
            +pt.x,
            +pt.y,
            +pt.z || 0,
          ]);

          if (
            [
              "B",
              "MB",
              "MH",
              "UCB",
              "UC",
              "S",
              "SS",
              "TS",
              "SP",
              "PH",
              "STAIR",
              "DT",
              "ST",
            ].includes(layerCode)
          ) {
            polylineVertices.push(polylineVertices[0]);
          }
          d.setActiveLayer(layerName);
          d.drawPolyline3d(polylineVertices);
        }

        if (
          processedPoints.length === 4 ||
          ([
            "F",
            "P",
            "DR",
            "RCC",
            "CC",
            "PH",
            "STAIR",
            "CV",
            "RE",
            "DT",
            "RB",
          ].includes(layerCode) &&
            processedPoints.length > 1)
        ) {
          const midX =
            processedPoints.reduce((acc, pt) => acc + +pt.x, 0) /
            processedPoints.length;
          const midY =
            processedPoints.reduce((acc, pt) => acc + +pt.y, 0) /
            processedPoints.length;
          ensureLayer("TEXT", 7, "CONTINUOUS");
          d.setActiveLayer("TEXT");
          d.drawText(
            midX,
            midY,
            0.8,
            0,
            `${floor}${gettextCreation(pointsArray[0])}`,
            "center",
            "middle"
          );
        }
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
