import { commonTypes } from '../types';

const initialState = {
  hasLogin: false,
  loginData: null,
};

export function common(state = initialState, action) {
  switch (action.type) {
    case commonTypes.SET_COMMON:
      console.log('common state: ', state)
      return { ...state, ...action.common };
    default:
      return state;
  }
}
