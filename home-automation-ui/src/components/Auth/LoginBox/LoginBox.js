import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../UI/Button/Button";
import Input from "../../UI/Input/Input";

import classes from "./LoginBox.module.scss";

export default class LoginBox extends Component {
  static propTypes = {
    fetchRoomDevices: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
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

  onSubmitHandler = event => {
    event.preventDefault();

    this.props.onLoginClick(this.state.username, this.state.password);
  };

  render() {
    return (
      <form onSubmit={this.onSubmitHandler}>
        <div className={classes.LoginBox}>
          <div>
            <div className={classes.Row}>
              <div className={classes.Column}>
                <div className={classes.Title}>Login</div>
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
                <Button>Anmelden</Button>
              </div>
            </div>
            
          </div>
        </div>
      </form>
    );
  }
}

LoginBox.propTypes = {

};

