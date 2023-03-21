import axios from "./axios";
import { authHeader } from "./auth.api";

export const getRoomDevicesApi = roomId => {
  return axios.get(`/api/home/rooms/${roomId}/devices`,{ headers: authHeader() })
  .catch(function (error) {
    throw(error);
  });
};

export const toggleDeviceSwitchApi = async payload => {
  let responseFurther;

  await axios.patch(`/api/home/rooms/switch`,
    {
      device: payload
    },
    {
      headers: {
        ...authHeader(),
        'Content-type': 'application/json',
      } 
    }
  )
  .then(function (response) {
    // handle success
    responseFurther = {
      data: {
        device: payload
      }
    };
  })
  .catch(function (error) {
    throw(error);
  });
  
  return new Promise((resolve, reject) => resolve(responseFurther));
};

export const updateDeviceControlValueApi = async payload => {
  let responseFurther;

  await axios.patch(`/api/home/rooms/update`,
    {
      control: payload
    },
    {
      headers:{
        ...authHeader(),
        'Content-type': 'application/json',
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
    throw(error);
  });

  return new Promise((resolve, reject) => resolve(responseFurther));
};
