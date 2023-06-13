let pizzaListDiv = document.getElementById('pizza');
let filterForm = document.getElementById('filterForm');
let allergenFilter = document.getElementById('allergenFilter');
let orders = [];

async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// task 2
// allergens
function createDefaultSelectOption() {
  let defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select Allergen';
  allergenFilter.appendChild(defaultOption);
}

function addAllergenOptions(allergens) {
  allergens.forEach((allergen) => {
    let option = document.createElement('option');
    option.value = allergen.id;
    option.textContent = allergen.name;
    allergenFilter.appendChild(option);
  });
}

async function fetchAndDisplayAllergens() {
  const data = await fetchData('http://localhost:3000/api/allergen');

  createDefaultSelectOption();
  addAllergenOptions(data);
}

// pizzas
function filterPizzas(pizzas) {
  if (allergenFilter.value !== '') {
    return pizzas.filter((pizza) =>
      pizza.allergens.some((allergen) => allergen.id == allergenFilter.value)
    );
  }
  return pizzas;
}

function createPizzaDiv(pizzas) {
  pizzaListDiv.innerHTML = '';

  pizzas.forEach((pizza) => {
    let pizzaDiv = document.createElement('div');
    pizzaDiv.innerHTML = `
      <h1>
        <b>${pizza.name}</b>
        <span class="w3-right w3-tag w3-dark-grey w3-round">${pizza.price.toFixed(
          2
        )}</span>
      </h1>
      <p id="description" class="w3-text-grey">${pizza.description}</p>
      <div id="ingredients" class="w3-text-grey">Made with love and ${pizza.ingredients.join(
        ', '
      )}</div>
      <div id="allergens" class="w3-text-grey">Allergens: ${pizza.allergens
        .map((allergen) => allergen.name)
        .join(', ')}</div>
        <label for="amount${pizza.id}">Amount:</label>
      <input id="amount${pizza.id}" type="number" min="1">
      <button onclick="addToOrder(${pizza.id})">Add</button>
      <hr />
    `;
    pizzaListDiv.appendChild(pizzaDiv);
  });
}

async function fetchAndDisplayPizzas() {
  let pizzas = await fetchData('http://localhost:3000/pizza/list');
  pizzas = filterPizzas(pizzas);
  createPizzaDiv(pizzas);
}

// task 4
// orders
// functions
function addToOrder(pizzaId) {
  let amountInput = document.getElementById(`amount${pizzaId}`);
  let amount = Number(amountInput.value);

  if (isNaN(amount) || amount < 1) {
    alert('Invalid amount');
    return;
  }

  let existingPizzaOrder = orders.find(
    (pizzaOrder) => pizzaOrder.id === pizzaId
  );
  if (existingPizzaOrder) {
    existingPizzaOrder.amount += amount;
  } else {
    orders.push({ id: pizzaId, amount });
  }

  amountInput.value = '';
  displayOrderForm();
}

function createDecreaseBtn(pizzaOrder, pizzaLine) {
  let decreaseButton = document.createElement('button');
  decreaseButton.classList.add('decrease-Btn');
  decreaseButton.textContent = '-';
  decreaseButton.addEventListener('click', () => {
    if (pizzaOrder.amount > 0) {
      pizzaOrder.amount--;
    }
    displayOrderForm();
  });
  pizzaLine.appendChild(decreaseButton);
}

function createIncreaseBtn(pizzaOrder, pizzaLine) {
  let increaseButton = document.createElement('button');
  increaseButton.classList.add('increase-Btn');
  increaseButton.textContent = '+';
  increaseButton.addEventListener('click', () => {
    pizzaOrder.amount++;
    displayOrderForm();
  });
  pizzaLine.appendChild(increaseButton);
}

function createDeleteBtn(orders, pizzaLine, index) {
  let deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-Btn');
  deleteButton.textContent = 'Del';
  deleteButton.addEventListener('click', () => {
    orders.splice(index, 1);
    displayOrderForm();
  });
  pizzaLine.appendChild(deleteButton);
}

