import axios from "axios";

export const sendVerificationSMS = async (phoneNumber: string, code: string) => {
  
   try {
    const response = await axios.post(
      'https://api.afromessage.com/api/send',
      {
        from: 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164',       // Required if you have more than one identifier
        sender: 'AfroMessage',       // Must be approved by AfroMessage
        to: phoneNumber,               // Recipient
        message: `Your verification code is ${code}`,
        callback: ''                      // Optional: Callback URL for status updates
      },
      {
        headers: {
          "Authorization": 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiNm1iRnREeHRHYVZrRGpoSmJMelNCOXFZUHFoTXRacGoiLCJleHAiOjE5MTQ2ODU2MzIsImlhdCI6MTc1NjkxOTIzMiwianRpIjoiMmFiYzNjMTAtMzg3NS00MWYxLWI3ZDUtMmM5Njk5ZGMzZTE0In0.KrVRSmBuoUwZhKmE4c4lDkHv4rJkY2a8S1YlxZiA6hw',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SMS sent:', response.data);
  } catch (error) {
    console.error('❌ SMS sending failed:',error);
  }
};


export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
