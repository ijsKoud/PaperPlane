export interface Config {
	/** Encryption key which is used to encrypt all cookies with */
	encryptionKey: string;
	/** The id generator type
	 * @default id
	 */
	nameType: NameType;
	/** The amount of characters in a file/url id
	 * @default 10
	 */
	nameLength: number;
	/** The port used to listen to requests
	 * @default 3000
	 */
	port: number;
	/** The extensions which are allowed to be uploaded
	 * @default all extensions
	 */
	extensions: string[];
	/** The amount of files that can be uploaded per request
	 * @default infinity
	 */
	maxFilesPerRequest: number;
	/** The max size a file can be
	 * @default infinity
	 */
	maxFileSize: number;
}

export type NameType = "id" | "zerowidth" | "name";
