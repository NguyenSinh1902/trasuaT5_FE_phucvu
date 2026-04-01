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
  // Object mapping cartId to items[]
  const [carts, setCarts] = useState({});

  const navigate = (screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const getCartId = (params) => {
    if (params.isTakeaway) return 'takeaway';
    if (params.invoiceId) return `inv_${params.invoiceId}`;
    if (params.table) return `table_${params.table.idBan || params.table.name || params.table.id || 'unknown'}`;
    return 'default';
  };

  const currentCartId = getCartId(screenParams);
  const currentCart = carts[currentCartId] || [];

  const addToCart = (item) => {
    const cartId = getCartId(screenParams);
    setCarts(prev => {
      const cart = prev[cartId] || [];
      
      // If we are updating an existing entry (editing)
      if (item.replaceId) {
        const newCart = cart.map(i => i.id === item.replaceId ? { ...item, id: i.id } : i);
        return { ...prev, [cartId]: newCart };
      }

      // Normal add logic
      const existingIndex = cart.findIndex(i => 
        i.idSanPham === item.idSanPham && 
        i.variant.idBienThe === item.variant.idBienThe &&
        JSON.stringify(i.toppings.map(t => t.idBienThe).sort()) === JSON.stringify(item.toppings.map(t => t.idBienThe).sort()) &&
        i.ice === item.ice &&
        i.sugar === item.sugar &&
        i.note === item.note
      );

      if (existingIndex > -1) {
        const newCart = [...cart];
        newCart[existingIndex].quantity += item.quantity;
        return { ...prev, [cartId]: newCart };
      }
      return { ...prev, [cartId]: [...cart, { ...item, id: Date.now() }] };
    });
  };

  const updateCartQty = (id, delta) => {
    const cartId = getCartId(screenParams);
    setCarts(prev => {
      const cart = prev[cartId] || [];
      const newCart = cart.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      return { ...prev, [cartId]: newCart };
    });
  };

  const removeFromCart = (id) => {
    const cartId = getCartId(screenParams);
    setCarts(prev => {
      const cart = prev[cartId] || [];
      const newCart = cart.filter(item => item.id !== id);
      return { ...prev, [cartId]: newCart };
    });
  };

  const clearCart = () => {
    const cartId = getCartId(screenParams);
    setCarts(prev => ({ ...prev, [cartId]: [] }));
  };

  if (currentScreen === 'Welcome') return <ManHinhChao onNavigate={navigate} />;
  if (currentScreen === 'Register') return <Register onNavigate={navigate} />;
  if (currentScreen === 'TableMap') return <TableMap onNavigate={navigate} />;
  
  if (currentScreen === 'OrderMenu') return (
    <OrderMenu 
      onNavigate={navigate} 
      table={screenParams.table} 
      isTakeaway={screenParams.isTakeaway}
      invoiceId={screenParams.invoiceId}
      cartCount={currentCart.length} 
    />
  );

  if (currentScreen === 'ProductDetail') return (
    <ProductDetail 
      onNavigate={navigate} 
      product={screenParams.product} 
      table={screenParams.table} 
      isTakeaway={screenParams.isTakeaway}
      invoiceId={screenParams.invoiceId}
      existingItem={screenParams.existingItem}
      onAddToCart={addToCart} 
    />
  );

  if (currentScreen === 'OrderSummary') return (
    <OrderSummary 
      onNavigate={navigate} 
      table={screenParams.table} 
      isTakeaway={screenParams.isTakeaway}
      invoiceId={screenParams.invoiceId}
      cart={currentCart}
      onUpdateQty={updateCartQty}
      onRemove={removeFromCart}
      onClear={clearCart}
    />
  );

  return <Login onNavigate={navigate} />;
};

export default App;
