import { RESTGetAPIUserResult, RESTPostOAuth2AccessTokenResult, RESTPostOAuth2RefreshTokenResult, Routes } from 'discord-api-types/v10';
import constants from '../util/constants';

export async function grantCode(
	env: Env,
	code: string
): Promise<
	| RESTPostOAuth2AccessTokenResult
	| {
			error: string;
	  }
> {
	return await (
		await fetch(`https://discord.com/api/v10${Routes.oauth2TokenExchange()}`, {
			method: 'POST',

			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: constants.oauth2.clientId,
				client_secret: env.client_secret,
				grant_type: 'authorization_code',
				code,
				redirect_uri: constants.oauth2.redirectURL,
			}),
		})
	).json();
}

export async function refreshToken(env: Env, token: string): Promise<RESTPostOAuth2RefreshTokenResult> {
	return await (
		await fetch(`https://discord.com/api/v10${Routes.oauth2TokenExchange()}`, {
			method: 'POST',

			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: constants.oauth2.clientId,
				client_secret: env.client_secret,
				grant_type: 'refresh_token',
				refresh_token: token,
			}),
		})
	).json();
}

export async function getUserId(auth: string): Promise<string> {
	const res = (await (
		await fetch(`https://discord.com/api/v10${Routes.user('@me')}`, {
			headers: {
				authorization: `Bearer ${auth}`,
			},
		})
	).json()) as RESTGetAPIUserResult;

	return res.id;
}
