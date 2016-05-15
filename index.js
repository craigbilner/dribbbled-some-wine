{
  // utils

  const identity = x => x;

  const always = x => () => x;

  const prop = key => obj => obj[key];

  const and = a => b => a && b;

  const add = a => b => a + b;

  const subtract = a => b => a - b;

  const map = func => data => data.map(func);

  const reduce = func => init => data => data.reduce(func, init);

  const sum = reduce((a, b) => add(a)(b))(0);

  const ifElse = (condition, truthey, falsey) => a => condition(a) ? truthey(a) : falsey(a);

  const ifElse2 = (condition, truthey, falsey) => a => b => condition(a)(b) ? truthey(a)(b) : falsey(a)(b);

  const ifElseCurry = condition => truthey => falsey => a => condition(a) ? truthey(a) : falsey(a);

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

  const isSwipingOff = ifElse(
    swipingOffRight,
    always(true),
    swipingOffLeft
  );

  const pcntOffset = ({ deltaX, width }) => Math.abs(deltaX) / width * 100;

  const outside40 = pcntOffset => pcntOffset > 40;

  const isOutsideTolerance = compose(pcntOffset, outside40);

  const canSwipe = ifElse(isSwipingOff, always(false), isOutsideTolerance);

  const isLeft = dir => dir === direction.LEFT;

  const isRight = dir => dir === direction.RIGHT;

  const modelIsLeft = compose(prop('swipeDir'), isLeft);

  const hasSweptLeft = transformAndCompose([always(modelIsLeft), and]);

  const addToOffset = compose(prop('offset'), add);

  const subtractFromOffset = compose(prop('offset'), subtract);

  const viewportWidth = alwaysProp('width');

  const currentOffset = alwaysProp('offset');

  const determineOffset = ifElse2(always, always(subtractFromOffset), always(currentOffset));

  const calculateOffset = ifElse2(hasSweptLeft, always(addToOffset), determineOffset);

  const indxChange = ifElse2(always, always(crementIndx), always2(0));

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

  const swipeRightCheck = compose3(swipeRightColours, always, compose(pairs(isRight), applyTo(ifElse)));

  const swipeLeftCheck = compose3(swipeLeftColours, always, ifElseCurry(isLeft));

  const argsPipeToCompose = (a, b) => compose(a)(b);

  const applyToComposePair = compose2(pairs, applyTo(compose));

  const mapComposePipe3 = compose3(applyMap3, flip(applyToComposePair)(applyTo(argsPipeToCompose)));

  const calcColour = width => deltaX => activeIndx => wines =>
    compose3(backgroundColour, mapComposePipe3)(width)(deltaX)(colours[activeIndx])(activeIndx)(wines)([swipeLeftCheck, swipeRightCheck]);

  const handleTouchStart = (model, { x }) => {
    return updateModel({
      model,
      obj: {
        startX: x,
        shouldTransition: false,
        shouldSwipeAway: false,
        bgColour: applyTo(colourObjToString)(colourObjToArray(colours[model.activeIndx])),
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
        bgColour: applyTo(colourObjToString)(colourObjToArray(colours[activeIndx])),
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

  const createCard = wine => {
    const card = document.createElement('div');
    card.className = 'wine_card';
    card.textContent = wine.name;

    return card;
  };

  const cardTransform = offset => `transform: translate(${offset}vw, 15vh)`;

  const positionCard = activeIndx => (el, indx) => {
    if (activeIndx === indx) {
      el.classList.add('wine_card--active');
    }

    el.style = cardTransform(7.5 + (100 * indx));

    return el;
  };

  const eventListener = update => action => ({ target, touches }) => {
    if (hasClass('wine_card')(target)) {
      const firstTouch = touches[0];
      const payload = {};

      if (firstTouch) {
        payload.x = firstTouch.clientX;
        payload.y = firstTouch.clientY;
      }

      return update({ action, payload });
    }
  };

  const view = (el, { activeIndx, wines }, update) => {
    const doUpdate = eventListener(update);

    el.addEventListener('touchstart', doUpdate(actions.TOUCH_START));
    el.addEventListener('touchmove', doUpdate(actions.TOUCH_MOVE));
    el.addEventListener('touchend', doUpdate(actions.TOUCH_END));

    el.className = 'wine';
    el.style = 'background-color: rgba(238, 123, 111, 1);';

    composeWrap(map)(createCard, positionCard(activeIndx), appendChild(el))(wines.slice(0));
  };

  const calcStyle = (deltaX, offset, shouldTransition) => initOffset => {
    let style = `transform: translate(calc(${initOffset} - ${deltaX + offset}px), 15vh);`;

    if (shouldTransition) {
      style += ' transition: transform 100ms ease-out;';
    }

    return style;
  };

  const updateCard = model => (el, indx) => {
    const styleCalc = calcStyle(model.deltaX, model.offset, model.shouldTransition);

    el.style = styleCalc(`${7.5 + (indx * 100)}vw`);

    if (model.activeIndx === indx) {
      if (!hasClass('wine_card--active')(el)) {
        el.classList.add('wine_card--active');
      }
    } else {
      if (hasClass('wine_card--active')(el)) {
        el.classList = Array.from(el.classList).shift();
      }
    }
  };

  const updateView = el => model => {
    el.style = model.bgColour;

    return map(updateCard(model))(Array.from(el.querySelectorAll('.wine_card')));
  };

  // app

  const data = [
    {
      name: 'Barolo',
      fullName: 'Barolo di castiglione falletto',
      price: 550,
    },
    {
      name: 'Moscato',
      fullName: 'Moscato d\'asti',
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
