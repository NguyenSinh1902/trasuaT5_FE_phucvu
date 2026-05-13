import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import safeAsyncStorage from './src/utils/storage';

import Login from './src/screens/Login';
import Register from './src/screens/Register';
import ManHinhChao from './src/screens/ManHinhChao';
import TableMap from './src/screens/TableMap';
import OrderMenu from './src/screens/OrderMenu';
import ProductDetail from './src/screens/ProductDetail';
import OrderSummary from './src/screens/OrderSummary';
import OrderHistory from './src/screens/OrderHistory';
import VerifyOTP from './src/screens/Register/VerifyOTP';
import Settings from './src/screens/Settings';
import ForgotPassword from './src/screens/ForgotPassword';
import MainLayout from './src/components/MainLayout';

const Stack = createNativeStackNavigator();

const App = () => {
  // Object mapping cartId to items[]
  const [carts, setCarts] = useState({});
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await safeAsyncStorage.getItem('token');
      if (token) {
        setInitialRoute('TableMap');
      }
    } catch (e) {
      console.log('Error checking token', e);
    } finally {
      setIsCheckingToken(false);
    }
  };

  if (isCheckingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#064E3B' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const getCartId = (params) => {
    if (!params) return 'default';
    if (params.isTakeaway) return 'takeaway';
    if (params.invoiceId) return `inv_${params.invoiceId}`;
    if (params.table) return `table_${params.table.idBan || params.table.name || params.table.id || 'unknown'}`;
    return 'default';
  };

  // Hàm factory để map logic xử lý giỏ hàng vào từng route dựa trên params
  const getRouteActions = (params) => {
    const cartId = getCartId(params);
    const currentCart = carts[cartId] || [];

    return {
      currentCart,
      cartId,
      addToCart: (item) => {
        setCarts(prev => {
          const cart = prev[cartId] || [];
          if (item.replaceId) {
            const newCart = cart.map(i => i.id === item.replaceId ? { ...item, id: i.id } : i);
            return { ...prev, [cartId]: newCart };
          }
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
      },
      updateCartQty: (id, delta) => {
        setCarts(prev => {
          const cart = prev[cartId] || [];
          const newCart = cart.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
          );
          return { ...prev, [cartId]: newCart };
        });
      },
      removeFromCart: (id) => {
        setCarts(prev => {
          const cart = prev[cartId] || [];
          const newCart = cart.filter(item => item.id !== id);
          return { ...prev, [cartId]: newCart };
        });
      },
      clearCart: () => {
        setCarts(prev => ({ ...prev, [cartId]: [] }));
      }
    };
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Welcome">
          {({ navigation }) => <ManHinhChao onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {({ navigation }) => <Login onNavigate={(screen, params) => navigation.reset({ index: 0, routes: [{ name: screen, params }] })} />}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {({ navigation }) => <Register onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="ForgotPassword">
          {({ navigation }) => <ForgotPassword onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="VerifyOTP">
          {({ navigation, route }) => <VerifyOTP onNavigate={(screen, params) => navigation.navigate(screen, params)} route={route} />}
        </Stack.Screen>

        <Stack.Screen name="TableMap">
          {({ navigation, route }) => <MainLayout navigation={navigation} route={route} />}
        </Stack.Screen>

        <Stack.Screen name="OrderMenu">
          {({ navigation, route }) => {
            const params = route.params || {};
            const { currentCart, updateCartQty, removeFromCart, clearCart, addToCart } = getRouteActions(params);
            return (
              <OrderMenu
                onNavigate={(screen, p) => navigation.navigate(screen, p)}
                table={params.table}
                isTakeaway={params.isTakeaway}
                invoiceId={params.invoiceId}
                reservation={params.reservation}
                cartCount={currentCart.length}
                cart={currentCart}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onClear={clearCart}
                onAddToCart={addToCart}
              />
            );
          }}
        </Stack.Screen>

        <Stack.Screen name="ProductDetail">
          {({ navigation, route }) => {
            const params = route.params || {};
            const { addToCart } = getRouteActions(params);
            return (
              <ProductDetail
                onNavigate={(screen, p) => navigation.navigate(screen, p)}
                product={params.product}
                table={params.table}
                isTakeaway={params.isTakeaway}
                invoiceId={params.invoiceId}
                existingItem={params.existingItem}
                onAddToCart={addToCart}
              />
            );
          }}
        </Stack.Screen>

        <Stack.Screen name="OrderSummary">
          {({ navigation, route }) => {
            const params = route.params || {};
            const { currentCart, updateCartQty, removeFromCart, clearCart } = getRouteActions(params);
            return (
              <OrderSummary
                onNavigate={(screen, p) => navigation.navigate(screen, p)}
                table={params.table}
                isTakeaway={params.isTakeaway}
                invoiceId={params.invoiceId}
                cart={currentCart}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onClear={clearCart}
              />
            );
          }}
        </Stack.Screen>

        {/* OrderHistory and Settings are now handled inside MainLayout */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
