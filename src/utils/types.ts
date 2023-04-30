import { Document, Types } from 'mongoose';

export type UserType = {
  username: string,
  email: string,
  password: string,
  api_key?: string,
}

export type UserUpdateType = {
  username?: string,
  api_key?: string,
}

export type CategoryType = {
  category_id: number,
  name: string,
  parent_category?: number | null,
}

export type GameType = {
  id: number,
  name: string,
  nexusmods_url: string,
  domain_name: string,
  categories: CategoryType[]
}

export type ModType = {
  name: string,
  summary: string,
  description: string,
  picture_url: string,
  mod_id: number
  game_id: number,
  domain_name: string,
  category_id: number,
  version: string,
  author: string,
  contains_adult_content: boolean,
  files?: ModFileType[],
}

export type ModQueryType = {
  mod_id?: number[],
  name?: string[],
  summary?: string[],
  description?: string[],
  category_id?: number[],
  domain_name?: string[],
}

export type ModFileType = {
  file_id: number,
  name: string,
  version: string,
  category_id: number,
  category_name: string,
  is_primary: boolean,
  file_name: string,
  uploaded_timestamp: number,
  uploaded_time: string,
  mod_version: string,
  description: string,
  size_kb: number,
  content_preview_link: string,
}

export type ExceptionType = {
  name: string,
  message: string,
}

export type mUserType = UserType & Document;
export type mGameType = GameType & Document;
export type mCategoryType = CategoryType & Document;
export type mModType = ModType & Document;