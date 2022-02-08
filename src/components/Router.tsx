// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../atoms";
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

function AppRouter({ userObject, refreshUser }) {
	const isLoggedIn = useRecoilValue(isLoggedInState);
	console.log(isLoggedIn);
	return (
		<Router>
			<Header />
			<Navigation />
			<Switch>
				{isLoggedIn ? (
					<>
						<div>
							<Route exact path="/">
								<Home userObject={userObject} />
							</Route>
							<Route exact path="/profile">
								<Profile />
							</Route>
							<Route exact path="/search">
								<Search />
							</Route>
							<Route exact path="/like">
								<Like />
							</Route>
							<Route exact path="/addposting">
								<AddPosting />
							</Route>
							<Route exact path="/message">
								<Message />
							</Route>
							<Route exact path="/cart">
								<Cart />
							</Route>
						</div>
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
