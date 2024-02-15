/**
 * Implementing a simple backend which works on json data, with the help of 
 * requests like GET, POST, DELETE, PUT retrieves data from json file.
 * @author : Atharva Nawathes
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const productsData = require('./products.json');
const ordersData = require('./orders.json');

app.use(bodyParser.json());

// Get all products
app.get('/', (req, res) => {
  res.json(productsData);
});

// Create a new product
app.post('/createProduct', (req, res) => {
  const newProduct = req.body;
  productsData.tech_products.push(newProduct);

  // Save the modified data back to the products.json file
  fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2), 'utf-8');

  res.json({ message: 'Product created successfully', product: newProduct });
});

// Edit an existing product
app.put('/editProduct/:id', (req, res) => {
  const editedProduct = req.body;
  const productId = req.params.id;

  const index = productsData.tech_products.findIndex(product => product.id === parseInt(productId));
  if (index !== -1) {
    productsData.tech_products[index] = { ...productsData.tech_products[index], ...editedProduct };

    // Save the modified data back to the products.json file
    fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2), 'utf-8');

    res.json({ message: 'Product edited successfully', product: productsData.tech_products[index] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete an existing product
app.delete('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;

  const index = productsData.tech_products.findIndex(product => product.id === parseInt(productId));
  if (index !== -1) {
    const deletedProduct = productsData.tech_products.splice(index, 1);

    // Save the modified data back to the products.json file
    fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2), 'utf-8');

    res.json({ message: 'Product deleted successfully', deletedProduct: deletedProduct[0] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});



app.delete('/deleteproduct', (req, res) => {
  const orderId = req.body.orderId;

  // Read the orders data from the 'orders.json' file
  const ordersData = JSON.parse(fs.readFileSync('./orders.json', 'utf-8'));

  // Find the order that contains the product based on orderId
  const orderContainingProduct = ordersData.orders.find(order =>
    order.orderId === parseInt(orderId)
  );

  if (orderContainingProduct) {
    // Remove the product from the order
    const index = ordersData.orders.indexOf(orderContainingProduct);
    const deletedProduct = ordersData.orders[index].product;
    ordersData.orders[index].product = null; // Remove the product (you can adjust this based on your data structure)

    // Save the modified data back to the orders.json file
    fs.writeFileSync('./orders.json', JSON.stringify(ordersData, null, 2), 'utf-8');

    res.json({ message: 'Product deleted successfully from order', deletedProduct });
  } else {
    res.status(404).json({ error: 'Order not found or product not found in the order' });
  }
});



app.get('/searchProduct', (req, res) => {
    const searchTerm = req.query.term;
  
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }
  
    const matchingProducts = productsData.tech_products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    if (matchingProducts.length > 0) {
      res.json({ message: 'Products found', products: matchingProducts });
    } else {
      res.status(404).json({ error: 'No matching products found' });
    }
  });

  app.post('/createOrder', (req, res) => {
    const productId = req.body.productId;
  
    // Find the product in the productsData based on productId
    const product = productsData.tech_products.find(product => product.id === parseInt(productId));
  
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
  
    // Create a new order
    const newOrder = {
      orderId: generateOrderId(),
      product: product,
      // Add any other order-related information here
    };
  
    // Ensure ordersData.orders is initialized as an array
    if (!ordersData.orders) {
      ordersData.orders = [];
    }
  
    // Add the new order to ordersData
    ordersData.orders.push(newOrder);
  
    // Log the new order and the current ordersData
    console.log('New Order:', newOrder);
    console.log('Current ordersData:', ordersData);
  
    try {
      // Save the modified ordersData back to the 'orders.json' file
      fs.writeFileSync('./orders.json', JSON.stringify(ordersData, null, 2), 'utf-8');
      console.log('Write to orders.json successful');
    } catch (error) {
      console.error('Error writing to orders.json:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  
    res.json({ message: 'Order created successfully', order: newOrder });
  });

  app.delete('/cancelOrder/:orderId', (req, res) => {
    const orderId = req.params.orderId;
  
    // Find the index of the order in ordersData.orders based on orderId
    const index = ordersData.orders.findIndex(order => order.orderId === parseInt(orderId));
  
    if (index !== -1) {
      // Remove the order from ordersData.orders
      const canceledOrder = ordersData.orders.splice(index, 1)[0];
  
      // Save the modified ordersData back to the 'orders.json' file
      fs.writeFileSync('./orders.json', JSON.stringify(ordersData, null, 2), 'utf-8');
  
      res.json({ message: 'Order canceled successfully', canceledOrder });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });



  app.post('/orderStatus', (req, res) => {
    const orderId = req.body.orderId;
  
    // Read the orders data from the 'orders.json' file
    const ordersData = JSON.parse(fs.readFileSync('./orders.json', 'utf-8'));
  
    // Find the order in ordersData.orders based on orderId
    const order = ordersData.orders.find(order => order.orderId === parseInt(orderId));
  
    if (order) {
      res.json({
        message: 'Order status retrieved successfully',
        deliveryStatus: order.product.deliveryStatus
        // product: order.product
      });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });
  


app.post('/checkout', (req, res) => {
  const orderId = req.body.orderId;

  // Read the orders data from the 'orders.json' file
  const ordersData = JSON.parse(fs.readFileSync('./orders.json', 'utf-8'));

  // Find the order in ordersData.orders based on orderId
  const order = ordersData.orders.find(order => order.orderId === parseInt(orderId));

  if (order) {
    const productName = order.product.name;
    res.json({ message: `Your ${productName} order is placed successfully.` });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

  
  
  
  function generateOrderId() {
    return Math.floor(Math.random() * 1000000);
  }
  
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

