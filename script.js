document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);
    const heroContent = document.querySelector('.hero__content');
if (heroContent) {
  gsap.from(heroContent, {
    x: -180,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.08
  });

  const childrenExceptTitle = Array.from(heroContent.children).filter(
    el => !el.classList.contains('hero__title')
  );

  gsap.from(childrenExceptTitle, {
    y: 10,
    opacity: 0,
    duration: 0.45,
    ease: 'power2.out',
    stagger: 0.08,
    delay: 0.32
  });

const heroTitle = heroContent.querySelector('.hero__title');
if (heroTitle) {
  gsap.from(heroTitle, {
    x: -400,       
    duration: 1,
    ease: 'power3.out',
    delay: 0.32 + 0.4
  });
}
}


    // =================== CART ===================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartBadge();

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
function addToCart(name, price, quantity = 1) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }

    updateCartBadge();
    localStorage.setItem('cart', JSON.stringify(cart));

    animateCartItem(name, price, quantity);

}
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

document.querySelectorAll('.menu__card-action').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.menu__card');
        const itemName = card.querySelector('.menu__card-title').textContent;
        const itemPriceText = card.querySelector('.menu__card-price').textContent;
        const itemPrice = parseFloat(itemPriceText.replace('$', ''));

        // get quantity if available, otherwise default to 1
        const quantityEl = card.querySelector('.quantity-value');
        const quantity = quantityEl ? parseInt(quantityEl.textContent, 10) : 1;

        addToCart(itemName, itemPrice, quantity);
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
        <div class="cart-item-quantity">
            <button class="quantity-btn quantity-decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn quantity-increase" data-index="${index}" aria-label="Increase quantity">+</button>
        </div>
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


document.querySelectorAll('.cart-item-quantity .quantity-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        const index = parseInt(e.currentTarget.dataset.index);
        
        if (e.currentTarget.classList.contains('quantity-increase')) {
            cart[index].quantity++;
        } else if (e.currentTarget.classList.contains('quantity-decrease')) {
            cart[index].quantity--;
        }
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartItems();
    });
});
    };


    const cartIcon = document.querySelector('.site-header__cart');
    if(cartIcon) cartIcon.addEventListener('click', showCartModal);

    document.getElementById('cart-modal')?.addEventListener('click', e=>{
        if(e.target.id==='cart-modal') hideCartModal();
    });
    window.hideCartModal = hideCartModal;
    document.querySelector('.cart-checkout')?.addEventListener('click', ()=>{
        if(cart.length === 0){
            showFullScreenToast('Your cart is empty!');
            return;
        }
        showFullScreenToast('Redirecting to checkout!');
        hideCartModal();
    });

window.clearCart = () => {
  const clearBtn = document.querySelector('.cart-clear');
  if (!clearBtn) return;

  if (!cart || cart.length === 0) return;

  if (clearBtn.dataset.confirming === 'true') return;

  clearBtn.dataset.originalHtml = clearBtn.innerHTML;
  clearBtn.dataset.confirming = 'true';
  clearBtn.innerHTML = `Are you sure? <span class="confirm-yes" role="button" tabindex="0">Yes</span> <span class="confirm-cancel" role="button" tabindex="0">Cancel</span>`;

  let autoCancelTimer = null;
  function restore() {
    if (autoCancelTimer) clearTimeout(autoCancelTimer);
    clearBtn.innerHTML = clearBtn.dataset.originalHtml || 'Clear Cart';
    delete clearBtn.dataset.originalHtml;
    delete clearBtn.dataset.confirming;
    clearBtn.removeEventListener('click', onBtnClick);
    clearBtn.removeEventListener('keydown', onBtnKeydown);
  }

  function confirmYes() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCartItems();
    restore();

  }

  function onBtnClick(e) {
    const target = e.target;
    if (target.classList.contains('confirm-yes')) {
      confirmYes();
    } else if (target.classList.contains('confirm-cancel')) {
      restore();
    }
  }

  function onBtnKeydown(e) {
    const target = e.target;
    if (!target.classList) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (target.classList.contains('confirm-yes')) {
        e.preventDefault();
        confirmYes();
      } else if (target.classList.contains('confirm-cancel')) {
        e.preventDefault();
        restore();
      }
    }
    if (e.key === 'Escape') {
      restore();
    }
  }

  clearBtn.addEventListener('click', onBtnClick);
  clearBtn.addEventListener('keydown', onBtnKeydown);
  autoCancelTimer = setTimeout(() => {
    restore();
  }, 6000);
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
            .to(image, { x: 300, opacity: 0, duration: 1.2, ease: 'power3.in' }, "+=1");
    });

    gsap.to('.hero__image', {
    scale: 1.1,
    rotation: 1,
    duration: 12,
    repeat: -1,   
    yoyo: true,  
    ease: "sine.inOut",
    stagger: 2    
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
    
document.querySelectorAll('.site-nav a, .mobile-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return; 

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

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

            filterItems.forEach(i => i.classList.remove('menu__filter-item--active'));
            this.classList.add('menu__filter-item--active');

            const filterValue = this.getAttribute('data-filter');
            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const shouldBeVisible = filterValue === 'all' || filterValue === cardCategory;

const cardsToHide = [];
const cardsToShow = [];

menuCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    const isVisible = card.style.display !== 'none';
    const shouldBeVisible = filterValue === 'all' || filterValue === cardCategory;

    if (isVisible && !shouldBeVisible) {
        cardsToHide.push(card);
    } else if (!isVisible && shouldBeVisible) {
        cardsToShow.push(card);
    }
});

const tl = gsap.timeline();

if (cardsToHide.length > 0) {
    tl.to(cardsToHide, {
        duration: 0.2, 
        opacity: 0,
        scale: 0.9,
        ease: 'power1.in',
        onComplete: () => {
            gsap.set(cardsToHide, { display: 'none' });
        }
    });
}
if (cardsToShow.length > 0) {
    tl.set(cardsToShow, {
        display: 'flex',  
        opacity: 0,        
        scale: 0.95        
    });

    tl.to(cardsToShow, {
        duration: 0.4,     
        opacity: 1,        
        scale: 1,         
        ease: 'power2.out',
        stagger: 0.1       
    });
}

            });
        });
    });






    // ======================================================= //
// ===== NEW: MENU CARD QUANTITY SELECTOR FUNCTIONALITY ==== //
// ======================================================= //

document.querySelectorAll('.menu__card-quantity').forEach(quantityContainer => {
    const decreaseBtn = quantityContainer.querySelector('.quantity-decrease');
    const increaseBtn = quantityContainer.querySelector('.quantity-increase');
    const valueEl = quantityContainer.querySelector('.quantity-value');

    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(valueEl.textContent);
        if (currentValue > 1) {
            valueEl.textContent = currentValue - 1;
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(valueEl.textContent);
        valueEl.textContent = currentValue + 1;
    });
});

}); 