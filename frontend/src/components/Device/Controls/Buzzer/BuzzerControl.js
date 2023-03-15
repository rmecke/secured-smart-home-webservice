import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "../../../UI/Button/Button";
import classes from "./BuzzerControl.module.scss";

export default class BuzzerControl extends Component {
  static propTypes = {
    controlId: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.bool,
    onUpdateValue: PropTypes.func,
    options: PropTypes.object
  };

  onClickHandler = event => {
    const updatedValue = true;
    this.props.onUpdateValue(this.props.controlId, updatedValue);
  };

  render() {
      return (
        <Button 
          className={classes.Button}
          onClick={this.onClickHandler}>
          Aktion ausführen
        </Button>
      );
  }
}
