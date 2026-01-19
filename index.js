(function() {
    // Access the SillyTavern context to get event emitters and the chat state [1]
    const context = SillyTavern.getContext();
    const { eventSource, event_types } = context;

    /**
     * Function to sync the SillyTavern chat history to Tasker.
     * Triggered on MESSAGE_RECEIVED.
     */
    async function syncChatToTasker() {
        try {
            // Get the current chat history (array of ChatMessage objects) [1]
            const chatArray = context.chat;

            // Tasker's Android JS interface does not support arrays directly [3].
            // We JSON-stringify the entire array to pass it as a single string variable [3].
            const stringifiedChat = JSON.stringify(chatArray);

            // In a WebView environment, Tasker functions must use the 'tk' prefix [2][3].
            if (typeof tk !== 'undefined' && typeof tk.setGlobal === 'function') {
                // Sets the Tasker global variable %STCHAT to the JSON string [2].
                // In Tasker, you can use 'JavaScriptlet' or 'JSON Array/Object' 
                // actions to parse %STCHAT back into a usable structure.
                tk.setGlobal('STCHAT', stringifiedChat);
                
                // Optional: Trigger a Toast/Flash in Android to confirm the sync [2]
                tk.flash('SillyTavern: Chat history synced to %STCHAT');
            } else {
                console.warn('Tasker interface (tk) not found. Ensure SillyTavern is running inside a Tasker WebView.');
            }
        } catch (error) {
            console.error('Tasker Bridge Extension Error:', error);
        }
    }

    // Listen for the MESSAGE_RECEIVED event, which fires after the LLM message 
    // is recorded but before it is rendered in the UI [1].
    eventSource.on(event_types.MESSAGE_RECEIVED, syncChatToTasker);

    console.log("Tasker Bridge Extension: Active and listening for messages.");
})();
