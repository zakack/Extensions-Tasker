import { substituteParams } from '../../../../script.js';

(function() {
	eventSource.on(event_types.MESSAGE_RECEIVED, (messageId) => {

		const context = window['SillyTavern'].getContext();
		const message = context.chat[messageId];

		if (!message || message.mes === '' || message.mes === '...' || message.is_user) return;

		const textVariable = 'stmessage';
		const nameVariable = 'stname';
		tk.setLocal(textVariable, substituteParams(message.mes));
		tk.setLocal(nameVariable, message.name);
		tk.flash(`Received message to %stmessage variable.`);
	});
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
