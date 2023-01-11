import type { NextApiRequest, NextApiResponse } from "next";
import type { UrlsApiRes } from "@paperplane/utils";

export default function handler(req: NextApiRequest, res: NextApiResponse<UrlsApiRes>) {
	res.send({
		urls: [
			{
				date: new Date("12 Dec. 2022 4:32 PM"),
				name: "test",
				url: "https://cdn.ijskoud.dev/r/test",
				redirect: "https://cdn.ijskoud.dev/files/Yi484X1RWK.png",
				visits: 1,
				visible: true
			},
			{
				date: new Date("12 Dec. 2022 4:32 PM"),
				name: "test1",
				url: "https://cdn.ijskoud.dev/r/test1",
				redirect: "https://cdn.ijskoud.dev/files/Yi484X1RWK.png",
				visits: 1,
				visible: true
			},
			{
				date: new Date("12 Dec. 2022 4:32 PM"),
				name: "test2",
				url: "https://cdn.ijskoud.dev/r/test2",
				redirect: "https://cdn.ijskoud.dev/files/Yi484X1RWK.png",
				visits: 1,
				visible: true
			}
		],
		pages: 1
	});
}
