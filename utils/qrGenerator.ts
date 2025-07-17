const daysFromNow = (days: number): string => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

function crc16ccittFalse(data: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF; // Keep it 16-bit
    }
  }
  
  // Convert to uppercase hex string with 4 digits (padded if needed)
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
* 
* @param phone The Singapore number without +65
* @param amount An amount MUST BE GREATER THAN 1
* @param note A note to the payee MUST BE LESSER THAN 8 CHARACTERS
* @param expiry An expiry date in the form of Days From Now
*               (when the function is called)
* @returns 
*/
export function generatePayNowQR(
  phone: string, 
  amount: number, 
  note: string = 'paymeback Request', 
  expiry: number = 7): string {
    
    const payString = '00020101021126500009SG.PAYNOW010100211+65' +
    `${phone}030100408${daysFromNow(expiry)}5204000053037025404` +
    `${amount.toFixed(2)}5802SG5902NA6009Singapore62080104` +
    `${note}6304`;
    console.log('payString:', payString);
    console.log('crc:', crc16ccittFalse(payString));
    
    return payString + crc16ccittFalse(payString);
  }