import _ol_ from '../../index';
import _ol_colorlike_ from '../../colorlike';
import _ol_render_canvas_ from '../canvas';
import _ol_render_canvas_Instruction_ from '../canvas/instruction';
import _ol_render_canvas_Replay_ from '../canvas/replay';

/**
 * @constructor
 * @extends {ol.render.canvas.Replay}
 * @param {number} tolerance Tolerance.
 * @param {ol.Extent} maxExtent Maximum extent.
 * @param {number} resolution Resolution.
 * @param {boolean} overlaps The replay can have overlapping geometries.
 * @struct
 */
var _ol_render_canvas_TextReplay_ = function(tolerance, maxExtent, resolution, overlaps) {

  _ol_render_canvas_Replay_.call(this, tolerance, maxExtent, resolution, overlaps);

  /**
   * @private
   * @type {?ol.CanvasFillState}
   */
  this.replayFillState_ = null;

  /**
   * @private
   * @type {?ol.CanvasStrokeState}
   */
  this.replayStrokeState_ = null;

  /**
   * @private
   * @type {?ol.CanvasTextState}
   */
  this.replayTextState_ = null;

  /**
   * @private
   * @type {string}
   */
  this.text_ = '';

  /**
   * @private
   * @type {number}
   */
  this.textOffsetX_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.textOffsetY_ = 0;

  /**
   * @private
   * @type {boolean|undefined}
   */
  this.textRotateWithView_ = undefined;

  /**
   * @private
   * @type {number}
   */
  this.textRotation_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.textScale_ = 0;

  /**
   * @private
   * @type {?ol.CanvasFillState}
   */
  this.textFillState_ = null;

  /**
   * @private
   * @type {?ol.CanvasStrokeState}
   */
  this.textStrokeState_ = null;

  /**
   * @private
   * @type {?ol.CanvasTextState}
   */
  this.textState_ = null;

};

_ol_.inherits(_ol_render_canvas_TextReplay_, _ol_render_canvas_Replay_);


/**
 * @inheritDoc
 */
_ol_render_canvas_TextReplay_.prototype.drawText = function(flatCoordinates, offset, end, stride, geometry, feature) {
  if (this.text_ === '' || !this.textState_ ||
      (!this.textFillState_ && !this.textStrokeState_)) {
    return;
  }
  if (this.textFillState_) {
    this.setReplayFillState_(this.textFillState_);
  }
  if (this.textStrokeState_) {
    this.setReplayStrokeState_(this.textStrokeState_);
  }
  this.setReplayTextState_(this.textState_);
  this.beginGeometry(geometry, feature);
  var myBegin = this.coordinates.length;
  var myEnd =
      this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
  var fill = !!this.textFillState_;
  var stroke = !!this.textStrokeState_;
  var drawTextInstruction = [
    _ol_render_canvas_Instruction_.DRAW_TEXT, myBegin, myEnd, this.text_,
    this.textOffsetX_, this.textOffsetY_, this.textRotation_, this.textScale_,
    fill, stroke, this.textRotateWithView_];
  this.instructions.push(drawTextInstruction);
  this.hitDetectionInstructions.push(drawTextInstruction);
  this.endGeometry(geometry, feature);
};


/**
 * @param {ol.CanvasFillState} fillState Fill state.
 * @private
 */
_ol_render_canvas_TextReplay_.prototype.setReplayFillState_ = function(fillState) {
  var replayFillState = this.replayFillState_;
  if (replayFillState &&
      replayFillState.fillStyle == fillState.fillStyle) {
    return;
  }
  var setFillStyleInstruction =
      [_ol_render_canvas_Instruction_.SET_FILL_STYLE, fillState.fillStyle];
  this.instructions.push(setFillStyleInstruction);
  this.hitDetectionInstructions.push(setFillStyleInstruction);
  if (!replayFillState) {
    this.replayFillState_ = {
      fillStyle: fillState.fillStyle
    };
  } else {
    replayFillState.fillStyle = fillState.fillStyle;
  }
};


/**
 * @param {ol.CanvasStrokeState} strokeState Stroke state.
 * @private
 */
