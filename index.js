(function() {
    const context = SillyTavern.getContext();
    const { eventSource, event_types } = context;

    /**
     * Iterates through the chat history and exports each message 
     * as an individual Tasker global variable to bypass size limits.
     */
    async function syncChatToTasker() {
        try {
            const chatArray = context.chat; // Access the mutable chat log [1]

            if (typeof tk === 'undefined' || typeof tk.setGlobal !== 'function') {
                console.warn('Tasker interface (tk) not found.');
                return;
            }

            // 1. Export the total count so Tasker knows how many variables to process
            tk.setGlobal('ST_CHAT_COUNT', chatArray.length.toString());

            // 2. Iterate and set individual variables (%ST_CHAT1, %ST_CHAT2, etc.) [2]
            chatArray.forEach((message, index) => {
                // Tasker array indices typically start at 1 for user convenience
                const taskerIndex = index + 1;
                const variableName = `ST_CHAT${taskerIndex}`;
                
                // Stringify each message object individually to stay under size limits [3]
                const stringifiedMessage = JSON.stringify(message);
                
                // Set the global variable in Tasker [2]
                tk.setGlobal(variableName, stringifiedMessage);
            });

            // Optional: Provide UI feedback via a Tasker Toast [2]
            tk.flash(`Synced ${chatArray.length} messages to %ST_CHAT array.`);

        } catch (error) {
            console.error('Tasker Bridge Extension Error:', error);
        }
    }

    // Listen for the MESSAGE_RECEIVED event [1]
    eventSource.on(event_types.MESSAGE_RECEIVED, syncChatToTasker);

    console.log("Tasker Bridge: Individual message sync active.");
})();

(function() {
	const { eventSource, event_types } = SillyTavern.getContext();

	async function signalReady() {
		try {
			if (typeof tk === 'undefined' || typeof tk.setGlobal !== 'function') {
				console.warn('Tasker interface (tk) not found.');
				return;
			}
			tk.setGlobal('STREADY', true);
            tk.flash(`SillyTavern is ready!`);
		} catch (error) {
			console.error('Failed to signal ST readiness.');
		}
	}

	eventSource.on(event_types.APP_READY, signalReady);
    console.log("Tasker Bridge: SillyTavern is ready!");
})();

window.addEventListener('TaskerToST', async (event) => {
    const taskerConvo = event.detail.message; // The data sent from Tasker
    const taskerSlash = '/go Zachary||/newchat||/persona mode=temp ' + taskerConvo.sender + '||/send ' + taskerConvo.text;
    
    // Obtain the SillyTavern context for access to internal utilities [1]
    const context = SillyTavern.getContext();

    try {
        // Use the SlashCommandParser to process the incoming data as a message [1]
        // This simulates the user hitting 'Enter' and triggers the generation process.
        if (window.SlashCommandParser) {
            await window.SlashCommandParser.runLine(taskerSlash);
        }
    } catch (error) {
        console.error('[Tasker Bridge] Failed to trigger message send:', error);
    }
});

// jQuery(async () => {
//   // This is an example of loading HTML from a file
//   const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
//
//   // Append settingsHtml to extensions_settings
//   // extension_settings and extensions_settings2 are the left and right columns of the settings menu
//   // Left should be extensions that deal with system functions and right should be visual/UI related 
//   $("#extensions_settings").append(settingsHtml);
//
//   // These are examples of listening for events
//   $("#my_button").on("click", onButtonClick);
//   $("#example_setting").on("input", onExampleInput);
//
//   // Load settings when starting things up (if you have any)
//   loadSettings();
// });
