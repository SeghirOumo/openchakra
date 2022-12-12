const { PRODUCT_DISC_OPTION } = require("../../../utils/fumoir/consts");
const mongoose = require("mongoose");
const { schemaOptions } = require("../../utils/schemas");

const Schema = mongoose.Schema;

const CigarSchema = new Schema(
  {},
  { ...schemaOptions, ...PRODUCT_DISC_OPTION }
);

module.exports = CigarSchema;
