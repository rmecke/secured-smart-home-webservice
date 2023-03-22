import React from "react";
import { shallow } from "enzyme";
import BuzzerControl from "./BuzzerControl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

describe("<BuzzerControl />", () => {
  const buzzerControlDummyProps = {
    controlId: "3368059519",
    name: "Intensity",
    type: "buzzer",
  };

  it("renders without crashing", () => {
    const wrapper = shallow(<BuzzerControl />);
    expect(wrapper).toBeTruthy();
  });

  it("should call onUpdateValue when the button is clicked", () => {
    const onUpdateValue = jest.fn();
    const wrapper = shallow(
      <BuzzerControl {...buzzerControlDummyProps} onUpdateValue={onUpdateValue} />
    );

    // Clicked the first option
    wrapper
      .find("Button")
      .first()
      .simulate("click",{});

    expect(onUpdateValue).toHaveBeenCalledWith(
      buzzerControlDummyProps.controlId,
      true
    );
  });
});
