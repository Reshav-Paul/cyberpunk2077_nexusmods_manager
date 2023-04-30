"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenericServerError = exports.createModError = exports.createDbError = exports.createUnauthorizedError = exports.createEntityExistsError = exports.createNotFoundError = exports.createQueryValidationError = exports.formatToValidationErrorInBody = exports.createValidationError = void 0;
const error_messages_1 = require("./error_messages");
function createValidationError(errors) {
    return {
        error: {
            name: 'Validation_Error',
            errors: errors
        }
    };
}
exports.createValidationError = createValidationError;
function formatToValidationErrorInBody(value, message, param) {
    return {
        value,
        msg: message,
        param,
        location: 'body'
    };
}
exports.formatToValidationErrorInBody = formatToValidationErrorInBody;
function createQueryValidationError(message) {
    return {
        error: {
            name: 'Invalid_Query',
            message,
        }
    };
}
exports.createQueryValidationError = createQueryValidationError;
function createNotFoundError(message, data) {
    return {
        error: {
            name: 'Not_Found',
            data,
            message,
        }
    };
}
exports.createNotFoundError = createNotFoundError;
function createEntityExistsError(message) {
    return {
        error: {
            name: 'Entity_Exists',
            message,
        }
    };
}
exports.createEntityExistsError = createEntityExistsError;
function createUnauthorizedError() {
    return 'Unauthorized';
}
exports.createUnauthorizedError = createUnauthorizedError;
function createDbError(error, data) {
    return {
        error: {
            name: 'Database_Error',
            data: data,
            message: error,
        }
    };
}
exports.createDbError = createDbError;
function createModError(modID, domain, error, name) {
    let mod_data = {
        mod_id: modID,
        game_domain: domain,
        name
    };
    switch (error.name) {
        case error_messages_1.modExceptions.duplicate_entry.name:
            return createDbError(error.message, mod_data);
        case error_messages_1.modExceptions.save_error.name:
            return createDbError(error.message, mod_data);
        case error_messages_1.modExceptions.not_found.name:
            return createNotFoundError(error.message, mod_data);
        case error_messages_1.modExceptions.fetch_error.name:
            return {
                error: {
                    name: error.name,
                    data: mod_data,
                    message: error.message
                }
            };
        default:
            return {
                error: {
                    name: "Error",
                    data: mod_data,
                    message: "Some Error occured"
                }
            };
    }
}
exports.createModError = createModError;
let createGenericServerError = function (message) {
    return {
        error: {
            name: 'Generic_Server_Error',
            message: message ? message : 'Some Error Occured'
        }
    };
};
exports.createGenericServerError = createGenericServerError;
//# sourceMappingURL=error_response.js.map