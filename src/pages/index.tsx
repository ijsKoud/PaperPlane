import type { NextPage } from "next";
import Button from "../components/general/Button";

const Home: NextPage = () => {
	return (
		<main className="home-page-container">
			<div className="home-content">
				<div className="home-title">
					<img alt="PaperPlane logo" src="assets/svg/paperplane_nobg.svg" />
					<h1>PAPERPLANE</h1>
				</div>
				<p>File uploading. URL Shortening. Protected views.</p>
				<div className="home-buttons">
					<Button external newWindow style="black" type="link" text="GitHub" url="https://ijskoud.dev/github/paperplane" />
					<Button style="black" type="link" text="Dashboard" url="/dashboard" />
				</div>
			</div>
		</main>
	);
};

export default Home;
