const Drawing = require("dxf-writer");

class DXF extends Drawing {
  constructor() {
    super();
  }

  drawPoint3D(x, y, z = 0) {
    const point3D = {
      tags: (manager) => {
        manager.push(0, "POINT");
        manager.push(8, this.activeLayer.name);
        manager.point(x, y, z);
      },
      layer: this.activeLayer,
    };
    this.activeLayer.addShape(point3D);
    return this;
  }
}

module.exports = DXF;
