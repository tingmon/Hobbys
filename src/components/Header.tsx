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
	background-color: ${(props) => props.theme.mainColor};
	max-width: 450px;
	max-height:55px;
	z-index: 1;
	box-shadow: 0 4px 4px -4px #000;

`;

const NavList = styled.ul`
	display: flex;
	width: 100%;
	justify-content: flex-end;
	background-color: ${(props) => props.theme.mainColor};
`;

const NavItem = styled.li`
	font-size: 15px;
	margin: -3px 2px 0px 5px;
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
	font-family: 'Sniglet', cursive;
	margin: 0px 1px 3px 2px;
	font-size: 35px;
	font-weight: bold;
	text-shadow: 1px 1px 3px red;

	color: ${(props) => props.theme.logoColor};
`;

const ProfileImage = styled.img`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin-right: 5px;
	line-height: 50px;
	text-align: center;
	background-color: ${(props) => props.theme.textColor};
	box-shadow: 0px 0px 1px 1px #FFFFFF;
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
					<Hobbys>HOBBY's</Hobbys>
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
