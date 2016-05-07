{
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

  const map = func => data => data.map(func);

  const reduce = func => init => data => data.reduce(func, init);

  const compose = (...funcs) => data => reduce((val, func) => func(val))(data)(funcs);

  const objKeys = Object.keys;

  const freezeIt = Object.freeze;

  const writeMissingKeys = (newModel, key) => {
    if (!newModel[key]) {
      newModel[key] = model[key];
    }

    return newModel;
  };

  const updateModel = ({ model, obj }) => reduce(writeMissingKeys)(obj)(objKeys(model));

  const createModel = (model, obj) => {
    if (!obj) return Object.freeze(model);

    return compose(updateModel, freezeIt)({ model, obj });
  };

  const WineApp = (model, update, view) => data => el => {
    view(el, createModel(model, {
      wines: data,
    }));
  };

  const model = createModel({});

  const update = () => {
  };

  const appendChild = container => child => container.appendChild(child);

  const createCards = wine => {
    const card = document.createElement('div');
    card.className = 'wine_card';

    return card;
  };

  const makeActive = activeIndx => (el, indx) => {
    if (activeIndx === indx) {
      el.classList.add('card--active');
    }

    return el;
  };

  const view = (el, model) => {
    el.className = 'wine';
    el.style = 'background-color: rgba(238, 123, 111, 1);';
    compose(map(createCards), map(makeActive(0)), map(appendChild(el)))(model.wines);
  };

  WineApp(model, update, view)(data)(document.getElementById('main'));
}
