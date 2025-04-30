export enum RegistrationResponse {
	REGISTERED = 'You are already registered!',
	SUCCESS = 'Your registration request has been sent to the admin! You will receive the response here. Wait please. 🙂',
	SUCCESS_AFTER_WEEK = 'The 7-day period has elapsed. Your registration request has been resubmitted to the administrator. You will receive a response here. We appreciate your patience. 🙂',
	SUCCESS_AFTER_DAY = 'The 24-hours period has elapsed. Your registration request has been resubmitted to the administrator. You will receive a response here. We appreciate your patience. 🙂',
	FAILURE_DAY = 'You have already sent a registration request! You must wait at least a day before sending it again!😡',
	REJECT_RESPONSE = `Your registration request has been rejected. If you have any questions, contact our support team.`,
	REJECT_ADMIN = 'Your registration request has been rejected by the administrator. You can repeat your request after a week.',
	APPROVE_ADMIN = 'You have been registered in the service. Now you can send audio files for transcription into text! Enjoy using the service!🙂',
}
