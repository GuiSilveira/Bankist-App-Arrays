'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-05-07T17:01:17.194Z',
    '2022-05-08T23:36:17.929Z',
    '2022-05-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 100;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // Fake Always Logged In
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Experimenting with the API
// const now = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'numeric',
//   year: 'numeric',
// };
// const locale = navigator.language;

// labelDate.textContent = new Intl.DateTimeFormat(
//   currentAccount.locale,
//   options
// ).format(now);

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Converting and Checking Numbers
console.log(23 === 23.0);
// Base 10
// Binary base 2
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number('23'));
console.log(+'23');

// Parsing - Parse Float é o melhor jeito de verificar caso tenhamos uma unidade de medida
console.log(Number.parseInt('30px'), 10); // A string precisa começar com um número
console.log(Number.parseInt('e23'), 10); // Segundo argumento é o redix que explicita a base

console.log(Number.parseFloat('2.5rem')); // Int para na parte absolutq
console.log(Number.parseFloat('   2.5rem    ')); // Funciona

console.log(parseFloat('   2.5rem   ')); // Forma menos recomendada, pois não tem o
//namespace Number

// Check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0)); // Infinity is NaN - retorna true

// Checking if value is number (especialmente os números float point)
console.log(Number.isFinite(20)); // Melhor jeito de checar se é um número ou não
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0)); // retorna false

// Checking if value is interger
console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // false

// 171. Math and Rounding

console.log(Math.sqrt(25)); // Raiz quadrada
console.log(25 ** (1 / 2)); // Raiz quadrada usando exponenciação
console.log(25 ** (1 / 3)); // Raiz cúbica usando exponenciação

console.log(Math.max(5, 18, 23, 11, 2)); // Retorna o valor máximo
console.log(Math.max(5, 18, '23', 11, 2)); // Faz type coercion, mas não parsing
console.log(Math.max(5, 18, '23px', 11, 2)); // retorna NaN

console.log(Math.min(5, 18, 23, 11, 2)); // Retorna o mínimo

// O Objeto Math possui constantes
console.log(Math.PI * Number.parseFloat('10px') ** 2); // PI é uma constante no Objeto (Namespace) Math

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

// Rounding intergers - Todos os métodos fazem type coercion
console.log(Math.trunc(23.3)); // Retorna o valor absoluto
console.log(Math.round(23.9)); // Arredonda para o inteiro mais próximo
console.log(Math.abs(23)); // Retorna o valor absoluto (Apenas inteiros)- seja positivo ou negativo
console.log(Math.ceil('23.3')); // Arredonda pra cima
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3)); // Arredonda pra baixo
console.log(Math.floor('23.9'));

// Com números negativos é diferente
console.log(Math.trunc(-23.3)); // Retorna 23
console.log(Math.floor(-23.3)); // Retorna 24 - Melhor para funções gerais

// Rouding decimals - JavaScript faz boxing: transforma o número em um Number object e converte de volta para um primitivo após o fim da operação
console.log((2.7).toFixed(0)); // Retorna string com valor 3
console.log((2.7).toFixed(3)); // Retorna 2.700
console.log(+(2.345).toFixed(2)); // Retorna 2.35, mas como número e não string

// The Remainder Operator
console.log(5 % 2);
console.log(8 % 3);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));

// Numeric Separators

// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

console.log(Number('230_000')); // Não funciona
console.log(parseInt('230_000')); // Não funciona

// Working with BigInt
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(1923471284198278347178723984717324978192847n); // BigInt
console.log(BigInt(1923471284198278347178723984717324978192847)); // Ainda apresenta imprecisão, melhor usar com números pequenos

// Operations
console.log(10000n + 10000n);
console.log(12341234129834871283481234n * 100000000000000n);
console.log(Math.sqrt(16n)); // Não funciona!

const huge = 1235345234263456456n;
const num = 23;
// console.log(huge * num); // Erro
console.log(huge * BigInt(num));

// Exceções
console.log(20n > 15); // Funciona!
console.log(20n === 20); // Não faz type coercion, portanto não funciona!
console.log(typeof 20n);
console.log(20n == 20); // Funciona! Tem type coercion
console.log(20n == '20');

// String concat
console.log(huge + ' is REALLY big'); // Funciona, pois o BigInt é convertido para String!

// Divisions
console.log(10n / 3n); // É um inteiro 3n! Retorna o big int mais próximo, cortando a parte decimal
console.log(10 / 3);

// Creating Dates

// const now = new Date();
console.log(now);

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015')); // Funciona, mas não é uma boa ideia usar isso.
console.log(new Date(account1.movementsDates[0])); // O Z significa o UTC
console.log(new Date(2037, 10, 19, 15, 23, 5)); // Ano, mês + 1 (0 based), dia, hora, min, sec
console.log(new Date(2037, 10, 31)); // Corrige para o próx dia, pois nov só tem 30 dias

console.log(new Date(0)); // Tempo após o UNIX time em Milissegundos (1º Janeiro de 1970)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Days to milliseconds - TimeStamp é o resultado dessa operação (Milliseconds dps de 1º Janeiro de 1970)

// Working with dates
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future);
console.log(future.getFullYear()); // Retorna 2037 - NUNCA USE getYear()
console.log(future.getMonth()); // Retorna 10 - Novembro - 0 based (começa em 0)
console.log(future.getDate()); // Retorna o dia do mês
console.log(future.getDay()); // Retorna o dia da semana em números - 0 a 6
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // Data internacional
console.log(future.getTime()); // TimeStamp

console.log(new Date(future.getTime())); // Converte a TimeStamp para Data
console.log(Date.now()); // Retorna a timestamp do momento atual

console.log(future.setFullYear(2040)); // Seta o ano da data, existe um set pra todos os get

// Operations with Dates
const futureDate = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1);

// Internationalizing Numbers (Intl)

const numberIntl = 3884764.23;

const options = {
  style: 'currency',
  currency: 'EUR',
  useGrouping: false,
};

console.log(new Intl.NumberFormat('en-US', options).format(numberIntl)); // USA
console.log(new Intl.NumberFormat('de-DE', options).format(numberIntl)); // Alemanha
console.log(new Intl.NumberFormat('ar-SY', options).format(numberIntl)); // Síria
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(numberIntl)
);

// Timers

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
