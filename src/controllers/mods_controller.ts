import { RequestHandler } from 'express';
import * as XLSX from 'xlsx';

import modHelper, { getModIDAndDomainFromURL } from '../utils/mods_helper';
import { createGenericServerError, createModError, createNotFoundError } from '../utils/error_response';
import { modExceptions } from '../utils/error_messages';
import Mod from '../models/ModModel';
import { ModQueryType, mModType } from '../utils/types';
import { FilterQuery } from 'mongoose';
import { body, validationResult } from 'express-validator';
import { createValidationError } from '../utils/error_response';
import isURL from 'validator/lib/isURL';
import { isNexusModURL } from '../utils/custom_validators';

export let modCreationValidation = [
  body('mod_id', modExceptions.mod_id_empty.message).exists().bail().trim().notEmpty().isNumeric(),
  body('domain_name', modExceptions.game_domain_empty.message).exists().bail().trim().notEmpty(),
  body('url', modExceptions.url_empty.message).exists().bail().trim().notEmpty().isURL(),
  body('url', modExceptions.url_invalid.message).exists().bail().custom(isNexusModURL),
];

export let mods_file_upload: RequestHandler = async function (req: any, res, next) {
  const data = XLSX.read(req.file.buffer, { type: 'buffer' });
  let urlColumnHeader = 'URL';
  let modURLs: string[] = [];
  data.SheetNames.forEach((sheetName: string) => {
    let sheetData = XLSX.utils.sheet_to_json(data.Sheets[sheetName]);
    modURLs = modURLs.concat(sheetData.map((sheetRow: any) => sheetRow[urlColumnHeader]).filter(value => value));
  });

  let modIDandDomains = modURLs.filter(url => isURL(url)).map(modURL => getModIDAndDomainFromURL(modURL));

  let response = [];
  for (let modIDandDomain of modIDandDomains) {
    if (!modIDandDomain.domain_name || isNaN(modIDandDomain.mod_id)) return {};

    let existingMod: any;
    try {
      existingMod = await modHelper.getMod(modIDandDomain.mod_id, modIDandDomain.domain_name);
      if (existingMod?._id) {
        response.push(createModError(modIDandDomain.mod_id, modIDandDomain.domain_name, modExceptions.duplicate_entry, existingMod.name));
        continue;
      }
    } catch (error: any) { }

    try {
      let fetchedMod = await modHelper.fetchMod(modIDandDomain.mod_id, modIDandDomain.domain_name, req.user_api_key);
      fetchedMod.files = await modHelper.fetchModFiles(fetchedMod.mod_id, fetchedMod.domain_name, 'main', req.user_api_key);
      let savedMod = await modHelper.saveMod(fetchedMod);
      response.push(savedMod);
    } catch (error: any) {
      response.push(createModError(modIDandDomain.mod_id, modIDandDomain.domain_name, error));
    }
  }

  res.json(response);
}

export let add_mod: RequestHandler = async function (req: any, res, next) {
  const errors = validationResult(req);
  let shouldFetchFromURL = false;
  if (!errors.isEmpty()) {
    let validationErrors = errors.array();
    let urlErrors = validationErrors.filter(error => error.param === 'url');
    let otherErrors = validationErrors.filter(error => error.param !== 'url');
    validationErrors = [];
    if (req.body.url) {
      if (urlErrors.length > 0 && otherErrors.length !== 0) validationErrors = urlErrors;
      if (urlErrors.length === 0) shouldFetchFromURL = true;
    } else {
      if (otherErrors.length > 0) validationErrors = otherErrors;
    }
    if (validationErrors.length > 0) {
      res.status(400).json(createValidationError(validationErrors));
      return;
    }
  } else shouldFetchFromURL = true;

  try {
    let { mod_id, domain_name } = req.body;
    if (shouldFetchFromURL) {
      let modIDandDomainFromURL = getModIDAndDomainFromURL(req.body.url);
      mod_id = modIDandDomainFromURL.mod_id;
      domain_name = modIDandDomainFromURL.domain_name;
    }
    let fetchedMod = await modHelper.fetchMod(mod_id, domain_name, req.user_api_key);
    fetchedMod.files = await modHelper.fetchModFiles(fetchedMod.mod_id, fetchedMod.domain_name, 'main', req.user_api_key);
    let savedMod = await modHelper.saveMod(fetchedMod);
    res.json(savedMod);
  } catch (error: any) {
    res.json(createModError(req.body.mod_id, req.body.domain_name, error));
  }
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