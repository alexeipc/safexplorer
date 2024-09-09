import { Component } from "react";
import { SafetyScoreResponse } from "../api/SafetyScore";

interface SafetyScoreBoxProperty {
    safetyScore: SafetyScoreResponse;
}

export class SafetyScoreBox extends Component<SafetyScoreBoxProperty> {
    constructor(props: SafetyScoreBoxProperty) {
        super(props);
    }

    render() {
        return (<div>
            <b>Overall safety score: {this.props.safetyScore.overall}</b>
        </div>)
    }
}