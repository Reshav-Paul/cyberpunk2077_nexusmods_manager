import validator from "validator";
import { getModIDAndDomainFromURL } from "./mods_helper";

export let validateMongoId = function validateMongoId(id: string) {
  return validator.isMongoId(id);
}

export let isNexusModURL = function (nexusURL: string) {
  let { domain_name, mod_id } = getModIDAndDomainFromURL(nexusURL);
  if (domain_name && mod_id) return true;
  return false;
}