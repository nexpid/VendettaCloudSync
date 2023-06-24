export enum Responses {
	NotFound = 'url not found',
	FailedToAuthorize = 'failed to authenticate',
	Unauthorized = 'not authenticated',
	Authorized = 'successfully authenticated',
	InvalidBody = 'bad request: invalid body',
	InvalidQuery = 'bad request: invalid query',
	InvalidMethod = 'method not allowed',
}
