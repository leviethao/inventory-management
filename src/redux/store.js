import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../redux/reducers';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const loggerMiddleware = createLogger();

const persistConfig = {
  key: 'root',
  storage: storage,
  stateReconciler: autoMergeLevel2
 };

 const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  pReducer,
  // rootReducer,
  applyMiddleware(
    thunkMiddleware,
    // loggerMiddleware
  )
);

export const persistor = persistStore(store);