{
  // utils

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

  const apply = x => func => func(x);

  const applyTo = func => args => func.apply(null, [...args]);

  const compose = (...funcs) => data => reduce((val, func) => func(val))(data)(funcs);

  const composeWrap = wrapper => (...funcs) => data => reduce((val, func) => wrapper(func)(val))(data)(funcs);

  const applyMap = compose(apply, map);

  const always2 = compose(always, always);

  const compose2 = (h, ...tail) => a => applyTo(compose)([h(a), ...tail]);

  const alwaysProp = compose2(prop, always);

  const applyToCompose = args => x => applyTo(compose)(args)(x);

  const applyMapAndSum = compose2(applyMap, sum);

  const flip = func => a => b => func(b)(a);

  const flipApplyMap = flip(applyMap);

  const transformAndCompose = compose2(flip(applyMap), applyToCompose);

  const argToArray2 = a => b => [a, b];

  const freezeIt = Object.freeze;

  const appendChild = container => child => container.appendChild(child);

  const hasClass = className => el => [...el.classList].indexOf(className) > -1;

  // model

  const updateModel = ({ model, obj }) => Object.assign({}, model, obj);

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

  const handleTouchStart = (model, { x }) => {
    return updateModel({
      model,
      obj: {
        startX: x,
        shouldTransition: false,
        shouldSwipeAway: false,
      }
    });
  };

  const handleTouchMove = (model, { x }) => {
    const deltaX = model.startX - x;

    return updateModel({
      model,
      obj: {
        deltaX,
        swipeDir: deltaX > 0 ? direction.LEFT : direction.RIGHT,
      }
    });
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

  const modelIsLeft = compose(prop('swipeDir'), isLeft);

  const hasSweptLeft = transformAndCompose([always(modelIsLeft), and]);

  const addToOffset = compose(prop('offset'), add);

  const subtractFromOffset = compose(prop('offset'), subtract);

  const viewportWidth = alwaysProp('width');

  const currentOffset = alwaysProp('offset');

  const determineOffset = ifElse2(always, always(subtractFromOffset), always(currentOffset));

  const calculateOffset = ifElse2(hasSweptLeft, always(addToOffset), determineOffset);

  const indxChange = ifElse2(always, always(crementIndx), always2(0));

  const offsetArgs = compose(calculateOffset, argToArray2(viewportWidth));

  const transformOffsets = flip(compose2(compose(offsetArgs, always), flipApplyMap));

  const composeOffset = compose2(transformOffsets(), applyToCompose);

  const getOffset = ssa => model => composeOffset(ssa)(model)();

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
        swipeDir: direction.NEITHER
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

    composeWrap(map)(createCard, positionCard(activeIndx), appendChild(el))(wines);
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

  const colourObjToString = ({ r, g, b, a }) => `background-color: rgba(${r}, ${g}, ${b}, ${a});`;

  const colourDiff = (width, deltaX) => (start, end) => {
    return start + Math.round((Math.abs(deltaX / width) * (end - start)));
  };

  const backgroundColour = (width, deltaX) => (s, f) => {
    const diff = colourDiff(width, deltaX);
    const r = diff(s.r, f.r);
    const g = diff(s.g, f.g);
    const b = diff(s.b, f.b);
    const a = 1;

    return colourObjToString({ r, g, b, a });
  };

  const calcColour = ({ width, deltaX, shouldTransition, activeIndx, swipeDir, wines }) => {
    if (shouldTransition || swipeDir === direction.NEITHER) {
      return colourObjToString(colours[activeIndx]);
    } else {
      const bgc = backgroundColour(width, deltaX);
      if (swipeDir === direction.LEFT) {
        return bgc(colours[activeIndx], colours[Math.min(activeIndx + 1, wines.length - 1)]);
      } else if (swipeDir === direction.RIGHT) {
        return bgc(colours[activeIndx], colours[Math.max(activeIndx - 1, 0)]);
      }
    }
  };

  const updateView = el => model => {
    el.style = calcColour(model);

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
