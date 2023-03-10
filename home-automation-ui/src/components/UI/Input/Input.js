import React from "react";
import PropTypes from "prop-types";

import classes from "./Input.module.scss";

function Input(props) {
  return (
    <input className={classes.Input + " " + props.className} placeholder={props.placeholder} type={props.type} onChange={props.onChange}/>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
};

export default Input;
