import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
	selectedCommentAtom,
	selectedPostingAtom,
	uidAtom,
	userObjectAtom,
} from "../atoms";

const NavContainer = styled.nav`
	display: flex;
	justify-content: center;
	overflow: hidden;
	position: fixed; /* Set the navbar to fixed position */
	top: 0; /* Position the navbar at the top of the page */
	width: 100%; /* Full width */
	background-color: ${(props) => props.theme.secondColor};
	max-width: 450px;
	z-index: 1;
`;

const NavList = styled.ul`
	display: flex;
	width: 100%;
	justify-content: flex-end;
	background-color: ${(props) => props.theme.secondColor};
`;

const NavItem = styled.li`
	font-size: 15px;
	margin: 0px 2px 0px 5px;
	a {
		padding: 10px 5px 10px 5px;
		transition: color 0.2s ease-in;
		display: block;
	}
	&:hover {
		a {
			color: ${(props) => props.theme.mainColor};
		}
	}
`;
const LogoContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 15px;
`;

//const Logo = styled.img``;

const Hobbys = styled.h1`
	font-family: "M PLUS Rounded 1c", sans-serif;
	margin: 0px 1px 3px 2px;
	font-size: 25px;
	font-weight: bold;
	text-shadow: 1.5px 1.5px #ffffff;
	color: #f6b324;
`;

const ProfileImage = styled.img`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	border: 2px solid #ffffff;
	margin-right: 5px;
	line-height: 60px;
	text-align: center;
	background-color: ${(props) => props.theme.textColor};
`;
//<FontAwesomeIcon icon={faTools} color={"#F9C963"} size="1x" />

function Header() {
	const uid = useRecoilValue(uidAtom);
	const userObject = useRecoilValue(userObjectAtom);
	const setSelectedPosting = useSetRecoilState(selectedPostingAtom);
	const setSelectedComment = useSetRecoilState(selectedCommentAtom);

	const MyProfileClicked = () => {
		setSelectedPosting(null);
		setSelectedComment(null);
		console.log("nav work");
	};

	console.log(userObject);

	return (
		<NavContainer>
			<LogoContainer>
				<Link to="/">
					<Hobbys>HOBBY'S</Hobbys>
				</Link>
			</LogoContainer>
			<NavList>
				{userObject ? (
					<>
						{userObject?.photoURL !== null ? (
							<NavItem>
								<Link to={`/${uid}/profile`} onClick={() => MyProfileClicked()}>
									<ProfileImage src={userObject?.photoURL} alt="No Img" />
									{/* <FontAwesomeIcon icon={faUser} color={"#E8EBED"} size="2x" /> */}
								</Link>
							</NavItem>
						) : (
							<NavItem>
								<Link to={`/${uid}/profile`} onClick={() => MyProfileClicked()}>
									<FontAwesomeIcon icon={faUser} color={"#E8EBED"} size="2x" />
								</Link>
							</NavItem>
						)}
					</>
				) : (
					<NavItem>
						<Link to={`/${uid}/profile`} onClick={() => MyProfileClicked()}>
							<FontAwesomeIcon icon={faUser} color={"#E8EBED"} size="2x" />
						</Link>
					</NavItem>
				)}
			</NavList>
		</NavContainer>
	);
}

export default Header;
