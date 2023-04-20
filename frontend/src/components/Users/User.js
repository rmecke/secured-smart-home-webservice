import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Role from "./Role/Role";

import Button from "../UI/Button/Button";
import Modal from "../UI/Modal/Modal";

import classes from "./User.module.scss";
import Switch from "./../UI/Switch/Switch";

export default class User extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    icon: PropTypes.string,
    roles: PropTypes.array,
    onToggleRoleSwitch: PropTypes.func,
    onDelete: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  onToggleRoleSwitchHandler = (roleId, newValue) => {
    this.props.onToggleRoleSwitch(this.props.id,roleId, newValue);
  };

  openDeleteModal = () => {
    this.setState({
      showModal: true
    })
  }

  closeDeleteModal = () => {
    this.setState({
      showModal: false
    })
  }


  onDeleteHandler = () => {
    this.props.onDelete(this.props.id);
  }

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
      <>
        <Modal
          data-test="errors-modal"
          show={this.state.showModal}
          onApplyModal={this.onDeleteHandler}
          onCloseModal={this.closeDeleteModal}
        >
          Benutzer wirklich löschen?
        </Modal>

        <div className={classes.User}>
          <div className={classes.Header}>
            <div className={classes.Title}>{this.props.name}</div>
            <div className={classes.Button}>
              <Button 
                className={classes.Button}
                onClick={this.openDeleteModal}>
                Benutzer löschen
              </Button>
            </div>
          </div>
          <div>
            {roleSwitcher}
          </div>
        </div>
      </>
    );
  }  
}