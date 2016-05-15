{
  // utils

  const identity = x => x;

  const always = x => () => x;

  const prop = key => obj => obj[key];

  const eq = a => b => a === b;

  const and = a => b => a && b;

  const not = a => b => a !== b;

  const isFalse = a => a === false;

  const add = a => b => a + b;

  const mult = a => b => a * b;

  const toString = a => a.toString();

  const subtract = a => b => a - b;

  const map = func => data => data.map(func);

  const filter = func => data => data.filter(func);

  const reduce = func => init => data => data.reduce(func, init);

  const sum = reduce((a, b) => add(a)(b))(0);

  const ifElse = (condition, truthey, falsey) => condition ? truthey : falsey;

  const ifElseApply = (condition, truthey, falsey) => a => condition(a) ? truthey(a) : falsey(a);

  const ifElseApply2 = (condition, truthey, falsey) => a => b => condition(a)(b) ? truthey(a)(b) : falsey(a)(b);

  const ifElseApplyCurry = condition => truthey => falsey => a => condition(a) ? truthey(a) : falsey(a);

  const ifElseCurry = condition => truthey => falsey => condition ? truthey : falsey;

  const apply = x => func => func(x);

  const apply3 = x => y => z => func => func(x)(y)(z);

  const applyTo = func => args => func.apply(null, [...args]);

  const applyToUnit = func => a => func.apply(null, [a]);

  const compose = (...funcs) => data => reduce((val, func) => func(val))(data)(funcs);

  const composeWrap = wrapper => (...funcs) => data => reduce((val, func) => wrapper(func)(val))(data)(funcs);

  const applyMap = compose(apply, map);

  const always2 = compose(always, always);

  const compose2 = (h, ...tail) => a => applyTo(compose)([h(a), ...tail]);

  const compose3 = (h, ...tail) => a => b => applyTo(compose)([h(a)(b), ...tail]);

  const compose4 = (h, ...tail) => a => b => c => applyTo(compose)([h(a)(b)(c), ...tail]);

  const applyMap3 = compose3(apply3, map);

  const alwaysProp = compose2(prop, always);

  const applyToCompose = args => x => applyTo(compose)(args)(x);

  const applyMapAndSum = compose2(applyMap, sum);

  const flip = func => a => b => func(b)(a);

  const flipApplyMap = flip(applyMap);

  const transformAndCompose = compose2(flip(applyMap), applyToCompose);

  const pairs = a => b => [a, b];

  const propMap = compose(prop, map);

  const propMapPair = pairs(propMap);

  const applyToCompose2 = applyTo(compose2);

  const flipPropMapPair = compose(compose(propMapPair, applyToCompose2), flip);

  const freezeIt = Object.freeze;

  const appendChild = container => child => container.appendChild(child);

  const concatCurry2 = a => b => a.concat(b);

  const hasClass = className => el => [...el.classList].indexOf(className) > -1;

  const copyObj = obj => (newObj, key) => {
    const value = obj[key];

    if (Array.isArray(value)) {
      newObj[key] = value.slice(0);
    } else {
      newObj[key] = value;
    }

    return newObj;
  };

  const makeCopy = obj => {
    if (!obj) return {};

    return reduce(copyObj(obj))({})(Object.keys(obj));
  };

  // model

  const updateModel = ({ model, obj }) => Object.assign(makeCopy(model), makeCopy(obj));

  const createModel = (model, obj) => {
    if (!obj) return Object.freeze(model);

    return compose(updateModel, freezeIt)({ model, obj });
  };

  const direction = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    NEITHER: 'NEITHER',
  };

  const colours = {
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
      a: 1,
    },
  };

  const model = createModel({
    wines: [],
    startX: 0,
    deltaX: 0,
    offset: 0,
    shouldSwipeAway: false,
    shouldTransition: false,
    activeIndx: 0,
    swipeDir: direction.NEITHER
  });

  // update

  const actions = {
    TOUCH_START: 'TOUCH_START',
    TOUCH_MOVE: 'TOUCH_MOVE',
    TOUCH_END: 'TOUCH_END',
  };

  const crementIndx = ({ swipeDir }) => swipeDir === direction.LEFT ? 1 : -1;

  const isFirstCard = indx => indx === 0;

  const isLastCard = cards => indx => indx === (cards.length - 1);

  const swipingOffRight = ({ swipeDir, activeIndx }) => swipeDir === direction.RIGHT && isFirstCard(activeIndx);

  const swipingOffLeft = ({ swipeDir, activeIndx, wines }) => swipeDir === direction.LEFT && isLastCard(wines)(activeIndx);

  const isSwipingOff = ifElseApply(
    swipingOffRight,
    always(true),
    swipingOffLeft
  );

  const pcntOffset = ({ deltaX, width }) => Math.abs(deltaX) / width * 100;

  const outside40 = pcntOffset => pcntOffset > 20;

  const isOutsideTolerance = compose(pcntOffset, outside40);

  const canSwipe = ifElseApply(isSwipingOff, always(false), isOutsideTolerance);

  const isLeft = dir => dir === direction.LEFT;

  const isRight = dir => dir === direction.RIGHT;

  const modelIsLeft = compose(prop('swipeDir'), isLeft);

  const hasSweptLeft = transformAndCompose([always(modelIsLeft), and]);

  const addToOffset = compose(prop('offset'), add);

  const subtractFromOffset = compose(prop('offset'), subtract);

  const viewportWidth = alwaysProp('width');

  const currentOffset = alwaysProp('offset');

  const determineOffset = ifElseApply2(always, always(subtractFromOffset), always(currentOffset));

  const calculateOffset = ifElseApply2(hasSweptLeft, always(addToOffset), determineOffset);

  const indxChange = ifElseApply2(always, always(crementIndx), always2(0));

  const offsetArgs = compose(calculateOffset, pairs(viewportWidth));

  const transformOffsets = flip(compose2(compose(offsetArgs, always), flipApplyMap));

  const composeOffset = compose2(transformOffsets(), applyToCompose);

  const getOffset = ssa => model => composeOffset(ssa)(model)();

  const colourObjToArray = ({ r, g, b }) => [r, g, b];

  const colourObjToString = (r, g, b) => `background-color: rgba(${r}, ${g}, ${b}, 1);`;

  const colourDiff = width => deltaX => ([start, end]) => start + Math.round((Math.abs(deltaX / width) * (end - start)));

  const extractPairs = compose2(colourDiff, flipPropMapPair);

  const composeColours = compose2(extractPairs, compose(pairs(pairs), applyTo(compose2)));

  const toArr = a => [a];

  const calcColours = compose2(compose(toArr, applyTo(map)), applyTo(colourObjToString));

  const backgroundColour = compose4(composeColours, flip(calcColours)(['r', 'g', 'b']));

  const swipeLeftColours = bgc => activeIndx => wines => bgc(colours[Math.min(activeIndx + 1, wines.length - 1)]);

  const swipeRightColours = bgc => activeIndx => wines => bgc(colours[Math.max(activeIndx - 1, 0)]);

  const swipeRightCheck = compose3(swipeRightColours, always, compose(pairs(isRight), applyTo(ifElseApply)));

  const swipeLeftCheck = compose3(swipeLeftColours, always, ifElseApplyCurry(isLeft));

  const argsPipeToCompose = (a, b) => compose(a)(b);

  const applyToComposePair = compose2(pairs, applyTo(compose));

  const mapComposePipe3 = compose3(applyMap3, flip(applyToComposePair)(applyTo(argsPipeToCompose)));

  const calcColour = width => deltaX => activeIndx => wines =>
    compose3(backgroundColour, mapComposePipe3)(width)(deltaX)(colours[activeIndx])(activeIndx)(wines)([swipeLeftCheck, swipeRightCheck]);

  const colourArrayToString = compose(colourObjToArray, applyTo(colourObjToString));

  const handleTouchStart = (model, { x }) => {
    return updateModel({
      model,
      obj: {
        startX: x,
        shouldTransition: false,
        shouldSwipeAway: false,
        bgColour: colourArrayToString(colours[model.activeIndx]),
      }
    });
  };

  const handleTouchMove = (model, { x }) => {
    const deltaX = model.startX - x;
    const swipeDir = deltaX > 0 ? direction.LEFT : direction.RIGHT;
    const bgColour = calcColour(model.width)(deltaX)(model.activeIndx)(model.wines)(swipeDir);

    return updateModel({
      model,
      obj: {
        deltaX,
        swipeDir,
        bgColour,
      }
    });
  };

  const handleTouchEnd = model => {
    const shouldSwipeAway = canSwipe(model);
    const activeIndx = applyMapAndSum(model)([indxChange(shouldSwipeAway), prop('activeIndx')]);
    const offset = getOffset(shouldSwipeAway)(model);

    return updateModel({
      model,
      obj: {
        deltaX: 0,
        offset,
        shouldSwipeAway,
        shouldTransition: true,
        activeIndx,
        swipeDir: direction.NEITHER,
        bgColour: colourArrayToString(colours[activeIndx]),
      }
    });
  };

  const update = model => ({ action, payload }) => {
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
    default:
      throw new Error('unknown action');
    }
  };

  // view

  const template = ({ name, fullName, price, imgSrc }) => `
    <div class="wine_title">
      <div class="wine_title_main">
        ${name}
      </div>
      <div class="wine_title_sub">
        ${fullName}
      </div>
    </div>
    <img class="wine_bottle" src="${imgSrc}">
    <div class="wine_bottle-shadow"></div>
    <div class="wine_price">
      $ ${price}.00
    </div>
    <div class="wine_separator"></div>
    <div class="wine_button">
      BUY NOW
    </div>
  `;

  const createCard = (wine, indx) => {
    const card = document.createElement('div');
    card.className = `wine_card card_${indx}`;
    card.textContent = wine.name;
    card.innerHTML = template(wine);

    return card;
  };

  const cardTransform = offset => `transform: translate(${offset}vw, 15vh)`;

  const addClass = el => className => {
    el.classList.add(className);

    return el;
  };

  const removeClass = el => className => {
    el.classList.remove(className);

    return el;
  };

  const addStyle = el => elStyle => {
    el.style.cssText = elStyle;

    return el;
  };

  const calcTransformAndApply = compose(mult(100), add(7.5), compose(cardTransform, flip(addStyle)));

  const ifElseApplyAlwaysEq = compose2(eq, compose(always, ifElseApplyCurry));

  const addActiveClass = flip(addClass)('wine_card--active');

  const ifEqAddActiveClass = activeIndx => indx => ifElseApplyAlwaysEq(activeIndx)(indx)(addActiveClass)(identity);

  const positionCard = activeIndx => (el, indx) => compose(calcTransformAndApply(indx), ifEqAddActiveClass(activeIndx)(indx))(el);

  const eventListener = update => action => ({ target, touches }) => {
    if (!hasClass('wine_card')(target)) return;

    const firstTouch = Array.from(touches)[0];
    const payload = {};

    if (firstTouch) {
      payload.x = firstTouch.clientX;
      payload.y = firstTouch.clientY;
    }

    return update({ action, payload });
  };

  const view = (el, { activeIndx, wines }, update) => {
    const doUpdate = eventListener(update);

    el.addEventListener('touchstart', doUpdate(actions.TOUCH_START));
    el.addEventListener('touchmove', doUpdate(actions.TOUCH_MOVE));
    el.addEventListener('touchend', doUpdate(actions.TOUCH_END));

    el.className = 'wine';
    el.style.cssText = 'background-color: rgba(238, 123, 111, 1);';

    composeWrap(map)(createCard, positionCard(activeIndx), appendChild(el))(wines.slice(0));
  };

  const transformWithCalc = start => end => `transform: translate(calc(${start} - ${end}px), 15vh);`;

  const flipIfElseCurry = truthey => falsey => condition => ifElseCurry(condition)(truthey)(falsey);

  const addTransition = flipIfElseCurry('transition: transform 100ms ease-out;')('');

  const calcStyle = compose2(transformWithCalc, compose(concatCurry2, compose2(pairs, applyTo(compose))(addTransition)));

  const indxOffset = compose(mult(100), compose(add(7.5), toString, flip(concatCurry2)('vw')));

  const checkAndHasClass = condition => className => compose(hasClass(className), isFalse, and(condition));

  const removeClassIf = condition => className =>
    ifElseApply(compose(hasClass(className), compose(isFalse, and)(condition)), flip(removeClass)(className), identity);

  const toggleClass = condition => className =>
    ifElseApply(checkAndHasClass(condition)(className), flip(addClass)(className), removeClassIf(condition)(className));

  const updateCard = ({ deltaX, offset, shouldTransition, activeIndx }) => (el, indx) => {
    compose(
      flip(addStyle)(calcStyle(indxOffset(indx))(deltaX + offset)(shouldTransition)),
      toggleClass(eq(activeIndx)(indx))('wine_card--active')
    )(el);
  };

  const updateView = el => model => {
    el.style.cssText = model.bgColour;

    return map(updateCard(model))(Array.from(el.querySelectorAll('.wine_card')));
  };

  // app

  const data = [
    {
      name: 'Barolo',
      fullName: 'Barolo di castiglione falletto',
      imgSrc: 'barolo.png',
      price: 550,
    },
    {
      name: 'Moscato',
      fullName: 'Moscato d\'asti',
      imgSrc: 'moscato.png',
      price: 550,
      desc: 'Moscato tends to be a popular white wine among wine lovers and enjoys a significant following with ' +
      'seasoned wine enthusiasts who enjoy a lighter-styled wine',
      origin: 'Asti, Italy',
      type: 'DOCG',
      alcohol: 11,
    },
  ];

  const WineApp = (model, update, view, updateView) => data => el => {
    let newModel = updateModel({
      model,
      obj: {
        wines: data,
        width: el.offsetWidth,
      }
    });

    view(el, newModel, params => {
      newModel = update(newModel)(params);

      requestAnimationFrame(() => updateView(el)(newModel));
    });
  };

  WineApp(model, update, view, updateView)(data)(document.getElementById('main'));
}
