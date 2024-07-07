import { IRequest, Router } from 'itty-router';
import { Responses } from './util/types';
import constants from './util/constants';
import { getUserId, grantCode, refreshToken } from './api/discord';
import { deleteSave, getSave, setSave } from './api/db';
import { DBSave } from './api/db/latest';

const makeResponse = (status: number, message: string, error?: any) =>
	new Response(JSON.stringify({ message, status, error: error?.toString() }), { status });

const isAuthorizedMw = async (req: IRequest, env: Env) => {
	const auth = req.headers.get('authorization') as string;
	if (typeof auth !== 'string') return makeResponse(401, Responses.Unauthorized);

	const userId = await getUserId(auth);
	if (!userId) return makeResponse(401, Responses.FailedToAuthorize);

	req.save = await getSave(env, userId);
	if (req.save.version !== 1) return makeResponse(403, "cannot downgrade data! use the newest Cloud Sync version");
};

const router = Router();

// oauth2 stuff
router.get('/api/get-oauth2-url', () => {
	const query = new URLSearchParams();
	query.append('client_id', constants.oauth2.clientId);
	query.append('redirect_uri', constants.oauth2.redirectURL);
	query.append('response_type', 'code');
	query.append('scope', ['identify'].join(' '));

	return Response.redirect(`https://discord.com/api/oauth2/authorize?${query.toString()}`);
});

/**
 * @deprecated new path is /api/get-access-token
 */
router.get('/api/oauth2-response', async (req, env) => {
	const { code, vendetta } = req.query;
	if (typeof code !== 'string') return makeResponse(400, Responses.InvalidQuery);

	let auth;
	try {
		auth = await grantCode(env, code);
	} catch (e) {
		console.log(e);
		return makeResponse(401, Responses.FailedToAuthorize, e);
	}
	if (!auth || 'error' in auth) return makeResponse(401, Responses.FailedToAuthorize, auth.error);

	return vendetta === 'true' ? new Response(auth.access_token) : makeResponse(200, Responses.Authorized);
});

router.get('/api/get-access-token', async (req, env) => {
	const { code } = req.query;
	if (typeof code !== 'string') return makeResponse(400, Responses.InvalidQuery);

	let auth;
	try {
		auth = await grantCode(env, code);
	} catch (e) {
		console.log(e);
		return makeResponse(401, Responses.FailedToAuthorize, e);
	}
	if (!auth || 'error' in auth || !auth.access_token || !auth.refresh_token)
		return makeResponse(401, Responses.FailedToAuthorize, 'error' in auth && auth.error);

	return Response.json({
		accessToken: auth.access_token,
		refreshToken: auth.refresh_token,
		expiresAt: Date.now() + auth.expires_in * 1000 - 5_000,
	});
});
router.get('/api/refresh-access-token', async (req, env) => {
	const { refresh_token: token } = req.query;
	if (typeof token !== 'string') return makeResponse(400, Responses.InvalidQuery);

	let auth;
	try {
		auth = await refreshToken(env, token);
	} catch (e) {
		console.log(e);
		return makeResponse(401, Responses.FailedToAuthorize, e);
	}
	if (!auth || 'error' in auth || !auth.access_token || !auth.refresh_token)
		return makeResponse(401, Responses.FailedToAuthorize, 'error' in auth && auth.error);

	return Response.json({
		accessToken: auth.access_token,
		refreshToken: auth.refresh_token,
		expiresAt: Date.now() + auth.expires_in * 1000 - 5_000,
	});
});

// db
router.get('/api/get-data', isAuthorizedMw, async (req) => {
	const save = req.save as DBSave.Save;

	return Response.json(save);
});
router.post(
	'/api/sync-data',
	async (req) => {
		try {
			let parsed;
			try {
				parsed = await req.json();
			} catch {
				return makeResponse(400, Responses.InvalidBody);
			}

			let isValid = true;
			if (!Array.isArray(parsed.plugins)) isValid = false;
			else
				parsed.plugins = parsed.plugins.map((x: any) => {
					if (!isValid) return;
					if (typeof x.id !== 'string') {
						isValid = false;
						return;
					}
					if (typeof x.enabled !== 'boolean') {
						isValid = false;
						return;
					}
					if (typeof x.options !== 'object' || Array.isArray(x.options)) {
						isValid = false;
						return;
					}

					return { id: x.id, enabled: !!x.enabled, options: JSON.parse(JSON.stringify(x.options)) };
				});

			if (!Array.isArray(parsed.themes)) isValid = false;
			else
				parsed.themes = parsed.themes.map((x: any) => {
					if (!isValid) return;
					if (typeof x.id !== 'string') {
						isValid = false;
						return;
					}
					if (typeof x.enabled !== 'boolean') {
						isValid = false;
						return;
					}

					return { id: x.id, enabled: !!x.enabled };
				});

			if (!isValid) return makeResponse(400, Responses.InvalidBody);

			req.parsed = parsed;
		} catch (e: any) {
			return makeResponse(500, Responses.UnknownError, `c1: ${e?.message ?? String(e)}`);
		}
	},
	isAuthorizedMw,
	async (req, env) => {
		const save = req.save as DBSave.Save;
		save.sync = req.parsed;

		return (await setSave(env, save.user, save)) ? Response.json(save) : makeResponse(500, Responses.FailedToSave);
	}
);
router.delete('/api/delete-data', isAuthorizedMw, async (req, env) => {
	const save = req.save as DBSave.Save;

	return (await deleteSave(env, save.user)) ? Response.json(true) : makeResponse(500, Responses.FailedToDelete);
});

router.all('*', () => makeResponse(404, Responses.NotFound));

export default router;
