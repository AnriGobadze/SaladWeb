document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // Shopping Cart Logic
    // =======================================================
    let cart = [];
    const cartBadge = document.querySelector('.site-header__cart-badge');

    const updateCartBadge = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            cartBadge.style.display = 'block'; 
            cartBadge.textContent = totalItems;
            const cartIcon = document.querySelector('.site-header__cart');
            cartIcon.classList.add('pop-animation');
            setTimeout(() => {
                cartIcon.classList.remove('pop-animation');
            }, 300); 
        } else {
            cartBadge.style.display = 'none'; 
        }
    };
    
    updateCartBadge();


    // =======================================================
    // Hero Section Controls
    // =======================================================
    const decreaseBtn = document.querySelector('.quantity__decrease');
    const increaseBtn = document.querySelector('.quantity__increase');
    const quantityValue = document.querySelector('.quantity__value');
    const heroOrderBtn = document.querySelector('.hero__order');

    decreaseBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(quantityValue.textContent);
        if (currentQuantity > 1) { 
            currentQuantity--;
            quantityValue.textContent = currentQuantity.toString().padStart(2, '0');
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(quantityValue.textContent);
        currentQuantity++;
        quantityValue.textContent = currentQuantity.toString().padStart(2, '0');
    });

    heroOrderBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityValue.textContent);
        const itemName = document.querySelector('.hero__title').textContent;
        const itemPriceText = document.querySelector('.hero__price').textContent;
        const itemPrice = parseFloat(itemPriceText.replace('$', ''));

        const existingItem = cart.find(item => item.name === itemName);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ name: itemName, price: itemPrice, quantity: quantity });
        }

        console.log('Cart updated:', cart);
        alert(`${quantity}x ${itemName} added to cart!`);
        updateCartBadge();
    });


    // =======================================================
    // Menu Section - Add to Cart
    // =======================================================
    const menuAddToCartButtons = document.querySelectorAll('.menu__card-action');

    menuAddToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.menu__card');
            const itemName = card.querySelector('.menu__card-title').textContent;
            const itemPriceText = card.querySelector('.menu__card-price').textContent;
            const itemPrice = parseFloat(itemPriceText.replace('$', ''));
            const quantity = 1; 

            const existingItem = cart.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity: quantity });
            }
            
            console.log('Cart updated:', cart); 
            alert(`${itemName} added to cart!`);
            updateCartBadge();
        });
    });
    

    // =======================================================
    // Menu Section - Filter Visuals
    // =======================================================
    const filterItems = document.querySelectorAll('.menu__filter-item');
    
    filterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            filterItems.forEach(filter => filter.classList.remove('menu__filter-item--active'));
            item.classList.add('menu__filter-item--active');
        });
    });




});