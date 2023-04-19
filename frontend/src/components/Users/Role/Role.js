import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classes from "./Role.module.scss";
import Switch from "./../../UI/Switch/Switch";

export default class Role extends Component {
  static propTypes = {
    roleId: PropTypes.string,
    name: PropTypes.string,
    assigned: PropTypes.bool,
    onToggleRoleSwitch: PropTypes.func
  };

  onSwitchHandler = () => {
    let newValue = !this.props.assigned;
    this.props.onToggleRoleSwitch(this.props.roleId,newValue);
  };

  render() {
    console.log(this.props.assigned);

    return (
      <div className={classes.Role}>
        <div className={classes.Header}>
          <div className={classes.Title}>{this.props.name}</div>
          <div className={classes.Switch}>
            <Switch
              onChange={this.onSwitchHandler}
              checked={this.props.assigned}
            />
          </div>
        </div>
      </div>
    );
  }  
}