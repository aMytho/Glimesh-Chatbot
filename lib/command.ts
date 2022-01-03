/**
 * Checks if a chat message constains a command trigger (see Command type below)
 * @param message The chat message
 * @returns
 */
 function checkForCommand(message: string): string | false {
	// We only check the first word for the !commandname
	let firstWord = message.split(" ")[0];
	// Loops through all our commands to see if we have a match
	for (let i=0; i < Commands.length; i++) {
		if (Commands[i].cmdName == firstWord) {
			// If we have a match we return the command response
			return Commands[i].cmdMessage;
		}
	}
	return false
}

/**
 * Group of your commands. Add as many as you want!
 */
const Commands:Command[] = [
	{
		cmdName:  "!example",
		cmdMessage:  "Hello World!"
	}
]

/**
 * The basic structure of a command. Every command has a name(trigger) and a message.
 */
type Command = {
	cmdName: string;
	cmdMessage: string
}

export { checkForCommand }