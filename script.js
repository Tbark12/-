// ==========================================
// BAYTNA AL-FALASTINI - JavaScript
// Interactive Functionality
// ==========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScroll();
    initNavbarScroll();
    initScrollAnimations();
    initIntersectionObserver();
    initLogoFallback();
    initAuthAndOrdering();
});

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const orderButton = navMenu.querySelector('.btn-order');

    // Toggle mobile menu
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close menu when clicking on order button
    if (orderButton) {
        orderButton.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            closeMobileMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close menu on window resize (if switching to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.food-card, .dessert-card, .feature-item, .story-feature, .contact-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// ==========================================
// INTERSECTION OBSERVER FOR SECTIONS
// ==========================================
function initIntersectionObserver() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// ==========================================
// FOOD ORDERING & AUTHENTICATION SYSTEM
// ==========================================

let activeOrderDish = null;
let activeOrderPrice = 0;
let activeOrderQty = 1;

function showToast(message) {
    let toast = document.getElementById('order-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'order-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            background: #556B2F;
            color: #ffffff;
            padding: 16px 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
            z-index: 20000;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
            direction: rtl;
            border: 1px solid #D4AF37;
            max-width: 90%;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 4000);
}

// Main order trigger: opens in-app food order modal
function orderDish(dishName, price) {
    activeOrderDish = dishName;
    activeOrderPrice = Number(price) || 0;
    activeOrderQty = 1;

    const modal = document.getElementById('orderPlacementModal');
    if (!modal) {
        // If on another page, redirect to login/order
        window.location.href = `login.html?dish=${encodeURIComponent(dishName)}&price=${price}`;
        return;
    }

    // Set modal dish details
    const nameEl = document.getElementById('modalDishName');
    const priceEl = document.getElementById('modalDishPrice');
    const unitPriceEl = document.getElementById('summaryUnitPrice');
    const qtyEl = document.getElementById('modalQtyDisplay');
    const directLink = document.getElementById('modalLoginDirectLink');

    if (nameEl) nameEl.textContent = dishName;
    if (priceEl) priceEl.textContent = `${activeOrderPrice} ₪`;
    if (unitPriceEl) unitPriceEl.textContent = `${activeOrderPrice} ₪`;
    if (qtyEl) qtyEl.textContent = '1';

    if (directLink) {
        directLink.href = `login.html?dish=${encodeURIComponent(dishName)}&price=${activeOrderPrice}`;
    }

    // Check if user is logged in to prefill
    const activeUserStr = localStorage.getItem('baytna_active_user');
    const authPrompt = document.getElementById('modalAuthPrompt');

    if (activeUserStr) {
        try {
            const user = JSON.parse(activeUserStr);
            const nameInput = document.getElementById('modalCustomerName');
            const phoneInput = document.getElementById('modalCustomerPhone');
            const addrInput = document.getElementById('modalDeliveryAddress');

            if (nameInput) nameInput.value = user.name || '';
            if (phoneInput) phoneInput.value = user.phone || '';
            if (addrInput) addrInput.value = user.address || '';

            if (authPrompt) {
                authPrompt.innerHTML = `<span style="color: #2E7D32;">✓ مسجّل دخولك كـ <strong>${user.name}</strong> - سيتم حفظ هذا الطلب في حسابك تلقائياً.</span>`;
            }
        } catch (e) {
            console.error('Error parsing user session', e);
        }
    } else {
        if (authPrompt) {
            authPrompt.innerHTML = `
                <span>للطلب السريع وحفظ بياناتك: </span>
                <a href="login.html?dish=${encodeURIComponent(dishName)}&price=${activeOrderPrice}" style="color: #556B2F; font-weight: 700;">سجّل دخولك الآن</a>
                <span> أو أكمل بياناتك أدناه كطلب سريع.</span>
            `;
        }
    }

    updateModalOrderCalculations();
    modal.classList.add('active');
}

function updateModalQty(delta) {
    activeOrderQty = Math.max(1, Math.min(30, activeOrderQty + delta));
    const qtyEl = document.getElementById('modalQtyDisplay');
    if (qtyEl) qtyEl.textContent = activeOrderQty;
    updateModalOrderCalculations();
}

function updateModalOrderCalculations() {
    const total = activeOrderPrice * activeOrderQty;
    const summaryQty = document.getElementById('summaryQty');
    const summaryTotal = document.getElementById('summaryTotalPrice');

    if (summaryQty) summaryQty.textContent = activeOrderQty;
    if (summaryTotal) summaryTotal.textContent = `${total} ₪`;
}

function closeOrderModal() {
    const modal = document.getElementById('orderPlacementModal');
    if (modal) modal.classList.remove('active');
}

function submitModalOrder() {
    const nameInput = document.getElementById('modalCustomerName');
    const phoneInput = document.getElementById('modalCustomerPhone');
    const addressInput = document.getElementById('modalDeliveryAddress');
    const notesInput = document.getElementById('modalKitchenNotes');

    const customerName = nameInput ? nameInput.value.trim() : '';
    const customerPhone = phoneInput ? phoneInput.value.trim() : '';
    const deliveryAddress = addressInput ? addressInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!customerName) {
        showToast('يرجى إدخال اسم العميل للمتابعة');
        if (nameInput) nameInput.focus();
        return;
    }

    if (!customerPhone) {
        showToast('يرجى إدخال رقم الهاتف للتوصيل');
        if (phoneInput) phoneInput.focus();
        return;
    }

    if (!deliveryAddress) {
        showToast('يرجى تحديد عنوان التوصيل بالتفصيل');
        if (addressInput) addressInput.focus();
        return;
    }

    // Auto-save guest session if not logged in
    if (!localStorage.getItem('baytna_active_user')) {
        const guestUser = {
            name: customerName,
            phone: customerPhone,
            address: deliveryAddress
        };
        localStorage.setItem('baytna_active_user', JSON.stringify(guestUser));
        initAuthAndOrdering();
    }

    const orderId = 'BAYT-' + Math.floor(1000 + Math.random() * 9000);
    const total = activeOrderPrice * activeOrderQty;

    const newOrder = {
        id: orderId,
        dish: activeOrderDish,
        price: activeOrderPrice,
        qty: activeOrderQty,
        total: total,
        customerName: customerName,
        phone: customerPhone,
        address: deliveryAddress,
        notes: notes,
        date: new Date().toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        status: 'قيد التحضير في المطبخ 🍲'
    };

    // Send order to Supabase via proxy API
    const userStr = localStorage.getItem('baytna_active_user');
    let userId = null;
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            userId = u.id || null;
        } catch (e) {}
    }

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: orderId,
            userId: userId,
            customerName: customerName,
            phone: customerPhone,
            address: deliveryAddress,
            dishName: activeOrderDish,
            quantity: activeOrderQty,
            unitPrice: activeOrderPrice,
            totalPrice: total,
            notes: notes
        })
    }).catch(err => console.warn('Supabase order sync note:', err));

    // Save to localStorage orders list
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('baytna_orders') || '[]');
    } catch (e) {
        orders = [];
    }
    orders.unshift(newOrder);
    localStorage.setItem('baytna_orders', JSON.stringify(orders));

    // Close placement modal
    closeOrderModal();

    // Show Success Modal
    openSuccessReceipt(newOrder);
}

