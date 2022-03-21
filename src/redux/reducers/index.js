import { combineReducers } from 'redux';

import { common } from './common-reducer';

const rootReducer = combineReducers({
  common,
});

export default rootReducer;