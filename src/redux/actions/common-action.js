import { commonTypes } from '../types';

export const commonActions = {
  setCommon
};

function setCommon(common) {
  return { type: commonTypes.SET_COMMON, common: common};
}
