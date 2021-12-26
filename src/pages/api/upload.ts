import type { NextApiRequest, NextApiResponse } from "next";
import { getUserWithToken } from "../../lib/utils";
import multer from "multer";
import { FILE_DATA_DIR } from "../../lib/constants";

const uploader = multer({
	storage: multer.diskStorage({
		destination: FILE_DATA_DIR,
		filename: (req, file, cl) => cl(null, file.originalname)
	})
});
export type NextApiReq = NextApiRequest & {
	files?: Express.Multer.File[];
};

function finalHandler(req: NextApiReq, res: NextApiResponse) {
	if (req.method === "POST") {
		console.log(req.files, req);
		const files = (req.files ?? []).map((file) => `${process.env.NEXT_PUBLIC_DOMAIN}/files/${file.filename}`);
		return res.json({ files, url: files[0] });
	}

	res.status(403).json({ error: "Forbidden method" });
}

async function uploadHandler(req: NextApiReq, res: NextApiResponse) {
	const error = await new Promise((resolve) =>
		// @ts-ignore should work even though typings don't match
		uploader.array("upload")(req, res, (result) => resolve(result))
	);
	if (error instanceof Error) return res.status(500).send({ error: error.name, message: "Something went wrong, please try again later!" });

	finalHandler(req, res);
}

export default async function handler(req: NextApiReq, res: NextApiResponse) {
	const user = await getUserWithToken(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in in order to do this" });

	return uploadHandler(req, res);
}

export const config = {
	api: {
		bodyParser: false
	}
};
