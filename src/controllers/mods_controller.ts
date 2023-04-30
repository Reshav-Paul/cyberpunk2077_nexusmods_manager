import { RequestHandler } from 'express';
import * as XLSX from 'xlsx';

import modHelper, { getModIDAndDomainFromURL } from '../utils/mods_helper';
import { createGenericServerError, createModError, createNotFoundError } from '../utils/error_response';
import { modExceptions } from '../utils/error_messages';
import Mod from '../models/ModModel';
import { ModQueryType, mModType } from '../utils/types';
import { FilterQuery } from 'mongoose';

export let mods_file_upload: RequestHandler = async function (req: any, res, next) {
  const data = XLSX.read(req.file.buffer, { type: 'buffer' });
  let urlColumnHeader = 'URL';
  let modURLs: string[] = [];
  data.SheetNames.forEach((sheetName: string) => {
    let sheetData = XLSX.utils.sheet_to_json(data.Sheets[sheetName]);
    modURLs = modURLs.concat(sheetData.map((sheetRow: any) => sheetRow[urlColumnHeader]).filter(value => value));
  });

  let modIDandDomains = modURLs.map(modURL => getModIDAndDomainFromURL(modURL));

  let response = [];
  for (let modIDandDomain of modIDandDomains) {
    if (!modIDandDomain.domain || isNaN(modIDandDomain.id)) return {};

    let existingMod: any;
    try {
      existingMod = await modHelper.getMod(modIDandDomain.id, modIDandDomain.domain);
      if (existingMod?._id) {
        response.push(createModError(modIDandDomain.id, modIDandDomain.domain, modExceptions.duplicate_entry, existingMod.name));
        continue;
      }
    } catch (error: any) { }

    try {
      let fetchedMod = await modHelper.fetchMod(modIDandDomain.id, modIDandDomain.domain, req.user_api_key);
      fetchedMod.files = await modHelper.fetchModFiles(fetchedMod.mod_id, fetchedMod.domain_name, 'main', req.user_api_key);
      let savedMod = await modHelper.saveMod(fetchedMod);
      response.push(savedMod);
    } catch (error: any) {
      response.push(createModError(modIDandDomain.id, modIDandDomain.domain, error));
    }
  }

  res.json(response);
}

export let get_mods: RequestHandler = async function (req: any, res, next) {
  let query: ModQueryType = {};
  if (req.query.category) {
    query.category_id = req.query.category.split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id);
  }
  if (req.query.domain_name) {
    query.domain_name = req.query.domain_name.split(',')
      .map((name: string) => name.trim())
      .filter((name: string) => name);
  }
  if (req.query.mod_id && req.query.domain_name) {
    query.mod_id = req.query.mod_id.split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id)
  }

  let queryAnd: FilterQuery<mModType> = {};
  let searchQuery: FilterQuery<mModType>;
  if (req.query.search) {
    query.name = req.query.search.split(',')
      .map((name: string) => name.trim())
      .filter((name: string) => name) as string[];
    query.description = query.name;
    query.summary = query.name;
    searchQuery = {
      $or: createSearchParameters(query.name, query.description, query.summary)
    };
    queryAnd.$and = [searchQuery];
  }
  console.log(query);
  try {
    let mods = await Mod.find({
      ...query.category_id ? { category_id: query.category_id } : {},
      ...query.domain_name ? { domain_name: query.domain_name } : {},
      ...query.mod_id ? { mod_id: query.mod_id } : {},
      ...queryAnd
    });
    res.json(mods);
  } catch (error) {
    console.log(error);
    res.status(500).json(createGenericServerError());
  }

}

export let get_mod_by_id: RequestHandler = async function (req: any, res, next) {
  let mod = await Mod.findById(req.params.id).lean();
  if (mod?._id) {
    res.json(mod);
  } else {
    res.json(createNotFoundError(modExceptions.not_found.message, { _id: req.params.id }));
  }
}

export let update_mod_files: RequestHandler = async function (req: any, res, next) {
  let mod = await Mod.findById(req.params.id).lean();
  if (!mod) {
    res.json(createNotFoundError(modExceptions.not_found.message, { _id: req.params.id }));
    return;
  }
  try {
    mod.files = await modHelper.fetchModFiles(mod.mod_id, mod.domain_name, 'main', req.user_api_key);
    let updatedMod = await Mod.findByIdAndUpdate(mod._id, { files: mod.files }, {
      new: true
    });
    res.json(updatedMod);
  } catch (error: any) {
    console.log(error);
    res.json(createModError(mod.mod_id, mod.domain_name, error));
  }
}

function createSearchParameters(nameQuery: string[], descQuery: string[], summaryQuery: string[]) {
  let searchParams: FilterQuery<mModType>[] = [];
  searchParams = searchParams.concat(nameQuery.map(function (nameSearchString: string) {
    return { name: { $regex: nameSearchString, $options: 'i' } } as FilterQuery<mModType>
  }));

  searchParams = searchParams.concat(descQuery.map(function (descSearchString: string) {
    return { name: { $regex: descSearchString, $options: 'i' } } as FilterQuery<mModType>
  }));

  searchParams = searchParams.concat(summaryQuery.map(function (summarySearchString: string) {
    return { name: { $regex: summarySearchString, $options: 'i' } } as FilterQuery<mModType>
  }));

  return searchParams;
}