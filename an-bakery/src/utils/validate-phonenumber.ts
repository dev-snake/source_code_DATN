function validatePhoneNumber(phoneNumber: string): boolean {
  const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return regex.test(phoneNumber);
}
export default validatePhoneNumber;
