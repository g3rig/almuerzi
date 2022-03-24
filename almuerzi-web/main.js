let mealsState = [];
let user = {};
let ruta = 'login'; //login, register, orders

const stringToHTML = (string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(string, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)

    //agregando y quitando selected
    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(item => item.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)
    return element
}

const initializeForm = () => {
    const token = localStorage.getItem('token');
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if(!mealIdValue) {
            alert('Debe seleccionar la comida')
            submit.setAttribute('disabled')
            return
        }

        const order = {
            meal_id: mealIdValue,
            user_id: user._id
        }

        fetch('https://almuerzi-back-germen1803.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify(order)
        })
        .then(res => res.json())
        .then(res => {
            const renderedOrder = renderOrder(res, mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }
}

const initializeData = () => {
    fetch('https://almuerzi-back-germen1803.vercel.app/api/meals')
    .then(response => response.json())
    .then(data => {
        mealsState = data
        //se guarda el elemento ul de id=meals-list
        const mealsList = document.getElementById('meals-list')
        //se guarda el botón
        const submit = document.getElementById('submit')
        const listItems = data.map(renderItem)
        mealsList.removeChild(mealsList.firstElementChild)
        listItems.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')

        fetch('https://almuerzi-back-germen1803.vercel.app/api/orders')
        .then(response => response.json())
        .then(ordersData => {
            const ordersList = document.getElementById('orders-list')
            const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
            ordersList.removeChild(ordersList.firstElementChild)
            listOrders.forEach(item => ordersList.appendChild(item))
            console.table(ordersData)
        })
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token');
    if (token) {
        user = JSON.parse(localStorage.getItem('user'));
        return renderOrders();
    }
    renderLogin();
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view');
    document.getElementById('app').innerHTML = ordersView.innerHTML;

    initializeForm();
    initializeData();
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template');
    document.getElementById('app').innerHTML = loginTemplate.innerHTML;

    const loginForm = document.getElementById('login-form');
    loginForm.onsubmit = (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('https://almuerzi-back-germen1803.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password})
        })
            .then(x => x.json())
            .then(res => {
                localStorage.setItem('token', res.token);
                ruta = 'orders';
                return res.token;
            })
                .then(token => {
                    return fetch('https://almuerzi-back-germen1803.vercel.app/api/auth/me', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            authorization: token,
                        },
                    })
                })
                .then(x => x.json())
                .then(fetchedUser => {
                    console.log(fetchedUser);
                    localStorage.setItem('user', JSON.stringify(fetchedUser));
                    user = fetchedUser;
                    renderOrders();
                })
    }
}

window.onload = () => {
    renderApp();
}