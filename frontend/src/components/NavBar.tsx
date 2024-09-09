import { CSSProperties, Component, ReactNode } from "react";
import 'typeface-jura';

interface NavaBarProps {
    closeNavBar(): void
}

export class NavBar extends Component<NavaBarProps> {
    containerStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10010,
        backgroundColor: "rgba(0, 0, 0, 0.3)"
    }
    navigatorStyle: CSSProperties = {
        height: "100%",
        width: 300,
        backgroundColor: "white"

    }
    render(): ReactNode {
        return (
            <div style={this.containerStyle} onClick={() => this.props.closeNavBar()}>
                <div style={this.navigatorStyle} onClick={(event) => {
                    event.stopPropagation();
                }}>
                    <div style={{ fontFamily: 'Jura, sans-serif', fontSize: 30 }}>
                        SafeXplorer
                    </div>
                    <div style={{width: "calc(95% - 20px)", height: 1, backgroundColor: "grey", margin: 20}}></div>
                </div>
            </div>
        )
    }
}