import type { NextPage } from "next";

const Home: NextPage = () => {
	return (
		<main className="home-page-container">
			<div className="home-content">
				<div className="home-title">
					<img alt="PaperPlane logo" src="assets/svg/paperplane_nobg.svg" />
					<h1>PAPERPLANE</h1>
				</div>
				<p>File uploading. URL Shortening. Protected views.</p>
			</div>
		</main>
	);
};

export default Home;