function openSuccessReceipt(order) {
    const successModal = document.getElementById('orderSuccessModal');
    if (!successModal) return;

    document.getElementById('successOrderId').textContent = `#${order.id}`;
    document.getElementById('successDishDetails').textContent = `${order.dish} × ${order.qty}`;
    document.getElementById('successTotalAmount').textContent = `${order.total} ₪`;
    document.getElementById('successDeliveryAddress').textContent = order.address;

    successModal.classList.add('active');
}

function closeSuccessModal() {
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.remove('active');
}

// My Orders Modal
function openMyOrdersModal() {
    closeSuccessModal();
    const myOrdersModal = document.getElementById('myOrdersModal');
    if (!myOrdersModal) return;

    renderMyOrdersList();
    myOrdersModal.classList.add('active');
}

function closeMyOrdersModal() {
    const myOrdersModal = document.getElementById('myOrdersModal');
    if (myOrdersModal) myOrdersModal.classList.remove('active');
}

async function renderMyOrdersList() {
    const container = document.getElementById('myOrdersListContainer');
    if (!container) return;

    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('baytna_orders') || '[]');
    } catch (e) {
        orders = [];
    }

    const userStr = localStorage.getItem('baytna_active_user');
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            const params = new URLSearchParams();
            if (u.id) params.append('userId', u.id);
            if (u.phone) params.append('phone', u.phone);

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();
            if (res.ok && data.orders && data.orders.length > 0) {
                orders = data.orders.map(o => ({
                    id: o.id,
                    dish: o.dish_name,
                    price: o.unit_price,
                    qty: o.quantity,
                    total: o.total_price,
                    address: o.delivery_address,
                    notes: o.kitchen_notes,
                    date: new Date(o.created_at).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                    status: o.status
                }));
                localStorage.setItem('baytna_orders', JSON.stringify(orders));
            }
        } catch (err) {
            console.warn('Could not sync orders from Supabase:', err);
        }
    }

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #757575; padding: 20px 0;">لا توجد طلبات سابقة حتى الآن. اختر طبقاً شهياً واطلب الآن!</p>';
        return;
    }

    let html = '';
    orders.slice(0, 8).forEach(order => {
        html += `
            <div style="background: #FAF9F5; border: 1px solid #E6E2D8; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #757575; margin-bottom: 6px;">
                    <strong style="color: #556B2F;">طلب رقم #${order.id}</strong>
                    <span>${order.date}</span>
                </div>
                <div style="font-size: 15px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px;">
                    ${order.dish} × ${order.qty} — <span style="color: #C41E3A;">${order.total} ₪</span>
                </div>
                <div style="font-size: 13px; color: #4A4A4A; margin-bottom: 8px;">
                    📍 العنوان: ${order.address}
                </div>
                <div style="display: inline-block; background: #FEFCBF; color: #744210; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                    ${order.status}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize Authentication & Navbar State
function initAuthAndOrdering() {
    const container = document.getElementById('navAuthContainer');
    if (!container) return;

    const activeUserStr = localStorage.getItem('baytna_active_user');

    if (activeUserStr) {
        try {
            const user = JSON.parse(activeUserStr);
            const shortName = (user.name || 'عميلنا العزيز').split(' ')[0];

            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button type="button" class="nav-user-badge" onclick="openMyOrdersModal()" title="عرض طلباتي السابقة">
                        <span>👤 مرحباً، ${shortName}</span>
                    </button>
                    <a href="login.html" class="nav-auth-btn" style="padding: 6px 12px; font-size: 13px; text-decoration: none;" title="إدارة الحساب">
                        حسابي
                    </a>
                </div>
            `;
        } catch (e) {
            console.error('Error rendering auth nav', e);
        }
    } else {
        container.innerHTML = `
            <a href="login.html" class="nav-auth-btn" id="navAuthBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>تسجيل الدخول</span>
            </a>
        `;
    }
}

