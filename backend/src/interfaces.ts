export interface IRoom {
    /**
     * The visible name of the room.
     */
    name: string,
    /**
     * The visible icon in frontend. Ensure, that the specified icon is implemented in frontend.
     */
    icon: string,

    /**
     * The number of devices. To be calculated automatically.
     */
    devicesCount?: number,

    /**
     * 
     */
    devices: Map<string,IDevice>
}

export interface IDevice {
    /**
     * The visible name of the device.
     */
    name: string,

    /**
     * The state of the switch. Is the device turned on or off?
     */
    switch: boolean,

    /**
     * The visible icon in frontend. Ensure, that the specified icon is implemented in frontend.
     */
    icon: string,

    /**
     * The related data point for the switch-state in iobroker.
     */
    datapoint?: string

    /**
     * All controls belonging to this device.
     */
    controls?: Map<string,IControl>;
}

export interface IControl {
    /**
     * The visible name of the control
     */
    name: string,

    /**
     * The type of the component, which should be used in frontend.
     */
    type: string,

    /**
     * The related data point for this specific control in iobroker.
     */
    datapoint: string,

    /**
     * The value of this control.
     */
    value: number|string,

    /**
     * The minimum value.
     */
    min?: number,

    /**
     * The maximum value.
     */
    max?: number,

    /**
     * The granularity of the value scale.
     */
    step?: number,

    /**
     * The possible options in case of an option based component.
     */
    options?: Map<string,IOption>
}

export interface IOption {
    /**
     * The visible name of the option.
     */
    name: string,

    /**
     * The visible icon in frontend. Ensure, that the specified icon is implemented in frontend.
     */
    icon: string
}

export interface IDatapoint {
    /**
     * The id of the datapoint.
     */
    id: string

    /**
     * The identifier of the room.
     */
    roomKey: string,

    /**
     * The identifier of the device.
     */
    deviceKey: string,

    /**
     * The identifier of the control.
     */
    controlKey?: string,
}

export interface IUser {
    _id: string,
    username: string,
    roles: Array<string>
}