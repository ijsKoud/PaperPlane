import type { NextApiRequest, NextApiResponse } from "next";
import type { FilesApiRes } from "@paperplane/utils";

export default function handler(req: NextApiRequest, res: NextApiResponse<FilesApiRes>) {
	res.send({
		files: [
			{
				date: new Date("12 Dec. 2022 4:32 PM"),
				name: "hello_world",
				isImage: true,
				password: null,
				size: 32200,
				url: "https://cdn.ijskoud.dev/files/Yi484X1RWK.png?preview=true",
				views: 1,
				visible: true
			}
		],
		pages: 1
	});
}
