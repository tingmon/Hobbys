// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Item = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	margin-bottom: 10px;
	background-color: ${(props) => props.theme.postingBgColor};
`;

function AddressInfo() {
	return "AddressInfo";
}

export default AddressInfo;
