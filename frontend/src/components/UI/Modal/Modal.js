import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Button from "../Button/Button";
import Backdrop from "../Backdrop/Backdrop";

import classes from "./Modal.module.scss";

function Modal(props) {
  let modalClasses = [classes.Modal];
  if (props.show) {
    modalClasses.push(classes.Show);
  }

  let applyButton;
  if (props.onApplyModal) {
    applyButton = (<Button className={classes.Btn} onClick={props.onApplyModal}>Bestätigen</Button>);
  }

  return (
    <Fragment>
      <Backdrop show={props.show} onClick={props.onCloseModal} />
      <div data-test="modal-body" className={modalClasses.join(" ")}>
        <div>{props.children}</div>
        <div className={classes.BtnContainer}>
          {applyButton}
          <Button className={classes.Btn} onClick={props.onCloseModal}>Schließen</Button>
        </div>
      </div>
    </Fragment>
  );
}

Modal.propTypes = {
  show: PropTypes.bool,
  onCloseModal: PropTypes.func,
  onApplyModal: PropTypes.func
};

export default Modal;
