'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

{
  (function () {
    // utils

    var identity = function identity(x) {
      return x;
    };

    var always = function always(x) {
      return function () {
        return x;
      };
    };

    var prop = function prop(key) {
      return function (obj) {
        return obj[key];
      };
    };

    var eq = function eq(a) {
      return function (b) {
        return a === b;
      };
    };

    var and = function and(a) {
      return function (b) {
        return a && b;
      };
    };

    var not = function not(a) {
      return function (b) {
        return a !== b;
      };
    };

    var isFalse = function isFalse(a) {
      return a === false;
    };

    var add = function add(a) {
      return function (b) {
        return a + b;
      };
    };

    var mult = function mult(a) {
      return function (b) {
        return a * b;
      };
    };

    var toString = function toString(a) {
      return a.toString();
    };

    var subtract = function subtract(a) {
      return function (b) {
        return a - b;
      };
    };

    var map = function map(func) {
      return function (data) {
        return data.map(func);
      };
    };

    var filter = function filter(func) {
      return function (data) {
        return data.filter(func);
      };
    };

    var reduce = function reduce(func) {
      return function (init) {
        return function (data) {
          return data.reduce(func, init);
        };
      };
    };

    var sum = reduce(function (a, b) {
      return add(a)(b);
    })(0);

    var ifElseApply = function ifElseApply(condition, truthey, falsey) {
      return function (a) {
        return condition(a) ? truthey(a) : falsey(a);
      };
    };

    var ifElseApply2 = function ifElseApply2(condition, truthey, falsey) {
      return function (a) {
        return function (b) {
          return condition(a)(b) ? truthey(a)(b) : falsey(a)(b);
        };
      };
    };

    var ifElseApplyCurry = function ifElseApplyCurry(condition) {
      return function (truthey) {
        return function (falsey) {
          return function (a) {
            return condition(a) ? truthey(a) : falsey(a);
          };
        };
      };
    };

    var ifElseCurry = function ifElseCurry(condition) {
      return function (truthey) {
        return function (falsey) {
          return condition ? truthey : falsey;
        };
      };
    };

    var flipIfElseCurry = function flipIfElseCurry(truthey) {
      return function (falsey) {
        return function (condition) {
          return ifElseCurry(condition)(truthey)(falsey);
        };
      };
    };

    var apply = function apply(x) {
      return function (func) {
        return func(x);
      };
    };

    var apply3 = function apply3(x) {
      return function (y) {
        return function (z) {
          return function (func) {
            return func(x)(y)(z);
          };
        };
      };
    };

    var applyTo = function applyTo(func) {
      return function (args) {
        return func.apply(null, [].concat(_toConsumableArray(args)));
      };
    };

    var compose = function compose() {
      for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
        funcs[_key] = arguments[_key];
      }

      return function (data) {
        return reduce(function (val, func) {
          return func(val);
        })(data)(funcs);
      };
    };

    var composeCurry2 = function composeCurry2(a) {
      return function (b) {
        return compose(a, b);
      };
    };

    var composeWrap = function composeWrap(wrapper) {
      return function () {
        for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          funcs[_key2] = arguments[_key2];
        }

        return function (data) {
          return reduce(function (val, func) {
            return wrapper(func)(val);
          })(data)(funcs);
        };
      };
    };

    var applyMap = compose(apply, map);

    var always2 = compose(always, always);

    var compose2 = function compose2(h) {
      for (var _len3 = arguments.length, tail = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        tail[_key3 - 1] = arguments[_key3];
      }

      return function (a) {
        return applyTo(compose)([h(a)].concat(tail));
      };
    };

    var compose3 = function compose3(h) {
      for (var _len4 = arguments.length, tail = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        tail[_key4 - 1] = arguments[_key4];
      }

      return function (a) {
        return function (b) {
          return applyTo(compose)([h(a)(b)].concat(tail));
        };
      };
    };

    var compose4 = function compose4(h) {
      for (var _len5 = arguments.length, tail = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        tail[_key5 - 1] = arguments[_key5];
      }

      return function (a) {
        return function (b) {
          return function (c) {
            return applyTo(compose)([h(a)(b)(c)].concat(tail));
          };
        };
      };
    };

    var ifElseApplyAlwaysEq = compose2(eq, compose(always, ifElseApplyCurry));

    var applyMap3 = compose3(apply3, map);

    var alwaysProp = compose2(prop, always);

    var applyToCompose = function applyToCompose(args) {
      return function (x) {
        return applyTo(compose)(args)(x);
      };
    };

    var applyMapAndSum = compose2(applyMap, sum);

    var flip = function flip(func) {
      return function (a) {
        return function (b) {
          return func(b)(a);
        };
      };
    };

    var flipApplyMap = flip(applyMap);

    var transformAndCompose = compose2(flip(applyMap), applyToCompose);

    var pairs = function pairs(a) {
      return function (b) {
        return [a, b];
      };
    };

    var toArr = function toArr(a) {
      return [a];
    };

    var propMap = compose(prop, map);

    var propMapPair = pairs(propMap);

    var applyToCompose2 = applyTo(compose2);

    var flipPropMapPair = compose(compose(propMapPair, applyToCompose2), flip);

    var argsPipeToCompose = function argsPipeToCompose(a, b) {
      return compose(a)(b);
    };

    var applyToComposePair = compose2(pairs, applyTo(compose));

    var mapComposePipe3 = compose3(applyMap3, flip(applyToComposePair)(applyTo(argsPipeToCompose)));

    var freezeIt = Object.freeze;

    var appendChild = function appendChild(container) {
      return function (child) {
        return container.appendChild(child);
      };
    };

    var concatCurry2 = function concatCurry2(a) {
      return function (b) {
        return a.concat(b);
      };
    };

    var copyObj = function copyObj(obj) {
      return function (newObj, key) {
        var value = obj[key];

        if (Array.isArray(value)) {
          newObj[key] = value.slice(0);
        } else {
          newObj[key] = value;
        }

        return newObj;
      };
    };

    var makeCopy = function makeCopy(obj) {
      if (!obj) return {};

      return reduce(copyObj(obj))({})(Object.keys(obj));
    };

    var addClass = function addClass(className) {
      return function (el) {
        el.classList.add(className);

        return el;
      };
    };

    var removeClass = function removeClass(className) {
      return function (el) {
        el.classList.remove(className);

        return el;
      };
    };

    var addStyle = function addStyle(elStyle) {
      return function (el) {
        el.style.cssText = elStyle;

        return el;
      };
    };

    var hasClass = function hasClass(className) {
      return function (el) {
        return [].concat(_toConsumableArray(el.classList)).indexOf(className) > -1;
      };
    };

    var checkAndHasClass = function checkAndHasClass(condition) {
      return function (className) {
        return compose(hasClass(className), isFalse, and(condition));
      };
    };

    var removeClassIf = function removeClassIf(condition) {
      return function (className) {
        return ifElseApply(compose(hasClass(className), compose(isFalse, and)(condition)), removeClass(className), identity);
      };
    };

    var toggleClass = function toggleClass(condition) {
      return function (className) {
        return ifElseApply(checkAndHasClass(condition)(className), addClass(className), removeClassIf(condition)(className));
      };
    };

    var queryAll = function queryAll(selector) {
      return function (el) {
        return el.querySelectorAll(selector);
      };
    };

    // model

    var colourObjToArray = function colourObjToArray(_ref) {
      var r = _ref.r;
      var g = _ref.g;
      var b = _ref.b;
      return [r, g, b];
    };

    var colourObjToString = function colourObjToString(r, g, b) {
      return 'background-color: rgba(' + r + ', ' + g + ', ' + b + ', 1);';
    };

    var colourArrayToString = compose(colourObjToArray, applyTo(colourObjToString));

    var updateModel = function updateModel(_ref2) {
      var model = _ref2.model;
      var obj = _ref2.obj;
      return Object.assign(makeCopy(model), makeCopy(obj));
    };

    var createModel = function createModel(model, obj) {
      if (!obj) return Object.freeze(model);

      return compose(updateModel, freezeIt)({ model: model, obj: obj });
    };

    var direction = {
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
      NEITHER: 'NEITHER'
    };

    var colours = {
      0: {
        r: 238,
        g: 123,
        b: 111,
        a: 1
      },
      1: {
        r: 250,
        g: 202,
        b: 138,
        a: 1
      }
    };

    var model = createModel({
      wines: [],
      startX: 0,
      deltaX: 0,
      offset: 0,
      shouldSwipeAway: false,
      shouldTransition: false,
      activeIndx: 0,
      swipeDir: direction.NEITHER,
      expanded: false,
      bgColour: colourArrayToString(colours[0])
    });

    // update

    var actions = {
      TOUCH_START: 'TOUCH_START',
      TOUCH_MOVE: 'TOUCH_MOVE',
      TOUCH_END: 'TOUCH_END',
      CLICK: 'CLICK'
    };

    var crementIndx = function crementIndx(_ref3) {
      var swipeDir = _ref3.swipeDir;
      return swipeDir === direction.LEFT ? 1 : -1;
    };

    var isFirstCard = function isFirstCard(indx) {
      return indx === 0;
    };

    var isLastCard = function isLastCard(cards) {
      return function (indx) {
        return indx === cards.length - 1;
      };
    };

    var swipingOffRight = function swipingOffRight(_ref4) {
      var swipeDir = _ref4.swipeDir;
      var activeIndx = _ref4.activeIndx;
      return swipeDir === direction.RIGHT && isFirstCard(activeIndx);
    };

    var swipingOffLeft = function swipingOffLeft(_ref5) {
      var swipeDir = _ref5.swipeDir;
      var activeIndx = _ref5.activeIndx;
      var wines = _ref5.wines;
      return swipeDir === direction.LEFT && isLastCard(wines)(activeIndx);
    };

    var isSwipingOff = ifElseApply(swipingOffRight, always(true), swipingOffLeft);

    var pcntOffset = function pcntOffset(_ref6) {
      var deltaX = _ref6.deltaX;
      var width = _ref6.width;
      return Math.abs(deltaX) / width * 100;
    };

    var outside40 = function outside40(pcntOffset) {
      return pcntOffset > 20;
    };

    var isOutsideTolerance = compose(pcntOffset, outside40);

    var canSwipe = ifElseApply(isSwipingOff, always(false), isOutsideTolerance);

    var isLeft = function isLeft(dir) {
      return dir === direction.LEFT;
    };

    var isRight = function isRight(dir) {
      return dir === direction.RIGHT;
    };

    var modelIsLeft = compose(prop('swipeDir'), isLeft);

    var hasSweptLeft = transformAndCompose([always(modelIsLeft), and]);

    var addToOffset = compose(prop('offset'), add);

    var subtractFromOffset = compose(prop('offset'), subtract);

    var viewportWidth = alwaysProp('width');

    var currentOffset = alwaysProp('offset');

    var determineOffset = ifElseApply2(always, always(subtractFromOffset), always(currentOffset));

    var calculateOffset = ifElseApply2(hasSweptLeft, always(addToOffset), determineOffset);

    var indxChange = ifElseApply2(always, always(crementIndx), always2(0));

    var offsetArgs = compose(calculateOffset, pairs(viewportWidth));

    var transformOffsets = flip(compose2(compose(offsetArgs, always), flipApplyMap));

    var composeOffset = compose2(transformOffsets(), applyToCompose);

    var getOffset = function getOffset(ssa) {
      return function (model) {
        return composeOffset(ssa)(model)();
      };
    };

    var colourDiff = function colourDiff(width) {
      return function (deltaX) {
        return function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2);

          var start = _ref8[0];
          var end = _ref8[1];
          return add(start)(Math.round(mult(Math.abs(deltaX / width))(end - start)));
        };
      };
    };

    var extractPairs = compose2(colourDiff, flipPropMapPair);

    var composeColours = compose2(extractPairs, compose(pairs(pairs), applyTo(compose2)));

    var calcColours = compose2(compose(toArr, applyTo(map)), applyTo(colourObjToString));

    var backgroundColour = compose4(composeColours, flip(calcColours)(['r', 'g', 'b']));

    var swipeLeftColours = function swipeLeftColours(bgc) {
      return function (activeIndx) {
        return function (wines) {
          return bgc(colours[Math.min(activeIndx + 1, wines.length - 1)]);
        };
      };
    };

    var swipeRightColours = function swipeRightColours(bgc) {
      return function (activeIndx) {
        return function (wines) {
          return bgc(colours[Math.max(activeIndx - 1, 0)]);
        };
      };
    };

    var swipeRightCheck = compose3(swipeRightColours, always, compose(pairs(isRight), applyTo(ifElseApply)));

    var swipeLeftCheck = compose3(swipeLeftColours, always, ifElseApplyCurry(isLeft));

    var calcColour = function calcColour(width) {
      return function (deltaX) {
        return function (activeIndx) {
          return function (wines) {
            return compose3(backgroundColour, mapComposePipe3)(width)(deltaX)(colours[activeIndx])(activeIndx)(wines)([swipeLeftCheck, swipeRightCheck]);
          };
        };
      };
    };

    var handleTouchStart = function handleTouchStart(model, _ref9) {
      var x = _ref9.x;

      return updateModel({
        model: model,
        obj: {
          startX: x,
          shouldTransition: false,
          shouldSwipeAway: false,
          bgColour: colourArrayToString(colours[model.activeIndx])
        }
      });
    };

    var handleTouchMove = function handleTouchMove(model, _ref10) {
      var x = _ref10.x;

      var deltaX = model.startX - x;
      var swipeDir = deltaX > 0 ? direction.LEFT : direction.RIGHT;
      var bgColour = calcColour(model.width)(deltaX)(model.activeIndx)(model.wines)(swipeDir);

      return updateModel({
        model: model,
        obj: {
          deltaX: deltaX,
          swipeDir: swipeDir,
          bgColour: bgColour
        }
      });
    };

    var handleTouchEnd = function handleTouchEnd(model) {
      var shouldSwipeAway = canSwipe(model);
      var activeIndx = applyMapAndSum(model)([indxChange(shouldSwipeAway), prop('activeIndx')]);
      var offset = getOffset(shouldSwipeAway)(model);

      return updateModel({
        model: model,
        obj: {
          deltaX: 0,
          offset: offset,
          shouldSwipeAway: shouldSwipeAway,
          shouldTransition: true,
          activeIndx: activeIndx,
          swipeDir: direction.NEITHER,
          bgColour: colourArrayToString(colours[activeIndx])
        }
      });
    };

    var handleClick = function handleClick(model) {
      return updateModel({
        model: model,
        obj: {
          expanded: !model.expanded
        }
      });
    };

    var update = function update(model) {
      return function (_ref11) {
        var action = _ref11.action;
        var payload = _ref11.payload;

        switch (action) {
          case actions.TOUCH_START:
            return handleTouchStart(model, payload);
            break;
          case actions.TOUCH_MOVE:
            return handleTouchMove(model, payload);
            break;
          case actions.TOUCH_END:
            return handleTouchEnd(model, payload);
            break;
          case actions.CLICK:
            return handleClick(model);
            break;
          default:
            throw new Error('unknown action');
        }
      };
    };

    // view

    var transformWithCalc = function transformWithCalc(start) {
      return function (end) {
        return 'transform: translateX(calc(' + start + ' - ' + end + 'px));';
      };
    };

    var initCardTransform = compose(flip(transformWithCalc)(0), addStyle);

    var calcTransformAndApply = compose(mult(100), add(7.5), toString, flip(concatCurry2)('vw'), initCardTransform);

    var addActiveClass = addClass('wine_card--active');

    var ifEqAddActiveClass = function ifEqAddActiveClass(activeIndx) {
      return function (indx) {
        return ifElseApplyAlwaysEq(activeIndx)(indx)(addActiveClass)(identity);
      };
    };

    var positionCard = function positionCard(activeIndx) {
      return function (el, indx) {
        return compose(calcTransformAndApply(indx), ifEqAddActiveClass(activeIndx)(indx))(el);
      };
    };

    var addTransition = flipIfElseCurry('transition: transform 100ms ease-out;')('');

    var calcStyle = compose2(transformWithCalc, compose(concatCurry2, compose2(pairs, applyTo(compose))(addTransition)));

    var indxOffset = compose(mult(100), compose(add(7.5), toString, flip(concatCurry2)('vw')));

    var isBottleStart = function isBottleStart(target) {
      return function (action) {
        return and(hasClass('wine_bottle')(target))(eq(action)(actions.TOUCH_START));
      };
    };

    var isBottleEnd = function isBottleEnd(target) {
      return function (action) {
        return and(hasClass('wine_bottle')(target))(eq(action)(actions.TOUCH_END));
      };
    };

    var initStyles = function initStyles(model) {
      return compose(addClass('wine'), compose(prop('bgColour'), addStyle)(model));
    };

    var styleAndAppend = compose2(initStyles, appendChild);

    var toggleExpandedClass = function toggleExpandedClass(_ref12) {
      var expanded = _ref12.expanded;
      return ifElseApply(always(expanded), addClass, removeClass);
    };

    var addColourStyle = function addColourStyle(_ref13) {
      var bgColour = _ref13.bgColour;
      return addStyle(bgColour);
    };

    var toggleClassAndChangeStyle = compose(flipApplyMap([flip(toggleExpandedClass)('wine--expanded'), addColourStyle]), applyTo(compose));

    var updateCard = function updateCard(_ref14) {
      var deltaX = _ref14.deltaX;
      var offset = _ref14.offset;
      var shouldTransition = _ref14.shouldTransition;
      var activeIndx = _ref14.activeIndx;
      return function (el, indx) {
        compose(addStyle(calcStyle(indxOffset(indx))(deltaX + offset)(shouldTransition)), toggleClass(eq(activeIndx)(indx))('wine_card--active'))(el);
      };
    };

    var updateEachCard = compose(updateCard, map, compose(pairs(Array.from), applyTo(compose)));

    var queryAndUpdateCards = compose(updateEachCard, compose(pairs(queryAll('.wine_card')), applyTo(compose)));

    var eventListener = function eventListener(update) {
      return function (action) {
        return function (evt) {
          evt.preventDefault();

          var target = evt.target;
          var touches = evt.touches;

          if (isBottleEnd(target)(action)) return;

          if (isBottleStart(target)(action)) return update({ action: actions.CLICK });

          if (!hasClass('draggable')(target)) return;

          var firstTouch = Array.from(touches)[0];
          var payload = {};

          if (firstTouch) {
            payload.x = firstTouch.clientX;
            payload.y = firstTouch.clientY;
          }

          return update({ action: action, payload: payload });
        };
      };
    };

    var addEventListener = function addEventListener(eventName) {
      return function (listener) {
        return function (el) {
          el.addEventListener(eventName, listener);

          return el;
        };
      };
    };

    var template = function template(_ref15) {
      var name = _ref15.name;
      var fullName = _ref15.fullName;
      var price = _ref15.price;
      var imgSrc = _ref15.imgSrc;
      var desc = _ref15.desc;
      var origin = _ref15.origin;
      var type = _ref15.type;
      var alcohol = _ref15.alcohol;
      return '\n    <div class="wine_overlay draggable"></div>\n    <div class="wine_title draggable">\n      <div class="wine_title_main draggable">\n        ' + name + '\n      </div>\n      <div class="wine_title_sub draggable">\n        ' + fullName + '\n      </div>\n    </div>\n    <div class="wine_bottle-container">\n      <img class="wine_bottle" src="' + imgSrc + '">\n      <div class="wine_bottle-shadow draggable"></div>\n    </div>\n    <div class="wine_price draggable">\n      $ ' + price + '.00\n    </div>\n    <div class="wine_separator draggable"></div>\n    <div class="wine_details draggable">\n      <div class="wine_details_text draggable">\n        ' + desc + '\n      </div>\n      <div class="wine_details_table draggable">\n        <div class="wine_origin wine_row">\n          <div class="wine_label">Origin</div>\n          <div class="wine_value">' + origin + '</div>\n        </div>\n        <div class="wine_type wine_row">\n          <div class="wine_label">Wine Type</div>\n          <div class="wine_value">' + type + '</div>\n        </div>\n        <div class="wine_alcohol wine_row">\n          <div class="wine_label">Alcohol</div>\n          <div class="wine_value">' + alcohol + '%</div>\n        </div>\n      </div>\n    </div>\n    <div class="wine_button-container draggable">\n      <div class="wine_button">\n        BUY NOW\n      </div>\n    </div>\n  ';
    };

    var createCard = function createCard(wine, indx) {
      var card = document.createElement('div');
      card.className = 'wine_card card_' + indx;
      card.textContent = wine.name;
      card.innerHTML = template(wine);

      return card;
    };

    var view = function view(el, _ref16, update) {
      var activeIndx = _ref16.activeIndx;
      var wines = _ref16.wines;

      var doUpdate = eventListener(update);

      compose(addEventListener('touchstart')(doUpdate(actions.TOUCH_START)), addEventListener('touchmove')(doUpdate(actions.TOUCH_MOVE)), addEventListener('touchend')(doUpdate(actions.TOUCH_END)))(el);

      composeWrap(map)(createCard, positionCard(activeIndx), styleAndAppend(model)(el))(wines.slice(0));
    };

    var updateView = compose(flip(applyMap)([toggleClassAndChangeStyle, queryAndUpdateCards]), applyTo(compose));

    // app

    var data = [{
      name: 'Barolo',
      fullName: 'Barolo di castiglione falletto',
      imgSrc: 'barolo.png',
      price: 550,
      desc: 'Made from the Nebbiolo grape and is often described as one of Italy\'s greatest wines - it has the ' + 'aroma of tar and roses due to it\'s notable aging',
      origin: 'Piedmont, Italy',
      type: 'DOCG',
      alcohol: 12
    }, {
      name: 'Moscato',
      fullName: 'Moscato d\'asti',
      imgSrc: 'moscato.png',
      price: 550,
      desc: 'Moscato tends to be a popular white wine among wine lovers and enjoys a significant following with ' + 'seasoned wine enthusiasts who enjoy a lighter-styled wine',
      origin: 'Asti, Italy',
      type: 'DOCG',
      alcohol: 11
    }];

    var WineApp = function WineApp(model, update, view, updateView) {
      return function (data) {
        return function (el) {
          var newModel = updateModel({
            model: model,
            obj: {
              wines: data,
              width: el.offsetWidth
            }
          });

          view(el, newModel, function (params) {
            newModel = update(newModel)(params);

            requestAnimationFrame(function () {
              return updateView(newModel)(el);
            });
          });
        };
      };
    };

    WineApp(model, update, view, updateView)(data)(document.getElementById('main'));
  })();
}

//# sourceMappingURL=index-compiled.js.map