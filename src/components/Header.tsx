import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import {
	faShoppingCart,
	faPlusSquare,
	faStar,
	faTools,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { Link } from "react-router-dom";

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
	margin: 10px 5px 10px 5px;
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

const Logo = styled.img``;

const Hobbys = styled.h1`
	margin: 10px 2px 10px 5px;
	font-size: x-large;
	font-weight: bold;
`;

function Header() {
	return (
		<NavContainer>
			<LogoContainer>
				<FontAwesomeIcon icon={faTools} color={"#c0392b"} size="2x" />
				<Hobbys>Hobby's</Hobbys>
				<FontAwesomeIcon icon={faStar} color={"#c0392b"} size="2x" />
			</LogoContainer>
			<NavList>
				<NavItem>
					<Link to="/addposting">
						<FontAwesomeIcon icon={faPlusSquare} color={"#04AAFF"} size="2x" />
					</Link>
				</NavItem>
				<NavItem>
					<Link to="/message">
						<FontAwesomeIcon
							icon={faFacebookMessenger}
							color={"#04AAFF"}
							size="2x"
						/>
					</Link>
				</NavItem>
			</NavList>
		</NavContainer>
	);
}

export default Header;
