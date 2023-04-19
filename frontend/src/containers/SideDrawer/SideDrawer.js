import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavLink } from 'react-router-dom';
import { connect } from "react-redux";
import Navigation from "../../components/Layout/Navigation/Navigation";
import NavigationItem from "../../components/Layout/Navigation/NavigationItem/NavigationItem";
import { toggleSideDrawer } from "./../../store/ui/ui.actions";
import Button from "../../components/UI/Button/Button";

import classes from "./SideDrawer.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import Backdrop from "../../components/UI/Backdrop/Backdrop";

import {
  logout
} from "./../../store/auth/auth.actions";

export class SideDrawer extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    logout: PropTypes.func
  };

  onLogoutClickHandler = () => {
    console.log(this.props);
    this.props.logout();
  };

  render() {
    const sideDrawerContainerClasses = [classes.SideDrawerContainer];

    if (this.props.isOpen) {
      sideDrawerContainerClasses.push(classes.Open);
    }

    let userManagement;
    if (this.props.auth && this.props.auth.isLoggedIn && this.props.auth.user && this.props.auth.user.roles.includes("ROLE_ADMIN")) {
      userManagement = <>
        <NavigationItem>
          <NavLink to="/users">Nutzer</NavLink>
        </NavigationItem>
      </>
    }

    let authActions = null;
    if (this.props.auth && this.props.auth.isLoggedIn && this.props.auth.user) {
      authActions = <>
        <NavigationItem>
          <NavLink to="/">Räume</NavLink>
        </NavigationItem>
        {userManagement}
        <NavigationItem>
          <NavLink to="/users">Nutzer</NavLink>
        </NavigationItem>
        <NavigationItem>
            <NavLink to="" onClick={this.onLogoutClickHandler}>Logout</NavLink>
        </NavigationItem>
      </>
    } else {
      authActions = <>
        <NavigationItem>
          <NavLink to="/login">Login</NavLink>
        </NavigationItem>
        <NavigationItem>
            <NavLink to="/register">Register</NavLink>
        </NavigationItem>
      </>
      
    }

    return (
      <div className={sideDrawerContainerClasses.join(" ")}>
        <Backdrop show={this.props.isOpen} onClick={this.props.toggleSideDrawer} />
        <Button className={classes.CloseDrawerBtn} onClick={this.props.toggleSideDrawer}>
          <FontAwesomeIcon icon={faWindowClose} />
        </Button>
        <div className={classes.SideDrawer}>
          <div className={classes.Title}>Menu</div>
          <Navigation>
              {authActions}
            </Navigation>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isOpen: state.ui.openSideDrawer,
  auth: state.auth
});

const mapDispatchToProps = {
  toggleSideDrawer,
  logout
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideDrawer);