// ==========================================
// LAZY LOADING FOR IMAGES
// ==========================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================
function initScrollToTop() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top when clicked
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top button
initScrollToTop();

// ==========================================
// ACTIVE NAV LINK
// ==========================================
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            
            if (pageYOffset >= sectionTop - navbarHeight - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize active nav link
initActiveNavLink();

// ==========================================
// IMAGE ERROR HANDLING
// ==========================================
function initImageErrorHandling() {
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
        img.addEventListener('error', function() {
            console.error('❌ Image failed to load:', this.src);
            // For food/dessert images, add a fallback
            if (this.classList.contains('food-img') || this.classList.contains('dessert-img') || this.classList.contains('special-img')) {
                this.style.display = 'none';
                const parent = this.parentElement;
                if (parent && !parent.querySelector('.image-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'image-fallback';
                    fallback.innerHTML = '<span>🍽️</span>';
                    parent.appendChild(fallback);
                }
            }
        });
        
        img.addEventListener('load', function() {
            console.log('✓ Image loaded successfully:', this.src);
        });
    });
}

// Initialize image error handling
initImageErrorHandling();

// ==========================================
// LOGO FALLBACK
// ==========================================
function initLogoFallback() {
    const logoContainers = document.querySelectorAll('.logo-container, .hero-logo, .footer-logo');
    
    logoContainers.forEach(container => {
        const img = container.querySelector('img');
        const fallback = container.querySelector('.logo-fallback');
        
        if (img && fallback) {
            // Check if image fails to load
            img.addEventListener('error', function() {
                console.log('Logo image failed to load, showing fallback');
                this.style.display = 'none';
                fallback.style.display = 'flex';
                fallback.classList.add('active');
            });
            
            // Also check if image is already broken (cached)
            if (img.complete) {
                if (img.naturalHeight === 0) {
                    console.log('Logo image already failed to load, showing fallback');
                    img.style.display = 'none';
                    fallback.style.display = 'flex';
                    fallback.classList.add('active');
                }
            }
        }
    });
}

