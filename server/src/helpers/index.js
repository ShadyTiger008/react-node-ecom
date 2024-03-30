export const generateOTP = (min = 100000, max = 999999) => {
  return Math.abs(Math.floor(Math.random() * (max - min + 1) + min));
};
