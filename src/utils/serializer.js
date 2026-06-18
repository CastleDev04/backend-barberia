function serializeBigInt(obj) {
  try {
    return JSON.parse(
      JSON.stringify(obj, (k, v) => (typeof v === "bigint" ? v.toString() : v))
    );
  } catch (err) {
    return obj;
  }
}

module.exports = { serializeBigInt };
