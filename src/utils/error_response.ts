import { ValidationError } from 'express-validator';
import { ExceptionType, ModType } from './types';
import { modExceptions } from './error_messages';

export function createValidationError(errors: ValidationError[]) {
  return {
    error: {
      name: 'Validation_Error',
      errors: errors
    }
  }
}

export function formatToValidationErrorInBody(value: string, message: string, param: string): ValidationError {
  return {
    value,
    msg: message,
    param,
    location: 'body'
  }
}

export function createQueryValidationError(message: string) {
  return {
    error: {
      name: 'Invalid_Query',
      message,
    }
  }
}

export function createNotFoundError(message: string, data?: any) {
  return {
    error: {
      name: 'Not_Found',
      data,
      message,
    }
  }
}

export function createEntityExistsError(message: string) {
  return {
    error: {
      name: 'Entity_Exists',
      message,
    }
  }
}

export function createUnauthorizedError() {
  return 'Unauthorized';
}

export function createDbError(error: any, data?: any) {
  return {
    error: {
      name: 'Database_Error',
      data: data,
      message: error,
    }
  };
}

export function createModError(modID: number, domain: string, error: ExceptionType, name?: string) {
  let mod_data = {
    mod_id: modID,
    game_domain: domain,
    name
  };
  switch (error.name) {
    case modExceptions.duplicate_entry.name:
      return createDbError(error.message, mod_data);
    case modExceptions.save_error.name:
      return createDbError(error.message, mod_data);
    case modExceptions.not_found.name:
      return createNotFoundError(error.message, mod_data)
    case modExceptions.fetch_error.name:
      return {
        error: {
          name: error.name,
          data: mod_data,
          message: error.message
        }
      }
    default:
      return {
        error: {
          name: "Error",
          data: mod_data,
          message: "Some Error occured"
        }
      }
  }
}

export let createGenericServerError = function (message?: string) {
  return {
    error: {
      name: 'Generic_Server_Error',
      message: message ? message : 'Some Error Occured'
    }
  }
}