// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import {
	faShoppingCart,
	faUser,
	faSearch,
	faHeart,
	faPlusSquare,
	
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { selectedCommentAtom, selectedPostingAtom } from "../atoms";

const NavContainer = styled.nav`
	display: flex;
	justify-content: center;
	position: fixed; /* Set the navbar to fixed position */
	bottom: 0px; /* Position the navbar at the bottom of the page */
	width: 100%; /* Full width */
	max-width: 450px;
	z-index: 1;
`;

const NavList = styled.ul`
	display: flex;
	width: 100%;
	justify-content: space-around;
	background-color: ${(props) => props.theme.secondColor};
`;

const NavItem = styled.li`
	font-size: 15px;
	margin: 0px 2px 0px 5px;
	a {
		padding: 10px;
		transition: color 0.2s ease-in;
		display: block;
	}
	&:hover {
		a {
			color: ${(props) => props.theme.mainColor};
		}
	}
`;

const Navigation = ({ userObject }) => {
	const setSelectedPosting = useSetRecoilState(selectedPostingAtom);
	const setSelectedComment = useSetRecoilState(selectedCommentAtom);
	const MyProfileClicked = () => {
		setSelectedPosting(null);
		setSelectedComment(null);
		console.log("nav work");
	};
	return (
		<NavContainer>
			<NavList>
				<NavItem>
					<Link to="/search">
						<FontAwesomeIcon icon={faSearch} color={"#E8EBED"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/likelist">
						<FontAwesomeIcon icon={faHeart} color={"#E8EBED"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/cart">
						<FontAwesomeIcon
							icon={faShoppingCart}
							color={"#E8EBED"}
							size="2x"
						/>
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/addposting">
						<FontAwesomeIcon icon={faPlusSquare} color={"#E8EBED"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/message">
						<FontAwesomeIcon
							icon={faFacebookMessenger}
							color={"#E8EBED"}
							size="2x"
						/>
					</Link>
				</NavItem>
				<NavItem>
					<Link
						to={`/${userObject?.uid}/profile`}
						onClick={() => MyProfileClicked()}
					>
						<FontAwesomeIcon icon={faUser} color={"#E8EBED"} size="2x" />
					</Link>
				</NavItem>
			</NavList>
		</NavContainer>
	);
};

export default Navigation;
