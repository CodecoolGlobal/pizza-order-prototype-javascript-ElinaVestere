const express = require('express');
const fs = require(`fs`);
const path = require('path');
const pizzaListPath = './data/pizzas.json';
const allergensListPath = './data/allergens.json';
const ordersListPath = './data/orders.json';
const app = express();
const port = 3000;

let pizzas, allergens, orders;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// app.get('/', (req, res) => {
//   const jsonData = fs.readFileSync('pizzas.json', 'utf8');
//   const data = JSON.parse(jsonData);

//   res.send(data);
//   res.render(index);
// });

fs.readFile(pizzaListPath, 'utf8', (err, data) => {
  console.log('\nreading Pizza List');

  if (err) {
    console.error('Error reading file:', err);
    return res.status(500).send(err);
  }
  pizzas = JSON.parse(data);
});

fs.readFile(allergensListPath, 'utf8', (err, data) => {
  console.log('\nreading Allergens List');

  if (err) {
    console.error('Error reading file:', err);
    return res.status(500).send(err);
  }
  allergens = JSON.parse(data);
});

fs.readFile(ordersListPath, 'utf8', (err, data) => {
  console.log('\nreading Orders List');

  if (err) {
    console.error('Error reading file:', err);
    return res.status(500).send(err);
  }
  orders = JSON.parse(data);
});

// task 1
app.get('/api/pizza', (req, res) => {
  console.log('GET at /api/pizza');

  res.json(pizzas);
});

app.get('/api/allergen', (req, res) => {
  console.log('GET at /api/allergen');

  res.json(allergens);
});

// task 2
function getAllergensForPizza(pizza, allergens) {
  const pizzaAllergens = allergens.filter((allergen) =>
    pizza.allergens.includes(allergen.id)
  );

  return pizzaAllergens;
}

function addAllergensToPizzas(pizzas, allergens) {
  const pizzasWithAllergens = pizzas.map(function (pizza) {
    const allergenForThisPizza = getAllergensForPizza(pizza, allergens);
    return { ...pizza, allergens: allergenForThisPizza };
  });

  return pizzasWithAllergens;
}

app.get('/pizza/list', (req, res) => {
  console.log('GET at /pizza/list');
  const pizzasWithAllergens = addAllergensToPizzas(pizzas, allergens);
  res.json(pizzasWithAllergens);
});

// task 3
app.get('/api/order', (req, res) => {
  console.log('GET at /api/order');

  res.json(orders);
});

function generateOrderId(order) {
  let maxOrderId = 0;
  if (orders.length > 0) {
    const orderIds = orders.map((order) => order.id);
    maxOrderId = Math.max(...orderIds);
  }
  let newOrderId = maxOrderId + 1; /*|| 1 */

  return newOrderId;
}

function generateCurrentDate() {
  const currentDate = new Date();
  let dateDetails = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1, // months are 0-based in JS
    day: currentDate.getDate(),
    hour: currentDate.getHours(),
    minute: currentDate.getMinutes(),
  };

  return dateDetails;
}

function createNewOrder(receivedOrder) {
  let newOrder = {
    id: receivedOrder.id,
    pizzas: receivedOrder.pizzas,
    date: receivedOrder.date,
    customer: receivedOrder.customer,
  };

  return newOrder;
}

app.post('/api/order', (req, res) => {
  console.log('POST at /api/order');

  let receivedOrder = req.body;

  receivedOrder.id = generateOrderId(orders);
  receivedOrder.date = generateCurrentDate();
  let newOrder = createNewOrder(receivedOrder);

  orders.push(newOrder);

  fs.writeFile(ordersListPath, JSON.stringify(orders, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send(err);
    }

    res.json(receivedOrder);
  });
});

app.get('/pages/menu.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/menu.html'));
});

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});
