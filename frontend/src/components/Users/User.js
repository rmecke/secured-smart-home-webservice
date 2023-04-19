import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Role from "./Role/Role";

import classes from "./User.module.scss";
import Switch from "./../UI/Switch/Switch";

export default class User extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    icon: PropTypes.string,
    roles: PropTypes.array,
    onToggleRoleSwitch: PropTypes.func,
  };

  onToggleRoleSwitchHandler = (roleId, newValue) => {
    this.props.onToggleRoleSwitch(this.props.id,roleId, newValue);
  };

  render() {
    let roleSwitcher;
    if (this.props.roles) {
      roleSwitcher = this.props.roles.map(
        role => {
          return (
            <div key={role._id} className={classes.RoleContainer}>
              <Role
                roleId={role._id}
                name={role.name}
                assigned={role.assigned}
                onToggleRoleSwitch={this.onToggleRoleSwitchHandler}
              />
            </div>
          );
        }
      );
    }


    return (
      <div className={classes.User}>
        <div className={classes.Header}>
          <div className={classes.Title}>{this.props.name}</div>
        </div>
        <div>
          {roleSwitcher}
        </div>
      </div>
    );
  }  
}