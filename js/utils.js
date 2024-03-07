// Usage
// Can be used as long as a link to this https://github.com/blindman67/FloodFill2D github page is included in the source and the following attribution is included.

// FloodFill2D by Blindman67 2016. Original source code from https://github.com/blindman67/FloodFill2D

const floodFill = function (posX, posY, tolerance, context2D) {
  let canvas, ctx;
  function floodFillLinear(
    posX,
    posY,
    tolerance,
    context2D,
    diagonal,
    area,
    toleranceFade
  ) {
    var w,
      h,
      painted,
      x,
      y,
      ind,
      sr,
      sg,
      sb,
      sa,
      imgData,
      data,
      stack,
      stackPos,
      lookLeft,
      lookRight,
      i,
      colImgDat,
      differance,
      checkColour;
    toleranceFade =
      toleranceFade !== undefined && toleranceFade !== null ? toleranceFade : 0;

    diagonal = diagonal !== undefined && diagonal !== null ? diagonal : false;
    area = area !== undefined && area !== null ? area : {};
    area.x = area.x !== undefined ? area.x : 0;
    area.y = area.y !== undefined ? area.y : 0;
    area.w = area.w !== undefined ? area.w : context2D.canvas.width - area.x;
    area.h = area.h !== undefined ? area.h : context2D.canvas.height - area.y;
    // vet area is on the canvas.
    if (area.x < 0) {
      area.w = area.x + area.w;
      area.x = 0;
    }
    if (area.y < 0) {
      area.h = area.y + area.h;
      area.y = 0;
    }
    if (area.x >= context2D.canvas.width || area.y >= context2D.canvas.height) {
      return false;
    }
    if (area.x + area.w > context2D.canvas.width) {
      area.w = context2D.canvas.width - area.x;
    }
    if (area.y + area.h > context2D.canvas.height) {
      area.h = context2D.canvas.height - area.y;
    }
    if (area.w <= 0 || area.h <= 0) {
      return false;
    }
    w = area.w; // width and height
    h = area.h;
    x = posX - area.x;
    y = posY - area.y;

    if (x < 0 || y < 0 || x >= w || y >= h) {
      return false; // fill start outside area. Don't do anything
    }
    if (tolerance === 255 && toleranceFade === 0) {
      context2D.fillRect(area.x, area.y, w, h);
      return true;
    }
    if (toleranceFade > 0) {
      // add one if on to get correct number of steps
      toleranceFade += 1;
    }
    imgData = context2D.getImageData(area.x, area.y, area.w, area.h);
    data = imgData.data; // image data to fill;
    data32 = new Uint32Array(data.buffer);
    painted = new Uint8ClampedArray(w * h); // byte array to mark painted area;
    function checkColourAll(ind) {
      if (ind < 0 || painted[ind] > 0) {
        // test bounds
        return false;
      }
      var ind4 = ind << 2; // get index of pixel
      if (
        (differance = Math.max(
          // get the max channel difference;
          Math.abs(sr - data[ind4++]),
          Math.abs(sg - data[ind4++]),
          Math.abs(sb - data[ind4++]),
          Math.abs(sa - data[ind4++])
        )) > tolerance
      ) {
        return false;
      }
      return true;
    }
    // check to bounding colour
    function checkColourBound(ind) {
      if (ind < 0 || painted[ind] > 0) {
        // test bounds
        return false;
      }
      var ind4 = ind << 2; // get index of pixel
      differance = 0;
      if (
        sr === data[ind4] &&
        sg === data[ind4 + 1] &&
        sb === data[ind4 + 2] &&
        sa === data[ind4 + 3]
      ) {
        return false;
      }
      return true;
    }
    // this function checks the colour of only selected channels
    function checkColourLimited(ind) {
      // check only colour channels that are not null
      var dr, dg, db, da;
      if (ind < 0 || painted[ind] > 0) {
        // test bounds
        return false;
      }
      var ind4 = ind << 2; // get index of pixel
      dr = dg = db = da = 0;
      if (sr !== null && (dr = Math.abs(sr - data[ind4])) > tolerance) {
        return false;
      }
      if (sg !== null && (dg = Math.abs(sg - data[ind4 + 1])) > tolerance) {
        return false;
      }
      if (sb !== null && (db = Math.abs(sb - data[ind4 + 2])) > tolerance) {
        return false;
      }
      if (sa !== null && (da = Math.abs(sa - data[ind4 + 3])) > tolerance) {
        return false;
      }
      return true;
    }
    // set which function to check colour with
    checkColour = checkColourAll;
    ind = (y * w + x) << 2; // get the starting pixel index
    sr = data[ind]; // get the start colour that we will use tolerance against.
    sg = data[ind + 1];
    sb = data[ind + 2];
    sa = data[ind + 3];
    console.log("3");
    stack = []; // paint stack to find new pixels to paint
    lookLeft = false; // test directions
    lookRight = false;
    stackPos = 0;
    stack[stackPos++] = x;
    stack[stackPos++] = y;
    while (stackPos > 0) {
      // do while pixels on the stack
      y = stack[--stackPos]; // get the pixel y
      x = stack[--stackPos]; // get the pixel x
      ind = x + y * w;
      while (checkColour(ind - w)) {
        // find the top most pixel within tollerance;
        y -= 1;
        ind -= w;
      }
      //checkTop left and right if allowing diagonal painting
      if (diagonal && y > 0) {
        if (x > 0 && !checkColour(ind - 1) && checkColour(ind - w - 1)) {
          stack[stackPos++] = x - 1;
          stack[stackPos++] = y - 1;
        }
        if (x < w - 1 && !checkColour(ind + 1) && checkColour(ind - w + 1)) {
          stack[stackPos++] = x + 1;
          stack[stackPos++] = y - 1;
        }
      }
      lookLeft = false; // set look directions
      lookRight = false; // only look is a pixel left or right was blocked
      while (checkColour(ind) && y < h) {
        // move down till no more room
        if (toleranceFade > 0 && differance >= tolerance - toleranceFade) {
          painted[ind] =
            255 -
            ((differance - (tolerance - toleranceFade)) / toleranceFade) * 255;
          painted[ind] = painted[ind] === 0 ? 1 : painted[ind]; // min value must be 1
        } else {
          painted[ind] = 255;
        }

        if (checkColour(ind - 1) && x > 0) {
          // check left is blocked
          if (!lookLeft) {
            stack[stackPos++] = x - 1;
            stack[stackPos++] = y;
            lookLeft = true;
          }
        } else if (lookLeft) {
          lookLeft = false;
        }
        if (checkColour(ind + 1) && x < w - 1) {
          // check right is blocked
          if (!lookRight) {
            stack[stackPos++] = x + 1;
            stack[stackPos++] = y;
            lookRight = true;
          }
        } else if (lookRight) {
          lookRight = false;
        }
        y += 1; // move down one pixel
        ind += w;
      }
      if (diagonal && y < h) {
        // check for diagonal areas and push them to be painted
        if (checkColour(ind - 1) && !lookLeft && x > 0) {
          stack[stackPos++] = x - 1;
          stack[stackPos++] = y;
        }
        if (checkColour(ind + 1) && !lookRight && x < w - 1) {
          stack[stackPos++] = x + 1;
          stack[stackPos++] = y;
        }
      }
    }

    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = context2D.fillStyle;
    ctx.fillRect(0, 0, w, h);
    colImgDat = ctx.getImageData(0, 0, w, h);
    i = 0;
    ind = 3;
    while (i < painted.length) {
      colImgDat.data[ind] = painted[i];
      i++;
      ind += 4;
    }
    ctx.putImageData(colImgDat, 0, 0);
    context2D.drawImage(canvas, area.x, area.y, w, h);
  }

  floodFillLinear(posX, posY, tolerance, context2D);
};


function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return r + "," + g + "," + b;
}
