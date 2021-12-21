import { store } from "react-notifications-component";

export const alert = (title: string, message: string, id?: string) => {
	store.addNotification({
		id,
		title,
		message,
		container: "bottom-right",
		type: "danger",
		dismiss: {
			duration: 5e3,
			showIcon: true,
			pauseOnHover: true,
			onScreen: true
		}
	});
};

export const success = (title: string, message: string, id?: string) => {
	store.addNotification({
		id,
		title,
		message,
		container: "bottom-right",
		type: "success",
		dismiss: {
			duration: 5e3,
			showIcon: true,
			pauseOnHover: true,
			onScreen: true
		}
	});
};

export const info = (title: string, message: string, id?: string) => {
	store.addNotification({
		id,
		title,
		message,
		container: "bottom-right",
		type: "info",
		dismiss: {
			duration: 5e3,
			showIcon: true,
			pauseOnHover: true,
			onScreen: true
		}
	});
};
