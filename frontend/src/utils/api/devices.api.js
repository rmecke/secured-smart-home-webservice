import axios from "./axios";
import { authHeader, refreshAPI } from "./auth.api";

export const getRoomDevicesApi = roomId => {
  return axios.get(`/api/home/rooms/${roomId}/devices`,{ headers: authHeader() })
  .catch(async function (error) {
    if (error.response.status === 401) {
      let data = await refreshAPI();
      console.log("data.accessToken: " +data.accessToken);
      if (!data.accessToken) {
        throw(error);
      } else {
        return getRoomDevicesApi(roomId);
      }
    } else {
      throw(error);
    }
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
  .catch(async function (error) {
    if (error.response.status === 401) {
      let data = await refreshAPI();
      console.log("data.accessToken: " +data.accessToken);
      if (!data.accessToken) {
        throw(error);
      } else {
        return await toggleDeviceSwitchApi(payload);
      }
    } else {
      throw(error);
    }
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
  .catch(async function (error) {
    if (error.response.status === 401) {
      let data = await refreshAPI();
      console.log("data.accessToken: " +data.accessToken);
      if (!data.accessToken) {
        throw(error);
      } else {
        return await updateDeviceControlValueApi(payload);
      }
    } else {
      throw(error);
    }
  });

  return new Promise((resolve, reject) => resolve(responseFurther));
};
