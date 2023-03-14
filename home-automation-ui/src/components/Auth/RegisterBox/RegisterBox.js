import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../UI/Button/Button";
import Input from "../../UI/Input/Input";

import classes from "./RegisterBox.module.scss";

export default class RegisterBox extends Component {
  static propTypes = {
    fetchRoomDevices: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      password2: "",
    };
  }

  onChangeUsername = event => {
    this.setState({
      username: event.target.value
    })
  }

  onChangePassword = event => {
    this.setState({
      password: event.target.value
    })
  }

  onChangePassword2 = event => {
    this.setState({
      password2: event.target.value
    })
  }


  onSubmitHandler = event => {
    event.preventDefault();

    this.props.onRegisterClick(this.state.username, this.state.password, this.state.password2);
  };

  render() {
    return (
      <form onSubmit={this.onSubmitHandler}>
        <div className={classes.LoginBox}>
          <div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <div className={classes.Title}>Account erstellen</div>
              </div>
            </div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <Input placeholder={"Benutzername"} type={"text"} onChange={this.onChangeUsername}></Input>
              </div>
            </div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <Input placeholder={"Passwort"} type={"password"} onChange={this.onChangePassword}></Input>
              </div>
            </div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <Input placeholder={"Passwort wiederholen"} type={"password"} onChange={this.onChangePassword2}></Input>
              </div>
            </div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <Button>Registrieren</Button>
              </div>
            </div>
            
          </div>
        </div>
      </form>
    );
  }
}

RegisterBox.propTypes = {

};

