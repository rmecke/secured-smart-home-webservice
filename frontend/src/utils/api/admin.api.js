import axios from "./axios";
import { authHeader, refreshAPI } from "./auth.api";

export const getUsersApi = () => {
  return axios.get("/api/admin/users",{ headers: authHeader() })
  .catch(async function (error) {
    if (error.response.status === 401) {
      let data = await refreshAPI();
      if (!data.accessToken) {
        throw(error);
      } else {
        return getUsersApi();
      }
    } else {
      throw(error);
    }
  });
};

export const toggleRoleSwitchApi = async payload => {
  let responseFurther;

  await axios.patch(`/api/admin/users/switch`,
    {
      user: payload
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
        user: payload
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
        return await toggleRoleSwitchApi(payload);
      }
    } else {
      throw(error);
    }
  });
  
  return new Promise((resolve, reject) => resolve(responseFurther));
};

export const deleteUserApi = async payload => {
  let responseFurther;

  await axios.post(`/api/admin/users/delete`,
    {
      userId: payload.userId
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
        userId: payload.userId
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
        return await deleteUserApi(payload);
      }
    } else {
      throw(error);
    }
  });
  
  return new Promise((resolve, reject) => resolve(responseFurther));
};