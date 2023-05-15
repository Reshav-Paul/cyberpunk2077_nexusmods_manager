import { ExceptionType } from "./types"

export let userErrors = {
  duplicateEmail: 'Email already signed up',
  noFirstname: 'First Name is required',
  invalidFirstname: 'First Name must be strictly alphabetic',
  noLastname: 'Last Name is required',
  invalidLastname: 'Last Name must be strictly alphabetic',
  noUsername: 'Username is required',
  noEmail: 'Email is required',
  invalidEmail: 'Invalid Email',
  noPassword: 'Password is required',
  loginDefaultError: 'An Error Occured during Login! Please try Again.',
  wrongPassword: 'Wrong Password',
  noUserFound: 'User not Found. Try signing up',
  noAPIKey: 'API Key not set',
}

export let gameErrors = {
  gameNotFound: 'Game not Found',
}

export let generalErrors = {
  invalidMongoId: 'Invalid ID',
}

export let modExceptions = {
  duplicate_entry: { name: "Duplicate_Entry", message: "Mod has already been Added" },
  save_error: { name: "Database_Save_Error", message: "Mod could not be saved" },
  fetch_error: { name: "Mod_Fetch_Error", message: "Mod could not be fetched from nexus" },
  files_not_found: { name: "Mod_Files_Fetch_Error", message: "Mod files could not be found" },
  not_found: { name: "Mod_Fetch_Error", message: "Mod could not be found" },
  game_domain_empty: { name: "Game_Domain_Empty", message: "Game Domain is mandatory" },
  mod_id_empty: { name: "Mod_ID_Empty", message: "Mod ID is mandatory" },
  url_empty: { name: "URL_Empty", message: "URL is mandatory" },
  url_invalid: { name: "URL_Invalid", message: "URL is invalid" },
}