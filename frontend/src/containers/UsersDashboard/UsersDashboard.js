import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { 
  fetchUsers,
  toggleRoleSwitch,
  deleteUser
} from "../../store/users/users.actions";
import User from "../../components/Users/User";

import classes from "./UsersDashboard.module.scss";

export class UsersDashboard extends Component {
  static propTypes = {
    fetchUsers: PropTypes.func,
    users: PropTypes.array
  };

  componentDidMount() {
    if (this.props.fetchUsers) {
      this.props.fetchUsers();
    }
  }

  onToggleRoleSwitchHandler = (userId, roleId, newValue) => {
    this.props.toggleRoleSwitch({userId, roleId, newValue});
  };

  onDeleteHandler = (userId) => {
    this.props.deleteUser(userId);
  };

  render() {
    if (!this.props.users) return null;

    return (
      <div className={classes.Row}>
        {(this.props.users).map(userData => {
          return (
            <div
              data-test={`user-card-${userData._id}`}
              key={userData._id}
              className={classes.Column}
            >
              <User
                id={userData._id}
                name={userData.username}
                icon={userData.icon}
                roles={userData.roles}
                onToggleRoleSwitch={this.onToggleRoleSwitchHandler}
                onDelete={this.onDeleteHandler}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  users: state.users.users
});

const mapDispatchToProps = {
  fetchUsers,
  toggleRoleSwitch,
  deleteUser
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersDashboard);
