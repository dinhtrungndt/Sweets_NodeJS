const axios = require('axios');
const url = 'http://192.168.1.33:3001/';
export const CreateDevice = async (deviceID) => {
  try {
    const response = await axios.post(url+"loginQRCode/add-loginQRCode", deviceID);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// cập nhật idUser vào deviceID
export const UpdateQR = async (idUser,deviceID) => {
  body = {
    iduser: idUser,
    deviceid: deviceID
  }
  try {
    // Thực hiện yêu cầu HTTP gọi API từ máy chủ của bạn
    const response = await axios.put(url+'loginQRCode/update-loginQRCode', body);

    // Xử lý kết quả trả về từ API nếu cần
    console.log(response.data);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
  }
};