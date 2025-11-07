const Drawing = require("dxf-writer");

function handleDxf(groupedPoints) {
  const d = new Drawing();

  const layers = new Set();
  function ensureLayer(name, color = 7, type = "CONTINUOUS") {
    if (!layers.has(name)) {
      d.addLayer(name, color, type);
      layers.add(name);
    }
  }

  ensureLayer("CODE", 2);
  ensureLayer("RL", 3);

  groupedPoints.forEach((pointsArray, i) => {
    if (!pointsArray.length) return;
    const { layerName, layerColor, floor, centerText } =
      pointsArray[0];
    ensureLayer(layerName, layerColor);

    pointsArray.forEach((pt) => {
      d.setActiveLayer("CODE");
      d.drawText(pt.x, pt.y, 0.14, 0, `${pt.name}_${pt.sn}`);
      d.setActiveLayer("RL");
      d.drawText(pt.x, pt.y, 0.4, 0, pt.z);
      d.setActiveLayer(layerName);
      d.drawPoint(pt.x, pt.y, pt.z);
    });

    const allHaveId = pointsArray.every((pt) => pt.id);
    if (allHaveId && pointsArray.length > 1) {
      const polylineVertices = pointsArray.map((pt) => [
        +pt.x,
        +pt.y,
        +pt.z || 0,
      ]);

      d.setActiveLayer(layerName);
      d.drawPolyline3d(polylineVertices);
    }

    if (centerText) {
      const midX =
        pointsArray.reduce((acc, pt) => acc + +pt.x, 0) / pointsArray.length;
      const midY =
        pointsArray.reduce((acc, pt) => acc + +pt.y, 0) / pointsArray.length;
      ensureLayer("TEXT");
      d.setActiveLayer("TEXT");
      d.drawText(
        midX,
        midY,
        0.8,
        0,
        `${floor}${centerText}`,
        "center",
        "middle"
      );
    }
  });

  return d.toDxfString();
}

// function handleDxf(groupedPoints) {
//   const d = new Drawing();

//   const layers = new Set();
//   function ensureLayer(name, color = 7, type = "CONTINUOUS") {
//     if (!layers.has(name)) {
//       d.addLayer(name, color, type);
//       layers.add(name);
//     }
//   }

//   ensureLayer("CODE", 2);
//   ensureLayer("RL", 3);

//   const pointsToInject3D = [];

//   groupedPoints.forEach((pointsArray, i) => {
//     if (!pointsArray.length) return;
//     const { layerName, layerColor, floor, centerText } =
//       pointsArray[0];
//     ensureLayer(layerName, layerColor);

//     pointsArray.forEach((pt) => {
//       d.setActiveLayer("CODE");
//       d.drawText(pt.x, pt.y, 0.14, 0, `${pt.name}_${pt.sn}`);
//       d.setActiveLayer("RL");
//       d.drawText(pt.x, pt.y, 0.4, 0, pt.z);
//       pointsToInject3D.push({ x: pt.x, y: pt.y, z: pt.z, layer: layerName });
//     });

//     const allHaveId = pointsArray.every((pt) => pt.id);
//     if (allHaveId && pointsArray.length > 1) {
//       const polylineVertices = pointsArray.map((pt) => [
//         +pt.x,
//         +pt.y,
//         +pt.z || 0,
//       ]);

//       d.setActiveLayer(layerName);
//       d.drawPolyline3d(polylineVertices);
//     }

//     if (centerText) {
//       const midX =
//         pointsArray.reduce((acc, pt) => acc + +pt.x, 0) / pointsArray.length;
//       const midY =
//         pointsArray.reduce((acc, pt) => acc + +pt.y, 0) / pointsArray.length;
//       ensureLayer("TEXT");
//       d.setActiveLayer("TEXT");
//       d.drawText(
//         midX,
//         midY,
//         0.8,
//         0,
//         `${floor}${centerText}`,
//         "center",
//         "middle"
//       );
//     }
//   });

//   let dxfString = d.toDxfString();

//   dxfString = dxfString.replace(
//     /0\nSECTION\n2\nHEADER[\s\S]*?0\nENDSEC/,
//     `0
// SECTION
// 2
// HEADER
// 9
// $ACADVER
// 1
// AC1015
// 0
// ENDSEC`
//   );

//   const pointEntities = pointsToInject3D.map(pt => `
// 0
// POINT
// 8
// ${pt.layer}
// 10
// ${pt.x}
// 20
// ${pt.y}
// 30
// ${pt.z}
// `).join('');

//   dxfString = dxfString.replace('0\nEOF\n', pointEntities + '\n0\nEOF\n');

//   return dxfString;
// }


const controller = {
  async generateDxf(req, res) {
    try {
      const groupedPoints = req.body;
      const dxfString = handleDxf(groupedPoints);

      res.setHeader("Content-Disposition", "attachment; filename=output.dxf");
      res.setHeader("Content-Type", "application/dxf");
      res.send(dxfString);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "DXF generation failed" });
    }
  },

  async previewDxf(req, res) {
    try {
      const groupedPoints = req.body;
      const dxfString = handleDxf(groupedPoints);

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
