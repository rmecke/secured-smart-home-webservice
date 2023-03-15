import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  login
} from "./../../../store/auth/auth.actions";
import classes from "./Login.module.scss";
import LoginBox from "../../../components/Auth/LoginBox/LoginBox";

export class Login extends Component {
  static propTypes = {
    login: PropTypes.func
  };

  componentDidMount() {
    
  }

  onLoginClickHandler = (username, password) => {
    this.props.login(username,password)
      .then(() => {
        this.props.history.push("/");
      })
      .catch(() => {

      });
  };

  render() {
    return (
      <div className={classes.Row}>
       <div
          className={classes.Column}
        >
          <LoginBox
            onLoginClick={this.onLoginClickHandler}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = {
  login
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
