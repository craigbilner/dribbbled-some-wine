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

  const WineApp = (model, update, view) => data => el => {
    view(el);
  };

  const model = Object.freeze({});

  const update = () => {
  };

  const view = (el) => {
    el.innerHTML = 'tests';
  };

  WineApp(model, update, view)(data)(document.getElementById('main'))
}
