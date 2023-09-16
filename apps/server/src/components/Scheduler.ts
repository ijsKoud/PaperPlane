import type { Awaitable } from "@snowcrystals/highway";

export default class Scheduler<Data> {
	/** The queue of data waiting to be dispatched */
	public queue: Data[] = [];

	/** The timeout which dispatches the data */
	public queueTimeout: NodeJS.Timeout | null = null;

	/** The timeout duration */
	public duration: number;

	/**
	 * @param duration The timeout duration
	 * @param schedulerFunction function which is ran when the timeout is over
	 */
	public constructor(duration: number, schedulerFunction?: SchedulerFunction<Data>) {
		if (schedulerFunction) this.schedulerFunction = schedulerFunction;
		this.duration = duration;
	}

	/**
	 * Adds an item to the queue
	 * @param data The data to add to the queue
	 */
	public add(data: Data) {
		this.queue.push(data);

		if (!this.queueTimeout) {
			const timeout = setTimeout(this._schedulerFunction.bind(this), this.duration);
			this.queueTimeout = timeout;
		}
	}

	/** Clears the queue and timeout */
	public clear() {
		if (this.queueTimeout) {
			clearTimeout(this.queueTimeout);
			this.queueTimeout = null;
		}

		this.queue = [];
	}

	protected schedulerFunction(queue: Data[]): void {
		queue;
	}

	private async _schedulerFunction() {
		try {
			await this.schedulerFunction(this.queue);
		} catch (err) {}

		this.queue = [];
		this.queueTimeout = null;
	}
}

export type SchedulerFunction<Data> = (queue: Data[]) => Awaitable<void>;
