/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import '@react-native-firebase/app';
import App from './App';

LogBox.ignoreAllLogs();
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
