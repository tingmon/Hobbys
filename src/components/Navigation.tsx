// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import {
	faUser,
	faSearch,
	faHeart,
	faHome,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { Link } from "react-router-dom";

const NavContainer = styled.nav`
	display: flex;
	justify-content: center;
	position: fixed; /* Set the navbar to fixed position */
	bottom: 0px; /* Position the navbar at the bottom of the page */
	width: 100%; /* Full width */
	max-width: 450px;
`;

const NavList = styled.ul`
	display: flex;
	width: 100%;
	justify-content: space-around;
	background-color: ${(props) => props.theme.secondColor};
`;

const NavItem = styled.li`
	font-size: 15px;
	margin: 10px;
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
	return (
		<NavContainer>
			<NavList>
				<NavItem>
					<Link to="/">
						<FontAwesomeIcon icon={faHome} color={"#04AAFF"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/search">
						<FontAwesomeIcon icon={faSearch} color={"#04AAFF"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/like">
						<FontAwesomeIcon icon={faHeart} color={"#04AAFF"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to={`/profile/${userObject?.uid}`}>
						<FontAwesomeIcon icon={faUser} color={"#04AAFF"} size="2x" />
					</Link>
				</NavItem>
			</NavList>
		</NavContainer>
	);
};

export default Navigation;
