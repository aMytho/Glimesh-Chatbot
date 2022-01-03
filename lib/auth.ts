// File handles all auth functions.
import {readFile} from "fs/promises"
import {join} from  "path"
const axios:typeof import("axios").default = require('axios').default;
console.log("Auth Dependencies loaded!");

/**
 * Reads the auth.json file and returns the data within
 * @returns
 */
async function readAuthInfo(): Promise<AuthFile | false> {
	try {
		const path = join(__dirname, "..", "..", "auth.json");
		let data = await readFile(path);
		let authData = data.toString();
		return JSON.parse(authData);
	} catch(e) {
		console.log("Error getting auth info", e);
		return false
	}
}

/**
 * Attempts to get a glimesh access token with the users auth info
 * @param client Your client ID
 * @param secret Your secret ID
 * @returns
 */
async function getAccessToken(client: string, secret: string) {
	try {
		const URL = `https://glimesh.tv/api/oauth/token?grant_type=client_credentials&client_id=${client}&client_secret=${secret}&scope=chat public`;
		let data = await axios.post(URL);
		let tokenInfo = data.data as ClientCredentialsResult;
		console.log(tokenInfo);
		return tokenInfo.access_token
	} catch (e) {
		console.log(e);
		return false
	}
}

/**
 * The structure of the auth.json file.
 */
interface AuthFile {
	clientId: string;
	secretId: string;
}

/**
* Info from a client cred request. Read more about auth at https://glimesh.github.io/api-docs/docs/authentication/auth-explained/
*/
interface ClientCredentialsResult {
	access_token: string,
	created_at: string,
	expires_in: number,
	refresh_token: null,
	scope: string,
	token_type: string
}

export {getAccessToken, readAuthInfo}