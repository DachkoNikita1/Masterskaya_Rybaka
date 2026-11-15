
// ======================================
// МАЙСТЕРНЯ РИБАЛКИ — ГОЛОВНИЙ СКРИПТ
// ======================================

// Товари магазину
const products = [
    { id: 1, name: "Поплавець", price: 25, category: "fishing" },
    { id: 2, name: "Волосінь", price: 50, category: "fishing" },
    { id: 3, name: "Гачки", price: 20, category: "fishing" },
    { id: 4, name: "Повідець", price: 15, category: "fishing" },
    { id: 5, name: "Поплавцева оснастка", price: 37, category: "fishing" },
    { id: 6, name: "Дробинки", price: 20, category: "fishing" },
    { id: 7, name: "Вертлюжки", price: 25, category: "fishing" },
    { id: 8, name: "Органайзер", price: 60, category: "craft" },
    { id: 9, name: "Дерев'яний сувенір", price: 80, category: "craft" },
    { id: 10, name: "Декор", price: 70, category: "craft" },
    { id: 11, name: "Калькулятор", price: 30, category: "software" },
    { id: 12, name: "Гра", price: 50, category: "software" }
];

// ======================================
// КОШИК ТА ЗБЕРЕЖЕННЯ
// ======================================

const CART_KEY = "fishingCart";

let cart = [];

try {
    const savedCart = localStorage.getItem(CART_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];

    if (!Array.isArray(cart)) {
        cart = [];
    }

    cart = cart.filter(item =>
        products.some(product => product.id === Number(item.id)) &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );

    cart = cart.map(item => ({
        id: Number(item.id),
        quantity: Number(item.quantity)
    }));

} catch (error) {
    cart = [];
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Не вдалося зберегти кошик:", error);
    }
}

// ======================================
// ДОДАВАННЯ ТОВАРУ
// ======================================

function addToCart(id) {
    id = Number(id);

    const product = products.find(item => item.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: id,
            quantity: 1
        });
    }

    updateCart();
}

// ======================================
// ВИДАЛЕННЯ ТОВАРУ
// ======================================

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== Number(id));
    updateCart();
}

// ======================================
// ЗМІНА КІЛЬКОСТІ
// ======================================

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === Number(id));

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    updateCart();
}

// ======================================
// ОНОВЛЕННЯ КОШИКА
// ======================================

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);

        if (product) {
            total += product.price * item.quantity;
            count += item.quantity;
        }
    });

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (cartTotal) {
        cartTotal.textContent = total + " грн";
    }

    if (cartItems) {
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = "<p>Ваш кошик порожній.</p>";
        } else {
            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);

                if (!product) return;

                const itemElement = document.createElement("div");
                itemElement.className = "cart-item";

                const name = document.createElement("span");
                name.textContent = product.name;

                const price = document.createElement("span");
                price.textContent = product.price * item.quantity + " грн";

                const quantity = document.createElement("span");
                quantity.textContent = "Кількість: " + item.quantity;

                const controls = document.createElement("div");
                controls.className = "cart-controls";

                const minus = document.createElement("button");
                minus.textContent = "−";
                minus.dataset.action = "decrease";
                minus.dataset.id = item.id;

                const plus = document.createElement("button");
                plus.textContent = "+";
                plus.dataset.action = "increase";
                plus.dataset.id = item.id;

                const remove = document.createElement("button");
                remove.textContent = "Видалити";
                remove.dataset.action = "remove";
                remove.dataset.id = item.id;

                controls.append(minus, plus, remove);
                itemElement.append(name, price, quantity, controls);

                cartItems.appendChild(itemElement);
            });
        }
    }

    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }

    saveCart();
}

// ======================================
// КНОПКИ КОШИКА
// ======================================

document.addEventListener("click", function(event) {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    switch (button.dataset.action) {
        case "increase":
            changeQuantity(id, 1);
            break;

        case "decrease":
            changeQuantity(id, -1);
            break;

        case "remove":
            removeFromCart(id);
            break;
    }
});

// ======================================
// КНОПКИ ДОДАВАННЯ ТОВАРУ
// ======================================

document.addEventListener("click", function(event) {
    const button = event.target.closest(".add-to-cart");

    if (!button) return;

    addToCart(button.dataset.id);

    const oldText = button.textContent;
    button.textContent = "Додано!";

    setTimeout(() => {
        button.textContent = oldText;
    }, 1000);
});

// ======================================
// ОЧИЩЕННЯ КОШИКА
// ======================================

const clearCartButton = document.getElementById("clear-cart");

if (clearCartButton) {
    clearCartButton.addEventListener("click", function() {
        if (cart.length === 0) return;

        cart = [];
        updateCart();
    });
}

// ======================================
// ПОШУК ТОВАРІВ
// ======================================

function searchProducts() {
    const searchInput = document.getElementById("search-input");
    const noProducts = document.getElementById("no-products");

    if (!searchInput) return;

    const searchText = searchInput.value.toLowerCase().trim();

    const cards = document.querySelectorAll(
        "#product-list .product-card, #product-list .product"
    );

    let visibleCount = 0;

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matches = text.includes(searchText);

        card.style.display = matches ? "" : "none";

        if (matches) visibleCount++;
    });

    if (noProducts) {
        noProducts.style.display =
            visibleCount === 0 ? "block" : "none";
    }
}

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
}

if (searchButton) {
    searchButton.addEventListener("click", searchProducts);
}

// ======================================
// ФІЛЬТР КАТЕГОРІЙ
// ======================================

const categoryButtons = document.querySelectorAll(".category-button");

categoryButtons.forEach(button => {
    button.addEventListener("click", function() {
        const category = button.dataset.category;

        const cards = document.querySelectorAll(
            "#product-list .product-card, #product-list .product"
        );

        let visibleCount = 0;

        cards.forEach(card => {
            const id = Number(
                card.querySelector(".add-to-cart")?.dataset.id
            );

            const product = products.find(p => p.id === id);

            const matches =
                category === "all" ||
                (product && product.category === category);

            card.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        const noProducts = document.getElementById("no-products");

        if (noProducts) {
            noProducts.style.display =
                visibleCount === 0 ? "block" : "none";
        }

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        if (searchInput) {
            searchInput.value = "";
        }
    });
});

// ======================================
// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
// ======================================

const checkoutButton = document.getElementById("checkout-button");

if (checkoutButton) {
    checkoutButton.addEventListener("click", function() {
        if (cart.length === 0) return;

        let orderText = "Ваше замовлення:\n\n";
        let total = 0;

        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);

            if (!product) return;

            const sum = product.price * item.quantity;

            orderText +=
                product.name + " × " + item.quantity +
                " = " + sum + " грн\n";

            total += sum;
        });

        orderText += "\nРазом: " + total + " грн";

        alert(orderText +
            "\n\nДякуємо за замовлення! Зв'яжіться з нами для його підтвердження.");
    });
}

// ======================================
// ЗАПУСК МАГАЗИНУ
// ======================================

updateCart();

console.log("Майстерня рибалки успішно завантажена!");