_ol_render_canvas_TextReplay_.prototype.setReplayStrokeState_ = function(strokeState) {
  var replayStrokeState = this.replayStrokeState_;
  if (replayStrokeState &&
      replayStrokeState.lineCap == strokeState.lineCap &&
      replayStrokeState.lineDash == strokeState.lineDash &&
      replayStrokeState.lineDashOffset == strokeState.lineDashOffset &&
      replayStrokeState.lineJoin == strokeState.lineJoin &&
      replayStrokeState.lineWidth == strokeState.lineWidth &&
      replayStrokeState.miterLimit == strokeState.miterLimit &&
      replayStrokeState.strokeStyle == strokeState.strokeStyle) {
    return;
  }
  var setStrokeStyleInstruction = [
    _ol_render_canvas_Instruction_.SET_STROKE_STYLE, strokeState.strokeStyle,
    strokeState.lineWidth, strokeState.lineCap, strokeState.lineJoin,
    strokeState.miterLimit, strokeState.lineDash, strokeState.lineDashOffset, false, 1
  ];
  this.instructions.push(setStrokeStyleInstruction);
  this.hitDetectionInstructions.push(setStrokeStyleInstruction);
  if (!replayStrokeState) {
    this.replayStrokeState_ = {
      lineCap: strokeState.lineCap,
      lineDash: strokeState.lineDash,
      lineDashOffset: strokeState.lineDashOffset,
      lineJoin: strokeState.lineJoin,
      lineWidth: strokeState.lineWidth,
      miterLimit: strokeState.miterLimit,
      strokeStyle: strokeState.strokeStyle
    };
  } else {
    replayStrokeState.lineCap = strokeState.lineCap;
    replayStrokeState.lineDash = strokeState.lineDash;
    replayStrokeState.lineDashOffset = strokeState.lineDashOffset;
    replayStrokeState.lineJoin = strokeState.lineJoin;
    replayStrokeState.lineWidth = strokeState.lineWidth;
    replayStrokeState.miterLimit = strokeState.miterLimit;
    replayStrokeState.strokeStyle = strokeState.strokeStyle;
  }
};


/**
 * @param {ol.CanvasTextState} textState Text state.
 * @private
 */
_ol_render_canvas_TextReplay_.prototype.setReplayTextState_ = function(textState) {
  var replayTextState = this.replayTextState_;
  if (replayTextState &&
      replayTextState.font == textState.font &&
      replayTextState.textAlign == textState.textAlign &&
      replayTextState.textBaseline == textState.textBaseline) {
    return;
  }
  var setTextStyleInstruction = [_ol_render_canvas_Instruction_.SET_TEXT_STYLE,
    textState.font, textState.textAlign, textState.textBaseline];
  this.instructions.push(setTextStyleInstruction);
  this.hitDetectionInstructions.push(setTextStyleInstruction);
  if (!replayTextState) {
    this.replayTextState_ = {
      font: textState.font,
      textAlign: textState.textAlign,
      textBaseline: textState.textBaseline
    };
  } else {
    replayTextState.font = textState.font;
    replayTextState.textAlign = textState.textAlign;
    replayTextState.textBaseline = textState.textBaseline;
  }
};


/**
 * @inheritDoc
 */
