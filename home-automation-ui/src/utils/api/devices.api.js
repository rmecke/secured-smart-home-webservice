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
    console.log(response);
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

  console.log(responseFurther);

  
  
  return new Promise((resolve, reject) => resolve(responseFurther));
};

export const updateDeviceControlValueApi = payload => {
  // This would be a PATCH request for an actual server
  const response = {
    data: {
      control: payload
    }
  };
  return new Promise((resolve, reject) => resolve(response));
};
