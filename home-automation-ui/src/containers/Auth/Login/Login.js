import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Room from "../../../components/Rooms/Room";
import {
  login
} from "./../../../store/auth/auth.actions";
import classes from "./Login.module.scss";
import LoginBox from "../../../components/Auth/LoginBox";

export class RoomsDashboard extends Component {
  static propTypes = {
    login: PropTypes.func
  };

  componentDidMount() {
    
  }

  onLoginClickHandler = (username, password) => {
    this.props.login(username,password)
      .then(() => {
        console.log("test")
        this.props.history.push("/");
        window.location.reload();
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
)(RoomsDashboard);
