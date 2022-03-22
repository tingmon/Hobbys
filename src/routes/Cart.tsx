import styled from "styled-components";

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const ItemContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 200px);
	grid-auto-rows: 200px;
	z-index: 0;
`;

const Item = styled.div`
	border: 1px solid black;
	margin-bottom: 10px;
	max-width: 330px;
	max-hight: 200px;
	background-color: ${(props) => props.theme.postingBgColor};
`;

function Cart() {
	return (
		<Container>
			<ItemContainer></ItemContainer>
		</Container>
	);
}

export default Cart;
