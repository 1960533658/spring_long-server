module.exports.maxIdAndMinId = (id1, id2) => {
  const maxId = Math.max(id1, id2);
  const minId = Math.min(id1, id2);
  return {
    maxId,
    minId,
  };
};
