import { IRequest, Router } from 'itty-router';
import { Responses } from './util/types';
import constants from './util/constants';
import { getUserId, grantCode } from './api/discord';
import { deleteSave, getSave, setSave } from './api/db';
import { DBSave } from './api/db/latest';

const makeResponse = (status: number, message: string, error?: any) =>
	new Response(JSON.stringify({ message, status, error: error?.toString() }), { status });
const jsonResponse = (json: any) => new Response(JSON.stringify(json), { status: 200 });

const isAuthorizedMw = async (req: IRequest) => {
	const auth = req.headers.get('authorization') as string;
	if (typeof auth !== 'string') return makeResponse(401, Responses.Unauthorized);

	const userId = await getUserId(auth);
	if (!userId) return makeResponse(401, Responses.FailedToAuthorize);

	req.save = await getSave(userId);
};

const router = Router();

// oauth2 stuff
router.get('/api/get-oauth2-url', (req) => {
	const query = new URLSearchParams();
	query.append('client_id', constants.oauth2.clientId);
	query.append('redirect_uri', constants.oauth2.redirectURL);
	query.append('response_type', 'code');
	query.append('scope', ['identify'].join(' '));

	return Response.redirect(`https://discord.com/api/oauth2/authorize?${query.toString()}`);
});

router.get('/api/oauth2-response', async (req, env: Env) => {
	const { code, vendetta } = req.query;
	if (typeof code !== 'string') return makeResponse(400, Responses.InvalidQuery);

	let auth;
	try {
		auth = await grantCode(env, code);
	} catch (e) {
		console.log(e);
		return makeResponse(401, Responses.FailedToAuthorize, e);
	}

	return vendetta === 'true' ? new Response(auth) : makeResponse(200, Responses.Authorized);
});

// db
router.get('/api/get-data', isAuthorizedMw, (req) => {
	const save = req.save as DBSave.Save;

	return jsonResponse(save);
});
router.post(
	'/api/sync-data',
	async (req) => {
		let parsed;
		try {
			parsed = await req.json();
		} catch {
			return makeResponse(400, Responses.InvalidBody);
		}

		console.log(parsed);

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

				let options = {};
				let iterate = (writeTo: any, readFrom: any) => {
					for (const [x, y] of Object.entries(readFrom)) {
						if (['string', 'number', 'boolean'].includes(typeof y)) writeTo[x] = y;
						else if (typeof y === 'object' && !Array.isArray(y)) {
							writeTo[x] = {};
							iterate(writeTo[x], y);
						}
					}
				};
				iterate(options, x.options);

				return { id: x.id, enabled: !!x.enabled, options };
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
	},
	isAuthorizedMw,
	(req) => {
		const save = req.save as DBSave.Save;
		save.sync = req.parsed;
		setSave(save.user, save);

		return jsonResponse(save);
	}
);
router.delete('/api/delete-data', isAuthorizedMw, (req) => {
	const save = req.save as DBSave.Save;
	deleteSave(save.user);

	return jsonResponse(true);
});

router.all('*', () => makeResponse(404, Responses.NotFound));

export default router;
