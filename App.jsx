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

  const navigate = (screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  if (currentScreen === 'Welcome') return <ManHinhChao onNavigate={navigate} />;
  if (currentScreen === 'Register') return <Register onNavigate={navigate} />;
  if (currentScreen === 'TableMap') return <TableMap onNavigate={navigate} />;
  if (currentScreen === 'OrderMenu') return <OrderMenu onNavigate={navigate} table={screenParams.table} />;
  if (currentScreen === 'ProductDetail') return <ProductDetail onNavigate={navigate} product={screenParams.product} table={screenParams.table} />;
  if (currentScreen === 'OrderSummary') return <OrderSummary onNavigate={navigate} table={screenParams.table} />;

  return <Login onNavigate={navigate} />;
};

export default App;
