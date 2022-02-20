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
		postingBgColor: string;

		cursorActive: string;
		cursorNotActive: string;
	}
}
