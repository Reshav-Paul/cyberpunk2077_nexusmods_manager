import axios from "axios";

import { ModFileType, ModType } from "./types";
import Mod from "../models/ModModel";
import { modExceptions } from "./error_messages";
import { urlProvider } from "./url_provider";

async function fetchMod(mod_id: number, game_domain: string, apikey: string) {
  let modPayload = await axios.get(urlProvider().modByID(mod_id, game_domain),
    { headers: { apikey } }
  );
  if (modPayload.status !== 200) throw modExceptions.fetch_error;

  let modData: ModType = { ...modPayload.data };
  return modData;
}

async function fetchModFiles(mod_id: number, game_domain: string, category: string, apikey: string) {
  let modFilesResponse = await axios.get(urlProvider().modFiles(mod_id, game_domain, category),
    { headers: { apikey } }
  );
  if (modFilesResponse.status !== 200) throw modExceptions.files_not_found;

  let modFiles: ModFileType[] = modFilesResponse.data.files.map((modFile: any) => {
    return {
      ...modFile
    } as ModFileType;
  });

  return modFiles;
}

async function saveMod(mod: ModType) {
  let newMod = new Mod(mod);
  try {
    let savedMod = await newMod.save();
    let savedModJSON = savedMod.toJSON();
    return savedModJSON;
  } catch (e: any) {
    if (e.code === 11000) {
      if (e.keyPattern.id === 1) {
        throw modExceptions.duplicate_entry;
      }
    }
    throw modExceptions.save_error;
  }
}

async function getMod(id: number, domain: string) {
  let mod = await Mod.findOne({ mod_id: id, domain_name: domain }).lean();
  if (!mod?._id) throw modExceptions.not_found;
  return mod;
}

export let getModIDAndDomainFromURL = function (url: string) {
  const prefix = 'nexusmods.com';
  let game_domain_index = url.indexOf(prefix);
  game_domain_index += (prefix.length + 1);

  let domainAndID = url.substring(game_domain_index, url.length);
  let [domain, id_str] = domainAndID.split('/mods/');
  let id = parseInt(id_str);
  return { domain, id };
}

let modHelper = {
  fetchMod,
  fetchModFiles,
  saveMod,
  getMod,
  getModIDAndDomainFromURL
}

export default modHelper;