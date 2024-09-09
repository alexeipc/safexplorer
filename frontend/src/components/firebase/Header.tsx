import { CSSProperties, Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Button } from '../Button';
import 'typeface-jura';
import { User as UserAPI } from '../../api/User';


interface HeaderProps {
    message: string;
    closeHeader(): void
}

interface HeaderState {
    authStatus: string;
    response: string;
    isLoading: boolean;
    email: string;
    displayLoginModal: boolean;
    displaySignUpModal: boolean;
    loginEmail?: string;
    loginPassword?: string;
    signupFullName?: string;
    signupEmail?: string;
    signupPassword?: string;
    signupConfirmPassword?: string;
}

export default class Header extends Component<HeaderProps, HeaderState> {
    backendUrl: string;
    userAPIinteraction: UserAPI;

    constructor (props: HeaderProps) {
        super(props);
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        this.userAPIinteraction = new UserAPI();

        this.sendRequest = this.sendRequest.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.displayLoginModal = this.displayLoginModal.bind(this);
        this.displaySignupModal = this.displaySignupModal.bind(this);
        this.signUp = this.signUp.bind(this);

        if (! firebase.apps.length) {
            const firebaseConfig = {
                apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
                projectId: process.env.REACT_APP_FIREBASE_PROJ_ID,
                storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.REACT_APP_FIREBASE_MESSANGING_SENDER_ID,
                appId: process.env.REACT_APP_FIREBASE_APP_ID,
                measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID
            };
            console.log(firebaseConfig);
            firebase.initializeApp(firebaseConfig);
        }

        // Initialize state
        this.state = {
            authStatus: "Not Authenticated",
            response: "No Data yet",
            isLoading: false,
            email: "",
            displayLoginModal: false,
            displaySignUpModal: false,
        };

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({ 
                    authStatus: "Authenticated",
                    email: user?.email ?? "Not available"
                });
            } else {
                this.setState({ authStatus: "Not Authenticated" });
            }
        });

        

    }
    async sendRequest() {
        const user = firebase.auth().currentUser;

        if (user) {
            try {   
                this.setState({authStatus: "Authenticated"})
                const idToken = await user.getIdToken(true);
                const res = await fetch(`${this.backendUrl}user`, {
                    method: 'GET',
                    headers: {
                        'AuthToken': idToken
                    }
                });
                this.setState( {response: await res.text() });
            } catch (error) {
                console.error(error);
                this.setState( {response: "Error: " + error });
            }
        } else {
            try {
                const res = await fetch(`${this.backendUrl}user`, {
                    method: 'GET'
                });
                this.setState( {response: await res.text() });
            } catch (error) {
                console.error(error);
                this.setState( {response: "Error with not-currently-sign-in: " + error });
            }
        }
    }

    async signIn() {
        try {
            let email = this.state.loginEmail ?? "";
            let password = this.state.loginPassword ?? "";
            //await firebase.auth().signInWithEmailAndPassword("star.phamhomanhtu@gmail.com", "manhtu123");
            this.setState( {isLoading: true} );
            await firebase.auth().signInWithEmailAndPassword(email, password);
            this.setState( {authStatus: "Authenticated" });
            this.props.closeHeader();
        } catch(error) {
            console.error(error);
            this.setState( {response: "Error: " + error });
        }
    }

    async signUp() {
        try {
            let fullName = this.state.signupFullName ?? "";
            let email = this.state.signupEmail ?? "";
            let password = this.state.signupPassword ?? "";
            let confirmPassword = this.state.signupConfirmPassword ?? "";

            if (password != confirmPassword) {
                alert("Confirm password doesn't match")
                return;
            }

            console.log(fullName, email, password, confirmPassword);
            this.setState( {isLoading: true} );
            await this.userAPIinteraction.signUp(fullName, email, password);
            this.props.closeHeader();

        } catch (error) {

        }
    }

    async signOut() {
        try {
            firebase.auth().signOut();
            this.setState({
                authStatus: "Not Authenticated",
                response: "No Data yet",
                email: ""
            })
        } catch (error) {
            console.error(error);
            this.setState( {response: "Error: " + error });
        }
    }
    displayLoginModal() {
        this.setState({
            displayLoginModal: true,
            displaySignUpModal: false
        });
    }

    displaySignupModal() {
        this.setState({
            displayLoginModal: false,
            displaySignUpModal: true
        });
    }

    containerStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10010,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }

    userModalStyle: CSSProperties = {
        width: 300,
        backgroundColor: "white",
        position: "absolute",
        top: 0,
        right: 0,
        margin: 10,
        borderRadius: 10,
        boxShadow: "rgba(0, 0, 0, 0.2) 8px 8px 24px"
    }

    unknowUserImageStyle : CSSProperties = {
        width: 47.5,
        height: 47.5,
        zIndex: 1000,
        borderRadius:"50%",
        margin: 10,
        cursor: "pointer"
    }

    loginModalStyle: CSSProperties = {
        borderRadius: 10,
        backgroundColor: "white",
        width: "40%",
        minWidth: 400,
        maxWidth: 500,
        alignItems: "center",
        position: "absolute",
        paddingBottom: 18.720
    }

    inputStyle: CSSProperties = {
        margin: 10,
        border: "solid 1px gray",
        background: "none",
        zIndex: 1000,
        borderRadius: 10,
        height: 30,
        fontSize: 15,
        padding: 10,
        width: "calc(100% - 80px)"
    };

    render() {
        return (
            <div style={{
                    ...this.containerStyle, 
                    backgroundColor:  (this.state && (this.state.displayLoginModal || this.state.displaySignUpModal) ) ? "rgba(0, 0, 0, 0.3)" : "transparent"
                }} onClick={() => this.props.closeHeader()}>
                { ! this.state.displayLoginModal && ! this.state.displaySignUpModal &&
                <div style={this.userModalStyle} onClick={(event) => event.stopPropagation()}>
                    <img style={this.unknowUserImageStyle} src="img/unknown_user.jpg" />
                    <p>{ this.state.email }</p>
                    <p> {this.state.response} </p>
                    {this.state.authStatus != "Authenticated"  && <Button text='Sign In' onclick={this.displayLoginModal} width="calc(100% - 10px)" height={25} color='white' backgroundColor='black'></Button>}
                    <Button text='Send Request' onclick={this.sendRequest} width="calc(100% - 10px)" height={25} color='white' backgroundColor='black'></Button>
                    {this.state.authStatus == "Authenticated" && <Button text='Sign Out' onclick={this.signOut} width="calc(100% - 10px)" height={25} color='white' backgroundColor='black'></Button>}
                </div> }
                {this.state.displayLoginModal && !this.state.displaySignUpModal && 
                <div style={this.loginModalStyle} onClick={(event) => event.stopPropagation()}>
                    <h3 style={{ fontFamily: 'Jura, sans-serif'}}>Login</h3>
                    <div>
                        <input style={this.inputStyle} placeholder='Email' onChange={(event) => this.setState({loginEmail: event.target.value})} />
                    </div>
                    <div>
                        <input type='password' style={this.inputStyle} placeholder='Password' onChange={(event) => this.setState({loginPassword: event.target.value})} />
                    </div>
                    <p>
                        Haven't had an account?&nbsp;
                        <b style={{color: "#9747FF", cursor: "pointer"}} onClick={this.displaySignupModal}>
                            Create one 
                        </b>
                    </p>
                    <div>
                        <Button text='Login' fontAwesomeIcon={this.state.isLoading ? 'fa-solid fa-spinner' : ''} color='white' backgroundColor='black' onclick={this.signIn}></Button>
                    </div>
                </div>
                }
                {! this.state.displayLoginModal && this.state.displaySignUpModal &&
                <div style={this.loginModalStyle} onClick={(event) => event.stopPropagation()}>
                    <h3 style={{ fontFamily: 'Jura, sans-serif'}}>Sign up</h3>
                    <div>
                        <input style={this.inputStyle} placeholder='Full name' onChange={(event) => this.setState({signupFullName: event.target.value})} />
                    </div>
                    <div>
                        <input style={this.inputStyle} placeholder='Email' onChange={(event) => this.setState({signupEmail: event.target.value})} />
                    </div>
                    <div>
                        <input type="password" style={this.inputStyle} placeholder='Password' onChange={(event) => this.setState({signupPassword: event.target.value})} />
                    </div>
                    <div>
                        <input type="password" style={this.inputStyle} placeholder='Confirm Password' onChange={(event) => this.setState({signupConfirmPassword: event.target.value})} />
                    </div>
                    <p>
                        Already had an account?&nbsp;
                        <b style={{color: "#9747FF", cursor: "pointer"}} onClick={this.displayLoginModal}>
                            Login
                        </b>
                    </p>
                    <div>
                        <Button text='Sign Up' fontAwesomeIcon={this.state.isLoading ? 'fa-solid fa-spinner' : ''} color='white' onclick={this.signUp} backgroundColor='black'></Button>
                    </div>
                </div>
                }
            </div>
        );
    }
}