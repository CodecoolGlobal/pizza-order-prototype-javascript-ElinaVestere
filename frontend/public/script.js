let pizzaListDiv = document.getElementById('pizza');
let filterForm = document.getElementById('filterForm');
let allergenFilter = document.getElementById('allergenFilter');

async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

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
        <span class="w3-right w3-tag w3-dark-grey w3-round">$${pizza.price.toFixed(
          2
        )}</span>
      </h1>
      <p id="description" class="w3-text-grey">${pizza.description}</p>
      <div id="ingredients" class="w3-text-grey">Ingredients: ${pizza.ingredients.join(
        ', '
      )}</div>
      <div id="allergens" class="w3-text-grey">Allergens: ${pizza.allergens
        .map((allergen) => allergen.name)
        .join(', ')}</div>
      <hr />
    `;
    pizzaListDiv.appendChild(pizzaDiv);
  });
}

async function fetchAndDisplayPizzas() {
  let pizzas = await fetchData('http://localhost:3000/api/pizza/allergens');
  pizzas = filterPizzas(pizzas);
  createPizzaDiv(pizzas);
}

// main
async function main() {
  await fetchAndDisplayAllergens();
  filterForm.onchange = fetchAndDisplayPizzas;
  await fetchAndDisplayPizzas();
}

main();
