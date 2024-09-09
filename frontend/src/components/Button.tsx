import { CSSProperties, Component } from "react";
import { MouseEventHandler } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';


const themeOptions: {[id: string]: CSSProperties; } = {}

themeOptions['default'] = {color: "white", backgroundColor: "#61DBFB", borderRadius: 10, width: 200, height: 50, border: 0};

interface ButtonProperties {
    text: string;
    theme?: string;
    width?: number | string;
    height?: number | string;
    color?: string;
    borderRadius?: number
    backgroundColor?: string;
    fontAwesomeIcon?: string;
    onclick?: MouseEventHandler<HTMLButtonElement>;
};

export class Button extends Component<ButtonProperties> {
    private theme: CSSProperties;

    constructor(props:ButtonProperties) {
        super(props);
        this.theme = {
            color: this.props.color ?? themeOptions["default"].color,
            backgroundColor: this.props.backgroundColor ?? themeOptions["default"].backgroundColor,
            borderRadius: this.props.borderRadius ?? themeOptions["default"].borderRadius,
            border: themeOptions["default"].border,
            cursor: "pointer",
            height: this.props.height ? this.props.height : themeOptions["default"].height,
            width: this.props.width ? this.props.width : themeOptions["default"].width,
            padding: "5px",
            margin: "5px"
        }
    };
    render() {
        return (
            <button onClick={this.props.onclick} style={this.theme}>
                    {this.props.text} &nbsp;
                    {this.props.fontAwesomeIcon && <i className={this.props.fontAwesomeIcon}></i>}
            </button>
        )
    }
}