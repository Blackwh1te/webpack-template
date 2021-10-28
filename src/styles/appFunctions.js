
const ratio = (a, b, fixed = 3) => {
  return (a / b).toFixed(fixed);
};

const percent = (a, b, fixed = 3) => {
  return (a / b * 100).toFixed(fixed) + '%';
}

module.exports = {
  ratio, percent
};
