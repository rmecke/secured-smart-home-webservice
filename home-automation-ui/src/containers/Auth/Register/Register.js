import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Room from "../../../components/Rooms/Room";
import {
  register
} from "../../../store/auth/auth.actions";
import classes from "./Register.module.scss";
import RegisterBox from "../../../components/Auth/RegisterBox/RegisterBox";

export class Register extends Component {
  static propTypes = {
    login: PropTypes.func
  };

  componentDidMount() {
    
  }

  onRegisterClickHandler = (username, password, password2) => {
    this.props.register(username,password,password2)
      .then(() => {
        this.props.history.push("/login");
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
          <RegisterBox
            onRegisterClick={this.onRegisterClickHandler}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = {
  register
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
