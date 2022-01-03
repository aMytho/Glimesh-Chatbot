// Main file

// Imports dependencies
import WebSocket from "ws"
import { getAccessToken, readAuthInfo } from "./lib/auth";
import { checkForCommand } from "./lib/command";
import { parsePacket } from "./lib/packet";

/**
 * The token will store your access token once requested
 */
let token = "";
/**
 * Requests an access token from glimesh.
 * @returns
 */
async function authenticate() {
	let authInfo = await readAuthInfo();
	if (authInfo) {
		let accessToken = await getAccessToken(authInfo.clientId, authInfo.secretId);
		return accessToken
	}
}

let waitForAuth = authenticate();
waitForAuth.then(data => {
	console.log(data);
	// Make sure everything worked correctly.
	if (data && typeof data == "string") {
		token = data;
		connectToGlimesh(token);
	}
})

/**
 * Connects to glimesh chat. Requires a valid access token
 * @param token Your access token
 */
async function connectToGlimesh(token: string) {
	console.log("Trying to connect to the Glimesh API.");
	// The websocket connection
	let connection = new WebSocket(`wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=${token}`);

	// When the connection opens...
	connection.on("open", (data: any) => {
		console.log("Connected to Glimesh.");
		// Connect to phoenix websocket
		connection.send('["1","1","__absinthe__:control","phx_join",{}]');
		// IMPORTANT : Replace 6 with your channel ID. Joins a chat and listen for messages
		connection.send('["1","2","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: 6) { user { username avatar } message } }","variables":{} }]');
		// Send a heartbeat every 30 sec so glimesh knows we still exist
		setInterval(() => {
			connection.send('["1","3","phoenix","heartbeat",{}]');
		}, 30000)
	})

	// When the connection closes...
	connection.on("close", (closure: any) => {
		console.log(`Connection was closed.`);
		console.log(closure);
	})

	// When the connection has an error...
	connection.on("error", (err: any) => {
		console.log("Connection encountered an error! This will likely disconnect and fire the close event.");
		console.log(err);
	})

	// When the connection recieves data (any data, not just chat messages)
	connection.on("message", (data: Buffer) => {
		// Saves in a human readable format. Converts from buffer to text
		let glimeshData = data.toString();
		console.log(glimeshData);
		// Check the packet to see if it is a message
		let message = parsePacket(JSON.parse(glimeshData));
		// If the packet is a message we check if it is one of our commands
		if (message) {
			let command = checkForCommand(message);
			if (command) {
				// Its a command, sending a message!
				sendMessage(command);
			}
		}
	})

	/**
	 * Sends a message to glimesh chat
	 * @param message The message to send
	 */
	function sendMessage(message: string) {
		// IMPORTANT : Replace 6 with your channel ID!
		let query = `mutation {createChatMessage(channelId: 6, message: {message: "${message}"}) { message }}`
		let packet = [
			"1", "4", "__absinthe__:control", "doc",
			{
				query: query,
				variables: {}
			}
		]
		console.log(JSON.stringify(packet))
		// Sends the packet to Glimesh
		connection.send(JSON.stringify(packet))
	}
}