import React, { useState } from 'react';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import ManHinhChao from './src/screens/ManHinhChao';
import TableMap from './src/screens/TableMap';
import OrderMenu from './src/screens/OrderMenu';
import ProductDetail from './src/screens/ProductDetail';
import OrderSummary from './src/screens/OrderSummary';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenParams, setScreenParams] = useState({});
  const [cart, setCart] = useState([]);

  const navigate = (screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const addToCart = (item) => {
    setCart(prev => {
      // Check if exact same item (same variant and toppings) exists
      const existingIndex = prev.findIndex(i => 
        i.idSanPham === item.idSanPham && 
        i.variant.idBienThe === item.variant.idBienThe &&
        JSON.stringify(i.toppings.sort()) === JSON.stringify(item.toppings.sort())
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].qty += item.qty;
        return newCart;
      }
      return [...prev, { ...item, id: Date.now() }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  if (currentScreen === 'Welcome') return <ManHinhChao onNavigate={navigate} />;
  if (currentScreen === 'Register') return <Register onNavigate={navigate} />;
  if (currentScreen === 'TableMap') return <TableMap onNavigate={navigate} />;
  if (currentScreen === 'OrderMenu') return <OrderMenu onNavigate={navigate} table={screenParams.table} cartCount={cart.length} />;
  if (currentScreen === 'ProductDetail') return (
    <ProductDetail 
      onNavigate={navigate} 
      product={screenParams.product} 
      table={screenParams.table} 
      onAddToCart={addToCart} 
    />
  );
  if (currentScreen === 'OrderSummary') return (
    <OrderSummary 
      onNavigate={navigate} 
      table={screenParams.table} 
      cart={cart}
      onUpdateQty={updateCartQty}
      onRemove={removeFromCart}
      onClear={clearCart}
    />
  );

  return <Login onNavigate={navigate} />;
};

export default App;
