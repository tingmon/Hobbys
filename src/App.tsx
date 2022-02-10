// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ReactQueryDevtools } from "react-query/devtools";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isLoggedInState, IUserObject, Ranks } from "./atoms";
import { authService, dbService } from "./fbase";
import AppRouter from "./components/Router";

const GlobalStyle = createGlobalStyle`
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, menu, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
main, menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, main, menu, nav, section {
  display: block;
}
/* HTML5 hidden-attribute fix for newer browsers */
*[hidden] {
    display: none;
}
body {
  line-height: 1;
}
menu, ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
a{
  text-decoration: none;
  color:inherit;
}
html, body{
	padding: 0;
	margin: 0;
  }
  html{
	height: 100%;
  }
  body{
	min-height: 100%;
  }
  input[type="file"] {
    display: none;
}
`;

const Title = styled.h1`
	color: ${(props) => props.theme.textColor};
  };
`;

const Wrapper = styled.div`
	display: flex;
	height: 100vh;
	min-height: 100%;
	width: 100vw;
	justify-content: center;
	align-items: center;
	background-color: ${(props) => props.theme.bgColor};
	margin: 0 auto;
`;

const Container = styled.div`
	width: 450px;
	height: 100vh;
	min-height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 auto;
	background-color: ${(props) => props.theme.mainColor};
`;

function App() {
	const setIsLoggedIn = useSetRecoilState(isLoggedInState);
	const [init, setInit] = useState(false);
	const [userObject, setUserObject] = useState(null);
	// console.log(authService.currentUser);
	// console.log(isLoggedInState);

	const assignDisplayName = async () => {
		const user = authService.currentUser;
		console.log("maybe problem ", user?.displayName);
		const noDNUser = await dbService
			.collection("UserInfo")
			.where("uid", "==", user?.uid)
			.get();

		const newDisplayName = noDNUser.docs[0].data().userName;
		console.log(newDisplayName);
		await user?.updateProfile({
			displayName: newDisplayName,
		});
		console.log("maybe problem ", user?.displayName);
		refreshUser();
	};

	useEffect(() => {
		authService.onAuthStateChanged((user) => {
			console.log(user);
			if (user) {
				// setIsLoggedIn(true);
				console.log(user.displayName);
				setUserObject({
					displayName: user.displayName,
					uid: user.uid,
					photoURL: user.photoURL,
					updateProfile: (args: any) => {
						user.updateProfile(args);
					},
				});
				console.log(userObject);
				setIsLoggedIn(true);
				assignDisplayName();
			} else {
				setUserObject(null);
				setIsLoggedIn(false);
			}
			// else{
			//   setIsLoggedIn(false);
			// }
			setInit(true);
		});
	}, []);

	const refreshUser = () => {
		console.log("refreshing");
		const user = authService.currentUser; // too big object for noticing subtle change.
		console.log(user?.displayName);
		setUserObject({
			displayName: user.displayName,
			uid: user.uid,
			photoURL: user.photoURL,
			updateProfile: (args: any) => user.updateProfile(args),
		});
	};

	console.log(userObject);

	return (
		<>
			<GlobalStyle></GlobalStyle>
			<Wrapper>
				<Container>
					{init ? (
						<AppRouter
							userObject={userObject}
							refreshUser={refreshUser}
						></AppRouter>
					) : (
						"Please Wait..."
					)}
				</Container>
			</Wrapper>
			<ReactQueryDevtools initialIsOpen={true}></ReactQueryDevtools>
		</>
	);
}

export default App;
