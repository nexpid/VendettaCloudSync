export enum Responses {
	NotFound = 'url not found',
	UnknownError = 'an unknown error occured',
	FailedToAuthorize = 'failed to authenticate',
	FailedToSave = 'failed to save data',
	FailedToDelete = 'failed to delete data',
	Unauthorized = 'not authenticated',
	Authorized = 'successfully authenticated',
	InvalidBody = 'bad request: invalid body',
	InvalidQuery = 'bad request: invalid query',
	InvalidMethod = 'method not allowed',
}
