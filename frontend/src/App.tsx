import React, { CSSProperties, Component, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button } from "./components/Button";
import { Map } from "./components/Map";
import Header from "./components/firebase/Header";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


function App() {
  const [displayUserModal, setDisplayUserModal] = useState(false);

  const unknowUserImageStyle : CSSProperties = {
    position: "absolute",
    width: 47.5,
    height: 47.5,
    zIndex: 1000,
    borderRadius: 100,
    margin: 10,
    boxShadow: "rgba(0, 0, 0, 0.2) 0px 8px 24px",
    top: 0,
    right: 0,
    cursor: "pointer"
  }
  return (
    <div className="App">
      <div>
        <div onClick={() => setDisplayUserModal(true)}>
          <img style={unknowUserImageStyle} src="img/unknown_user.jpg" />
        </div>
        {displayUserModal && <Header closeHeader={() => {
          setDisplayUserModal(false);
        }} message ="passed header"/>}
      </div>
      <div>
        <Map center={[37.773972, -122.431297]} zoom={11} />
      </div>
    </div>
  );
}

export default App;