// ==========================================
// FORM VALIDATION (if needed later)
// ==========================================
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// ==========================================
// AI CHAT ASSISTANT (Gemini)
// ==========================================
let aiChatHistory = [];
let isAiResponding = false;

function toggleAiChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    if (!chatWindow) return;

    chatWindow.classList.toggle('active');

    if (chatWindow.classList.contains('active')) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            setTimeout(() => input.focus(), 200);
        }
        scrollAiMessagesToBottom();
    }
}

function sendAiSuggestion(text) {
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = text;
        const form = document.getElementById('aiChatForm');
        if (form) {
            handleAiChatSubmit(new Event('submit'));
        }
    }
}

async function handleAiChatSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isAiResponding) return;

    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiSendBtn');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Append user message
    appendAiMessage('user', message);
    input.value = '';

    // Disable send button and show typing indicator
    isAiResponding = true;
    if (sendBtn) sendBtn.disabled = true;
    const typingIndicator = showAiTypingIndicator();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: aiChatHistory
            })
        });

        const data = await res.json();
        removeAiTypingIndicator(typingIndicator);

        if (res.ok && data.reply) {
            appendAiMessage('assistant', data.reply);
            aiChatHistory.push({ role: 'user', text: message });
            aiChatHistory.push({ role: 'assistant', text: data.reply });
        } else {
            appendAiMessage('assistant', data.error || 'عذراً، حدث خطأ في التواصل مع المساعد الذكي. يمكنك سؤالي مجدداً أو استعراض القائمة.');
        }
    } catch (err) {
        console.error('AI chat error:', err);
        removeAiTypingIndicator(typingIndicator);
        appendAiMessage('assistant', 'أهلاً بك! في بيتنا الفلسطيني نسعد بخدمتك. يمكنك اختيار أي طبق من القائمة والضغط على "اطلب الآن" للاستمتاع بأشهى الأطباق التراثية.');
    } finally {
        isAiResponding = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input) input.focus();
    }
}

function appendAiMessage(role, text) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';

    // Format newlines into breaks safely
    const formatted = text.replace(/\n/g, '<br>');
    bubble.innerHTML = formatted;

    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);

    scrollAiMessagesToBottom();
}

function showAiTypingIndicator() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return null;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-message assistant typing-active';
    msgDiv.innerHTML = `
        <div class="ai-msg-bubble">
            <div class="ai-typing-indicator">
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
            </div>
        </div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollAiMessagesToBottom();
    return msgDiv;
}

function removeAiTypingIndicator(indicatorEl) {
    if (indicatorEl && indicatorEl.parentNode) {
        indicatorEl.parentNode.removeChild(indicatorEl);
    }
}

function scrollAiMessagesToBottom() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }
}

// ==========================================
// CONSOLE WELCOME MESSAGE
// ==========================================
console.log('%c بيتنا الفلسطيني ', 'background: #556B2F; color: white; font-size: 20px; padding: 10px;');
console.log('%c أهلاً بكم في بيتنا الفلسطيني! ', 'color: #556B2F; font-size: 14px;');