// import original module declarations
import "styled-components";

// and extend them!
declare module "styled-components" {
	export interface DefaultTheme {
		bgColor: string;
		textColor: string;
		btnColor: string;
		formColor: string;
		mainColor: string;
		secondColor: string;
		logoColor: string;
		postingBgColor: string;
		displayNameColor: string;
		iconColor: string;

		cursorActive: string;
		cursorNotActive: string;
	}
}
