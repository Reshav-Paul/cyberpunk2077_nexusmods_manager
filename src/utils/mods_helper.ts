import axios from "axios";
import url from "url";

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

export let getModIDAndDomainFromURL = function (nexusURL: string) {
  let parsedURL = url.parse(nexusURL);
  let domain_name = '', mod_id = 0;
  if (parsedURL.hostname === 'www.nexusmods.com') {
    let pathComponents = parsedURL.pathname?.split('/').filter(element => element.length > 0);
    if (pathComponents) {
      domain_name = pathComponents[0];
      mod_id = parseInt(pathComponents[2]);
    }
  }
  return { domain_name, mod_id };
}

let modHelper = {
  fetchMod,
  fetchModFiles,
  saveMod,
  getMod,
  getModIDAndDomainFromURL
}

export default modHelper;