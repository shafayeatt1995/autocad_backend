// const {
//   DxfWriter,
//   point3d,
//   Colors,
//   LayerFlags,
//   TextHorizontalAlignment,
//   TextVerticalAlignment,
//   PolylineFlags,
//   VertexFlags,
// } = require("@tarikjabiri/dxf");

// function handleDxf(groupedPoints) {
//   const dxf = new DxfWriter();

//   const layers = new Set();
//   function ensureLayer(name, color = Colors.White, type = "Continuous") {
//     if (!layers.has(name)) {
//       dxf.addLayer(name, color, type);
//       layers.add(name);
//     }
//   }

//   ensureLayer("CODE", Colors.Green);
//   ensureLayer("RL", Colors.Yellow);

//   groupedPoints.forEach((pointsArray) => {
//     if (!pointsArray.length) return;
//     const { layerName, layerColor, floor, centerText } = pointsArray[0];
//     ensureLayer(layerName, layerColor || Colors.White);

//     pointsArray.forEach((pt) => {
//       // CODE layer text
//       dxf.setCurrentLayerName("CODE");
//       dxf.addText(point3d(pt.x, pt.y, 0), 0.14, `${pt.name}_${pt.sn}`, {
//         horizontalAlignment: TextHorizontalAlignment.Left,
//         verticalAlignment: TextVerticalAlignment.Bottom,
//       });

//       // RL layer text (z value)
//       dxf.setCurrentLayerName("RL");
//       dxf.addText(point3d(pt.x, pt.y, 0), 0.4, pt.z?.toString() || "", {
//         horizontalAlignment: TextHorizontalAlignment.Left,
//         verticalAlignment: TextVerticalAlignment.Bottom,
//       });

//       // 3D point
//       dxf.setCurrentLayerName(layerName);
//       dxf.addPoint(point3d(pt.x, pt.y, pt.z || 0));
//     });

//     // 3D polyline if all points have id
//     const allHaveId = pointsArray.every((pt) => pt.id);
//     if (allHaveId && pointsArray.length > 1) {
//       const vertices = pointsArray.map((pt) => ({
//         x: pt.x,
//         y: pt.y,
//         z: pt.z || 0,
//         flags: VertexFlags.Polyline3DVertex,
//       }));

//       dxf.setCurrentLayerName(layerName);
//       const polyline = dxf.addPolyline({
//         flags: PolylineFlags.Polyline3D | PolylineFlags.Closed,
//       });
//       vertices.forEach((v) => polyline.add(v));
//     }

//     // Center text
//     if (centerText) {
//       const midX =
//         pointsArray.reduce((acc, pt) => acc + +pt.x, 0) / pointsArray.length;
//       const midY =
//         pointsArray.reduce((acc, pt) => acc + +pt.y, 0) / pointsArray.length;

//       ensureLayer("TEXT");
//       dxf.setCurrentLayerName("TEXT");
//       dxf.addText(point3d(midX, midY, 0), 0.8, `${floor}${centerText}`, {
//         horizontalAlignment: TextHorizontalAlignment.Center,
//         verticalAlignment: TextVerticalAlignment.Middle,
//       });
//     }
//   });

//   return dxf.stringify();
// }

// const controller = {
//   async generateDxf2(req, res) {
//     try {
//       const groupedPoints = req.body;
//       const dxfString = handleDxf(groupedPoints);

//       res.setHeader("Content-Disposition", "attachment; filename=output.dxf");
//       res.setHeader("Content-Type", "application/dxf");
//       res.send(dxfString);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "DXF generation failed" });
//     }
//   },

//   async previewDxf2(req, res) {
//     try {
//       const groupedPoints = req.body;
//       const dxfString = handleDxf(groupedPoints);

//       res.setHeader("Content-Disposition", "attachment; filename=output.dxf");
//       res.setHeader("Content-Type", "application/dxf");
//       res.send(dxfString);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "DXF generation failed" });
//     }
//   },
// };

// module.exports = controller;

const DXF = require("../class/DXF");

function handleDxf(groupedPoints) {
  const d = new DXF();

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
    const { layerCode, layerName, layerColor, floor, centerText } =
      pointsArray[0];
    ensureLayer(layerName, layerColor);

    pointsArray.forEach((pt, i) => {
      d.setActiveLayer("CODE");
      d.drawText(pt.x, pt.y, 0.14, 0, `${pt.name}_${pt.sn}`);
      d.setActiveLayer("RL");
      d.drawText(pt.x, pt.y, 0.4, 0, pt.z);
      d.setActiveLayer(layerName);
      d.drawPoint3D(pt.x, pt.y, pt.z);
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

const controller = {
  async generateDxf2(req, res) {
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

  async previewDxf2(req, res) {
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
