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
    console.log(this.props);
    this.props.logout();
  };

  render() {
    return (
      <header className={classes.Header}>
        <div className={classes.HeaderContainer}>
          <div className={classes.AppName}>Secured Smart Home</div>
          <div className={classes.Navigation}>
            <Navigation>
              <NavigationItem>
                <NavLink to="/">Rooms</NavLink>
              </NavigationItem>
              <NavigationItem>
                <a
                  href= "#"
                  onClick={this.onLogoutClickHandler}
                >
                  Logout
                </a>
              </NavigationItem>
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

const mapDispatchToProps = {
  toggleSideDrawer,
  logout
};

export default connect(
  null,
  mapDispatchToProps
)(Header);
