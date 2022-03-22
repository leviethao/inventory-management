import { commonTypes } from '../types';

const initialState = {
  hasLogin: false,
  loginData: null,
  loginPage: false,
};

export function common(state = initialState, action) {
  switch (action.type) {
    case commonTypes.SET_COMMON:
      return { ...state, ...action.common };
    default:
      return state;
  }
}
