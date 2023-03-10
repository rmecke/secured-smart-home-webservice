import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import {showErrorModal } from "../../store/ui/ui.actions";

export class Guard extends Component {
  static propTypes = {
    auth: PropTypes.object
  };

  render() {
    // Check if user has access
    let content;
    console.log(this.props.auth);

    if (/*this.props.auth && this.props.auth.isLoggedIn && this.props.auth.user*/ true) {
      content = this.props.children;
    } else {
      content = <Redirect to="/login"></Redirect>
      const errorResponse = {
        message: "No permissions"
      };
      this.props.showErrorModal(errorResponse);
    }

    return (
        <div>{content}</div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = {
  showErrorModal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Guard);
