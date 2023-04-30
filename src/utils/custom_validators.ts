import validator from "validator";

export let validateMongoId = function validateMongoId(id: string) {
  return validator.isMongoId(id);
}