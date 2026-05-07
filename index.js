/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';

LogBox.ignoreAllLogs();
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
