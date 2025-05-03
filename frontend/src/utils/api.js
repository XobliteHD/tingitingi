// src/utils/api.js

const getAuthToken = () => {
  const adminUserInfo = localStorage.getItem("adminUserInfo");
  if (adminUserInfo) {
    try {
      const parsedInfo = JSON.parse(adminUserInfo);
      return parsedInfo?.token;
    } catch (e) {
      console.error("Error parsing admin user info from localStorage", e);
      localStorage.removeItem("adminUserInfo");
      return null;
    }
  }
  return null;
};

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || "http://192.168.1.38:5000/api";
};

const apiCall = async (
  endpoint,
  method = "GET",
  body = null,
  isFormData = false,
  requiresAuth = true
) => {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const token = requiresAuth ? getAuthToken() : null;

  const headers = {};

  if (!isFormData && body) {
    headers["Content-Type"] = "application/json";
  }
  if (requiresAuth) {
    if (!token) {
      console.error("API call requires auth but no token found.");
      throw new Error("Authentication required.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method: method.toUpperCase(),
    headers: headers,
  };

  if (
    body &&
    method.toUpperCase() !== "GET" &&
    method.toUpperCase() !== "HEAD"
  ) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
      if (!response.ok) {
        throw new Error(responseData || `HTTP error ${response.status}`);
      }
      return responseData || null;
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminUserInfo");
        throw new Error("Unauthorized");
      }
      throw new Error(responseData.message || `HTTP error ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error(`API call failed: ${method} ${endpoint}`, error);
    throw error;
  }
};

export const fetchAdminBookings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.sortBy) query.append("sortBy", params.sortBy);

  const queryString = query.toString();
  const endpoint = `/admin/bookings${queryString ? `?${queryString}` : ""}`;

  console.log("Fetching admin bookings with endpoint:", endpoint);
  return apiCall(endpoint, "GET", null, false, true);
};

export const deleteAdminHouse = (houseId) => {
  return apiCall(`/admin/houses/${houseId}`, "DELETE", null, false, true);
};

export const createAdminHouse = (formData) => {
  return apiCall("/admin/houses", "POST", formData, true, true);
};

export const updateAdminHouse = (houseId, formData) => {
  return apiCall(`/admin/houses/${houseId}`, "PUT", formData, true, true);
};

export const fetchPublicHouses = () => {
  return apiCall("/houses", "GET", null, false, false);
};
export const fetchPublicHouseDetails = (houseId) => {
  return apiCall(`/houses/${houseId}`, "GET", null, false, false);
};
export const fetchPublicHouseBookedDates = (houseId) => {
  return apiCall(`/houses/${houseId}/booked-dates`, "GET", null, false, false);
};

export const submitBooking = (bookingData) => {
  return apiCall("/bookings", "POST", bookingData, false, false);
};

export const fetchAdminHouseDetails = (houseId) => {
  return apiCall(`/admin/houses/${houseId}`, "GET", null, false, true);
};

export const fetchAdminOthers = () => {
  return apiCall("/admin/others", "GET", null, false, true);
};
export const fetchAdminOtherDetails = (otherId) => {
  return apiCall(`/admin/others/${otherId}`, "GET", null, false, true);
};
export const createAdminOther = (formData) => {
  return apiCall("/admin/others", "POST", formData, true, true);
};
export const updateAdminOther = (otherId, formData) => {
  return apiCall(`/admin/others/${otherId}`, "PUT", formData, true, true);
};
export const deleteAdminOther = (otherId) => {
  return apiCall(`/admin/others/${otherId}`, "DELETE", null, false, true);
};

export const updateAdminBookingStatus = (bookingId, status) => {
  const body = { status };
  return apiCall(
    `/admin/bookings/${bookingId}/status`,
    "PUT",
    body,
    false,
    true
  );
};
export const updateAdminBookingDetails = (bookingId, updateData) => {
  return apiCall(
    `/admin/bookings/${bookingId}`,
    "PUT",
    updateData,
    false,
    true
  );
};
export const deleteAdminBooking = (bookingId) => {
  return apiCall(`/admin/bookings/${bookingId}`, "DELETE", null, false, true);
};

export const fetchPublicOthers = () => {
  return apiCall("/others", "GET", null, false, false);
};
export const fetchPublicOtherDetails = (otherId) => {
  return apiCall(`/others/${otherId}`, "GET", null, false, false);
};
export const fetchAdminHouses = () => {
  return apiCall("/admin/houses", "GET", null, false, true);
};
