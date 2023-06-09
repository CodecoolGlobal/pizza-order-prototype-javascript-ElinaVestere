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

app.get('/api/pizza', (req, res) => {
  console.log('GET at /api/pizza');

  res.json(pizzas);
});

app.get('/api/allergen', (req, res) => {
  console.log('GET at /api/allergen');

  res.json(allergens);
});

app.get('/pizza/list', (req, res) => {
  console.log('GET at /pizza/list');

  // find allergens
  const getAllergensForPizza = (pizza) => {
    const pizzaAllergens = allergens.filter((allergen) =>
      pizza.allergens.includes(allergen.id)
    );

    return pizzaAllergens;
  };

  // add allergens to pizza
  const pizzasWithAllergens = pizzas.map((pizza) => {
    const allergenForThisPizza = getAllergensForPizza(pizza);
    return { ...pizza, allergens: allergenForThisPizza };
  });

  res.json(pizzasWithAllergens);
});

app.get('/api/order', (req, res) => {
  console.log('GET at /api/order');

  res.json(orders);
});

app.post('/api/order', (req, res) => {
  console.log('POST at /api/order');

  let receivedOrder = req.body;

  // simple id generation for new order
  let maxOrderId = 0;
  if (orders.length > 0) {
    const orderIds = orders.map((order) => order.id);
    maxOrderId = Math.max(...orderIds);
  }
  receivedOrder.id = maxOrderId + 1 || 1;

  // add date to the order
  const currentDate = new Date();
  receivedOrder.date = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1, // months are 0-based in JS
    day: currentDate.getDate(),
    hour: currentDate.getHours(),
    minute: currentDate.getMinutes(),
  };

  // Construct the new order object in the desired order
  let newOrder = {
    id: receivedOrder.id,
    pizzas: receivedOrder.pizzas,
    date: receivedOrder.date,
    customer: receivedOrder.customer,
  };

  // push new order into orders list
  orders.push(newOrder);

  // write the new orders list to the file
  fs.writeFile(ordersListPath, JSON.stringify(orders, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send(err);
    }

    // if everything is okay, send the new order back to the client
    res.json(receivedOrder);
  });
});

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});
