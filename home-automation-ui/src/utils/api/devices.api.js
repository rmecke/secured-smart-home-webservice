import axios from "./axios";

export const getRoomDevicesApi = roomId => {
  return axios.get(`/rooms/${roomId}/devices`);
};

export const toggleDeviceSwitchApi = async deviceId => {
  let responseFurther;

  await axios.patch(`/switch`,
    {
      deviceId
    },
    {
      headers:{
        'Content-type': 'application/json'
      }
    }
  )
  .then(function (response) {
    // handle success
    responseFurther = {
      data: {
        deviceId
      }
    };
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
  
  return new Promise((resolve, reject) => resolve(responseFurther));
};

export const updateDeviceControlValueApi = async payload => {
  let responseFurther;

  await axios.patch(`/update`,
    {
      control: payload
    },
    {
      headers:{
        'Content-type': 'application/json'
      }
    }
  )
  .then(function (response) {
    // handle success
    responseFurther = {
      data: {
        control: payload
      }
    };
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

  return new Promise((resolve, reject) => resolve(responseFurther));
};
