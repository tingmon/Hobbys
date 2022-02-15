// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { isLoggedInState, photoURLAtom, uidAtom } from "../atoms";
import Navigation from "./Navigation";
import Header from "./Header";
import Home from "../routes/Home";
import Profile from "../routes/Profile";
import Search from "../routes/Search";
import Like from "../routes/Like";
import AddPosting from "../routes/AddPosting";
import Message from "../routes/Message";
import Posting from "../routes/Posting";
import Auth from "../routes/Auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cart from "../routes/Cart";
import AddPostingDetail from "../routes/AddPostingDetail";

function AppRouter({ userObject, refreshUser }) {
	const isLoggedIn = useRecoilValue(isLoggedInState);
	const [uid, setUidAtom] = useRecoilState(uidAtom);

	return (
		<Router>
			<Header userObject={userObject} />
			<Navigation userObject={userObject} />
			<Switch>
				{isLoggedIn ? (
					<>
						<Route exact path="/">
							<Home userObject={userObject} />
						</Route>
						<Route path={`/profile/${userObject?.uid}`}>
							<Profile userObject={userObject} refreshUser={refreshUser} />
						</Route>
						<Route exact path="/search">
							<Search />
						</Route>
						<Route exact path="/like">
							<Like />
						</Route>
						<Route exact path="/addposting">
							<AddPosting userObject={userObject} refreshUser={refreshUser} />
						</Route>
						<Route path={`/addposting/${uid}`}>
							<AddPostingDetail />
						</Route>
						<Route exact path="/message">
							<Message />
						</Route>
						<Route exact path="/cart">
							<Cart />
						</Route>
					</>
				) : (
					<Route exact path="/">
						<Auth />
					</Route>
				)}
			</Switch>
		</Router>
	);
}

export default AppRouter;
