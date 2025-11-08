document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // =================== CART ===================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartBadge();

    // Full-screen animated "Added to Cart" popup
    function showFullScreenToast(message) {
        let toast = document.createElement('div');
        toast.className = 'fullscreen-toast';
        toast.innerHTML = `<div class="toast-content"><span class="checkmark">✔</span><p>${message}</p></div>`;
        document.body.appendChild(toast);

        gsap.fromTo(toast, {opacity:0, scale:0.5}, {opacity:1, scale:1, duration:0.5, ease:'back.out(1.7)'});
        setTimeout(() => {
            gsap.to(toast, {opacity:0, scale:0.5, duration:0.5, ease:'back.in(1.7)', onComplete: () => {
                toast.remove();
            }});
        }, 2000);
    }

    // Add item to cart function
    function addToCart(name, price, quantity=1) {
        const existingItem = cart.find(item => item.name === name);
        if(existingItem){
            existingItem.quantity += quantity;
        } else {
            cart.push({name, price, quantity});
        }
        updateCartBadge();
        localStorage.setItem('cart', JSON.stringify(cart));
        showFullScreenToast(`${quantity} x ${name} added to cart!`);
        animateCartItem(name, price, quantity);
    }

    // Animate new cart item flying from hero/menu
    function animateCartItem(name, price, quantity){
        const animationDiv = document.createElement('div');
        animationDiv.className = 'animated-cart-item';
        animationDiv.innerHTML = `<p>${quantity} x ${name}</p>`;
        document.body.appendChild(animationDiv);
        gsap.fromTo(animationDiv, 
            {y:-100, opacity:0, scale:0.5},
            {y:0, opacity:1, scale:1, duration:0.6, ease:'back.out(1.7)', onComplete: () => {
                gsap.to(animationDiv, {opacity:0, scale:0.5, duration:0.5, delay:1, onComplete: ()=>animationDiv.remove()});
            }}
        );
    }

    // Update cart badge
    function updateCartBadge(){
        const cartBadge = document.querySelector('.site-header__cart-badge');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if(cartBadge){
            if(totalItems > 0){
                cartBadge.style.display = 'block';
                cartBadge.textContent = totalItems;
                const cartIcon = document.querySelector('.site-header__cart');
                cartIcon.classList.add('pop-animation');
                setTimeout(() => cartIcon.classList.remove('pop-animation'), 300);
            } else {
                cartBadge.style.display = 'none';
            }
        }
    }

    // Hero section order button
    const heroOrderBtn = document.querySelector('.hero__order');
    if(heroOrderBtn){
        heroOrderBtn.addEventListener('click', ()=>{
            const quantityValue = document.querySelector('.quantity__value');
            const quantity = parseInt(quantityValue.textContent);
            const itemName = document.querySelector('.hero__title').textContent;
            const itemPriceText = document.querySelector('.hero__price').textContent;
            const itemPrice = parseFloat(itemPriceText.replace('$',''));
            addToCart(itemName, itemPrice, quantity);
        });
    }

    // Menu section add to cart buttons
    document.querySelectorAll('.menu__card-action').forEach(button => {
        button.addEventListener('click', ()=>{
            const card = button.closest('.menu__card');
            const itemName = card.querySelector('.menu__card-title').textContent;
            const itemPriceText = card.querySelector('.menu__card-price').textContent;
            const itemPrice = parseFloat(itemPriceText.replace('$',''));
            addToCart(itemName, itemPrice, 1);
        });
    });

    // =================== CART MODAL ===================
    const body = document.body;
    const showCartModal = () => {
        const modal = document.getElementById('cart-modal');
        if(modal){
            modal.style.display='flex';
            body.style.overflow='hidden';
            renderCartItems();
            gsap.from('#cart-items', {opacity:0, y:50, duration:0.8, ease:'power3.out', stagger:0.1});
        }
    };
    const hideCartModal = () => {
        const modal = document.getElementById('cart-modal');
        if(modal){
            modal.style.display='none';
            body.style.overflow='';
        }
    };

    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        if(!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';

        if(cart.length === 0){
            if(emptyCartMessage) emptyCartMessage.style.display='block';
            if(cartTotal) cartTotal.style.display='none';
            return;
        }

        if(emptyCartMessage) emptyCartMessage.style.display='none';
        if(cartTotal) cartTotal.style.display='block';

        let total = 0;
        cart.forEach((item,index)=>{
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.className='cart-item';
            div.innerHTML=`
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
                    <button class="cart-item-remove" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        document.getElementById('cart-total-amount').textContent = `$${total.toFixed(2)}`;

        document.querySelectorAll('.cart-item-remove').forEach(btn=>{
            btn.addEventListener('click', e=>{
                const index = parseInt(e.currentTarget.dataset.index);
                cart.splice(index,1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge();
                renderCartItems();
            });
        });
    };

    // Show cart modal on icon click
    const cartIcon = document.querySelector('.site-header__cart');
    if(cartIcon) cartIcon.addEventListener('click', showCartModal);

    // Hide modal on background click
    document.getElementById('cart-modal')?.addEventListener('click', e=>{
        if(e.target.id==='cart-modal') hideCartModal();
    });
    window.hideCartModal = hideCartModal;

    // Checkout button logic
    document.querySelector('.cart-checkout')?.addEventListener('click', ()=>{
        if(cart.length === 0){
            showFullScreenToast('Your cart is empty!');
            return;
        }
        // For demonstration. In a real app, this would lead to a checkout page.
        showFullScreenToast('Redirecting to checkout!');
        hideCartModal();
    });

    // Clear cart
    window.clearCart = () => {
        if(cart.length > 0 && confirm('Are you sure you want to clear your cart?')){
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            renderCartItems();
        }
    };

    // =================== QUANTITY BUTTONS ===================
    document.querySelector('.quantity__decrease')?.addEventListener('click', ()=>{
        const quantityValue = document.querySelector('.quantity__value');
        let val = parseInt(quantityValue.textContent);
        if(val>1) val--;
        quantityValue.textContent = val.toString().padStart(2,'0');
    });

    document.querySelector('.quantity__increase')?.addEventListener('click', ()=>{
        const quantityValue = document.querySelector('.quantity__value');
        let val = parseInt(quantityValue.textContent);
        val++;
        quantityValue.textContent = val.toString().padStart(2,'0');
    });
    
    // =================== BURGER MENU ===================
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        // Prevent body scrolling when mobile nav is open
        document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : '';
    });
    
    function closeMobileNav() {
        burgerMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // =================== HERO & MENU GSAP ANIMATIONS ===================
    const heroImages = gsap.utils.toArray('.hero__image');
    gsap.set(heroImages, { x: 300, opacity: 0 });
    gsap.set(heroImages[0], { x: 300, opacity: 0 });

    const imageCarouselTimeline = gsap.timeline({ repeat: -1 });

    heroImages.forEach(image => {
        imageCarouselTimeline
            .to(image, { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
            .to(image, { x: 300, opacity: 0, duration: 1.2, ease: 'power3.in' }, "+=3");
    });

    ScrollTrigger.create({
        trigger: '.hero',
        animation: imageCarouselTimeline,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play pause resume pause',
    });

    gsap.utils.toArray('.feature__text, .feature__image-wrap').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
            y: 80, opacity: 0, duration: 1, ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.menu__card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
            y: 100, opacity: 0, duration: 1, ease: 'power3.out'
        });
    });

    gsap.from('.site-footer', {
        scrollTrigger: { trigger: '.site-footer', start: 'top 90%' },
        y: 80, opacity: 0, duration: 1.2, ease: 'power2.out'
    });


    // ======================================================= //
    // ===== NEW: CONTACT LINK SMOOTH SCROLL FUNCTIONALITY ===== //
    // ======================================================= //
    
    document.querySelectorAll('.nav-contact-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Stop the default anchor link behavior

            const targetId = this.getAttribute('href'); // Get the href value (e.g., "#contact-section")
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth', // This creates the smooth scroll effect
                    block: 'start'
                });
            }

            // If the mobile navigation is open, close it
            if (mobileNavOverlay.classList.contains('active')) {
                closeMobileNav();
            }
        });
    });


    // ================================================== //
    // ===== NEW: SALAD MENU FILTERING FUNCTIONALITY ===== //
    // ================================================== //

    const filterItems = document.querySelectorAll('.menu__filter-item');
    const menuCards = document.querySelectorAll('.menu__card');

    filterItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Update active state for the clicked filter button
            filterItems.forEach(i => i.classList.remove('menu__filter-item--active'));
            this.classList.add('menu__filter-item--active');

            const filterValue = this.getAttribute('data-filter');

            // 2. Filter the cards with animation
            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const shouldBeVisible = filterValue === 'all' || filterValue === cardCategory;
                
                // Check if the card's visibility needs to change
                const isCurrentlyVisible = card.style.display !== 'none';

                if (shouldBeVisible && !isCurrentlyVisible) {
                    // Make it visible with a fade-in animation
                    card.style.display = 'flex'; // Use 'flex' since cards are flex containers
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else if (!shouldBeVisible && isCurrentlyVisible) {
                    // Hide it with a fade-out animation
                    card.style.animation = 'fadeOut 0.4s ease forwards';
                    // After the animation, set display to none
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400); // Must match animation duration
                }
            });
        });
    });

}); // DOMContentLoaded end