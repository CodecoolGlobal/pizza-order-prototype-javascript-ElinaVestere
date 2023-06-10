const apiPizzaBtn = document.getElementById('api-pizza-btn');
const apiAllergensBtn = document.getElementById('api-allergens-btn');
const apiListBtn = document.getElementById('api-list-btn');
const apiOrderBtn = document.getElementById('api-order');
const menuBtn = document.getElementById('menu');

apiPizzaBtn.addEventListener('click', function () {
  window.location.href = 'http://localhost:3000/api/pizza';
});

apiAllergensBtn.addEventListener('click', function () {
  window.location.href = 'http://localhost:3000/api/allergen';
});

apiListBtn.addEventListener('click', function () {
  window.location.href = 'http://localhost:3000/pizza/list';
});

apiOrderBtn.addEventListener('click', function () {
  window.location.href = 'http://localhost:3000/api/order';
});

menuBtn.addEventListener('click', function () {
  window.location.href = './pages/menu.html';
});
