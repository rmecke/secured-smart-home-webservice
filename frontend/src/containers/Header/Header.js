import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { toggleSideDrawer } from "./../../store/ui/ui.actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Button from "./../../components/UI/Button/Button";
import Navigation from "./../../components/Layout/Navigation/Navigation";
import NavigationItem from "./../../components/Layout/Navigation/NavigationItem/NavigationItem";

import classes from "./Header.module.scss";

import {
  logout
} from "./../../store/auth/auth.actions";

export class Header extends Component {
  static propTypes = {
    toggleSideDrawer: PropTypes.func,
    logout: PropTypes.func
  };

  onLogoutClickHandler = () => {
    this.props.logout();
  };

  render() {
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
      <header className={classes.Header}>
        <div className={classes.HeaderContainer}>
          <div className={classes.AppName}>Secured Smart Home</div>
          <div className={classes.Navigation}>
            <Navigation>
              {authActions}
            </Navigation>
          </div>
          <div className={classes.MenuBtn}>
            <Button onClick={this.props.toggleSideDrawer}>
              <FontAwesomeIcon icon={faBars} />
            </Button>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = {
  toggleSideDrawer,
  logout
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
