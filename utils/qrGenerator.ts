const daysFromNow = (days: number): string => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const DefaultDaysToExpiry = 7;

function TL(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

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
  expiry: number = DefaultDaysToExpiry): string {

    // Merchant Info (ID 26)
    const merchantInfo =
        TL("00", "SG.PAYNOW") +             // Globally Unique Identifier
        TL("01", "0") +                     // Proxy type: 0 = mobile
        TL("02", "+65" + phone) +                  // Phone number
        TL("03", "1") +                     // Editable: 1 = true
        TL("04", expiry + "000000");                  // Expiry date YYYYMMDDHHMMSS

    // Full payload
    let payload =
        TL("00", "01") +                     // Payload format indicator
        TL("01", "12") +                     // Point of initiation method (dynamic)
        TL("26", merchantInfo) +            // Merchant Account Information
        TL("52", "0000") +                  // Merchant Category Code
        TL("53", "702") +                   // Currency code (702 = SGD)
        TL("54", amount.toFixed(2)) +       // Amount
        TL("58", "SG") +                    // Country Code
        TL("59", "NA") +                    // Merchant Name
        TL("60", "Singapore");              // Merchant City

    if (note) {
        payload += TL("62", TL("01", note));
    }

    // CRC tag
    payload += "6304";

    console.log('Payload:', payload);
    console.log('crc:', crc16ccittFalse(payload));

    return payload + crc16ccittFalse(payload);
  }