_ol_render_canvas_TextReplay_.prototype.setTextStyle = function(textStyle) {
  if (!textStyle) {
    this.text_ = '';
  } else {
    var textFillStyle = textStyle.getFill();
    if (!textFillStyle) {
      this.textFillState_ = null;
    } else {
      var textFillStyleColor = textFillStyle.getColor();
      var fillStyle = _ol_colorlike_.asColorLike(textFillStyleColor ?
        textFillStyleColor : _ol_render_canvas_.defaultFillStyle);
      if (!this.textFillState_) {
        this.textFillState_ = {
          fillStyle: fillStyle
        };
      } else {
        var textFillState = this.textFillState_;
        textFillState.fillStyle = fillStyle;
      }
    }
    var textStrokeStyle = textStyle.getStroke();
    if (!textStrokeStyle) {
      this.textStrokeState_ = null;
    } else {
      var textStrokeStyleColor = textStrokeStyle.getColor();
      var textStrokeStyleLineCap = textStrokeStyle.getLineCap();
      var textStrokeStyleLineDash = textStrokeStyle.getLineDash();
      var textStrokeStyleLineDashOffset = textStrokeStyle.getLineDashOffset();
      var textStrokeStyleLineJoin = textStrokeStyle.getLineJoin();
      var textStrokeStyleWidth = textStrokeStyle.getWidth();
      var textStrokeStyleMiterLimit = textStrokeStyle.getMiterLimit();
      var lineCap = textStrokeStyleLineCap !== undefined ?
        textStrokeStyleLineCap : _ol_render_canvas_.defaultLineCap;
      var lineDash = textStrokeStyleLineDash ?
        textStrokeStyleLineDash.slice() : _ol_render_canvas_.defaultLineDash;
      var lineDashOffset = textStrokeStyleLineDashOffset !== undefined ?
        textStrokeStyleLineDashOffset : _ol_render_canvas_.defaultLineDashOffset;
      var lineJoin = textStrokeStyleLineJoin !== undefined ?
        textStrokeStyleLineJoin : _ol_render_canvas_.defaultLineJoin;
      var lineWidth = textStrokeStyleWidth !== undefined ?
        textStrokeStyleWidth : _ol_render_canvas_.defaultLineWidth;
      var miterLimit = textStrokeStyleMiterLimit !== undefined ?
        textStrokeStyleMiterLimit : _ol_render_canvas_.defaultMiterLimit;
      var strokeStyle = _ol_colorlike_.asColorLike(textStrokeStyleColor ?
        textStrokeStyleColor : _ol_render_canvas_.defaultStrokeStyle);
      if (!this.textStrokeState_) {
        this.textStrokeState_ = {
          lineCap: lineCap,
          lineDash: lineDash,
          lineDashOffset: lineDashOffset,
          lineJoin: lineJoin,
          lineWidth: lineWidth,
          miterLimit: miterLimit,
          strokeStyle: strokeStyle
        };
      } else {
        var textStrokeState = this.textStrokeState_;
        textStrokeState.lineCap = lineCap;
        textStrokeState.lineDash = lineDash;
        textStrokeState.lineDashOffset = lineDashOffset;
        textStrokeState.lineJoin = lineJoin;
        textStrokeState.lineWidth = lineWidth;
        textStrokeState.miterLimit = miterLimit;
        textStrokeState.strokeStyle = strokeStyle;
      }
    }
    var textFont = textStyle.getFont();
    var textOffsetX = textStyle.getOffsetX();
    var textOffsetY = textStyle.getOffsetY();
    var textRotateWithView = textStyle.getRotateWithView();
    var textRotation = textStyle.getRotation();
    var textScale = textStyle.getScale();
    var textText = textStyle.getText();
    var textTextAlign = textStyle.getTextAlign();
    var textTextBaseline = textStyle.getTextBaseline();
    var font = textFont !== undefined ?
      textFont : _ol_render_canvas_.defaultFont;
    var textAlign = textTextAlign !== undefined ?
      textTextAlign : _ol_render_canvas_.defaultTextAlign;
    var textBaseline = textTextBaseline !== undefined ?
      textTextBaseline : _ol_render_canvas_.defaultTextBaseline;
    if (!this.textState_) {
      this.textState_ = {
        font: font,
        textAlign: textAlign,
        textBaseline: textBaseline
      };
    } else {
      var textState = this.textState_;
      textState.font = font;
      textState.textAlign = textAlign;
      textState.textBaseline = textBaseline;
    }
    this.text_ = textText !== undefined ? textText : '';
    this.textOffsetX_ = textOffsetX !== undefined ? textOffsetX : 0;
    this.textOffsetY_ = textOffsetY !== undefined ? textOffsetY : 0;
    this.textRotateWithView_ = textRotateWithView !== undefined ? textRotateWithView : false;
    this.textRotation_ = textRotation !== undefined ? textRotation : 0;
    this.textScale_ = textScale !== undefined ? textScale : 1;
  }
};
export default _ol_render_canvas_TextReplay_;
