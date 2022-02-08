// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { useHistory } from "react-router-dom";
import { authService } from "../fbase";

function Home({ userObject }) {
	const history = useHistory();
	const onLogOutClick = () => {
		authService.signOut();
		history.push("/");
	};
	return (
		<div>
			<h1>Welcome {userObject?.displayName}</h1>
			<button onClick={onLogOutClick}>Log out</button>
		</div>
	);
}

export default Home;
