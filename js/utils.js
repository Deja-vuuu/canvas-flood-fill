/**
 * @param canvas
 * @param x
 * @param y
 * @param fillColor
 *            要填充的颜色，为一个共4个元素的整型数组，即[r,g,b,a]，例如[255,255,255,255]
 * @param tolerance
 *            容忍度
 */
function floodFillLinear(canvas, x, y, fillColor, tolerance) {
  /**
   * 相关数据准备
   */
  var width = canvas.width;
  var height = canvas.height;
  var context = canvas.getContext("2d");
  var pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
  var pixelsChecked = new Array(width * height);
  var startIdx = (width * y + x) * 4;
  var startColor = [
    pixelData.data[startIdx],
    pixelData.data[startIdx + 1],
    pixelData.data[startIdx + 2],
    pixelData.data[startIdx + 3],
  ];
  if (
    startColor[0] == 0 &&
    startColor[1] == 0 &&
    startColor[2] == 0 &&
    startColor[3] == 255
  ) {
    return;
  }
  var ranges = new Queue();

  /**
   * 算法执行
   */
  LinearFill(x, y);

  var range;

  while (!ranges.empty()) {
    range = ranges.dequeue();

    var downPxIdx = width * (range.Y + 1) + range.startX;
    var upPxIdx = width * (range.Y - 1) + range.startX;
    var upY = range.Y - 1;
    var downY = range.Y + 1;

    for (var i = range.startX; i <= range.endX; i++) {
      if (range.Y > 0 && !pixelsChecked[upPxIdx] && CheckPixel(upPxIdx)) {
        LinearFill(i, upY);
      }

      if (
        range.Y < height - 1 &&
        !pixelsChecked[downPxIdx] &&
        CheckPixel(downPxIdx)
      ) {
        LinearFill(i, downY);
      }

      downPxIdx++;
      upPxIdx++;
    }
  }

  /**
   * 将结果进行渲染
   */
  context.putImageData(pixelData, 0, 0, 0, 0, width, height);

  function LinearFill(x, y) {
    var lFillLoc = x;
    var pxIdx = width * y + x;

    while (true) {
      SetPixel(pxIdx, fillColor);
      pixelsChecked[pxIdx] = true;
      lFillLoc--;
      pxIdx--;
      if (lFillLoc < 0 || pixelsChecked[pxIdx] || !CheckPixel(pxIdx)) {
        break;
      }
    }

    lFillLoc++;

    let rFillLoc = x;
    pxIdx = width * y + x;
    while (true) {
      SetPixel(pxIdx, fillColor);
      pixelsChecked[pxIdx] = true;
      rFillLoc++;
      pxIdx++;
      if (rFillLoc >= width || pixelsChecked[pxIdx] || !CheckPixel(pxIdx)) {
        break;
      }
    }

    rFillLoc--;

    var r = new FloodFillRange(lFillLoc, rFillLoc, y);
    ranges.enqueue(r);
  }

  function SetPixel(pxIdx, color) {
    pixelData.data[pxIdx * 4] = color[0];
    pixelData.data[pxIdx * 4 + 1] = color[1];
    pixelData.data[pxIdx * 4 + 2] = color[2];
    pixelData.data[pxIdx * 4 + 3] = color[3];
  }

  function FloodFillRange(startX, endX, Y) {
    this.startX = startX;
    this.endX = endX;
    this.Y = Y;
  }

  function CheckPixel(px) {
    var red = pixelData.data[px * 4];
    var green = pixelData.data[px * 4 + 1];
    var blue = pixelData.data[px * 4 + 2];
    var alpha = pixelData.data[px * 4 + 3];

    return (
      red >= startColor[0] - tolerance &&
      red <= startColor[0] + tolerance &&
      green >= startColor[1] - tolerance &&
      green <= startColor[1] + tolerance &&
      blue >= startColor[2] - tolerance &&
      blue <= startColor[2] + tolerance &&
      alpha >= startColor[3] - tolerance &&
      alpha <= startColor[3] + tolerance
    );
  }
}


function getQueryStringRegExp(name) {
  var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
  if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " "));
  return "";
}

function rgbToHex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return r + "," + g + "," + b;
}

function colorToInt(fillcolor) {
  return (
    ((fillcolor[0] & 0xff) << 24) |
    ((fillcolor[1] & 0xff) << 16) |
    ((fillcolor[2] & 0xff) << 8) |
    ((fillcolor[3] & 0xff) << 0)
  );
}

function intToColor(num) {
  var r = (num & 0xff000000) >>> 24,
    g = (num & 0xff0000) >>> 16,
    b = (num & 0xff00) >>> 8,
    a = num & 0xff;
  return [r, g, b, a];
}

// /**
//  * 定义队列数据结构
//  */
// function Queue() {
// 	this.dataStore = [];
// }

// Queue.prototype = {
// 	// 向队尾添加一个元素
// 	enqueue : function(element) {
// 		this.dataStore.push(element);
// 	},
// 	// 删除队首的元素
// 	dequeue : function() {
// 		return this.dataStore.shift();
// 	},
// 	// 读取队首的元素
// 	front : function() {
// 		return this.dataStore[0];
// 	},
// 	// 读取队尾的元素
// 	back : function() {
// 		return this.dataStore[this.dataStore.length - 1];
// 	},
// 	// 显示队列内的所有元素
// 	toString : function() {
// 		var retStr = "";
// 		for (var i = 0; i < this.dataStore.length; ++i) {
// 			retStr += this.dataStore[i] + "\n";
// 		}
// 		return retStr;
// 	},
// 	// 判断队列是否为空
// 	empty : function() {
// 		if (this.dataStore.length == 0) {
// 			return true;
// 		} else {
// 			return false;
// 		}
// 	}

// };
function Queue() {
  return {
    dataStore: [],
    // 向队尾添加一个元素
    enqueue: function (element) {
      this.dataStore.push(element);
    },
    // 删除队首的元素
    dequeue: function () {
      return this.dataStore.shift();
    },
    // 读取队首的元素
    front: function () {
      return this.dataStore[0];
    },
    // 读取队尾的元素
    back: function () {
      return this.dataStore[this.dataStore.length - 1];
    },
    // 显示队列内的所有元素
    toString: function () {
      var retStr = "";
      for (var i = 0; i < this.dataStore.length; ++i) {
        retStr += this.dataStore[i] + "\n";
      }
      return retStr;
    },
    // 判断队列是否为空
    empty: function () {
      if (this.dataStore.length == 0) {
        return true;
      } else {
        return false;
      }
    },
  };
}
