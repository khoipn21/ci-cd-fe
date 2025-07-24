import api from './utils/api.js';

// Test the API functionality
async function testAPI() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('Health:', healthResponse.data);

    console.log('Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@webshop.com',
      password: 'admin123'
    });
    console.log('Login:', loginResponse.data);

    // Store token
    localStorage.setItem('token', loginResponse.data.token);

    console.log('Testing cart...');
    const cartResponse = await api.get('/cart');
    console.log('Cart:', cartResponse.data);

    console.log('Testing add to cart...');
    const addToCartResponse = await api.post('/cart/add', {
      productId: '68823f1d089bb087185aa803',
      quantity: 1
    });
    console.log('Add to cart:', addToCartResponse.data);

  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
}

// Run the test
testAPI();