function calculatePizzaPrice(pizzaOrder, pizzas) {
  const pizza = pizzas.find((pizza) => pizza.id === pizzaOrder.id);
  return parseFloat((pizza.price * pizzaOrder.amount).toFixed(2));
}

function calculateOverallTotal(orders, pizzas) {
  let total = orders.reduce((acc, pizzaOrder) => {
    const pizzaPrice = calculatePizzaPrice(pizzaOrder, pizzas);
    return acc + pizzaPrice;
  }, 0);

  return parseFloat(total.toFixed(2));
}

function createAndAppendPizzaText(pizzaLine, pizzaName, pizzaAmount) {
  let pizzaText = document.createElement('span');
  pizzaText.textContent = `${pizzaName}: ${pizzaAmount} `;
  pizzaLine.appendChild(pizzaText);
}

function createAndAppendTotalText(pizzaLine, totalPizzaPrice) {
  let totalText = document.createElement('p');
  totalText.textContent = `Total: ${totalPizzaPrice} potatoes`;
  pizzaLine.appendChild(totalText);
}

function createPizzaLineElement(pizzaOrder, pizzas, index) {
  const pizzaLine = document.createElement('div');
  pizzaLine.classList.add('pizza-border');

  const pizza = pizzas.find((pizza) => pizza.id === pizzaOrder.id);

  createAndAppendPizzaText(pizzaLine, pizza.name, pizzaOrder.amount);
  createDecreaseBtn(pizzaOrder, pizzaLine);
  createIncreaseBtn(pizzaOrder, pizzaLine);
  createDeleteBtn(orders, pizzaLine, index);

  return pizzaLine;
}

function appendOverallTotal(orderSummaryDiv, overallTotal) {
  let totalLine = document.createElement('p');
  totalLine.textContent = `Overall total: ${overallTotal} potatoes`;
  orderSummaryDiv.appendChild(totalLine);
}

function handleOrderResponse(response) {
  if (response.ok) {
    orders = [];
    alert('Order placed successfully');
  } else {
    alert('Failed to place order');
  }
}

function getOrderDetailsFromForm() {
  let name = document.getElementById('name').value;
  let email = document.getElementById('email').value;
  let city = document.getElementById('city').value;
  let street = document.getElementById('street').value;

  if (!name || !email || !city || !street) {
    alert('Please fill in all fields');
    return null;
  }

  return {
    pizzas: orders,
    customer: {
      name,
      email,
      address: {
        street,
        city,
      },
    },
  };
}

// async functions
async function fetchPizzas() {
  const pizzas = await fetchData('http://localhost:3000/pizza/list');
  return pizzas;
}

async function displayOrderForm() {
  let orderFormDiv = document.getElementById('orderForm');
  let orderSummaryDiv = document.getElementById('orderSummary');

  if (orders.length > 0) {
    orderFormDiv.style.display = 'block';
    let pizzas = await fetchPizzas();
    orderSummaryDiv.innerHTML = '';
    let overallTotal = 0;

    orders.forEach((pizzaOrder, index) => {
      const totalPizzaPrice = calculatePizzaPrice(pizzaOrder, pizzas);
      const pizzaLine = createPizzaLineElement(pizzaOrder, pizzas, index);

      createAndAppendTotalText(pizzaLine, totalPizzaPrice);
      overallTotal += totalPizzaPrice;

      orderSummaryDiv.appendChild(pizzaLine);
    });

    appendOverallTotal(orderSummaryDiv, overallTotal);
  } else {
    orderFormDiv.style.display = 'none';
  }
}

async function submitOrderDetails(orderDetails) {
  let response = await fetch('http://localhost:3000/api/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderDetails),
  });

  return response;
}

async function submitOrder() {
  let orderDetails = getOrderDetailsFromForm();

  if (!orderDetails) {
    return;
  }

  let response = await submitOrderDetails(orderDetails);
  handleOrderResponse(response);
  displayOrderForm();
}

// main
async function main() {
  await fetchAndDisplayAllergens();
  filterForm.onchange = fetchAndDisplayPizzas;
  await fetchAndDisplayPizzas();
}

main();
