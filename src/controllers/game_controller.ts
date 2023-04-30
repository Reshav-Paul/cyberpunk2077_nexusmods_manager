import { RequestHandler } from 'express';
import axios from 'axios';

import { GameType, CategoryType } from '../utils/types';
import Game from '../models/GameModel';
import { urlProvider } from '../utils/url_provider';
import { createDbError, createEntityExistsError, createNotFoundError } from '../utils/error_response';
import { userErrors, gameErrors } from '../utils/error_messages';

export let game_create: RequestHandler = async function game_create(req: any, res, next) {
  let game_response = await axios.get(urlProvider().gameByDomain(req.params.domain), {
    headers: {
      apikey: req.user_api_key
    }
  });

  if (!game_response.data || !game_response.data.id) {
    res.status(400).json(createNotFoundError(gameErrors.gameNotFound));
    return;
  }
  // console.log(game_response.data);
  let gameData: GameType = {
    id: game_response.data.id,
    name: game_response.data.name,
    domain_name: game_response.data.domain_name,
    nexusmods_url: game_response.data.nexusmods_url,
    categories: game_response.data.categories.map((category: CategoryType) => {
      if (!category.parent_category) {
        return Object.assign({}, {
          category_id: category.category_id,
          name: category.name,
        });
      } else {
        return category;
      }
    }),
  };

  let newGame = new Game(gameData);
  try {
    let createdGame = await newGame.save();
    let returnPayload = createdGame.toJSON();
    res.status(200).json(returnPayload);
  } catch (e: any) {
    if (e.code === 11000) {
      if (e.keyPattern.id === 1) {
        res.status(400).json(createEntityExistsError('Game already added'));
      }
    } else {
      res.status(400).json(createDbError(e));
    }
  }

}

export let get_game: RequestHandler = async function (req: any, res, next) {
  let game = await Game.findOne({ game_domain: req.params.domain }).lean();
  if (game) {
    res.json(game);
  } else {
    res.status(404).json(createNotFoundError(gameErrors.gameNotFound, { domain_name: req.params.domain }))
  }
}

export let game_get_categories: RequestHandler = async function (req: any, res, next) {
  let game = await Game.findOne({ game_domain: req.params.domain }).lean();
  if (game) {
    res.json(game.categories.filter(category => category.parent_category));
  } else {
    res.status(404).json(createNotFoundError(gameErrors.gameNotFound, { domain_name: req.params.domain }))
  }
}