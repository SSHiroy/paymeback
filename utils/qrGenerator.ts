const daysFromNow = (days: number): string => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

function crc16ccittFalse(data: string): number {
  let crc = 0xFFFF;
  let msb = crc >> 8;
  let lsb = crc & 0xFF;
  
  for (let i = 0; i < data.length; i++) {
    const c = data.charCodeAt(i);
    let x = c ^ msb;
    x ^= x >> 4;
    msb = (lsb ^ (x >> 3) ^ (x << 4)) & 0xFF;
    lsb = (x ^ (x << 5)) & 0xFF;
  }
  
  return (msb << 8) + lsb;
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
    `${amount}5802SG5902NA6009Singapore62080104` +
    `${note}6304`;
    
    return payString + crc16ccittFalse(payString);
  }