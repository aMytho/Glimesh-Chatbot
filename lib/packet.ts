/**
 * Checks a packet to see if it is a chat message.
 * @param packet The packet from glimesh.
 * @returns
 */
 function parsePacket(packet: any) {
	if (packet[1] == 1) {
		// Its the connection response, do nothing.
		return false
	} else if (packet[1] == 2) {
		// Glimesh confirming our chat message subscription.
		return false
	} else if (packet[1] == 3) {
		// Its a heartbeat. We can ignore it.
		return false
	} else if (packet[1] == 4) {
		// Its a response to a message we sent. We don't respond to those.
		return false
	} else {
		// Its a chat message!
		return packet[4].result.data.chatMessage.message
	}
}

export {parsePacket}